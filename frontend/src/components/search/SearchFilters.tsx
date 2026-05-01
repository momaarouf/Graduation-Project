// ============================================================================
// SEARCH FILTERS - COMPLETE OVERHAUL
// ============================================================================
// LOCATION: /frontend/src/components/search/SearchFilters.tsx
// 
// CHANGES MADE:
// 
// 1. CONNECTED TO CONTEXT
// - Now uses useFilters() hook instead of local state
// - All filter changes go through FilterContext
// - Results grid automatically reacts to changes
// 
// 2. ADDED COLLAPSIBLE MODE
// - When isCollapsed = true, shows only icons and toggles
// - Saves screen real estate
// - Smooth transition between modes
// 
// 3. FIXED ACTIVE FILTER COUNT
// - Properly counts all active filters
// - Shows badge on mobile button
// - Clear all functionality works
// 
// 4. IMPROVED PERFORMANCE
// - Memoized callbacks with useCallback
// - Memoized options with useMemo
// - Prevents unnecessary re-renders
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
// FILTER DATA OPTIONS
// ============================================================================

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
 // These only change when data changes
 // ========================================

 const countryOptions = useMemo(() =>
 Object.values(Country).map(country => ({
 id: country,
 label: CountryLabels[country]
 }))
 , [])

 const cityOptions = useMemo(() =>
 Object.values(City)
 .filter(city => !selectedCountry || CityCountryMap[city] === selectedCountry)
 .map(city => ({
 id: city,
 label: CityLabels[city]
 }))
 , [selectedCountry])

 const languageOptions = useMemo(() =>
 Object.values(Language).map(lang => ({
 id: lang,
 label: LanguageLabels[lang]
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
 <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-light dark:bg-primary-light text-white text-sm font-bold rounded-full">
 {activeFilterCount}
 </span>
 <button
 onClick={handleClearAll}
 className="block mx-auto mt-2 text-xs text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300"
 title="Clear all filters"
 >
 <X className="w-[18px] h-[18px]" />
 </button>
 </div>
 )}

 {/* Compact filter toggles - icons only */}
 <div className="space-y-4">
 {/* Halal filter - icon only */}
 <button
 onClick={() => toggleBooleanFilter('isHalalCertified')}
 className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.isHalalCertified ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'hover:surface-section dark:hover:surface-card text-theme-secondary '}`}
 title="Halal Certified"
 >
 <MoonStar className="w-5 h-5" />
 </button>

 {/* Instant Book - icon only */}
 <button
 onClick={() => toggleBooleanFilter('hasInstantBook')}
 className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.hasInstantBook ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'hover:surface-section dark:hover:surface-card text-theme-secondary '}`}
 title="Instant Booking"
 >
 <TicketCheck className="w-5 h-5" />
 </button>

 {/* Group Discount - icon only */}
 <button
 onClick={() => toggleBooleanFilter('hasGroupDiscount')}
 className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.hasGroupDiscount ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:surface-section dark:hover:surface-card text-theme-secondary '}`}
 title="Group Discount"
 >
 <BadgePercent className="w-5 h-5" />
 </button>

 {/* Family Friendly - icon only */}
 <button
 onClick={() => toggleBooleanFilter('isFamilyFriendly')}
 className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.isFamilyFriendly ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' : 'hover:surface-section dark:hover:surface-card text-theme-secondary '}`}
 title="Family Friendly"
 >
 <Baby className="w-5 h-5" />
 </button>

 {/* Premium - icon only */}
 <button
 onClick={() => toggleBooleanFilter('isPremium')}
 className={`relative w-full flex justify-center p-2 rounded-lg transition-all duration-200 ${filters.isPremium ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'hover:surface-section dark:hover:surface-card text-theme-secondary '}`}
 title="Premium Tours"
 >
 <Star className={`w-5 h-5 ${filters.isPremium ? 'fill-amber-600' : ''}`} />
 </button>
 </div>

 {/* Separator */}
 <div className="my-4 border-t border-primary-light/20 dark:border-primary-dark/20" />

 {/* Expand button to show full filters */}
 <button onClick={() => toggleSidebar?.()} className="w-full flex justify-center p-2 text-theme-secondary hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors" title="Expand filters">
 <ChevronDown className="w-5 h-5" />
 </button>
 </div>
 )
 }

 // ========================================
 // EXPANDED MODE RENDERING (Default)
 // ========================================

 return (
 <div className={`w-full ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto bg-card-light dark:bg-card-dark rounded-t-3xl' : ''} overflow-visible`}>

 {/* ========================================
 HEADER - Mobile drawer header
 ======================================== */}
 <div className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3 surface-card  border-b border-primary-light/20 dark:border-primary-dark/20 ${isMobile ? '' : 'hidden'}`}>
 <div className="flex items-center gap-2">
 <Filter className="w-5 h-5 text-theme-secondary" />
 <h2 className="font-semibold text-theme-primary">
 Filters
 </h2>
 {activeFilterCount > 0 && (
 <span className="px-1.5 py-0.5 text-xs font-medium bg-primary-light dark:bg-primary-light text-white rounded-full">
 {activeFilterCount}
 </span>
 )}
 </div>

 <div className="flex items-center gap-2">
 {activeFilterCount > 0 && (
 <button onClick={handleClearAll} className="text-xs text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300 transition-colors">
 Clear all
 </button>
 )}
 <button onClick={onClose} className="p-1.5 rounded-lg hover:surface-section dark:hover:surface-card transition-colors" aria-label="Close filters">
 <X className="w-5 h-5 text-theme-secondary" />
 </button>
 </div>
 </div>

 {/* ========================================
 FILTERS CONTENT
 ======================================== */}
 <div className="pb-2">

 {/* ========================================
 ACTIVE FILTERS SUMMARY
 ======================================== */}
 {activeFilterCount > 0 && !isMobile && (
 <div className="flex items-center justify-between mb-4 px-6">
 <span className="text-sm text-theme-secondary ">
 {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
 </span>
 <button onClick={handleClearAll} className="text-xs font-medium text-primary-light dark:text-primary-dark dark:text-primary-dark hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
 Clear all
 </button>
 </div>
 )}

 {/* ========================================
 SECTION 1: LOCATION
 ======================================== */}
 <FilterSection
 title="Location"
 icon={<MapPin className="w-[18px] h-[18px]" />}
 >
 <div className="space-y-4">
 {/* Country filter */}
 <div>
 <h4 className="text-xs font-medium text-theme-muted mb-2">
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
 <h4 className="text-xs font-medium text-theme-muted ">
 City
 </h4>
 <div className="relative min-w-[120px]">
 <Listbox value={selectedCountry || ''} onChange={(val) => setSelectedCountry(val as Country || null)}>
 <div className="relative">
 <ListboxButton className="relative w-full flex items-center justify-between gap-2 px-3 py-1.5 surface-paper border border-primary-light/20 dark:border-primary-dark/20 rounded-full text-[11px] font-bold text-theme-primary hover:border-primary-light dark:hover:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light/20 transition-all duration-200">
 <span className="block truncate">
 {selectedCountry ? CountryLabels[selectedCountry] : 'All countries'}
 </span>
 <ChevronDown className="w-3 h-3 text-theme-muted transition-transform duration-200 ui-open:rotate-180" />
 </ListboxButton>

 <Transition
 leave="transition ease-in duration-100"
 leaveFrom="opacity-100"
 leaveTo="opacity-0"
 >
 <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-48 overflow-auto right-0 rounded-xl surface-card py-1 text-xs shadow-sm ring-1 ring-black/5 dark:ring-white/10 focus:outline-none">
 <ListboxOption
 value=""
 className={({ focus, selected }) => `relative cursor-default select-none py-2 pl-8 pr-4 transition-colors ${focus ? 'bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark ' : 'text-theme-primary'} ${selected ? 'font-semibold' : 'font-normal'}`}
 >
 {({ selected }) => (
 <>
 <span className={`block truncate ${selected ? 'text-primary-light dark:text-primary-dark dark:text-primary-dark ' : ''}`}>
 All countries
 </span>
 {selected ? (
 <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-primary-light dark:text-primary-dark dark:text-primary-dark ">
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
 className={({ focus, selected }) => `relative cursor-default select-none py-2 pl-8 pr-4 transition-colors ${focus ? 'bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark ' : 'text-theme-primary'} ${selected ? 'font-semibold' : 'font-normal'}`}
 >
 {({ selected }) => (
 <>
 <span className={`block truncate ${selected ? 'text-primary-light dark:text-primary-dark dark:text-primary-dark ' : ''}`}>
 {CountryLabels[country]}
 </span>
 {selected ? (
 <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-primary-light dark:text-primary-dark dark:text-primary-dark ">
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
 icon={<Briefcase className="w-[18px] h-[18px]" />}
 >
 <div className="space-y-1">
 {/* Halal certified */}
 <label className="flex items-center justify-between cursor-pointer group py-2">
 <span className="flex items-center gap-3 text-[15px] text-theme-secondary">
 <MoonStar className="w-5 h-5 text-success-green dark:text-emerald-400" />
 Halal Certified
 </span>
 <button onClick={() => toggleBooleanFilter('isHalalCertified')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${filters.isHalalCertified ? 'bg-emerald-600 dark:bg-emerald-500' : 'surface-section'}`}>
 <span className={`inline-block h-5 w-5 transform rounded-full surface-card transition-transform duration-200 shadow-sm ${filters.isHalalCertified ? 'translate-x-5' : 'translate-x-0.5'}`} />
 </button>
 </label>
 
 {/* Instant Book */}
 <label className="flex items-center justify-between cursor-pointer group py-2">
 <span className="flex items-center gap-3 text-[15px] text-theme-secondary">
 <TicketCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
 Instant Booking
 </span>
 <button onClick={() => toggleBooleanFilter('hasInstantBook')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${filters.hasInstantBook ? 'bg-amber-600 dark:bg-amber-500' : 'surface-section'}`}>
 <span className={`inline-block h-5 w-5 transform rounded-full surface-card transition-transform duration-200 shadow-sm ${filters.hasInstantBook ? 'translate-x-5' : 'translate-x-0.5'}`} />
 </button>
 </label>
 
 {/* Group Discount */}
 <label className="flex items-center justify-between cursor-pointer group py-2">
 <span className="flex items-center gap-3 text-[15px] text-theme-secondary">
 <BadgePercent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
 Group Discount
 </span>
 <button onClick={() => toggleBooleanFilter('hasGroupDiscount')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${filters.hasGroupDiscount ? 'bg-purple-600 dark:bg-purple-500' : 'surface-section'}`}>
 <span className={`inline-block h-5 w-5 transform rounded-full surface-card transition-transform duration-200 shadow-sm ${filters.hasGroupDiscount ? 'translate-x-5' : 'translate-x-0.5'}`} />
 </button>
 </label>
 
 {/* Family Friendly */}
 <label className="flex items-center justify-between cursor-pointer group py-2">
 <span className="flex items-center gap-3 text-[15px] text-theme-secondary">
 <Baby className="w-5 h-5 text-pink-600 dark:text-pink-400" />
 Family Friendly
 </span>
 <button onClick={() => toggleBooleanFilter('isFamilyFriendly')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${filters.isFamilyFriendly ? 'bg-pink-600 dark:bg-pink-500' : 'surface-section'}`}>
 <span className={`inline-block h-5 w-5 transform rounded-full surface-card transition-transform duration-200 shadow-sm ${filters.isFamilyFriendly ? 'translate-x-5' : 'translate-x-0.5'}`} />
 </button>
 </label>
 </div>
 </FilterSection>

 {/* ========================================
 SECTION 3: PRICE RANGE
 ======================================== */}
 <FilterSection
 title="Price"
 icon={<DollarSign className="w-[18px] h-[18px]" />}
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
 icon={<Clock className="w-[18px] h-[18px]" />}
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
 icon={<Users className="w-[18px] h-[18px]" />}
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
 className={`px-4 py-3 rounded-none text-sm font-medium transition-all border ${
 filters.maxGroupSize === 8 && !filters.minGroupSize
 ? 'bg-primary-light dark:bg-primary-dark text-white border-primary-light dark:border-primary-dark shadow-md'
 : 'surface-card border-primary-light/20 dark:border-primary-dark/20 text-theme-primary hover:border-primary-light dark:hover:border-primary-dark'
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
 className={`px-4 py-3 rounded-none text-sm font-medium transition-all border ${
 filters.minGroupSize === 9 && filters.maxGroupSize === 20
 ? 'bg-primary-light dark:bg-primary-dark text-white border-primary-light dark:border-primary-dark shadow-md'
 : 'surface-card border-primary-light/20 dark:border-primary-dark/20 text-theme-primary hover:border-primary-light dark:hover:border-primary-dark'
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
 className={`px-4 py-3 rounded-none text-sm font-medium transition-all border col-span-2 ${
 filters.minGroupSize === 21 && !filters.maxGroupSize
 ? 'bg-primary-light dark:bg-primary-dark text-white border-primary-light dark:border-primary-dark shadow-md'
 : 'surface-card border-primary-light/20 dark:border-primary-dark/20 text-theme-primary hover:border-primary-light dark:hover:border-primary-dark'
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
 <div className={`w-5 h-5 border-[1.5px] rounded-md transition-all duration-200 flex items-center justify-center ${filters.hasAvailableSpots ? 'surface-base border-primary-light/20 dark:border-primary-dark/20-strong dark:border-primary-light/20 dark:border-primary-dark/20' : 'surface-card border-primary-light/20 dark:border-primary-dark/20-strong group-hover:border-primary-light/20 dark:border-primary-dark/20-strong dark:group-hover:border-primary-light/20 dark:border-primary-dark/20-strong'}`}>
 {filters.hasAvailableSpots && (
 <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
 )}
 </div>
 </div>
 <span className="text-[15px] text-theme-secondary transition-colors">
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
 icon={<Shield className="w-[18px] h-[18px]" />}
 >
 <div className="space-y-3">

 {/* Languages */}
 <div className="pt-2">
 <h4 className="flex items-center gap-2 text-xs font-medium text-theme-muted mb-2">
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
 icon={<Star className="w-[18px] h-[18px]" />}
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
 <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all ${filters.minRating === option.id ? 'border-primary-light/20 dark:border-primary-dark/20-strong dark:border-primary-light/20 dark:border-primary-dark/20' : 'border-primary-light/20 dark:border-primary-dark/20-strong group-hover:border-primary-light/20 dark:border-primary-dark/20-strong dark:group-hover:border-primary-light/20 dark:border-primary-dark/20-strong'}`}>
 {filters.minRating === option.id && (
 <div className="w-2.5 h-2.5 rounded-full surface-base " />
 )}
 </div>
 </div>
 <span className={`text-[15px] ${filters.minRating === option.id ? 'text-theme-primary font-medium' : 'text-theme-secondary'}`}>
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
 icon={<Star className="w-[18px] h-[18px] text-accent-light dark:text-accent-dark" />}
 >
 <label className="flex items-center justify-between cursor-pointer group py-2">
 <span className="flex items-center gap-3 text-[15px] font-medium text-theme-primary">
 <Star className={`w-5 h-5 text-accent-light dark:text-accent-dark ${filters.isPremium ? 'fill-amber-500' : ''}`} />
 Premium Tours Only
 </span>
 <button onClick={() => toggleBooleanFilter('isPremium')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${filters.isPremium ? 'bg-amber-500' : 'surface-section'}`}>
 <span className={`inline-block h-5 w-5 transform rounded-full surface-card transition-transform duration-200 shadow-sm ${filters.isPremium ? 'translate-x-5' : 'translate-x-0.5'}`} />
 </button>
 </label>
 </FilterSection>
 </div>

 {/* ========================================
 MOBILE APPLY BUTTON
 ======================================== */}
 {isMobile && (
 <div className="sticky bottom-0 p-4 surface-paper border-t border-primary-light/20 dark:border-primary-dark/20 ">
 <button onClick={onClose} className="w-full px-4 py-3.5 bg-primary-light dark:bg-primary-dark text-white font-bold rounded-full hover:bg-primary-light-hover dark:hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2">
 Show Results
 {activeFilterCount > 0 && (
 <span className="ml-2 px-1.5 py-0.5 surface-card rounded-full text-xs">
 {activeFilterCount}
 </span>
 )}
 </button>
 </div>
 )}
 </div>
 )
}
