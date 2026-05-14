package com.travelmarket.backend.config;

import com.travelmarket.backend.security.JwtAuthFilter;
import com.travelmarket.backend.security.OAuth2LoginSuccessHandler;
import com.travelmarket.backend.security.OAuth2LoginFailureHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter; // Inject our custom filter
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                // OAuth2 login needs a short-lived session during the redirect handshake.
                // Your API still stays stateless because you authenticate requests with JWT.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/health").permitAll()

                        // Public auth endpoints
                        .requestMatchers("/api/auth/register", "/api/auth/login",
                                "/api/auth/refresh", "/api/auth/logout", "/api/auth/logout-all", "/api/auth/password/forgot", "/api/auth/password/reset",
                                "/api/auth/email/verify/request", "/api/auth/email/verify/confirm-token", "/api/auth/email/verify/confirm-code").permitAll()

                        // OAuth2 endpoints must be public
                        .requestMatchers("/api/auth/oauth2/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**", "/login", "/error").permitAll()

                        // /me must be authenticated
                        .requestMatchers("/api/auth/me").authenticated()

                        // Public tour browsing & support — no login required
                        .requestMatchers("/api/public/**", "/api/reviews/**", "/api/support/**").permitAll()

                        // ── Payment endpoints ─────────────────────────────────
                        // Stripe calls /webhook directly — NO JWT, verified by Stripe-Signature header
                        .requestMatchers("/api/payments/webhook").permitAll()
                        // Mock mode status is open (returns safe metadata only)
                        .requestMatchers("/api/payments/mock/status").authenticated()
                        // Mock confirm/fail require any valid JWT (demo use only, guarded by mock-mode flag)
                        .requestMatchers("/api/payments/mock/**").authenticated()
                        // create-session requires Traveler role (falls through to role block below)

                        // Role-based protection
                        .requestMatchers("/api/admin/**").hasRole("Admin")
                        .requestMatchers("/api/guide/**").hasRole("Guide")
                        .requestMatchers("/api/traveler/**").hasRole("Traveler")
                        // Payment session creation: Traveler only
                        .requestMatchers("/api/payments/create-session").hasRole("Traveler")

                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"message\":\"Unauthorized\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"message\":\"Forbidden\"}");
                        })
                )

                // OAuth2 login wiring
                .oauth2Login(oauth -> oauth
                        .successHandler((request, response, authentication) ->
                                oAuth2LoginSuccessHandler.onAuthenticationSuccess(request, response, authentication))
                        .failureHandler((request, response, exception) ->
                                oAuth2LoginFailureHandler.onAuthenticationFailure(request, response, exception))
                )

                // JWT filter still applies to API requests after OAuth2 is done
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .cors(cors -> {});

        return http.build();
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Allow localhost and any local network IP for mobile testing
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:[*]",
                "http://127.0.0.1:[*]",
                "http://192.168.*:[*]",
                "http://172.*:[*]",
                "http://10.*:[*]",
                "https://*.trycloudflare.com",
                "https://*.loca.lt"
        ));
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}