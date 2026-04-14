package com.travelmarket.backend.notification.enums;

public enum NotificationType {
    // Auth & Profile
    EMAIL_VERIFIED,
    PASSWORD_CHANGED,
    PROFILE_COMPLETED,
    
    // Guide Verification
    VERIFICATION_SUBMITTED,
    VERIFICATION_APPROVED,
    VERIFICATION_REJECTED,
    
    // Bookings
    BOOKING_CREATED,
    BOOKING_CONFIRMED,
    BOOKING_CANCELLED,
    BOOKING_EXPIRED,        // PendingPayment booking auto-cancelled after 15-min timeout
    
    // Payments
    PAYMENT_SUCCESS,
    PAYMENT_FAILED,
    PAYOUT_PROCESSED,
    
    // Chat
    NEW_MESSAGE,
    
    // System/Admin
    SYSTEM_ALERT,
    ACCOUNT_SUSPENDED,
    ACCOUNT_REACTIVATED
}
