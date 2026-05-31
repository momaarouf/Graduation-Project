import React from 'react'
import { MapPin, Star, Calendar, Heart, Shield, Sparkles, Zap, User } from 'lucide-react'

// ============================================================================
// TOUR CARD SKELETON
// ============================================================================

export function TourCardSkeleton() {
  return (
    <div className="relative aspect-[1/1.35] min-h-[430px] w-full overflow-hidden rounded-3xl surface-section animate-pulse border border-theme">
      {/* Top action button skeleton */}
      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border border-theme" />
      
      {/* Content skeleton */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 space-y-4">
        {/* Category badge */}
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
        
        {/* Title and location */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
        </div>

        {/* Stats and metadata */}
        <div className="flex items-center gap-4">
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>

        {/* Footer with price and button */}
        <div className="pt-4 border-t border-[#c8d8f8] dark:border-[#1a3566] flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-2 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// GUIDE HIGHLIGHT SKELETON
// ============================================================================

export function GuideHighlightSkeleton() {
  return (
    <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 surface-section rounded-[2.5rem] overflow-hidden animate-pulse border border-theme">
      {/* Avatar skeleton */}
      <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-200 dark:bg-slate-800 border-4 border-theme shadow-lg flex-shrink-0" />

      {/* Info skeleton */}
      <div className="flex-1 space-y-4 w-full">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>

        <div className="flex gap-6">
          <div className="h-12 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-12 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Button skeleton */}
      <div className="h-12 w-32 bg-slate-200 dark:bg-slate-800 rounded-2xl self-end" />
    </div>
  )
}

// ============================================================================
// FULL SEARCH GRID SKELETON
// ============================================================================

export function SearchResultsSkeleton({ isCollapsed = false }) {
  const gridClasses = `grid grid-cols-1 sm:grid-cols-2 ${isCollapsed ? 'lg:grid-cols-3 xl:grid-cols-4' : 'xl:grid-cols-3'} gap-8`

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>

      {/* Results Grid */}
      <div className={gridClasses}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <TourCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
