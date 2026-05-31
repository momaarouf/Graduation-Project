import React from 'react'

export default function TourOccurrencesSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar animate-pulse">
      <div className="max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-32 surface-section rounded" />
            <div className="h-10 w-64 surface-section rounded-xl" />
          </div>
          <div className="flex gap-2">
             <div className="h-10 w-32 surface-section rounded-xl" />
             <div className="h-10 w-32 surface-section rounded-xl" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex border-b border-[#c8d8f8] dark:border-[#1a3566] gap-8">
          <div className="h-10 w-24 surface-section rounded-t-xl" />
          <div className="h-10 w-24 surface-section rounded-t-xl" />
        </div>

        {/* Search & Actions Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
           <div className="h-12 flex-1 surface-section rounded-xl" />
           <div className="h-12 w-40 surface-section rounded-xl" />
        </div>

        {/* Occurrences Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="surface-card border border-theme rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 surface-section rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 surface-section rounded" />
                    <div className="h-3 w-40 surface-section rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 surface-section rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><div className="h-3 w-20 surface-section rounded" /><div className="h-3 w-10 surface-section rounded" /></div>
                <div className="h-2 w-full surface-section rounded-full" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 flex-1 surface-section rounded-xl" />
                <div className="h-10 w-10 surface-section rounded-xl" />
                <div className="h-10 w-10 surface-section rounded-xl" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
