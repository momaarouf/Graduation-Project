// ============================================================================
// FILTER TYPES DEFINITIONS
// ============================================================================
// LOCATION: /frontend/src/components/search/types/filters.types.ts
// 
// PURPOSE: Centralized type definitions for the entire filtering system
// 
// WHY SEPARATE FILE:
// 1. Single source of truth - types used by both filters and results grid
// 2. Easy to extend - add new filter types without touching components
// 3. Backend ready - maps directly to API query parameters in Phase 2
// 4. Type safety - prevents bugs with strict TypeScript checking
// ============================================================================

// ============================================================================
// ENUMS - Predefined options for dropdowns and checkboxes
// ============================================================================
// Benefits: Type safety, autocomplete, single source of truth
// ============================================================================

/**
 * Supported countries for tour search
 * Maps to ERD: TourOccurrence.region field
 */
export enum Country {
    LEBANON = 'lebanon',
    TURKEY = 'turkey'
}

/**
 * Display names for countries (used in UI)
 */
export const CountryLabels: Record<Country, string> = {
    [Country.LEBANON]: 'Lebanon',
    [Country.TURKEY]: 'Turkey'
}

/**
 * Major cities in Lebanon and Turkey
 * Maps to ERD: TourOccurrence.location field
 */
export enum City {
    // Lebanon
    BEIRUT = 'beirut',
    BYBLOS = 'byblos',
    TRIPOLI = 'tripoli',
    SIDON = 'sidon',
    TYRE = 'tyre',
    BEKAA = 'bekaa',

    // Turkey
    ISTANBUL = 'istanbul',
    CAPPADOCIA = 'cappadocia',
    ANTALYA = 'antalya',
    IZMIR = 'izmir',
    BODRUM = 'bodrum',
    PAMUKKALE = 'pamukkale',
    EPHESUS = 'ephesus'
}

/**
 * Display names for cities
 */
export const CityLabels: Record<City, string> = {
    // Lebanon
    [City.BEIRUT]: 'Beirut',
    [City.BYBLOS]: 'Byblos',
    [City.TRIPOLI]: 'Tripoli',
    [City.SIDON]: 'Sidon',
    [City.TYRE]: 'Tyre',
    [City.BEKAA]: 'Bekaa Valley',

    // Turkey
    [City.ISTANBUL]: 'Istanbul',
    [City.CAPPADOCIA]: 'Cappadocia',
    [City.ANTALYA]: 'Antalya',
    [City.IZMIR]: 'Izmir',
    [City.BODRUM]: 'Bodrum',
    [City.PAMUKKALE]: 'Pamukkale',
    [City.EPHESUS]: 'Ephesus'
}

/**
 * City to country mapping for hierarchical filtering
 */
export const CityCountryMap: Record<City, Country> = {
    // Lebanon
    [City.BEIRUT]: Country.LEBANON,
    [City.BYBLOS]: Country.LEBANON,
    [City.TRIPOLI]: Country.LEBANON,
    [City.SIDON]: Country.LEBANON,
    [City.TYRE]: Country.LEBANON,
    [City.BEKAA]: Country.LEBANON,

    // Turkey
    [City.ISTANBUL]: Country.TURKEY,
    [City.CAPPADOCIA]: Country.TURKEY,
    [City.ANTALYA]: Country.TURKEY,
    [City.IZMIR]: Country.TURKEY,
    [City.BODRUM]: Country.TURKEY,
    [City.PAMUKKALE]: Country.TURKEY,
    [City.EPHESUS]: Country.TURKEY
}

/**
 * Languages spoken by guides
 * Maps to ERD: LANGUAGE table and GUIDE_LANGUAGE junction
 */
export enum Language {
    ARABIC = 'arabic',
    ENGLISH = 'english',
    FRENCH = 'french',
    TURKISH = 'turkish',
    SPANISH = 'spanish',
    GERMAN = 'german',
    RUSSIAN = 'russian'
}

