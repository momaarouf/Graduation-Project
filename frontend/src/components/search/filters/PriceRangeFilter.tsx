// ============================================================================
// PRICE RANGE FILTER - DUAL INPUT + SLIDER
// ============================================================================
// LOCATION: /frontend/src/components/search/filters/PriceRangeFilter.tsx
// 
// PURPOSE: Filter tours by minimum and maximum price
// 
// BUSINESS REQUIREMENTS:
// 1. Support USD, TRY, LBP currencies
// 2. Dual inputs for min/max
// 3. Visual slider (future enhancement)
// 4. Debounced input to prevent excessive re-renders
// 5. Input validation (min ≤ max)
// 
// COLOR PSYCHOLOGY:
// - Blue: Active price range
// - Gray: Inactive range
// ============================================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { DollarSign } from 'lucide-react'
import type { PriceRangeProps } from '../types/filters.types'
import { PRICE_RANGE } from '../types/filters.types'

// Debounce utility to prevent too many filter updates
const useDebounce = <T,>(value: T, delay: number): T => {
 const [debouncedValue, setDebouncedValue] = useState<T>(value)

 useEffect(() => {
 const timer = setTimeout(() => setDebouncedValue(value), delay)
 return () => clearTimeout(timer)
 }, [value, delay])

 return debouncedValue
}

export default function PriceRangeFilter({
 minPrice,
 maxPrice,
 absoluteMin = PRICE_RANGE.MIN,
 absoluteMax = PRICE_RANGE.MAX,
 onChange,
 currency = 'USD'
}: PriceRangeProps) {
 // Local state for inputs (for immediate feedback)
 const [localMin, setLocalMin] = useState<string>(
 minPrice?.toString() || absoluteMin.toString()
 )
 const [localMax, setLocalMax] = useState<string>(
 maxPrice?.toString() || absoluteMax.toString()
 )

 // Debounced values for actual filter updates
 const debouncedMin = useDebounce(localMin, 500)
 const debouncedMax = useDebounce(localMax, 500)

 // ========================================
 // Currency symbol mapping
 // ========================================
 const currencySymbols: Record<string, string> = {
 USD: '$',
 TRY: '₺',
 LBP: 'ل.ل'
 }

 const currencySymbol = currencySymbols[currency] || '$'

 // ========================================
 // Update parent when debounced values change
 // ========================================
 useEffect(() => {
 const min = localMin === '' ? undefined : Number(localMin)
 const max = localMax === '' ? undefined : Number(localMax)

 // Only update if values are valid AND different from initial props
 // This prevents the"refresh to all" bug on mount
 const isInitialValue = min === minPrice && max === maxPrice
 if (isInitialValue) return

 if (
 (min === undefined || !isNaN(min)) &&
 (max === undefined || !isNaN(max))
 ) {
 onChange(min, max)
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [debouncedMin, debouncedMax])

 // ========================================
 // Input change handlers with validation
 // ========================================
 const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const value = e.target.value

 // Allow empty string
 if (value === '') {
 setLocalMin('')
 return
 }

 const numValue = Number(value)

 // Validate: must be number, ≥ absoluteMin, ≤ max
 if (
 !isNaN(numValue) &&
 numValue >= absoluteMin &&
 (localMax === '' || numValue <= Number(localMax))
 ) {
 setLocalMin(value)
 }
 }

 const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const value = e.target.value

 // Allow empty string
 if (value === '') {
 setLocalMax('')
 return
 }

 const numValue = Number(value)

 // Validate: must be number, ≤ absoluteMax, ≥ min
 if (
 !isNaN(numValue) &&
 numValue <= absoluteMax &&
 (localMin === '' || numValue >= Number(localMin))
 ) {
 setLocalMax(value)
 }
 }

 // ========================================
 // Quick range buttons
 // ========================================
 const quickRanges = [
 { label: 'Under $50', min: undefined, max: 50 },
 { label: '$50 - $100', min: 50, max: 100 },
 { label: '$100 - $200', min: 100, max: 200 },
 { label: 'Over $200', min: 200, max: undefined }
 ]

 const handleQuickRange = (min?: number, max?: number) => {
 setLocalMin(min?.toString() || '')
 setLocalMax(max?.toString() || '')
 }

 // ========================================
 // Clear range
 // ========================================
 const handleClear = () => {
 setLocalMin('')
 setLocalMax('')
 }

 return (
 <div className="w-full space-y-4">
 {/* ========================================
 PRICE INPUTS - Dual field
 ======================================== */}
 <div className="flex items-center gap-3">
 {/* Min input */}
 <div className="flex-1 relative">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted text-[15px] font-medium">
 {currencySymbol}
 </span>
 <input
 type="number"
 value={localMin}
 onChange={handleMinChange}
 placeholder="Min"
 min={absoluteMin}
 max={maxPrice || absoluteMax}
 className="w-full pl-8 pr-3 py-2.5 text-[15px] font-medium surface-paper border border-primary-light/20 dark:border-primary-dark/20 rounded-full text-theme-primary placeholder-text-light-muted focus:outline-none focus:ring-1 focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
 aria-label="Minimum price"
 />
 </div>

 <span className="text-theme-muted font-medium">—</span>

 {/* Max input */}
 <div className="flex-1 relative">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted text-[15px] font-medium">
 {currencySymbol}
 </span>
 <input
 type="number"
 value={localMax}
 onChange={handleMaxChange}
 placeholder="Max"
 min={minPrice || absoluteMin}
 max={absoluteMax}
 className="w-full pl-8 pr-3 py-2.5 text-[15px] font-medium surface-paper border border-primary-light/20 dark:border-primary-dark/20 rounded-full text-theme-primary placeholder-text-light-muted focus:outline-none focus:ring-1 focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
 aria-label="Maximum price"
 />
 </div>
 </div>

 {/* ========================================
 QUICK RANGE BUTTONS
 ======================================== */}
 <div className="flex flex-wrap gap-2">
 {quickRanges.map((range, index) => {
 const isActive =
 (range.min === undefined && localMin === '') ||
 (range.max === undefined && localMax === '') ||
 (Number(localMin) === range.min && Number(localMax) === range.max)

 return (
 <button
 key={index}
 onClick={() => handleQuickRange(range.min, range.max)}
 className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 ${isActive ? 'bg-primary-light dark:bg-primary-dark text-white shadow-md' : 'surface-section text-theme-secondary hover:surface-section dark:hover:surface-hover border border-primary-light/20 dark:border-primary-dark/20 '}`}
 >
 {range.label}
 </button>
 )
 })}
 </div>

 {/* ========================================
 CLEAR BUTTON (if filters active)
 ======================================== */}
 {(localMin !== '' || localMax !== '') && (
 <button
 onClick={handleClear}
 className="text-xs text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300 transition-colors"
 >
 Clear price range
 </button>
 )}

 {/* ========================================
 PRICE RANGE SLIDER (Future Enhancement)
 ======================================== 
 TODO: Add RangeSlider component in Phase 2
 For V1, we use dual inputs
 */}
 </div>
 )
}