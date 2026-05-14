import React from 'react'

export default function AdminToursSkeleton() {
  return (
    <div className="space-y-8 pb-20 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 surface-section rounded-2xl" />
             <div className="h-6 w-32 surface-section rounded-xl" />
          </div>
          <div className="h-10 w-64 surface-section rounded-2xl" />
          <div className="h-4 w-full max-w-md surface-section rounded" />
        </div>
        
        <div className="flex items-center gap-4">
           <div className="h-20 w-32 surface-card rounded-[2rem] border border-theme" />
           <div className="h-14 w-14 surface-card rounded-[1.5rem] border border-theme" />
        </div>
      </div>

      {/* Search Skeleton */}
      <div className="h-16 w-full surface-card rounded-[2rem] border-2 border-theme" />

      {/* Grid Listing Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="surface-card rounded-[2.5rem] border border-theme overflow-hidden h-[450px] flex flex-col">
             <div className="h-56 surface-section" />
             <div className="p-6 flex-1 space-y-6">
                <div className="flex justify-between">
                   <div className="h-4 w-24 surface-section rounded" />
                   <div className="h-4 w-20 surface-section rounded" />
                </div>
                <div className="space-y-2">
                   <div className="h-6 w-full surface-section rounded" />
                   <div className="h-4 w-3/4 surface-section rounded" />
                </div>
                <div className="flex gap-2">
                   <div className="h-6 w-16 surface-section rounded-lg" />
                   <div className="h-6 w-16 surface-section rounded-lg" />
                </div>
                <div className="h-12 w-full surface-section rounded-2xl" />
             </div>
          </div>
        ))}
      </div>

    </div>
  )
}
