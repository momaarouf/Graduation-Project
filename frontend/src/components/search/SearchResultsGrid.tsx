// ============================================================================
// SEARCH RESULTS GRID - WITH FILTERING AND SORTING
// ============================================================================
// LOCATION: /frontend/src/components/search/SearchResultsGrid.tsx
// 
// 🔴 CRITICAL FIX (2026-02-11):
// ============================================================================
// 
// FIX 1: REMOVED DUPLICATE SORT DROPDOWN
// ---------------------------------------
// BEFORE: ToursPageContent had its own sort dropdown
// AFTER:  This component is the ONLY place that renders sort controls
// 
// WHY: Single Responsibility Principle
//      - ToursPage: Layout and structure
//      - SearchResultsGrid: Results display and interaction
// 
// FIX 2: ADDED SORTING FUNCTIONALITY
// -----------------------------------
// BEFORE: Sort dropdown existed but did nothing
// AFTER:  Full sorting implementation with 4 options
// 
// FIX 3: IMPROVED FILTER COUNT COMMUNICATION
// -------------------------------------------
// BEFORE: Active filter count was calculated in two places
// AFTER:  Single source of truth via context + callback
// ============================================================================

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
    FilterX,
    ArrowUpDown,
    ChevronDown,
    Check
} from 'lucide-react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'

