// ============================================================================
// SAFETY PILLAR BAR COMPONENT - DUAL THEME
// ============================================================================
// LOCATION: /frontend/src/components/landing/SafetyPillarBar.tsx
// 
// PURPOSE: Display trust signals and safety guarantees to travelers
// 
// BUSINESS REQUIREMENTS (from project spec):
// 1. Verified Guides - Manual ID verification by admin
// 2. Secure Payment - Whish integration with 48h payout freeze
// 3. Refund Guarantee - 48h+ = 100% refund, 24-48h = 50%, <24h = 0%
// 4. Halal-Friendly - Certification badge for Muslim travelers
// 
// DESIGN SPECS:
// - Color Psychology: 
// - Blue: trust & primary actions (Verified)
// - Green: success / verified (Halal)
// - Orange: call-to-action (Refund)
// - Gold: loyalty & premium (Secure)
// 
// DARK MODE: Each pillar has separate light/dark colors
// ============================================================================

'use client'

import { Shield, Lock, Clock, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

// ============================================================================
// SAFETY PILLAR DATA
// ============================================================================
// Each pillar represents a core trust signal with:
// - icon: Lucide icon component
// - title: Short headline
// - description: Detailed explanation
// - lightColor: Tailwind color class for light mode
// - darkColor: Tailwind color class for dark mode
// ============================================================================

const SAFETY_PILLARS = [
 {
 icon: Shield,
 title: 'Verified Guides',
 description: 'Every guide manually verified with government ID',
 lightColor: 'text-primary-light dark:text-primary-dark',
 darkColor: 'dark:text-primary-dark ',
 bgLight: 'bg-primary-light/10',
 bgDark: '',
 borderLight: 'border-primary-light dark:border-primary-dark',
 borderDark: 'dark:border-primary-light dark:border-primary-dark',
 },
 {
 icon: Lock,
 title: 'Secure Payments',
 description: 'Funds held safely, released 48h after tour completion',
 lightColor: 'text-amber-600',
 darkColor: 'dark:text-amber-400',
 bgLight: 'bg-amber-50',
 bgDark: 'dark:bg-amber-900/20',
 borderLight: 'border-accent-light dark:border-accent-dark',
 borderDark: 'dark:border-accent-light dark:border-accent-dark',
 },
 {
 icon: Clock,
 title: '48h Refund',
 description: 'Full refund if cancelled 48h+ before tour',
 lightColor: 'text-orange-600',
 darkColor: 'dark:text-orange-400',
 bgLight: 'bg-orange-50',
 bgDark: 'dark:bg-orange-900/20',
 borderLight: 'border-orange-100',
 borderDark: 'dark:border-orange-800',
 },
 {
 icon: Star,
 title: 'Halal-Friendly',
 description: 'Tours certified Halal, prayer spaces available',
 lightColor: 'text-success-green',
 darkColor: 'dark:text-emerald-400',
 bgLight: 'bg-emerald-50',
 bgDark: 'dark:bg-emerald-900/20',
 borderLight: 'border-success-green',
 borderDark: 'dark:border-success-green',
 },
] as const

// ============================================================================
// SAFETY PILLAR COMPONENT
// ============================================================================

export default function SafetyPillarBar() {
 const [mounted, setMounted] = useState(false)

 // Prevent hydration mismatch
 useEffect(() => {
 setMounted(true)
 }, [])

 // Don't render during SSR to prevent theme mismatch
 if (!mounted) {
 return (
 <section className="py-8 sm:py-10 surface-card border-y border-theme">
 <div className="container-safe mx-auto">
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="h-24 animate-pulse surface-section rounded-xl" />
 ))}
 </div>
 </div>
 </section>
 )
 }

 return (
 <section className="py-8 sm:py-10 surface-card border-y border-theme" aria-label="Safety guarantees and trust signals">
 <div className="container-safe mx-auto">

 {/* ========================================
 SECTION HEADER (Optional)
 ======================================== */}
 <div className="text-center mb-6 sm:mb-8">
 <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-light/10 border border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark rounded-full text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
 <Shield className="w-3.5 h-3.5" />
 Your Safety Is Our Priority
 </span>
 <h2 className="sr-only text-2xl sm:text-3xl font-bold text-theme-primary mt-4">
 Trust & Safety Guarantees
 </h2>
 </div>

 {/* ========================================
 SAFETY PILLARS GRID
 ========================================
 Responsive: 
 - Mobile: 2 columns
 - Tablet: 2 columns
 - Desktop: 4 columns
 */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 {SAFETY_PILLARS.map((pillar, index) => {
 const Icon = pillar.icon

 return (
 <div key={index} className={`group relative flex flex-col p-4 sm:p-5 rounded-xl transition-all duration-300 hover:shadow-md ${pillar.bgLight} ${pillar.bgDark} border ${pillar.borderLight} ${pillar.borderDark}`}>
 {/* ========================================
 ICON CONTAINER
 ======================================== */}
 <div className="flex items-center justify-between mb-3">
 <div className="p-2.5 rounded-lg surface-card shadow-sm transition-transform duration-300 group-hover:scale-110">
 <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${pillar.lightColor} ${pillar.darkColor}`} />
 </div>

 {/* ========================================
 DECORATIVE CORNER ACCENT
 ======================================== */}
 <div className={`w-1.5 h-1.5 rounded-full opacity-50 ${pillar.lightColor} ${pillar.darkColor}`} />
 </div>

 {/* ========================================
 TITLE & DESCRIPTION
 ======================================== */}
 <h3 className="font-semibold text-base sm:text-lg text-theme-primary mb-1.5">
 {pillar.title}
 </h3>

 <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
 {pillar.description}
 </p>

 {/* ========================================
 HOVER TOOLTIP (Optional)
 ======================================== */}
 <div className="absolute inset-x-0 -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
 <div className="mx-auto w-2 h-2 surface-base rotate-45" />
 </div>
 </div>
 )
 })}
 </div>

 {/* ========================================
 MICRO-TRUST BADGES (Additional trust signals)
 ======================================== */}
 <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-theme-muted ">
 <span className="flex items-center gap-1.5">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
 100% ID Verification
 </span>
 <span className="flex items-center gap-1.5">
 <span className="w-1.5 h-1.5 rounded-full bg-primary-light" />
 48h Payout Protection
 </span>
 <span className="flex items-center gap-1.5">
 <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
 Secure Booking
 </span>
 <span className="flex items-center gap-1.5">
 <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
 24/7 Support
 </span>
 </div>
 </div>
 </section>
 )
}

// ============================================================================
// USAGE NOTES:
// ============================================================================
//
// 1. Add to page.tsx after HeroSection:
// <HeroSection />
// <SafetyPillarBar />
// <TrustPartnersSection />
//
// 2. All colors automatically switch in dark mode
//
// 3. Mobile responsive: 2 columns on mobile, 4 on desktop
//
// 4. Accessibility:
// - Proper aria-label on section
// - Semantic heading structure
// - Sufficient color contrast
//
// 5. Performance:
// - No external dependencies
// - Pure Tailwind CSS
// - Minimal JavaScript
// ============================================================================