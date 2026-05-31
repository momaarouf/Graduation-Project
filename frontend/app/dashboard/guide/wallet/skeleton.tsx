import React from 'react'

export default function GuideWalletSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar">
      <div className="max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 space-y-8 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-9 w-48 surface-section rounded-xl" />
            <div className="h-4 w-64 surface-section rounded-lg" />
          </div>
          <div className="h-10 w-24 surface-section rounded-xl flex-shrink-0" />
        </div>

        {/* Top Row: Balance Cards Skeleton (3 items matching live page) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-card border-2 border-theme rounded-[2.5rem] p-8 space-y-4">
              <div className="w-12 h-12 surface-section rounded-2xl" />
              <div className="space-y-2">
                <div className="h-8 w-32 surface-section rounded-lg" />
                <div className="h-3 w-20 surface-section rounded" />
              </div>
              <div className="h-3 w-40 surface-section rounded" />
            </div>
          ))}
        </div>

        {/* Lower Grid Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column Skeleton */}
          <div className="space-y-6">
            <div className="surface-card border border-theme rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 surface-section rounded-2xl flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-32 surface-section rounded" />
                  <div className="h-3 w-20 surface-section rounded" />
                </div>
              </div>
              <div className="h-24 surface-section rounded-2xl" />
            </div>
            <div className="surface-card border border-theme rounded-[2.5rem] p-8 space-y-4">
              <div className="w-8 h-8 surface-section rounded-xl" />
              <div className="h-5 w-24 surface-section rounded" />
              <div className="h-16 surface-section rounded-xl" />
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-card border border-theme rounded-none sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-[#c8d8f8] dark:border-[#1a3566] pb-6">
                <div className="w-10 h-10 surface-section rounded-xl flex-shrink-0" />
                <div className="h-6 w-40 surface-section rounded" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-[#c8d8f8] dark:border-[#1a3566] last:border-0">
                    <div className="space-y-2">
                      <div className="h-4 w-32 surface-section rounded" />
                      <div className="h-3 w-20 surface-section rounded" />
                    </div>
                    <div className="h-5 w-16 surface-section rounded" />
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
