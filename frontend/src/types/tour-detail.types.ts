// ============================================================================
// TOUR DETAIL TYPES - PHASE 1, CARD 7
// ============================================================================
// LOCATION: /frontend/src/types/tour-detail.types.ts
// 
// PURPOSE: Type definitions for Tour Detail Page
// 
// BUSINESS REQUIREMENTS (from project spec):
// 1. Visual itinerary with map points
// 2. Guide portfolio with verification status
// 3. Halal certification info
// 4. Dynamic pricing breakdown
// 5. Group discount display
// 6. Waitlist indication
// 7. Review system with guide replies
// 
// DESIGN PHILOSOPHY:
// - Extends TourCardData from search results
// - Adds detail-specific fields only
// - Prepared for Phase 2 API integration
// ============================================================================

import { Country, City, Language } from '@/src/components/search/types/filters.types'

// ============================================================================
// ENUMS - Tour-specific statuses
// ============================================================================

export enum BookingMode {
    INSTANT = 'instant',
    REQUEST = 'request'
}

export enum TourStatus {
    SCHEDULED = 'scheduled',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    WAITLIST = 'waitlist'
}

export enum RecurrencePattern {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    CUSTOM = 'custom'
}

// ============================================================================
// INTERFACES - Tour Detail Data Structure
// ============================================================================

/**
 * Tour itinerary stop
 * Maps to ERD: TourMapPoint
 */
export interface ItineraryStop {
    id: string
    orderIndex: number
    title: string
    description: string
    duration: string // e.g., "1 hour"
    location?: {
        lat: number
        lng: number
        name: string
    }
    image?: string
}

/**
 * Tour media gallery item
 * Maps to ERD: TourMedia
 */
export interface TourMedia {
    id: string
    type: 'image' | 'video'
    url: string
    thumbnail?: string
    caption?: string
    displayOrder: number
}

/**
 * Detailed guide information
 * Maps to ERD: GuideProfile
 */
export interface GuideDetail {
    id: string
    name: string
    avatar: string
    coverImage?: string
    bio: string
    languages: Array<{
        language: Language
        proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native'
    }>
    responseRate: number // percentage
    responseTime: string // e.g., "< 1 hour"
    totalReviews: number
    averageRating: number
    totalTravelers: number
    totalTrips: number
    verifiedAt: string // ISO date
    memberSince: string // ISO date
    badges: Array<{
        type: 'top_rated' | 'super_guide' | 'halal_specialist' | 'family_expert'
        label: string
        earnedAt: string
    }>
    impactScore: number
    completedTrips: number
}

/**
 * Pricing breakdown
 * Maps to ERD: PricingEngine rules
 */
export interface PriceBreakdown {
    basePrice: number
    currency: 'USD' | 'TRY' | 'LBP'

    // Dynamic multipliers
    weekendMultiplier?: number
    holidayMultiplier?: number
    rushMultiplier?: number

    // Discounts
    groupDiscount?: {
        threshold: number // e.g., 4 people
        percent: number // e.g., 5%
        applied: boolean
    }
    travelerTierDiscount?: {
        tier: 'bronze' | 'silver' | 'gold' | 'platinum'
        percent: number
        applied: boolean
    }
    promoCode?: {
        code: string
        percent: number
        guideFunded: boolean
    }

    // Totals
    subtotal: number
    platformFee: number
    total: number

    // Original price before discounts
    originalTotal?: number
    savingsAmount?: number
}

/**
 * Review with guide reply
 * Maps to ERD: Review
 */
export interface ReviewDetail {
    id: string
    bookingId: number
    tourTemplateId: number
    occurrenceId: number
    travelerId: string
    travelerName: string
    travelerAvatarUrl?: string | null
    travelerTier?: string | null
    ratingOverall: number      // Headline rating (1-5)
    ratingGuide?: number       // Performance sub-rating
    ratingTour?: number        // Experience sub-rating
    ratingValue?: number       // Value sub-rating
    comment: string | null
    createdAt: string          // ISO 8601 UTC
    tourDate: string           // ISO 8601 UTC
    tourTitle?: string

    // Guide reply
    guideReply?: string | null | {
        comment: string
        createdAt: string
    }
    guideRepliedAt?: string | null

    // Helpful votes
    helpfulCount: number
    isHelpful: boolean         // Whether the current traveler marked it helpful

    // Images attached to review (future)
    images?: string[]
}

/**
 * Complete tour detail response
 * This is what the API will return in Phase 2
 */
