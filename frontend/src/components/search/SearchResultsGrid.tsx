// ============================================================================
// SEARCH RESULTS GRID COMPONENT - DUAL THEME
// ============================================================================
// LOCATION: /frontend/src/components/search/SearchResultsGrid.tsx
// 
// PURPOSE: Display tour search results in a responsive grid layout
// 
// FIXES APPLIED (2026-02-11):
// 
// ISSUE 1: renderRating function signature mismatch
// ------------------------------------------------
// PROBLEM: Function defined as renderRating(rating, reviewCount) 
//          but called as renderRating(tour.rating)
// 
// SOLUTION: Added proper parameter passing in TourCard component
// 
// ISSUE 2: Missing reviewCount in rating display
// ------------------------------------------------
// PROBLEM: Review count was not displaying correctly
// 
// SOLUTION: Properly pass and format reviewCount in renderRating
// 
// BUSINESS REQUIREMENTS (from project spec):
// 1. Display tours with:
//    - Tour title & location
//    - Main image (with fallback)
//    - Guide name & verification badge
//    - Price (with dynamic pricing indicators)
//    - Halal badge if applicable
//    - Rating & review count
//    - Available dates / "Next available"
//    - Min/max capacity indicator
// 
// 2. Responsive grid:
//    - Mobile: 1 column
//    - Tablet: 2 columns  
//    - Desktop: 3 columns
//    - Large desktop: 4 columns
// 
// 3. Interactive:
//    - Click card → navigate to tour detail page
//    - Hover effects for better UX
//    - Loading skeleton states
//    - Empty state when no results
// 
// 4. Dual theme support:
//    - Light mode: Bright, clean cards
//    - Dark mode: Muted, deep grays
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    MapPin,
    Star,
    User,
    CheckCircle,
    Clock,
    Users,
    Heart,
    Sparkles,
    Award,
    Leaf,
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// These types define the shape of tour data that comes from the backend API
// 
// IMPORTANT: This is the V1 mock data structure. In Phase 2, this will be
// replaced with actual API responses from the backend.
// 
// The structure is designed to be:
// 1. Backward compatible - adding fields won't break existing code
// 2. Self-documenting - clear property names
// 3. Type-safe - full TypeScript support
// ============================================================================

export interface TourCardData {
    id: string
    title: string
    location: string
    country: 'lebanon' | 'turkey'
    mainImage: string
    guideName: string
    guideId: string
    guideVerified: boolean
    guideAvatar?: string
    price: {
        amount: number
        currency: 'USD' | 'TRY' | 'LBP'
        dynamicPricing?: boolean
        originalPrice?: number
        discountPercent?: number
    }
    rating: number
    reviewCount: number
    halalCertified: boolean
    nextAvailableDate?: string
    duration: string
    minCapacity: number
    maxCapacity: number
    availableSpots: number
    badges?: Array<{
        type: 'halal' | 'verified' | 'premium' | 'family' | 'group' | 'lastMinute'
        label: string
    }>
}

// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================
// This data simulates what we'll receive from the backend API in Phase 2.
// 
// DESIGN PHILOSOPHY:
// - Realistic data that mirrors actual tours in Lebanon and Turkey
// - Varied prices, ratings, and availability
// - Mix of halal-certified and non-halal tours
// - Different badge combinations
// 
// USAGE:
// Replace with actual API call in Phase 2:
// const response = await fetch('/api/tours/search?q=...')
// const data = await response.json()
// ============================================================================

