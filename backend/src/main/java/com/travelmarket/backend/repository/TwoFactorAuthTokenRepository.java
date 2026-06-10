package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.TwoFactorAuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TwoFactorAuthTokenRepository extends JpaRepository<TwoFactorAuthToken, Long> {
    Optional<TwoFactorAuthToken> findByTokenHash(String tokenHash);
}
