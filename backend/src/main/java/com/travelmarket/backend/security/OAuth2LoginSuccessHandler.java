package com.travelmarket.backend.security;

import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.RefreshToken;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.entity.UserIdentity;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.RefreshTokenRepository;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.repository.UserIdentityRepository;
import com.travelmarket.backend.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.travelmarket.backend.notification.service.NotificationService;
import com.travelmarket.backend.notification.enums.NotificationType;
import com.travelmarket.backend.service.EmailService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final UserIdentityRepository userIdentityRepository;
    private final TravelerProfileRepository travelerProfileRepository;
    private final GuideProfileRepository guideProfileRepository;

    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    private static final String REFRESH_COOKIE = "refresh_token";
    private static final Duration REFRESH_TTL_DEFAULT = Duration.ofDays(7);

    @Value("${app.oauth2.frontend-redirect}")
    private String frontendRedirect;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            org.springframework.security.core.Authentication authentication
    ) throws IOException, ServletException {
        try {
            System.out.println("DEBUG: OAuth2LoginSuccessHandler - entered");

            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            OAuth2User oauthUser = oauthToken.getPrincipal();

            // Google attributes
            String provider = "google";
            String providerUserId = asString(oauthUser.getAttribute("sub"));
            String email = asString(oauthUser.getAttribute("email"));
            String name = asString(oauthUser.getAttribute("name"));

            System.out.println("DEBUG: OAuth2 - email: " + email + ", providerUserId: " + providerUserId);

            if (providerUserId == null || email == null) {
                System.out.println("DEBUG: OAuth2 - Missing attributes");
                response.sendError(400, "Google OAuth missing required attributes");
                return;
            }

            email = email.toLowerCase().trim();

            // Role must come from your role selector step (stored in short-lived cookie).
            String roleCookie = readCookie(request, "oauth_role");
            System.out.println("DEBUG: OAuth2 - roleCookie: " + roleCookie);

            if (!"Traveler".equals(roleCookie) && !"Guide".equals(roleCookie)) {
                System.out.println("DEBUG: OAuth2 - Missing role cookie");
                // Instead of sendError, redirect with error param to frontend so user sees it
                response.sendRedirect(frontendRedirect + "?error=" + url("missing_role"));
                return;
            }

            // 1) If identity already exists, trust it (user is already linked)
            Optional<UserIdentity> existingIdentity =
                    userIdentityRepository.findByProviderAndProviderUserId(provider, providerUserId);

            User user;
            boolean isNewUser = false;

            if (existingIdentity.isPresent()) {
                user = existingIdentity.get().getUser();
                System.out.println("DEBUG: OAuth2 - Existing identity found for user: " + user.getEmail());
            } else {
                // 2) No identity yet: try to find user by email
                user = userRepository.findByEmail(email).orElse(null);

                // If user exists by email, do not allow role switching by OAuth
                if (user != null) {
                    System.out.println("DEBUG: OAuth2 - Existing user found by email: " + email);
                    if (!user.getRole().name().equals(roleCookie)) {
                        System.out.println("DEBUG: OAuth2 - Role mismatch: expected " + user.getRole().name() + " but got " + roleCookie);
                        clearCookie(response, "oauth_role");
                        response.sendRedirect(frontendRedirect + "?error=" + url("role_mismatch"));
                        return;
                    }
                }

                // 3) If user doesn't exist, create user + create the correct role profile row
                if (user == null) {
                    System.out.println("DEBUG: OAuth2 - Creating new user for: " + email);
                    user = new User();
                    user.setEmail(email);
                    user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                    user.setHasPassword(false); // OAuth users have no real password
                    user.setRole(User.Role.valueOf(roleCookie));
                    user.setAccountStatus("ACTIVE");
                    user.setAgreedToTerms(false);
                    user.setAgreedToPrivacy(false);
                    user.setProfileCompleted(false);

                    if (name != null && !name.isBlank()) {
                        user.setFullName(name.trim());
                    }

                    user = userRepository.save(user);
                    isNewUser = true;

                    if (user.getRole() == User.Role.Traveler) {
                        TravelerProfile tp = new TravelerProfile();
                        tp.setUser(user);
                        travelerProfileRepository.save(tp);
                    } else if (user.getRole() == User.Role.Guide) {
                        GuideProfile gp = new GuideProfile();
                        gp.setUser(user);
                        guideProfileRepository.save(gp);
                    }

                    // Trigger notifications for new OAuth users
                    notificationService.createNotification(
                            user.getId(),
                            NotificationType.SETUP_PASSWORD_REMINDER,
                            "Secure your account",
                            "You signed up with Google. Please set a password in your settings to secure your account.",
                            null,
                            "/dashboard/" + user.getRole().name().toLowerCase() + "/settings"
                    );
                    emailService.sendSetupPasswordReminder(user.getEmail(), name);
                }

                // 4) Link identity to user (provider + providerUserId)
                UserIdentity ui = new UserIdentity();
                ui.setUser(user);
                ui.setProvider(provider);
                ui.setProviderUserId(providerUserId);

                try {
                    userIdentityRepository.save(ui);
                } catch (DataIntegrityViolationException ex) {
                    System.out.println("DEBUG: OAuth2 - Identity link already exists (ignored)");
                }
            }

            // Issue your normal JWT
            System.out.println("DEBUG: OAuth2 - Generating JWT for: " + user.getEmail());
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String jwt = jwtUtil.generateToken(userDetails);

            // Issue refresh token as well for session persistence
            String refreshRaw = issueRefreshToken(user, REFRESH_TTL_DEFAULT);
            response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(refreshRaw, REFRESH_TTL_DEFAULT).toString());

            // Clear role cookie
            clearCookie(response, "oauth_role");

            // Redirect to frontend
            String redirect = frontendRedirect
                    + "?token=" + url(jwt)
                    + "&role=" + url(user.getRole().name())
                    + "&new=" + (isNewUser ? "1" : "0");

            System.out.println("DEBUG: OAuth2 - Success! Redirecting to frontend.");
            response.sendRedirect(redirect);

        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in OAuth2LoginSuccessHandler:");
            e.printStackTrace();
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getName();
            response.sendRedirect(frontendRedirect + "?error=" + url("server_error") + "&msg=" + url(msg));
        }
    }

    private String issueRefreshToken(User user, Duration ttl) {
        String raw = UUID.randomUUID() + "-" + UUID.randomUUID();
        String hash = sha256Hex(raw);

        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setTokenHash(hash);
        rt.setCreatedAtUtc(Instant.now());
        rt.setExpiresAtUtc(Instant.now().plus(ttl));
        rt.setRevokedAtUtc(null);

        refreshTokenRepository.save(rt);
        return raw;
    }

    private ResponseCookie buildRefreshCookie(String rawToken, Duration ttl) {
        return ResponseCookie.from(REFRESH_COOKIE, rawToken)
                .httpOnly(true)
                .secure(false)
                .path("/api/auth")
                .sameSite("Lax")
                .maxAge(ttl)
                .build();
    }

    private String sha256Hex(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new RuntimeException("Hashing error");
        }
    }

    private static String asString(Object v) {
        return v == null ? null : String.valueOf(v);
    }

    private static String url(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private static String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
    }

    private static void clearCookie(HttpServletResponse response, String name) {
        Cookie c = new Cookie(name, "");
        c.setPath("/");
        c.setMaxAge(0);
        c.setHttpOnly(true);
        response.addCookie(c);
    }
}