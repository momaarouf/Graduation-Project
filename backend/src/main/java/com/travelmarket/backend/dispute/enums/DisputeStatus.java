package com.travelmarket.backend.dispute.enums;

/**
 * Status lifecycle of a Dispute.
 * 
 * OPEN -> UNDER_REVIEW -> RESOLVED (with optional refund)
 *                     -> REJECTED
 */
public enum DisputeStatus {
    /** Dispute just filed, awaiting admin action */
    OPEN,
    
    /** Admin is actively investigating (gathering evidence, contacting parties) */
    UNDER_REVIEW,
    
    /** Dispute concluded, any necessary refunds have been processed */
    RESOLVED,
    
    /** Dispute dismissed by admin (e.g., lack of evidence) */
    REJECTED
}
