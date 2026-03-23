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
