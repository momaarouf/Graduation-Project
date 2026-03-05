package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.GuideLanguage;
import com.travelmarket.backend.entity.GuideLanguageId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuideLanguageRepository extends JpaRepository<GuideLanguage, GuideLanguageId> {

    void deleteByGuide_Id(Long guideId);

    List<GuideLanguage> findByGuide_Id(Long guideId);
}