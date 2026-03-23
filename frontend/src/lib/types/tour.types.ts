// src/lib/types/tour.types.ts

// ── Enums (must match backend exactly, including case) ──────────────────────

export type TourTemplateStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'PAUSED'
  | 'REJECTED'
  | 'ARCHIVED'

export type TourOccurrenceStatus =
  | 'SCHEDULED'
  | 'FULL'
  | 'COMPLETED'
  | 'CANCELLED'

export type RecurrencePattern = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'

export type TourMediaType = 'IMAGE' | 'VIDEO'

export enum BookingStatus {
  PendingPayment = 'PendingPayment',
  PendingGuide = 'PendingGuide',
  Confirmed = 'Confirmed',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Waitlisted = 'Waitlisted',
  Expired = 'Expired',
  Rejected = 'Rejected' // Keeping rejected for UI fallback if needed, though backend uses Cancelled
}

// ── Response types (match backend DTO fields exactly) ───────────────────────

export interface TourMediaResponse {
  id: number
  mediaType: TourMediaType
  url: string
  displayOrder: number
}

export interface TourOccurrenceResponse {
  id: number
  templateId: number
  startTimeUtc: string   // ISO 8601 string
  endTimeUtc: string
  status: TourOccurrenceStatus
  seatsReserved: number
  maxCapacity: number
  availableSeats: number
  createdAtUtc: string
  updatedAtUtc: string
}

// Full tour — returned to guide only (includes status, rejectionReason)
export interface TourTemplateResponse {
  id: number
  title: string
  description: string
  shortDescription: string | null
  category: string | null
  locationName: string | null
  region: string | null
  countryCode: string
  meetingPointName: string | null
  meetingLatitude: number | null
  meetingLongitude: number | null
  meetingPointAddress: string | null
  meetingPointInstructions: string | null
  itinerary: string | null
  inclusions: string | null
  exclusions: string | null
  requirements: string | null
  whatToBring: string | null
  basePrice: number
  currency: string
  minCapacity: number
  maxCapacity: number
  instantBook: boolean
  isRecurring: boolean
  startDate: string | null
  recurrencePattern: RecurrencePattern
  recurringDays: string | null
  recurringUntil: string | null
  recurringDates: string | null
  excludedDates: string | null
  halalFriendly: boolean
  status: TourTemplateStatus
  isActive: boolean
  rejectionReason: string | null   // only populated when status = REJECTED
  autoCancelIfMinNotMet: boolean
  tags: string | null
  languages: string | null
  durationHours: number | null
  durationMinutes: number | null
  media: TourMediaResponse[]
  city: string | null
  createdAtUtc: string
  updatedAtUtc: string
  lastPublishedAtUtc: string | null

  // Aggregate stats (populated for guide dashboard)
  completedRunCount?: number
  totalTravelersCount?: number
  averageRating?: number
  reviewCount?: number

  // Portfolio & rules
  showInPortfolio?: boolean

  // Feature flags
  isPremium?: boolean
  isFamilyFriendly?: boolean
  hasGroupDiscount: boolean
  groupDiscountThreshold?: number
  groupDiscountPercent?: number
  dynamicPricing?: string
  halalDetails?: string
}

// Public listing card — no status, no rejectionReason
export interface PublicTourCardResponse {
  id: number
  title: string
  shortDescription: string | null
  category: string | null
  locationName: string | null
  region: string | null
  countryCode: string
  basePrice: number
  currency: string
  halalFriendly: boolean
  instantBook: boolean
  guideId: number
  guideDisplayName: string
  guideAvatarUrl?: string | null
  guideVerified: boolean
  coverImageUrl: string | null
  city: string | null
  nextOccurrenceStartUtc: string | null
  averageRating: number | null
  reviewCount: number | null
  durationHours: number | null
  durationMinutes: number | null
  isPremium?: boolean
  isFamilyFriendly?: boolean
  hasGroupDiscount?: boolean
}

// Public tour detail — full info including media and occurrences
export interface PublicTourDetailResponse {
  id: number
  title: string
  description: string
  shortDescription: string | null
  category: string | null
  locationName: string | null
  region: string | null
  countryCode: string
  meetingPointName: string | null
  meetingPointAddress: string | null
  meetingPointInstructions: string | null
  meetingLatitude: number | null
  meetingLongitude: number | null
  itinerary: string | null
  inclusions: string | null
  exclusions: string | null
  requirements: string | null
  whatToBring: string | null
  basePrice: number
  currency: string
  minCapacity: number
  maxCapacity: number
  instantBook: boolean
  isRecurring: boolean
  recurrencePattern: RecurrencePattern
  recurringDays: string | null
  recurringUntil: string | null
  recurringDates: string | null
  excludedDates: string | null
  halalFriendly: boolean
  tags: string | null
  languages: string | null
  guideId: number
  guideDisplayName: string
  guideAvatarUrl?: string | null
  guideVerified: boolean
  durationHours: number | null
  durationMinutes: number | null
  status: TourTemplateStatus
  media: TourMediaResponse[]
  city: string | null
  occurrences: TourOccurrenceResponse[]
  averageRating: number | null
  reviewCount: number | null
  isPremium?: boolean
  isFamilyFriendly?: boolean
  hasGroupDiscount?: boolean
}

// Portfolio card — shown on guide's public profile
export interface GuidePortfolioTourResponse {
  id: number
  title: string
  shortDescription: string | null
  category: string | null
  locationName: string | null
  region: string | null
  basePrice: number
  currency: string
  halalFriendly: boolean
  coverImageUrl: string | null
  city: string | null
  completedRunCount: number
  totalTravelersCount: number
  averageRating: number | null
  reviewCount: number | null
  status: TourTemplateStatus
  currentlyAvailable: boolean   // NOTE: backend serializes isCurrentlyAvailable as currentlyAvailable
  lastPublishedAtUtc: string | null
}

