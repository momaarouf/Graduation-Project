// ============================================================================
// CURATED CATEGORIES TILES COMPONENT - DUAL THEME
// ============================================================================
// LOCATION: /frontend/src/components/landing/CategoryTiles.tsx
// 
// PURPOSE: Display visual category tiles for tour discovery
// 
// BUSINESS REQUIREMENTS (from project spec):
// 1. Visual tiles with icons and labels
// 2. Clickable - navigates to filtered search results
// 3. Dual theme support (light/dark mode)
// 4. Responsive grid (2 mobile, 4 desktop)
// 5. SEO-friendly with proper heading structure
// 
// COLOR PSYCHOLOGY:
// - Halal / Nature → Green (success, harmony)
// - Hiking / Adventure → Orange (action, energy)
// - Historical / Cultural → Blue (trust, knowledge)
// - Food / Premium → Gold (premium, quality)
// 
// ACCESSIBILITY:
// - All interactive elements have proper aria labels
// - Focus states are visible
// - Color contrast meets WCAG standards
// ============================================================================

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  // Halal & Religious
  Star,
  // Hiking & Adventure
  Mountain,
  // Historical
  Landmark,
  // Cultural
  Palette,
  // Food
  Utensils,
  // Family
  Users,
  // Beach/Water
  Waves,
  // City/Urban
  Building2,
  // Shopping
  ShoppingBag,
  // Photography
  Camera
} from 'lucide-react'

// ============================================================================
// CATEGORY DATA
// ============================================================================
// Each category represents a tour type with:
// - id: Unique identifier for URL params
// - name: Display name (localized ready)
// - description: Short description for tooltips/SEO
// - icon: Lucide icon component
// - color: Light mode color class
// - darkColor: Dark mode color class
// - bgColor: Background gradient/color
// - href: Search URL with filters
// - count: Approximate number of tours (optional)
// ============================================================================

