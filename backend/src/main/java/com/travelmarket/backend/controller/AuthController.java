package com.travelmarket.backend.controller;

import com.travelmarket.backend.notification.service.NotificationService;
import com.travelmarket.backend.notification.enums.NotificationType;
import com.travelmarket.backend.dto.*;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.RefreshToken;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.RefreshTokenRepository;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.security.JwtUtil;
import com.travelmarket.backend.entity.PasswordResetToken;
import com.travelmarket.backend.repository.PasswordResetTokenRepository;
import com.travelmarket.backend.entity.EmailVerificationToken;
import com.travelmarket.backend.repository.EmailVerificationTokenRepository;
import com.travelmarket.backend.service.EmailService;
import com.travelmarket.backend.security.RateLimiterService;
import org.springframework.beans.factory.annotation.Value;
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
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final RateLimiterService rateLimiterService;
    private final NotificationService notificationService;

    private static final String REFRESH_COOKIE = "refresh_token";
    private static final Duration REFRESH_TTL_DEFAULT = Duration.ofDays(7);
    private static final Duration REFRESH_TTL_REMEMBER = Duration.ofDays(30);
    private static final Duration RESET_TTL = Duration.ofMinutes(15);

    @Value("${app.email-verification.ttl-minutes:30}")
    private long emailVerifyTtlMinutes;

    @Value("${app.email-verification.dev-return:true}")
    private boolean emailVerifyDevReturn;

    private final EmailService emailService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${app.password-reset.dev-return:false}")
    private boolean passwordResetDevReturn;

    private String getClientIp(HttpServletRequest request) {
        // If behind proxy later, X-Forwarded-For is common.
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // first IP in the list
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String generate6DigitCode() {
        int n = (int)(Math.random() * 900000) + 100000;
        return String.valueOf(n);
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

    private ResponseCookie buildRefreshCookie(String rawToken, Duration ttl) {
        // For production on HTTPS set secure(true) and sameSite("None") for cross-domain cookies
        return ResponseCookie.from(REFRESH_COOKIE, rawToken)
                .httpOnly(true)
                .secure(true)
                .path("/api/auth")
                .sameSite("None")
                .maxAge(ttl)
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(true)
                .path("/api/auth")
                .sameSite("None")
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
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        // 5 attempts / 10 minutes per IP
        rateLimiterService.check(
                "auth:login:ip:" + ip,
                100,
                Duration.ofMinutes(10),
                "Too many login attempts. Try again later."
        );

        // 5 attempts / 10 minutes per email
        if (!email.isBlank()) {
            rateLimiterService.check(
                    "auth:login:email:" + email,
                    70,
                    Duration.ofMinutes(10),
                    "Too many login attempts. Try again later."
            );
        }
        // Combined key (most fair): limits attempts for this specific email from this specific IP
        if(!email.isBlank()) {
            rateLimiterService.check(
                    "auth:login:email-ip:" + email + ":" + ip,
                    70,
                    Duration.ofMinutes(10),
                    "Too many login attempts. Try again later."
            );
        }


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

        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                travelerProfileId,
                guideProfileId,
                Boolean.TRUE.equals(user.getProfileCompleted()),
                Boolean.TRUE.equals(user.getIsEmailVerified()),
                Boolean.TRUE.equals(user.getAgreedToTerms()),
                user.getEmailNotificationsEnabled(),
                user.getPushNotificationsEnabled(),
                Boolean.TRUE.equals(user.getHasPassword()));
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {

        String ip = getClientIp(request);
        rateLimiterService.check(
                "auth:refresh:ip:" + ip,
                20,
                Duration.ofMinutes(10),
                "Too many requests. Try again later."
        );

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

    @PostMapping("/delete-account")
    public void deleteAccount(Authentication auth, HttpServletResponse response) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() == User.Role.Admin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins cannot be deleted via this endpoint");
        }

        // Soft delete: clear personal data and set deletedAtUtc
        user.setDeletedAtUtc(Instant.now());
        user.setAccountStatus("DELETED");
        user.setFullName("Deleted User");
        user.setPhoneE164(null);
        // Anonymize email so it can be reused by a new account if they register again,
        // but keep a trace of the original ID for database referential integrity.
        user.setEmail("deleted_" + user.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com");

        // Strong logout: invalidate all access JWTs
        int current = (user.getTokenVersion() == null) ? 0 : user.getTokenVersion();
        user.setTokenVersion(current + 1);
        
        userRepository.save(user);

        // Revoke all refresh tokens
        refreshTokenRepository.revokeAllForUser(user.getId(), Instant.now());

        // Clear refresh cookie
        response.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString());
    }

    @PostMapping("/password/forgot")
    public Object forgotPassword(@Valid @RequestBody ForgotPasswordRequest req, HttpServletRequest httpRequest) {

        String ip = getClientIp(httpRequest);
        String email = req.getEmail() == null ? "" : req.getEmail().trim().toLowerCase();

        // 3 / 15 min per IP
        rateLimiterService.check(
                "auth:forgot:ip:" + ip,
                3,
                Duration.ofMinutes(15),
                "Too many requests. Try again later."
        );

        // 3 / 15 min per email
        if (!email.isBlank()) {
            rateLimiterService.check(
                    "auth:forgot:email:" + email,
                    3,
                    Duration.ofMinutes(15),
                    "Too many requests. Try again later."
            );
        }

        // Always respond 200 to avoid email enumeration
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return new ForgotPasswordDevResponse("If the email exists, a reset link was issued.", null);
        }

        // Create raw token and store only its hash
        //String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID();
        // Numeric reset code is more convenient while frontend is not deployed.
        // Still treated as the "token" in the reset endpoint.
        String rawToken = generate6DigitCode();
        String hash = sha256Hex(rawToken);

        // Optional: retry a few times if collision happens (unique token_hash)
        for (int i = 0; i < 3; i++) {
            if (passwordResetTokenRepository.findByTokenHash(hash).isEmpty()) break;
            rawToken = generate6DigitCode();
            hash = sha256Hex(rawToken);
        }

        PasswordResetToken prt = new PasswordResetToken();
        prt.setUser(user);
        prt.setTokenHash(hash);
        prt.setCreatedAtUtc(Instant.now());
        prt.setExpiresAtUtc(Instant.now().plus(RESET_TTL));
        prt.setUsedAtUtc(null);

        passwordResetTokenRepository.save(prt);

        // Send real email (Brevo SMTP via JavaMailSender)
//        String resetLink = frontendBaseUrl + "/reset-password?token=" + rawToken;
//        String subject = "Reset your password";
//        String body =
//                "We received a request to reset your password.\n\n"
//                        + "Reset link:\n" + resetLink + "\n\n"
//                        + "This link expires in 15 minutes.\n"
//                        + "If you did not request this, you can ignore this email.";
//
//        emailService.send(user.getEmail(), subject, body);
        // Code-first email because frontend is not deployed yet.
        // Keep link logic commented for later deployment.
        // String resetLink = frontendBaseUrl + "/reset-password?token=" + rawToken;

        String subject = "Your password reset code";
        String body =
                "Your password reset code is:\n\n"
                        + rawToken + "\n\n"
                        + "This code expires in 15 minutes.\n\n"
                        + "Security note:\n"
                        + "- Do not share this code with anyone.\n"
                        + "- Our team will never ask you for this code.\n\n"
                        + "If you did not request this, you can ignore this email.\n";

        // Later when deployed:
        // body += "\nReset link:\n" + resetLink + "\n";

        emailService.send(user.getEmail(), subject, body);

        // Production: do not return token
        if (!passwordResetDevReturn) {
            return new ForgotPasswordDevResponse("If the email exists, a reset link was issued.", null);
        }

        // Dev fallback: return token for Postman testing only
        return new ForgotPasswordDevResponse("If the email exists, a reset link was issued.", rawToken);
    }

    @PostMapping("/password/reset")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest req) {

        String raw = req.getToken().trim();
        String hash = sha256Hex(raw);

        PasswordResetToken prt = passwordResetTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid reset token"));

        if (prt.getUsedAtUtc() != null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Reset token already used");
        }

        if (prt.getExpiresAtUtc().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Reset token expired");
        }

        User user = prt.getUser();

        // Update password
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));

        // Strong logout: increment tokenVersion to revoke all existing access JWTs immediately
        int current = (user.getTokenVersion() == null) ? 0 : user.getTokenVersion();
        user.setTokenVersion(current + 1);

        userRepository.save(user);

        // Mark token used (one-time)
        prt.setUsedAtUtc(Instant.now());
        passwordResetTokenRepository.save(prt);

        // Optional but recommended:
        // If you have refreshTokenRepository, revoke all refresh tokens here too:
        refreshTokenRepository.revokeAllForUser(user.getId(), Instant.now());
        
        notificationService.createNotification(
                user.getId(),
                NotificationType.PASSWORD_CHANGED,
                "Password Changed",
                "Your password has been successfully reset. If this was not you, please contact support immediately.",
                null,
                null
        );
    }

    @PostMapping("/password/change")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest req, @AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid current password");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));

        // Strong logout: increment tokenVersion to revoke all existing access JWTs immediately
        int current = (user.getTokenVersion() == null) ? 0 : user.getTokenVersion();
        user.setTokenVersion(current + 1);

        userRepository.save(user);

        // Revoke all refresh tokens
        refreshTokenRepository.revokeAllForUser(user.getId(), Instant.now());
        
        notificationService.createNotification(
                user.getId(),
                NotificationType.PASSWORD_CHANGED,
                "Password Changed",
                "Your password has been successfully changed. If this was not you, please contact support immediately.",
                null,
                null
        );
    }

    /**
     * POST /api/auth/password/setup/request
     * For OAuth-only users who have no real password.
     * Sends a 6-digit verification code to their email so they can securely set a password.
     * Requires a valid JWT (must be authenticated).
     */
    @PostMapping("/password/setup/request")
    public void requestPasswordSetup(@AuthenticationPrincipal UserDetails principal, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (Boolean.TRUE.equals(user.getHasPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account already has a password. Use /password/change instead.");
        }

        // Rate-limit: 3 per 15 min per user
        rateLimiterService.check(
                "auth:setup-pw:user:" + user.getId(),
                3,
                Duration.ofMinutes(15),
                "Too many requests. Try again later."
        );
        rateLimiterService.check(
                "auth:setup-pw:ip:" + ip,
                5,
                Duration.ofMinutes(15),
                "Too many requests. Try again later."
        );

        String rawCode = generate6DigitCode();
        String hash = sha256Hex(rawCode);

        // Reuse PasswordResetToken table — same mechanism
        PasswordResetToken prt = new PasswordResetToken();
        prt.setUser(user);
        prt.setTokenHash(hash);
        prt.setCreatedAtUtc(Instant.now());
        prt.setExpiresAtUtc(Instant.now().plus(RESET_TTL));
        prt.setUsedAtUtc(null);
        passwordResetTokenRepository.save(prt);

        String subject = "Set up your password";
        String body = "Your password setup code is:\n\n"
                + rawCode + "\n\n"
                + "This code expires in 15 minutes.\n\n"
                + "Security note:\n"
                + "- Do not share this code with anyone.\n"
                + "- Our team will never ask you for this code.\n\n"
                + "If you did not request this, please contact support.\n";
        emailService.send(user.getEmail(), subject, body);
    }

    /**
     * POST /api/auth/password/setup/confirm
     * Accepts the 6-digit code + new password, verifies the code, sets the password,
     * marks hasPassword=true, and invalidates all existing sessions for security.
     */
    @PostMapping("/password/setup/confirm")
    public void confirmPasswordSetup(
            @Valid @RequestBody ResetPasswordRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (Boolean.TRUE.equals(user.getHasPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account already has a password.");
        }

        String raw = req.getToken().trim();
        String hash = sha256Hex(raw);

        PasswordResetToken prt = passwordResetTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid code"));

        // Ensure this code belongs to this logged-in user
        if (!prt.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid code");
        }

        if (prt.getUsedAtUtc() != null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Code already used");
        }

        if (prt.getExpiresAtUtc().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Code expired");
        }

        // Set the real password and mark account as having a password
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        user.setHasPassword(true);

        // Invalidate all existing sessions for security (force re-login)
        int current = (user.getTokenVersion() == null) ? 0 : user.getTokenVersion();
        user.setTokenVersion(current + 1);
        userRepository.save(user);

        prt.setUsedAtUtc(Instant.now());
        passwordResetTokenRepository.save(prt);

        refreshTokenRepository.revokeAllForUser(user.getId(), Instant.now());

        notificationService.createNotification(
                user.getId(),
                NotificationType.PASSWORD_CHANGED,
                "Password Set Successfully",
                "You have successfully set a password for your account. You can now sign in with email and password.",
                null,
                null
        );
    }

    @PostMapping("/me/notifications")
    public void updateNotificationPreferences(@Valid @RequestBody UpdateNotificationPreferencesRequest req, @AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        user.setEmailNotificationsEnabled(req.getEmailNotificationsEnabled());
        user.setPushNotificationsEnabled(req.getPushNotificationsEnabled());

        userRepository.save(user);
    }

    @PostMapping("/email/verify/request")
    public EmailVerifyDevResponse requestEmailVerification(@Valid @RequestBody EmailVerifyRequest req, HttpServletRequest httpRequest) {

        String ip = getClientIp(httpRequest);
        String email = req.getEmail() == null ? "" : req.getEmail().trim().toLowerCase();

        // 3 / 15 min per IP
        rateLimiterService.check(
                "auth:verify:ip:" + ip,
                3,
                Duration.ofMinutes(15),
                "Too many requests. Try again later."
        );

        // 3 / 15 min per email
        if (!email.isBlank()) {
            rateLimiterService.check(
                    "auth:verify:email:" + email,
                    3,
                    Duration.ofMinutes(15),
                    "Too many requests. Try again later."
            );
        }

        // Do not enumerate emails. Always return 200 with a generic message.
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return new EmailVerifyDevResponse("If the email exists, a verification message was issued.", null, null);
        }

        // If already verified, still return 200 (idempotent).
        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            return new EmailVerifyDevResponse("If the email exists, a verification message was issued.", null, null);
        }

        // Create long token (for link verification)
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID();
        String tokenHash = sha256Hex(rawToken);

        // Create short code (UI verification)
        // Note: code verification should be rate-limited later to avoid brute force.
        String rawCode = generate6DigitCode();
        String codeHash = sha256Hex(rawCode);

        EmailVerificationToken evt = new EmailVerificationToken();
        evt.setUser(user);
        evt.setTokenHash(tokenHash);
        evt.setCodeHash(codeHash);
        evt.setCreatedAtUtc(Instant.now());
        evt.setExpiresAtUtc(Instant.now().plus(Duration.ofMinutes(emailVerifyTtlMinutes)));
        evt.setUsedAtUtc(null);

        emailVerificationTokenRepository.save(evt);
        // Code-first email because frontend is not deployed yet.
        // Keep link logic commented for later deployment.
        // String verifyLink = frontendBaseUrl + "/verify-email?token=" + rawToken;

        String subject = "Your email verification code";
        String body =
                "Your verification code is:\n\n"
                        + rawCode + "\n\n"
                        + "This code expires in " + emailVerifyTtlMinutes + " minutes.\n\n"
                        + "Security note:\n"
                        + "- Do not share this code with anyone.\n"
                        + "- Our team will never ask you for this code.\n\n"
                        + "If you did not request this, ignore this email.\n";

        // Later when deployed:
        // body += "\nVerification link:\n" + verifyLink + "\n";

        emailService.send(user.getEmail(), subject, body);
        // Send real email (Brevo SMTP)
//        String verifyLink = frontendBaseUrl + "/verify-email?token=" + rawToken;
//
//        String subject = "Verify your email";
//        String body =
//                "Please verify your email.\n\n"
//                        + "Verification link:\n" + verifyLink + "\n\n"
//                        + "Or enter this code in the app:\n" + rawCode + "\n\n"
//                        + "This token/code expires in " + emailVerifyTtlMinutes + " minutes.";
//
//        emailService.send(user.getEmail(), subject, body);
        // Production plan (later):
        // - Send email containing either:
        //   1) Link with rawToken: https://your-frontend/verify-email?token=rawToken
        //   2) Or show code rawCode in the email for UI entry.
        //
        // For now, return token/code only if dev-return is enabled.
        if (!emailVerifyDevReturn) {
            return new EmailVerifyDevResponse("If the email exists, a verification message was issued.", null, null);
        }

        return new EmailVerifyDevResponse(
                "If the email exists, a verification message was issued.",
                rawToken,
                rawCode
        );
    }

    @PostMapping("/email/verify/confirm-token")
    public void confirmEmailByToken(@Valid @RequestBody EmailVerifyConfirmTokenRequest req) {

        String rawToken = req.getToken().trim();
        String tokenHash = sha256Hex(rawToken);

        EmailVerificationToken evt = emailVerificationTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid verification token"));

        if (evt.getUsedAtUtc() != null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Verification token already used");
        }

        if (evt.getExpiresAtUtc().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Verification token expired");
        }

        User user = evt.getUser();
        user.setIsEmailVerified(true);
        userRepository.save(user);

        evt.setUsedAtUtc(Instant.now());
        emailVerificationTokenRepository.save(evt);
        
        notificationService.createNotification(
                user.getId(),
                NotificationType.EMAIL_VERIFIED,
                "Email Verified",
                "Your email address has been successfully verified. Thank you!",
                null,
                null
        );
    }

    @PostMapping("/email/verify/confirm-code")
    public void confirmEmailByCode(@Valid @RequestBody EmailVerifyConfirmCodeRequest req) {

        String email = req.getEmail().trim().toLowerCase();
        String rawCode = req.getCode().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid verification code"));

        String codeHash = sha256Hex(rawCode);

        EmailVerificationToken evt = emailVerificationTokenRepository.findByCodeHash(codeHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid verification code"));

        // Ensure the code belongs to this user
        if (!evt.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid verification code");
        }

        if (evt.getUsedAtUtc() != null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Verification code already used");
        }

        if (evt.getExpiresAtUtc().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Verification code expired");
        }

        user.setIsEmailVerified(true);
        userRepository.save(user);

        evt.setUsedAtUtc(Instant.now());
        emailVerificationTokenRepository.save(evt);
        
        notificationService.createNotification(
                user.getId(),
                NotificationType.EMAIL_VERIFIED,
                "Email Verified",
                "Your email address has been successfully verified. Thank you!",
                null,
                null
        );

        // Note for later:
        // You should rate-limit attempts to this endpoint (by IP/email) to prevent brute forcing 6-digit codes.
    }

    /**
     * POST /api/auth/accept-terms
     *
     * Called by the frontend after OAuth signup to record that the user
     * has accepted Terms of Service and Privacy Policy.
     * Requires a valid JWT (the user must already be authenticated).
     */
    @PostMapping("/accept-terms")
    public void acceptTerms(@AuthenticationPrincipal UserDetails principal) {

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setAgreedToTerms(true);
        user.setAgreedToPrivacy(true);
        if (user.getAgreementsAcceptedAtUtc() == null) {
            user.setAgreementsAcceptedAtUtc(Instant.now());
        }
        user.setUpdatedAtUtc(Instant.now());
        userRepository.save(user);
    }
}