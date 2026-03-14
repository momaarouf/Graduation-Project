package com.travelmarket.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/oauth2")
public class OAuth2StartController {

    @GetMapping("/google/start")
    public void startGoogle(@RequestParam("role") String role, HttpServletResponse response) throws Exception {
        System.out.println("DEBUG: OAuth2StartController - startGoogle for role: " + role);

        // Only allow Traveler/Guide from UI. Admin is never allowed from public OAuth.
        if (!"Traveler".equals(role) && !"Guide".equals(role)) {
            System.out.println("DEBUG: OAuth2 - invalid role: " + role);
            response.setStatus(400);
            response.getWriter().write("role must be Traveler or Guide");
            return;
        }

        // Store selected role briefly for the OAuth handshake.
        Cookie c = new Cookie("oauth_role", role);
        c.setHttpOnly(true);
        c.setPath("/");
        c.setMaxAge(300); // 5 minutes
        response.addCookie(c);

        System.out.println("DEBUG: OAuth2 - redirected to /oauth2/authorization/google");
        // Redirect to Spring Security OAuth2 authorization endpoint.
        response.sendRedirect("/oauth2/authorization/google");
    }
}