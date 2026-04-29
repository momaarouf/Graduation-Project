import client from './client';

export interface TravelerProfile {
 fullName: string;
 phoneE164: string;
 country: string;
 city: string;
 nationality?: string;
 dateOfBirth?: string;
 preferences?: string[];
 loyaltyTier: string;
 completedTrips: number;
 email: string;
 emailVerified: boolean;
 phoneVerified: boolean;
 tagline?: string;
 bio?: string;
 avatarUrl?: string;
 coverImageUrl?: string;
}

export interface PublicTravelerProfile {
 id: number;
 fullName: string;
 tagline?: string;
 bio?: string;
 avatarUrl?: string;
 coverImageUrl?: string;
 location: string;
 memberSince: string;
 loyaltyTier: string;
 completedTrips: number;
 preferences: string[];
 emailVerified: boolean;
 phoneVerified: boolean;
}

/**
 * Get the current authorized traveler's profile
 */
export async function getTravelerProfile(): Promise<TravelerProfile> {
 const response = await client.get<TravelerProfile>('/api/traveler/profile');
 return response.data;
}

/**
 * Complete/Update the current authorized traveler's profile
 */
export async function completeTravelerProfile(data: Partial<TravelerProfile>): Promise<TravelerProfile> {
 const response = await client.post<TravelerProfile>('/api/traveler/profile/complete', data);
 return response.data;
}

/**
 * Get a public traveler profile by ID
 */
export async function getPublicTravelerProfile(travelerId: number): Promise<PublicTravelerProfile> {
 const response = await client.get<PublicTravelerProfile>(`/api/public/travelers/${travelerId}`);
 return response.data;
}
