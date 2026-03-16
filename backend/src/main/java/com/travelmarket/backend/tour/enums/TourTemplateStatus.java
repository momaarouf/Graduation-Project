package com.travelmarket.backend.tour.enums;

/**
 * Controls the full lifecycle of a TourTemplate.
 *
 * State machine:
 *
 *   DRAFT ──────────────────────────── guide edits freely
 *     │
 *     └─ submit ──→ PENDING_REVIEW ─── admin approves ──→ PUBLISHED
 *                        │                                     │
 *                  admin rejects                         guide edits
 *                        │                                     │
 *                        ↓                                     ↓
 *                    REJECTED ←── guide edits ── PENDING_REVIEW
 *                                                              │
 *                                                       admin approves
 *                                                              │
 *                                                         PUBLISHED
 *                                                              │
 *                                               ┌─────────────┴──────────────┐
 *                                          guide pauses                guide archives
 *                                               │                            │
 *                                            PAUSED ──→ PUBLISHED        ARCHIVED
 *                                               │                      (terminal)
 *                                         guide archives
 *                                               │
 *                                           ARCHIVED
 *
 * Editing rules enforced in TourTemplateService:
 *   DRAFT          → guide can edit freely; status stays DRAFT
 *   REJECTED       → guide can edit; status stays REJECTED until resubmit
 *   PUBLISHED      → guide edit forces status → PENDING_REVIEW
 *   PAUSED         → guide edit forces status → PENDING_REVIEW
 *   PENDING_REVIEW → locked; guide must withdraw first
 *   ARCHIVED       → locked; terminal state, no recovery
 *
 * Portfolio visibility rule (PublicTourService):
 *   last_published_at_utc IS NOT NULL AND show_in_portfolio = true AND deleted_at_utc IS NULL
 *   This means PUBLISHED, PAUSED, and ARCHIVED tours all appear in the portfolio
 *   once they have been approved at least once.
 *
 * Stored as a VARCHAR string in the DB (never as ordinal).
 */
public enum TourTemplateStatus {
    DRAFT,
    PENDING_REVIEW,
    PUBLISHED,
    PAUSED,
    REJECTED,
    ARCHIVED
}