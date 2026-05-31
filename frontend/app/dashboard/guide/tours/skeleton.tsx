import React from 'react'

export default function GuideToursSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar">
      <div className="max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-9 w-48 surface-section rounded-xl" />
            <div className="h-4 w-64 surface-section rounded-lg" />
          </div>
          <div className="h-12 w-40 surface-section rounded-2xl" />
        </div>

        {/* Metric Hub Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 sm:p-6 surface-card border border-theme rounded-2xl sm:rounded-3xl space-y-3">
              <div className="w-8 h-8 surface-section rounded-xl" />
              <div className="h-7 w-16 surface-section rounded-lg" />
              <div className="h-3 w-20 surface-section rounded" />
            </div>
          ))}
        </div>

        {/* Toolbar Skeleton */}
        <div className="surface-card border border-theme rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
          <div className="h-12 surface-section rounded-xl flex-1" />
          <div className="h-12 w-32 surface-section rounded-xl" />
        </div>

        {/* Inventory Grid Skeleton - Matching Page Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="surface-card border border-theme rounded-[2.5rem] p-6 space-y-6">
              <div className="aspect-[4/3] surface-section rounded-[1.5rem] border border-theme" />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="h-6 w-1/2 surface-section rounded-lg" />
                  <div className="h-6 w-16 surface-section rounded-lg" />
                </div>
                <div className="flex gap-4">
                  <div className="h-3 w-20 surface-section rounded" />
                  <div className="h-3 w-20 surface-section rounded" />
                </div>
                <div className="pt-4 border-t border-[#c8d8f8] dark:border-[#1a3566] flex justify-between items-center">
                   <div className="flex gap-4">
                      <div className="h-8 w-12 surface-section rounded-lg" />
                      <div className="h-8 w-12 surface-section rounded-lg" />
                   </div>
                   <div className="h-10 w-10 surface-section rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
