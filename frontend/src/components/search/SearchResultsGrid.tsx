// ============================================================================
// SEARCH RESULTS GRID - WITH STICKY RESULTS
// ============================================================================
// LOCATION: /frontend/src/components/search/SearchResultsGrid.tsx
// ============================================================================

'use client'

import { useState, useEffect, useMemo, useCallback, Fragment, useRef } from 'react'
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
  Zap,
  FilterX,
  RefreshCw,
  Camera,
  MoonStar,
  TicketCheck,
  Baby,
  BadgePercent,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Check,
  ChevronDown
} from 'lucide-react'

import { getApiUrl } from '@/src/lib/api/client'

const resolveImageUrl = (url: string | null | undefined) => {
  if (!url || url.trim() === '') return null;
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  const baseUrl = getApiUrl();
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
};

import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { 
  useFilterState, 
  useFilterDispatch,
  useSidebarState
} from '@/src/lib/contexts/FilterContext'
import { 
  Country, 
  FilterState, 
  City,
  MinRating,
  Availability,
  Duration
} from './types/filters.types'
import { 
  getPublicTours 
} from '@/src/lib/api/tours'
import { 
  searchGuides,
  PublicGuideProfile
} from '@/src/lib/api/guides'
import { 
  PublicTourCardResponse,
  PublicTourFilters
} from '@/src/lib/types/tour.types'
import { getCountryFlag } from '@/src/lib/utils/tour-utils'
import toast from 'react-hot-toast'
import { useWishlist } from '@/src/lib/contexts/WishlistContext'

import PublicTourCard from '@/src/components/tours/PublicTourCard'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SortOption = 'recommended' | 'price-low' | 'price-high' | 'rating'

