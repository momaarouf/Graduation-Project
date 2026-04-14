// ============================================================================
// USE TOUR DETAIL - CUSTOM HOOK
// ============================================================================
// LOCATION: /frontend/src/lib/hooks/useTourDetail.ts
// 
// PURPOSE: Encapsulate all tour detail data fetching logic
// 
// WHY THIS FILE EXISTS:
// ---------------------
// 1. Separates data fetching from presentation components
// 2. Reusable across multiple components
// 3. Centralized error and loading state management
// 4. Prepares for React Query migration in Phase 2
// 
// WHAT IT HANDLES:
// ---------------
// 1. Fetching tour details
// 2. Fetching paginated reviews
// 3. Fetching similar tours
// 4. Booking operations
// 5. Waitlist operations
// 6. Wishlist toggle
// ============================================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  PublicTourDetailResponse, 
  ReviewResponse,
  ReviewSummaryResponse,
  PublicTourCardResponse,
  getPublicTourDetail, 
  getTourReviews, 
  getSimilarTours,
  GetTourReviewsParams,
  PaginatedResponse
} from '@/src/lib/api/tours'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UseTourDetailProps {
  /** Tour ID from URL params */
  tourId: string
  
  /** Initial tour data for SSR */
  initialTour?: PublicTourDetailResponse | null
  
  /** Initial reviews for SSR */
  initialReviews?: ReviewSummaryResponse | null
  
  /** Enable auto-refresh (default: false) */
  enableAutoRefresh?: boolean
  
  /** Auto-refresh interval in ms (default: 30000) */
  refreshInterval?: number
}

export interface UseTourDetailReturn {
  // ======== Data ========
  /** Tour detail data */
  tour: PublicTourDetailResponse | null
  
  /** Paginated reviews */
  reviews: ReviewSummaryResponse | null
  
  /** Similar tours */
  similarTours: PublicTourCardResponse[]
  
  // ======== Loading States ========
  /** Is tour data loading */
  isLoadingTour: boolean
  
  /** Are reviews loading */
  isLoadingReviews: boolean
  
  /** Are similar tours loading */
  isLoadingSimilar: boolean
  
  /** Is any operation in progress */
  isPending: boolean
  
  // ======== Error States ========
  /** Tour error (if any) */
  tourError: Error | null
  
  /** Reviews error (if any) */
  reviewsError: Error | null
  
  /** Similar tours error (if any) */
  similarError: Error | null
  
  // ======== Review Pagination ========
  /** Load next page of reviews */
  loadMoreReviews: () => Promise<void>
  
  /** Load previous page of reviews */
  loadPrevReviews: () => Promise<void>
  
  /** Go to specific page */
  goToReviewPage: (page: number) => Promise<void>
  
  /** Current review page */
  currentReviewPage: number
  
  /** Has more reviews to load */
  hasMoreReviews: boolean
  
  // ======== Booking Operations ========
  /** Book now (Instant Book) */
  bookNow: (date: string, people: number) => Promise<void>
  
  /** Request to Book */
  requestBooking: (date: string, people: number, message?: string) => Promise<void>
  
  /** Join waitlist */
  joinWaitlist: (date: string, people: number) => Promise<void>
  
  // ======== Wishlist ========
  /** Is tour saved to wishlist */
  isSaved: boolean
  
  /** Toggle wishlist */
  toggleWishlist: () => void
  
  // ======== Refresh ========
  /** Refresh all data */
  refresh: () => Promise<void>
  
  /** Refresh tour data only */
  refreshTour: () => Promise<void>
  
  /** Refresh reviews only */
  refreshReviews: () => Promise<void>
}

// ============================================================================
// CUSTOM HOOK IMPLEMENTATION
// ============================================================================

