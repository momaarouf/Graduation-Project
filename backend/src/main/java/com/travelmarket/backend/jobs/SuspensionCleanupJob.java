package com.travelmarket.backend.jobs;

import com.travelmarket.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class SuspensionCleanupJob {

    private final UserRepository userRepository;

    // Runs every minute to clean up expired timed suspensions.
    @Scheduled(fixedDelay = 60_000)
    public void clearExpiredSuspensions() {
        userRepository.clearExpiredSuspensions(Instant.now());
    }
}