export const MOCK_TOURS: TourCardData[] = [
    {
        id: '1',
        title: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
        location: 'Istanbul',
        country: 'turkey',
        mainImage: '/images/tours/istanbul-ottoman.jpg',
        guideName: 'Mehmet Yilmaz',
        guideId: 'guide-123',
        guideVerified: true,
        guideAvatar: '/images/guides/mehmet.jpg',
        price: {
            amount: 89,
            currency: 'USD',
            dynamicPricing: false
        },
        rating: 4.9,
        reviewCount: 128,
        halalCertified: true,
        nextAvailableDate: 'Tomorrow',
        duration: '4 hours',
        minCapacity: 2,
        maxCapacity: 8,
        availableSpots: 5,
        badges: [
            { type: 'halal', label: 'Halal Friendly' },
            { type: 'verified', label: 'Top Rated' }
        ]
    },
    {
        id: '2',
        title: 'Beirut Street Food & Cultural Walk',
        location: 'Beirut',
        country: 'lebanon',
        mainImage: '/images/tours/beirut-food.jpg',
        guideName: 'Layla Hassan',
        guideId: 'guide-456',
        guideVerified: true,
        price: {
            amount: 45,
            currency: 'USD',
            dynamicPricing: false
        },
        rating: 4.8,
        reviewCount: 89,
        halalCertified: true,
        nextAvailableDate: 'Today',
        duration: '3 hours',
        minCapacity: 1,
        maxCapacity: 6,
        availableSpots: 2,
        badges: [
            { type: 'halal', label: 'Halal Food' },
            { type: 'family', label: 'Family Friendly' }
        ]
    },
    {
        id: '3',
        title: 'Cappadocia Sunrise Balloon & Valley Hike',
        location: 'Cappadocia',
        country: 'turkey',
        mainImage: '/images/tours/cappadocia-balloon.jpg',
        guideName: 'Ahmet Demir',
        guideId: 'guide-789',
        guideVerified: true,
        price: {
            amount: 199,
            currency: 'USD',
            dynamicPricing: true,
            originalPrice: 249,
            discountPercent: 20
        },
        rating: 5.0,
        reviewCount: 256,
        halalCertified: false,
        nextAvailableDate: 'Fri, Mar 15',
        duration: '6 hours',
        minCapacity: 2,
        maxCapacity: 12,
        availableSpots: 7,
        badges: [
            { type: 'premium', label: 'Premium' },
            { type: 'lastMinute', label: 'Last Minute' }
        ]
    },
    {
        id: '4',
        title: 'Byblos Ancient Ruins & Archaeological Tour',
        location: 'Byblos',
        country: 'lebanon',
        mainImage: '/images/tours/byblos-ruins.jpg',
        guideName: 'Elias Khoury',
        guideId: 'guide-101',
        guideVerified: true,
        price: {
            amount: 55,
            currency: 'USD'
        },
        rating: 4.7,
        reviewCount: 67,
        halalCertified: false,
        duration: '2.5 hours',
        minCapacity: 1,
        maxCapacity: 15,
        availableSpots: 12
    },
    {
        id: '5',
        title: 'Bosphorus Sunset Cruise with Dinner',
        location: 'Istanbul',
        country: 'turkey',
        mainImage: '/images/tours/bosphorus-cruise.jpg',
        guideName: 'Zeynep Kaya',
        guideId: 'guide-202',
        guideVerified: true,
        price: {
            amount: 129,
            currency: 'USD'
        },
        rating: 4.9,
        reviewCount: 178,
        halalCertified: true,
        nextAvailableDate: 'Sat, Mar 16',
        duration: '4 hours',
        minCapacity: 4,
        maxCapacity: 20,
        availableSpots: 8,
        badges: [
            { type: 'halal', label: 'Halal Options' },
            { type: 'group', label: 'Group Discount' }
        ]
    },
    {
        id: '6',
        title: 'Bekaa Valley Heritage & Nature Tour',
        location: 'Bekaa Valley',
        country: 'lebanon',
        mainImage: '/images/tours/bekaa-heritage.jpg',
        guideName: 'Nadine Abboud',
        guideId: 'guide-303',
        guideVerified: true,
        price: {
            amount: 95,
            currency: 'USD'
        },
        rating: 4.6,
        reviewCount: 45,
        halalCertified: true,
        duration: '5 hours',
        minCapacity: 2,
        maxCapacity: 10,
        availableSpots: 4,
        badges: [
            { type: 'halal', label: 'Halal Options' },
            { type: 'verified', label: 'Nature Guide' }
        ]
    }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format price with currency
 * 
 * WHY:
 * - Different currencies display differently
 * - USD: $89
 * - TRY: ₺890
 * - LBP: ل.ل 450,000
 * 
 * FALLBACK:
 * If currency is not recognized, default to USD format
 */
const formatPrice = (amount: number, currency: string): string => {
    switch (currency) {
        case 'USD':
            return `$${amount}`
        case 'TRY':
            return `₺${amount}`
        case 'LBP':
            return `ل.ل ${amount.toLocaleString()}`
        default:
            return `$${amount}`
    }
}

/**
 * Get country flag emoji for location display
 * Visual cue for Lebanon vs Turkey tours
 */
const getCountryFlag = (country: 'lebanon' | 'turkey'): string => {
    return country === 'lebanon' ? '🇱🇧' : '🇹🇷'
}

/**
 * Render star rating as visual stars + numeric
 * 
 * FIXED: Now properly accepts both rating and reviewCount
 * 
 * DESIGN DECISION:
 * - Full stars: 1-5 scale
 * - Half-star precision for accurate ratings
 * - Gold color for premium feel
 * - Review count in parentheses
 */
const renderRating = (rating: number, reviewCount: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
        <div className="flex items-center gap-1">
            {/* Star visualization */}
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => {
                    if (i < fullStars) {
                        return (
                            <Star 
                                key={i} 
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" 
                            />
                        )
                    } else if (i === fullStars && hasHalfStar) {
                        return (
                            <div key={i} className="relative">
                                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 dark:text-gray-600" />
                                <Star className="absolute top-0 left-0 w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400 clip-half" />
                            </div>
                        )
                    } else {
                        return (
                            <Star 
                                key={i} 
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 dark:text-gray-600" 
                            />
                        )
                    }
                })}
            </div>
            
            {/* Rating number */}
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {rating.toFixed(1)}
            </span>
            
            {/* Review count */}
            <span className="text-xs text-gray-500 dark:text-gray-400">
                ({reviewCount.toLocaleString()})
            </span>
        </div>
    )
}