export function useTourDetail({
  tourId,
  initialTour,
  initialReviews,
  enableAutoRefresh = false,
  refreshInterval = 30000
}: UseTourDetailProps): UseTourDetailReturn {
  const router = useRouter()

  // ========================================
  // STATE - Data
  // ========================================
  const [tour, setTour] = useState<PublicTourDetailResponse | null>(initialTour || null)
  const [reviews, setReviews] = useState<ReviewSummaryResponse | null>(
    initialReviews || null
  )
  const [similarTours, setSimilarTours] = useState<PublicTourCardResponse[]>([])

  // ========================================
  // STATE - Loading
  // ========================================
  const [isLoadingTour, setIsLoadingTour] = useState(!initialTour)
  const [isLoadingReviews, setIsLoadingReviews] = useState(!initialReviews)
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  // ========================================
  // STATE - Error
  // ========================================
  const [tourError, setTourError] = useState<Error | null>(null)
  const [reviewsError, setReviewsError] = useState<Error | null>(null)
  const [similarError, setSimilarError] = useState<Error | null>(null)

  // ========================================
  // STATE - Pagination
  // ========================================
  const [currentReviewPage, setCurrentReviewPage] = useState(initialReviews?.reviews.number || 0)

  // ========================================
  // STATE - UI
  // ========================================
  const [isSaved, setIsSaved] = useState(false)

  // ========================================
  // DERIVED VALUES
  // ========================================
  const isPending = isLoadingTour || isLoadingReviews || isLoadingSimilar || isBooking
  const hasMoreReviews = reviews?.reviews.last === false || false

  // ========================================
  // DATA FETCHING
  // ========================================

  /**
   * Fetch tour details
   */
  const fetchTour = useCallback(async () => {
    if (!tourId) return
    
    setIsLoadingTour(true)
    setTourError(null)
    
    try {
      const data = await getPublicTourDetail(Number(tourId))
      
      if (!data) {
        // Tour not found - redirect to 404
        router.push('/tours/not-found')
        return
      }
      
      setTour(data)
    } catch (error) {
      console.error('[useTourDetail] Failed to fetch tour:', error)
      setTourError(error instanceof Error ? error : new Error('Failed to fetch tour'))
      
      // Show error toast
      toast.error('Failed to load tour details', {
        id: 'tour-error',
        duration: 5000
      })
    } finally {
      setIsLoadingTour(false)
    }
  }, [tourId, router])

  /**
   * Fetch reviews for the tour
   */
  const fetchReviews = useCallback(async (page: number = 0) => {
    if (!tourId) return
    
    setIsLoadingReviews(true)
    setReviewsError(null)
    
    try {
      const data = await getTourReviews(tourId, {
        tourId: Number(tourId),
        page,
        limit: 10
      })
      
      setReviews(data)
      setCurrentReviewPage(page)
    } catch (error) {
      console.error('[useTourDetail] Failed to fetch reviews:', error)
      setReviewsError(error instanceof Error ? error : new Error('Failed to fetch reviews'))
    } finally {
      setIsLoadingReviews(false)
    }
  }, [tourId])

  /**
   * Fetch similar tours
   */
  const fetchSimilarTours = useCallback(async () => {
    if (!tour) return
    
    setIsLoadingSimilar(true)
    setSimilarError(null)
    
    try {
      const data = await getSimilarTours({
        currentTourId: tour.id,
        city: tour.city,
        countryCode: tour.countryCode,
        limit: 4
      })
      
      setSimilarTours(data)
    } catch (error) {
      console.error('[useTourDetail] Failed to fetch similar tours:', error)
      setSimilarError(error instanceof Error ? error : new Error('Failed to fetch similar tours'))
    } finally {
      setIsLoadingSimilar(false)
    }
  }, [tour])

  // ========================================
  // PAGINATION HANDLERS
  // ========================================

  const loadMoreReviews = useCallback(async () => {
    if (reviews && !reviews.reviews.last) {
      await fetchReviews(reviews.reviews.number + 1)
    }
  }, [reviews, fetchReviews])

  const loadPrevReviews = useCallback(async () => {
    if (reviews && !reviews.reviews.first) {
      await fetchReviews(reviews.reviews.number - 1)
    }
  }, [reviews, fetchReviews])

  const goToReviewPage = useCallback(async (page: number) => {
    await fetchReviews(page)
  }, [fetchReviews])

  // ========================================
  // BOOKING OPERATIONS (Phase 2)
  // ========================================

  const bookNow = useCallback(async (date: string, people: number) => {
    if (!tour) return
    
    setIsBooking(true)
    
    try {
      // Phase 2: API call
      // await createBooking({
      //   tourId: tour.id,
      //   date,
      //   peopleCount: people
      // })
      
      // Simulate booking for Phase 1
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Booking confirmed! Check your email for details.', {
        id: 'booking-success',
        duration: 5000,
        icon: '🎉'
      })
      
      // Redirect to booking confirmation
      router.push('/bookings/confirmation')
      
    } catch (error) {
      console.error('Booking failed:', error)
      toast.error('Booking failed. Please try again.', {
        id: 'booking-error',
        duration: 5000
      })
    } finally {
      setIsBooking(false)
    }
  }, [tour, router])

  const requestBooking = useCallback(async (date: string, people: number, message?: string) => {
    if (!tour) return
    
    setIsBooking(true)
    
    try {
      // Phase 2: API call
      // await createBooking({
      //   tourId: tour.id,
      //   date,
      //   peopleCount: people,
      //   message
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Booking request sent! The guide will respond within 24h.', {
        id: 'request-success',
        duration: 6000,
        icon: '📨'
      })
      
      router.push('/bookings')
      
    } catch (error) {
      console.error('Booking request failed:', error)
      toast.error('Failed to send request. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }, [tour, router])

  const joinWaitlist = useCallback(async (date: string, people: number) => {
    if (!tour) return
    
    setIsBooking(true)
    
    try {
      // Phase 2: API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`You've been added to the waitlist!`, {
        id: 'waitlist-success',
        duration: 5000,
        icon: '⏳'
      })
      
    } catch (error) {
      console.error('Waitlist failed:', error)
      toast.error('Failed to join waitlist. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }, [tour])

  // ========================================
  // WISHLIST
  // ========================================

  const toggleWishlist = useCallback(() => {
    setIsSaved(prev => !prev)
    
    // Show feedback
    toast.success(
      !isSaved 
        ? 'Added to your wishlist!' 
        : 'Removed from wishlist',
      { id: 'wishlist', duration: 2000 }
    )
    
    // Phase 2: API call to persist wishlist
  }, [isSaved])

  // ========================================
  // REFRESH
  // ========================================

  const refresh = useCallback(async () => {
    await Promise.all([
      fetchTour(),
      fetchReviews(currentReviewPage),
      fetchSimilarTours()
    ])
  }, [fetchTour, fetchReviews, fetchSimilarTours, currentReviewPage])

  const refreshTour = useCallback(async () => {
    await fetchTour()
  }, [fetchTour])

  const refreshReviews = useCallback(async () => {
    await fetchReviews(currentReviewPage)
  }, [fetchReviews, currentReviewPage])

  // ========================================
  // EFFECTS
  // ========================================

  // Initial data fetch
  useEffect(() => {
    if (!initialTour) {
      fetchTour()
    }
    
    if (!initialReviews) {
      fetchReviews(1)
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId])

  // Fetch similar tours when tour data is available
  useEffect(() => {
    if (tour) {
      fetchSimilarTours()
    }
  }, [tour, fetchSimilarTours])

  // Auto-refresh (for live availability)
  useEffect(() => {
    if (!enableAutoRefresh || !tourId) return
    
    const interval = setInterval(() => {
      refreshTour()
      refreshReviews()
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [enableAutoRefresh, refreshInterval, tourId, refreshTour, refreshReviews])

  // ========================================
  // RETURN
  // ========================================

  return {
    // Data
    tour,
    reviews,
    similarTours,
    
    // Loading
    isLoadingTour,
    isLoadingReviews,
    isLoadingSimilar,
    isPending,
    
    // Error
    tourError,
    reviewsError,
    similarError,
    
    // Pagination
    loadMoreReviews,
    loadPrevReviews,
    goToReviewPage,
    currentReviewPage,
    hasMoreReviews,
    
    // Booking
    bookNow,
    requestBooking,
    joinWaitlist,
    
    // Wishlist
    isSaved,
    toggleWishlist,
    
    // Refresh
    refresh,
    refreshTour,
    refreshReviews
  }
}

// ============================================================================
// USAGE IN COMPONENTS:
// ============================================================================
// 
// ✅ IN CLIENT COMPONENT:
// const {
//   tour,
//   reviews,
//   isLoadingTour,
//   bookNow,
//   joinWaitlist
// } = useTourDetail({
//   tourId: params.id,
//   initialTour: MOCK_TOUR_DETAIL, // From server component
//   enableAutoRefresh: true
// })
// 
// if (isLoadingTour) return <TourDetailLoading />
// if (tourError) throw tourError
// if (!tour) notFound()
// 
// return (
//   <TourHero tour={tour} />
//   <BookingCard 
//     onBookNow={bookNow}
//     onJoinWaitlist={joinWaitlist}
//   />
// )
// ============================================================================