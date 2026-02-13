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
    Leaf,
    Zap,
    X,
    Filter,
    Languages,
    Calendar,
    Home,
    Briefcase,
    ChevronDown,
    ChevronUp,
    Check
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
                        <Leaf className="w-5 h-5" />
                    </button>

                    {/* Instant Book - icon only */}
                    <button
                        onClick={() => toggleBooleanFilter('hasInstantBook')}
                        className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.hasInstantBook ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                        title="Instant Booking"
                    >
                        <Zap className="w-5 h-5" />
                    </button>

                    {/* Verified Guide - icon only */}
                    <button
                        onClick={() => toggleBooleanFilter('isGuideVerified')}
                        className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.isGuideVerified ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                        title="Verified Guides Only"
                    >
                        <Shield className="w-5 h-5" />
                    </button>

                    {/* Group Discount - icon only */}
                    <button
                        onClick={() => toggleBooleanFilter('hasGroupDiscount')}
                        className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.hasGroupDiscount ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                        title="Group Discount"
                    >
                        <Users className="w-5 h-5" />
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
        <div className={`w-full h-full bg-white dark:bg-gray-950 ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto' : 'relative'}`}>

            {/* ========================================
                HEADER - Mobile drawer header
                ======================================== */}
            <div className={`
                sticky top-0 z-10
                flex items-center justify-between
                px-4 py-3
                bg-white dark:bg-gray-950
                border-b border-gray-200 dark:border-gray-800
                ${isMobile ? '' : 'hidden'}
            `}>
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
            <div className="p-4 sm:p-5 space-y-1">

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
                    defaultExpanded={!isCollapsed}
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
                                                <ListboxButton className="relative w-full flex items-center justify-between gap-2 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
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
                                                            className={({ focus, selected }) => `
                                                                relative cursor-default select-none
                                                                py-2 pl-8 pr-4 transition-colors
                                                                ${focus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}
                                                                ${selected ? 'font-semibold' : 'font-normal'}
                                                            `}
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
                                                                className={({ focus, selected }) => `
                                                                    relative cursor-default select-none
                                                                    py-2 pl-8 pr-4 transition-colors
                                                                    ${focus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}
                                                                    ${selected ? 'font-semibold' : 'font-normal'}
                                                                `}
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
                    defaultExpanded={!isCollapsed}
                >
                    <div className="space-y-3">
                        {/* Halal certified */}
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                Halal Certified
                            </span>
                            <button onClick={() => toggleBooleanFilter('isHalalCertified')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${filters.isHalalCertified ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${filters.isHalalCertified ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </label>

                        {/* Instant Book */}
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                Instant Booking
                            </span>
                            <button onClick={() => toggleBooleanFilter('hasInstantBook')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${filters.hasInstantBook ? 'bg-amber-600 dark:bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${filters.hasInstantBook ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </label>

                        {/* Group Discount */}
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                Group Discount
                            </span>
                            <button onClick={() => toggleBooleanFilter('hasGroupDiscount')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${filters.hasGroupDiscount ? 'bg-purple-600 dark:bg-purple-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${filters.hasGroupDiscount ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </label>

                        {/* Family Friendly */}
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <Home className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                Family Friendly
                            </span>
                            <button onClick={() => toggleBooleanFilter('isFamilyFriendly')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${filters.isFamilyFriendly ? 'bg-pink-600 dark:bg-pink-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${filters.isFamilyFriendly ? 'translate-x-5' : 'translate-x-0.5'}`} />
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
                    defaultExpanded={!isCollapsed}
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
                    defaultExpanded={!isCollapsed}
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
                    defaultExpanded={!isCollapsed}
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={filters.minGroupSize || ''}
                                onChange={(e) => handleFilterChange({
                                    minGroupSize: e.target.value ? Number(e.target.value) : undefined
                                })}
                                placeholder="Min"
                                min={GROUP_SIZE_RANGE.MIN}
                                max={filters.maxGroupSize || GROUP_SIZE_RANGE.MAX}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Minimum group size"
                            />
                            <span className="text-gray-500 dark:text-gray-400">—</span>
                            <input
                                type="number"
                                value={filters.maxGroupSize || ''}
                                onChange={(e) => handleFilterChange({
                                    maxGroupSize: e.target.value ? Number(e.target.value) : undefined
                                })}
                                placeholder="Max"
                                min={filters.minGroupSize || GROUP_SIZE_RANGE.MIN}
                                max={GROUP_SIZE_RANGE.MAX}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Maximum group size"
                            />
                        </div>

                        {/* Available spots only */}
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={filters.hasAvailableSpots || false}
                                onChange={() => toggleBooleanFilter('hasAvailableSpots')}
                                className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Only show available spots
                            </span>
                        </label>
                    </div>
                </FilterSection>

                {/* ========================================
                    SECTION 6: GUIDE QUALITY
                    ======================================== */}
                <FilterSection
                    title="Guide Quality"
                    icon={<Shield className="w-4 h-4" />}
                    defaultExpanded={!isCollapsed}
                >
                    <div className="space-y-3">
                        {/* Verified guides only */}
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Verified Guides Only
                            </span>
                            <button onClick={() => toggleBooleanFilter('isGuideVerified')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${filters.isGuideVerified ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${filters.isGuideVerified ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </label>

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
                    defaultExpanded={!isCollapsed}
                >
                    <div className="space-y-2">
                        {ratingOptions.map(option => (
                            <label
                                key={option.id}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <input
                                    type="radio"
                                    name="rating"
                                    value={option.id}
                                    checked={filters.minRating === option.id}
                                    onChange={() => handleFilterChange({ minRating: option.id as MinRating })}
                                    className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </FilterSection>

                {/* ========================================
                    SECTION 8: AVAILABILITY
                    ======================================== */}
                <FilterSection
                    title="Availability"
                    icon={<Calendar className="w-4 h-4" />}
                    defaultExpanded={!isCollapsed}
                >
                    <div className="space-y-2">
                        {availabilityOptions.map(option => (
                            <label
                                key={option.id}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <input
                                    type="radio"
                                    name="availability"
                                    value={option.id}
                                    checked={filters.availability === option.id}
                                    onChange={() => handleFilterChange({ availability: option.id as Availability })}
                                    className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
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
                    defaultExpanded={!isCollapsed}
                >
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <Star className="w-4 h-4 text-amber-500" />
                            Premium Tours Only
                        </span>
                        <button onClick={() => toggleBooleanFilter('isPremium')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${filters.isPremium ? 'bg-amber-600 dark:bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${filters.isPremium ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                    </label>
                </FilterSection>
            </div>

            {/* ========================================
                MOBILE APPLY BUTTON
                ======================================== */}
            {isMobile && (
                <div className="sticky bottom-0 p-4 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
                    <button onClick={onClose} className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
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