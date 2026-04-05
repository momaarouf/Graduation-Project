// src/lib/api/tours.ts

import apiClient from '@/src/lib/api/client'
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
} from '@/src/lib/types/tour.types'
import { GuideProfileResponse } from '@/src/lib/types/guide.types'

// ── Guide: Tour CRUD ─────────────────────────────────────────────────────────

/** Create a new tour (always starts as DRAFT) */
export const createTour = (data: CreateTourTemplateRequest) =>
  apiClient.post<TourTemplateResponse>('/api/guide/tours', data)

/** List all own tours (all statuses, not deleted) */
export const getGuideTours = () =>
  apiClient.get<TourTemplateResponse[]>('/api/guide/tours')

/** Get guide profile stats & info */
export const getGuideProfile = () =>
  apiClient.get<GuideProfileResponse>('/api/guide/profile')

/** Get one own tour by ID */
export const getGuideTour = (id: number) =>
  apiClient.get<TourTemplateResponse>(`/api/guide/tours/${id}`)

/** Partial update — only send fields you want to change */
export const updateTour = (id: number, data: UpdateTourTemplateRequest) =>
  apiClient.put<TourTemplateResponse>(`/api/guide/tours/${id}`, data)

/** Soft delete a tour */
export const deleteTour = (id: number) =>
  apiClient.delete(`/api/guide/tours/${id}`)

// ── Guide: Status transitions ────────────────────────────────────────────────

/** DRAFT or REJECTED → PENDING_REVIEW */
export const submitTourForReview = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/guide/tours/${id}/submit`)

/** PENDING_REVIEW → DRAFT (guide withdraws to make more edits) */
export const withdrawTourFromReview = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/guide/tours/${id}/withdraw`)

/** PUBLISHED → PAUSED */
export const pauseTour = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/guide/tours/${id}/pause`)

/** PAUSED → PENDING_REVIEW (resuming requires re-approval) */
export const resumeTour = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/guide/tours/${id}/resume`)

/** PUBLISHED or PAUSED → ARCHIVED (permanent) */
export const archiveTour = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/guide/tours/${id}/archive`)

/** DEV-ONLY: Immediately publish a tour bypassing admin review */
export const publishTourImmediately = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/guide/tours/${id}/publish-immediately`)

// ── Guide: Media ─────────────────────────────────────────────────────────────

/** Add a media item (base64) to a tour */
export const addTourMedia = (templateId: number, data: { url: string; mediaType: string; displayOrder: number; caption?: string }) =>
  apiClient.post<TourMediaResponse>(`/api/guide/tours/${templateId}/media`, data)

/** Delete a media item by ID */
export const deleteTourMedia = (mediaId: number) =>
  apiClient.delete(`/api/guide/media/${mediaId}`)

// ── Guide: Occurrences ───────────────────────────────────────────────────────

/** Create occurrence under a PUBLISHED tour */
export const createOccurrence = (templateId: number, data: CreateOccurrenceRequest) =>
  apiClient.post<TourOccurrenceResponse>(`/api/guide/tours/${templateId}/occurrences`, data)

/** List all occurrences for one of guide's tours */
export const getGuideOccurrences = (templateId: number) =>
  apiClient.get<TourOccurrenceResponse[]>(`/api/guide/tours/${templateId}/occurrences`)

/** Update an occurrence (reschedule or cancel) */
export const updateOccurrence = (occurrenceId: number, data: UpdateOccurrenceRequest) =>
  apiClient.put<TourOccurrenceResponse>(`/api/guide/occurrences/${occurrenceId}`, data)

/** Soft delete an occurrence */
export const deleteOccurrence = (occurrenceId: number) =>
  apiClient.delete(`/api/guide/occurrences/${occurrenceId}`)

// ── Admin: Review ────────────────────────────────────────────────────────────

/** Get all tours waiting for approval */
export const getAdminPendingTours = () =>
  apiClient.get<TourTemplateResponse[]>('/api/admin/tours/pending')

/** Approve a tour → PUBLISHED */
export const adminApproveTour = (id: number) =>
  apiClient.post<TourTemplateResponse>(`/api/admin/tours/${id}/approve`)

/** Reject a tour with a reason */
export const adminRejectTour = (id: number, rejectionReason: string) =>
  apiClient.post<TourTemplateResponse>(`/api/admin/tours/${id}/reject`, { rejectionReason })

// ── Public: Browsing ─────────────────────────────────────────────────────────

/** Public tour listing with optional filters */
export const getPublicTours = (filters?: PublicTourFilters) =>
  apiClient.get<PublicTourCardResponse[]>('/api/public/tours', { params: filters })

/** Public tour detail page */
export const getPublicTourDetail = (id: number) =>
  apiClient.get<PublicTourDetailResponse>(`/api/public/tours/${id}`)

/** Future active occurrences for a published tour */
export const getPublicTourOccurrences = (id: number) =>
  apiClient.get<TourOccurrenceResponse[]>(`/api/public/tours/${id}/occurrences`)

// ── Public: Portfolio ────────────────────────────────────────────────────────

/** Guide's public portfolio tour list */
export const getGuidePortfolio = (guideId: number | string) =>
  apiClient.get<GuidePortfolioTourResponse[]>(`/api/public/guides/${guideId}/tours`)

