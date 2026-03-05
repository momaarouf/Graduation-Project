package com.travelmarket.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "guide_languages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class GuideLanguage {

    @EmbeddedId
    private GuideLanguageId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("guideId")
    @JoinColumn(name = "guide_id", nullable = false)
    private GuideProfile guide;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("languageId")
    @JoinColumn(name = "language_id", nullable = false)
    private Language language;

    @Column(nullable = false, length = 20)
    private String proficiency; // Beginner/Intermediate/Advanced
}