export const LanguageLabels: Record<Language, string> = {
    [Language.ARABIC]: 'العربية',
    [Language.ENGLISH]: 'English',
    [Language.FRENCH]: 'Français',
    [Language.TURKISH]: 'Türkçe',
    [Language.SPANISH]: 'Español',
    [Language.GERMAN]: 'Deutsch',
    [Language.RUSSIAN]: 'Русский'
}

/**
 * Tour duration ranges
 */
export enum Duration {
    SHORT = '1-3',
    MEDIUM = '3-6',
    LONG = '6-12',
    FULL_DAY = '12+'
}

export const DurationLabels: Record<Duration, string> = {
    [Duration.SHORT]: '1-3 hours',
    [Duration.MEDIUM]: '3-6 hours',
    [Duration.LONG]: '6-12 hours',
    [Duration.FULL_DAY]: '12+ hours'
}

/**
 * Minimum rating filters
 */
export enum MinRating {
    ANY = 'any',
    THREE_PLUS = '3',
    FOUR_PLUS = '4',
    FOUR_FIVE_PLUS = '4.5'
}

export const MinRatingLabels: Record<MinRating, string> = {
    [MinRating.ANY]: 'Any rating',
    [MinRating.THREE_PLUS]: '3+ stars',
    [MinRating.FOUR_PLUS]: '4+ stars',
    [MinRating.FOUR_FIVE_PLUS]: '4.5+ stars'
}

/**
 * Availability windows
 */
export enum Availability {
    ANY = 'any',
    TODAY = 'today',
    TOMORROW = 'tomorrow',
    THIS_WEEK = 'week',
    NEXT_WEEKEND = 'weekend'
}

export const AvailabilityLabels: Record<Availability, string> = {
    [Availability.ANY]: 'Any date',
    [Availability.TODAY]: 'Today',
    [Availability.TOMORROW]: 'Tomorrow',
    [Availability.THIS_WEEK]: 'This week',
    [Availability.NEXT_WEEKEND]: 'This weekend'
}

// ============================================================================
// INTERFACES - Main filter state and props
// ============================================================================

/**
 * Complete filter state interface
 * 
 * This represents ALL possible filters that can be applied to search results.
 * Every property is optional because filters start empty.
 * 
 * DESIGN DECISION: Boolean flags use is/has prefix for clarity
 * - isHalalCertified: Yes/No toggle
 * - hasInstantBook: Yes/No toggle
 * - isGuideVerified: Yes/No toggle
 */
export interface FilterState {
    searchQuery?: string/*text search query */
    // ========== LOCATION FILTERS ==========
    /** Selected countries (Lebanon/Turkey) */
    countries?: Country[]

    /** Selected cities (Beirut, Istanbul, etc.) */
    cities?: City[]

    // ========== TOUR ATTRIBUTES ==========
    /** Halal certified tours only */
    isHalalCertified?: boolean

    /** Instant booking available */
    hasInstantBook?: boolean

    /** Minimum tour duration in hours */
    minDuration?: number

    /** Maximum tour duration in hours */
    maxDuration?: number

    /** Selected duration presets */
    durations?: Duration[]

    // ========== CAPACITY FILTERS ==========
    /** Minimum group size */
    minGroupSize?: number

    /** Maximum group size */
    maxGroupSize?: number

    /** Only show tours with available spots */
    hasAvailableSpots?: boolean

    // ========== PRICE FILTERS ==========
    /** Minimum price in USD */
    minPrice?: number

    /** Maximum price in USD */
    maxPrice?: number

    // ========== GUIDE FILTERS ==========
    /** Only verified guides */
    isGuideVerified?: boolean

    /** Languages spoken by guide */
    guideLanguages?: Language[]

    // ========== RATING FILTERS ==========
    /** Minimum tour rating */
    minRating?: MinRating

    // ========== AVAILABILITY FILTERS ==========
    /** When the tour is available */
    availability?: Availability

    // ========== SPECIAL FEATURES ==========
    /** Group discount available */
    hasGroupDiscount?: boolean

    /** Family friendly */
    isFamilyFriendly?: boolean

