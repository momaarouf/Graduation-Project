'use client'

// ============================================================================
// TOUR SEARCH COMPONENT - X CLEARS EVERYTHING
// ============================================================================
// LOCATION: /frontend/src/components/search/TourSearch.tsx
// 
// PURPOSE: Clean search bar - X button clears search AND all filters
// ============================================================================

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

// ============================================================================
// PROPS
// ============================================================================

interface TourSearchProps {
  /** Current search query */
  initialQuery?: string
  /** Callback when search changes */
  onSearchChange?: (query: string) => void
  /** Clear all filters function from parent */
  onClearAll?: () => void
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TourSearch({ 
  initialQuery = '', 
  onSearchChange,
  onClearAll,
  className = '' 
}: TourSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // ========================================
  // STATE
  // ========================================
  const [searchValue, setSearchValue] = useState(initialQuery)
  const [isFocused, setIsFocused] = useState(false)

  // ========================================
  // DERIVED VALUES
  // ========================================
  const hasActiveSearch = searchValue.length > 0

  // ========================================
  // EFFECTS
  // ========================================
  
  // Sync with URL params on mount
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    setSearchValue(urlQuery)
  }, [searchParams])

  // ========================================
  // HANDLERS
  // ========================================

  /**
   * Handle search submission
   */
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const params = new URLSearchParams(searchParams.toString())
    
    if (searchValue.trim()) {
      params.set('q', searchValue.trim())
    } else {
      params.delete('q')
    }
    
    router.push(`/tours?${params.toString()}`)
    onSearchChange?.(searchValue)
  }

  /**
   * X BUTTON - Clears EVERYTHING (search + all filters)
   */
  const handleClearAll = () => {
    setSearchValue('')
    
    // Call parent's clear all function which clears filter context
    if (onClearAll) {
      onClearAll()
    } else {
      // Fallback: just clear URL
      router.push('/tours')
    }
    
    onSearchChange?.('')
  }

  return (
    <div className={`w-full ${className}`}>
      
      {/* MAIN SEARCH BAR WITH X BUTTON */}
      <form onSubmit={handleSearch} className="relative group">
        {/* Search icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search className={`
            w-5 h-5 transition-colors duration-200
            ${isFocused 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-400 dark:text-gray-500'
            }
          `} />
        </div>

        {/* Search input */}
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search destinations, tours, or guides..."
          className="
            w-full
            pl-12 pr-12
            py-4
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-800
            rounded-2xl
            text-base
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            transition-all duration-200
            shadow-sm hover:shadow-md
          "
        />

        {/* X BUTTON - Clears EVERYTHING */}
        {hasActiveSearch && (
          <button
            type="button"
            onClick={handleClearAll}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              p-2
              text-gray-400 hover:text-gray-600
              dark:text-gray-500 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              rounded-lg
              transition-all
              z-10
            "
            aria-label="Clear all filters and search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  )
}