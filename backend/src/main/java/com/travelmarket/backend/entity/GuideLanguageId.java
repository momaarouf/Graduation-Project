package com.travelmarket.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class GuideLanguageId implements Serializable {

    @Column(name = "guide_id")
    private Long guideId;

    @Column(name = "language_id")
    private Long languageId;
}