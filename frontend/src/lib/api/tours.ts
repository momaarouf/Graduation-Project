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
export const addTourMedia = (templateId: number, data: { url: string; mediaType: string; displayOrder: number }) =>
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

/** Create a new booking */
export const createBooking = (data: CreateBookingRequest) =>
  apiClient.post<BookingResponse>('/api/traveler/bookings', data)

/** List traveler's bookings */
export const getTravelerBookings = () =>
  apiClient.get<BookingResponse[]>('/api/traveler/bookings')

/** Get single traveler booking */
export const getTravelerBooking = (id: number) =>
  apiClient.get<BookingResponse>(`/api/traveler/bookings/${id}`)

/** Cancel a booking */
export const cancelBooking = (id: number) =>
  apiClient.delete<BookingResponse>(`/api/traveler/bookings/${id}`)

// ── Bookings: Guide ──────────────────────────────────────────────────────────

/** List guide's incoming bookings */
export const getGuideBookings = () =>
  apiClient.get<GuideBookingResponse[]>('/api/guide/bookings')

/** Get single guide booking */
export const getGuideBooking = (id: number) =>
  apiClient.get<GuideBookingResponse>(`/api/guide/bookings/${id}`)

/** Confirm a pending booking */
export const confirmBooking = (id: number) =>
  apiClient.put<GuideBookingResponse>(`/api/guide/bookings/${id}/confirm`)

/** Reject a pending booking */
export const rejectBooking = (id: number) =>
  apiClient.put<GuideBookingResponse>(`/api/guide/bookings/${id}/reject`)

// ── Placeholders & Legacy Support ────────────────────────────────────────────

/** Alias for getPublicTourDetail used by legacy components */
export const getTourById = ({ id }: { id: string | number }) =>
  getPublicTourDetail(Number(id)).then(r => r.data)

/** Fetch reviews (Placeholder) */
export const getTourReviews = (params: any) =>
  Promise.resolve({ data: { data: [], total: 0, page: 1, limit: 10, hasNext: false, hasPrev: false } } as any)

/** Fetch similar tours (Placeholder) */
export const getSimilarTours = (params: any) =>
  apiClient.get<PublicTourCardResponse[]>('/api/public/tours', { params }).then(r => r.data).catch(() => [])

/** Export types used by callers */
export type { GetTourReviewsParams, PaginatedResponse } from '../types/tour.types'