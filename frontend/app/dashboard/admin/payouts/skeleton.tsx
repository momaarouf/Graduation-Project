import React from 'react'

export default function AdminPayoutsSkeleton() {
  return (
    <div className="space-y-6 pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 surface-section rounded-xl" />
          <div className="h-4 w-64 surface-section rounded" />
        </div>
        <div className="h-12 w-32 surface-section rounded-2xl" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 surface-card border border-theme rounded-3xl p-5 space-y-3">
             <div className="w-10 h-10 surface-section rounded-2xl" />
             <div className="h-8 w-24 surface-section rounded" />
             <div className="h-3 w-16 surface-section rounded" />
          </div>
        ))}
      </div>

      {/* Controls Skeleton */}
      <div className="surface-card p-4 rounded-3xl border border-theme flex flex-col lg:flex-row gap-4">
        <div className="h-12 flex-1 surface-section rounded-2xl" />
        <div className="flex gap-2">
           <div className="h-12 w-32 surface-section rounded-2xl" />
           <div className="h-12 w-12 surface-section rounded-2xl" />
        </div>
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden lg:block surface-card rounded-3xl border border-theme overflow-hidden">
        <div className="h-12 surface-section border-b border-[#c8d8f8] dark:border-[#1a3566]" />
        <div className="divide-y divide-theme">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="px-6 py-6 flex items-center justify-between">
               <div className="flex gap-6 items-center flex-1">
                  <div className="h-4 w-16 surface-section rounded" />
                  <div className="space-y-2">
                     <div className="h-4 w-32 surface-section rounded" />
                     <div className="h-3 w-20 surface-section rounded" />
                  </div>
                  <div className="h-4 w-24 surface-section rounded" />
                  <div className="space-y-2">
                     <div className="h-4 w-24 surface-section rounded" />
                     <div className="h-3 w-16 surface-section rounded" />
                  </div>
               </div>
               <div className="h-8 w-24 surface-section rounded-full" />
               <div className="h-8 w-8 surface-section rounded-xl ml-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Card Skeleton */}
      <div className="lg:hidden space-y-4">
         {[1, 2, 3].map(i => (
           <div key={i} className="h-40 surface-card border border-theme rounded-3xl" />
         ))}
      </div>

    </div>
  )
}
