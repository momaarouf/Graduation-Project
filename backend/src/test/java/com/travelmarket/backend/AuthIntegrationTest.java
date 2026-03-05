package com.travelmarket.backend;

import com.travelmarket.backend.dto.AuthResponse;
import com.travelmarket.backend.dto.LoginRequest;
import com.travelmarket.backend.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldRegisterAndLogin() {
        String baseUrl = "http://localhost:" + port + "/api/auth";

        // Register
        RegisterRequest register = new RegisterRequest();
        register.setEmail("integration@example.com");
        register.setPassword("Test@1234");
        register.setRole("Traveler");

        ResponseEntity<AuthResponse> registerResponse = restTemplate.postForEntity(
                baseUrl + "/register", register, AuthResponse.class);

        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(registerResponse.getBody().getEmail()).isEqualTo("integration@example.com");

        // Login
        LoginRequest login = new LoginRequest();
        login.setEmail("integration@example.com");
        login.setPassword("Test@1234");

        ResponseEntity<AuthResponse> loginResponse = restTemplate.postForEntity(
                baseUrl + "/login", login, AuthResponse.class);

        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginResponse.getBody().getToken()).isNotEmpty();
    }
}