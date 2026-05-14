import React from 'react'

export default function GuideProfileSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
      <div className="max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 relative z-10 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="relative mb-16">
          <div className="relative h-48 sm:h-64 rounded-3xl sm:rounded-[2.5rem] surface-section border border-theme shadow-xl" />
          <div className="absolute -bottom-24 sm:-bottom-28 left-4 sm:left-8 flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-6">
            <div className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-3xl border-4 border-theme surface-card shadow-2xl" />
            <div className="mb-4 sm:mb-6 space-y-2">
              <div className="h-10 w-48 surface-section rounded-xl" />
              <div className="h-6 w-32 surface-section rounded-full" />
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-44 sm:mt-40 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 sm:p-5 surface-card border border-theme rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 surface-section rounded-xl" />
              <div className="h-6 w-20 surface-section rounded" />
              <div className="h-3 w-24 surface-section rounded" />
            </div>
          ))}
        </div>

        {/* 2-Column Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-10">
            <div className="surface-card border border-theme rounded-3xl p-8 space-y-4">
              <div className="h-6 w-32 surface-section rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full surface-section rounded" />
                <div className="h-4 w-full surface-section rounded" />
                <div className="h-4 w-3/4 surface-section rounded" />
              </div>
            </div>
            <div className="surface-card border border-theme rounded-3xl p-8 space-y-4">
              <div className="h-6 w-40 surface-section rounded" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-12 surface-section rounded-xl" />)}
              </div>
            </div>
            <div className="surface-card border border-theme rounded-3xl p-8 space-y-4">
              <div className="h-6 w-48 surface-section rounded" />
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="aspect-[4/3] surface-section rounded-2xl" />)}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <div className="surface-card border border-theme rounded-3xl p-8 space-y-4">
              <div className="h-6 w-36 surface-section rounded" />
              <div className="h-20 surface-section rounded-2xl" />
            </div>
            <div className="surface-card border border-theme rounded-3xl p-8 space-y-4">
              <div className="h-6 w-32 surface-section rounded" />
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-24 surface-section rounded" />
                    <div className="h-4 w-12 surface-section rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
