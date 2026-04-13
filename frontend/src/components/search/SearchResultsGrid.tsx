// ============================================================================
// SEARCH RESULTS GRID - WITH REAL API INTEGRATION
// ============================================================================
// LOCATION: /frontend/src/components/search/SearchResultsGrid.tsx
// ============================================================================

'use client'

import { useState, useEffect, useMemo, useCallback, Fragment } from 'react'
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
            className="group relative flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-500 hover:scale-[1.01]"
        >
            {/* Animated Background Mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[80px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[80px] animate-pulse delay-700" />
            </div>

            <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl shrink-0">
                {guide.avatarUrl ? (
                    <Image
                        src={guide.avatarUrl}
                        alt={guide.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 bg-blue-500/50 flex items-center justify-center">
                        <User className="w-12 h-12 text-white/50" />
                    </div>
                )}
                {guide.verified && (
                    <div className="absolute bottom-2 right-2 p-1.5 bg-white rounded-xl shadow-lg">
                        <CheckCircle className="w-4 h-4 text-blue-600 fill-current" />
                    </div>
                )}
            </div>

            <div className="relative z-10 flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest mb-3 border border-white/10">
                    <Award className="w-3 h-3 text-amber-300" />
                    Top Guide Match
                </div>
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight group-hover:translate-x-1 transition-transform">
                    {guide.name}
                </h3>
                <p className="text-blue-100 font-bold text-sm mb-4 line-clamp-2 max-w-xl">
                    {guide.tagline || 'Professional tour guide specializing in local experiences and cultural discovery.'}
                </p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Tours</span>
                        <span className="text-lg font-black text-white">{guide.tourCount}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Rating</span>
                        <span className="text-lg font-black text-white flex items-center gap-1.5">
                            {guide.averageRating ? (
                                <>
                                    {guide.averageRating.toFixed(1)}
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                </>
                            ) : (
                                <span className="text-[10px] font-bold text-blue-300 italic opacity-80 whitespace-nowrap">New Guide</span>
                            )}
                        </span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">trips</span>
                        <span className="text-lg font-black text-white">{guide.totalGuidedTrips}+</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center sm:items-end justify-center">
                <div className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl group-hover:bg-blue-50 transition-colors whitespace-nowrap">
                    View Profile
                </div>
            </div>
        </Link>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface SearchResultsGridProps {
    onFilterCountChange?: (count: number) => void
    activeFilterCount?: number
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

    const gridClasses = `grid grid-cols-1 sm:grid-cols-2 ${isCollapsed ? 'lg:grid-cols-3 xl:grid-cols-4' : 'xl:grid-cols-3'} gap-8`

    const sortOptions = [
        { id: 'newest', label: 'Newest First', icon: Clock },
        { id: 'price_asc', label: 'Price: Low to High', icon: ArrowUpNarrowWide },
        { id: 'price_desc', label: 'Price: High to Low', icon: ArrowDownWideNarrow },
    ] as const

    const currentSortOption = sortOptions.find(o => o.id === sortBy) || sortOptions[0]

    const fetchTours = useCallback(async () => {
        setLoading(true)
        try {
            // Bridge filter state to API params
            let minDuration: number | undefined
            let maxDuration: number | undefined

            if (filters.durations?.length) {
                const hourRanges = filters.durations.map(d => {
                    if (d === Duration.SHORT) return [1, 3]
                    if (d === Duration.MEDIUM) return [3, 6]
                    if (d === Duration.LONG) return [6, 12]
                    if (d === Duration.FULL_DAY) return [12, 99]
                    return [0, 99]
                })
                minDuration = Math.min(...hourRanges.map(r => r[0])) * 60
                maxDuration = Math.max(...hourRanges.map(r => r[1])) * 60
            }

            const params: PublicTourFilters = {
                // Only send if true, otherwise leave undefined so it's not filtered
                halalFriendly: filters.isHalalCertified || undefined,
                instantBook: filters.hasInstantBook || undefined,
                isPremium: filters.isPremium || undefined,
                isFamilyFriendly: filters.isFamilyFriendly || undefined,
                hasGroupDiscount: filters.hasGroupDiscount || undefined,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                minDuration,
                maxDuration,
                minCap: filters.minGroupSize,
                maxCap: filters.maxGroupSize,
                minRating: filters.minRating && filters.minRating !== MinRating.ANY ? parseFloat(filters.minRating) : undefined,
                language: filters.guideLanguages?.[0] || undefined,
                query: filters.searchQuery,
                sortBy: sortBy,
                regions: filters.countries?.length ? filters.countries.map(c => c.toLowerCase()) : undefined,
                cities: filters.cities?.length ? filters.cities.map(c => c.toLowerCase()) : undefined
            }

            const [res, guideRes] = await Promise.all([
                getPublicTours(params),
                filters.searchQuery ? searchGuides(filters.searchQuery) : Promise.resolve([])
            ])

            setTours(res.data)
            
            // Deduplicate guides by ID
            const uniqueGuides = Array.from(new Map(guideRes.map(g => [g.id, g])).values());
            setGuides(uniqueGuides)
            
            // Sync result count for the context
            dispatch({ type: 'SET_TOTAL_RESULTS', payload: res.data.length })
        } catch (err: any) {
            toast.error('Failed to update results')
        } finally {
            setLoading(false)
        }
    }, [filters, sortBy, dispatch])

    useEffect(() => {
        fetchTours()
    }, [fetchTours])

    // No client-side filtering needed anymore as it's all handled by backend
    const filteredTours = tours

    if (loading) {
        return (
            <div className={`${gridClasses} py-8`}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-[2rem] animate-pulse" />
                ))}
            </div>
        )
    }

    if (filteredTours.length === 0) {
        return (
            <div className="py-32 flex flex-col items-center justify-center text-center">
                 <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
                    <FilterX className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                 </div>
                 <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">No results found</h2>
                 <p className="text-sm font-bold text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
                    We couldn't find any tours matching your current filters. Try relaxing your search criteria.
                 </p>
                 <button 
                   onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
                   className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-blue-500/20 transition-all active:scale-95"
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
                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                        {filteredTours.length} Experiences Found
                    </span>
                    {activeFilterCount && activeFilterCount > 0 ? (
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full border border-blue-100 dark:border-blue-800/50">
                            {activeFilterCount} active
                        </span>
                    ) : null}
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Sort by:</span>
                    
                    <div className="relative z-40 w-56">
                        <Listbox value={sortBy} onChange={setSortBy}>
                            <div className="relative">
                                <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200 dark:border-gray-800 py-2.5 pl-4 pr-10 text-left text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white hover:border-blue-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                    <span className="flex items-center gap-2 truncate">
                                        <currentSortOption.icon className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                                        {currentSortOption.label}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" aria-hidden="true" />
                                    </span>
                                </ListboxButton>

                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-200"
                                    enterFrom="opacity-0 translate-y-2 scale-95"
                                    enterTo="opacity-100 translate-y-0 scale-100"
                                    leave="transition ease-in duration-150"
                                    leaveFrom="opacity-100 translate-y-0 scale-100"
                                    leaveTo="opacity-0 translate-y-2 scale-95"
                                >
                                    <ListboxOptions className="absolute mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl py-2 text-base shadow-2xl shadow-blue-500/10 border border-gray-200 dark:border-gray-800 focus:outline-none sm:text-sm ring-1 ring-black/5 dark:ring-white/5">
                                        {sortOptions.map((option) => (
                                            <ListboxOption
                                                key={option.id}
                                                className={({ active, selected }) =>
                                                    `relative cursor-pointer select-none py-3 pl-11 pr-4 transition-all ${
                                                        active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                                                    } ${selected ? 'font-black' : 'font-bold'}`
                                                }
                                                value={option.id}
                                            >
                                                {({ selected, active }) => (
                                                    <>
                                                        <span className="flex items-center gap-2 truncate text-xs uppercase tracking-wider">
                                                            <option.icon className={`w-4 h-4 ${active ? 'scale-110' : ''} transition-transform ${selected ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400'}`} />
                                                            {option.label}
                                                        </span>
                                                        {selected ? (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-blue-600 dark:text-blue-500">
                                                                <Check className="h-4 w-4" aria-hidden="true" />
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

            {/* Segmented Results */}
            {guides.length > 0 && (
                <div className="flex flex-col gap-6 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
                        <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">
                            Guide Matching Your Search
                        </h2>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        {guides.slice(0, 1).map(guide => (
                            <GuideHighlight key={guide.id} guide={guide} />
                        ))}
                    </div>
                    {guides.length > 1 && (
                         <div className="flex justify-center -mt-2">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                 + {guides.length - 1} more guides found
                             </span>
                         </div>
                    )}
                </div>
            )}

            {guides.length > 0 && tours.length > 0 && (
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
                    <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">
                        Experience Results
                    </h2>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
                </div>
            )}

            <div className={gridClasses}>
                {filteredTours.map((tour, index) => (
                    <PublicTourCard key={tour.id} tour={tour} showHint={index === 0} />
                ))}
            </div>
        </div>
    )
}