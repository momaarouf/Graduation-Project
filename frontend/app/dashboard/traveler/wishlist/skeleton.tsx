import React from 'react'

export default function TravelerWishlistSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="container-safe mx-auto max-w-5xl py-4 sm:py-12">
        
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-12 border-b border-theme pb-8 sm:pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl surface-section shadow-lg" />
              <div className="h-4 w-32 surface-section rounded-lg" />
            </div>
            <div className="h-10 w-64 surface-section rounded-xl" />
            <div className="h-5 w-80 surface-section rounded-lg" />
          </div>
          <div className="h-14 w-full sm:w-40 surface-section rounded-2xl" />
        </div>

        {/* List Skeleton */}
        <div className="flex flex-col gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="surface-card border border-theme rounded-2xl overflow-hidden h-72 sm:h-64 flex flex-col sm:flex-row">
              <div className="w-full sm:w-64 h-48 sm:h-full surface-section" />
              <div className="flex-1 p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-7 w-64 surface-section rounded" />
                    <div className="h-4 w-32 surface-section rounded" />
                  </div>
                  <div className="h-10 w-10 surface-section rounded-xl" />
                </div>
                <div className="flex gap-8">
                  <div className="space-y-2">
                    <div className="h-3 w-12 surface-section rounded" />
                    <div className="h-5 w-20 surface-section rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-12 surface-section rounded" />
                    <div className="h-5 w-20 surface-section rounded" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-12 flex-1 surface-section rounded-xl" />
                  <div className="h-12 w-12 surface-section rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
