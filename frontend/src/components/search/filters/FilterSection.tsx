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
    defaultExpanded = false,
    showSeparator = false,
    className = ''
}: FilterSectionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    return (
        <div className={`w-full py-5 border-b border-gray-200 dark:border-gray-800 last:border-0 ${className}`}>
            {/* ========================================
          SECTION HEADER - Clean & Sleek
          ======================================== */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between focus:outline-none group"
                aria-expanded={isExpanded}
                aria-label={`${title} filter section, ${isExpanded ? 'expanded' : 'collapsed'}`}
            >
                <div className="flex items-center gap-3">
                    {/* Minimalist Title */}
                    <span className="text-[15px] font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {title}
                    </span>
                </div>

                {/* Minimalist Chevron */}
                <span className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </span>
            </button>

            {/* ========================================
          SECTION CONTENT - Collapsible
          ======================================== */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div>
                    {children}
                </div>
            </div>
        </div>
    )
}