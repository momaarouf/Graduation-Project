import React from 'react'

export default function TourFormSkeleton() {
  return (
    <div className="pt-20 sm:pt-24 min-h-screen surface-base animate-pulse">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
        
        {/* Form Header Skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-32 surface-section rounded" />
          <div className="h-10 w-64 surface-section rounded-xl" />
          <div className="h-4 w-full max-w-md surface-section rounded" />
        </div>

        {/* Progress Bar Skeleton */}
        <div className="flex gap-2 h-2">
           {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="flex-1 surface-section rounded-full" />
           ))}
        </div>

        {/* Section Card Skeleton */}
        <div className="surface-card rounded-[2.5rem] p-8 sm:p-12 border border-theme space-y-8">
           <div className="space-y-2">
              <div className="h-6 w-48 surface-section rounded" />
              <div className="h-3 w-64 surface-section rounded" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                   <div className="h-3 w-24 surface-section rounded" />
                   <div className="h-14 w-full surface-section rounded-2xl" />
                </div>
              ))}
           </div>

           <div className="space-y-2">
              <div className="h-3 w-24 surface-section rounded" />
              <div className="h-32 w-full surface-section rounded-2xl" />
           </div>
        </div>

        {/* Footer Actions Skeleton */}
        <div className="flex justify-between items-center pt-8 border-t border-theme">
           <div className="h-12 w-32 surface-section rounded-xl" />
           <div className="h-12 w-48 surface-section rounded-xl" />
        </div>

      </div>
    </div>
  )
}
