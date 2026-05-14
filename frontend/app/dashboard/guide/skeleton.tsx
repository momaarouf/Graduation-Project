import React from 'react'

export default function GuideDashboardSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
      <div className="relative pt-6 sm:pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 animate-pulse">
          
          {/* Hero Hub Skeleton */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 w-full max-w-md">
              <div className="flex items-center gap-3">
                <div className="h-7 w-28 surface-section rounded-full" />
                <div className="h-7 w-24 surface-section rounded-full" />
              </div>
              <div className="h-10 sm:h-12 w-3/4 surface-section rounded-xl" />
            </div>
            <div className="h-14 w-full sm:w-48 surface-section rounded-2xl flex-shrink-0" />
          </div>

          {/* Metric Grid Skeleton (3 columns matching live page) */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card border border-theme rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4">
                <div className="w-10 h-10 surface-section rounded-xl" />
                <div className="h-8 w-16 surface-section rounded-lg" />
                <div className="h-3 w-20 surface-section rounded" />
              </div>
            ))}
          </div>

          {/* Bottom Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            <div className="lg:col-span-2 space-y-8 sm:space-y-12">
              <div className="surface-card border border-theme rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-6">
                <div className="h-7 w-48 surface-section rounded-lg" />
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 surface-section rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-8 sm:space-y-12">
              <div className="surface-card border border-theme rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4">
                <div className="h-7 w-36 surface-section rounded-lg" />
                <div className="h-32 surface-section rounded-xl" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
