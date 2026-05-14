import React from 'react'
import { ChevronLeft } from 'lucide-react'

export default function TravelerTicketSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-20 surface-base animate-pulse">
      <div className="container-safe mx-auto max-w-2xl px-4">
        
        {/* Back Button Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-theme-muted opacity-50" />
            <div className="h-4 w-32 surface-section rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-10 surface-section rounded-xl" />
            <div className="h-10 w-10 surface-section rounded-xl" />
          </div>
        </div>

        {/* Ticket Container Skeleton */}
        <div className="surface-card rounded-[2.5rem] shadow-2xl overflow-hidden border border-theme h-[800px] flex flex-col">
          {/* Ticket Header Skeleton */}
          <div className="h-48 surface-section w-full flex flex-col items-center justify-center space-y-4">
            <div className="h-6 w-40 surface-card/20 rounded-full" />
            <div className="h-10 w-64 surface-card/20 rounded-xl" />
            <div className="h-4 w-48 surface-card/20 rounded" />
          </div>

          {/* Ticket Body Skeleton */}
          <div className="p-8 space-y-10 flex-1">
             <div className="flex flex-col items-center space-y-4">
               <div className="h-48 w-48 surface-section rounded-[2rem]" />
               <div className="h-4 w-32 surface-section rounded" />
               <div className="h-8 w-48 surface-section rounded" />
             </div>

             <div className="grid grid-cols-2 gap-8">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="space-y-2">
                   <div className="h-3 w-20 surface-section rounded" />
                   <div className="h-5 w-32 surface-section rounded" />
                 </div>
               ))}
             </div>

             <div className="h-32 w-full surface-section rounded-3xl" />
          </div>
        </div>

      </div>
    </div>
  )
}