// Portfolio detail — full case-study view
export interface GuidePortfolioTourDetailResponse {
  id: number
  guideId: number
  guideDisplayName: string
  guideAvatarUrl?: string | null
  guideVerified: boolean
  title: string
  description: string
  shortDescription: string | null
  category: string | null
  locationName: string | null
  region: string | null
  countryCode: string
  meetingPointName: string | null
  meetingPointAddress: string | null
  meetingPointInstructions: string | null
  itinerary: string | null
  inclusions: string | null
  exclusions: string | null
  requirements: string | null
  whatToBring: string | null
  basePrice: number
  currency: string
  minCapacity: number
  maxCapacity: number
  halalFriendly: boolean
  instantBook: boolean
  recurringDates: string | null
  excludedDates: string | null
  tags: string | null
  languages: string | null
  durationHours: number | null
  durationMinutes: number | null
  media: TourMediaResponse[]
  city: string | null
  status: TourTemplateStatus
  currentlyAvailable: boolean
  relatedPublishedTourId: number | null
  lastPublishedAtUtc: string | null
  completedRunCount: number
  totalTravelersCount: number
  averageRating: number | null
  reviewCount: number | null
  completedRuns: CompletedRunSummary[]
}

export interface CompletedRunSummary {
  occurrenceId: number
  startTimeUtc: string
  endTimeUtc: string
  attendeeCount: number
}

export interface BookingResponse {
  id: number
  occurrenceId: number
  tourTitle: string
  tourCoverImageUrl: string | null
  startTimeUtc: string
  endTimeUtc: string
  meetingPointName: string | null
  status: BookingStatus
  bookingMode: string
  peopleCount: number
  finalPrice: number
  currency: string
  qrCode: string | null
  cancellationReason: string | null
  refundPercent: number | null
  createdAtUtc: string
}

export interface GuideBookingResponse {
  id: number
  occurrenceId: number
  tourTitle: string
  startTimeUtc: string
  endTimeUtc: string
  status: BookingStatus
  bookingMode: string
  peopleCount: number
  finalPrice: number
  currency: string
  createdAtUtc: string
  traveler: {
    id: number
    fullName: string
    phoneE164: string
    email: string
  } | null
}

// ── Request types ────────────────────────────────────────────────────────────

export interface CreateTourTemplateRequest {
  title: string
  description: string
  shortDescription?: string
  category?: string
  locationName?: string
  city?: string
  region?: string
  countryCode?: string          // defaults to 'LB'
  meetingPointName?: string
  meetingLatitude?: number
  meetingLongitude?: number
  meetingPointAddress?: string
  meetingPointInstructions?: string
  itinerary?: string
  inclusions?: string
  exclusions?: string
  requirements?: string
  whatToBring?: string
  tags?: string
  languages?: string
  durationHours?: number
  durationMinutes?: number
  basePrice: number
  currency?: string             // defaults to 'USD'
  minCapacity: number
  maxCapacity: number
  instantBook?: boolean
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern
  recurringDays?: string
  recurringUntil?: string
  recurringDates?: string
  excludedDates?: string
  halalFriendly?: boolean
  autoCancelIfMinNotMet?: boolean
  showInPortfolio?: boolean
  isPremium?: boolean
  isFamilyFriendly?: boolean
  hasGroupDiscount?: boolean
}

export interface UpdateTourTemplateRequest {
  title?: string
  description?: string
  shortDescription?: string
  category?: string
  locationName?: string
  city?: string
  region?: string
  countryCode?: string
  meetingPointName?: string
  meetingLatitude?: number
  meetingLongitude?: number
  meetingPointAddress?: string
  meetingPointInstructions?: string
  itinerary?: string
  inclusions?: string
  exclusions?: string
  requirements?: string
  whatToBring?: string
  tags?: string
  languages?: string
  durationHours?: number
  durationMinutes?: number
  basePrice?: number
  currency?: string
  minCapacity?: number
  maxCapacity?: number
  instantBook?: boolean
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern
  recurringDays?: string
  recurringUntil?: string
  recurringDates?: string
  excludedDates?: string
  halalFriendly?: boolean
  autoCancelIfMinNotMet?: boolean
  showInPortfolio?: boolean
}

export interface CreateOccurrenceRequest {
  startTimeUtc: string   // ISO 8601 e.g. "2026-06-01T08:00:00Z"
  endTimeUtc: string
}

export interface UpdateOccurrenceRequest {
  startTimeUtc?: string
  endTimeUtc?: string
  status?: TourOccurrenceStatus  // guide can set CANCELLED or COMPLETED only
}

export interface CreateBookingRequest {
  occurrenceId: number
  peopleCount: number
  waiverSigned: boolean
}

// ── Public filter params ─────────────────────────────────────────────────────

export interface PublicTourFilters {
  regions?: string | string[]
  cities?: string | string[]
  category?: string
  query?: string
  halalFriendly?: boolean
  instantBook?: boolean
  minPrice?: number
  maxPrice?: number
  minDuration?: number
  maxDuration?: number
  minCap?: number
  maxCap?: number
  minRating?: number
  isPremium?: boolean
  isFamilyFriendly?: boolean
  hasGroupDiscount?: boolean
  language?: string
  sortBy?: 'newest' | 'price_asc' | 'price_desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface GetTourReviewsParams {
  tourId: number
  page?: number
  limit?: number
}
