// ============================================================================
// TOURS API SERVICE - PHASE 2 PREPARATION
// ============================================================================
// LOCATION: /frontend/src/lib/api/tours.ts
// 
// PURPOSE: Centralized API calls for all tour-related operations
// 
// WHY THIS FILE EXISTS:
// ---------------------
// 1. Single source of truth for all tour API endpoints
// 2. Prepares codebase for Phase 2 backend integration
// 3. Consistent error handling across all tour operations
// 4. Type-safe responses with proper TypeScript interfaces
// 
// PHASE 1 vs PHASE 2:
// -------------------
// PHASE 1: Returns mock data from types files
// PHASE 2: Replace with actual fetch() calls to Spring Boot backend
// 
// MIGRATION PATH:
// 1. Keep mock data during Phase 1 development
// 2. Replace mockToursPromise with actual API call in Phase 2
// 3. Error handling remains the same
// ============================================================================

import { 
  TourDetail, 
  ReviewDetail,
  MOCK_TOUR_DETAIL,
  MOCK_REVIEWS,
  MOCK_SIMILAR_TOURS 
} from '@/src/types/tour-detail.types'
import { Country, City } from '@/src/components/search/types/filters.types'

// ============================================================================
// TYPE DEFINITIONS - API Request/Response
// ============================================================================

export interface GetTourParams {
  /** Tour ID (from URL) */
  id: string
}

export interface GetTourReviewsParams {
  /** Tour ID */
  tourId: string
  /** Page number for pagination */
  page?: number
  /** Items per page */
  limit?: number
  /** Sort by (most_relevant, newest, highest_rating) */
  sortBy?: 'most_relevant' | 'newest' | 'highest_rating'
  /** Filter by rating (5,4,3,2,1) */
  rating?: number
}

export interface GetSimilarToursParams {
  /** Current tour ID to exclude from results */
  currentTourId: string
  /** City for location-based recommendations */
  city?: City
  /** Country for location-based recommendations */
  country?: Country
  /** Maximum number of tours to return */
  limit?: number
}

export interface SearchToursParams {
  /** Search query (text) */
  q?: string
  /** Filter by country */
  country?: Country | Country[]
  /** Filter by city */
  city?: City | City[]
  /** Minimum price (USD) */
  minPrice?: number
  /** Maximum price (USD) */
  maxPrice?: number
  /** Minimum rating */
  minRating?: number
  /** Halal certified only */
  halal?: boolean
  /** Instant booking only */
  instantBook?: boolean
  /** Verified guides only */
  verifiedGuides?: boolean
  /** Group discount available */
  groupDiscount?: boolean
  /** Available spots only */
  availableSpots?: boolean
  /** Page number */
  page?: number
  /** Items per page */
  limit?: number
  /** Sort field */
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'recommended'
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  /** Success status */
  success: boolean
  /** Response data */
  data: T
  /** Error message (if success = false) */
  error?: string
  /** Status code */
  statusCode: number
}

export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[]
  /** Total number of items (for pagination) */
  total: number
  /** Current page */
  page: number
  /** Items per page */
  limit: number
  /** Total number of pages */
  totalPages: number
  /** Has next page */
  hasNext: boolean
  /** Has previous page */
  hasPrev: boolean
}

// ============================================================================
// MOCK PROMISES - Phase 1 only
// ============================================================================
// 
// These simulate async API calls with realistic network delay.
// Replace with actual fetch() calls in Phase 2.
// ============================================================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockToursPromise = async <T,>(data: T, shouldFail = false): Promise<T> => {
  // Simulate network latency (300-800ms)
  await delay(Math.random() * 500 + 300)
  
  // Simulate random failures (10% chance)
  if (shouldFail && Math.random() < 0.1) {
    throw new Error('Network error: Failed to fetch tour data')
  }
  
  return data
}

// ============================================================================
// TOUR API ENDPOINTS
// ============================================================================

/**
 * Get detailed tour information by ID
 * 
 * @param params - Tour ID parameters
 * @returns Promise with tour details
 * 
 * @example
 * const tour = await getTourById({ id: '1' })
 * console.log(tour.title) // 'Ottoman Heritage: Topkapi Palace & Hagia Sophia'
 */
export async function getTourById({ id }: GetTourParams): Promise<TourDetail | null> {
  try {
    // ========================================
    // PHASE 1: Return mock data
    // ========================================
    const data = await mockToursPromise(MOCK_TOUR_DETAIL)
    
    // Simulate 404 if ID doesn't match (for testing)
    if (id !== '1' && id !== MOCK_TOUR_DETAIL.id) {
      return null
    }
    
    return data
    
    // ========================================
    // PHASE 2: Replace with actual API call
    // ========================================
    // const response = await fetch(`/api/tours/${id}`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   // Next.js 15+ caching strategy
    //   next: {
    //     revalidate: 3600, // Revalidate every hour
    //     tags: [`tour-${id}`] // For on-demand revalidation
    //   }
    // })
    // 
    // if (!response.ok) {
    //   if (response.status === 404) return null
    //   throw new Error(`API error: ${response.status}`)
    // }
    // 
    // const result: ApiResponse<TourDetail> = await response.json()
    // return result.data
    
  } catch (error) {
    // Log to monitoring service in Phase 2
    console.error(`[API] Failed to fetch tour ${id}:`, error)
    throw error
  }
}

