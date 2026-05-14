import React from 'react'

export default function TravelerPaymentsSkeleton() {
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="h-10 w-64 surface-section rounded-xl" />
          <div className="h-4 w-48 surface-section rounded-lg" />
        </div>
        <div className="h-14 w-full sm:w-48 surface-section rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Card Skeleton */}
        <div className="lg:col-span-1">
          <div className="h-72 surface-card border border-theme rounded-[2.5rem] p-8 space-y-6" />
        </div>

        {/* Right List Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="surface-card border border-theme rounded-[2rem] p-6 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 surface-section rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-5 w-40 surface-section rounded" />
                    <div className="h-3 w-24 surface-section rounded" />
                  </div>
                </div>
                <div className="h-10 w-10 surface-section rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
