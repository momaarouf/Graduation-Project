// ============================================================================
// LANDING PAGE - DUAL THEME IMPLEMENTATION
// ============================================================================
// LOCATION: /frontend/src/app/page.tsx
// 
// PURPOSE: Showcase dual theme system with separate colors for light/dark
// 
// COLOR USAGE GUIDE:
// 
// LIGHT MODE (Default):
// - Backgrounds: White and light gray
// - Text: Dark gray and muted gray
// - Accents: Bright, saturated colors
// 
// DARK MODE (When .dark class is present):
// - Backgrounds: Dark gray and black
// - Text: Light gray and muted light gray
// - Accents: Muted, desaturated colors
// 
// HOW TO USE DUAL COLORS:
// Use classes like: `text-primary-light dark:text-primary-dark`
// This applies primary-light in light mode, primary-dark in dark mode
// ============================================================================

import Navigation from '@/src/components/layout/Navigation'
import HeroSection from '@/src/components/landing/HeroSection'
import SafetyPillarBar from '@/src/components/landing/SafetyPillarBar'
import CategoryTiles from '@/src/components/landing/CategoryTiles'
import ImpactMap from '@/src/components/landing/ImpactMap'



export default function HomePage() {
  return (
    <>
      {/* 
        ============================================
        SECTION 1: GLOBAL NAVIGATION
        ============================================
        Uses dual theme colors automatically
      */}
      <Navigation />

      {/* 
        ============================================
        SECTION 2: MAIN HERO
        ============================================
        Full dual theme implementation
      */}
      <HeroSection />

      {/* 
        ============================================
        SECTION 2.5: SAFETY PILLARS
        ============================================ */}
      <SafetyPillarBar />
      {/* ← NEW: Curated Categories */}
      <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-900 ..."></section>
      <CategoryTiles />
      {/* ← NEW: Live Impact Map */}
      <ImpactMap />
      <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-900 ..."></section>
      {/* 
        ============================================
        SECTION 3: TRUST & PARTNERS
        ============================================
        Dual theme section with separate colors
      */}
      <section
        className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
        aria-label="Trusted partners"
      >
        <div className="container mx-auto px-4 text-center">
          {/* Section title - dual text colors */}
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            TRUSTED PARTNERS
          </p>

          {/* Partner logos - dual colors */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8">
            {/* Each logo has separate light/dark colors */}
            <div className="text-sm sm:text-base font-bold text-gray-400 dark:text-gray-600">
              WHISH
            </div>

            <div className="text-sm sm:text-base font-semibold text-gray-400 dark:text-gray-600   /* Dual logo colors */">
              Tourism Lebanon
            </div>

            <div className="text-sm sm:text-base font-semibold text-gray-400 dark:text-gray-600   /* Dual logo colors */">
              Turkey Tourism
            </div>
          </div>
        </div>
      </section>

      {/* 
        ============================================
        SECTION 4: FEATURES PREVIEW
        ============================================
        Cards with complete dual theme support
      */}
      

      {/* Footer is rendered by the root layout */}
    </>
  )
}