const CATEGORIES = [
  {
    id: 'halal',
    name: 'Halal Tourism',
    description: 'Prayer spaces, halal food, Muslim-friendly',
    icon: Star,
    lightColor: 'text-emerald-600',
    darkColor: 'dark:text-emerald-400',
    bgGradient: 'from-emerald-500/10 to-emerald-500/5',
    darkBgGradient: 'dark:from-emerald-500/20 dark:to-emerald-500/10',
    borderColor: 'border-emerald-200',
    darkBorderColor: 'dark:border-emerald-800',
    hoverBg: 'hover:bg-emerald-50',
    darkHoverBg: 'dark:hover:bg-emerald-900/20',
    href: '/tours?category=halal&halal=true',
    count: '240+ tours',
  },
  {
    id: 'hiking',
    name: 'Hiking & Adventure',
    description: 'Mountains, trails, outdoor experiences',
    icon: Mountain,
    lightColor: 'text-orange-600',
    darkColor: 'dark:text-orange-400',
    bgGradient: 'from-orange-500/10 to-orange-500/5',
    darkBgGradient: 'dark:from-orange-500/20 dark:to-orange-500/10',
    borderColor: 'border-orange-200',
    darkBorderColor: 'dark:border-orange-800',
    hoverBg: 'hover:bg-orange-50',
    darkHoverBg: 'dark:hover:bg-orange-900/20',
    href: '/tours?category=hiking',
    count: '180+ tours',
  },
  {
    id: 'historical',
    name: 'Historical Sites',
    description: 'Ancient ruins, museums, heritage locations',
    icon: Landmark,
    lightColor: 'text-blue-600',
    darkColor: 'dark:text-blue-400',
    bgGradient: 'from-blue-500/10 to-blue-500/5',
    darkBgGradient: 'dark:from-blue-500/20 dark:to-blue-500/10',
    borderColor: 'border-blue-200',
    darkBorderColor: 'dark:border-blue-800',
    hoverBg: 'hover:bg-blue-50',
    darkHoverBg: 'dark:hover:bg-blue-900/20',
    href: '/tours?category=historical',
    count: '150+ tours',
  },
  {
    id: 'cultural',
    name: 'Cultural Experiences',
    description: 'Local traditions, crafts, ceremonies',
    icon: Palette,
    lightColor: 'text-purple-600',
    darkColor: 'dark:text-purple-400',
    bgGradient: 'from-purple-500/10 to-purple-500/5',
    darkBgGradient: 'dark:from-purple-500/20 dark:to-purple-500/10',
    borderColor: 'border-purple-200',
    darkBorderColor: 'dark:border-purple-800',
    hoverBg: 'hover:bg-purple-50',
    darkHoverBg: 'dark:hover:bg-purple-900/20',
    href: '/tours?category=cultural',
    count: '120+ tours',
  },
  {
    id: 'food',
    name: 'Food Tours',
    description: 'Cooking classes, tastings, local cuisine',
    icon: Utensils,
    lightColor: 'text-amber-600',
    darkColor: 'dark:text-amber-400',
    bgGradient: 'from-amber-500/10 to-amber-500/5',
    darkBgGradient: 'dark:from-amber-500/20 dark:to-amber-500/10',
    borderColor: 'border-amber-200',
    darkBorderColor: 'dark:border-amber-800',
    hoverBg: 'hover:bg-amber-50',
    darkHoverBg: 'dark:hover:bg-amber-900/20',
    href: '/tours?category=food',
    count: '90+ tours',
  },
  {
    id: 'family',
    name: 'Family Activities',
    description: 'Kid-friendly, group discounts available',
    icon: Users,
    lightColor: 'text-pink-600',
    darkColor: 'dark:text-pink-400',
    bgGradient: 'from-pink-500/10 to-pink-500/5',
    darkBgGradient: 'dark:from-pink-500/20 dark:to-pink-500/10',
    borderColor: 'border-pink-200',
    darkBorderColor: 'dark:border-pink-800',
    hoverBg: 'hover:bg-pink-50',
    darkHoverBg: 'dark:hover:bg-pink-900/20',
    href: '/tours?category=family',
    count: '110+ tours',
  },
  {
    id: 'beach',
    name: 'Beach & Water',
    description: 'Coastal tours, snorkeling, boat trips',
    icon: Waves,
    lightColor: 'text-cyan-600',
    darkColor: 'dark:text-cyan-400',
    bgGradient: 'from-cyan-500/10 to-cyan-500/5',
    darkBgGradient: 'dark:from-cyan-500/20 dark:to-cyan-500/10',
    borderColor: 'border-cyan-200',
    darkBorderColor: 'dark:border-cyan-800',
    hoverBg: 'hover:bg-cyan-50',
    darkHoverBg: 'dark:hover:bg-cyan-900/20',
    href: '/tours?category=beach',
    count: '80+ tours',
  },
  {
    id: 'city',
    name: 'City Tours',
    description: 'Urban exploration, architecture, nightlife',
    icon: Building2,
    lightColor: 'text-slate-600',
    darkColor: 'dark:text-slate-400',
    bgGradient: 'from-slate-500/10 to-slate-500/5',
    darkBgGradient: 'dark:from-slate-500/20 dark:to-slate-500/10',
    borderColor: 'border-slate-200',
    darkBorderColor: 'dark:border-slate-700',
    hoverBg: 'hover:bg-slate-50',
    darkHoverBg: 'dark:hover:bg-slate-800/30',
    href: '/tours?category=city',
    count: '200+ tours',
  },
]

// ============================================================================
// CATEGORY TILE COMPONENT (Individual)
// ============================================================================

interface CategoryTileProps {
  category: typeof CATEGORIES[0]
}

