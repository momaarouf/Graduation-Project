import client from './client';

export interface LanguageItem {
 name: string;
 proficiency: string;
}

export interface PublicGuideProfile {
 id: number;
 name: string;
 tagline: string | null;
 avatarUrl: string | null;
 coverImageUrl: string | null;
 bio: string | null;
 city: string | null;
 country: string | null;
 expertise: string[];
 languages: LanguageItem[];
 totalGuidedTrips: number;
 tourCount: number;
 averageRating: number | null;
 memberSince: string;
 verified: boolean;
}

export interface UpdateGuideMetaRequest {
 tagline?: string;
 avatarUrl?: string;
 coverImageUrl?: string;
}

/**
 * Fetch public guide profile data.
 * @param guideId The ID of the guide profile.
 */
export async function getPublicGuideProfile(guideId: number): Promise<PublicGuideProfile> {
 const response = await client.get<PublicGuideProfile>(`/api/public/guides/${guideId}`);
 return response.data;
}

/**
 * Search for verified guides by name.
 * @param query The search query string.
 */
export async function searchGuides(query: string): Promise<PublicGuideProfile[]> {
 const response = await client.get<PublicGuideProfile[]>(`/api/public/guides/search`, {
 params: { q: query }
 });
 return response.data;
}

/**
 * Update guide profile metadata (tagline, avatar, cover).
 * Requires Guide role.
 */
export async function updateGuideMeta(data: UpdateGuideMetaRequest): Promise<void> {
 await client.put('/api/guide/profile/meta', data);
}
