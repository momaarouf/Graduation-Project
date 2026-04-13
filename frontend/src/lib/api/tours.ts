// src/lib/api/tours.ts

import apiClient from '@/src/lib/api/client'
import { cache } from 'react'
import {
  TourTemplateResponse,
  TourMediaResponse,
  PublicTourCardResponse,
  PublicTourDetailResponse,
  TourOccurrenceResponse,
  GuidePortfolioTourResponse,
  GuidePortfolioTourDetailResponse,
  CreateTourTemplateRequest,
  UpdateTourTemplateRequest,
  CreateOccurrenceRequest,
  UpdateOccurrenceRequest,
  PublicTourFilters,
  CreateBookingRequest,
  BookingResponse,
  GuideBookingResponse,
  WaitlistResponse,
  ReviewCreateRequest,
  ReviewResponse,
  ReviewSummaryResponse,
  ToggleHelpfulResponse,
  TourRouteResponse,
} from '@/src/lib/types/tour.types'
import { GuideProfileResponse } from '@/src/lib/types/guide.types'

// ── Guide: Tour CRUD ─────────────────────────────────────────────────────────

/** Create a new tour (always starts as DRAFT) */
export const createTour = (data: CreateTourTemplateRequest) =>
  apiClient.post<TourTemplateResponse>('/api/guide/tours', data).then(r => r.data)

/** List all own tours (all statuses, not deleted) */
export const getGuideTours = () =>
  apiClient.get<TourTemplateResponse[]>('/api/guide/tours').then(r => r.data)

/** Get guide profile stats & info */
export const getGuideProfile = () =>
  apiClient.get<GuideProfileResponse>('/api/guide/profile').then(r => r.data)

/** Get one own tour by ID */
export const getGuideTour = (id: number) =>
  apiClient.get<TourTemplateResponse>(`/api/guide/tours/${id}`).then(r => r.data)

/** Partial update — only send fields you want to change */
export const updateTour = (id: number, data: UpdateTourTemplateRequest) =>
  apiClient.put<TourTemplateResponse>(`/api/guide/tours/${id}`, data).then(r => r.data)

/** Soft delete a tour */
export const deleteTour = (id: number) =>
  apiClient.delete(`/api/guide/tours/${id}`)

// ── Guide: Status transitions ────────────────────────────────────────────────

/** DRAFT or REJECTED → PENDING_REVIEW */
export const submitTourForReview = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/guide/tours/${id}/submit`).then(r => r.data)

/** PENDING_REVIEW → DRAFT (guide withdraws to make more edits) */
export const withdrawTourFromReview = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/guide/tours/${id}/withdraw`).then(r => r.data)

/** PUBLISHED → PAUSED */
export const pauseTour = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/guide/tours/${id}/pause`).then(r => r.data)

/** PAUSED → PENDING_REVIEW (resuming requires re-approval) */
export const resumeTour = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/guide/tours/${id}/resume`).then(r => r.data)

/** PUBLISHED or PAUSED → ARCHIVED (permanent) */
export const archiveTour = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/guide/tours/${id}/archive`).then(r => r.data)

/** DEV-ONLY: Immediately publish a tour bypassing admin review */
export const publishTourImmediately = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/guide/tours/${id}/publish-immediately`).then(r => r.data)

// ── Guide: Media ─────────────────────────────────────────────────────────────

/** Add a media item (base64) to a tour */
export const addTourMedia = (templateId: number, data: { url: string; mediaType: string; displayOrder: number; caption?: string }) =>
  apiClient.post<TourMediaResponse>(`/api/guide/tours/${templateId}/media`, data).then(r => r.data)

/** Delete a media item by ID */
export const deleteTourMedia = (mediaId: number) =>
  apiClient.delete(`/api/guide/media/${mediaId}`)

// ── Guide: Occurrences ───────────────────────────────────────────────────────

/** Create occurrence under a PUBLISHED tour */
export const createOccurrence = (templateId: number, data: CreateOccurrenceRequest) =>
  apiClient.post<TourOccurrenceResponse>(`/api/guide/tours/${templateId}/occurrences`, data).then(r => r.data)