/** Single portfolio tour — full case-study view */
export const getPortfolioTourDetail = (guideId: number, tourId: number) =>
  apiClient.get<GuidePortfolioTourDetailResponse>(`/api/public/guides/${guideId}/tours/${tourId}`)

// ── Bookings: Traveler ───────────────────────────────────────────────────────

export const createBooking = (data: CreateBookingRequest) =>
  apiClient.post<BookingResponse>('/api/traveler/bookings', data)

/** List authenticated traveler bookings */
export const getTravelerBookings = () =>
  apiClient.get<BookingResponse[]>('/api/traveler/bookings')

/** Get single traveler booking */
export const getTravelerBooking = (id: number | string) =>
  apiClient.get<BookingResponse>(`/api/traveler/bookings/${id}`)

/** Update an existing booking */
export const updateBooking = (bookingId: number, data: any) =>
  apiClient.patch<BookingResponse>(`/api/traveler/bookings/${bookingId}`, data)

/** Cancel a booking pre-departure */
export const cancelBooking = (bookingId: number, data?: { reason: string }) =>
  apiClient.delete<BookingResponse>(`/api/traveler/bookings/${bookingId}`, { data })

// ── Waitlist: Traveler ───────────────────────────────────────────────────────

/** Join waitlist for a full occurrence */
export const joinWaitlist = (data: { occurrenceId: number; peopleCount: number; message?: string }) =>
  apiClient.post<WaitlistResponse>('/api/traveler/waitlist', data)

/** Get my active waitlist entries */
export const getMyWaitlist = () =>
  apiClient.get<WaitlistResponse[]>('/api/traveler/waitlist')

/** Leave waitlist */
export const leaveWaitlist = (id: number) =>
  apiClient.delete(`/api/traveler/waitlist/${id}`)

// ── Bookings: Guide ──────────────────────────────────────────────────────────

/** List all bookings for my tour occurrences */
export const getGuideBookings = () =>
  apiClient.get<GuideBookingResponse[]>('/api/guide/bookings')

/** Get single booking on my tour */
export const getGuideBooking = (id: number) =>
  apiClient.get<GuideBookingResponse>(`/api/guide/bookings/${id}`)

/** Accept a request booking */
export const confirmBooking = (id: number) =>
  apiClient.put<GuideBookingResponse>(`/api/guide/bookings/${id}/confirm`)

/** Reject a request booking */
export const rejectBooking = (id: number, data?: { reason: string }) =>
  apiClient.put<GuideBookingResponse>(`/api/guide/bookings/${id}/reject`, data)

/** Mark as no-show */
export const noShowBooking = (id: number, data?: { reason: string }) =>
  apiClient.post<GuideBookingResponse>(`/api/guide/bookings/${id}/no-show`, data)

/** Scanner flow: check-in via QR token */
export const checkInByQrToken = (qrToken: string) =>
  apiClient.post<GuideBookingResponse>(`/api/guide/bookings/checkin-by-qr/${qrToken}`)

/** Mark tour completed */
export const completeBooking = (id: number) =>
  apiClient.post<GuideBookingResponse>(`/api/guide/bookings/${id}/complete`)

// ── Reviews API ──────────────────────────────────────────────────────────────

/**
 * Fetch paginated reviews + aggregated stats for a tour template.
 * Calls: GET /api/reviews/tour/{tourId}?page=0&size=10
 */
export const getTourReviews = (tourId: number | string, page = 0, size = 10, rating?: number | null, sort = 'newest') =>
  apiClient.get<ReviewSummaryResponse>(`/api/reviews/tour/${tourId}`, {
    params: { page, size, rating, sort }
  })

/** 
 * Get reviews for a guide.
 */
export const getGuideReviews = (guideId: number | string, page = 0, size = 10, rating?: number | null, sort = 'newest') =>
  apiClient.get<ReviewSummaryResponse>(`/api/reviews/guide/${guideId}`, {
    params: { page, size, rating, sort }
  })

/**
 * Submit a review for a completed booking.
 */
export const submitReview = (data: ReviewCreateRequest) =>
  apiClient.post<ReviewResponse>('/api/traveler/reviews', data)

/**
 * Get all reviews written by the authenticated traveler.
 */
export const getTravelerReviews = (page = 0, size = 100) =>
  apiClient.get<any>(`/api/traveler/reviews/my`, {
    params: { page, size }
  })

/**
 * Toggle "Helpful" vote on a review.
 */
export const toggleReviewHelpful = (reviewId: number | string) =>
  apiClient.post<ToggleHelpfulResponse>(`/api/reviews/${reviewId}/helpful`)

/**
 * Guide reply to a traveler review.
 */
export const replyToReview = (reviewId: number | string, reply: string) =>
  apiClient.post<ReviewResponse>(`/api/reviews/${reviewId}/reply`, reply, {
    headers: { 'Content-Type': 'text/plain' }
  })

/** Fetch similar tours (Placeholder) */
export const getSimilarTours = (params: any) =>
  apiClient.get<PublicTourCardResponse[]>('/api/public/tours', { params }).then(r => r.data).catch(() => [])

/** Export types used by callers */
export type { GetTourReviewsParams, PaginatedResponse } from '../types/tour.types'