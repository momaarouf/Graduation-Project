'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterProvider, useSidebarState, useFilterState, useFilterDispatch } from '@/src/lib/contexts/FilterContext'
import SearchResultsGrid from '@/src/components/search/SearchResultsGrid'
import SearchFilters from '@/src/components/search/SearchFilters'
import PageLayout from '@/src/components/layout/PageLayout'
import MobileFilterDrawer from '@/src/components/search/filters/MobileFilterDrawer'
import TourSearch from '@/src/components/search/TourSearch'
import CinematicBackground from '@/src/components/layout/CinematicBackground'
import { Filter, ChevronLeft } from 'lucide-react'
import { Country, City, FilterState } from '@/src/components/search/types/filters.types'

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Parses URL search parameters into a FilterState object
 */
function getFiltersFromParams(searchParams: URLSearchParams): FilterState {
  const query = searchParams.get('q')
  const locationParam = searchParams.get('location')

  const filters: FilterState = {}

  if (query) {
    filters.searchQuery = query
  }

  if (locationParam) {
    const location = locationParam.toLowerCase()
    if (location === 'lebanon' || location === 'turkey') {
      filters.countries = [location as Country]
    } else {
      const cityMap: Record<string, City> = {
        'beirut': City.BEIRUT,
        'istanbul': City.ISTANBUL,
        'byblos': City.BYBLOS,
        'tripoli': City.TRIPOLI,
        'sidon': City.SIDON,
        'tyre': City.TYRE,
        'bekaa': City.BEKAA,
        'cappadocia': City.CAPPADOCIA,
        'antalya': City.ANTALYA,
        'izmir': City.IZMIR,
        'bodrum': City.BODRUM,
        'pamukkale': City.PAMUKKALE,
        'ephesus': City.EPHESUS
      }

      if (cityMap[location]) {
        filters.cities = [cityMap[location]]
      }
    }
  }

  return filters
}

// ============================================================================
// COMPONENTS
// ============================================================================

function DesktopSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebarState()
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  return (
    <aside
      className={`hidden lg:block flex-shrink-0 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-80 xl:w-96'}`}
      aria-label="Tour filters sidebar"
    >
      <div className="sticky top-[80px] z-20 pb-10">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-sm border-b border-border-light-default dark:border-border-dark-strong mb-2 rounded-2xl">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="font-semibold text-gray-900 dark:text-white">Filters</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-full text-text-light-muted dark:text-text-dark-muted hover:bg-primary-light/10 dark:hover:bg-primary-dark/20 hover:text-primary-light dark:hover:text-primary-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              aria-label="Collapse filters"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className={`transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <SearchFilters
            onActiveFilterCountChange={setActiveFilterCount}
            isCollapsed={isCollapsed}
            toggleSidebar={toggleSidebar}
          />
        </div>
      </div>
    </aside>
  )
}

function ToursPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const { filters } = useFilterState()
  const dispatch = useFilterDispatch()

  const searchQueryFromUrl = searchParams.get('q') || ''

  const handleOpenMobileFilters = useCallback(() => setShowMobileFilters(true), [])
  const handleCloseMobileFilters = useCallback(() => setShowMobileFilters(false), [])

  useEffect(() => {
    const count = Object.values(filters).filter(Boolean).length
    setActiveFilterCount(count)
  }, [filters])

  const handleClearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' })
    router.push('/tours')
  }, [dispatch, router])

  const handleSearchChange = useCallback((query: string) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: { searchQuery: query } })
  }, [dispatch])

  return (
    <PageLayout>
      <div className="flex flex-row w-full pt-14 sm:pt-16 min-h-screen overflow-visible">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="lg:hidden mb-4">
            <button
              onClick={handleOpenMobileFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-bg-light-paper/80 dark:bg-bg-dark-paper/80 backdrop-blur-md border border-border-light-default dark:border-border-dark-strong rounded-full text-text-light-primary dark:text-text-dark-primary font-bold hover:bg-bg-light-paper dark:hover:bg-bg-dark-paper transition-all shadow-md active:scale-95"
            >
              <Filter className="w-4 h-4 text-primary-light dark:text-primary-dark" />
              Filters
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 bg-primary-light dark:bg-primary-dark text-white text-[10px] font-bold rounded-full animate-bounce shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <TourSearch
            initialQuery={searchQueryFromUrl}
            onSearchChange={handleSearchChange}
            onClearAll={handleClearAll}
            className="mb-6"
          />

          <SearchResultsGrid
            onFilterCountChange={setActiveFilterCount}
            activeFilterCount={activeFilterCount}
          />
        </main>
      </div>

      <MobileFilterDrawer
        key={String(showMobileFilters)}
        isOpen={showMobileFilters}
        onClose={handleCloseMobileFilters}
        onFilterCountChange={setActiveFilterCount}
      />
    </PageLayout>
  )
}

function ToursPageInner() {
  const searchParams = useSearchParams()
  
  // Initialize context with filters from URL synchronously
  const initialFilters = useMemo(() => 
    getFiltersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams]
  )

  return (
    <FilterProvider initialFilters={initialFilters}>
      <ToursPageContent />
    </FilterProvider>
  )
}

export default function ToursPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-950" />}>
      <ToursPageInner />
    </Suspense>
  )
}