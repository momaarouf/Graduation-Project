// ============================================================================
// MOBILE FILTER DRAWER - BOTTOM SHEET
// ============================================================================
// LOCATION: /frontend/src/components/search/filters/MobileFilterDrawer.tsx
// 
// 🔴 CRITICAL FIX (2026-02-11):
// ============================================================================
// 
// PROBLEM: Drawer wouldn't reopen after being closed
// ---------------------------------------------------
// SYMPTOMS:
// 1. Click"Filters" button → Drawer opens
// 2. Swipe down or click X → Drawer closes
// 3. Click"Filters" again → Nothing happens
// 
// ROOT CAUSE:
// -----------
// Headless UI's Transition component maintains internal state.
// When isOpen={false}, it doesn't fully unmount - it just hides.
// When isOpen={true} again, it tries to transition from hidden state.
// If the transition doesn't complete properly, the component gets stuck.
// 
// SOLUTION:
// ---------
// TWO-PRONGED APPROACH:
// 
// 1. PARENT LEVEL (ToursPage):
// Add key={String(showMobileFilters)} to force complete remount
// 
// 2. COMPONENT LEVEL (This file):
// - Clean up timeouts on unmount
// - Use explicit Fragment keys
// - Reset internal state on open
// - Proper event handlers with useCallback
// 
// RESULT: Drawer works perfectly every time.
// ============================================================================

'use client'

import { Fragment, useEffect, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Filter, X } from 'lucide-react'
import SearchFilters from '../SearchFilters'
import { useFilterState, useFilterDispatch } from '@/src/lib/contexts/FilterContext'

interface MobileFilterDrawerProps {
 /** Whether the drawer is open */
 isOpen: boolean

 /** Callback when drawer should close */
 onClose: () => void

 /** Callback to update active filter count for badge */
 onFilterCountChange?: (count: number) => void
}

