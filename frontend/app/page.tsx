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
      <section
        className="py-10 sm:py-16 bg-white dark:bg-gray-950"
        aria-label="Upcoming features"
      >
        <div className="container mx-auto px-4 text-center">
          {/* Section heading - dual text colors */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            More Features Coming Soon
          </h2>

          {/* Section description - dual text colors */}
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
            We're building a complete travel marketplace with advanced features.
          </p>

          {/* 
            FEATURE CARDS - DUAL THEME IMPLEMENTATION
            Each card has separate styles for light/dark
          */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl sm:max-w-4xl mx-auto">
            {/* Feature Card 1: Safety */}
            <div className="card-theme hover:shadow-lg transition-shadow">
              {/* Icon placeholder - dual colors */}
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto opacity-30">
                <div className="w-6 h-6 rounded bg-gray-400 dark:bg-gray-600     /* Dual icon colors */" />
              </div>

              {/* Feature title - dual text colors */}
              <h3 className="font-semibold text-gray-900 dark:text-white      /* Dual title colors */ mb-2">
                Advanced Safety
              </h3>

              {/* Feature description - dual text colors */}
              <p className="text-sm text-gray-500 dark:text-gray-400   /* Dual description colors */">
                Verified guides, secure payments, 48h refund guarantee
              </p>
            </div>

            {/* Feature Card 2: Categories */}
            <div className="card-theme hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto opacity-30">
                <div className="w-6 h-6 rounded bg-gray-400 dark:bg-gray-600     /* Dual icon colors */" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white      /* Dual title colors */ mb-2">
                Curated Categories
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400   /* Dual description colors */">
                Halal-friendly, hiking, historical, cultural experiences
              </p>
            </div>

            {/* Feature Card 3: Live Map */}
            <div className="card-theme hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto opacity-30">
                <div className="w-6 h-6 rounded bg-gray-400 dark:bg-gray-600     /* Dual icon colors */" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white      /* Dual title colors */ mb-2">
                Live Impact Map
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400   /* Dual description colors */">
                Real-time tour tracking and community impact visualization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ============================================
        SECTION 5: FOOTER
        ============================================
        Dual theme footer
      */}
      <footer
        className="py-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
        aria-label="Footer"
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} SafariHub Travel Marketplace
          </p>
        </div>
      </footer>
    </>
  )
}

