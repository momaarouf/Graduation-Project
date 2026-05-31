import React from 'react'

export default function TravelerMessagesSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full surface-base overflow-hidden animate-pulse">
      
      {/* Search Header Skeleton */}
      <div className="p-4 border-b border-[#c8d8f8] dark:border-[#1a3566] space-y-4">
        <div className="h-10 w-full surface-section rounded-xl" />
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar Skeleton */}
        <div className="w-80 border-r border-[#c8d8f8] dark:border-[#1a3566] hidden sm:flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="p-4 border-b border-[#c8d8f8] dark:border-[#1a3566] flex items-center gap-3">
                <div className="w-12 h-12 surface-section rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 surface-section rounded" />
                  <div className="h-3 w-40 surface-section rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area Skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar Skeleton */}
          <div className="h-16 px-6 border-b border-[#c8d8f8] dark:border-[#1a3566] flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 surface-section rounded-full" />
              <div className="space-y-1">
                <div className="h-4 w-32 surface-section rounded" />
                <div className="h-3 w-16 surface-section rounded" />
              </div>
            </div>
          </div>

          {/* Messages Skeleton */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="h-32 w-full surface-section rounded-2xl mb-8" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                <div className={`h-16 w-2/3 surface-section rounded-2xl ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
              </div>
            ))}
          </div>

          {/* Input Area Skeleton */}
          <div className="p-4 border-t border-[#c8d8f8] dark:border-[#1a3566]">
            <div className="h-12 w-full surface-section rounded-xl" />
          </div>
        </div>
      </div>

    </div>
  )
}
