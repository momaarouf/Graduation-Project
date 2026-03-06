package com.travelmarket.backend.controller;

import com.travelmarket.backend.dto.AuthResponse;
import com.travelmarket.backend.dto.LoginRequest;
import com.travelmarket.backend.dto.RegisterRequest;
import com.travelmarket.backend.dto.MeResponse;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.RefreshToken;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.RefreshTokenRepository;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TravelerProfileRepository travelerProfileRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;

    private static final String REFRESH_COOKIE = "refresh_token";
    private static final Duration REFRESH_TTL_DEFAULT = Duration.ofDays(7);
    private static final Duration REFRESH_TTL_REMEMBER = Duration.ofDays(30);

    private String sha256Hex(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new RuntimeException("Hashing error");
        }
    }

    private ResponseCookie buildRefreshCookie(String rawToken, Duration ttl) {
        // For production on HTTPS set secure(true).
        return ResponseCookie.from(REFRESH_COOKIE, rawToken)
                .httpOnly(true)
                .secure(false)
                .path("/api/auth")
                .sameSite("Lax")
                .maxAge(ttl)
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(false)
                .path("/api/auth")
                .sameSite("Lax")
                .maxAge(0)
                .build();
    }

    private String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (var c : request.getCookies()) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
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

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }

        User.Role role = User.Role.valueOf(request.getRole());
        if (role == User.Role.Admin) {
            throw new RuntimeException("Invalid role");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        // Full name optional at registration
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        // Agreements
        user.setAgreedToTerms(request.isAgreedToTerms());
        user.setAgreedToPrivacy(request.isAgreedToPrivacy());
        user.setNewsletterOptIn(request.isNewsletterOptIn());
        user.setMarketingOptIn(request.isMarketingOptIn());
        user.setAgreementsAcceptedAtUtc(Instant.now());

        // Profile completion remains false until complete-profile step
        user.setProfileCompleted(false);

        // Defaults
        user.setIsEmailVerified(false);
        user.setPreferredLanguage("en");
        user.setTimezone("UTC");

        // tokenVersion defaults to 0 automatically
        user = userRepository.save(user);

        // Create role profile row
        if (role == User.Role.Traveler) {
            TravelerProfile tp = new TravelerProfile();
            tp.setUser(user);
            travelerProfileRepository.save(tp);
        } else {
            GuideProfile gp = new GuideProfile();
            gp.setUser(user);
            gp.setIdVerified(false);
            guideProfileRepository.save(gp);
        }

        // Build access JWT including tokenVersion claim
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();

        String token = jwtUtil.generateToken(userDetails, user.getTokenVersion() == null ? 0 : user.getTokenVersion());

        // Default refresh TTL on register
        Duration ttl = REFRESH_TTL_DEFAULT;
        String refreshRaw = issueRefreshToken(user, ttl);
        response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(refreshRaw, ttl).toString());

        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        String email = request.getEmail().trim().toLowerCase();

        // Authenticate using email and password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Load user from DB (needed for role + tokenVersion)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Access JWT includes tokenVersion claim
        String token = jwtUtil.generateToken(userDetails, user.getTokenVersion() == null ? 0 : user.getTokenVersion());

        // Remember-me affects refresh token lifetime
        Duration ttl = Boolean.TRUE.equals(request.getRememberMe())
                ? REFRESH_TTL_REMEMBER
                : REFRESH_TTL_DEFAULT;

        String refreshRaw = issueRefreshToken(user, ttl);
        response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(refreshRaw, ttl).toString());

        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal UserDetails principal) {

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long travelerProfileId = null;
        Long guideProfileId = null;

        if (user.getRole() == User.Role.Traveler) {
            travelerProfileId = travelerProfileRepository.findByUserId(user.getId())
                    .map(TravelerProfile::getId)
                    .orElse(null);
        } else if (user.getRole() == User.Role.Guide) {
            guideProfileId = guideProfileRepository.findByUserId(user.getId())
                    .map(GuideProfile::getId)
                    .orElse(null);
        }

        return new MeResponse(user.getId(), user.getEmail(), user.getRole().name(), travelerProfileId, guideProfileId);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {

        String raw = readCookie(request, REFRESH_COOKIE);
        if (raw == null || raw.isBlank()) {
            response.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing refresh token");
        }

        String hash = sha256Hex(raw);
        RefreshToken rt = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (rt.getRevokedAtUtc() != null) {
            response.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token revoked");
        }

        if (rt.getExpiresAtUtc().isBefore(Instant.now())) {
            response.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }

        Duration remaining = Duration.between(Instant.now(), rt.getExpiresAtUtc());
        if (remaining.isNegative() || remaining.isZero()) {
            response.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }

        User user = rt.getUser();

        // Rotate refresh token: revoke old, issue new with the remaining TTL (preserves remember-me duration)
        refreshTokenRepository.revokeOne(rt.getId(), Instant.now());
        String newRaw = issueRefreshToken(user, remaining);
        response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(newRaw, remaining).toString());

        // Issue new access JWT including tokenVersion claim
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();

        String access = jwtUtil.generateToken(userDetails, user.getTokenVersion() == null ? 0 : user.getTokenVersion());

        return new AuthResponse(access, user.getEmail(), user.getRole().name());
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response) {

        String raw = readCookie(request, REFRESH_COOKIE);
        if (raw != null && !raw.isBlank()) {
            String hash = sha256Hex(raw);
            refreshTokenRepository.findByTokenHash(hash)
                    .ifPresent(rt -> refreshTokenRepository.revokeOne(rt.getId(), Instant.now()));
        }

        // This clears refresh token cookie.
        // Access token remains valid until expiry (normal JWT behavior).
        response.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString());
    }

    @PostMapping("/logout-all")
    public void logoutAll(HttpServletRequest request, HttpServletResponse response) {

        String raw = readCookie(request, REFRESH_COOKIE);
        if (raw == null || raw.isBlank()) {
            response.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing refresh token");
        }

        String hash = sha256Hex(raw);
        RefreshToken rt = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        User user = rt.getUser();
        User dbUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Revoke all refresh tokens for this user (all devices)
        refreshTokenRepository.revokeAllForUser(user.getId(), Instant.now());

        // Strong logout: invalidate all access JWTs immediately by incrementing tokenVersion.
        int current = (dbUser.getTokenVersion() == null) ? 0 : dbUser.getTokenVersion();
        dbUser.setTokenVersion(current + 1);
        userRepository.save(dbUser);

        response.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString());
    }
}