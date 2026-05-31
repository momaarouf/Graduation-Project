// ============================================================================
// TOUR DETAIL - LOADING SKELETON
// ============================================================================
// LOCATION: /frontend/src/app/tours/[id]/loading.tsx
// 
// PURPOSE: Display loading skeleton while tour data is being fetched
// 
// WHY THIS FILE EXISTS:
// ---------------------
// 1. Next.js 15+ automatically shows this component during page transitions
// 2. Prevents layout shift (CLS) by matching the final layout structure
// 3. Better UX than a generic spinner
// 4. Maintains visual consistency with the actual page
// 
// DESIGN DECISIONS:
// ----------------
// 1. Uses the same PageLayout wrapper as the actual page
// 2. Maintains exact same padding structure (pt-14/sm:pt-16)
// 3. Animated pulse effect that respects reduced motion
// 4. Matches the 2-column grid layout
// ============================================================================

import PageLayout from '@/src/components/layout/PageLayout'

export default function TourDetailLoading() {
 return (
 <PageLayout>
 {/* ========================================
 PAGE OFFSET - Matches actual page
 ======================================== */}
 <div className="pt-14 sm:pt-16">
 <div className="container-safe mx-auto max-w-7xl">

 {/* ========================================
 2-COLUMN GRID - Matches actual layout
 ======================================== */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 py-6 lg:py-8">

 {/* ========================================
 LEFT COLUMN - Main content (2/3 width)
 ======================================== */}
 <div className="lg:col-span-2 space-y-6 lg:space-y-8">

 {/* ---- HERO SECTION SKELETON ---- */}
 <div className="space-y-4">
 {/* Main image */}
 <div className="relative aspect-[16/9] w-full surface-section rounded-xl animate-pulse">
 {/* Gallery strip */}
 <div className="absolute bottom-4 left-4 flex gap-2">
 {[1, 2, 3, 4].map((i) => (
 <div
 key={i}
 className="w-16 h-16 surface-section rounded-lg"
 />
 ))}
 </div>
 </div>

 {/* Title */}
 <div className="space-y-3">
 <div className="h-8 sm:h-9 lg:h-10 w-3/4 surface-section rounded-lg animate-pulse" />

 {/* Rating & meta */}
 <div className="flex items-center gap-4">
 <div className="h-5 w-32 surface-section rounded animate-pulse" />
 <div className="h-5 w-24 surface-section rounded animate-pulse" />
 </div>
 </div>
 </div>

 {/* ---- TOUR INFO SKELETON ---- */}
 <div className="space-y-6">
 {/* Description */}
 <div className="space-y-2">
 <div className="h-6 w-40 surface-section rounded animate-pulse" />
 <div className="space-y-2">
 {[1, 2, 3, 4].map((i) => (
 <div
 key={i}
 className="h-4 w-full surface-section rounded animate-pulse"
 />
 ))}
 </div>
 </div>

 {/* Itinerary */}
 <div className="space-y-4">
 <div className="h-6 w-32 surface-section rounded animate-pulse" />
 {[1, 2, 3].map((i) => (
 <div key={i} className="flex gap-4">
 <div className="w-8 h-8 surface-section rounded-full animate-pulse" />
 <div className="flex-1 space-y-2">
 <div className="h-5 w-48 surface-section rounded animate-pulse" />
 <div className="h-4 w-32 surface-section rounded animate-pulse" />
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* ---- GUIDE PROFILE SKELETON ---- */}
 <div className="space-y-4">
 <div className="h-6 w-40 surface-section rounded animate-pulse" />

 <div className="flex gap-4">
 <div className="w-20 h-20 surface-section rounded-2xl animate-pulse" />

 <div className="flex-1 space-y-2">
 <div className="h-6 w-48 surface-section rounded animate-pulse" />
 <div className="h-4 w-32 surface-section rounded animate-pulse" />
 </div>
 </div>
 </div>
 </div>

 {/* ========================================
 RIGHT COLUMN - Booking card (1/3 width)
 ======================================== */}
 <div className="lg:col-span-1">
 <div className="lg:sticky lg:top-24">
 {/* Booking card skeleton */}
 <div className="surface-card border border-theme rounded-xl shadow-lg overflow-hidden animate-pulse">
 {/* Price header */}
 <div className="p-6 border-b border-[#c8d8f8] dark:border-[#1a3566]">
 <div className="h-8 w-32 surface-section rounded mb-2" />
 <div className="h-4 w-24 surface-section rounded" />
 </div>

 {/* Form fields */}
 <div className="p-6 space-y-4">
 <div className="space-y-2">
 <div className="h-4 w-20 surface-section rounded" />
 <div className="h-10 w-full surface-section rounded-lg" />
 </div>

 <div className="space-y-2">
 <div className="h-4 w-24 surface-section rounded" />
 <div className="flex gap-2">
 <div className="h-10 w-10 surface-section rounded-lg" />
 <div className="flex-1 h-10 surface-section rounded-lg" />
 <div className="h-10 w-10 surface-section rounded-lg" />
 </div>
 </div>

 {/* CTA button */}
 <div className="h-12 w-full surface-section rounded-lg mt-4" />
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </PageLayout>
 )
}

// ============================================================================
// PERFORMANCE NOTES:
// ============================================================================
//
// 1. This skeleton matches the exact dimensions of the final content
// 2. No layout shift when the real data loads (Zero CLS)
// 3. Uses the same container structure as the actual page
// 4. Animations respect `prefers-reduced-motion` media query
// ============================================================================
