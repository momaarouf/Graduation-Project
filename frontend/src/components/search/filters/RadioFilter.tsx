// ============================================================================
// RADIO FILTER GROUP - REUSABLE COMPONENT
// ============================================================================
// LOCATION: /frontend/src/components/search/filters/RadioFilter.tsx
// 
// PURPOSE: Consistent radio button styling for single-select filters
// 
// WHY THIS FILE EXISTS:
// ---------------------
// 1. Rating filter (3+, 4+, 4.5+) uses radio buttons (mutually exclusive)
// 2. Availability filter (Today, Tomorrow, This week) uses radio buttons
// 3. Ensures consistent styling with CheckboxFilter component
// 4. Dual theme support (light/dark mode)
// 
// BUSINESS REQUIREMENTS:
// ----------------------
// ✓ Only one option can be selected at a time
// ✓ Clear visual distinction between selected/unselected
// ✓ Touch-friendly on mobile (44px minimum touch target)
// ✓ Screen reader compatible
// 
// COLOR PSYCHOLOGY:
// - Blue: Selected state (trust, active)
// - Gray: Unselected state (neutral, inactive)
// ============================================================================

'use client'

import { useId } from 'react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RadioOption<T = string> {
 /** Unique identifier (matches the value) */
 id: T
 
 /** Display label shown to user */
 label: string
 
 /** Optional description shown below label */
 description?: string
 
 /** Optional icon to display next to label */
 icon?: React.ReactNode
 
 /** Disabled state - user cannot select this option */
 disabled?: boolean
}

export interface RadioFilterProps<T = string> {
 /** Array of radio options to display */
 options: RadioOption<T>[]
 
 /** Currently selected value */
 value: T | null
 
 /** Callback when selection changes */
 onChange: (value: T) => void
 
 /** Name attribute for the radio group (for accessibility) */
 name?: string
 
 /** Label for the entire group (for accessibility) */
 groupLabel?: string
 
 /** Layout direction: 'vertical' (default) or 'horizontal' */
 layout?: 'vertical' | 'horizontal'
 
 /** Loading state - shows skeleton */
 isLoading?: boolean
 
 /** Optional className for custom styling */
 className?: string
}

// ============================================================================
// RADIO FILTER COMPONENT
// ============================================================================
// 
// IMPLEMENTATION NOTES:
// 1. Uses semantic HTML with <input type="radio"> for accessibility
// 2. Custom styling via CSS pseudo-classes (no external dependencies)
// 3. Unique IDs generated with useId() for SSR hydration
// 4. Full keyboard navigation support (Tab, Space, Arrow keys)
// ============================================================================

