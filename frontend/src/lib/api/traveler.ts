import apiClient from './client';

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
  loyaltyTier: string;
  completedTrips: number;
  reviewReminderEnabled: boolean;
  newsletterOptIn: boolean;
}

/**
 * Get traveler profile stats and details
 */
export const travelerGetProfile = async (): Promise<TravelerProfileResponse> => {
  const response = await apiClient.get('/api/traveler/profile');
  return response.data;
};
