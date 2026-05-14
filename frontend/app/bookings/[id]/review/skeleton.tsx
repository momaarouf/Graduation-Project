import React from 'react'
import { ChevronLeft } from 'lucide-react'

export default function ReviewSkeleton() {
  return (
    <div className="relative min-h-screen pt-24 pb-32 overflow-hidden surface-section animate-pulse">
      <div className="container-safe mx-auto px-4 relative z-10 max-w-5xl">
        
        {/* Back Link Skeleton */}
        <div className="flex items-center gap-2 mb-10">
          <ChevronLeft className="w-4 h-4 text-theme-muted opacity-50" />
          <div className="h-4 w-32 surface-section rounded" />
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column Skeleton */}
          <div className="lg:w-1/3 space-y-8">
            <div className="aspect-square rounded-[3rem] surface-section border border-theme shadow-xl" />
            <div className="h-24 w-full surface-section rounded-3xl" />
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:w-2/3 space-y-12">
            <div className="space-y-4">
               <div className="h-4 w-32 surface-section rounded-full" />
               <div className="h-16 w-full surface-section rounded-xl" />
               <div className="h-4 w-64 surface-section rounded" />
            </div>

            <div className="space-y-6">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="h-24 w-full surface-section rounded-[2.5rem]" />
               ))}
            </div>

            <div className="space-y-4">
               <div className="h-4 w-40 surface-section rounded ml-2" />
               <div className="h-40 w-full surface-section rounded-[2.5rem]" />
            </div>

            <div className="h-16 w-full surface-section rounded-[2.5rem]" />
          </div>

        </div>
      </div>
    </div>
  )
}
