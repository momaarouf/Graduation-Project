import React from 'react'

export default function GuideMessagesSkeleton() {
  return (
    <div className="flex-1 h-full surface-base overflow-hidden relative animate-pulse">
      <div className="h-full flex flex-col overflow-hidden">
        
        {/* Top Header Bar Skeleton */}
        <div className="flex-none surface-base border-b border-[#c8d8f8] dark:border-[#1a3566] px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 surface-section rounded-md" />
              <div className="h-6 w-24 surface-section rounded-lg" />
              <div className="h-5 w-8 surface-section rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 surface-section rounded-lg" />
              <div className="w-8 h-8 surface-section rounded-lg" />
            </div>
          </div>
          
          {/* Search bar skeleton */}
          <div className="relative mt-2 px-4 sm:px-6 pb-2 border-b border-[#c8d8f8] dark:border-[#1a3566]">
            <div className="h-9 surface-section rounded-xl w-full" />
          </div>
        </div>

        {/* Content Area Split Skeleton */}
        <div className="flex-1 flex min-h-0 overflow-hidden surface-base">
          {/* Left Sidebar Skeleton */}
          <div className="w-full sm:w-80 border-r border-[#c8d8f8] dark:border-[#1a3566] flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 space-y-1 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-3 border-b border-[#c8d8f8] dark:border-[#1a3566] flex items-center gap-3">
                  <div className="w-10 h-10 surface-section rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 surface-section rounded" />
                    <div className="h-3 w-40 surface-section rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Shell Skeleton */}
          <div className="hidden sm:flex flex-1 items-center justify-center surface-card">
            <div className="space-y-4 w-64 flex flex-col items-center">
              <div className="w-16 h-16 surface-section rounded-full" />
              <div className="h-5 w-48 surface-section rounded" />
              <div className="h-3 w-36 surface-section rounded" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
