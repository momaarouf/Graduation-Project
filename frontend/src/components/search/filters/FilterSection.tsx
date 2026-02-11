// ============================================================================
// FILTER SECTION WRAPPER - REUSABLE COMPONENT
// ============================================================================
// LOCATION: /frontend/src/components/search/filters/FilterSection.tsx
// 
// PURPOSE: Consistent styling for all filter sections
// 
// FEATURES:
// 1. Collapsible sections (expand/collapse)
// 2. Consistent header with icon and title
// 3. Dual theme support
// 4. Smooth animations
// 5. Mobile responsive
// 
// USAGE:
// <FilterSection title="Price" icon={<DollarSign />}>
//   <PriceRangeFilter ... />
// </FilterSection>
// ============================================================================

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { FilterSectionProps } from '../types/filters.types'

export default function FilterSection({
  title,
  icon,
  children,
  defaultExpanded = true,
  showSeparator = true,
  className = ''
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={`
      w-full
      ${showSeparator ? 'border-b border-gray-200 dark:border-gray-800' : ''}
      ${className}
    `}>
      {/* ========================================
          SECTION HEADER - Click to toggle
          ======================================== */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          w-full
          flex items-center justify-between
          py-4 px-1
          text-left
          hover:bg-gray-50 dark:hover:bg-gray-800/50
          transition-colors duration-200
          rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-900
        "
        aria-expanded={isExpanded}
        aria-label={`${title} filter section, ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        <div className="flex items-center gap-2">
          {/* Icon with dual theme colors */}
          {icon && (
            <span className="text-gray-500 dark:text-gray-400">
              {icon}
            </span>
          )}
          
          {/* Title with dual theme colors */}
          <span className="
            font-semibold
            text-sm sm:text-base
            text-gray-900 dark:text-white
          ">
            {title}
          </span>
        </div>
        
        {/* Expand/collapse indicator */}
        <span className="text-gray-500 dark:text-gray-400">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </span>
      </button>
      
      {/* ========================================
          SECTION CONTENT - Collapsible
          ======================================== */}
      <div
        className={`
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[1000px] opacity-100 mb-4' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-1 pb-2">
          {children}
        </div>
      </div>
    </div>
  )
}