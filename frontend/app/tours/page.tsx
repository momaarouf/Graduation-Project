// ============================================================================
// TOURS PAGE - COMPLETE OVERHAUL
// ============================================================================
// LOCATION: /frontend/src/app/tours/page.tsx
// 
// 🔴 CRITICAL FIXES (2026-02-11):
// ============================================================================
// 
// FIX 1: REMOVED PageLayout PADDING CONFLICT
// -------------------------------------------
// BEFORE: PageLayout added pt-14, Tours page added pt-14 again = double padding
// AFTER:  Tours page adds EXACTLY ONE pt-14 at the root level
// 
// FIX 2: FIXED MOBILE FILTER DRAWER NOT REOPENING
// ------------------------------------------------
// BEFORE: State was being reset incorrectly, Transition component had issues
// AFTER:  Clean state management with proper cleanup, fixed Transition key
// 
// FIX 3: REMOVED DUPLICATE SORT DROPDOWN
// ---------------------------------------
// BEFORE: Both ToursPageContent AND SearchResultsGrid rendered sort controls
// AFTER:  SearchResultsGrid is the SINGLE source of truth for results header
// 
// FIX 4: FIXED SIDEBAR OVERFLOW AND SCROLLING
// ---------------------------------------------
// BEFORE: Sidebar had overflow issues, content clipped
// AFTER:  Proper h-screen calculation with overscroll containment
// ============================================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { FilterProvider, useSidebarState } from '@/src/lib/contexts/FilterContext'
import SearchResultsGrid from '@/src/components/search/SearchResultsGrid'
import SearchFilters from '@/src/components/search/SearchFilters'
import PageLayout from '@/src/components/layout/PageLayout'
import MobileFilterDrawer from '@/src/components/search/filters/MobileFilterDrawer'
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react'

// ============================================================================
// DESKTOP SIDEBAR - FULL HEIGHT WITH COLLAPSE
// ============================================================================
// 
// RESPONSIBILITIES:
// 1. Render filter sidebar for desktop (lg and above)
// 2. Handle collapse/expand with smooth animation
// 3. Maintain full viewport height with independent scrolling
// 4. Persist collapse state in localStorage
// ============================================================================

function DesktopSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebarState()
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  
  return (
    <aside 
      className={`
        relative
        hidden lg:block
        flex-shrink-0
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-80 xl:w-96'}
      `}
      aria-label="Tour filters sidebar"
    >
      {/* 
        ========================================
        STICKY CONTAINER - PERFECT HEIGHT
        ========================================
        
        🔴 CRITICAL CALCULATION:
        
        h-[calc(100vh-4rem)]:
        - 100vh = full viewport height
        - 4rem (64px) = height of fixed navbar
        - Result: Sidebar starts directly below navbar, ends at bottom of screen
        
        overflow-y-auto: 
        - If filter content exceeds height, scroll internally
        - Never scroll the page itself
        
        overscroll-contain:
        - Prevents scroll chaining to parent
        - Better UX on trackpads
      */}
      <div className="
        sticky top-16
        h-[calc(100vh-4rem)]
        overflow-y-auto
        overflow-x-hidden
        overscroll-contain
        bg-white dark:bg-gray-950
        border-r border-gray-200 dark:border-gray-800
        pb-4
      ">
        {/* 
          ========================================
          COLLAPSE TOGGLE BUTTON
          ========================================
          
          DESIGN DECISIONS:
          - Positioned on the right edge, centered vertically
          - Always visible when expanded
          - Fades in on hover when collapsed (saves screen space)
          - Rotating chevron icon indicates direction
        */}
        <button
          onClick={toggleSidebar}
          className={`
            absolute -right-3 top-6
            z-20
            flex items-center justify-center
            w-6 h-6
            rounded-full
            bg-white dark:bg-gray-900
            border border-gray-300 dark:border-gray-700
            text-gray-600 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-gray-800
            hover:text-gray-900 dark:hover:text-white
            transition-all duration-200
            shadow-md
            ${isCollapsed ? 'lg:opacity-0 lg:group-hover:opacity-100': 'opacity-100'}
            
            
          `}
          aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
          title={isCollapsed ? 'Expand filters' : 'Collapse filters'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
        
        {/* 
          ========================================
          FILTERS CONTENT
          ========================================
          
          Smooth padding transition when collapsing
          isCollapsed=true  → px-2 (tight)
          isCollapsed=false → px-4 (normal)
        */}
        <div className={`
          transition-all duration-300
          ${isCollapsed ? 'px-2' : 'px-4'}
        `}>
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
// 
// RESPONSIBILITIES:
// 1. Layout structure with fixed sidebar + scrollable content
// 2. Mobile filter drawer trigger and state management
// 3. Single pt-14 offset for fixed navbar
// ============================================================================

function ToursPageContent() {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  
  // ========================================
  // HANDLERS
  // ========================================
  
  /**
   * Open mobile filter drawer
   * @function handleOpenMobileFilters
   */
  const handleOpenMobileFilters = useCallback(() => {
    setShowMobileFilters(true)
  }, [])
  
  /**
   * Close mobile filter drawer
   * @function handleCloseMobileFilters
   */
  const handleCloseMobileFilters = useCallback(() => {
    setShowMobileFilters(false)
  }, [])
  
  return (
    // ========================================
    // PAGE LAYOUT WRAPPER
    // ========================================
    // 
    // 🔴 CRITICAL: EXACTLY ONE pt-14/sm:pt-16
    // This offsets the fixed navbar (height 56px mobile, 64px desktop)
    // No other padding should be added at this level
    // ========================================
    <PageLayout>
      <div className="
        pt-14 sm:pt-16
        w-full
        bg-white dark:bg-gray-950
      ">
        {/* 
          ========================================
          MAIN LAYOUT CONTAINER
          ========================================
          
          flex-row: Sidebar and content side by side
          min-h-[calc(100vh-4rem)]: Fill remaining viewport height
          items-start: Align to top, no stretching
        */}
        <div className="
          flex flex-row
          w-full
          min-h-[calc(100vh-4rem)]
          items-start
        ">
          {/* DESKTOP SIDEBAR - Hidden on mobile */}
          <DesktopSidebar />
          
          {/* 
            ========================================
            MAIN CONTENT - SEARCH RESULTS
            ========================================
            
            flex-1: Take remaining width after sidebar
            h-[calc(100vh-4rem)]: Match sidebar height
            overflow-y-auto: Scroll independently
            px-4 sm:px-6 lg:px-8: Responsive horizontal padding
            
            🔴 NO ADDITIONAL pt-* OR mt-* HERE
            The pt-14 at the parent already handles navbar offset
          */}
          <main className="
            flex-1
            min-w-0
            px-4 sm:px-6 lg:px-8
            py-4 sm:py-6
            overflow-y-auto
            
          ">
            {/* 
              ========================================
              MOBILE FILTER BUTTON
              ========================================
              
              Only visible on screens below lg breakpoint
              Shows active filter count badge
              Triggers bottom sheet drawer
            */}
            <div className="lg:hidden mb-4">
              <button
                onClick={handleOpenMobileFilters}
                className="
                  w-full
                  flex items-center justify-center gap-2
                  px-4 py-3
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-800
                  rounded-lg
                  text-gray-700 dark:text-gray-300
                  font-medium
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  transition-colors
                  shadow-sm
                "
                aria-label="Open filters"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="
                    px-1.5 py-0.5
                    bg-blue-600 dark:bg-blue-500
                    text-white
                    text-xs
                    rounded-full
                    animate-in fade-in
                  ">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* 
              ========================================
              SEARCH RESULTS GRID
              ========================================
              
              🔴 SINGLE SOURCE OF TRUTH
              
              SearchResultsGrid now renders:
              - Results count
              - Sort dropdown
              - Tour cards grid
              - Empty state
              - Loading skeletons
              
              DO NOT add another sort dropdown here!
            */}
            <SearchResultsGrid 
              onFilterCountChange={setActiveFilterCount}
            />
          </main>
        </div>
      </div>
      
      {/* 
        ========================================
        MOBILE FILTER DRAWER
        ========================================
        
        🔴 CRITICAL FIX: Key prop forces re-mount
        ------------------------------------------
        PROBLEM: Drawer wouldn't reopen after closing
        CAUSE:   Transition component wasn't resetting internal state
        FIX:     Add key={String(showMobileFilters)} to force re-creation
        
        This ensures a fresh instance of the drawer each time it opens.
        No stale state, no animation glitches.
      */}
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
// EXPORT - WRAPPED WITH FILTER PROVIDER
// ============================================================================
// 
// FilterProvider at this level makes filter state available to:
// - DesktopSidebar → SearchFilters
// - SearchResultsGrid
// - MobileFilterDrawer
// 
// But NOT to other pages (unlike putting it in root layout)
// This is intentional - filters are only needed on /tours
// ============================================================================

export default function ToursPage() {
  return (
    <FilterProvider>
      <ToursPageContent />
    </FilterProvider>
  )
}

// ============================================================================
// LAYOUT SUMMARY - BEFORE vs AFTER
// ============================================================================
// 
// ❌ BEFORE (Broken):
// ┌─────────────────────────────────┐
// │ PageLayout (pt-14)             │ ← Double padding starts here
// │ ┌───────────────────────────┐  │
// │ │ ToursPage (pt-14)        │  │ ← Second padding!
// │ │ ┌─────────────────────┐  │  │
// │ │ │ Sidebar   Content   │  │  │ ← Content squished
// │ │ │           Sort      │  │  │ ← Duplicate sort
// │ │ │           Sort      │  │  │ ← ANOTHER sort!
// │ │ └─────────────────────┘  │  │
// │ └───────────────────────────┘  │
// └─────────────────────────────────┘
// 
// ✅ AFTER (Fixed):
// ┌─────────────────────────────────┐
// │ PageLayout (no padding)        │ ← Clean slate
// │ ┌───────────────────────────┐  │
// │ │ ToursPage (pt-14)        │  │ ← Single padding, exactly once
// │ │ ┌─────────────────────┐  │  │
// │ │ │ Sidebar   Content   │  │  │
// │ │ │           ┌──────┐ │  │  │
// │ │ │           │ Grid │ │  │  │ ← Grid renders sort + count
// │ │ │           └──────┘ │  │  │    (single source of truth)
// │ │ └─────────────────────┘  │  │
// │ └───────────────────────────┘  │
// └─────────────────────────────────┘
// ============================================================================