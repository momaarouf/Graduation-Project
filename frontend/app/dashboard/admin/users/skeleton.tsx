import React from 'react'

export default function AdminUsersSkeleton() {
  return (
    <div className="space-y-6 pb-20 animate-pulse">
      
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-4 surface-card border border-theme rounded-2xl space-y-3">
            <div className="w-8 h-8 surface-section rounded-xl" />
            <div className="h-7 w-12 surface-section rounded-lg" />
            <div className="h-3 w-20 surface-section rounded" />
          </div>
        ))}
      </div>

      {/* Header & Search Skeleton */}
      <div className="surface-card p-5 rounded-2xl border border-theme shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-7 w-48 surface-section rounded-lg" />
          <div className="h-9 w-9 surface-section rounded-lg" />
        </div>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="h-12 flex-1 surface-section rounded-xl" />
          <div className="flex gap-2">
            <div className="h-12 w-32 surface-section rounded-xl" />
            <div className="h-12 w-32 surface-section rounded-xl" />
            <div className="h-12 w-12 surface-section rounded-xl" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="surface-card rounded-xl border border-theme overflow-hidden">
        <div className="h-12 surface-section border-b border-[#c8d8f8] dark:border-[#1a3566]" />
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="p-4 border-b border-[#c8d8f8] dark:border-[#1a3566] last:border-0 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full surface-section" />
              <div className="space-y-2">
                <div className="h-4 w-32 surface-section rounded" />
                <div className="h-3 w-48 surface-section rounded" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-6 w-20 surface-section rounded-full" />
              <div className="h-6 w-20 surface-section rounded-full" />
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