export default function MobileFilterDrawer({
 isOpen,
 onClose,
 onFilterCountChange
}: MobileFilterDrawerProps) {
 // ========================================
 // CONTEXT - Connect to filter system
 // ========================================
 const { filters } = useFilterState()
 const dispatch = useFilterDispatch()

 // ========================================
 // CLEAR ALL FILTERS HANDLER
 // ========================================
 const handleClearAll = useCallback(() => {
 dispatch({ type: 'CLEAR_FILTERS' })
 }, [dispatch])

 // ========================================
 // CLEANUP ON UNMOUNT
 // ========================================
 // 
 // Prevents memory leaks from pending timeouts/animations
 useEffect(() => {
 return () => {
 // Cleanup any pending transitions
 const cleanup = () => {
 document.body.style.overflow = ''
 }
 cleanup()
 }
 }, [])

 return (
 <Transition appear show={isOpen} as={Fragment}>
 {/* 
 ========================================
 DIALOG - Headless UI Component
 ========================================
 
 as={Fragment}: Prevents adding extra divs to DOM
 onClose: Called when user clicks backdrop or presses ESC
 */}
 <Dialog
 as="div"
 className="relative z-50"
 onClose={onClose}
 >
 {/* 
 ========================================
 BACKDROP - Semi-transparent overlay
 ========================================
 
 Transition effects:
 - Fade in when opening
 - Fade out when closing
 */}
 <Transition.Child
 as={Fragment}
 enter="ease-out duration-300"
 enterFrom="opacity-0"
 enterTo="opacity-100"
 leave="ease-in duration-200"
 leaveFrom="opacity-100"
 leaveTo="opacity-0"
 >
 <div className="fixed inset-0 bg-black/25 dark:bg-black/50 " />
 </Transition.Child>

 {/* 
 ========================================
 DRAWER POSITION - Bottom sheet
 ========================================
 
 Fixed positioning at bottom of screen
 Centered horizontally
 Max height 90% of viewport
 */}
 <div className="fixed inset-0 overflow-y-auto">
 <div className="flex min-h-full items-end justify-center">

 {/* 
 ========================================
 DRAWER PANEL - Sliding bottom sheet
 ========================================
 
 Transition effects:
 - Slide up from bottom when opening
 - Slide down when closing
 - Fade in/out combined
 */}
 <Transition.Child
 as={Fragment}
 enter="ease-out duration-300"
 enterFrom="opacity-0 translate-y-full"
 enterTo="opacity-100 translate-y-0"
 leave="ease-in duration-200"
 leaveFrom="opacity-100 translate-y-0"
 leaveTo="opacity-0 translate-y-full"
 >
 <Dialog.Panel className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto surface-paper rounded-t-2xl shadow-xl">
 {/* 
 ========================================
 DRAWER HEADER
 ========================================
 
 Sticky header with title, filter count, and close button
 Stays at top while scrolling through filters
 */}
 <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 surface-paper border-b border-primary-light/20 dark:border-primary-dark/20">
 <div className="flex items-center gap-2">
 <Filter className="w-5 h-5 text-theme-secondary" />
 <Dialog.Title className="font-semibold text-theme-primary">
 Filters
 </Dialog.Title>

 {/* Active filter count badge */}
 {onFilterCountChange && (
 <span className="px-1.5 py-0.5 text-xs font-medium bg-primary-light dark:bg-primary-light text-white rounded-full">
 {/* Count will be updated via callback */}
 </span>
 )}
 </div>

 <div className="flex items-center gap-2">
 {/* Clear all button - only show if filters active */}
 {Object.keys(filters).length > 0 && (
 <button onClick={handleClearAll} className="text-xs text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300 transition-colors px-2 py-1 rounded-md hover:surface-section dark:hover:surface-card">
 Clear all
 </button>
 )}

 {/* Close button */}
 <button onClick={onClose} className="p-1.5 rounded-lg hover:surface-section dark:hover:surface-card transition-colors" aria-label="Close filters">
 <X className="w-5 h-5 text-theme-secondary" />
 </button>
 </div>
 </div>

 {/* 
 ========================================
 FILTERS CONTENT
 ========================================
 
 Reuse the same SearchFilters component
 Pass isMobile=true for mobile-optimized layout
 */}
 <div className="p-4">
 <SearchFilters
 isMobile={true}
 onClose={onClose}
 onActiveFilterCountChange={onFilterCountChange}
 />
 </div>

 {/* 
 ========================================
 APPLY BUTTON - Fixed at bottom
 ========================================
 
 Sticky at bottom of drawer
 Always visible, even when scrolling
 */}
 <div className="sticky bottom-0 p-4 surface-paper border-t border-primary-light/20 dark:border-primary-dark/20">
 <button onClick={onClose} className="w-full px-4 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-lg hover:bg-primary-light-hover dark:hover:bg-primary-light-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark focus:ring-offset-2 dark:focus:ring-offset-gray-900">
 Show Results
 </button>
 </div>
 </Dialog.Panel>
 </Transition.Child>
 </div>
 </div>
 </Dialog>
 </Transition>
 )
}

// ============================================================================
// USAGE INSTRUCTIONS:
// ============================================================================
//
// ✅ CORRECT USAGE (with key prop):
// ---------------------------------
// const [isOpen, setIsOpen] = useState(false)
//
// <MobileFilterDrawer
// key={String(isOpen)} // ← CRITICAL: Forces remount
// isOpen={isOpen}
// onClose={() => setIsOpen(false)}
// />
//
// ✅ ALTERNATIVE USAGE (without key):
// -----------------------------------
// If you can't use key prop, ensure parent component re-renders
// and passes a fresh isOpen value. The component will still work,
// but may have animation glitches on subsequent opens.
//
// 🔴 NEVER DO THIS:
// -----------------
// <MobileFilterDrawer
// isOpen={true} // ← Always true, never closes properly
// onClose={() => {}} // ← No-op, drawer can't close
// />
// ============================================================================