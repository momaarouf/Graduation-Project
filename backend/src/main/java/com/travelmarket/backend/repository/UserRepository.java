package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhoneE164(String phoneE164);
    List<User> findByEmailContainingIgnoreCase(String email);
    @Modifying
    @Transactional
    @Query("""
    update User u
    set u.accountStatus = 'ACTIVE',
        u.suspendedUntilUtc = null,
        u.statusReason = null
    where u.accountStatus = 'SUSPENDED'
      and u.suspendedUntilUtc is not null
      and u.suspendedUntilUtc <= :now
""")
    int clearExpiredSuspensions(@Param("now") Instant now);
}