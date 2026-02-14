'use client'

// ============================================================================
// POWER SEARCH COMPONENT - CARD 10
// ============================================================================
// LOCATION: /frontend/src/components/search/PowerSearch.tsx
// 
// PURPOSE: Advanced search with multiple filter options
// 
// BUSINESS REQUIREMENTS:
// ✓ Group discounts filter
// ✓ Halal filters
// ✓ Language filters  
// ✓ Price range with slider
// ✓ Duration filters
// ✓ Advanced toggle options
// 
// FEATURES:
// - Modal/drawer interface
// - All filters in one place
// - Real-time result count
// - Save search preferences
// - Clear all option
// 
// COLOR PSYCHOLOGY:
// - Blue: Primary actions, selected filters
// - Orange: CTA buttons, search
// - Green: Active/Halal filters
// - Gray: Inactive states
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search,
  X,
  Filter,
  DollarSign,
  Clock,
  Users,
  Globe,
  Leaf,
  Zap,
  Star,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
  Heart,
  Shield,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import PriceSlider from './PriceSlider'
import { useFilters, useApplyFilters } from '@/src/lib/contexts/FilterContext'
import {
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
  PRICE_RANGE
} from '@/src/components/search/types/filters.types'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PowerSearchProps {
  /** Is the power search modal open? */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
  /** Initial search query */
  initialQuery?: string
  /** Show in compact mode (for mobile) */
  compact?: boolean
}

// ============================================================================
// FEATURE TOGGLE OPTIONS
// ============================================================================

const FEATURE_TOGGLES = [
  {
    id: 'halal',
    label: 'Halal Certified',
    icon: Leaf,
    color: 'emerald',
    description: 'Tours with halal food and prayer spaces'
  },
  {
    id: 'instantBook',
    label: 'Instant Booking',
    icon: Zap,
    color: 'amber',
    description: 'Book immediately without waiting'
  },
  {
    id: 'groupDiscount',
    label: 'Group Discount',
    icon: Users,
    color: 'purple',
    description: '5% off for groups of 4+'
  },
  {
    id: 'verifiedGuides',
    label: 'Verified Guides',
    icon: Shield,
    color: 'blue',
    description: 'Only guides with ID verification'
  },
  {
    id: 'familyFriendly',
    label: 'Family Friendly',
    icon: Heart,
    color: 'pink',
    description: 'Suitable for children and families'
  },
  {
    id: 'premium',
    label: 'Premium Tours',
    icon: Star,
    color: 'amber',
    description: 'Top-rated, exclusive experiences'
  }
] as const

// ============================================================================
// TOGGLE BUTTON COMPONENT
// ============================================================================

interface ToggleButtonProps {
  icon: React.ElementType
  label: string
  description?: string
  isActive: boolean
  onClick: () => void
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink'
}

function ToggleButton({ 
  icon: Icon, 
  label, 
  description, 
  isActive, 
  onClick, 
  color 
}: ToggleButtonProps) {
  
  const colorClasses = {
    blue: {
      active: 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700',
      inactive: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700',
      icon: isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'
    },
    emerald: {
      active: 'bg-emerald-600 dark:bg-emerald-700 text-white border-emerald-600 dark:border-emerald-700',
      inactive: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700',
      icon: isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
    },
    amber: {
      active: 'bg-amber-600 dark:bg-amber-700 text-white border-amber-600 dark:border-amber-700',
      inactive: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700',
      icon: isActive ? 'text-white' : 'text-amber-600 dark:text-amber-400'
    },
    purple: {
      active: 'bg-purple-600 dark:bg-purple-700 text-white border-purple-600 dark:border-purple-700',
      inactive: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700',
      icon: isActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'
    },
    pink: {
      active: 'bg-pink-600 dark:bg-pink-700 text-white border-pink-600 dark:border-pink-700',
      inactive: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-700',
      icon: isActive ? 'text-white' : 'text-pink-600 dark:text-pink-400'
    }
  }

  const classes = colorClasses[color]

  return (
    <button
      onClick={onClick}
      className={`
        group relative
        flex items-start gap-3
        w-full
        p-4
        border-2
        rounded-xl
        transition-all duration-300
        text-left
        hover:shadow-md
        ${isActive ? classes.active : classes.inactive}
      `}
    >
      {/* Icon */}
      <div className={`
        flex-shrink-0
        w-10 h-10
        rounded-lg
        flex items-center justify-center
        transition-all duration-300
        ${isActive ? 'bg-white/20' : `bg-${color}-50 dark:bg-${color}-950/30`}
      `}>
        <Icon className={`
          w-5 h-5
          transition-all duration-300
          ${classes.icon}
        `} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm sm:text-base">
            {label}
          </span>
          {isActive && (
            <Check className="w-4 h-4" />
          )}
        </div>
        {description && (
          <p className={`
            text-xs
            ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}
          `}>
            {description}
          </p>
        )}
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </div>
      )}
    </button>
  )
}

