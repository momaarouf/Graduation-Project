import apiClient from './client';
import { PublicTourCardResponse } from '@/src/lib/types/tour.types';

export const getWishlistTourIds = async (): Promise<number[]> => {
    const res = await apiClient.get<number[]>('/api/wishlist/ids');
    return res.data;
};

export const getWishlistTours = async (): Promise<PublicTourCardResponse[]> => {
    const res = await apiClient.get<PublicTourCardResponse[]>('/api/wishlist');
    return res.data;
};

export const addToWishlist = async (tourId: number): Promise<void> => {
    await apiClient.post(`/api/wishlist/${tourId}`);
};

export const removeFromWishlist = async (tourId: number): Promise<void> => {
    await apiClient.delete(`/api/wishlist/${tourId}`);
};
