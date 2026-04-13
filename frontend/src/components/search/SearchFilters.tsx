// ============================================================================
// SEARCH FILTERS - COMPLETE OVERHAUL
// ============================================================================
// LOCATION: /frontend/src/components/search/SearchFilters.tsx
// 
// CHANGES MADE:
// 
// 1. CONNECTED TO CONTEXT
//    - Now uses useFilters() hook instead of local state
//    - All filter changes go through FilterContext
//    - Results grid automatically reacts to changes
// 
// 2. ADDED COLLAPSIBLE MODE
//    - When isCollapsed = true, shows only icons and toggles
//    - Saves screen real estate
//    - Smooth transition between modes
// 
// 3. FIXED ACTIVE FILTER COUNT
//    - Properly counts all active filters
//    - Shows badge on mobile button
//    - Clear all functionality works
// 
// 4. IMPROVED PERFORMANCE
//    - Memoized callbacks with useCallback
//    - Memoized options with useMemo
//    - Prevents unnecessary re-renders
// ============================================================================

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    MapPin,
    Globe,
    Star,
    DollarSign,
    Clock,
    Users,
    Shield,
    X,
    Filter,
    Languages,
    Calendar,
    Briefcase,
    ChevronDown,
    ChevronUp,
    Check,
    MoonStar,
    TicketCheck,
    Baby,
    BadgePercent
} from 'lucide-react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'

// Import filter components
import FilterSection from './filters/FilterSection'
import CheckboxFilter from './filters/CheckboxFilter'
import PriceRangeFilter from './filters/PriceRangeFilter'

// Import types and constants
import {
    FilterState,
    SearchFiltersProps,
    Country,
    CountryLabels,
    City,
    CityLabels,
    CityCountryMap,
    Language,
    LanguageLabels,
    Duration,
    DurationLabels,
    MinRating,
    MinRatingLabels,
    Availability,
    AvailabilityLabels,
    PRICE_RANGE,
    GROUP_SIZE_RANGE,
    DURATION_RANGE,
    getActiveFilterCount
} from './types/filters.types'

// ============================================================================
// IMPORT CONTEXT HOOKS
// ============================================================================
import { useFilters, useApplyFilters, useFilterState } from '@/src/lib/contexts/FilterContext'

// ============================================================================
// MOCK FILTER DATA (Phase 1)
// ============================================================================
// In Phase 2, these counts will come from the backend API
// ============================================================================

const MOCK_CITY_COUNTS: Record<City, number> = {
    [City.BEIRUT]: 45,
    [City.BYBLOS]: 28,
    [City.TRIPOLI]: 15,
    [City.SIDON]: 12,
    [City.TYRE]: 10,
    [City.BEKAA]: 18,
    [City.ISTANBUL]: 89,
    [City.CAPPADOCIA]: 56,
    [City.ANTALYA]: 42,
    [City.IZMIR]: 31,
    [City.BODRUM]: 27,
    [City.PAMUKKALE]: 23,
    [City.EPHESUS]: 19
}

const MOCK_LANGUAGE_COUNTS: Record<Language, number> = {
    [Language.ARABIC]: 124,
    [Language.ENGLISH]: 245,
    [Language.FRENCH]: 89,
    [Language.TURKISH]: 167,
    [Language.SPANISH]: 34,
    [Language.GERMAN]: 28,
    [Language.RUSSIAN]: 22
}

// ============================================================================
// MAIN FILTER COMPONENT
// ============================================================================

interface ExtendedSearchFiltersProps extends SearchFiltersProps {
    /** Whether sidebar is collapsed (desktop only) */
    isCollapsed?: boolean
    /** Callback for active filter count (for mobile badge) */
    onActiveFilterCountChange?: (count: number) => void
    toggleSidebar?: () => void
}