function CategoryTile({ category }: CategoryTileProps) {
  const Icon = category.icon
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href={category.href}
      className={`group relative flex flex-col p-5 sm:p-6 rounded-xl border-2 transition-all duration-300 ${category.borderColor} ${category.darkBorderColor} bg-gradient-to-br ${category.bgGradient} ${category.darkBgGradient} ${category.hoverBg} ${category.darkHoverBg} hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 ${category.lightColor.replace('text-', 'focus:ring-')} dark:focus:ring-offset-gray-900`}
      aria-label={`Browse ${category.name} tours, ${category.count} available`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ========================================
           DECORATIVE BACKGROUND ELEMENT
           ======================================== */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-bl-full bg-current" />

      {/* ========================================
           ICON CONTAINER
           ======================================== */}
      <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 rounded-lg bg-white dark:bg-gray-900 shadow-sm transition-transform duration-300 group-hover:scale-110">
        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${category.lightColor} ${category.darkColor} transition-transform duration-300 ${isHovered ? 'rotate-3 scale-110' : ''}`} />

        {/* Animated ring on hover */}
        <div className={`absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-current transition-all duration-300 opacity-0 group-hover:opacity-30 ${category.lightColor} ${category.darkColor}`} />
      </div>

      {/* ========================================
           CATEGORY NAME & COUNT
           ======================================== */}
      <div className="relative">
        <h3 className={`font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-1 group-hover:${category.lightColor} group-hover:${category.darkColor} transition-colors duration-300`}>
          {category.name}
        </h3>

        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
          {category.description}
        </p>

        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs font-medium ${category.lightColor} ${category.darkColor} group-hover:underline`}>
            Explore →
          </span>

          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            {category.count}
          </span>
        </div>
      </div>

      {/* ========================================
           ACCESSIBILITY: Screen reader only text
           ======================================== */}
      <span className="sr-only">
        Click to browse {category.count} of {category.name} tours
      </span>
    </Link>
  )
}

// ============================================================================
// MAIN CATEGORY TILES GRID COMPONENT
// ============================================================================

export default function CategoryTiles() {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Loading skeleton for SSR
  if (!mounted) {
    return (
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-950">
        <div className="container-safe mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-10">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-4" />
            <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-gray-950 scroll-mt-16" aria-label="Tour categories">
      <div className="container-safe mx-auto">

        {/* ========================================
             SECTION HEADER
             ======================================== */}
        <div className="text-center mb-8 sm:mb-12">
          {/* Pre-header badge */}
          <span className="inline-block px-3 py-1 mb-4 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
            Discover Experiences
          </span>

          {/* Main heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Curated Categories
          </h2>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore tours by interest, from Halal-friendly adventures
            to historical landmarks and cultural experiences
          </p>
        </div>

        {/* ========================================
             CATEGORY GRID
             ========================================
             Responsive breakpoints:
             - Mobile: 2 columns
             - Tablet: 3 columns
             - Desktop: 4 columns
             - Large desktop: 4 columns (max width)
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((category) => (
            <CategoryTile
              key={category.id}
              category={category}
            />
          ))}
        </div>

        {/* ========================================
             BROWSE ALL LINK
             ======================================== */}
        <div className="flex justify-center mt-10 sm:mt-12">
          <Link href="/tours" className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium text-sm sm:text-base hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-300 shadow-md hover:shadow-lg">
            Browse All Tours
            <span className="group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          </Link>
        </div>

        {/* ========================================
             SCHEMA MARKUP (SEO)
             ======================================== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              'itemListElement': CATEGORIES.map((cat, index) => ({
                '@type': 'ListItem',
                'position': index + 1,
                'item': {
                  '@type': 'Thing',
                  'name': cat.name,
                  'description': cat.description,
                  'url': `https://safaribub.com${cat.href}`,
                }
              }))
            })
          }}
        />
      </div>
    </section>
  )
}

// ============================================================================
// USAGE INSTRUCTIONS:
// ============================================================================
//
// 1. Import in page.tsx:
//    import CategoryTiles from '@/src/components/landing/CategoryTiles'
//
// 2. Add to component tree (after SafetyPillarBar):
//    <SafetyPillarBar />
//    <CategoryTiles />
//    <TrustPartnersSection />
//
// 3. URL structure: /tours?category=[id]&halal=true (for halal)
//
// 4. Customization:
//    - Add/remove categories in CATEGORIES array
//    - Change colors per category
//    - Modify grid columns in className
//
// 5. SEO:
//    - Proper heading hierarchy (h2 → h3)
//    - Schema.org markup for rich results
//    - Semantic HTML5 elements
//    - Descriptive link text
//
// 6. Performance:
//    - No external dependencies
//    - Optimized with next/link for prefetching
//    - Lazy-friendly with skeleton loading
//    - Minimal client JavaScript
// ============================================================================