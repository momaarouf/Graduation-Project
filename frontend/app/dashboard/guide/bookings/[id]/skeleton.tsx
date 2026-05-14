import React from 'react'

export default function GuideBookingDetailSkeleton() {
  return (
    <div className="min-h-screen surface-base animate-pulse">
      <div className="max-w-5xl mx-auto px-4 py-6 pt-16 sm:pt-24 space-y-8">
        
        {/* Back Link Skeleton */}
        <div className="h-4 w-32 surface-section rounded" />

        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div className="h-10 w-64 surface-section rounded-xl" />
            <div className="flex gap-3">
              <div className="h-6 w-24 surface-section rounded-full" />
              <div className="h-6 w-20 surface-section rounded-lg" />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="h-12 flex-1 md:w-24 surface-section rounded-xl" />
            <div className="h-12 flex-1 md:w-32 surface-section rounded-xl" />
          </div>
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
          
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-10">
            {/* Tour Info Card Placeholder */}
            <div className="surface-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-theme h-64" />
            
            {/* Traveler Info Card Placeholder */}
            <div className="surface-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-theme space-y-6">
               <div className="h-4 w-40 surface-section rounded" />
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 surface-section rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-5 w-48 surface-section rounded" />
                    <div className="h-3 w-32 surface-section rounded" />
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="h-16 surface-section rounded-2xl" />
                  <div className="h-16 surface-section rounded-2xl" />
               </div>
               <div className="h-12 w-full surface-section rounded-xl" />
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="space-y-6 sm:space-y-8">
            <div className="surface-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-theme h-64" />
            <div className="h-24 surface-section rounded-2xl border border-theme" />
          </div>

        </div>

      </div>
    </div>
  )
}
