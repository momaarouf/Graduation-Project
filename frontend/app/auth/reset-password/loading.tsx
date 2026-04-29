// ============================================================================
// RESET PASSWORD - LOADING SKELETON
// ============================================================================

export default function ResetPasswordLoading() {
 return (
 <div className="w-full max-w-md mx-auto animate-pulse">
 <div className="surface-card rounded-2xl border border-theme shadow-xl p-6 sm:p-8">
 
 {/* Header */}
 <div className="text-center mb-6">
 <div className="h-8 w-48 surface-section rounded-lg mx-auto mb-2" />
 <div className="h-4 w-56 surface-section rounded-lg mx-auto" />
 </div>

 {/* Password Fields */}
 <div className="space-y-4">
 <div className="space-y-1.5">
 <div className="h-4 w-24 surface-section rounded" />
 <div className="h-11 surface-section rounded-lg" />
 </div>
 <div className="space-y-1.5">
 <div className="h-4 w-32 surface-section rounded" />
 <div className="h-11 surface-section rounded-lg" />
 </div>

 {/* Button */}
 <div className="h-11 surface-section rounded-lg mt-6" />
 </div>

 {/* Back to Login */}
 <div className="mt-6 text-center">
 <div className="h-4 w-32 surface-section rounded mx-auto" />
 </div>
 </div>
 </div>
 )
}