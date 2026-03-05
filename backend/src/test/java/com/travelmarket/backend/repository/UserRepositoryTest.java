package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindUserByEmail() {
        // given
        User user = new User();
        user.setEmail("test@example.com");
        user.setPasswordHash("encodedPassword");
        user.setRole(User.Role.Traveler);
        userRepository.save(user);

        // when
        User found = userRepository.findByEmail("test@example.com").orElse(null);

        // then
        assertThat(found).isNotNull();
        assertThat(found.getEmail()).isEqualTo("test@example.com");
    }
}