export interface TourDetail {
    // Core tour info (extends TourCardData)
    id: string
    title: string
    description: string
    location: string
    city: City
    country: Country
    duration: string
    durationHours: number
    durationMinutes: number
    tags: string | null
    languages: string | null

    // Media
    mainImage: string
    gallery: TourMedia[]

    // Guide
    guide: GuideDetail

    // Capacity & Booking
    minCapacity: number
    maxCapacity: number
    currentBookings: number
    availableSpots: number
    bookingMode: BookingMode
    isHalalCertified: boolean
    halalCertificationDetails?: string

    // Pricing
    basePrice: number
    currency: 'USD' | 'TRY' | 'LBP'
    priceBreakdown?: PriceBreakdown

    // Schedule
    nextAvailableDate?: string
    upcomingDates?: Array<{
        id: number
        date: string
        availableSpots: number
        price?: number
        waitlistCount?: number
    }>
    isRecurring: boolean
    recurrencePattern?: RecurrencePattern

    // Itinerary
    itinerary: ItineraryStop[]
    meetingPoint: {
        name: string
        address: string
        lat?: number
        lng?: number
        instructions?: string
    }

    // What's included
    inclusions: string[]
    exclusions: string[]

    // Requirements
    requirements?: string[]
    whatToBring?: string[]

    // Cancellation policy
    cancellationPolicy: {
        fullRefund: number // hours before tour
        partialRefund: number // hours before tour
        partialRefundPercent: number
        noRefund: number // hours before tour
    }

    // Safety
    safetyMeasures?: string[]

    // Status
    status: TourStatus
    isVerified: boolean

    // Reviews
    averageRating: number
    totalReviews: number
    reviewSummary?: {
        fiveStar: number
        fourStar: number
        threeStar: number
        twoStar: number
        oneStar: number
    }

    // Waitlist
    waitlistCount?: number
    isWaitlistAvailable: boolean

    // Metadata
    createdAt: string
    updatedAt: string
    viewCount: number
    savedCount: number
}

// ============================================================================
// PROPS FOR COMPONENTS
// ============================================================================

export interface TourHeroProps {
    id: number
    title: string
    location: string
    country: Country
    mainImage: string
    gallery: TourMedia[]
    averageRating: number
    totalReviews: number
    isHalalCertified: boolean
    bookingMode: BookingMode
    status: TourStatus
    isPremium?: boolean
    isFamilyFriendly?: boolean
    hasGroupDiscount?: boolean
}

export interface TourInfoProps {
    description: string
    itinerary: ItineraryStop[]
    inclusions: string[]
    exclusions: string[]
    requirements?: string[]
    whatToBring?: string[]
    meetingPoint: TourDetail['meetingPoint']
    safetyMeasures?: string[]
    isHalalCertified: boolean
    halalCertificationDetails?: string
    tags?: string[]
    languages?: string[]
    durationHours?: number
    durationMinutes?: number
    occurrences?: any[]
}

import { PublicActiveBookingResponse, PublicActiveWaitlistResponse } from '@/src/lib/types/tour.types'

export interface BookingCardProps {
    basePrice: number
    currency: string
    priceBreakdown?: PriceBreakdown
    minCapacity: number
    maxCapacity: number
    availableSpots: number
    bookingMode: BookingMode
    nextAvailableDate?: string
    upcomingDates?: TourDetail['upcomingDates']
    isWaitlistAvailable: boolean
    waitlistCount?: number
    cancellationPolicy: TourDetail['cancellationPolicy']
    hasGroupDiscount?: boolean
    groupDiscountThreshold?: number
    groupDiscountPercent?: number
    dynamicPricing?: {
        enabled: boolean
        weekendMultiplier?: number
        holidayMultiplier?: number
    }
    onBookNow: (date: string, people: number, waiverSigned: boolean) => void
    onRequestBooking: (date: string, people: number, waiverSigned: boolean, message?: string) => void
    onJoinWaitlist: (date: string, people: number) => void
    onLeaveWaitlist?: (waitlistId: number) => Promise<void>
    isLoading?: boolean
    activeBookings?: PublicActiveBookingResponse[]
    activeWaitlistEntries?: PublicActiveWaitlistResponse[]
    onUpdateBooking?: (bookingId: number, occurrenceId: number, peopleCount: number, confirmWaitlist?: boolean) => Promise<void>
    onCancelBooking?: (bookingId: number) => Promise<void>
}

export interface GuideProfileCardProps {
    guide: GuideDetail
}

