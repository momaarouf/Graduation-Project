package com.travelmarket.backend.tour.enums;

/**
 * Classifies the type of media attached to a TourTemplate.
 *
 * IMAGE → standard photo (cover image or gallery image)
 * VIDEO → video clip (future support; structure is ready now)
 *
 * V1 only uses IMAGE. VIDEO is defined here so no schema change
 * is needed when video upload is added.
 *
 * Stored as a VARCHAR string in the DB (never as ordinal).
 */
public enum TourMediaType {
    IMAGE,
    VIDEO
}