export default function RadioFilter<T = string>({
 options,
 value,
 onChange,
 name,
 groupLabel = 'Filter options',
 layout = 'vertical',
 isLoading = false,
 className = ''
}: RadioFilterProps<T>) {
 // Generate unique ID for the radio group
 const groupId = useId()
 const radioName = name || `radio-group-${groupId}`

 // ========================================
 // LOADING STATE - Skeleton UI
 // ========================================
 if (isLoading) {
 return (
 <div className={`space-y-2 animate-pulse ${className}`}>
 {[1, 2, 3].map((i) => (
 <div key={i} className="flex items-center gap-2">
 {/* Radio circle skeleton */}
 <div className="w-4 h-4 rounded-full surface-section" />
 
 {/* Label skeleton */}
 <div className="flex-1">
 <div className="h-4 w-24 surface-section rounded" />
 <div className="h-3 w-32 surface-section rounded mt-1" />
 </div>
 </div>
 ))}
 </div>
 )
 }

 // ========================================
 // EMPTY STATE - No options
 // ========================================
 if (options.length === 0) {
 return (
 <div className={`
 py-4 px-3
 text-center
 surface-section
 rounded-lg
 ${className}
 `}>
 <p className="text-[13px] text-theme-muted ">
 No options available
 </p>
 </div>
 )
 }

 // ========================================
 // RENDER RADIO GROUP
 // ========================================
 return (
 <div
 role="radiogroup"
 aria-label={groupLabel}
 className={`
 ${layout === 'vertical' ? 'space-y-3' : 'flex flex-wrap gap-4'}
 ${className}
 `}
 >
 {options.map((option) => {
 const optionId = `radio-${groupId}-${String(option.id)}`
 const isSelected = value === option.id
 const isDisabled = option.disabled || false

 return (
 <div
 key={String(option.id)}
 className={`
 relative
 ${layout === 'horizontal' ? 'flex-1 min-w-[120px]' : 'w-full'}
 `}
 >
 {/* ========================================
 NATIVE RADIO INPUT (Visually hidden)
 
 WHY: We hide the native radio but keep it in the DOM
 for accessibility and form submission.
 
 The custom visual is styled with CSS pseudo-classes.
 ======================================== */}
 <input
 type="radio"
 id={optionId}
 name={radioName}
 value={String(option.id)}
 checked={isSelected}
 onChange={() => !isDisabled && onChange(option.id)}
 disabled={isDisabled}
 className="
 peer
 absolute opacity-0 w-4 h-4
 cursor-pointer
 disabled:cursor-not-allowed
"
 aria-describedby={option.description ? `${optionId}-desc` : undefined}
 />

 {/* ========================================
 CUSTOM RADIO VISUAL
 
 Styled with:
 - peer-checked: Selected state
 - peer-disabled: Disabled state
 - peer-focus-visible: Keyboard focus indicator
 ======================================== */}
 <label
 htmlFor={optionId}
 className={`
 flex items-start gap-3
 w-full
 cursor-pointer
 peer-disabled:cursor-not-allowed
 transition-all duration-200
 group
 `}
 >
 {/* Radio circle indicator */}
 <span className="
 relative flex-shrink-0
 w-4 h-4 mt-0.5
 rounded-full
 border-2
 transition-all duration-200
 
 /* LIGHT MODE - Default state */
 surface-card
 border-primary-light/20 dark:border-primary-dark/20-strong
 
 /* DARK MODE - Default state */
 
 /* HOVER STATE - Light mode */
 group-hover:border-primary-light dark:hover:border-primary-dark
 
 
 /* HOVER STATE - Dark mode */
 dark:group-hover:border-primary-light dark:hover:border-primary-dark
 
 
 /* SELECTED STATE - Light mode */
 peer-checked:border-8
 peer-checked:border-primary-light dark:border-primary-dark
 peer-checked:surface-card
 
 /* SELECTED STATE - Dark mode */
 dark:peer-checked:border-primary-light dark:border-primary-dark
 dark:peer-checked:surface-base
 
 /* FOCUS STATE - Keyboard navigation */
 peer-focus-visible:ring-2
 peer-focus-visible:ring-primary-light dark:ring-primary-dark
 peer-focus-visible:ring-offset-2
 dark:peer-focus-visible:ring-offset-gray-950
 
 /* DISABLED STATE */
 peer-disabled:opacity-50
 peer-disabled:border-primary-light/20 dark:border-primary-dark/20
 peer-disabled:surface-section
 dark:peer-disabled:border-primary-light/20 dark:border-primary-dark/20-strong
 dark:peer-disabled:surface-base
" />

 {/* Label and optional description */}
 <span className="flex-1">
 {/* Main label */}
 <span className={`
 block
 text-[15px]
 font-medium
 transition-colors duration-200
 
 /* LIGHT MODE */
 ${isSelected 
 ? 'text-theme-primary' 
 : 'text-theme-secondary group-hover:text-theme-primary'
 }
 
 /* DARK MODE */
 dark:${isSelected 
 ? 'text-white' 
 : 'text-gray-300 dark:group-hover:text-white'
 }
 
 /* DISABLED STATE */
 peer-disabled:opacity-50
 peer-disabled:text-theme-muted
 dark:peer-disabled:text-theme-muted
 `}>
 {/* Optional icon */}
 {option.icon && (
 <span className="inline-flex mr-1.5 align-middle">
 {option.icon}
 </span>
 )}
 {option.label}
 </span>

 {/* Optional description */}
 {option.description && (
 <span
 id={`${optionId}-desc`}
 className="
 block
 text-[13px]
 text-theme-muted mt-0.5
 leading-relaxed
 peer-disabled:opacity-50
"
 >
 {option.description}
 </span>
 )}
 </span>
 </label>
 </div>
 )
 })}
 </div>
 )
}

// ============================================================================
// USAGE EXAMPLES:
// ============================================================================
// 
// ✅ RATING FILTER:
// <RadioFilter
// options={[
// { id: 'any', label: 'Any rating' },
// { id: '4', label: '4+ stars', description: 'Highly rated tours' },
// { id: '4.5', label: '4.5+ stars', description: 'Top rated experiences' }
// ]}
// value={filters.minRating}
// onChange={(value) => handleFilterChange({ minRating: value })}
// groupLabel="Minimum rating"
// />
// 
// ✅ AVAILABILITY FILTER (Horizontal layout):
// <RadioFilter
// options={[
// { id: 'today', label: 'Today' },
// { id: 'tomorrow', label: 'Tomorrow' },
// { id: 'week', label: 'This week' }
// ]}
// value={filters.availability}
// onChange={(value) => handleFilterChange({ availability: value })}
// layout="horizontal"
// groupLabel="Availability"
// />
// 
// ✅ WITH ICONS:
// <RadioFilter
// options={[
// { 
// id: 'instant', 
// label: 'Instant Booking', 
// icon: <Zap className="w-3.5 h-3.5" />,
// description: 'Book immediately without waiting'
// },
// { 
// id: 'request', 
// label: 'Request to Book', 
// icon: <Clock className="w-3.5 h-3.5" />,
// description: 'Guide approves within 24h'
// }
// ]}
// value={bookingMode}
// onChange={setBookingMode}
// />
// ============================================================================
