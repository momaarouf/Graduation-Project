import React from 'react'

export default function AdminVerificationsSkeleton() {
  return (
    <div className="space-y-8 pb-20 animate-pulse">
      {/* Header Section Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 surface-section rounded-2xl shadow-xl shadow-primary-light/10" />
            <div className="h-6 w-48 surface-section rounded-xl" />
          </div>
          <div className="h-10 w-64 sm:w-96 surface-section rounded-xl" />
          <div className="h-4 w-full max-w-lg surface-section rounded-lg" />
        </div>
        
        <div className="h-14 w-64 surface-card rounded-[1.5rem] border border-theme shadow-sm" />
      </div>

      {/* Main Content Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
        
        {/* Left Column Skeleton */}
        <div className="lg:col-span-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-[2rem] border border-theme surface-card space-y-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl surface-section border border-theme" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 surface-section rounded" />
                  <div className="h-3 w-48 surface-section rounded" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-theme/50">
                <div className="h-3 w-24 surface-section rounded" />
                <div className="h-6 w-20 surface-section rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-8 surface-card rounded-[3rem] border border-theme shadow-2xl h-[calc(100vh-200px)] min-h-[600px] flex flex-col">
          <div className="flex-1 surface-section/50 relative overflow-hidden flex items-center justify-center">
            <div className="w-24 h-24 surface-section rounded-[2rem]" />
          </div>
          <div className="p-8 surface-paper border-t border-theme space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 w-48 surface-section rounded-lg" />
                <div className="h-4 w-64 surface-section rounded" />
              </div>
              <div className="flex gap-3">
                <div className="h-14 w-32 surface-section rounded-2xl" />
                <div className="h-14 w-40 surface-section rounded-2xl" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
