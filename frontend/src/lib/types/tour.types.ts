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

// BookingStatus — exact values returned by the backend.
// IMPORTANT: 'Rejected' does NOT exist in the backend — it is a UI-only
// display label. Map it from Cancelled bookings where cancellationReason
// contains 'guide' (case-insensitive). Never send 'Rejected' to the backend.
export enum BookingStatus {
  PendingPayment = 'PendingPayment',
  PendingGuide   = 'PendingGuide',
  Confirmed      = 'Confirmed',
  InProgress     = 'InProgress',   // Guide has scanned QR / tapped check-in
  Completed      = 'Completed',
  Cancelled      = 'Cancelled',
  Waitlisted     = 'Waitlisted',
  Expired        = 'Expired',
  // UI-only display alias — never sent to the backend.
  // Derived from: status === 'Cancelled' && cancellationReason?.toLowerCase().includes('guide')
  Rejected       = 'Rejected',
}

// ── Response types (match backend DTO fields exactly) ───────────────────────

export interface TourMediaResponse {
  id: number
  mediaType: TourMediaType
  url: string
  displayOrder: number
  caption?: string | null
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
  waitlistCount: number
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
  // Geo-search results
  latitude?: number | null
  longitude?: number | null
  distanceKm?: number | null
}

export interface TourMapPointResponse {
  id: number
  latitude: number
  longitude: number
  orderIndex: number
  pointName: string | null
}

export interface TourRouteResponse {
  tourTemplateId: number
  occurrenceId: number | null
  occurrenceStartUtc: string | null
  waypoints: TourMapPointResponse[]
}


export interface PublicActiveBookingResponse {
  id: number
  status: string
  occurrenceId: number
  peopleCount: number
  finalPrice: number
  currency: string
  startTime: string
}

export interface PublicActiveWaitlistResponse {
  id: number
  occurrenceId: number
  peopleCount: number
  position: number
  createdAt: string
}

// Public tour detail — full info including media and occurrences
export interface PublicTourDetailResponse {
  id: number
  activeBookings?: PublicActiveBookingResponse[]
  activeWaitlistEntries?: PublicActiveWaitlistResponse[]
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
  groupDiscountThreshold?: number
  groupDiscountPercent?: number
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
  meetingPointName: string | null   // only populated for Confirmed/InProgress/Completed
  status: BookingStatus
  bookingMode: 'Instant' | 'Request'
  peopleCount: number
  finalPrice: number
  currency: string
  qrCode: string | null             // UUID token — only present in traveler's own booking
  cancellationReason: string | null
  refundPercent: number | null       // null until cancelled; backend computes from time window
  cancelledAtUtc: string | null      // set when booking is cancelled
  message: string | null             // traveler's note during booking
  tourId: number                     // template ID for navigation
  createdAtUtc: string
}

export interface GuideBookingResponse {
  id: number
  occurrenceId: number
  tourTitle: string
  startTimeUtc: string
  endTimeUtc: string
  status: BookingStatus
  bookingMode: 'Instant' | 'Request'
  peopleCount: number
  durationHours: number | null
  durationMinutes: number | null
  finalPrice: number
  platformFee?: number
  netEarnings?: number
  currency: string
  cancellationReason: string | null    // set if booking was cancelled or rejected
  checkedInAtUtc: string | null        // set after guide QR check-in
  completedAtUtc: string | null        // set after guide marks tour complete
  message: string | null               // traveler's note during booking
  tourId: number                       // template ID for navigation
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
  isPremium?: boolean
  isFamilyFriendly?: boolean
  hasGroupDiscount?: boolean
  groupDiscountThreshold?: number
  groupDiscountPercent?: number
  dynamicPricing?: string
  halalDetails?: string
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
  message?: string
}

// ── Waitlist ─────────────────────────────────────────────────────────────────

// Represents one traveler's active waitlist entry for a full occurrence.
// position is their rank in the queue — lower number = earlier promotion.
// promoted entries are excluded from the list response (they already have a booking).
export interface WaitlistResponse {
  id: number
  occurrenceId: number
  tourTitle: string
  startTimeUtc: string
  endTimeUtc: string
  position: number              // queue rank, 1 = next to be promoted
  peopleCount: number           // seats requested
  notified: boolean             // future notification card sets this
  promoted: boolean             // true once a booking was auto-created
  promotedAtUtc: string | null  // when promotion happened
  createdAtUtc: string
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
  // Bounding box (all 4 required)
  minLat?: number
  maxLat?: number
  minLng?: number
  maxLng?: number
  // Radius search
  lat?: number
  lng?: number
  radiusKm?: number
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

export interface UpdateBookingRequest {
  occurrenceId: number
  peopleCount: number
  confirmWaitlistTransition?: boolean
}
// ── Review types ─────────────────────────────────────────────────────────────
// These match the backend ReviewCreateRequest and ReviewResponse DTOs exactly.

/**
 * Request body for POST /api/traveler/reviews.
 * All four sub-ratings are required (1–5 each).
 * comment is optional — null means the traveler left no written feedback.
 */
export interface ReviewCreateRequest {
  bookingId:     number   // The completed booking being reviewed
  ratingOverall: number   // Overall impression — headline rating (1–5)
  ratingGuide:   number   // Guide Performance — knowledge, communication (1–5)
  ratingTour:    number   // Tour Experience — itinerary, pacing, locations (1–5)
  ratingValue:   number   // Value for Money — price vs experience (1–5)
  comment?:      string   // Optional free-text, max 1000 characters
}

/**
 * Single review as returned by the backend.
 * guideReply is null until the guide responds (future feature).
 * tourDate is when the tour happened (occurrence startTimeUtc), not createdAt.
 */
export interface ReviewResponse {
  id:               number
  bookingId:        number
  tourTemplateId:   number
  occurrenceId:     number
  ratingOverall:    number
  ratingGuide:      number
  ratingTour:       number
  ratingValue:      number
  comment:          string | null
  travelerId:       number
  travelerName:     string
  travelerAvatarUrl: string | null
  travelerTier:     string | null
  tourTitle:        string
  tourDate:         string   // ISO 8601 UTC — when the tour happened
  guideReply:       string | null
  guideRepliedAt:   string | null
  helpfulCount:     number
  isHelpful:        boolean
  createdAt:        string   // ISO 8601 UTC — when review was written
}

/**
 * Star distribution histogram — counts of reviews per rating level.
 * Maps to the frontend reviewSummary shape used by ReviewList component.
 */
export interface ReviewDistribution {
  fiveStar:   number
  fourStar:   number
  threeStar:  number
  twoStar:    number
  oneStar:    number
}

/**
 * Spring Page wrapper around ReviewResponse.
 * 'content' holds the current page items; pagination metadata is at the root.
 */
export interface ReviewPage {
  content:          ReviewResponse[]
  totalElements:    number
  totalPages:       number
  number:           number   // current page index (0-based)
  size:             number
  first:            boolean
  last:             boolean
}

/**
 * Aggregated response from GET /api/reviews/tour/{id} and GET /api/reviews/guide/{id}.
 * averageOverall is null if the guide/tour has no reviews yet.
 */
export interface ReviewSummaryResponse {
  averageOverall:  number | null
  averageGuide:    number | null
  averageTour:     number | null
  averageValue:    number | null
  totalReviews:    number
  distribution:    ReviewDistribution
  reviews:         ReviewPage
}

export interface ToggleHelpfulResponse {
  helpfulCount: number
  isHelpful:    boolean
}
