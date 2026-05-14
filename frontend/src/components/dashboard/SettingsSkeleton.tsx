import React from 'react'

export default function SettingsSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden animate-pulse">
      <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 surface-section rounded-xl" />
          <div className="space-y-2">
            <div className="h-8 w-48 surface-section rounded-lg" />
            <div className="h-3 w-32 surface-section rounded" />
          </div>
        </div>

        {/* Console Skeleton */}
        <div className="surface-card border border-theme rounded-[2.5rem] overflow-hidden shadow-xl">
          {/* Tabs Skeleton */}
          <div className="flex border-b border-theme bg-surface-section/30 h-14">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-1 border-r border-theme last:border-0 flex items-center justify-center">
                <div className="h-3 w-20 surface-section rounded" />
              </div>
            ))}
          </div>

          <div className="p-8 space-y-10">
            {/* Form Section Skeleton */}
            <div className="space-y-6">
              <div className="h-4 w-40 surface-section rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-24 surface-section rounded ml-1" />
                    <div className="h-14 w-full surface-section rounded-2xl" />
                  </div>
                ))}
              </div>
            </div>

            {/* Banner/Card Skeleton */}
            <div className="h-32 w-full surface-section rounded-[2.5rem]" />

            {/* Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="h-14 w-48 surface-section rounded-2xl" />
              <div className="h-14 w-32 surface-section rounded-2xl" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