/**
 * Get reviews for a specific tour
 * 
 * @param params - Tour ID and pagination parameters
 * @returns Promise with paginated reviews
 * 
 * @example
 * const { items, total, hasNext } = await getTourReviews({
 *   tourId: '1',
 *   page: 1,
 *   limit: 10
 * })
 */
export async function getTourReviews({
  tourId,
  page = 1,
  limit = 10,
  sortBy = 'most_relevant',
  rating
}: GetTourReviewsParams): Promise<PaginatedResponse<ReviewDetail>> {
  try {
    // ========================================
    // PHASE 1: Return mock data with pagination
    // ========================================
    let reviews = [...MOCK_REVIEWS]
    
    // Filter by rating if specified
    if (rating) {
      reviews = reviews.filter(r => r.rating === rating)
    }
    
    // Sort reviews
    if (sortBy === 'newest') {
      reviews = reviews.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } else if (sortBy === 'highest_rating') {
      reviews = reviews.sort((a, b) => b.rating - a.rating)
    }
    
    // Paginate
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedReviews = reviews.slice(start, end)
    
    await delay(400) // Simulate network
    
    return {
      items: paginatedReviews,
      total: reviews.length,
      page,
      limit,
      totalPages: Math.ceil(reviews.length / limit),
      hasNext: end < reviews.length,
      hasPrev: page > 1
    }
    
  } catch (error) {
    console.error(`[API] Failed to fetch reviews for tour ${tourId}:`, error)
    throw error
  }
}

/**
 * Get similar tours based on location
 * 
 * @param params - Current tour ID and location filters
 * @returns Promise with array of similar tours
 * 
 * @example
 * const similar = await getSimilarTours({
 *   currentTourId: '1',
 *   city: City.ISTANBUL,
 *   limit: 4
 * })
 */
export async function getSimilarTours({
  currentTourId,
  city,
  country,
  limit = 4
}: GetSimilarToursParams): Promise<TourDetail[]> {
  try {
    // ========================================
    // PHASE 1: Return filtered mock data
    // ========================================
    let similar = MOCK_SIMILAR_TOURS
    
    // Filter by location
    if (city) {
      similar = similar.filter(t => t.location.toLowerCase().includes(city.toLowerCase()))
    } else if (country) {
      similar = similar.filter(t => t.country === country)
    }
    
    // Exclude current tour
    similar = similar.filter(t => t.id !== currentTourId)
    
    // Limit results
    similar = similar.slice(0, limit)
    
    await delay(350)
    
    return similar as unknown as TourDetail[]
    
  } catch (error) {
    console.error('[API] Failed to fetch similar tours:', error)
    throw error
  }
}

/**
 * Search tours with filters
 * 
 * @param params - Search query and filters
 * @returns Promise with paginated tour results
 * 
 * @example
 * const results = await searchTours({
 *   q: 'istanbul',
 *   halal: true,
 *   minRating: 4,
 *   page: 1,
 *   limit: 12
 * })
 */
export async function searchTours(params: SearchToursParams): Promise<PaginatedResponse<TourDetail>> {
  try {
    // ========================================
    // PHASE 2: Actual API call
    // ========================================
    // const queryParams = new URLSearchParams()
    // Object.entries(params).forEach(([key, value]) => {
    //   if (value !== undefined && value !== null) {
    //     queryParams.append(key, String(value))
    //   }
    // })
    // 
    // const response = await fetch(`/api/tours?${queryParams.toString()}`)
    // const result: ApiResponse<PaginatedResponse<TourDetail>> = await response.json()
    // return result.data
    
    throw new Error('Search API not implemented in Phase 1')
    
  } catch (error) {
    console.error('[API] Failed to search tours:', error)
    throw error
  }
}

// ============================================================================
// BOOKING OPERATIONS (Phase 2)
// ============================================================================

/**
 * Create a new booking
 * Phase 2 implementation
 */
export async function createBooking(data: {
  tourId: string
  date: string
  peopleCount: number
  message?: string
}) {
  // Will be implemented in Phase 2
  throw new Error('Booking API not implemented in Phase 1')
}

/**
 * Join waitlist for a tour
 * Phase 2 implementation
 */
export async function joinWaitlist(data: {
  tourId: string
  date: string
  peopleCount: number
}) {
  // Will be implemented in Phase 2
  throw new Error('Waitlist API not implemented in Phase 1')
}

// ============================================================================
// CACHE INVALIDATION (Phase 2)
// ============================================================================

/**
 * Revalidate tour data on-demand
 * Next.js 15+ App Router
 */
export async function revalidateTour(id: string) {
  try {
    await fetch(`/api/revalidate?tag=tour-${id}`, {
      method: 'POST'
    })
  } catch (error) {
    console.error('Failed to revalidate tour:', error)
  }
}

// ============================================================================
// USAGE IN COMPONENTS:
// ============================================================================
// 
// ✅ IN PAGE COMPONENT (Server Component):
// const tour = await getTourById({ id })
// const reviews = await getTourReviews({ tourId: id, page: 1 })
// 
// ✅ IN CLIENT COMPONENT (with useEffect):
// useEffect(() => {
//   getTourReviews({ tourId: id })
//     .then(setReviews)
//     .catch(handleError)
// }, [id])
// 
// ✅ WITH REACT QUERY (Phase 2):
// const { data: tour } = useQuery({
//   queryKey: ['tour', id],
//   queryFn: () => getTourById({ id })
// })
// ============================================================================