function GuideHighlight({ guide }: { guide: PublicGuideProfile }) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group relative flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-br from-primary-light to-primary-dark dark:from-primary-dark dark:to-indigo-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary-light/20 hover:shadow-blue-500/40 transition-all duration-500 hover:scale-[1.01]"
    >
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] surface-card rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[80px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-primary-light/20 dark:border-primary-dark/20 shadow-2xl shrink-0">
        {resolveImageUrl(guide.avatarUrl) ? (
          <Image
            src={resolveImageUrl(guide.avatarUrl)!}
            alt={guide.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-primary-light/10 flex items-center justify-center">
            <User className="w-16 h-16 text-primary-light/30" />
          </div>
        )}
        {guide.verified && (
          <div className="absolute bottom-2 right-2 p-1.5 surface-card rounded-xl shadow-lg">
            <CheckCircle className="w-4 h-4 text-primary-light dark:text-primary-dark fill-current" />
          </div>
        )}
      </div>

      <div className="relative z-10 flex-1 text-center sm:text-left">
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
            Top Match
          </span>
          {guide.expertise.slice(0, 2).map((exp) => (
            <span key={exp} className="px-3 py-1 bg-primary-light/20 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/5">
              {exp}
            </span>
          ))}
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight group-hover:translate-x-1 transition-transform duration-300">
          {guide.name}
        </h3>
        <p className="text-blue-100/80 text-sm font-bold line-clamp-2 max-w-xl mb-4 leading-relaxed">
          "{guide.tagline || guide.bio}"
        </p>
        
        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">Rating</span>
              <span className="text-lg font-bold text-white">{guide.averageRating || 'New'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">Experiences</span>
              <span className="text-lg font-bold text-white">{guide.tourCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 self-center sm:self-end">
        <div className="px-6 py-3 bg-white text-primary-dark rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl group-hover:bg-primary-light group-hover:text-white transition-all duration-300 group-hover:scale-105">
          View Profile
        </div>
      </div>
    </Link>
  )
}

interface SearchResultsGridProps {
  onFilterCountChange: (count: number) => void
  activeFilterCount: number
}

export default function SearchResultsGrid({
  onFilterCountChange,
  activeFilterCount,
}: SearchResultsGridProps) {
  const { isCollapsed } = useSidebarState()
  const [tours, setTours] = useState<PublicTourCardResponse[]>([])
  const [guides, setGuides] = useState<PublicGuideProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { filters } = useFilterState()
  const dispatch = useFilterDispatch()
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  
  // Persistence Refs
  const lastGuidesRef = useRef<PublicGuideProfile[]>([])
  const lastSearchQueryRef = useRef<string | undefined>(undefined)

  const gridClasses = `grid grid-cols-1 sm:grid-cols-2 ${isCollapsed ? 'lg:grid-cols-3 xl:grid-cols-4' : 'xl:grid-cols-3'} gap-8`

  const sortOptions = [
    { id: 'newest', label: 'Newest First', icon: Clock },
    { id: 'price_asc', label: 'Price: Low to High', icon: ArrowUpNarrowWide },
    { id: 'price_desc', label: 'Price: High to Low', icon: ArrowDownWideNarrow },
  ] as const

  const currentSortOption = sortOptions.find(o => o.id === sortBy) || sortOptions[0]

  const lastParamsRef = useRef<string>('')

  const fetchTours = useCallback(async () => {
    // Generate params string to check for changes
    const paramsKey = JSON.stringify({ ...filters, sortBy })
    if (paramsKey === lastParamsRef.current) return
    lastParamsRef.current = paramsKey

    // Only set loading if we don't have existing results to show
    if (tours.length === 0 && guides.length === 0) {
      setLoading(true)
    }
    
    try {
      // ... (rest of the logic)
      const params: PublicTourFilters = {
        halalFriendly: filters.isHalalCertified || undefined,
        instantBook: filters.hasInstantBook || undefined,
        isPremium: filters.isPremium || undefined,
        isFamilyFriendly: filters.isFamilyFriendly || undefined,
        hasGroupDiscount: filters.hasGroupDiscount || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minDuration: filters.minDuration, // simplified
        maxDuration: filters.maxDuration,
        minCap: filters.minGroupSize,
        maxCap: filters.maxGroupSize,
        minRating: filters.minRating && filters.minRating !== MinRating.ANY ? parseFloat(filters.minRating) : undefined,
        language: filters.guideLanguages?.[0] || undefined,
        query: filters.searchQuery || undefined, // use undefined if empty
        sortBy: sortBy,
        regions: filters.countries?.length ? filters.countries.map(c => c.toLowerCase()) : undefined,
        cities: filters.cities?.length ? filters.cities.map(c => c.toLowerCase()) : undefined
      }

      const [res, guideRes] = await Promise.all([
        getPublicTours(params),
        filters.searchQuery ? searchGuides(filters.searchQuery) : Promise.resolve([])
      ])

      const toursData = Array.isArray(res) ? res : []
      const guidesData = Array.isArray(guideRes) ? guideRes : []
      
      setGuides(guidesData)
      setTours(toursData)
      dispatch({ type: 'SET_TOTAL_RESULTS', payload: toursData.length })
    } catch (err: any) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, sortBy, dispatch])

  useEffect(() => {
    fetchTours()
  }, [fetchTours])

  const filteredTours = tours

  if (filteredTours.length === 0 && guides.length === 0 && !loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 surface-section rounded-full flex items-center justify-center mb-6">
          <FilterX className="w-12 h-12 text-gray-300 " />
        </div>
        <h2 className="text-2xl font-bold text-theme-primary mb-2 tracking-tight">No results found</h2>
        <p className="text-sm font-bold text-theme-muted max-w-xs mx-auto mb-8">
          We couldn't find any tours matching your current filters. Try relaxing your search criteria.
        </p>
        <button 
          onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
          className="px-8 py-3 bg-primary-light hover:bg-primary-light-hover text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary-light/20 transition-all active:scale-95"
        >
          Clear All Filters
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-32">
      {/* Header / Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-theme-primary uppercase tracking-widest">
            {filteredTours.length} Experiences
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest whitespace-nowrap">Sort by:</span>
          
          <div className="relative z-40 w-56">
            <Listbox value={sortBy} onChange={setSortBy}>
              <div className="relative">
                <ListboxButton className="relative w-full flex items-center justify-between px-4 py-2.5 text-left surface-section rounded-xl border border-theme text-theme-primary font-bold text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-light/20 transition-all hover:bg-theme-strong/5">
                  <span className="block truncate">{currentSortOption.label}</span>
                  <ChevronDown className="w-4 h-4 text-theme-muted" />
                </ListboxButton>

                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <ListboxOptions className="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-xl surface-card py-1 text-xs shadow-2xl ring-1 ring-black/5 focus:outline-none">
                    {sortOptions.map((option) => (
                      <ListboxOption
                        key={option.id}
                        value={option.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-colors ${
                            active ? 'bg-primary-light/10 text-primary-light' : 'text-theme-primary'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-bold' : 'font-bold'}`}>
                              {option.label}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-light">
                                <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-theme-muted/40">
                                <option.icon className="w-4 h-4" />
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
        </div>
      </div>

      {/* Segmented Results */}
      {guides.length > 0 && (
        <div className={`flex flex-col gap-6 mb-10 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex items-center gap-3">
            <div className="h-px surface-section flex-1" />
            <h2 className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] whitespace-nowrap">
              Guide Matching Your Search
            </h2>
            <div className="h-px surface-section flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-6">
            {guides.slice(0, 1).map(guide => (
              <GuideHighlight key={guide.id} guide={guide} />
            ))}
          </div>
          {guides.length > 1 && (
            <div className="flex justify-center -mt-2">
              <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">
                + {guides.length - 1} more guides found
              </span>
            </div>
          )}
        </div>
      )}

      {guides.length > 0 && tours.length > 0 && (
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px surface-section flex-1" />
          <h2 className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] whitespace-nowrap">
            Experience Results
          </h2>
          <div className="h-px surface-section flex-1" />
        </div>
      )}

      <div className={`${gridClasses} transition-opacity duration-300 ${loading && filteredTours.length > 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {loading && filteredTours.length === 0 ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/5] surface-section rounded-[2rem] animate-pulse shadow-sm" />
          ))
        ) : (
          filteredTours.map((tour, index) => (
            <PublicTourCard key={tour.id} tour={tour} showHint={index === 0} />
          ))
        )}
      </div>
    </div>
  )
}
