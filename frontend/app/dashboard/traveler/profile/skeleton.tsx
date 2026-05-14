import React from 'react'

export default function TravelerProfileSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
      <div className="max-w-6xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-10 animate-pulse">
        
        {/* Cover & Avatar Header Replicated Skeleton */}
        <div className="relative mb-36">
          <div className="h-48 sm:h-64 rounded-3xl sm:rounded-[2rem] surface-section border border-theme w-full" />
          <div className="absolute -bottom-24 sm:-bottom-28 left-4 sm:left-8 flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-6">
            <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-3xl surface-card border-4 border-theme flex-shrink-0" />
            <div className="space-y-2 mb-4 sm:mb-6">
              <div className="h-8 sm:h-10 w-48 surface-section rounded-xl" />
              <div className="h-4 w-32 surface-section rounded-lg" />
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton (4 columns matching live page) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-36 sm:mt-40 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="surface-card border border-theme rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="w-8 h-8 surface-section rounded-lg" />
              <div className="h-6 w-16 surface-section rounded-md" />
              <div className="h-3 w-20 surface-section rounded" />
            </div>
          ))}
        </div>

        {/* Content Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="surface-card border border-theme rounded-3xl p-6 sm:p-10 space-y-4">
              <div className="h-7 w-40 surface-section rounded-lg" />
              <div className="h-32 surface-section rounded-xl" />
            </div>
          </div>
          <div className="space-y-10">
            <div className="surface-card border border-theme rounded-3xl p-6 sm:p-10 space-y-4">
              <div className="h-7 w-32 surface-section rounded-lg" />
              <div className="h-24 surface-section rounded-xl" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
