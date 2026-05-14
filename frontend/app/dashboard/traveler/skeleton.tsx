import React from 'react'

export default function TravelerDashboardSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="relative pt-20 sm:pt-24 pb-32 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12 animate-pulse">
          
          {/* Hero Section Skeleton */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 w-full max-w-lg">
              <div className="h-6 w-24 surface-section rounded-full" />
              <div className="h-10 sm:h-14 w-full surface-section rounded-xl" />
              <div className="h-5 w-2/3 surface-section rounded-lg" />
            </div>
            <div className="h-12 w-full sm:w-36 surface-section rounded-xl flex-shrink-0" />
          </div>

          {/* Stats Grid Skeleton (3 columns matching live page) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="surface-card border border-theme rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="w-10 h-10 surface-section rounded-xl" />
                <div className="h-8 w-16 surface-section rounded-lg" />
                <div className="h-3 w-24 surface-section rounded" />
              </div>
            ))}
            {/* Loyalty Journey Card Skeleton */}
            <div className="surface-card border border-theme rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 surface-section rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 surface-section rounded" />
                  <div className="h-3 w-20 surface-section rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full surface-section rounded-full" />
                <div className="h-10 surface-section rounded-xl" />
              </div>
            </div>
          </div>

          {/* Main Content Layout Skeleton */}
          <div className="surface-card border border-theme rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4">
            <div className="h-7 w-48 surface-section rounded-lg" />
            <div className="h-32 surface-section rounded-xl" />
          </div>

        </div>
      </div>
    </div>
  )
}