export interface ReviewListProps {
    reviews: ReviewDetail[]
    averageRating: number
    totalReviews: number
    reviewSummary?: TourDetail['reviewSummary']
    tourGuideId: string | number // Added to restrict reply visibility
    tourId: string | number      // Added for navigation to full reviews page
    isFullPage?: boolean        // To hide "Read all" button when already on full page
    onLoadMore?: () => void
    hasMore?: boolean
}

export interface SimilarToursProps {
    currentTourId: string
    city: City
    country: Country
    category?: string
    limit?: number
}

// ============================================================================
// MOCK DATA FOR PHASE 1
// ============================================================================
// 
// This simulates what we'll receive from the backend in Phase 2.
// Replace with actual API call: /api/tours/:id
// ============================================================================

export const MOCK_TOUR_DETAIL: TourDetail = {
    id: '1',
    title: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
    description: `Step back in time and explore the heart of the Ottoman Empire. This comprehensive tour takes you through Istanbul's most iconic landmarks, revealing 500 years of imperial history.

    Begin at the magnificent Hagia Sophia, where Byzantine mosaics meet Islamic calligraphy. Your expert guide will explain how this architectural marvel transformed from cathedral to mosque to museum, symbolizing Istanbul's unique position between East and West.
    
    Continue to Topkapi Palace, the opulent residence of Ottoman sultans for nearly 400 years. Wander through courtyards, harem quarters, and treasury rooms filled with imperial treasures. See the Sacred Relics, including artifacts from Prophet Muhammad (PBUH).
    
    Throughout the tour, enjoy halal-friendly lunch at a century-old restaurant, with prayer break accommodation.`,

    location: 'Istanbul',
    city: City.ISTANBUL,
    country: Country.TURKEY,
    duration: '4 hours',
    durationHours: 4,
    durationMinutes: 0,
    tags: 'History,Culture,Architecture',
    languages: 'English,Arabic,Turkish',

    mainImage: '/images/tours/istanbul-ottoman.jpg',
    gallery: [
        {
            id: 'g1',
            type: 'image',
            url: '/images/tours/istanbul-ottoman-1.jpg',
            caption: 'Hagia Sophia interior with calligraphy',
            displayOrder: 1
        },
        {
            id: 'g2',
            type: 'image',
            url: '/images/tours/istanbul-ottoman-2.jpg',
            caption: 'Topkapi Palace courtyard',
            displayOrder: 2
        },
        {
            id: 'g3',
            type: 'image',
            url: '/images/tours/istanbul-ottoman-3.jpg',
            caption: 'Sacred Relics chamber',
            displayOrder: 3
        },
        {
            id: 'g4',
            type: 'video',
            url: '/images/tours/istanbul-ottoman-preview.mp4',
            thumbnail: '/images/tours/istanbul-ottoman-thumb.jpg',
            caption: 'Preview of the tour experience',
            displayOrder: 4
        }
    ],

    guide: {
        id: 'guide-123',
        name: 'Mehmet Yilmaz',
        avatar: '/images/guides/mehmet.jpg',
        coverImage: '/images/guides/mehmet-cover.jpg',
        bio: `Salam! I'm Mehmet, a licensed historian and Istanbul native. I've been guiding travelers through the city's rich Islamic heritage for over 8 years. My passion is showing how Ottoman history connects to our modern understanding of faith and culture.
      
      I specialize in halal-friendly tours, ensuring Muslim travelers feel comfortable with prayer accommodations, halal food options, and gender-sensitive guiding when requested.
      
      Member of the Turkish Tourist Guides Association and certified in Ottoman Paleography.`,
        languages: [
            { language: Language.ENGLISH, proficiency: 'native' },
            { language: Language.ARABIC, proficiency: 'advanced' },
            { language: Language.TURKISH, proficiency: 'native' },
            { language: Language.FRENCH, proficiency: 'intermediate' }
        ],
        responseRate: 98,
        responseTime: '< 1 hour',
        totalReviews: 128,
        averageRating: 4.9,
        totalTravelers: 1243,
        totalTrips: 156,
        verifiedAt: '2024-01-15T10:00:00Z',
        memberSince: '2023-06-01T00:00:00Z',
        badges: [
            {
                type: 'top_rated',
                label: 'Top Rated Guide',
                earnedAt: '2024-06-01T00:00:00Z'
            },
            {
                type: 'super_guide',
                label: 'Super Guide',
                earnedAt: '2024-12-01T00:00:00Z'
            },
            {
                type: 'halal_specialist',
                label: 'Halal Tourism Specialist',
                earnedAt: '2024-03-15T00:00:00Z'
            }
        ],
        impactScore: 87,
        completedTrips: 156
    },

    minCapacity: 2,
    maxCapacity: 8,
    currentBookings: 3,
    availableSpots: 5,
    bookingMode: BookingMode.INSTANT,
    isHalalCertified: true,
    halalCertificationDetails: 'Certified by the Halal Tourism Association of Turkey. All food stops are halal-certified, prayer spaces are identified along the route, and guides are trained in Muslim traveler needs.',

    basePrice: 89,
    currency: 'USD',

    nextAvailableDate: 'Tomorrow',
    upcomingDates: [
        { id: 101, date: '2026-02-13T09:00:00Z', availableSpots: 5 },
        { id: 102, date: '2026-02-14T09:00:00Z', availableSpots: 3 },
        { id: 103, date: '2026-02-15T09:00:00Z', availableSpots: 6 },
        { id: 104, date: '2026-02-16T09:00:00Z', availableSpots: 4 },
        { id: 105, date: '2026-02-17T09:00:00Z', availableSpots: 7 }
    ],
    isRecurring: true,
    recurrencePattern: RecurrencePattern.DAILY,

    itinerary: [
        {
            id: 'i1',
            orderIndex: 1,
            title: 'Meeting at Sultanahmet Square',
            description: 'Meet your guide at the fountain in Sultanahmet Square. Look for the orange umbrella. Your guide will provide a brief overview of the tour.',
            duration: '15 minutes',
            location: {
                lat: 41.0055,
                lng: 28.9769,
                name: 'Sultanahmet Square'
            }
        },
        {
            id: 'i2',
            orderIndex: 2,
            title: 'Hagia Sophia',
            description: 'Skip-the-line entry to Hagia Sophia. Explore the upper gallery, imperial gate, and the mihrab area. Learn about the building\'s conversion and its significance in Islamic history.',
            duration: '1.5 hours'
        },
        {
            id: 'i3',
            orderIndex: 3,
            title: 'Tea & Prayer Break',
            description: 'Enjoy traditional Turkish tea at a local cafe. Prayer space available nearby.',
            duration: '30 minutes'
        },
        {
            id: 'i4',
            orderIndex: 4,
            title: 'Topkapi Palace',
            description: 'Visit the Imperial Council, Treasury, and Sacred Relics department. See the cloak and sword of Prophet Muhammad (PBUH).',
            duration: '1.5 hours'
        },
        {
            id: 'i5',
            orderIndex: 5,
            title: 'Halal Lunch',
            description: 'Lunch at a century-old restaurant serving Ottoman cuisine. All meat is halal-certified. Vegetarian options available.',
            duration: '45 minutes'
        },
        {
            id: 'i6',
            orderIndex: 6,
            title: 'Tour Conclusion',
            description: 'Return to Sultanahmet Square. Your guide will provide recommendations for evening activities and assist with directions.',
            duration: '15 minutes'
        }
    ],

    meetingPoint: {
        name: 'Sultanahmet Square Fountain',
        address: 'Binbirdirek, Sultanahmet Meydanı, 34122 Fatih/İstanbul, Turkey',
        lat: 41.0055,
        lng: 28.9769,
        instructions: 'Look for the guide holding an orange sign with "SafariHub". Arrive 10 minutes before start time.'
    },

    inclusions: [
        'Professional licensed guide',
        'Skip-the-line entry tickets',
        'Halal-certified lunch',
        'Tea/coffee break',
        'Headphones (for groups of 4+)',
        'All taxes and fees'
    ],

    exclusions: [
        'Hotel pickup and drop-off',
        'Personal expenses',
        'Gratuities (optional)',
        'Additional drinks'
    ],

    requirements: [
        'Modest dress code required for mosques (women: headscarf, long skirt/pants; men: long pants)',
        'Comfortable walking shoes recommended',
        'Valid ID/passport for ticket verification'
    ],

    whatToBring: [
        'Camera',
        'Water bottle',
        'Sunscreen (summer months)',
        'Umbrella (winter months)'
    ],

    cancellationPolicy: {
        fullRefund: 48,
        partialRefund: 24,
        partialRefundPercent: 50,
        noRefund: 24
    },

    safetyMeasures: [
        'Guide trained in first aid',
        'Group size limited to 8 for personalized attention',
        'Emergency contact provided',
        'Tour route avoids high-crime areas'
    ],

    status: TourStatus.SCHEDULED,
    isVerified: true,

    averageRating: 4.9,
    totalReviews: 128,
    reviewSummary: {
        fiveStar: 98,
        fourStar: 25,
        threeStar: 4,
        twoStar: 1,
        oneStar: 0
    },

    waitlistCount: 3,
    isWaitlistAvailable: true,

    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    viewCount: 3452,
    savedCount: 189
}

