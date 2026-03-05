package com.travelmarket.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "languages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Language {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // DB is VARCHAR(5) NOT NULL (based on your error).
    // Use a short code like AR, EN, FR, etc. (2–5 chars max).
    @Column(nullable = false, unique = true, length = 5)
    private String code;

    // Display name like Arabic, English, French
    @Column(nullable = false, unique = true, length = 80)
    private String name;
}