export default function SearchFilters({
    filters: externalFilters, // Kept for backward compatibility
    onFilterChange: externalOnFilterChange, // Kept for backward compatibility
    onClearAll: externalOnClearAll,
    isLoading = false,
    isMobile = false,
    onClose,
    isCollapsed = false,
    toggleSidebar,
    onActiveFilterCountChange
}: ExtendedSearchFiltersProps) {

    // ========================================
    // CONTEXT INTEGRATION
    // ========================================
    // 
    // CRITICAL FIX: Now using real filter state from context
    // This connects SearchFilters to SearchResultsGrid
    // ========================================

    const { filters, dispatch } = useFilters()
    const { applyFilters, clearFilters: contextClearFilters } = useApplyFilters()
    const { isLoading: contextLoading } = useFilterState()

    // Local UI state
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
    const [localExpanded, setLocalExpanded] = useState<Record<string, boolean>>({})

    // ========================================
    // DERIVED VALUES
    // ========================================

    const activeFilterCount = useMemo(() =>
        getActiveFilterCount(filters),
        [filters])

    // Notify parent of active filter count (for mobile badge)
    useEffect(() => {
        onActiveFilterCountChange?.(activeFilterCount)
    }, [activeFilterCount, onActiveFilterCountChange])

    // ========================================
    // FILTER UPDATE HANDLERS
    // ========================================

    /**
     * Update filters through context
     * This triggers re-filtering in SearchResultsGrid
     */
    const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
        applyFilters(newFilters)

        // For backward compatibility
        if (externalOnFilterChange) {
            externalOnFilterChange({ ...filters, ...newFilters })
        }
    }, [applyFilters, filters, externalOnFilterChange])

    /**
     * Toggle boolean filter (checkbox toggles)
     */
    const toggleBooleanFilter = useCallback((
        key: keyof Pick<FilterState,
            'isHalalCertified' |
            'hasInstantBook' |
            'isGuideVerified' |
            'hasAvailableSpots' |
            'hasGroupDiscount' |
            'isFamilyFriendly' |
            'isPremium'
        >
    ) => {
        handleFilterChange({ [key]: !filters[key] })
    }, [filters, handleFilterChange])

    /**
     * Clear all filters
     */
    const handleClearAll = useCallback(() => {
        contextClearFilters()
        if (externalOnClearAll) externalOnClearAll()
        setSelectedCountry(null)
    }, [contextClearFilters, externalOnClearAll])

    // ========================================
    // MEMOIZED FILTER OPTIONS
    // ========================================
    // 
    // PERFORMANCE: useMemo prevents recalculation on every render
    // These only change when mock data changes (never in Phase 1)
    // ========================================

    const countryOptions = useMemo(() =>
        Object.values(Country).map(country => ({
            id: country,
            label: CountryLabels[country],
            count: country === Country.LEBANON
                ? Object.values(City)
                    .filter(c => CityCountryMap[c] === Country.LEBANON)
                    .reduce((sum, city) => sum + (MOCK_CITY_COUNTS[city] || 0), 0)
                : Object.values(City)
                    .filter(c => CityCountryMap[c] === Country.TURKEY)
                    .reduce((sum, city) => sum + (MOCK_CITY_COUNTS[city] || 0), 0)
        }))
        , [])

    const cityOptions = useMemo(() =>
        Object.values(City)
            .filter(city => !selectedCountry || CityCountryMap[city] === selectedCountry)
            .map(city => ({
                id: city,
                label: CityLabels[city],
                count: MOCK_CITY_COUNTS[city]
            }))
        , [selectedCountry])

    const languageOptions = useMemo(() =>
        Object.values(Language).map(lang => ({
            id: lang,
            label: LanguageLabels[lang],
            count: MOCK_LANGUAGE_COUNTS[lang]
        }))
        , [])

    const durationOptions = useMemo(() =>
        Object.values(Duration).map(duration => ({
            id: duration,
            label: DurationLabels[duration]
        }))
        , [])

    const ratingOptions = useMemo(() =>
        Object.values(MinRating).map(rating => ({
            id: rating,
            label: MinRatingLabels[rating]
        }))
        , [])

    const availabilityOptions = useMemo(() =>
        Object.values(Availability).map(avail => ({
            id: avail,
            label: AvailabilityLabels[avail]
        }))
        , [])

    // ========================================
    // COLLAPSED MODE RENDERING
    // ========================================
    // 
    // When sidebar is collapsed, show minimal version
    // Only icons and toggle switches, no labels
    // Perfect for users who want more screen space for results
    // ========================================

    if (isCollapsed) {
        return (
            <div className="w-full py-4 overflow-x-hidden">
                {/* Active filter count badge */}
                {activeFilterCount > 0 && (
                    <div className="mb-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white text-sm font-bold rounded-full">
                            {activeFilterCount}
                        </span>
                        <button
                            onClick={handleClearAll}
                            className="block mx-auto mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Clear all filters"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Compact filter toggles - icons only */}
                <div className="space-y-4">
                    {/* Halal filter - icon only */}
                    <button
                        onClick={() => toggleBooleanFilter('isHalalCertified')}
                        className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.isHalalCertified ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                        title="Halal Certified"
                    >
                        <MoonStar className="w-5 h-5" />
                    </button>

                    {/* Instant Book - icon only */}
                    <button
                        onClick={() => toggleBooleanFilter('hasInstantBook')}
                        className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.hasInstantBook ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                        title="Instant Booking"
                    >
                        <TicketCheck className="w-5 h-5" />
                    </button>

                    {/* Group Discount - icon only */}
                    <button
                        onClick={() => toggleBooleanFilter('hasGroupDiscount')}
                        className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.hasGroupDiscount ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                        title="Group Discount"
                    >
                        <BadgePercent className="w-5 h-5" />
                    </button>

                    {/* Family Friendly - icon only */}
                    <button
                        onClick={() => toggleBooleanFilter('isFamilyFriendly')}
                        className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.isFamilyFriendly ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                        title="Family Friendly"
                    >
                        <Baby className="w-5 h-5" />
                    </button>

                    {/* Premium - icon only */}
                    <button
                        onClick={() => toggleBooleanFilter('isPremium')}
                        className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.isPremium ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                        title="Premium Tours"
                    >
                        <Star className={`w-5 h-5 ${filters.isPremium ? 'fill-amber-600' : ''}`} />
                    </button>
                </div>

                {/* Separator */}
                <div className="my-4 border-t border-gray-200 dark:border-gray-800" />

                {/* Expand button to show full filters */}
                <button onClick={() => toggleSidebar?.()} className="w-full flex justify-center p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Expand filters">
                    <ChevronDown className="w-5 h-5" />
                </button>
            </div>
        )
    }

    // ========================================
    // EXPANDED MODE RENDERING (Default)
    // ========================================

    return (
        <div className={`w-full bg-blue-50/20 dark:bg-blue-900/5 ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto' : ''} rounded-3xl overflow-hidden`}>

            {/* ========================================
                HEADER - Mobile drawer header
                ======================================== */}
            <div className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-bg-dark-paper/80 backdrop-blur-md border-b border-border-light-default dark:border-border-dark-strong ${isMobile ? '' : 'hidden'}`}>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                        Filters
                    </h2>
                    {activeFilterCount > 0 && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-600 dark:bg-blue-500 text-white rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                        <button onClick={handleClearAll} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            Clear all
                        </button>
                    )}
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Close filters">
                        <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* ========================================
                FILTERS CONTENT
                ======================================== */}
            <div className="px-5 sm:px-6 pb-24">

                {/* ========================================
                    ACTIVE FILTERS SUMMARY
                    ======================================== */}
                {activeFilterCount > 0 && !isMobile && (
                    <div className="flex items-center justify-between mb-4 px-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
                        </span>
                        <button onClick={handleClearAll} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                            Clear all
                        </button>
                    </div>
                )}

                {/* ========================================
                    SECTION 1: LOCATION
                    ======================================== */}
                <FilterSection
                    title="Location"
                    icon={<MapPin className="w-4 h-4" />}
                >
                    <div className="space-y-4">
                        {/* Country filter */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Country
                            </h4>
                            <CheckboxFilter
                                options={countryOptions}
                                selectedValues={filters.countries || []}
                                onChange={(selected) => {
                                    handleFilterChange({ countries: selected as Country[] })
                                    if (selectedCountry && !selected.includes(selectedCountry)) {
                                        setSelectedCountry(null)
                                    }
                                }}
                            />
                        </div>

                        {/* City filter - only show if country selected */}
                        {filters.countries && filters.countries.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        City
                                    </h4>
                                    <div className="relative min-w-[120px]">
                                        <Listbox value={selectedCountry || ''} onChange={(val) => setSelectedCountry(val as Country || null)}>
                                            <div className="relative">
                                                <ListboxButton className="relative w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-bg-light-paper dark:bg-gray-800 border border-border-light-default dark:border-gray-700 rounded-full text-[11px] font-bold text-text-light-primary dark:text-text-dark-primary hover:border-primary-light dark:hover:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light/20 transition-all duration-200">
                                                    <span className="block truncate">
                                                        {selectedCountry ? CountryLabels[selectedCountry] : 'All countries'}
                                                    </span>
                                                    <ChevronDown className="w-3 h-3 text-gray-400 dark:text-gray-500 transition-transform duration-200 ui-open:rotate-180" />
                                                </ListboxButton>

                                                <Transition
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-48 overflow-auto right-0 rounded-xl bg-white dark:bg-gray-900 py-1 text-xs shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none">
                                                        <ListboxOption
                                                            value=""
                                                            className={({ focus, selected }) => `relative cursor-default select-none py-2 pl-8 pr-4 transition-colors ${focus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'} ${selected ? 'font-semibold' : 'font-normal'}`}
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                                        All countries
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-blue-600 dark:text-blue-400">
                                                                            <Check className="w-3.5 h-3.5" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </ListboxOption>
                                                        {filters.countries.map(country => (
                                                            <ListboxOption
                                                                key={country}
                                                                value={country}
                                                                className={({ focus, selected }) => `relative cursor-default select-none py-2 pl-8 pr-4 transition-colors ${focus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'} ${selected ? 'font-semibold' : 'font-normal'}`}
                                                            >
                                                                {({ selected }) => (
                                                                    <>
                                                                        <span className={`block truncate ${selected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                                            {CountryLabels[country]}
                                                                        </span>
                                                                        {selected ? (
                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-blue-600 dark:text-blue-400">
                                                                                <Check className="w-3.5 h-3.5" />
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
                                <CheckboxFilter
                                    options={cityOptions}
                                    selectedValues={filters.cities || []}
                                    onChange={(selected) => handleFilterChange({ cities: selected as City[] })}
                                    limit={5}
                                    showSearch={true}
                                />
                            </div>
                        )}
                    </div>
                </FilterSection>

                {/* ========================================
                    SECTION 2: TOUR ATTRIBUTES
                    ======================================== */}
                <FilterSection
                    title="Tour Features"
                    icon={<Briefcase className="w-4 h-4" />}
                >
                    <div className="space-y-1">
                        {/* Halal certified */}
                        <label className="flex items-center justify-between cursor-pointer group py-2">
                            <span className="flex items-center gap-3 text-[15px] text-gray-700 dark:text-gray-300">
                                <MoonStar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                Halal Certified
                            </span>
                            <button onClick={() => toggleBooleanFilter('isHalalCertified')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${filters.isHalalCertified ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${filters.isHalalCertified ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </label>
 
                        {/* Instant Book */}
                        <label className="flex items-center justify-between cursor-pointer group py-2">
                            <span className="flex items-center gap-3 text-[15px] text-gray-700 dark:text-gray-300">
                                <TicketCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                Instant Booking
                            </span>
                            <button onClick={() => toggleBooleanFilter('hasInstantBook')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${filters.hasInstantBook ? 'bg-amber-600 dark:bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${filters.hasInstantBook ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </label>
 
                        {/* Group Discount */}
                        <label className="flex items-center justify-between cursor-pointer group py-2">
                            <span className="flex items-center gap-3 text-[15px] text-gray-700 dark:text-gray-300">
                                <BadgePercent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                Group Discount
                            </span>
                            <button onClick={() => toggleBooleanFilter('hasGroupDiscount')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${filters.hasGroupDiscount ? 'bg-purple-600 dark:bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${filters.hasGroupDiscount ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </label>
 
                        {/* Family Friendly */}
                        <label className="flex items-center justify-between cursor-pointer group py-2">
                            <span className="flex items-center gap-3 text-[15px] text-gray-700 dark:text-gray-300">
                                <Baby className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                                Family Friendly
                            </span>
                            <button onClick={() => toggleBooleanFilter('isFamilyFriendly')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${filters.isFamilyFriendly ? 'bg-pink-600 dark:bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${filters.isFamilyFriendly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </label>
                    </div>
                </FilterSection>

                {/* ========================================
                    SECTION 3: PRICE RANGE
                    ======================================== */}
                <FilterSection
                    title="Price"
                    icon={<DollarSign className="w-4 h-4" />}
                >
                    <PriceRangeFilter
                        minPrice={filters.minPrice}
                        maxPrice={filters.maxPrice}
                        onChange={(min, max) => handleFilterChange({
                            minPrice: min,
                            maxPrice: max
                        })}
                    />
                </FilterSection>

                {/* ========================================
                    SECTION 4: DURATION
                    ======================================== */}
                <FilterSection
                    title="Duration"
                    icon={<Clock className="w-4 h-4" />}
                >
                    <CheckboxFilter
                        options={durationOptions}
                        selectedValues={filters.durations || []}
                        onChange={(selected) => handleFilterChange({
                            durations: selected as Duration[]
                        })}
                    />
                </FilterSection>

                {/* ========================================
                    SECTION 5: GROUP SIZE
                    ======================================== */}
                <FilterSection
                    title="Group Size"
                    icon={<Users className="w-4 h-4" />}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            {/* Small Group */}
                            <button
                                type="button"
                                onClick={() => {
                                    const isSelected = filters.maxGroupSize === 8 && !filters.minGroupSize;
                                    handleFilterChange({
                                        minGroupSize: undefined,
                                        maxGroupSize: isSelected ? undefined : 8
                                    });
                                }}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                                    filters.maxGroupSize === 8 && !filters.minGroupSize
                                        ? 'bg-primary-light dark:bg-primary-dark text-white border-primary-light dark:border-primary-dark shadow-md'
                                        : 'bg-white dark:bg-transparent border-border-light-default dark:border-border-dark-strong text-text-light-primary dark:text-text-dark-primary hover:border-primary-light dark:hover:border-primary-dark'
                                }`}
                            >
                                Small (1-8)
                            </button>

                            {/* Medium Group */}
                            <button
                                type="button"
                                onClick={() => {
                                    const isSelected = filters.minGroupSize === 9 && filters.maxGroupSize === 20;
                                    handleFilterChange({
                                        minGroupSize: isSelected ? undefined : 9,
                                        maxGroupSize: isSelected ? undefined : 20
                                    });
                                }}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                                    filters.minGroupSize === 9 && filters.maxGroupSize === 20
                                        ? 'bg-primary-light dark:bg-primary-dark text-white border-primary-light dark:border-primary-dark shadow-md'
                                        : 'bg-white dark:bg-transparent border-border-light-default dark:border-border-dark-strong text-text-light-primary dark:text-text-dark-primary hover:border-primary-light dark:hover:border-primary-dark'
                                }`}
                            >
                                Medium (9-20)
                            </button>

                            {/* Large Group */}
                            <button
                                type="button"
                                onClick={() => {
                                    const isSelected = filters.minGroupSize === 21 && !filters.maxGroupSize;
                                    handleFilterChange({
                                        minGroupSize: isSelected ? undefined : 21,
                                        maxGroupSize: undefined
                                    });
                                }}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border col-span-2 ${
                                    filters.minGroupSize === 21 && !filters.maxGroupSize
                                        ? 'bg-primary-light dark:bg-primary-dark text-white border-primary-light dark:border-primary-dark shadow-md'
                                        : 'bg-white dark:bg-transparent border-border-light-default dark:border-border-dark-strong text-text-light-primary dark:text-text-dark-primary hover:border-primary-light dark:hover:border-primary-dark'
                                }`}
                            >
                                Large (21+)
                            </button>
                        </div>

                        {/* Available spots only */}
                        <div className="pt-2">
                            <label className="flex items-center gap-3 cursor-pointer group py-2">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={filters.hasAvailableSpots || false}
                                        onChange={() => toggleBooleanFilter('hasAvailableSpots')}
                                        className="peer absolute opacity-0 w-5 h-5 cursor-pointer"
                                    />
                                    <div className={`w-5 h-5 border-[1.5px] rounded-md transition-all duration-200 flex items-center justify-center ${filters.hasAvailableSpots ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white' : 'bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 group-hover:border-gray-500 dark:group-hover:border-gray-400'}`}>
                                        {filters.hasAvailableSpots && (
                                            <Check className="w-3.5 h-3.5 text-white dark:text-gray-900 stroke-[3]" />
                                        )}
                                    </div>
                                </div>
                                <span className="text-[15px] text-gray-700 dark:text-gray-300 transition-colors">
                                    Only show available spots
                                </span>
                            </label>
                        </div>
                    </div>
                </FilterSection>

                {/* ========================================
                    SECTION 6: GUIDE QUALITY
                    ======================================== */}
                <FilterSection
                    title="Guide Quality"
                    icon={<Shield className="w-4 h-4" />}
                >
                    <div className="space-y-3">

                        {/* Languages */}
                        <div className="pt-2">
                            <h4 className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                <Languages className="w-3.5 h-3.5" />
                                Guide Languages
                            </h4>
                            <CheckboxFilter
                                options={languageOptions}
                                selectedValues={filters.guideLanguages || []}
                                onChange={(selected) => handleFilterChange({
                                    guideLanguages: selected as Language[]
                                })}
                                limit={4}
                            />
                        </div>
                    </div>
                </FilterSection>

                {/* ========================================
                    SECTION 7: RATING
                    ======================================== */}
                <FilterSection
                    title="Rating"
                    icon={<Star className="w-4 h-4" />}
                >
                    <div className="space-y-3 mt-2">
                        {ratingOptions.map(option => (
                            <label
                                key={option.id}
                                className="flex items-center gap-3 cursor-pointer group py-1.5"
                            >
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={option.id}
                                        checked={filters.minRating === option.id}
                                        onChange={() => handleFilterChange({ minRating: option.id as MinRating })}
                                        className="peer absolute opacity-0 w-5 h-5 cursor-pointer"
                                    />
                                    <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all ${filters.minRating === option.id ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-700 group-hover:border-gray-500 dark:group-hover:border-gray-400'}`}>
                                        {filters.minRating === option.id && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-white" />
                                        )}
                                    </div>
                                </div>
                                <span className={`text-[15px] ${filters.minRating === option.id ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </FilterSection>


                {/* ========================================
                    SECTION 9: PREMIUM FEATURES
                    ======================================== */}
                <FilterSection
                    title="Premium"
                    icon={<Star className="w-4 h-4 text-amber-500" />}
                >
                    <label className="flex items-center justify-between cursor-pointer group py-2">
                        <span className="flex items-center gap-3 text-[15px] font-medium text-gray-900 dark:text-white">
                            <Star className={`w-5 h-5 text-amber-500 ${filters.isPremium ? 'fill-amber-500' : ''}`} />
                            Premium Tours Only
                        </span>
                        <button onClick={() => toggleBooleanFilter('isPremium')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${filters.isPremium ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${filters.isPremium ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                    </label>
                </FilterSection>
            </div>

            {/* ========================================
                MOBILE APPLY BUTTON
                ======================================== */}
            {isMobile && (
                <div className="sticky bottom-0 p-4 bg-bg-light-paper dark:bg-bg-dark-paper border-t border-border-light-default dark:border-border-dark-strong">
                    <button onClick={onClose} className="w-full px-4 py-3.5 bg-primary-light dark:bg-primary-dark text-white font-bold rounded-full hover:bg-primary-light-hover dark:hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2">
                        Show Results
                        {activeFilterCount > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}