export const MOCK_REVIEWS: ReviewDetail[] = [
    {
        id: 'r1',
        bookingId: 101,
        tourTemplateId: 1,
        occurrenceId: 101,
        travelerId: 't1',
        travelerName: 'Ahmed Khan',
        travelerAvatarUrl: '/images/travelers/ahmed.jpg',
        travelerTier: 'gold',
        ratingOverall: 5,
        comment: 'Mehmet was an exceptional guide! His knowledge of Ottoman history is deep, and he answered all our questions with patience. The halal lunch was delicious and he made sure we had time for prayers. Truly a 5-star experience.',
        createdAt: '2026-02-01T14:30:00Z',
        tourDate: '2026-01-30T09:00:00Z',
        guideReply: {
            comment: 'JazakAllah khair, Ahmed! It was a pleasure hosting you and your family. Hope to see you again in Istanbul!',
            createdAt: '2026-02-02T09:15:00Z'
        },
        helpfulCount: 12,
        isHelpful: false,
        images: [
            '/images/reviews/ahmed-1.jpg',
            '/images/reviews/ahmed-2.jpg'
        ]
    },
    {
        id: 'r2',
        bookingId: 102,
        tourTemplateId: 1,
        occurrenceId: 102,
        travelerId: 't2',
        travelerName: 'Fatima Al-Zahra',
        travelerAvatarUrl: '/images/travelers/fatima.jpg',
        travelerTier: 'silver',
        ratingOverall: 5,
        comment: 'As a solo female traveler, I appreciated Mehmet\'s professionalism and respect for boundaries. The Sacred Relics section at Topkapi was moving. Highly recommended for Muslim travelers!',
        createdAt: '2026-01-25T11:20:00Z',
        tourDate: '2026-01-23T09:00:00Z',
        helpfulCount: 8,
        isHelpful: true
    },
    {
        id: 'r3',
        bookingId: 103,
        tourTemplateId: 1,
        occurrenceId: 103,
        travelerId: 't3',
        travelerName: 'Omar Farooq',
        travelerAvatarUrl: '/images/travelers/omar.jpg',
        ratingOverall: 4,
        comment: 'Great tour overall. The only reason for 4 stars is that the lunch spot was a bit crowded. However, the food was excellent and Mehmet\'s stories about the Ottoman court were fascinating.',
        createdAt: '2026-01-18T16:45:00Z',
        tourDate: '2026-01-16T09:00:00Z',
        guideReply: {
            comment: 'Thank you Omar! I appreciate your feedback about the restaurant. I\'m exploring alternative halal lunch options with同等 quality. Hope to welcome you again!',
            createdAt: '2026-01-19T10:30:00Z'
        },
        helpfulCount: 3,
        isHelpful: false
    }
]

