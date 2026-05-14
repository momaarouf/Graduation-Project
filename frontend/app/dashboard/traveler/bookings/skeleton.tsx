import React from 'react'

export default function TravelerBookingsSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
      <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 animate-pulse">
        
        {/* Header Hub Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 w-full max-w-xs">
            <div className="h-10 sm:h-12 w-48 surface-section rounded-xl" />
            <div className="h-3 w-56 surface-section rounded" />
          </div>
          <div className="h-12 w-full sm:w-40 surface-section rounded-2xl flex-shrink-0" />
        </div>

        {/* Filter Hub Skeleton */}
        <div className="space-y-4">
          <div className="h-12 surface-section rounded-2xl w-full" />
          <div className="h-12 surface-section rounded-2xl w-full" />
        </div>

        {/* Booking Grid Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-card border border-theme rounded-3xl p-6 flex flex-col md:flex-row gap-6 justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 surface-section rounded-2xl flex-shrink-0" />
                <div className="space-y-3">
                  <div className="h-6 w-48 sm:w-64 surface-section rounded" />
                  <div className="h-4 w-36 surface-section rounded" />
                  <div className="h-3 w-28 surface-section rounded" />
                </div>
              </div>
              <div className="flex md:flex-col items-end justify-between md:justify-center gap-3 flex-shrink-0">
                <div className="h-6 w-24 surface-section rounded-full" />
                <div className="h-10 w-28 surface-section rounded-xl" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