    /** Premium/Pick experience */
    isPremium?: boolean
}

/**
 * Props for the main SearchFilters component
 */
export interface SearchFiltersProps {
    /** Current filter state */
    filters?: FilterState

    /** Callback when filters change (optional when using FilterContext) */
    onFilterChange?: (filters: FilterState) => void

    /** Callback to clear all filters */
    onClearAll?: () => void

    /** Number of active filters (for mobile badge) */
    activeFilterCount?: number

    /** Loading state */
    isLoading?: boolean

    /** Show in mobile drawer mode */
    isMobile?: boolean

    /** Close mobile drawer callback */
    onClose?: () => void
}

/**
 * Props for reusable FilterSection component
 */
export interface FilterSectionProps {
    /** Section title */
    title: string

    /** Section icon (optional) */
    icon?: React.ReactNode

    /** Children components */
    children: React.ReactNode

    /** Initially expanded? */
    defaultExpanded?: boolean

    /** Show separator? */
    showSeparator?: boolean

    /** Additional CSS classes */
    className?: string
}

/**
 * Price range props
 */
export interface PriceRangeProps {
    /** Minimum price value */
    minPrice?: number

    /** Maximum price value */
    maxPrice?: number

    /** Absolute min price (default: 0) */
    absoluteMin?: number

    /** Absolute max price (default: 500) */
    absoluteMax?: number

    /** Callback when price range changes */
    onChange: (min?: number, max?: number) => void

    /** Currency symbol */
    currency?: string
}

// ============================================================================
// CONSTANTS - Default values for filters
// ============================================================================

/**
 * Default price range bounds
 * Based on actual tour prices in mock data
 */
export const PRICE_RANGE = {
    MIN: 0,
    MAX: 500,
    STEP: 5
} as const

/**
 * Default group size bounds
 * Maps to ERD: TourOccurrence.minCapacity / maxCapacity
 */
export const GROUP_SIZE_RANGE = {
    MIN: 1,
    MAX: 20,
    STEP: 1
} as const

/**
 * Duration bounds in hours
 */
export const DURATION_RANGE = {
    MIN: 1,
    MAX: 12,
    STEP: 0.5
} as const

/**
 * Active filter count calculation helper
 * 
 * Counts how many filters are currently active
 * Used for: "Clear all" button, mobile filter badge
 * 
 * @param filters - Current filter state
 * @returns Number of active filters
 */
export function getActiveFilterCount(filters?: FilterState): number {
    if (!filters) return 0

    let count = 0

    // Location filters
    if (filters.countries?.length) count += filters.countries.length
    if (filters.cities?.length) count += filters.cities.length

    // Boolean toggles
    if (filters.isHalalCertified) count++
    if (filters.hasInstantBook) count++
    if (filters.isGuideVerified) count++
    if (filters.hasAvailableSpots) count++
    if (filters.hasGroupDiscount) count++
    if (filters.isFamilyFriendly) count++
    if (filters.isPremium) count++

    // Multi-select filters
    if (filters.durations?.length) count += filters.durations.length
    if (filters.guideLanguages?.length) count += filters.guideLanguages.length

    // Range filters
    if (filters.minPrice !== undefined && filters.minPrice > PRICE_RANGE.MIN) count++
    if (filters.maxPrice !== undefined && filters.maxPrice < PRICE_RANGE.MAX) count++
    if (filters.minGroupSize !== undefined && filters.minGroupSize > GROUP_SIZE_RANGE.MIN) count++
    if (filters.maxGroupSize !== undefined && filters.maxGroupSize < GROUP_SIZE_RANGE.MAX) count++
    if (filters.minDuration !== undefined && filters.minDuration > DURATION_RANGE.MIN) count++
    if (filters.maxDuration !== undefined && filters.maxDuration < DURATION_RANGE.MAX) count++

    // Special filters
    if (filters.minRating && filters.minRating !== MinRating.ANY) count++
    if (filters.availability && filters.availability !== Availability.ANY) count++

    return count
}