// ============================================================================
// TOUR CARD COMPONENT (Individual)
// ============================================================================
// 
// This component renders a single tour card within the grid.
// 
// RESPONSIBILITIES:
// 1. Display all tour information in a compact, scannable format
// 2. Handle image loading states
// 3. Show appropriate badges based on tour attributes
// 4. Link to tour detail page
// 5. Maintain consistent height across cards
// 
// DESIGN PATTERN:
// - Card-based UI with subtle shadow
// - Image at top with overlay for badges
// - Content below in consistent order
// - Price prominently displayed
// - CTA through entire card click
// ============================================================================

interface TourCardProps {
    tour: TourCardData
}

function TourCard({ tour }: TourCardProps) {
    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const [isLiked, setIsLiked] = useState(false)

    // Determine availability status color based on percentage
    const getAvailabilityColor = () => {
        const percentage = (tour.availableSpots / tour.maxCapacity) * 100
        if (percentage <= 20) return 'text-red-600 dark:text-red-400'
        if (percentage <= 50) return 'text-orange-600 dark:text-orange-400'
        return 'text-emerald-600 dark:text-emerald-400'
    }

    return (
        <Link
            href={`/tours/${tour.id}`}
            className="
                group
                relative
                flex flex-col
                bg-white dark:bg-gray-900
                rounded-xl
                overflow-hidden
                border border-gray-200 dark:border-gray-800
                hover:shadow-lg dark:hover:shadow-2xl
                transition-all duration-300
                hover:-translate-y-1
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
            "
            aria-label={`View ${tour.title} tour in ${tour.location}, guided by ${tour.guideName}`}
        >
            {/* ========================================
                IMAGE SECTION
                ========================================
                
                CRITICAL: Image handling best practices:
                1. Use Next.js Image for optimization
                2. Show skeleton while loading
                3. Fallback for broken images
                4. Aspect ratio 4:3 for consistency
            */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                {/* Loading spinner */}
                {!isImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                )}

                {/* Main image */}
                <Image
                    src={tour.mainImage}
                    alt={tour.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`
                        object-cover
                        transition-all duration-500
                        group-hover:scale-105
                        ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
                    `}
                    onLoad={() => setIsImageLoaded(true)}
                    onError={() => setIsImageLoaded(true)} // Fallback to gray background
                />

                {/* ========================================
                    IMAGE OVERLAY ELEMENTS
                    ========================================
                    
                    Positioned absolutely on top of image:
                    1. Country flag badge (top-left)
                    2. Halal certification badge (top-left, next to flag)
                    3. Save/Wishlist button (top-right)
                    4. Availability indicator (bottom-left)
                    5. Duration (bottom-right)
                */}

                {/* Country & Halal badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {/* Country flag badge */}
                    <span className="
                        inline-flex items-center gap-1
                        px-2 py-1
                        bg-white/90 dark:bg-gray-900/90
                        backdrop-blur-sm
                        rounded-full
                        text-xs font-medium
                        text-gray-700 dark:text-gray-300
                        border border-white/20 dark:border-gray-800/50
                        shadow-sm
                    ">
                        <span className="text-base">{getCountryFlag(tour.country)}</span>
                        <span className="hidden xs:inline">{tour.location}</span>
                    </span>

                    {/* Halal certification badge */}
                    {tour.halalCertified && (
                        <span className="
                            inline-flex items-center gap-1
                            px-2 py-1
                            bg-emerald-50/95 dark:bg-emerald-950/90
                            backdrop-blur-sm
                            rounded-full
                            text-xs font-medium
                            text-emerald-700 dark:text-emerald-300
                            border border-emerald-200/50 dark:border-emerald-800/50
                        ">
                            <Leaf className="w-3 h-3" />
                            <span className="hidden xs:inline">Halal</span>
                        </span>
                    )}
                </div>

                {/* Wishlist button */}
                <button
                    onClick={(e) => {
                        e.preventDefault() // Prevent navigation to tour detail
                        setIsLiked(!isLiked)
                    }}
                    className="
                        absolute top-3 right-3
                        p-2
                        bg-white/90 dark:bg-gray-900/90
                        backdrop-blur-sm
                        rounded-full
                        hover:bg-white dark:hover:bg-gray-800
                        transition-all duration-300
                        border border-white/20 dark:border-gray-800/50
                        shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                    "
                    aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                    <Heart
                        className={`
                            w-4 h-4
                            transition-colors duration-300
                            ${isLiked
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-600 dark:text-gray-400'
                            }
                        `}
                    />
                </button>

                {/* Availability indicator */}
                <div className="
                    absolute bottom-3 left-3
                    flex items-center gap-1.5
                    px-2 py-1
                    bg-white/90 dark:bg-gray-900/90
                    backdrop-blur-sm
                    rounded-full
                    text-xs
                    border border-white/20 dark:border-gray-800/50
                ">
                    <Users className={`w-3 h-3 ${getAvailabilityColor()}`} />
                    <span className={`font-medium ${getAvailabilityColor()}`}>
                        {tour.availableSpots} spots
                    </span>
                </div>

                {/* Duration badge */}
                <div className="
                    absolute bottom-3 right-3
                    flex items-center gap-1
                    px-2 py-1
                    bg-white/90 dark:bg-gray-900/90
                    backdrop-blur-sm
                    rounded-full
                    text-xs
                    text-gray-600 dark:text-gray-400
                    border border-white/20 dark:border-gray-800/50
                ">
                    <Clock className="w-3 h-3" />
                    <span>{tour.duration}</span>
                </div>
            </div>

            {/* ========================================
                CONTENT SECTION
                ========================================
                
                All text content below the image:
                1. Tour title (truncated if too long)
                2. Guide information with verification badge
                3. Rating and review count
                4. Price and any discounts
                5. Next available date
                6. Additional badges
            */}
            <div className="flex-1 p-4 sm:p-5">

                {/* Tour title */}
                <h3 className="
                    font-semibold
                    text-base sm:text-lg
                    text-gray-900 dark:text-white
                    mb-2
                    line-clamp-2
                    group-hover:text-blue-600 dark:group-hover:text-blue-400
                    transition-colors
                ">
                    {tour.title}
                </h3>

                {/* Guide information */}
                <div className="flex items-center gap-2 mb-3">
                    {/* Guide avatar */}
                    <div className="
                        relative
                        w-6 h-6
                        rounded-full
                        bg-gradient-to-br
                        from-gray-200 to-gray-300
                        dark:from-gray-700 dark:to-gray-800
                        flex items-center justify-center
                        overflow-hidden
                    ">
                        {tour.guideAvatar ? (
                            <Image
                                src={tour.guideAvatar}
                                alt={tour.guideName}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        )}
                    </div>

                    {/* Guide name and verification */}
                    <div className="flex-1 flex items-center gap-1">
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            {tour.guideName}
                        </span>
                        {tour.guideVerified && (
                            <CheckCircle className="
                                w-3.5 h-3.5
                                text-blue-600 dark:text-blue-400
                                fill-blue-600/10 dark:fill-blue-400/10
                            " />
                        )}
                    </div>
                </div>

                {/* Rating - FIXED: Now passing both rating AND reviewCount */}
                <div className="flex items-center mb-3">
                    {renderRating(tour.rating, tour.reviewCount)}
                </div>

                {/* Price section */}
                <div className="flex items-baseline gap-2 mb-3">
                    {/* Current price */}
                    <span className="
                        text-xl sm:text-2xl
                        font-bold
                        text-gray-900 dark:text-white
                    ">
                        {formatPrice(tour.price.amount, tour.price.currency)}
                    </span>

                    {/* Original price (if discounted) */}
                    {tour.price.originalPrice && (
                        <>
                            <span className="
                                text-sm
                                text-gray-500 dark:text-gray-400
                                line-through
                            ">
                                {formatPrice(tour.price.originalPrice, tour.price.currency)}
                            </span>
                            <span className="
                                px-1.5 py-0.5
                                bg-red-100 dark:bg-red-900/30
                                text-red-700 dark:text-red-400
                                text-xs font-medium
                                rounded-full
                            ">
                                -{tour.price.discountPercent}%
                            </span>
                        </>
                    )}

                    {/* Dynamic pricing indicator */}
                    {tour.price.dynamicPricing && (
                        <span className="
                            px-1.5 py-0.5
                            bg-blue-100 dark:bg-blue-900/30
                            text-blue-700 dark:text-blue-400
                            text-xs font-medium
                            rounded-full
                            flex items-center gap-0.5
                        ">
                            <Sparkles className="w-3 h-3" />
                            Dynamic
                        </span>
                    )}
                </div>

                {/* Next available date */}
                {tour.nextAvailableDate && (
                    <div className="flex items-center gap-1.5 mb-3">
                        <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            Next: <span className="font-medium text-gray-900 dark:text-white">
                                {tour.nextAvailableDate}
                            </span>
                        </span>
                    </div>
                )}

                {/* Additional badges */}
                {tour.badges && tour.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                        {tour.badges.map((badge, index) => (
                            <span
                                key={index}
                                className={`
                                    inline-flex items-center gap-0.5
                                    px-2 py-0.5
                                    text-xs font-medium
                                    rounded-full
                                    ${badge.type === 'halal' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : ''}
                                    ${badge.type === 'verified' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}
                                    ${badge.type === 'premium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : ''}
                                    ${badge.type === 'family' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' : ''}
                                    ${badge.type === 'group' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : ''}
                                    ${badge.type === 'lastMinute' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : ''}
                                `}
                            >
                                {badge.type === 'halal' && <Leaf className="w-3 h-3" />}
                                {badge.type === 'verified' && <CheckCircle className="w-3 h-3" />}
                                {badge.type === 'premium' && <Award className="w-3 h-3" />}
                                {badge.type === 'family' && <Users className="w-3 h-3" />}
                                {badge.type === 'group' && <Users className="w-3 h-3" />}
                                {badge.type === 'lastMinute' && <Clock className="w-3 h-3" />}
                                {badge.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    )
}

// ============================================================================
// LOADING SKELETON COMPONENT
// ============================================================================
// 
// PURPOSE: Display placeholder cards while data is loading
// 
// WHY SKELETONS:
// 1. Perceived performance - users see immediate feedback
// 2. Layout stability - prevents content shift (CLS)
// 3. Better UX than spinner
// 
// DESIGN:
// - Matches exact dimensions of real cards
// - Uses subtle pulse animation
// - Respects dark mode
// ============================================================================

function SearchResultsSkeleton() {
    return (
        <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="
                        flex flex-col
                        bg-white dark:bg-gray-900
                        rounded-xl
                        border border-gray-200 dark:border-gray-800
                        overflow-hidden
                        animate-pulse
                    "
                >
                    {/* Image skeleton */}
                    <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-800" />

                    {/* Content skeleton */}
                    <div className="p-4 sm:p-5 space-y-3">
                        <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-7 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="flex gap-1.5">
                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================
// 
// PURPOSE: Display when no tours match search criteria
// 
// WHEN TO SHOW:
// - No results from API
// - Search query returned zero matches
// - Filters eliminated all options
// 
// DESIGN:
// - Friendly, encouraging message
// - Clear call-to-action
// - Visual icon for emotional connection
// ============================================================================

function EmptySearchResults() {
    return (
        <div className="
            col-span-full
            py-16 sm:py-20
            flex flex-col items-center justify-center
            text-center
        ">
            {/* Empty state illustration */}
            <div className="
                w-24 h-24 sm:w-32 sm:h-32
                mb-6
                rounded-full
                bg-gray-100 dark:bg-gray-800
                flex items-center justify-center
            ">
                <MapPin className="
                    w-12 h-12 sm:w-16 sm:h-16
                    text-gray-400 dark:text-gray-600
                " />
            </div>

            {/* Message */}
            <h3 className="
                text-lg sm:text-xl md:text-2xl
                font-semibold
                text-gray-900 dark:text-white
                mb-2
            ">
                No tours found
            </h3>

            <p className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                max-w-md
                mb-6
            ">
                Try adjusting your search or filters to find the perfect experience.
            </p>

            {/* CTA Button */}
            <button
                onClick={() => {
                    // Reset search and filters
                    window.location.href = '/tours'
                }}
                className="
                    px-6 py-3
                    bg-blue-600 dark:bg-blue-700
                    text-white
                    rounded-full
                    font-medium
                    hover:bg-blue-700 dark:hover:bg-blue-800
                    transition-colors
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                "
            >
                Browse All Tours
            </button>
        </div>
    )
}

// ============================================================================
// MAIN SEARCH RESULTS GRID COMPONENT
// ============================================================================
// 
// PURPOSE: Orchestrate the display of tour search results
// 
// RESPONSIBILITIES:
// 1. Fetch data (mock in V1, API in V2)
// 2. Manage loading states
// 3. Handle empty states
// 4. Render responsive grid
// 5. Pass props to individual cards
// 
// PROPS INTERFACE (Phase 2):
// - searchQuery?: string - Current search term
// - filters?: SearchFilters - Active filters
// - sort?: SortOption - Current sort order
// - page?: number - Pagination page
// 
// For V1, we use internal mock data
// ============================================================================

interface SearchResultsGridProps {
    initialTours?: TourCardData[]
    isLoading?: boolean
}

export default function SearchResultsGrid({
    initialTours,
    isLoading = false
}: SearchResultsGridProps) {
    const [mounted, setMounted] = useState(false)
    const [tours, setTours] = useState<TourCardData[]>(initialTours || [])
    const [loading, setLoading] = useState(isLoading)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // Load mock data on component mount (simulates API call)
    useEffect(() => {
        if (!initialTours && mounted) {
            setLoading(true)
            // Simulate network delay for realistic loading state
            const timer = setTimeout(() => {
                setTours(MOCK_TOURS)
                setLoading(false)
            }, 800) // 800ms delay feels natural
            
            return () => clearTimeout(timer)
        }
    }, [initialTours, mounted])

    // Don't render during SSR to prevent theme mismatch
    if (!mounted) {
        return (
            <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                    <SearchResultsSkeleton />
                </div>
            </div>
        )
    }

    // Show loading state
    if (loading) {
        return (
            <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                    <SearchResultsSkeleton />
                </div>
            </div>
        )
    }

    // Show empty state
    if (!tours || tours.length === 0) {
        return <EmptySearchResults />
    }

    // Show results grid
    return (
        <div className="w-full">
            {/* ========================================
                RESULTS HEADER
                ========================================
                Displays count and sorting options
                Will be expanded in Phase 2
            */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {tours.length}
                    </span>{' '}
                    {tours.length === 1 ? 'tour' : 'tours'} found
                </p>

                {/* Sort dropdown placeholder */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                        Sort by:
                    </span>
                    <select
                        className="
                            text-sm
                            px-3 py-1.5
                            bg-white dark:bg-gray-900
                            border border-gray-300 dark:border-gray-700
                            rounded-lg
                            text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                        "
                        aria-label="Sort tours by"
                        defaultValue="recommended"
                    >
                        <option value="recommended">Recommended</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>
            </div>

            {/* ========================================
                MAIN RESULTS GRID
                ========================================
                
                RESPONSIVE BREAKPOINTS:
                - Mobile: 1 column (default)
                - Tablet: 2 columns (sm:)
                - Desktop: 3 columns (lg:)
                - Large desktop: 4 columns (xl:)
                
                GAP SIZING:
                - Mobile: gap-4 (16px)
                - Tablet: gap-5 (20px)
                - Desktop: gap-6 (24px)
            */}
            <div className="
                grid 
                grid-cols-1 
                sm:grid-cols-2 
                lg:grid-cols-3 
                xl:grid-cols-4 
                gap-4 sm:gap-5 lg:gap-6
            ">
                {tours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                ))}
            </div>

            {/* ========================================
                PAGINATION PLACEHOLDER
                ========================================
                Will be implemented in Phase 2
                For V1, we show all results
            */}
            {tours.length > 12 && (
                <div className="flex justify-center mt-8 sm:mt-10">
                    <button
                        className="
                            px-4 py-2
                            text-sm font-medium
                            text-gray-700 dark:text-gray-300
                            bg-gray-100 dark:bg-gray-800
                            rounded-lg
                            hover:bg-gray-200 dark:hover:bg-gray-700
                            transition-colors
                        "
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    )
}

// ============================================================================
// EXPORT FOR USE IN OTHER COMPONENTS
// ============================================================================
// 
// This component is now ready for use in:
// 1. /app/tours/page.tsx - Main search results page
// 2. /app/page.tsx - Featured tours section (future)
// 3. Guide profile pages - Tours by specific guide (future)
// 
// The mock data is exported so it can be used for testing
// ============================================================================