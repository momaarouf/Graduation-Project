// ============================================================================
// FILTER CONTEXT PROVIDER
// ============================================================================
// LOCATION: /frontend/src/lib/contexts/FilterContext.tsx
// 
// PURPOSE: Central state management for all search filters
// 
// WHY THIS FILE EXISTS:
// ---------------------
// 1. Connects SearchFilters component to SearchResultsGrid
// 2. Prevents prop drilling through multiple components
// 3. Persists filter state across navigation (within session)
// 4. Single source of truth for all filter-related state
// 
// ARCHITECTURE DECISION:
// ----------------------
// Using React Context + useReducer instead of useState + prop drilling:
// 
// PROPS DRILLING (BAD):
// App → ToursPage → SearchFilters (filters go down)
// App → ToursPage → SearchResultsGrid (results need filters but can't get them)
// 
// CONTEXT (GOOD):
// FilterProvider wraps both components, both can access the same state
// 
// USAGE:
// <FilterProvider>
//   <ToursPage /> {/* Both children have access to filter state */}
// </FilterProvider>
// 
// SCALABILITY:
// This pattern scales to hundreds of filters. Add new filter types
// without touching component interfaces.
// ============================================================================

'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { FilterState } from '@/src/components/search/types/filters.types'

// ============================================================================
// CONTEXT STATE DEFINITION
// ============================================================================

/**
 * Complete state shape for the filter system
 * 
 * DESIGN DECISION:
 * We track both the current filters AND metadata about the filter UI
 * This keeps all filter-related state in one place
 */
interface FilterContextState {
  /** Active filter values */
  filters: FilterState
  
  /** Whether the desktop sidebar is collapsed (user preference) */
  isSidebarCollapsed: boolean
  
  /** Total number of results matching current filters */
  totalResults: number | null
  
  /** Loading state for filter updates */
  isLoading: boolean
  
  /** Last time filters were updated (for cache invalidation) */
  lastUpdated: number
}

// ============================================================================
// ACTION TYPES (TypeScript discriminated unions)
// ============================================================================
// 
// WHY: Each action has a distinct type and payload shape
// TypeScript ensures we can't accidentally pass wrong payload
// ============================================================================

type FilterAction =
  | { type: 'SET_FILTERS'; payload: FilterState }
  | { type: 'UPDATE_FILTERS'; payload: Partial<FilterState> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_TOTAL_RESULTS'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_ALL' }

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Get initial sidebar state from localStorage
 * 
 * WHY LOCALSTORAGE:
 * Users expect their preference (collapsed/expanded) to persist
 * across browser sessions. This is a UX best practice.
 * 
 * FALLBACK:
 * If localStorage fails or no preference saved, default to expanded (false)
 */
const getInitialSidebarState = (): boolean => {
  if (typeof window === 'undefined') return false // SSR default
  
  try {
    const saved = localStorage.getItem('safaribub-filters-sidebar')
    console.log('[FilterContext] Initial sidebar state:', saved ? JSON.parse(saved) : false)
    return saved ? JSON.parse(saved) : false
  } catch {
    console.log('[FilterContext] Failed to read sidebar state, defaulting to expanded')
    return false
  }
}

const initialState: FilterContextState = {
  filters: {},
  isSidebarCollapsed: getInitialSidebarState(),
  totalResults: null,
  isLoading: false,
  lastUpdated: Date.now()
}

// ============================================================================
// REDUCER - Pure function to update state
// ============================================================================
// 
// WHY REDUCER OVER USESTATE:
// 1. Complex state logic with multiple actions
// 2. Centralized updates - all filter changes go through one function
// 3. Easier debugging - each action is explicit
// 4. Performance - React batches updates automatically
// ============================================================================

function filterReducer(state: FilterContextState, action: FilterAction): FilterContextState {
  switch (action.type) {
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload,
        lastUpdated: Date.now()
      }
    
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        },
        lastUpdated: Date.now()
      }
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {},
        lastUpdated: Date.now()
      }
    
    case 'TOGGLE_SIDEBAR':
      const newState = !state.isSidebarCollapsed
      
      // Persist to localStorage (side effect, but okay in reducer for simplicity)
      if (typeof window !== 'undefined') {
        localStorage.setItem('safaribub-filters-sidebar', JSON.stringify(newState))
      }
      
      return {
        ...state,
        isSidebarCollapsed: newState
      }
    
    case 'SET_TOTAL_RESULTS':
      return {
        ...state,
        totalResults: action.payload
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    
    case 'RESET_ALL':
      // Reset filters but preserve sidebar preference
      return {
        ...initialState,
        isSidebarCollapsed: state.isSidebarCollapsed
      }
    
    default:
      return state
  }
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================
// 
// CONTEXT + DISPATCH PATTERN:
// We expose both state and dispatch separately for performance
// Components can subscribe only to what they need
// ============================================================================

