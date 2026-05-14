import React from 'react'

export default function TravelerDisputesSkeleton() {
  return (
    <div className="surface-base p-4 sm:p-8 min-h-[80vh] animate-pulse">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Skeleton */}
        <div className="border-b border-theme pb-8 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl surface-section" />
            <div className="h-10 w-64 surface-section rounded-xl" />
          </div>
          <div className="h-4 w-full max-w-lg surface-section rounded-lg" />
        </div>

        {/* Disputes List Skeleton */}
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="surface-card rounded-3xl p-8 border border-theme space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex gap-3">
                    <div className="h-4 w-20 surface-section rounded" />
                    <div className="h-6 w-24 surface-section rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="h-3 w-20 surface-section rounded" />
                      <div className="h-5 w-16 surface-section rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-20 surface-section rounded" />
                      <div className="h-5 w-32 surface-section rounded" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-24 surface-section rounded-2xl border border-theme" />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
