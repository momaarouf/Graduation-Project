import React from 'react'

export default function GuideOnTourSkeleton() {
  return (
    <div className="surface-base pb-6 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="h-10 w-64 surface-section rounded-xl" />
            <div className="h-4 w-48 surface-section rounded-lg" />
          </div>
          <div className="h-12 w-full sm:w-72 surface-section rounded-xl shadow-sm" />
        </div>

        {/* Selected Tour Overview Card Skeleton */}
        <div className="surface-card border border-theme rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-7 w-56 surface-section rounded-lg" />
              <div className="h-4 w-40 surface-section rounded" />
            </div>
            <div className="h-7 w-24 surface-section rounded-full" />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="surface-section rounded-xl p-3 h-16 border border-theme" />
            ))}
          </div>
          
          <div className="h-12 w-full surface-section rounded-xl" />
        </div>

        {/* Tabs & Search Skeleton */}
        <div className="space-y-6">
          <div className="flex gap-2">
            <div className="h-10 w-32 surface-section rounded-xl" />
            <div className="h-10 w-32 surface-section rounded-xl" />
          </div>
          
          <div className="h-14 w-full surface-section rounded-2xl border border-theme shadow-sm" />

          {/* Travelers Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="surface-card border border-theme rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full surface-section" />
                    <div className="space-y-1">
                      <div className="h-4 w-24 surface-section rounded" />
                      <div className="h-3 w-16 surface-section rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-16 surface-section rounded-full" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 flex-1 surface-section rounded-lg" />
                  <div className="h-8 flex-1 surface-section rounded-lg" />
                  <div className="h-8 w-8 surface-section rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