// ============================================================================
// IMPORTS
// ============================================================================
import { useFilterState, useFilterDispatch } from '@/src/lib/contexts/FilterContext'
import { Country, FilterState } from './types/filters.types'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TourCardData {
    id: string
    title: string
    location: string
    country: Country
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

// Sort option type
export type SortOption = 'recommended' | 'price-low' | 'price-high' | 'rating'

const SORT_OPTIONS = [
    { id: 'recommended', name: 'Recommended' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'rating', name: 'Highest Rated' },
] as const

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_TOURS: TourCardData[] = [
    {
        id: '1',
        title: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
        location: 'Istanbul',
        country: Country.TURKEY,
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
        country: Country.LEBANON,
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
        country: Country.TURKEY,
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
        country: Country.LEBANON,
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
        country: Country.TURKEY,
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
        country: Country.LEBANON,
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

const getCountryFlag = (country: 'lebanon' | 'turkey'): string => {
    return country === 'lebanon' ? '🇱🇧' : '🇹🇷'
}

const renderRating = (rating: number, reviewCount: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
        <div className="flex items-center gap-1">
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

            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {rating.toFixed(1)}
            </span>

            <span className="text-xs text-gray-500 dark:text-gray-400">
                ({reviewCount.toLocaleString()})
            </span>
        </div>
    )
}

// ============================================================================
// FILTERING LOGIC
// ============================================================================

function filterTours(tours: TourCardData[], filters: FilterState): TourCardData[] {
    return tours.filter(tour => {

        // Location filters
        if (filters.countries && filters.countries.length > 0) {
            if (!filters.countries.includes(tour.country)) {
                return false
            }
        }

        if (filters.cities && filters.cities.length > 0) {
            const tourCityLower = tour.location.toLowerCase()
            const matchesCity = filters.cities.some(city =>
                tourCityLower.includes(city.toLowerCase()) ||
                city.toLowerCase().includes(tourCityLower)
            )
            if (!matchesCity) return false
        }

        // Tour attributes
        if (filters.isHalalCertified && !tour.halalCertified) {
            return false
        }

        if (filters.hasGroupDiscount) {
            const hasGroupDiscountBadge = tour.badges?.some(b => b.type === 'group')
            if (!hasGroupDiscountBadge) return false
        }

        if (filters.isFamilyFriendly) {
            const hasFamilyBadge = tour.badges?.some(b => b.type === 'family')
            if (!hasFamilyBadge) return false
        }

        if (filters.isPremium) {
            const hasPremiumBadge = tour.badges?.some(b => b.type === 'premium')
            if (!hasPremiumBadge) return false
        }

        // Price filters
        if (filters.minPrice !== undefined && tour.price.amount < filters.minPrice) {
            return false
        }

        if (filters.maxPrice !== undefined && tour.price.amount > filters.maxPrice) {
            return false
        }

        // Duration filters
        if (filters.durations && filters.durations.length > 0) {
            const durationHours = parseFloat(tour.duration)

            const matchesDuration = filters.durations.some(duration => {
                switch (duration) {
                    case '1-3':
                        return durationHours >= 1 && durationHours <= 3
                    case '3-6':
                        return durationHours >= 3 && durationHours <= 6
                    case '6-12':
                        return durationHours >= 6 && durationHours <= 12
                    case '12+':
                        return durationHours >= 12
                    default:
                        return false
                }
            })

            if (!matchesDuration) return false
        }

        // Group size filters
        if (filters.minGroupSize !== undefined && tour.maxCapacity < filters.minGroupSize) {
            return false
        }

        if (filters.maxGroupSize !== undefined && tour.minCapacity > filters.maxGroupSize) {
            return false
        }

        if (filters.hasAvailableSpots && tour.availableSpots <= 0) {
            return false
        }

        // Guide quality filters
        if (filters.isGuideVerified && !tour.guideVerified) {
            return false
        }

        // Rating filters
        if (filters.minRating && filters.minRating !== 'any') {
            const minRatingValue = parseFloat(filters.minRating)
            if (tour.rating < minRatingValue) {
                return false
            }
        }

        // Availability filters (simplified for Phase 1)
        if (filters.availability && filters.availability !== 'any') {
            if (filters.availability === 'today' && !tour.nextAvailableDate?.includes('Today')) {
                return false
            }
            if (filters.availability === 'tomorrow' && !tour.nextAvailableDate?.includes('Tomorrow')) {
                return false
            }
        }

        return true
    })
}

// ============================================================================
// SORTING LOGIC
// ============================================================================

function sortTours(tours: TourCardData[], sortBy: SortOption): TourCardData[] {
    const sorted = [...tours]

    switch (sortBy) {
        case 'price-low':
            return sorted.sort((a, b) => a.price.amount - b.price.amount)

        case 'price-high':
            return sorted.sort((a, b) => b.price.amount - a.price.amount)

        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating)

        case 'recommended':
        default:
            // Recommended = rating + recency + availability
            // Simplified for Phase 1: sort by rating, then by available spots
            return sorted.sort((a, b) => {
                if (b.rating !== a.rating) {
                    return b.rating - a.rating
                }
                return b.availableSpots - a.availableSpots
            })
    }
}

// ============================================================================
// TOUR CARD COMPONENT
// ============================================================================

interface TourCardProps {
    tour: TourCardData
}

function TourCard({ tour }: TourCardProps) {
    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const [isLiked, setIsLiked] = useState(false)

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
            {/* Image section */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                {!isImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                )}

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
                    onError={() => setIsImageLoaded(true)}
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
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
                        e.preventDefault()
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

                {/* Availability */}
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

                {/* Duration */}
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

            {/* Content */}
            <div className="flex-1 p-4 sm:p-5">
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

                {/* Guide info */}
                <div className="flex items-center gap-2 mb-3">
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

                {/* Rating */}
                <div className="flex items-center mb-3">
                    {renderRating(tour.rating, tour.reviewCount)}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                    <span className="
                        text-xl sm:text-2xl
                        font-bold
                        text-gray-900 dark:text-white
                    ">
                        {formatPrice(tour.price.amount, tour.price.currency)}
                    </span>

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

                {/* Next available */}
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

                {/* Badges */}
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
// LOADING SKELETON
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
                    <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-800" />
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
// EMPTY STATE
// ============================================================================

interface EmptySearchResultsProps {
    onClearFilters?: () => void
}

function EmptySearchResults({ onClearFilters }: EmptySearchResultsProps) {
    return (
        <div className="
            col-span-full
            py-16 sm:py-20
            flex flex-col items-center justify-center
            text-center
        ">
            <div className="
                w-24 h-24 sm:w-32 sm:h-32
                mb-6
                rounded-full
                bg-gray-100 dark:bg-gray-800
                flex items-center justify-center
            ">
                <FilterX className="
                    w-12 h-12 sm:w-16 sm:h-16
                    text-gray-400 dark:text-gray-600
                " />
            </div>

            <h3 className="
                text-lg sm:text-xl md:text-2xl
                font-semibold
                text-gray-900 dark:text-white
                mb-2
            ">
                No tours match your filters
            </h3>

            <p className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                max-w-md
                mb-6
            ">
                Try adjusting your filters or clear them to see all available tours.
            </p>

            {onClearFilters && (
                <button
                    onClick={onClearFilters}
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
                    Clear All Filters
                </button>
            )}
        </div>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface SearchResultsGridProps {
    /** Optional initial tours (for SSR) */
    initialTours?: TourCardData[]
    /** External loading state */
    isLoading?: boolean
    /** Callback for filter count changes (for mobile badge) */
    onFilterCountChange?: (count: number) => void
}

export default function SearchResultsGrid({
    initialTours,
    isLoading: externalLoading = false,
    onFilterCountChange
}: SearchResultsGridProps) {
    // ========================================
    // STATE
    // ========================================
    const [mounted, setMounted] = useState(false)
    const [tours, setTours] = useState<TourCardData[]>(initialTours || [])
    const [loading, setLoading] = useState(externalLoading)
    const [sortBy, setSortBy] = useState<SortOption>('recommended')

    // ========================================
    // CONTEXT
    // ========================================
    const { filters, isLoading: contextLoading } = useFilterState()
    const dispatch = useFilterDispatch()

    // ========================================
    // MEMOIZED FILTERED AND SORTED TOURS
    // ========================================

    const filteredTours = useMemo(() => {
        if (!tours.length) return []
        return filterTours(tours, filters)
    }, [tours, filters])

    const sortedAndFilteredTours = useMemo(() => {
        return sortTours(filteredTours, sortBy)
    }, [filteredTours, sortBy])

    // ========================================
    // EFFECTS
    // ========================================

    // Update total results count in context
    useEffect(() => {
        dispatch({
            type: 'SET_TOTAL_RESULTS',
            payload: filteredTours.length
        })
    }, [filteredTours.length, dispatch])

    // Notify parent of filter count changes
    useEffect(() => {
        onFilterCountChange?.(filteredTours.length)
    }, [filteredTours.length, onFilterCountChange])

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // Load mock data
    useEffect(() => {
        if (!initialTours && mounted) {
            setLoading(true)
            const timer = setTimeout(() => {
                setTours(MOCK_TOURS)
                setLoading(false)
            }, 800)

            return () => clearTimeout(timer)
        }
    }, [initialTours, mounted])

    // ========================================
    // HANDLERS
    // ========================================

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as SortOption)
    }

    const handleClearFilters = () => {
        dispatch({ type: 'CLEAR_FILTERS' })
    }

    // Don't render during SSR
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
    if (loading || contextLoading) {
        return (
            <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                    <SearchResultsSkeleton />
                </div>
            </div>
        )
    }

    // Show empty state
    if (!sortedAndFilteredTours || sortedAndFilteredTours.length === 0) {
        return (
            <EmptySearchResults
                onClearFilters={handleClearFilters}
            />
        )
    }

    // Show results grid
    return (
        <div className="w-full">
            {/* 
              ========================================
              RESULTS HEADER - SINGLE SOURCE OF TRUTH
              ========================================
              
              🔴 CRITICAL: This is the ONLY place in the entire app
              where results count and sort dropdown are rendered.
              
              DO NOT add another sort dropdown anywhere else!
            */}
            <div className="
                flex flex-col sm:flex-row 
                items-start sm:items-center 
                justify-between 
                gap-3 sm:gap-0
                mb-4 sm:mb-6
            ">
                {/* Results count */}
                <p className="
                    text-sm sm:text-base 
                    text-gray-600 dark:text-gray-400
                ">
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {sortedAndFilteredTours.length}
                    </span>{' '}
                    {sortedAndFilteredTours.length === 1 ? 'tour' : 'tours'} found
                </p>

                {/* Sort dropdown - FULLY FUNCTIONAL */}
                <div className="
                    flex items-center gap-2
                    w-full sm:w-auto
                ">
                    <span className="
                        text-sm 
                        text-gray-500 dark:text-gray-400 
                        hidden sm:inline
                    ">
                        Sort by:
                    </span>

                    <div className="relative w-full sm:w-56">
                        <Listbox value={sortBy} onChange={(val) => setSortBy(val as SortOption)}>
                            <div className="relative">
                                <ListboxButton className="
                                    relative w-full
                                    flex items-center justify-between
                                    px-4 py-2.5 sm:py-2
                                    bg-white dark:bg-gray-900
                                    border border-gray-200 dark:border-gray-800
                                    rounded-xl
                                    text-sm text-left
                                    text-gray-900 dark:text-white
                                    hover:border-blue-400 dark:hover:border-blue-500
                                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                    transition-all duration-200
                                    shadow-sm hover:shadow-md
                                ">
                                    <span className="block truncate font-medium">
                                        {SORT_OPTIONS.find(opt => opt.id === sortBy)?.name}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ui-open:rotate-180" />
                                </ListboxButton>

                                <Transition
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <ListboxOptions className="
                                        absolute z-50 mt-1.5
                                        max-h-60 w-full overflow-auto
                                        rounded-xl bg-white dark:bg-gray-900
                                        py-1.5 text-sm
                                        shadow-xl ring-1 ring-black/5 dark:ring-white/10
                                        focus:outline-none
                                    ">
                                        {SORT_OPTIONS.map((option) => (
                                            <ListboxOption
                                                key={option.id}
                                                value={option.id}
                                                className={({ focus, selected }) => `
                                                    relative cursor-default select-none
                                                    py-2.5 pl-10 pr-4 transition-colors
                                                    ${focus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}
                                                    ${selected ? 'font-semibold' : 'font-normal'}
                                                `}
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={`block truncate ${selected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                            {option.name}
                                                        </span>
                                                        {selected ? (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                                                <Check className="w-4 h-4" />
                                                            </span>
                                                        ) : null}
                                                    </>
                                                )}
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>
                </div>
            </div>

            {/* Tour cards grid */}
            <div className="
                grid 
                grid-cols-1 
                sm:grid-cols-2 
                lg:grid-cols-3 
                xl:grid-cols-4 
                gap-4 sm:gap-5 lg:gap-6
            ">
                {sortedAndFilteredTours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                ))}
            </div>

            {/* Load more (pagination placeholder) */}
            {sortedAndFilteredTours.length > 12 && (
                <div className="flex justify-center mt-8 sm:mt-10">
                    <button
                        className="
                            px-6 py-3
                            text-sm font-medium
                            text-gray-700 dark:text-gray-300
                            bg-gray-100 dark:bg-gray-800
                            rounded-lg
                            hover:bg-gray-200 dark:hover:bg-gray-700
                            transition-colors
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                        "
                    >
                        Load More Tours
                    </button>
                </div>
            )}
        </div>
    )
}

// ============================================================================
// ARCHITECTURE SUMMARY:
// ============================================================================
//
// FILTER FLOW:
// 1. User clicks filter in SearchFilters
// 2. FilterContext updates filters state
// 3. This component detects filters change via useFilterState()
// 4. useMemo recalculates filteredTours
// 5. useMemo recalculates sortedAndFilteredTours
// 6. UI updates with filtered/sorted results
//
// SORT FLOW:
// 1. User selects sort option from dropdown
// 2. handleSortChange updates sortBy state
// 3. useMemo recalculates sortedAndFilteredTours
// 4. UI updates with newly sorted results
//
// SINGLE RESPONSIBILITY:
// - ToursPage: Layout only (pt-14, sidebar, main container)
// - SearchFilters: Filter UI only
// - SearchResultsGrid: Results display + sorting only
// - FilterContext: State management only
//
// This separation makes the code:
// ✅ Easier to debug
// ✅ Easier to test
// ✅ Easier to extend
// ✅ Performance optimized
// ============================================================================