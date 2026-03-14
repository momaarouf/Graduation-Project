package com.travelmarket.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.oauth2.frontend-redirect}")
    private String frontendRedirect;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        System.err.println("DEBUG: OAuth2 - Authentication failure: " + (exception != null ? exception.getMessage() : "Unknown exception"));
        if (exception != null) {
            exception.printStackTrace();
        }

        String msg = (exception != null && exception.getMessage() != null) ? exception.getMessage() : "auth_failure";
        String redirect = frontendRedirect + "?error=" + URLEncoder.encode(msg, StandardCharsets.UTF_8);
        response.sendRedirect(redirect);
    }
}
