import React from 'react'

export default function GuideTourSummarySkeleton() {
  return (
    <div className="pt-14 sm:pt-16 min-h-screen surface-base animate-pulse">
      <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10 space-y-10">
        
        {/* Breadcrumb / Back Link */}
        <div className="h-4 w-32 surface-section rounded" />

        {/* Master Header Card Skeleton */}
        <div className="surface-card border border-theme rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-6 sm:p-10 flex flex-col lg:flex-row gap-10">
             {/* Left: Image Skeleton */}
             <div className="sm:w-64 lg:w-80 shrink-0">
                <div className="aspect-[4/3] rounded-[2rem] surface-section border border-theme mb-6" />
                <div className="grid grid-cols-2 gap-3">
                   <div className="h-12 surface-section rounded-2xl" />
                   <div className="h-12 surface-section rounded-2xl" />
                </div>
             </div>

             {/* Right: Info Skeleton */}
             <div className="flex-1 space-y-6">
                <div className="space-y-4">
                   <div className="h-4 w-32 surface-section rounded" />
                   <div className="h-16 w-full surface-section rounded-2xl" />
                </div>
                <div className="flex gap-4">
                   <div className="h-4 w-24 surface-section rounded" />
                   <div className="h-4 w-24 surface-section rounded" />
                   <div className="h-4 w-24 surface-section rounded" />
                </div>
                <div className="h-16 w-full surface-section rounded-2xl" />
             </div>
          </div>
        </div>

        {/* Wide Stats Strip Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-32 surface-card border border-theme rounded-[2rem]" />
           ))}
        </div>

        {/* Details Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Left Content */}
           <div className="lg:col-span-2 space-y-10">
              <div className="surface-card border border-theme rounded-[2.5rem] p-12 h-96" />
              <div className="surface-card border border-theme rounded-[2.5rem] p-12 h-64" />
           </div>

           {/* Right Sidebar */}
           <div className="space-y-10">
              <div className="surface-card border border-theme rounded-[2.5rem] p-8 h-80" />
              <div className="h-48 surface-card border border-theme rounded-[2.5rem] p-8" />
           </div>
        </div>

      </div>
    </div>
  )
}
