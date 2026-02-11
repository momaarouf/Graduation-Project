// ============================================================================
// CHECKBOX FILTER GROUP - REUSABLE COMPONENT
// ============================================================================
// LOCATION: /frontend/src/components/search/filters/CheckboxFilter.tsx
// 
// PURPOSE: Consistent checkbox styling for multi-select filters
// 
// FEATURES:
// 1. Accessible - proper ARIA labels, keyboard navigation
// 2. Dual theme - light/dark mode colors
// 3. Count badges - show number of results (Phase 2)
// 4. "Show more" for long lists
// 5. Search within filter (Phase 2)
// ============================================================================

'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'

export interface CheckboxOption<T = string> {
  /** Unique identifier */
  id: T
  
  /** Display label */
  label: string
  
  /** Optional count of matching results */
  count?: number
  
  /** Optional icon */
  icon?: React.ReactNode
  
  /** Disabled state */
  disabled?: boolean
}

export interface CheckboxFilterProps<T = string> {
  /** Array of checkbox options */
  options: CheckboxOption<T>[]
  
  /** Currently selected values */
  selectedValues: T[]
  
  /** Callback when selection changes */
  onChange: (selected: T[]) => void
  
  /** Maximum number of items to show before "Show more" */
  limit?: number
  
  /** Show search input */
  showSearch?: boolean
  
  /** Loading state */
  isLoading?: boolean
  
  /** Optional className */
  className?: string
}

export default function CheckboxFilter<T = string>({
  options,
  selectedValues,
  onChange,
  limit = 5,
  showSearch = false,
  isLoading = false,
  className = ''
}: CheckboxFilterProps<T>) {
  const [showAll, setShowAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // ========================================
  // Filter options based on search and limit
  // ========================================
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const displayedOptions = showAll 
    ? filteredOptions 
    : filteredOptions.slice(0, limit)
  
  const hasMore = filteredOptions.length > limit
  
  // ========================================
  // Handle checkbox toggle
  // ========================================
  const handleToggle = (value: T) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value]
    
    onChange(newSelected)
  }
  
  // ========================================
  // Handle "Select All"
  // ========================================
  const handleSelectAll = () => {
    if (selectedValues.length === filteredOptions.length) {
      onChange([])
    } else {
      onChange(filteredOptions.map(opt => opt.id))
    }
  }
  
  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className={`w-full ${className}`}>
      {/* ========================================
          SEARCH INPUT (Optional)
          ======================================== */}
      {showSearch && (
        <div className="mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="
              w-full
              px-3 py-2
              text-sm
              bg-white dark:bg-gray-900
              border border-gray-300 dark:border-gray-700
              rounded-lg
              text-gray-900 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>
      )}
      
      {/* ========================================
          SELECT ALL (if multiple options)
          ======================================== */}
      {options.length > 1 && (
        <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={handleSelectAll}
            className="
              text-xs font-medium
              text-blue-600 dark:text-blue-400
              hover:text-blue-700 dark:hover:text-blue-300
              transition-colors
            "
          >
            {selectedValues.length === filteredOptions.length
              ? 'Deselect All'
              : 'Select All'
            }
          </button>
        </div>
      )}
      
      {/* ========================================
          CHECKBOX LIST
          ======================================== */}
      <div className="space-y-2.5">
        {displayedOptions.map((option) => {
          const isSelected = selectedValues.includes(option.id)
          
          return (
            <label
              key={String(option.id)}
              className={`
                flex items-center gap-2
                cursor-pointer
                group
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {/* ========================================
                  Custom Checkbox - Better than native
                  ======================================== */}
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(option.id)}
                  disabled={option.disabled}
                  className="
                    peer
                    absolute opacity-0 w-4 h-4
                    cursor-pointer
                  "
                  aria-label={option.label}
                />
                
                {/* Checkbox visual */}
                <div className={`
                  w-4 h-4
                  border rounded
                  transition-all duration-200
                  flex items-center justify-center
                  ${isSelected
                    ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-600'
                  }
                  ${option.disabled ? 'bg-gray-100 dark:bg-gray-800' : ''}
                `}>
                  {isSelected && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
              
              {/* Label with count badge */}
              <span className={`
                flex-1
                text-xs sm:text-sm
                ${isSelected
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-700 dark:text-gray-300'
                }
              `}>
                {option.label}
              </span>
              
              {/* Optional count badge */}
              {option.count !== undefined && (
                <span className="
                  text-xs
                  px-1.5 py-0.5
                  bg-gray-100 dark:bg-gray-800
                  text-gray-600 dark:text-gray-400
                  rounded-full
                ">
                  {option.count}
                </span>
              )}
              
              {/* Optional icon */}
              {option.icon && (
                <span className="text-gray-500 dark:text-gray-400">
                  {option.icon}
                </span>
              )}
            </label>
          )
        })}
      </div>
      
      {/* ========================================
          SHOW MORE BUTTON
          ======================================== */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="
            mt-3
            text-xs font-medium
            text-blue-600 dark:text-blue-400
            hover:text-blue-700 dark:hover:text-blue-300
            transition-colors
          "
        >
          {showAll ? 'Show less' : `Show ${filteredOptions.length - limit} more`}
        </button>
      )}
    </div>
  )
}