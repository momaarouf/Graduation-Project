import React from 'react'

export default function GuideVerificationSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar surface-base animate-pulse">
      <div className="max-w-5xl mx-auto py-10 sm:py-20 px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Breadcrumb Skeleton */}
        <div className="h-10 w-48 surface-section rounded-xl" />

        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="h-16 w-3/4 surface-section rounded-2xl" />
          <div className="h-6 w-1/2 surface-section rounded-lg" />
        </div>

        {/* Status Card Skeleton */}
        <div className="p-6 sm:p-10 rounded-3xl border border-theme surface-card h-64" />

        {/* Info Grid Skeleton */}
        <div className="p-8 sm:p-12 surface-section border border-theme rounded-[2.5rem] space-y-10">
           <div className="h-6 w-40 surface-section rounded" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                   <div className="w-12 h-12 surface-section rounded-2xl" />
                   <div className="space-y-2">
                      <div className="h-4 w-32 surface-section rounded" />
                      <div className="h-3 w-full surface-section rounded" />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Action Button Skeleton */}
        <div className="h-16 w-full sm:w-64 surface-section rounded-2xl" />

      </div>
    </div>
  )
}
