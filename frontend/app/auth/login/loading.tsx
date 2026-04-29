// ============================================================================
// LOGIN PAGE - LOADING SKELETON
// ============================================================================
// LOCATION: /frontend/src/app/auth/login/loading.tsx
// 
// PURPOSE: Display loading skeleton while page loads
// ============================================================================

export default function LoginLoading() {
 return (
 <div className="w-full max-w-md mx-auto animate-pulse">
 <div className="surface-card rounded-2xl border border-theme shadow-xl p-6 sm:p-8">
 
 {/* Header Skeleton */}
 <div className="text-center mb-6">
 <div className="h-8 w-32 surface-section rounded-lg mx-auto mb-2" />
 <div className="h-4 w-48 surface-section rounded-lg mx-auto" />
 </div>

 {/* Email Field Skeleton */}
 <div className="space-y-5">
 <div className="space-y-1.5">
 <div className="h-4 w-24 surface-section rounded" />
 <div className="h-10 surface-section rounded-lg" />
 </div>

 {/* Password Field Skeleton */}
 <div className="space-y-1.5">
 <div className="flex justify-between">
 <div className="h-4 w-20 surface-section rounded" />
 <div className="h-3 w-24 surface-section rounded" />
 </div>
 <div className="h-10 surface-section rounded-lg" />
 </div>

 {/* Remember Me Skeleton */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="w-4 h-4 surface-section rounded" />
 <div className="h-4 w-24 surface-section rounded" />
 </div>
 <div className="h-4 w-16 surface-section rounded" />
 </div>

 {/* Button Skeleton */}
 <div className="h-11 surface-section rounded-lg" />

 {/* Divider Skeleton */}
 <div className="relative my-6">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full h-px surface-section" />
 </div>
 <div className="relative flex justify-center">
 <div className="h-4 w-24 surface-section rounded" />
 </div>
 </div>

 {/* Social Buttons Skeleton */}
 <div className="grid grid-cols-3 gap-3">
 {[1, 2, 3].map(i => (
 <div key={i} className="h-10 surface-section rounded-lg" />
 ))}
 </div>
 </div>
 </div>
 </div>
 )
}