// ============================================================================
// SIMILAR TOURS MOCK DATA
// ============================================================================

export const MOCK_SIMILAR_TOURS = [
    {
        id: '3',
        title: 'Cappadocia Sunrise Balloon & Valley Hike',
        location: 'Cappadocia',
        country: Country.TURKEY,
        mainImage: '/images/tours/cappadocia-balloon.jpg',
        guideName: 'Ahmet Demir',
        guideVerified: true,
        price: 199,
        currency: 'USD',
        rating: 5.0,
        reviewCount: 256,
        halalCertified: false,
        duration: '6 hours'
    },
    {
        id: '5',
        title: 'Bosphorus Sunset Cruise with Dinner',
        location: 'Istanbul',
        country: Country.TURKEY,
        mainImage: '/images/tours/bosphorus-cruise.jpg',
        guideName: 'Zeynep Kaya',
        guideVerified: true,
        price: 129,
        currency: 'USD',
        rating: 4.9,
        reviewCount: 178,
        halalCertified: true,
        duration: '4 hours'
    },
    {
        id: '7',
        title: 'Grand Bazaar Shopping & History Tour',
        location: 'Istanbul',
        country: Country.TURKEY,
        mainImage: '/images/tours/grand-bazaar.jpg',
        guideName: 'Mehmet Yilmaz',
        guideVerified: true,
        price: 65,
        currency: 'USD',
        rating: 4.8,
        reviewCount: 94,
        halalCertified: true,
        duration: '2 hours'
    }
]