/** List all occurrences for one of guide's tours */
export const getGuideOccurrences = (templateId: number) =>
  apiClient.get<TourOccurrenceResponse[]>(`/api/guide/tours/${templateId}/occurrences`).then(r => r.data)

/** Update an occurrence (reschedule or cancel) */
export const updateOccurrence = (occurrenceId: number, data: UpdateOccurrenceRequest) =>
  apiClient.put<TourOccurrenceResponse>(`/api/guide/occurrences/${occurrenceId}`, data).then(r => r.data)

/** Soft delete an occurrence */
export const deleteOccurrence = (occurrenceId: number) =>
  apiClient.delete(`/api/guide/occurrences/${occurrenceId}`)

// ── Admin: Review ────────────────────────────────────────────────────────────

/** Get all tours waiting for approval */
export const getAdminPendingTours = () =>
  apiClient.get<TourTemplateResponse[]>('/api/admin/tours/pending').then(r => r.data)

/** Approve a tour → PUBLISHED */
export const adminApproveTour = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/admin/tours/${id}/approve`).then(r => r.data)

/** Reject a tour with a reason */
export const adminRejectTour = (id: number, rejectionReason: string) =>
  apiClient.post<TourTemplateResponse>(`/api/admin/tours/${id}/reject`, { rejectionReason }).then(r => r.data)

// ── Public: Browsing ─────────────────────────────────────────────────────────

/** Public tour listing with optional filters */
export const getPublicTours = (filters?: PublicTourFilters) =>
  apiClient.get<PublicTourCardResponse[]>('/api/public/tours', { params: filters }).then(r => r.data)

/** Public tour detail page - Cached for RSC performance */
export const getPublicTourDetail = cache((id: number) =>
  apiClient.get<PublicTourDetailResponse>(`/api/public/tours/${id}`).then(r => r.data)
)

/** Future active occurrences for a published tour */
export const getPublicTourOccurrences = (id: number) =>
  apiClient.get<TourOccurrenceResponse[]>(`/api/public/tours/${id}/occurrences`).then(r => r.data)

/** Get ordered waypoints (trail) for a tour's route */
export const getTourRoute = (id: number) =>
  apiClient.get<TourRouteResponse>(`/api/public/tours/${id}/route`).then(r => r.data)

/** Radius search (near me) */
export const getNearbyTours = (lat: number, lng: number, radiusKm: number) =>
  apiClient.get<PublicTourCardResponse[]>('/api/public/tours/nearby', {
    params: { lat, lng, radiusKm }
  }).then(r => r.data)

// ── Public: Portfolio ────────────────────────────────────────────────────────

/** Guide's public portfolio tour list */
export const getGuidePortfolio = (guideId: number | string) =>
  apiClient.get<GuidePortfolioTourResponse[]>(`/api/public/guides/${guideId}/tours`).then(r => r.data)

/** Single portfolio tour — full case-study view */
export const getPortfolioTourDetail = (guideId: number, tourId: number) =>
  apiClient.get<GuidePortfolioTourDetailResponse>(`/api/public/guides/${guideId}/tours/${tourId}`).then(r => r.data)

// ── Bookings: Traveler ───────────────────────────────────────────────────────

export const createBooking = (data: CreateBookingRequest) =>
  apiClient.post<BookingResponse>('/api/traveler/bookings', data).then(r => r.data)

/** List authenticated traveler bookings */
export const getTravelerBookings = () =>
  apiClient.get<BookingResponse[]>('/api/traveler/bookings').then(r => r.data)

/** Get single traveler booking */
export const getTravelerBooking = (id: number | string) =>
  apiClient.get<BookingResponse>(`/api/traveler/bookings/${id}`).then(r => r.data)

/** Update an existing booking */
export const updateBooking = (bookingId: number, data: any) =>
  apiClient.patch<BookingResponse>(`/api/traveler/bookings/${bookingId}`, data).then(r => r.data)

/** Cancel a booking pre-departure */
export const cancelBooking = (bookingId: number, data?: { reason: string }) =>
  apiClient.delete<BookingResponse>(`/api/traveler/bookings/${bookingId}`, { data }).then(r => r.data)

// ── Waitlist: Traveler ───────────────────────────────────────────────────────

/** Join waitlist for a full occurrence */
export const joinWaitlist = (data: { occurrenceId: number; peopleCount: number; message?: string }) =>
  apiClient.post<WaitlistResponse>('/api/traveler/waitlist', data).then(r => r.data)

/** Get my active waitlist entries */
export const getMyWaitlist = () =>
  apiClient.get<WaitlistResponse[]>('/api/traveler/waitlist').then(r => r.data)

/** Leave waitlist */
export const leaveWaitlist = (id: number) =>
  apiClient.delete(`/api/traveler/waitlist/${id}`)

// ── Bookings: Guide ──────────────────────────────────────────────────────────

/** List all bookings for my tour occurrences */
export const getGuideBookings = () =>
  apiClient.get<GuideBookingResponse[]>('/api/guide/bookings').then(r => r.data)

/** Get single booking on my tour */
export const getGuideBooking = (id: number) =>
  apiClient.get<GuideBookingResponse>(`/api/guide/bookings/${id}`).then(r => r.data)

/** Accept a request booking */
export const confirmBooking = (id: number) =>
  apiClient.put<GuideBookingResponse>(`/api/guide/bookings/${id}/confirm`).then(r => r.data)

/** Reject a request booking */
export const rejectBooking = (id: number, data?: { reason: string }) =>
  apiClient.put<GuideBookingResponse>(`/api/guide/bookings/${id}/reject`, data).then(r => r.data)

/** Mark as no-show */
export const noShowBooking = (id: number, data?: { reason: string }) =>
  apiClient.post<GuideBookingResponse>(`/api/guide/bookings/${id}/no-show`, data).then(r => r.data)

/** Scanner flow: check-in via QR token */
export const checkInByQrToken = (qrToken: string) =>
  apiClient.post<GuideBookingResponse>(`/api/guide/bookings/checkin-by-qr/${qrToken}`).then(r => r.data)

/** Mark tour completed */
export const completeBooking = (id: number) =>
  apiClient.post<GuideBookingResponse>(`/api/guide/bookings/${id}/complete`).then(r => r.data)

// ── Reviews API ──────────────────────────────────────────────────────────────

export const getTourReviews = cache((tourId: number | string, page = 0, size = 10, rating?: number | null, sort = 'newest') =>
  apiClient.get<ReviewSummaryResponse>(`/api/reviews/tour/${tourId}`, {
    params: { page, size, rating, sort }
  }).then(r => r.data)
)

/** 
 * Get reviews for a guide.
 */
export const getGuideReviews = (guideId: number | string, page = 0, size = 10, rating?: number | null, sort = 'newest') =>
  apiClient.get<ReviewSummaryResponse>(`/api/reviews/guide/${guideId}`, {
    params: { page, size, rating, sort }
  }).then(r => r.data)

/**
 * Submit a review for a completed booking.
 */
export const submitReview = (data: ReviewCreateRequest) =>
  apiClient.post<ReviewResponse>('/api/traveler/reviews', data).then(r => r.data)

/**
 * Get all reviews written by the authenticated traveler.
 */
export const getTravelerReviews = (page = 0, size = 100) =>
  apiClient.get<any>(`/api/traveler/reviews/my`, {
    params: { page, size }
  }).then(r => r.data)

/**
 * Toggle "Helpful" vote on a review.
 */
export const toggleReviewHelpful = (reviewId: number | string) =>
  apiClient.post<ToggleHelpfulResponse>(`/api/reviews/${reviewId}/helpful`).then(r => r.data)

/**
 * Guide reply to a traveler review.
 */
export const replyToReview = (reviewId: number | string, reply: string) =>
  apiClient.post<ReviewResponse>(`/api/reviews/${reviewId}/reply`, reply, {
    headers: { 'Content-Type': 'text/plain' }
  }).then(r => r.data)

/** Fetch similar tours (Placeholder) */
export const getSimilarTours = (params: any) =>
  apiClient.get<PublicTourCardResponse[]>('/api/public/tours', { params }).then(r => r.data).catch(() => [])

/** Export types used by callers */
export type { GetTourReviewsParams, PaginatedResponse } from '../types/tour.types'