// ============================================================================
// SECTION HEADER COMPONENT
// ============================================================================

interface SectionHeaderProps {
  title: string
  icon: React.ElementType
  onClear?: () => void
  showClear?: boolean
}

function SectionHeader({ title, icon: Icon, onClear, showClear }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      {showClear && onClear && (
        <button
          onClick={onClear}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}

// ============================================================================
// MAIN POWER SEARCH COMPONENT
// ============================================================================

export default function PowerSearch({ 
  isOpen, 
  onClose, 
  initialQuery = '',
  compact = false 
}: PowerSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // ========================================
  // STATE
  // ========================================
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedCountry, setSelectedCountry] = useState<Country | ''>('')
  const [selectedCity, setSelectedCity] = useState<City | ''>('')
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([])
  const [selectedDurations, setSelectedDurations] = useState<Duration[]>([])
  const [selectedRating, setSelectedRating] = useState<MinRating | ''>('')
  const [priceRange, setPriceRange] = useState<[number, number]>([
    PRICE_RANGE.MIN,
    PRICE_RANGE.MAX
  ])
  
  // Feature toggles
  const [halal, setHalal] = useState(false)
  const [instantBook, setInstantBook] = useState(false)
  const [groupDiscount, setGroupDiscount] = useState(false)
  const [verifiedGuides, setVerifiedGuides] = useState(false)
  const [familyFriendly, setFamilyFriendly] = useState(false)
  const [premium, setPremium] = useState(false)

  // UI state
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    price: true,
    features: true,
    duration: true,
    languages: true,
    rating: true
  })

  // ========================================
  // CONTEXT
  // ========================================
  const { filters } = useFilters()
  const { applyFilters } = useApplyFilters()

  // ========================================
  // DERIVED VALUES
  // ========================================
  const activeFilterCount = [
    searchQuery,
    selectedCountry,
    selectedCity,
    ...selectedLanguages,
    ...selectedDurations,
    selectedRating,
    halal,
    instantBook,
    groupDiscount,
    verifiedGuides,
    familyFriendly,
    premium,
    priceRange[0] > PRICE_RANGE.MIN,
    priceRange[1] < PRICE_RANGE.MAX
  ].filter(Boolean).length

  // ========================================
  // HANDLERS
  // ========================================

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleLanguageToggle = (language: Language) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    )
  }

  const handleDurationToggle = (duration: Duration) => {
    setSelectedDurations(prev =>
      prev.includes(duration)
        ? prev.filter(d => d !== duration)
        : [...prev, duration]
    )
  }

  const handleClearAll = () => {
    setSearchQuery('')
    setSelectedCountry('')
    setSelectedCity('')
    setSelectedLanguages([])
    setSelectedDurations([])
    setSelectedRating('')
    setPriceRange([PRICE_RANGE.MIN, PRICE_RANGE.MAX])
    setHalal(false)
    setInstantBook(false)
    setGroupDiscount(false)
    setVerifiedGuides(false)
    setFamilyFriendly(false)
    setPremium(false)
  }

  const handleSearch = () => {
    // Build filter object
    const filters: any = {}
    
    if (searchQuery) filters.q = searchQuery
    if (selectedCountry) filters.country = selectedCountry
    if (selectedCity) filters.city = selectedCity
    if (selectedLanguages.length) filters.languages = selectedLanguages
    if (selectedDurations.length) filters.durations = selectedDurations
    if (selectedRating) filters.minRating = selectedRating
    if (priceRange[0] > PRICE_RANGE.MIN) filters.minPrice = priceRange[0]
    if (priceRange[1] < PRICE_RANGE.MAX) filters.maxPrice = priceRange[1]
    if (halal) filters.halal = true
    if (instantBook) filters.instantBook = true
    if (groupDiscount) filters.groupDiscount = true
    if (verifiedGuides) filters.verifiedGuides = true
    if (familyFriendly) filters.familyFriendly = true
    if (premium) filters.premium = true

    // Apply filters through context
    applyFilters(filters)

    // Build URL params
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (selectedCountry) params.append('country', selectedCountry)
    if (selectedCity) params.append('city', selectedCity)
    if (selectedRating) params.append('rating', selectedRating)
    if (priceRange[0] > PRICE_RANGE.MIN) params.append('minPrice', priceRange[0].toString())
    if (priceRange[1] < PRICE_RANGE.MAX) params.append('maxPrice', priceRange[1].toString())
    if (halal) params.append('halal', 'true')
    if (instantBook) params.append('instantBook', 'true')
    if (groupDiscount) params.append('groupDiscount', 'true')
    if (verifiedGuides) params.append('verifiedGuides', 'true')
    if (familyFriendly) params.append('familyFriendly', 'true')
    if (premium) params.append('premium', 'true')
    
    selectedLanguages.forEach(lang => params.append('language', lang))
    selectedDurations.forEach(dur => params.append('duration', dur))

    // Navigate to tours page with filters
    router.push(`/tours?${params.toString()}`)
    onClose()
  }

  // Initialize from URL params on mount
  useEffect(() => {
    const q = searchParams.get('q')
    const country = searchParams.get('country') as Country
    const city = searchParams.get('city') as City
    const rating = searchParams.get('rating') as MinRating
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const halalParam = searchParams.get('halal')
    const instantBookParam = searchParams.get('instantBook')
    const groupDiscountParam = searchParams.get('groupDiscount')
    const verifiedParam = searchParams.get('verifiedGuides')
    const familyParam = searchParams.get('familyFriendly')
    const premiumParam = searchParams.get('premium')
    const languages = searchParams.getAll('language') as Language[]
    const durations = searchParams.getAll('duration') as Duration[]

    if (q) setSearchQuery(q)
    if (country) setSelectedCountry(country)
    if (city) setSelectedCity(city)
    if (rating) setSelectedRating(rating)
    if (minPrice) setPriceRange(prev => [parseInt(minPrice), prev[1]])
    if (maxPrice) setPriceRange(prev => [prev[0], parseInt(maxPrice)])
    if (halalParam) setHalal(true)
    if (instantBookParam) setInstantBook(true)
    if (groupDiscountParam) setGroupDiscount(true)
    if (verifiedParam) setVerifiedGuides(true)
    if (familyParam) setFamilyFriendly(true)
    if (premiumParam) setPremium(true)
    if (languages.length) setSelectedLanguages(languages)
    if (durations.length) setSelectedDurations(durations)
  }, [searchParams])

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* ========================================
          HEADER
          ======================================== */}
      <div className="sticky top-0 z-10 px-4 sm:px-6 py-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              Power Search
            </h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 dark:bg-blue-700 text-white text-xs font-medium rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tours, destinations, or guides..."
            className="
              w-full
              pl-9 pr-4 py-3
              bg-gray-50 dark:bg-gray-900
              border border-gray-200 dark:border-gray-800
              rounded-xl
              text-sm
              text-gray-900 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-all
            "
          />
        </div>
      </div>

      {/* ========================================
          FILTERS CONTENT (Scrollable)
          ======================================== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* ========================================
            LOCATION SECTION
            ======================================== */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
          <SectionHeader 
            title="Location" 
            icon={Globe}
            onClear={() => {
              setSelectedCountry('')
              setSelectedCity('')
            }}
            showClear={!!selectedCountry || !!selectedCity}
          />
          
          <div className="space-y-4">
            {/* Country dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Country
              </label>
              <Listbox value={selectedCountry} onChange={setSelectedCountry}>
                <div className="relative">
                  <ListboxButton className="
                    w-full
                    flex items-center justify-between
                    px-4 py-3
                    bg-gray-50 dark:bg-gray-900
                    border border-gray-200 dark:border-gray-800
                    rounded-xl
                    text-sm text-left
                    text-gray-900 dark:text-white
                    hover:border-blue-400 dark:hover:border-blue-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition-all
                  ">
                    <span className="block truncate">
                      {selectedCountry ? CountryLabels[selectedCountry] : 'Any country'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </ListboxButton>

                  <Transition
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <ListboxOptions className="
                      absolute z-20 mt-1 w-full
                      max-h-60 overflow-auto
                      bg-white dark:bg-gray-900
                      border border-gray-200 dark:border-gray-800
                      rounded-xl
                      shadow-lg
                      focus:outline-none
                    ">
                      <ListboxOption
                        value=""
                        className={({ focus, selected }) => `
                          relative cursor-default select-none
                          py-2.5 pl-10 pr-4
                          ${focus ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                          ${selected ? 'font-semibold' : ''}
                        `}
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}`}>
                              Any country
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                <Check className="w-4 h-4" />
                              </span>
                            )}
                          </>
                        )}
                      </ListboxOption>
                      {Object.values(Country).map((country) => (
                        <ListboxOption
                          key={country}
                          value={country}
                          className={({ focus, selected }) => `
                            relative cursor-default select-none
                            py-2.5 pl-10 pr-4
                            ${focus ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                            ${selected ? 'font-semibold' : ''}
                          `}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}`}>
                                {CountryLabels[country]}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                  <Check className="w-4 h-4" />
                                </span>
                              )}
                            </>
                          )}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </Transition>
                </div>
              </Listbox>
            </div>

            {/* City dropdown - only shown if country selected */}
            {selectedCountry && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  City
                </label>
                <Listbox value={selectedCity} onChange={setSelectedCity}>
                  <div className="relative">
                    <ListboxButton className="
                      w-full
                      flex items-center justify-between
                      px-4 py-3
                      bg-gray-50 dark:bg-gray-900
                      border border-gray-200 dark:border-gray-800
                      rounded-xl
                      text-sm text-left
                      text-gray-900 dark:text-white
                      hover:border-blue-400 dark:hover:border-blue-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      transition-all
                    ">
                      <span className="block truncate">
                        {selectedCity ? CityLabels[selectedCity] : 'Any city'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </ListboxButton>

                    <Transition
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <ListboxOptions className="
                        absolute z-20 mt-1 w-full
                        max-h-60 overflow-auto
                        bg-white dark:bg-gray-900
                        border border-gray-200 dark:border-gray-800
                        rounded-xl
                        shadow-lg
                        focus:outline-none
                      ">
                        <ListboxOption
                          value=""
                          className={({ focus, selected }) => `
                            relative cursor-default select-none
                            py-2.5 pl-10 pr-4
                            ${focus ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                            ${selected ? 'font-semibold' : ''}
                          `}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}`}>
                                Any city
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                  <Check className="w-4 h-4" />
                                </span>
                              )}
                            </>
                          )}
                        </ListboxOption>
                        {Object.values(City)
                          .filter(city => CityCountryMap[city] === selectedCountry)
                          .map((city) => (
                            <ListboxOption
                              key={city}
                              value={city}
                              className={({ focus, selected }) => `
                                relative cursor-default select-none
                                py-2.5 pl-10 pr-4
                                ${focus ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                                ${selected ? 'font-semibold' : ''}
                              `}
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}`}>
                                    {CityLabels[city]}
                                  </span>
                                  {selected && (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                      <Check className="w-4 h-4" />
                                    </span>
                                  )}
                                </>
                              )}
                            </ListboxOption>
                          ))}
                      </ListboxOptions>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            )}
          </div>
        </div>

        {/* ========================================
            PRICE RANGE SECTION
            ======================================== */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
          <SectionHeader 
            title="Price Range" 
            icon={DollarSign}
            onClear={() => setPriceRange([PRICE_RANGE.MIN, PRICE_RANGE.MAX])}
            showClear={priceRange[0] > PRICE_RANGE.MIN || priceRange[1] < PRICE_RANGE.MAX}
          />
          
          <PriceSlider
            min={priceRange[0]}
            max={priceRange[1]}
            onChange={setPriceRange}
            absoluteMin={PRICE_RANGE.MIN}
            absoluteMax={PRICE_RANGE.MAX}
          />
        </div>

        {/* ========================================
            FEATURES SECTION (Toggle Grid)
            ======================================== */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
          <SectionHeader 
            title="Tour Features" 
            icon={Filter}
            onClear={() => {
              setHalal(false)
              setInstantBook(false)
              setGroupDiscount(false)
              setVerifiedGuides(false)
              setFamilyFriendly(false)
              setPremium(false)
            }}
            showClear={halal || instantBook || groupDiscount || verifiedGuides || familyFriendly || premium}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToggleButton
              icon={Leaf}
              label="Halal Certified"
              description="Prayer spaces & halal food"
              isActive={halal}
              onClick={() => setHalal(!halal)}
              color="emerald"
            />
            <ToggleButton
              icon={Zap}
              label="Instant Booking"
              description="Book without waiting"
              isActive={instantBook}
              onClick={() => setInstantBook(!instantBook)}
              color="amber"
            />
            <ToggleButton
              icon={Users}
              label="Group Discount"
              description="5% off for 4+ people"
              isActive={groupDiscount}
              onClick={() => setGroupDiscount(!groupDiscount)}
              color="purple"
            />
            <ToggleButton
              icon={Shield}
              label="Verified Guides"
              description="ID-verified professionals"
              isActive={verifiedGuides}
              onClick={() => setVerifiedGuides(!verifiedGuides)}
              color="blue"
            />
            <ToggleButton
              icon={Heart}
              label="Family Friendly"
              description="Suitable for all ages"
              isActive={familyFriendly}
              onClick={() => setFamilyFriendly(!familyFriendly)}
              color="pink"
            />
            <ToggleButton
              icon={Star}
              label="Premium Tours"
              description="Top-rated experiences"
              isActive={premium}
              onClick={() => setPremium(!premium)}
              color="amber"
            />
          </div>
        </div>

        {/* ========================================
            DURATION SECTION
            ======================================== */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
          <SectionHeader 
            title="Duration" 
            icon={Clock}
            onClear={() => setSelectedDurations([])}
            showClear={selectedDurations.length > 0}
          />
          
          <div className="flex flex-wrap gap-2">
            {Object.values(Duration).map((duration) => {
              const isSelected = selectedDurations.includes(duration)
              return (
                <button
                  key={duration}
                  onClick={() => handleDurationToggle(duration)}
                  className={`
                    px-4 py-2.5
                    rounded-xl
                    text-sm font-medium
                    transition-all duration-200
                    ${isSelected
                      ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {DurationLabels[duration]}
                </button>
              )
            })}
          </div>
        </div>

        {/* ========================================
            LANGUAGES SECTION
            ======================================== */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
          <SectionHeader 
            title="Guide Languages" 
            icon={Globe}
            onClear={() => setSelectedLanguages([])}
            showClear={selectedLanguages.length > 0}
          />
          
          <div className="flex flex-wrap gap-2">
            {Object.values(Language).map((language) => {
              const isSelected = selectedLanguages.includes(language)
              return (
                <button
                  key={language}
                  onClick={() => handleLanguageToggle(language)}
                  className={`
                    px-4 py-2.5
                    rounded-xl
                    text-sm font-medium
                    transition-all duration-200
                    ${isSelected
                      ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {LanguageLabels[language]}
                </button>
              )
            })}
          </div>
        </div>

        {/* ========================================
            RATING SECTION
            ======================================== */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
          <SectionHeader 
            title="Minimum Rating" 
            icon={Star}
            onClear={() => setSelectedRating('')}
            showClear={!!selectedRating}
          />
          
          <div className="flex flex-wrap gap-2">
            {Object.values(MinRating).map((rating) => {
              const isSelected = selectedRating === rating
              return (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`
                    px-4 py-2.5
                    rounded-xl
                    text-sm font-medium
                    transition-all duration-200
                    ${isSelected
                      ? 'bg-amber-600 dark:bg-amber-700 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {MinRatingLabels[rating]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========================================
          FOOTER - Search Button
          ======================================== */}
      <div className="sticky bottom-0 px-4 sm:px-6 py-4 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleSearch}
          className="
            w-full
            py-4
            bg-gradient-to-r from-blue-600 to-indigo-600
            dark:from-blue-700 dark:to-indigo-700
            text-white font-bold
            rounded-xl
            hover:from-blue-700 hover:to-indigo-700
            dark:hover:from-blue-800 dark:hover:to-indigo-800
            transition-all
            shadow-lg hover:shadow-xl
            flex items-center justify-center gap-2
          "
        >
          <Search className="w-5 h-5" />
          Search {activeFilterCount > 0 ? `(${activeFilterCount} filters)` : ''}
        </button>
      </div>
    </div>
  )
}