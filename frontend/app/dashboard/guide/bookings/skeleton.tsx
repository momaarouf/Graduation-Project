import React from 'react'

export default function GuideBookingsSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar">
      <div className="max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2 w-full max-w-xs">
            <div className="h-8 sm:h-10 w-48 surface-section rounded-xl" />
            <div className="h-4 w-64 surface-section rounded-lg" />
          </div>
          <div className="h-10 w-full sm:w-40 surface-section rounded-xl flex-shrink-0" />
        </div>

        {/* Stats Cards Skeleton (4 columns matching live page) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="surface-card border border-theme rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="w-8 h-8 surface-section rounded-lg" />
              <div className="h-6 w-12 surface-section rounded-md" />
              <div className="h-3 w-16 surface-section rounded" />
            </div>
          ))}
        </div>

        {/* Tab Switcher Skeleton */}
        <div className="flex gap-2 p-1 surface-section rounded-xl w-full sm:w-64">
          <div className="h-10 flex-1 surface-card rounded-lg" />
          <div className="h-10 flex-1 surface-section rounded-lg" />
        </div>

        {/* Bookings Rows Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-card border border-theme rounded-2xl p-5 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 surface-section rounded-xl flex-shrink-0" />
                <div className="space-y-2">
                  <div className="h-5 w-40 sm:w-56 surface-section rounded" />
                  <div className="h-4 w-32 surface-section rounded" />
                  <div className="h-3 w-24 surface-section rounded" />
                </div>
              </div>
              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 flex-shrink-0">
                <div className="h-6 w-20 surface-section rounded-full" />
                <div className="h-8 w-24 surface-section rounded-lg" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
