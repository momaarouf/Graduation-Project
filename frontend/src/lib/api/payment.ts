import apiClient from './client';
import { PaymentResponse } from '../types/tour.types';

/**
 * Creates a Stripe Checkout session for a booking in PendingPayment status.
 * Returns the checkoutUrl to redirect the user to Stripe.
 */
export const createPaymentSession = async (bookingId: number) => {
 const response = await apiClient.post<PaymentResponse>('/api/payments/create-session', {
 bookingId,
 });
 return response.data;
};

/**
 * Gets the current payment status for a booking.
 * Poll this if you need to verify success after returning from Stripe.
 */
export const getPaymentStatus = async (bookingId: number) => {
 const response = await apiClient.get<PaymentResponse>(`/api/traveler/payments/${bookingId}`);
 return response.data;
};
/**
 * Simulates a Stripe webhook confirmation for a mock session.
 * Used only when stripe.mock-mode=true in the backend.
 */
export const confirmMockPayment = async (sessionId: string) => {
 const response = await apiClient.post(`/api/payments/mock/confirm/${sessionId}`);
 return response.data;
};

/**
 * Simulates a Stripe webhook failure for a mock session.
 */
export const failMockPayment = async (sessionId: string) => {
 const response = await apiClient.post(`/api/payments/mock/fail/${sessionId}`);
 return response.data;
};
