'use client'

// ============================================================================
// PRICE SLIDER COMPONENT - DUAL THUMB RANGE SLIDER
// ============================================================================
// LOCATION: /frontend/src/components/search/PriceSlider.tsx
// 
// PURPOSE: Allow users to select a price range with visual slider
// 
// FEATURES:
// - Dual thumb controls (min/max)
// - Real-time value display
// - Currency formatting
// - Keyboard accessible
// - Touch friendly
// - Dual theme support
// 
// COLOR PSYCHOLOGY:
// - Blue: Selected range, active thumbs
// - Gray: Unselected range
// - Green: Currency highlight
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PriceSliderProps {
 /** Current minimum value */
 min: number
 /** Current maximum value */
 max: number
 /** Callback when range changes */
 onChange: (range: [number, number]) => void
 /** Absolute minimum allowed value */
 absoluteMin?: number
 /** Absolute maximum allowed value */
 absoluteMax?: number
 /** Step increment */
 step?: number
 /** Currency symbol */
 currency?: string
 /** Format function for value display */
 formatValue?: (value: number) => string
 /** Additional CSS classes */
 className?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const defaultFormatValue = (value: number, currency: string = '$'): string => {
 return `${currency}${value}`
}

const clamp = (value: number, min: number, max: number): number => {
 return Math.min(Math.max(value, min), max)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PriceSlider({
 min,
 max,
 onChange,
 absoluteMin = 0,
 absoluteMax = 500,
 step = 5,
 currency = '$',
 formatValue = defaultFormatValue,
 className = ''
}: PriceSliderProps) {
 // ========================================
 // STATE
 // ========================================
 const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
 const [localMin, setLocalMin] = useState(min)
 const [localMax, setLocalMax] = useState(max)
 
 // ========================================
 // REFS
 // ========================================
 const sliderRef = useRef<HTMLDivElement>(null)
 const minThumbRef = useRef<HTMLDivElement>(null)
 const maxThumbRef = useRef<HTMLDivElement>(null)

 // ========================================
 // DERIVED VALUES
 // ========================================
 const range = absoluteMax - absoluteMin
 const minPercent = ((localMin - absoluteMin) / range) * 100
 const maxPercent = ((localMax - absoluteMin) / range) * 100

 // ========================================
 // UPDATE LOCAL VALUES WHEN PROPS CHANGE
 // ========================================
 useEffect(() => {
 setLocalMin(min)
 setLocalMax(max)
 }, [min, max])

 // ========================================
 // HANDLE MOUSE/TOUCH DRAG
 // ========================================

 const handleDrag = useCallback((clientX: number) => {
 if (!sliderRef.current || !isDragging) return

 const rect = sliderRef.current.getBoundingClientRect()
 const x = clamp(clientX - rect.left, 0, rect.width)
 const percentage = x / rect.width
 const rawValue = absoluteMin + percentage * range
 const steppedValue = Math.round(rawValue / step) * step
 const clampedValue = clamp(steppedValue, absoluteMin, absoluteMax)

 if (isDragging === 'min') {
 const newMin = Math.min(clampedValue, localMax - step)
 if (newMin !== localMin) {
 setLocalMin(newMin)
 onChange([newMin, localMax])
 }
 } else if (isDragging === 'max') {
 const newMax = Math.max(clampedValue, localMin + step)
 if (newMax !== localMax) {
 setLocalMax(newMax)
 onChange([localMin, newMax])
 }
 }
 }, [isDragging, localMin, localMax, absoluteMin, absoluteMax, range, step, onChange])

 // Mouse event handlers
 useEffect(() => {
 const handleMouseMove = (e: MouseEvent) => {
 e.preventDefault()
 handleDrag(e.clientX)
 }

 const handleMouseUp = () => {
 setIsDragging(null)
 }

 const handleTouchMove = (e: TouchEvent) => {
 e.preventDefault()
 if (e.touches[0]) {
 handleDrag(e.touches[0].clientX)
 }
 }

 const handleTouchEnd = () => {
 setIsDragging(null)
 }

 if (isDragging) {
 document.addEventListener('mousemove', handleMouseMove)
 document.addEventListener('mouseup', handleMouseUp)
 document.addEventListener('touchmove', handleTouchMove, { passive: false })
 document.addEventListener('touchend', handleTouchEnd)
 document.addEventListener('touchcancel', handleTouchEnd)
 }

 return () => {
 document.removeEventListener('mousemove', handleMouseMove)
 document.removeEventListener('mouseup', handleMouseUp)
 document.removeEventListener('touchmove', handleTouchMove)
 document.removeEventListener('touchend', handleTouchEnd)
 document.removeEventListener('touchcancel', handleTouchEnd)
 }
 }, [isDragging, handleDrag])

 // ========================================
 // KEYBOARD HANDLERS
 // ========================================

 const handleKeyDown = (e: React.KeyboardEvent, thumb: 'min' | 'max') => {
 const increment = e.shiftKey ? step * 5 : step
 
 if (thumb === 'min') {
 if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
 e.preventDefault()
 const newMin = Math.min(localMin + increment, localMax - step)
 setLocalMin(newMin)
 onChange([newMin, localMax])
 } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
 e.preventDefault()
 const newMin = Math.max(localMin - increment, absoluteMin)
 setLocalMin(newMin)
 onChange([newMin, localMax])
 }
 } else {
 if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
 e.preventDefault()
 const newMax = Math.min(localMax + increment, absoluteMax)
 setLocalMax(newMax)
 onChange([localMin, newMax])
 } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
 e.preventDefault()
 const newMax = Math.max(localMax - increment, localMin + step)
 setLocalMax(newMax)
 onChange([localMin, newMax])
 }
 }
 }

 // ========================================
 // RENDER
 // ========================================

 return (
 <div className={`w-full space-y-4 ${className}`}>
 {/* ========================================
 PRICE DISPLAY
 ======================================== */}
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <label className="block text-xs text-theme-muted mb-1">
 Min
 </label>
 <div className="relative">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted text-sm">
 {currency}
 </span>
 <input
 type="number"
 value={localMin}
 onChange={(e) => {
 const value = parseInt(e.target.value) || absoluteMin
 const newMin = clamp(value, absoluteMin, localMax - step)
 setLocalMin(newMin)
 onChange([newMin, localMax])
 }}
 min={absoluteMin}
 max={localMax - step}
 step={step}
 className="
 w-full
 pl-8 pr-3 py-2
 surface-card
 border border-primary-light/20 dark:border-primary-dark/20-strong
 rounded-lg
 text-sm
 text-theme-primary
 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark
 [appearance:textfield]
 [&::-webkit-outer-spin-button]:appearance-none
 [&::-webkit-inner-spin-button]:appearance-none
"
 aria-label="Minimum price"
 />
 </div>
 </div>

 <div className="px-3 pt-5 text-theme-muted ">
 —
 </div>

 <div className="flex-1">
 <label className="block text-xs text-theme-muted mb-1">
 Max
 </label>
 <div className="relative">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted text-sm">
 {currency}
 </span>
 <input
 type="number"
 value={localMax}
 onChange={(e) => {
 const value = parseInt(e.target.value) || absoluteMax
 const newMax = clamp(value, localMin + step, absoluteMax)
 setLocalMax(newMax)
 onChange([localMin, newMax])
 }}
 min={localMin + step}
 max={absoluteMax}
 step={step}
 className="
 w-full
 pl-8 pr-3 py-2
 surface-card
 border border-primary-light/20 dark:border-primary-dark/20-strong
 rounded-lg
 text-sm
 text-theme-primary
 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark
 [appearance:textfield]
 [&::-webkit-outer-spin-button]:appearance-none
 [&::-webkit-inner-spin-button]:appearance-none
"
 aria-label="Maximum price"
 />
 </div>
 </div>
 </div>

 {/* ========================================
 SLIDER
 ======================================== */}
 <div className="relative pt-6 pb-2">
 {/* Slider track */}
 <div
 ref={sliderRef}
 className="relative h-2 surface-section rounded-full"
 >
 {/* Selected range */}
 <div
 className="absolute h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full"
 style={{
 left: `${minPercent}%`,
 width: `${maxPercent - minPercent}%`
 }}
 />

 {/* Min thumb */}
 <div
 ref={minThumbRef}
 role="slider"
 aria-label="Minimum price"
 aria-valuemin={absoluteMin}
 aria-valuemax={localMax}
 aria-valuenow={localMin}
 tabIndex={0}
 onMouseDown={() => setIsDragging('min')}
 onTouchStart={() => setIsDragging('min')}
 onKeyDown={(e) => handleKeyDown(e, 'min')}
 className={`
 absolute top-1/2 -translate-y-1/2
 w-5 h-5
 surface-card border-2 border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark
 rounded-full
 shadow-md
 cursor-grab
 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark focus:ring-offset-2
 dark:focus:ring-offset-gray-950
 transition-shadow
 ${isDragging === 'min' ? 'cursor-grabbing shadow-lg scale-110' : ''}
 `}
 style={{
 left: `${minPercent}%`,
 transform: 'translate(-50%, -50%)'
 }}
 >
 {/* Tooltip */}
 <div className="
 absolute -top-8 left-1/2 -translate-x-1/2
 px-2 py-1
 surface-base text-white text-xs font-medium
 rounded
 opacity-0 group-hover:opacity-100
 transition-opacity
 pointer-events-none
 whitespace-nowrap
">
 {formatValue(localMin)}
 </div>
 </div>

 {/* Max thumb */}
 <div
 ref={maxThumbRef}
 role="slider"
 aria-label="Maximum price"
 aria-valuemin={localMin}
 aria-valuemax={absoluteMax}
 aria-valuenow={localMax}
 tabIndex={0}
 onMouseDown={() => setIsDragging('max')}
 onTouchStart={() => setIsDragging('max')}
 onKeyDown={(e) => handleKeyDown(e, 'max')}
 className={`
 absolute top-1/2 -translate-y-1/2
 w-5 h-5
 surface-card border-2 border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark
 rounded-full
 shadow-md
 cursor-grab
 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark focus:ring-offset-2
 dark:focus:ring-offset-gray-950
 transition-shadow
 ${isDragging === 'max' ? 'cursor-grabbing shadow-lg scale-110' : ''}
 `}
 style={{
 left: `${maxPercent}%`,
 transform: 'translate(-50%, -50%)'
 }}
 >
 {/* Tooltip */}
 <div className="
 absolute -top-8 left-1/2 -translate-x-1/2
 px-2 py-1
 surface-base text-white text-xs font-medium
 rounded
 opacity-0 group-hover:opacity-100
 transition-opacity
 pointer-events-none
 whitespace-nowrap
">
 {formatValue(localMax)}
 </div>
 </div>
 </div>

 {/* Min/Max labels */}
 <div className="flex justify-between mt-2 text-xs text-theme-muted ">
 <span>{formatValue(absoluteMin)}</span>
 <span>{formatValue(absoluteMax)}</span>
 </div>
 </div>

 {/* ========================================
 QUICK RANGE BUTTONS
 ======================================== */}
 <div className="flex flex-wrap gap-2 pt-2">
 <button
 onClick={() => onChange([absoluteMin, 50])}
 className="
 px-3 py-1.5
 text-xs font-medium
 surface-section
 text-theme-secondary
 rounded-full
 hover:surface-section dark:hover:surface-section
 transition-colors
"
 >
 Under {currency}50
 </button>
 <button
 onClick={() => onChange([50, 100])}
 className="
 px-3 py-1.5
 text-xs font-medium
 surface-section
 text-theme-secondary
 rounded-full
 hover:surface-section dark:hover:surface-section
 transition-colors
"
 >
 {currency}50 - {currency}100
 </button>
 <button
 onClick={() => onChange([100, 200])}
 className="
 px-3 py-1.5
 text-xs font-medium
 surface-section
 text-theme-secondary
 rounded-full
 hover:surface-section dark:hover:surface-section
 transition-colors
"
 >
 {currency}100 - {currency}200
 </button>
 <button
 onClick={() => onChange([200, absoluteMax])}
 className="
 px-3 py-1.5
 text-xs font-medium
 surface-section
 text-theme-secondary
 rounded-full
 hover:surface-section dark:hover:surface-section
 transition-colors
"
 >
 Over {currency}200
 </button>
 </div>
 </div>
 )
}
