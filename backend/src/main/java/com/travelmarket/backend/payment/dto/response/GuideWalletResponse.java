package com.travelmarket.backend.payment.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

/**
 * Summary of guide earnings for the Wallet dashboard.
 */
@Data
@Builder
public class GuideWalletResponse {
    private BigDecimal availableBalance; // Transferred to guide's Stripe account
    private BigDecimal pendingBalance;   // In 48h escrow window
    private BigDecimal totalEarned;      // Lifetime earnings (net)
    private String currency;
    private String stripeAccountId;      // Linked Stripe Connect ID
    private boolean onboardingComplete;  // True if payouts can be released
    private String payoutMethodLast4;    // e.g. "4242"
    private String payoutMethodBrand;    // e.g. "Visa"
    private String payoutMethodType;     // e.g. "card" or "bank"
}
