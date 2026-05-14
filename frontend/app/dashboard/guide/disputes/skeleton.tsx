import React from 'react'

export default function GuideDisputesSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar surface-base animate-pulse">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 lg:p-12 space-y-12">
        
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl surface-section border border-theme" />
          <div className="space-y-3">
             <div className="h-10 w-64 surface-section rounded-xl" />
             <div className="h-4 w-full max-w-md surface-section rounded" />
          </div>
        </div>

        {/* Dispute List Skeleton */}
        <div className="space-y-6">
           {[1, 2, 3].map(i => (
             <div key={i} className="surface-card rounded-3xl p-8 border border-theme space-y-6">
                <div className="flex gap-4">
                   <div className="h-4 w-20 surface-section rounded" />
                   <div className="h-6 w-32 surface-section rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <div className="h-3 w-16 surface-section rounded" />
                      <div className="h-5 w-32 surface-section rounded" />
                   </div>
                   <div className="space-y-2">
                      <div className="h-3 w-20 surface-section rounded" />
                      <div className="h-5 w-24 surface-section rounded" />
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="h-3 w-32 surface-section rounded" />
                   <div className="h-24 w-full surface-section rounded-2xl" />
                </div>

                <div className="h-12 w-48 surface-section rounded-xl" />
             </div>
           ))}
        </div>

      </div>
    </div>
  )
}