interface FilterContextValue extends FilterContextState {
  dispatch: React.Dispatch<FilterAction>
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined)

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================
// 
// Wrap this around any components that need access to filter state
// Best place: app/layout.tsx or app/tours/layout.tsx
// ============================================================================

interface FilterProviderProps {
  children: React.ReactNode
  /** Optional initial filters (for SSR/cached searches) */
  initialFilters?: FilterState
}

export function FilterProvider({ children, initialFilters }: FilterProviderProps) {
  const [state, dispatch] = useReducer(filterReducer, {
    ...initialState,
    filters: initialFilters || {}
  })

  return (
    <FilterContext.Provider value={{ ...state, dispatch }}>
      {children}
    </FilterContext.Provider>
  )
}

// ============================================================================
// CUSTOM HOOKS - Safe context access
// ============================================================================
// 
// WHY CUSTOM HOOKS:
// 1. Encapsulate context access logic
// 2. Provide TypeScript inference
// 3. Add error handling (throw if used outside provider)
// 4. Can be extended with memoized selectors
// ============================================================================

/**
 * Primary hook for filter state and dispatch
 * Use this in components that need to read AND update filters
 */
export function useFilters() {
  const context = useContext(FilterContext)
  
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  
  return context
}

/**
 * Hook for components that only need to READ filter state
 * Won't re-render on dispatch calls (unless state changes)
 */
export function useFilterState() {
  const context = useContext(FilterContext)
  
  if (context === undefined) {
    throw new Error('useFilterState must be used within a FilterProvider')
  }
  
  return {
    filters: context.filters,
    totalResults: context.totalResults,
    isLoading: context.isLoading
  }
}

/**
 * Hook for components that only need to UPDATE filters
 * Won't re-render when filter values change
 */
export function useFilterDispatch() {
  const context = useContext(FilterContext)
  
  if (context === undefined) {
    throw new Error('useFilterDispatch must be used within a FilterProvider')
  }
  
  return context.dispatch
}

/**
 * Hook specifically for sidebar state
 * Separated to prevent unnecessary re-renders of filter components
 */
export function useSidebarState() {
  const context = useContext(FilterContext)
  
  if (context === undefined) {
    throw new Error('useSidebarState must be used within a FilterProvider')
  }
  
  return {
    isCollapsed: context.isSidebarCollapsed,
    toggleSidebar: () => context.dispatch({ type: 'TOGGLE_SIDEBAR' })
  }
}

// ============================================================================
// HELPER HOOK - Filter application
// ============================================================================
// 
// This hook encapsulates the logic of applying filters to tour data
// In Phase 2, this will call the backend API
// ============================================================================

export function useApplyFilters() {
  const dispatch = useFilterDispatch()
  const { filters } = useFilterState()
  
  const applyFilters = async (newFilters: Partial<FilterState>) => {
    // Start loading
    dispatch({ type: 'SET_LOADING', payload: true })
    
    // Update filter state
    dispatch({ type: 'UPDATE_FILTERS', payload: newFilters })
    
    try {
      // ========================================
      // PHASE 1: Mock filtering (client-side)
      // PHASE 2: Replace with API call
      // ========================================
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // In Phase 1, we filter the mock data in the component
      // The grid component will read the filters from context
      
      // For now, we just mark as complete
      dispatch({ type: 'SET_LOADING', payload: false })
      
    } catch (error) {
      console.error('Error applying filters:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }
  
  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' })
  }
  
  return { applyFilters, clearFilters }
}

// ============================================================================
// USAGE EXAMPLES:
// ============================================================================
// 
// 1. In SearchFilters.tsx:
//    const { filters, dispatch } = useFilters()
//    const { applyFilters } = useApplyFilters()
//    
//    const handleFilterChange = (newFilters) => {
//      applyFilters(newFilters)
//    }
// 
// 2. In SearchResultsGrid.tsx:
//    const { filters, isLoading } = useFilterState()
//    
//    // Filter tours based on filters
//    const filteredTours = useMemo(() => {
//      return MOCK_TOURS.filter(tour => matchesFilters(tour, filters))
//    }, [filters])
// 
// 3. In ToursPage.tsx:
//    const { isCollapsed, toggleSidebar } = useSidebarState()
//    
//    <aside className={isCollapsed ? 'w-20' : 'w-80'}>
//      <button onClick={toggleSidebar}>Toggle</button>
// ============================================================================