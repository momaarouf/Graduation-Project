package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.Language;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LanguageRepository extends JpaRepository<Language, Long> {

    Optional<Language> findByNameIgnoreCase(String name);

    // Needed to avoid duplicate codes and to generate a unique one safely.
    Optional<Language> findByCodeIgnoreCase(String code);
}