import React from 'react'

export default function VerificationSubmitSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar surface-base animate-pulse">
      <div className="max-w-2xl mx-auto py-8 sm:py-10 px-4 sm:px-6 space-y-10">
        
        {/* Back Link Skeleton */}
        <div className="h-4 w-32 surface-section rounded" />

        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-64 surface-section rounded-xl" />
          <div className="h-4 w-full surface-section rounded-lg" />
        </div>

        {/* Form Card Skeleton */}
        <div className="surface-card border border-theme rounded-2xl p-6 sm:p-8 space-y-8">
           {/* Doc Type Selector */}
           <div className="space-y-3">
              <div className="h-4 w-32 surface-section rounded" />
              <div className="grid grid-cols-2 gap-4">
                 <div className="h-24 surface-section rounded-xl" />
                 <div className="h-24 surface-section rounded-xl" />
              </div>
           </div>

           {/* Upload Slots */}
           {[1, 2, 3].map(i => (
             <div key={i} className="space-y-3">
                <div className="h-4 w-40 surface-section rounded" />
                <div className="h-32 w-full surface-section border-2 border-dashed border-theme rounded-xl" />
             </div>
           ))}

           {/* Alert Notice */}
           <div className="h-20 surface-section rounded-xl" />

           {/* Submit Button */}
           <div className="h-14 w-full surface-section rounded-xl" />
        </div>

      </div>
    </div>
  )
}
