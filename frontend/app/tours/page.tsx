// ============================================================================
// TOURS PAGE - WITH PROPER CLEAR ALL
// ============================================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterProvider, useSidebarState, useFilterState, useFilterDispatch } from '@/src/lib/contexts/FilterContext'
import SearchResultsGrid from '@/src/components/search/SearchResultsGrid'
import SearchFilters from '@/src/components/search/SearchFilters'
import PageLayout from '@/src/components/layout/PageLayout'
import MobileFilterDrawer from '@/src/components/search/filters/MobileFilterDrawer'
import TourSearch from '@/src/components/search/TourSearch'
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Country, City, FilterState } from '@/src/components/search/types/filters.types'

// ============================================================================
// URL PARAM HANDLER
// ============================================================================

function UrlParamHandler() {
  const searchParams = useSearchParams()
  const dispatch = useFilterDispatch()

  useEffect(() => {
    const query = searchParams.get('q')
    const location = searchParams.get('location')

    const filters: FilterState = {}

    if (query) {
      filters.searchQuery = query
    }

    if (location) {
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

    if (Object.keys(filters).length > 0) {
      dispatch({ type: 'UPDATE_FILTERS', payload: filters })
    }
  }, [searchParams, dispatch])

  return null
}

// ============================================================================
// DESKTOP SIDEBAR
// ============================================================================

function DesktopSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebarState()
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  return (
    <aside
      className={`group relative hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-80 xl:w-96'}`}
      aria-label="Tour filters sidebar"
    >
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 pb-4">
        {!isCollapsed && (
          <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-900 mb-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="font-semibold text-gray-900 dark:text-white">Filters</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

// ============================================================================
// MAIN TOURS PAGE CONTENT
// ============================================================================

function ToursPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const { filters } = useFilterState()
  const dispatch = useFilterDispatch()

  const searchQuery = searchParams.get('q') || ''

  const handleOpenMobileFilters = useCallback(() => {
    setShowMobileFilters(true)
  }, [])

  const handleCloseMobileFilters = useCallback(() => {
    setShowMobileFilters(false)
  }, [])

  useEffect(() => {
    const count = Object.values(filters).filter(Boolean).length
    setActiveFilterCount(count)
  }, [filters])

  // ========================================
  // CLEAR ALL FUNCTION - Clears EVERYTHING
  // ========================================
  const handleClearAll = () => {
    // 1. Clear filter context
    dispatch({ type: 'CLEAR_FILTERS' })

    // 2. Clear URL params (go to clean tours page)
    router.push('/tours')
  }

  return (
    <PageLayout>
      <UrlParamHandler />

      <div className="h-[calc(100vh-0rem)] w-full bg-white dark:bg-gray-950 overflow-hidden flex flex-col">
        <div className="flex flex-row w-full h-full pt-14 sm:pt-16 overflow-hidden">

          <DesktopSidebar />

          <main className="flex-1 h-full min-w-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto overscroll-contain">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={handleOpenMobileFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Search Bar - Pass clearAll function */}
            <TourSearch
              initialQuery={searchQuery}
              onClearAll={handleClearAll}
              className="mb-6"
            />

            {/* Results Grid */}
            <SearchResultsGrid
              onFilterCountChange={setActiveFilterCount}
              activeFilterCount={activeFilterCount}
            />
          </main>
        </div>
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

// ============================================================================
// EXPORT
// ============================================================================

export default function ToursPage() {
  return (
    <FilterProvider>
      <ToursPageContent />
    </FilterProvider>
  )
}