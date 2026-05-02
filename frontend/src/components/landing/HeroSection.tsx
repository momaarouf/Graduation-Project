// ============================================================================
// HERO SECTION - DUAL THEME COMPONENT
// ============================================================================
// LOCATION: /frontend/src/components/landing/HeroSection.tsx
// 
// PURPOSE: Main hero with dual theme implementation
// 
// IMPORTANT: Every element has separate light/dark colors
// Format: `light-color dark:dark-color`
// ============================================================================

'use client'

import { Search, Shield, Users, Globe, Star, ChevronDown, Check } from 'lucide-react'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'

export default function HeroSection() {
 const router = useRouter()
 const [searchQuery, setSearchQuery] = useState('')
 const [selectedLocation, setSelectedLocation] = useState('')

 const handleSearch = (e: FormEvent<HTMLFormElement>) => {
 e.preventDefault()

 const params = new URLSearchParams()

 if (searchQuery.trim()) {
 params.append('q', searchQuery.trim())
 }

 if (selectedLocation) {
 params.append('location', selectedLocation)
 }

 const queryString = params.toString()
 router.push(`/tours${queryString ? `?${queryString}` : ''}`)
 }

 const LOCATIONS = [
 { value: '', label: 'Anywhere' },
 { value: 'lebanon', label: 'Lebanon' },
 { value: 'turkey', label: 'Turkey' },
 { value: 'beirut', label: 'Beirut' },
 { value: 'istanbul', label: 'Istanbul' },
 ] as const

 const STATISTICS = [
 { icon: Users, value: '1,200+', label: 'Guides' },
 { icon: Shield, value: '100%', label: 'Verified' },
 { icon: Star, value: '4.8/5', label: 'Rating' },
 { icon: Globe, value: '2', label: 'Countries' },
 ] as const

 return (
 <section
 // ============================================
 // SECTION STYLES - DUAL THEME GRADIENT
 // ============================================
 className="relative min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
 aria-label="Main hero section"
 >
 {/* 
 ============================================
 GRID BACKGROUND - DUAL THEME PATTERN
 ============================================
 Uses custom utility that switches between
 light/dark grid patterns
 */}
 <div
 className="absolute inset-0 bg-theme-grid"
 aria-hidden="true"
 />

 {/* 
 ============================================
 DECORATIVE GRADIENTS - DUAL COLORS
 ============================================
 Different gradient colors for each theme
 */}
 <div
 className="absolute top-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"
 aria-hidden="true"
 />

 <div
 className="absolute bottom-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-orange-200 dark:bg-orange-900/20 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl"
 aria-hidden="true"
 />

 {/* 
 ============================================
 MAIN CONTENT CONTAINER
 ============================================
 */}
 <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 text-center">

 {/* 
 ============================================
 TRUST BADGE - DUAL THEME
 ============================================
 */}
 <div
 className="inline-flex items-center gap-2 surface-card  rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8 border border-success-green dark:border-success-green"
 role="status"
 >
 {/* Icon with dual colors */}
 <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-success-green dark:text-emerald-400" />

 {/* Text with dual colors */}
 <span className="text-xs sm:text-sm font-medium text-theme-secondary">
 Trusted by <span className="font-semibold">10K+</span> travelers
 </span>
 </div>

 {/* 
 ============================================
 MAIN HEADLINE - DUAL THEME
 ============================================
 */}
 <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-theme-primary mb-4 sm:mb-6 px-2 leading-tight">
 Discover{' '}
 {/* Highlight 1 - Dual colors */}
 <span className="text-primary-light dark:text-primary-dark block sm:inline">
 Authentic Experiences
 </span>{' '}
 with{' '}
 {/* Highlight 2 - Dual colors */}
 <span className="text-orange-600 dark:text-orange-400 block sm:inline">
 Verified Guides
 </span>
 </h1>

 {/* 
 ============================================
 SUBHEADING - DUAL THEME
 ============================================
 */}
 <p className="text-sm sm:text-base md:text-lg text-theme-secondary mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-4 leading-relaxed">
 Book Halal-friendly tours, cultural adventures, and hidden gems in Lebanon and Turkey.
 </p>

 {/* 
 ============================================
 SEARCH FORM - DUAL THEME
 ============================================
 */}
 <form
 onSubmit={handleSearch}
 className="w-full max-w-4xl mx-auto surface-paper rounded-xl sm:rounded-2xl shadow-pop-light dark:shadow-pop-dark p-1.5 sm:p-2 border border-theme transition-all duration-300"
 role="search"
 >
 <div className="flex flex-col sm:flex-row gap-2">

 {/* SEARCH INPUT - DUAL THEME */}
 <div className="flex-1 relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search for tours..."
 className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base border-0 bg-transparent focus:outline-none rounded-lg sm:rounded-xl placeholder-gray-500 dark:placeholder-gray-400"
 aria-label="Search for tours"
 />
 </div>

 {/* LOCATION DROPDOWN - DUAL THEME */}
 <div className="relative w-full sm:w-40">
 <Listbox value={selectedLocation} onChange={setSelectedLocation}>
 <div className="relative h-full">
 <ListboxButton className="w-full h-full flex items-center gap-3 pl-9 sm:pl-10 pr-8 sm:pr-10 py-3 sm:py-4 text-sm sm:text-base surface-section rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 text-left">
 <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
 <span className="block truncate">
 {LOCATIONS.find(loc => loc.value === selectedLocation)?.label}
 </span>
 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted transition-transform duration-200 ui-open:rotate-180" />
 </ListboxButton>

 <Transition
 leave="transition ease-in duration-100"
 leaveFrom="opacity-100"
 leaveTo="opacity-0"
 >
 <ListboxOptions className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl surface-card py-1.5 text-sm shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none">
 {LOCATIONS.map((location) => (
 <ListboxOption
 key={location.value}
 value={location.value}
 className={({ focus, selected }) => `relative cursor-default select-none py-2.5 pl-10 pr-4 transition-colors ${focus ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-theme-primary'} ${selected ? 'font-semibold' : 'font-normal'}`}
 >
 {({ selected }) => (
 <>
 <span className={`block truncate ${selected ? 'text-orange-600 dark:text-orange-400' : ''}`}>
 {location.label}
 </span>
 {selected ? (
 <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-600 dark:text-orange-400">
 <Check className="w-4 h-4" />
 </span>
 ) : null}
 </>
 )}
 </ListboxOption>
 ))}
 </ListboxOptions>
 </Transition>
 </div>
 </Listbox>
 </div>

 {/* SEARCH BUTTON - DUAL THEME */}
 <button
 type="submit"
 className="bg-orange-500 dark:bg-orange-600 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors shadow-md"
 aria-label="Search tours"
 >
 Search
 </button>
 </div>

 {/* SEARCH TIPS - DUAL THEME */}
 <div className="mt-2 px-2 hidden xs:block">
 <p className="text-xs sm:text-sm text-theme-muted text-left">
 💡 Try:"Halal food","Historical sites","Family activities"
 </p>
 </div>
 </form>

 {/* 
 ============================================
 STATISTICS GRID - DUAL THEME
 ============================================
 */}
 <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-2 max-w-2xl mx-auto">
 {STATISTICS.map((stat, index) => (
 <div
 key={index}
 className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg sm:rounded-xl surface-card  border border-theme"
 >
 {/* Icon with dual colors */}
 <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-light dark:text-primary-dark" />

 {/* Value with dual colors */}
 <span className="text-lg sm:text-xl md:text-2xl font-bold text-theme-primary">
 {stat.value}
 </span>

 {/* Label with dual colors */}
 <span className="text-xs sm:text-sm font-medium text-theme-secondary text-center">
 {stat.label}
 </span>
 </div>
 ))}
 </div>

 {/* 
 ============================================
 MOBILE CTA BUTTON - DUAL THEME
 ============================================
 */}
 <div className="mt-6 sm:hidden">
 <button
 onClick={() => router.push('/auth/signup')}
 className="bg-primary-light dark:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg w-full max-w-xs"
 aria-label="Start your journey"
 >
 Start Your Journey
 </button>
 </div>
 </div>
 </section>
 )
}