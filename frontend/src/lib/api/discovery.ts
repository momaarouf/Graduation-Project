// src/lib/api/discovery.ts

import apiClient from './client';

export interface PublicStatsResponse {
 verifiedGuidesCount: number;
 totalTravelersCount: number;
 completedToursCount: number;
 activeToursCount: number;
 averageRating: number;
}

export interface CategoryDiscoveryResponse {
 id: string;
 name: string;
 tourCount: number;
 imageUrl: string;
}

export interface LocationDiscoveryResponse {
 name: string;
 tourCount: number;
 imageUrl: string;
}

/** Fetch global platform stats for home page */
export const getPublicStats = async (): Promise<PublicStatsResponse> => {
 const response = await apiClient.get('/api/public/stats');
 return response.data;
};

/** Fetch categories with tour counts */
export const getDiscoveryCategories = async (): Promise<CategoryDiscoveryResponse[]> => {
 const response = await apiClient.get('/api/public/discovery/categories');
 return response.data;
};

/** Fetch locations with tour counts */
export const getDiscoveryLocations = async (): Promise<LocationDiscoveryResponse[]> => {
 const response = await apiClient.get('/api/public/discovery/locations');
 return response.data;
};

export interface PublicGuideProfileResponse {
 id: number;
 name: string;
 tagline: string;
 avatarUrl: string;
 coverImageUrl: string;
 city: string;
 country: string;
 expertise: string[];
 tourCount: number;
 totalGuidedTrips: number;
 averageRating: number;
 verified: boolean;
 memberSince: string;
}

/** Fetch verified guides for discovery directory */
export const getDiscoveryGuides = async (): Promise<PublicGuideProfileResponse[]> => {
 const response = await apiClient.get('/api/public/discovery/guides');
 return response.data;
};
