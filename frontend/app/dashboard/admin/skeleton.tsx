import React from 'react'

export default function AdminDashboardSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar surface-base animate-pulse">
      <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Header Skeleton */}
        <div className="space-y-4">
           <div className="h-6 w-32 surface-section rounded-lg" />
           <div className="h-10 w-64 surface-section rounded-xl" />
           <div className="h-4 w-48 surface-section rounded" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-32 surface-card border border-theme rounded-2xl p-6" />
           ))}
        </div>

        {/* Action Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-20 surface-card border border-theme rounded-2xl" />
           ))}
        </div>

        {/* Recent Activity Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="surface-card border border-theme rounded-3xl p-8 h-96" />
           <div className="surface-card border border-theme rounded-3xl p-8 h-96" />
        </div>

      </div>
    </div>
  )
}
