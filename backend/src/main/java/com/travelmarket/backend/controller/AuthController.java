package com.travelmarket.backend.controller;

import com.travelmarket.backend.dto.AuthResponse;
import com.travelmarket.backend.dto.LoginRequest;
import com.travelmarket.backend.dto.RegisterRequest;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.travelmarket.backend.dto.MeResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.Instant;

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

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }

        User.Role role = User.Role.valueOf(request.getRole()); // safe due to DTO pattern
        if (role == User.Role.Admin) {
            throw new RuntimeException("Invalid role");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        // full name optional here
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        // agreements
        user.setAgreedToTerms(request.isAgreedToTerms());
        user.setAgreedToPrivacy(request.isAgreedToPrivacy());
        user.setNewsletterOptIn(request.isNewsletterOptIn());
        user.setMarketingOptIn(request.isMarketingOptIn());
        user.setAgreementsAcceptedAtUtc(Instant.now());

        // profile completion false until complete-profile step
        user.setProfileCompleted(false);

        // defaults
        user.setIsEmailVerified(false);
        user.setPreferredLanguage("en");
        user.setTimezone("UTC");

        user = userRepository.save(user);

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

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();

        String token = jwtUtil.generateToken(userDetails);
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        // Authenticate using email and password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        // Fetch user to get role
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

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
}