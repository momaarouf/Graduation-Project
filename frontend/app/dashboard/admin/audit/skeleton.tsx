import React from 'react'

export default function AdminAuditSkeleton() {
  return (
    <div className="space-y-8 pb-20 animate-pulse">
      {/* Header Section Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 surface-section rounded-2xl shadow-xl" />
            <div className="h-6 w-32 surface-section rounded-xl" />
          </div>
          <div className="h-10 w-64 sm:w-96 surface-section rounded-xl" />
          <div className="h-4 w-full max-w-lg surface-section rounded-lg" />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="h-20 w-32 surface-section rounded-[2rem]" />
          <div className="h-12 w-12 surface-section rounded-[1.5rem]" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-16 w-full surface-section rounded-[2rem] shadow-xl border-2 border-theme" />

      {/* Listing View Skeleton */}
      <div className="surface-card rounded-[2.5rem] border border-theme overflow-hidden shadow-sm">
        <div className="h-14 surface-section border-b border-theme" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-8 border-b border-theme last:border-0 flex gap-8">
            <div className="space-y-2 w-24">
              <div className="h-4 w-20 surface-section rounded" />
              <div className="h-3 w-16 surface-section rounded" />
            </div>
            <div className="flex items-center gap-3 w-40">
              <div className="w-10 h-10 surface-section rounded-2xl" />
              <div className="space-y-1 flex-1">
                <div className="h-4 w-20 surface-section rounded" />
                <div className="h-2 w-16 surface-section rounded" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 surface-section rounded-full" />
              <div className="h-4 w-3/4 surface-section rounded" />
            </div>
            <div className="w-20 flex flex-col items-end gap-2">
              <div className="h-4 w-12 surface-section rounded" />
              <div className="h-3 w-16 surface-section rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
