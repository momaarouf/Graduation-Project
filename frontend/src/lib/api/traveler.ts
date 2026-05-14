import apiClient from './client';

/** Union of all valid loyalty tiers (matches the Java LoyaltyTier enum). */
export type LoyaltyTierType = 'BRONZE' | 'SILVER' | 'GOLD';

export interface TravelerProfileResponse {
 fullName: string;
 email: string;
 phoneE164: string;
 country: string;
 city: string;
 nationality: string;
 dateOfBirth?: string;
 preferences: string[];
 emailVerified: boolean;
 phoneVerified: boolean;
 memberSince: string;
 /** Always one of BRONZE, SILVER, GOLD after V59 migration. */
 loyaltyTier: LoyaltyTierType;
 completedTrips: number;
 reviewReminderEnabled: boolean;
 newsletterOptIn: boolean;
 tagline?: string;
 bio?: string;
 avatarUrl?: string;
 coverImageUrl?: string;
}

/**
 * Full loyalty status response from GET /api/traveler/profile/loyalty.
 * Includes tier, discount rate, and progress toward next tier.
 */
export interface LoyaltyStatusResponse {
 loyaltyTier: LoyaltyTierType;
 /** Discount percentage earned on each booking (e.g., 5 = 5%). */
 discountPct: number;
 completedTrips: number;
 /** Additional completed trips needed to reach next tier (0 if already GOLD). */
 tripsToNextTier: number;
 /** Name of the next tier; null if already GOLD. */
 nextTier: LoyaltyTierType | null;
 /** Discount % that would be earned after reaching the next tier. */
 nextTierDiscountPct: number | null;
}

/**
 * GET /api/traveler/profile
 * Returns traveler profile stats, loyalty tier (capitalize), and completed trips.
 */
export const travelerGetProfile = async (): Promise<TravelerProfileResponse> => {
 const response = await apiClient.get('/api/traveler/profile');
 return response.data;
};

/**
 * GET /api/traveler/profile/loyalty
 * Returns the traveler's loyalty tier, discount rate, and progress toward the next tier.
 */
export const travelerGetLoyaltyStatus = async (): Promise<LoyaltyStatusResponse> => {
 const response = await apiClient.get('/api/traveler/profile/loyalty');
 return response.data;
};
