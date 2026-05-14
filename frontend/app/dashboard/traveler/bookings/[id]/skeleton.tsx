import React from 'react'
import { ChevronLeft } from 'lucide-react'

export default function TravelerBookingDetailSkeleton() {
  return (
    <div className="min-h-screen surface-base p-4 sm:p-8 pt-20 sm:pt-24 animate-pulse">
      <div className="max-w-5xl mx-auto">
        {/* Back Button Skeleton */}
        <div className="flex items-center gap-1.5 mb-8">
          <ChevronLeft className="w-4 h-4 text-theme-muted opacity-50" />
          <div className="h-4 w-32 surface-section rounded" />
        </div>

        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="h-10 w-64 surface-section rounded-xl" />
            <div className="h-4 w-48 surface-section rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 surface-section rounded-full" />
            <div className="h-8 w-8 surface-section rounded-lg" />
          </div>
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <div className="surface-card rounded-3xl p-8 border border-theme shadow-xl h-48" />
            <div className="surface-card rounded-3xl p-8 border border-theme shadow-xl h-48" />
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-8">
            <div className="surface-card rounded-3xl p-6 border border-theme shadow-xl h-64 flex flex-col items-center justify-center space-y-4">
               <div className="h-4 w-20 surface-section rounded" />
               <div className="h-40 w-40 surface-section rounded-3xl" />
               <div className="h-4 w-32 surface-section rounded" />
            </div>
            <div className="surface-card rounded-3xl p-6 border border-theme shadow-xl h-64 space-y-4">
               <div className="h-6 w-32 surface-section rounded mx-auto" />
               <div className="space-y-2">
                 <div className="flex justify-between"><div className="h-4 w-20 surface-section rounded" /><div className="h-4 w-12 surface-section rounded" /></div>
                 <div className="h-px w-full surface-section" />
                 <div className="flex justify-between pt-2"><div className="h-4 w-20 surface-section rounded" /><div className="h-8 w-32 surface-section rounded" /></div>
               </div>
               <div className="h-14 w-full surface-section rounded-2xl" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
