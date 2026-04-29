'use client'

// ============================================================================
// POWER SEARCH MODAL - CARD 10
// ============================================================================
// LOCATION: /frontend/src/components/search/PowerSearchModal.tsx
// 
// PURPOSE: Modal/Drawer wrapper for Power Search component
// 
// FEATURES:
// - Responsive: Modal on desktop, drawer on mobile
// - Smooth animations
// - Backdrop blur
// - ESC key to close
// - Click outside to close
// - Dual theme support
// ============================================================================

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Search } from 'lucide-react'
import PowerSearch from './PowerSearch'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PowerSearchModalProps {
 /** Is the modal open? */
 isOpen: boolean
 /** Callback when modal should close */
 onClose: () => void
 /** Initial search query */
 initialQuery?: string
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PowerSearchModal({
 isOpen,
 onClose,
 initialQuery = ''
}: PowerSearchModalProps) {
 return (
 <Transition appear show={isOpen} as={Fragment}>
 <Dialog 
 as="div" 
 className="relative z-50" 
 onClose={onClose}
 >
 {/* ========================================
 BACKDROP - Semi-transparent overlay
 ======================================== */}
 <Transition.Child
 as={Fragment}
 enter="ease-out duration-300"
 enterFrom="opacity-0"
 enterTo="opacity-100"
 leave="ease-in duration-200"
 leaveFrom="opacity-100"
 leaveTo="opacity-0"
 >
 <div className="fixed inset-0 bg-black/50 dark:bg-black/70 " />
 </Transition.Child>

 {/* ========================================
 MODAL POSITION - Centered on desktop, full on mobile
 ======================================== */}
 <div className="fixed inset-0 overflow-y-auto">
 <div className="flex min-h-full items-center justify-center p-0 sm:p-4">
 
 {/* ========================================
 MODAL PANEL - Slides in
 ======================================== */}
 <Transition.Child
 as={Fragment}
 enter="ease-out duration-300"
 enterFrom="opacity-0 scale-95 translate-y-4 sm:translate-y-0"
 enterTo="opacity-100 scale-100 translate-y-0"
 leave="ease-in duration-200"
 leaveFrom="opacity-100 scale-100 translate-y-0"
 leaveTo="opacity-0 scale-95 translate-y-4 sm:translate-y-0"
 >
 <Dialog.Panel className={`
 relative
 w-full
 h-screen sm:h-auto
 sm:max-w-2xl
 sm:max-h-[90vh]
 sm:rounded-2xl
 overflow-hidden
 surface-paper
 shadow-2xl
 `}>
 {/* ========================================
 MOBILE HANDLE BAR (for drawer feel)
 ======================================== */}
 <div className="sm:hidden absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 mt-2 surface-section rounded-full" />

 {/* ========================================
 POWER SEARCH CONTENT
 ======================================== */}
 <PowerSearch
 isOpen={isOpen}
 onClose={onClose}
 initialQuery={initialQuery}
 />
 </Dialog.Panel>
 </Transition.Child>
 </div>
 </div>
 </Dialog>
 </Transition>
 )
}

// ============================================================================
// TRIGGER BUTTON COMPONENT (Optional)
// ============================================================================

interface PowerSearchTriggerProps {
 /** Callback when trigger is clicked */
 onClick: () => void
 /** Active filter count (for badge) */
 activeFilterCount?: number
 /** Is compact mode? (for mobile) */
 compact?: boolean
}

export function PowerSearchTrigger({
 onClick,
 activeFilterCount = 0,
 compact = false
}: PowerSearchTriggerProps) {
 
 if (compact) {
 return (
 <button
 onClick={onClick}
 className="
 relative
 p-3
 surface-paper
 border border-primary-light/20 dark:border-primary-dark/20
 rounded-xl
 text-theme-secondary
 hover:surface-section dark:hover:surface-card
 hover:border-primary-light dark:hover:border-primary-dark dark:hover:border-primary-light dark:hover:border-primary-dark
 transition-all
 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark
"
 aria-label="Open power search"
 >
 <Search className="w-5 h-5" />
 {activeFilterCount > 0 && (
 <span className="
 absolute -top-1 -right-1
 min-w-[1.25rem] h-5
 px-1
 bg-primary-light dark:bg-primary-dark
 text-white text-xs font-bold
 rounded-full
 flex items-center justify-center
 shadow-lg
">
 {activeFilterCount}
 </span>
 )}
 </button>
 )
 }

 return (
 <button
 onClick={onClick}
 className="
 group
 relative
 flex-1 sm:flex-none
 px-4 py-3
 bg-gradient-to-r from-blue-600 to-indigo-600
 dark:from-blue-700 dark:to-indigo-700
 text-white font-semibold
 rounded-xl
 hover:from-blue-700 hover:to-indigo-700
 dark:hover:from-blue-800 dark:hover:to-indigo-800
 transition-all
 shadow-lg hover:shadow-xl
 flex items-center justify-center gap-2
 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark focus:ring-offset-2
 dark:focus:ring-offset-gray-950
"
 >
 <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
 <span>Power Search</span>
 {activeFilterCount > 0 && (
 <span className="
 ml-1 px-1.5 py-0.5
 surface-paper
 text-white text-xs font-bold
 rounded-full
">
 {activeFilterCount}
 </span>
 )}
 </button>
 )
}