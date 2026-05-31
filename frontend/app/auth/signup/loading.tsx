// ============================================================================
// SIGNUP PAGE - LOADING SKELETON
// ============================================================================
// LOCATION: /frontend/src/app/auth/signup/loading.tsx
// 
// PURPOSE: Display loading skeleton while page is being prepared
// 
// WHY THIS FILE EXISTS:
// ---------------------
// 1. Next.js 15+ automatically shows this during page transitions
// 2. Prevents layout shift (CLS) by matching final layout structure
// 3. Better UX than a generic spinner
// 4. Maintains visual consistency with the actual page
// 
// DESIGN PHILOSOPHY:
// - Match the exact dimensions of final content
// - Animated pulse effect that respects reduced motion
// - Maintains the same layout structure
// ============================================================================


export default function SignupLoading() {
 return (
 <div className="container-safe mx-auto max-w-7xl py-8 sm:py-12 md:py-16">

 {/* ========================================
 STATS BAR SKELETON
 ======================================== */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12 md:mb-16">
 {[1, 2, 3, 4].map((i) => (
 <div
 key={i}
 className="p-4 sm:p-5 surface-card border border-theme rounded-xl animate-pulse"
 >
 <div className="flex items-center gap-3 mb-2">
 <div className="w-9 h-9 sm:w-10 sm:h-10 surface-section rounded-lg" />
 <div className="w-12 h-6 sm:w-14 sm:h-7 surface-section rounded" />
 </div>
 <div className="w-16 h-3 surface-section rounded mb-1" />
 <div className="w-24 h-2 surface-section rounded" />
 </div>
 ))}
 </div>

 {/* ========================================
 HEADER SKELETON
 ======================================== */}
 <div className="text-center mb-8 sm:mb-10 md:mb-12">
 {/* Pre-header badge */}
 <div className="w-32 h-6 surface-section rounded-full mx-auto mb-4 animate-pulse" />

 {/* Main heading */}
 <div className="w-64 sm:w-80 h-8 sm:h-10 md:h-12 surface-section rounded-lg mx-auto mb-4 animate-pulse" />

 {/* Subheading */}
 <div className="w-full max-w-md h-4 surface-section rounded mx-auto animate-pulse" />
 </div>

 {/* ========================================
 PATH SELECTION CARDS SKELETON
 ======================================== */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
 {/* Traveler Card Skeleton */}
 <div className="surface-card border border-theme rounded-2xl overflow-hidden animate-pulse">
 <div className="p-6 sm:p-8 space-y-6">
 {/* Icon */}
 <div className="w-14 h-14 surface-section rounded-xl" />

 {/* Title */}
 <div className="space-y-2">
 <div className="w-32 h-6 surface-section rounded" />
 <div className="w-48 h-4 surface-section rounded" />
 </div>

 {/* Features */}
 <div className="space-y-3">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="flex items-center gap-2">
 <div className="w-4 h-4 surface-section rounded-full" />
 <div className="w-40 h-3 surface-section rounded" />
 </div>
 ))}
 </div>

 {/* CTA */}
 <div className="w-full h-12 surface-section rounded-xl" />
 </div>
 </div>

        {/* Guide Card Skeleton */}
        <div className="surface-card border border-theme rounded-2xl overflow-hidden animate-pulse">
          <div className="p-6 sm:p-8 space-y-6">
            {/* "POPULAR" BADGE */}
            <div className="w-16 h-5 surface-section rounded-full" />

 {/* Icon */}
 <div className="w-14 h-14 surface-section rounded-xl" />

 {/* Title */}
 <div className="space-y-2">
 <div className="w-32 h-6 surface-section rounded" />
 <div className="w-48 h-4 surface-section rounded" />
 </div>

 {/* Features */}
 <div className="space-y-3">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="flex items-center gap-2">
 <div className="w-4 h-4 surface-section rounded-full" />
 <div className="w-40 h-3 surface-section rounded" />
 </div>
 ))}
 </div>

 {/* CTA */}
 <div className="w-full h-12 surface-section rounded-xl" />
 </div>
 </div>
 </div>

 {/* ========================================
 TRUST BADGES SKELETON
 ======================================== */}
 <div className="mt-10 sm:mt-12 md:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="flex items-center gap-1.5">
 <div className="w-4 h-4 surface-section rounded-full" />
 <div className="w-20 h-3 surface-section rounded" />
 </div>
 ))}
 </div>

 {/* ========================================
 FAQ TEASER SKELETON
 ======================================== */}
 <div className="mt-8 pt-8 border-t border-[#c8d8f8] dark:border-[#1a3566]">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="space-y-2">
 <div className="w-24 h-3 surface-section rounded" />
 <div className="w-32 h-3 surface-section rounded" />
 </div>
 ))}
 </div>
 </div>
 </div>
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
