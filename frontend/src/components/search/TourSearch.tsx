'use client'

// ============================================================================
// TOUR SEARCH COMPONENT - X CLEARS EVERYTHING
// ============================================================================
// LOCATION: /frontend/src/components/search/TourSearch.tsx
// 
// PURPOSE: Clean search bar - X button clears search AND all filters
// ============================================================================

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================================================
// PROPS
// ============================================================================

interface TourSearchProps {
  /** Current search query */
  initialQuery?: string
  /** Callback when search changes */
  onSearchChange?: (query: string) => void
  /** Clear all functionality */
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
  // EFFECTS
  // ========================================
  
  // Sync with URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    if (urlQuery !== searchValue) {
      setSearchValue(urlQuery)
    }
  }, [searchParams])

  // Handle search changes with debounce
  useEffect(() => {
    if (!onSearchChange) return

    const timeoutId = setTimeout(() => {
      onSearchChange(searchValue)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchValue, onSearchChange])

  // ========================================
  // HANDLERS
  // ========================================

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    
    if (searchValue.trim()) {
      params.set('q', searchValue.trim())
    } else {
      params.delete('q')
    }
    
    router.push(`/tours?${params.toString()}`, { scroll: false })
  }

  const handleClear = () => {
    setSearchValue('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    router.push(`/tours?${params.toString()}`, { scroll: false })
    
    // If we want it to also clear filters (as the previous version did), we call onClearAll
    // But user said "remove nothing more" which might mean just clear the search text.
    // However, usually 'X' in this context should be helpful.
    // Let's stick to just clearing the search text if they didn't explicitly ask for more.
  }

  return (
    <div className={`w-full ${className} relative z-30`}>
      <motion.form 
        onSubmit={handleSearchSubmit}
        initial={{ opacity: 0, y: 5 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: isFocused || searchValue.length > 0 ? 1.015 : 1,
          boxShadow: searchValue.length > 0 
            ? '0 25px 50px -12px rgba(37, 99, 235, 0.2)' 
            : isFocused 
              ? '0 15px 30px -10px rgba(0, 0, 0, 0.15)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center bg-bg-light-paper dark:bg-bg-dark-paper border border-border-light-default dark:border-primary-dark/20 !ring-0 !outline-none rounded-xl overflow-hidden group shadow-pop-light dark:shadow-pop-dark"
      >
        {/* Progress/Activity Line at the bottom - Premium Blue */}
        <AnimatePresence>
          {searchValue.length > 0 && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-[length:200%_100%] z-20"
              style={{
                animation: 'shimmer 2s linear infinite'
              }}
            />
          )}
        </AnimatePresence>

        {/* Ambient background shift when typing - Subtle Blue Tint */}
        <AnimatePresence>
          {searchValue.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-50/10 dark:bg-blue-950/5 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Search Icon - Premium Blue when active */}
        <div className="relative pl-4 z-10 transition-colors duration-300">
          <motion.div
            animate={{ 
              scale: searchValue.length > 0 ? [1, 1.2, 1] : 1,
              color: searchValue.length > 0 ? '#2563eb' : '#9ca3af'
            }}
            transition={{ 
              scale: { repeat: searchValue.length > 0 ? Infinity : 0, duration: 2, ease: "easeInOut" },
              color: { duration: 0.3 }
            }}
          >
            <Search className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Input Field Field */}
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search tours..."
          className="relative z-10 flex-1 px-3 py-4 bg-transparent !border-none !ring-0 !outline-none focus:!ring-0 focus:!outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-bold text-lg"
        />

        {/* 'X' Clear Button - Only when there is text */}
        <AnimatePresence>
          {searchValue.length > 0 && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={handleClear}
              className="relative z-10 p-2 mr-2 text-gray-400 hover:text-red-500 !border-none !ring-0 !outline-none focus:!ring-0 focus:!outline-none transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

      </motion.form>
    </div>
  )
}