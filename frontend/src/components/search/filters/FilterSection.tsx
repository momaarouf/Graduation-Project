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
        <div className={`w-full py-5 border-b border-border-light-default/50 dark:border-border-dark-strong/30 last:border-0 hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 px-4 -mx-4 rounded-2xl transition-all duration-300 ${className}`}>
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
                    <span className="text-[15px] font-bold text-text-light-primary dark:text-text-dark-primary group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                        {title}
                    </span>
                    {/* Subtle dot indicator when expanded */}
                    {isExpanded && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-light dark:bg-primary-dark animate-pulse" />
                    )}
                </div>

                {/* Minimalist Chevron - Circular Backdrop on Hover */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-primary-light/10 dark:group-hover:bg-primary-dark/10 transition-colors">
                    <ChevronDown className={`w-5 h-5 text-text-light-muted dark:text-text-dark-muted group-hover:text-primary-light dark:group-hover:text-primary-dark transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
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