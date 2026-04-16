package com.travelmarket.backend.dispute.enums;

/**
 * Categorized reasons for a dispute.
 * Kept concise to facilitate reporting and automated rule evaluation.
 */
public enum DisputeReason {
    /** The tour or guide did not meet expected standards */
    POOR_SERVICE,
    
    /** Guide or traveler did not show up at the meeting point */
    NO_SHOW,
    
    /** Issues with off-platform extra payments requested, etc. */
    PAYMENT_ISSUE,
    
    /** Deliberate misrepresentation or scam */
    FRAUD,
    
    /** Situations where the traveler or guide felt unsafe */
    SAFETY,
    
    /** General quality issues (e.g., duration was too short) */
    QUALITY,
    
    /** Catch-all for reasons that do not fit the above categories */
    OTHER
}
