// ============================================================================
// SIMILAR TOURS - RECOMMENDATION ENGINE (SERVER COMPONENT)
// ============================================================================
// LOCATION: /frontend/src/components/tour-detail/SimilarTours.tsx
// 
// PURPOSE: Recommend other tours based on location and theme
// 
// FEATURES:
// 1. Server-side fetching for zero-latency client hydration
// 2. Fallback logic for location and category matching
// 3. Compact tour cards with halal and price indicators
// ============================================================================

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { SimilarToursProps } from '@/src/types/tour-detail.types'
import { getPublicTours } from '@/src/lib/api/tours'
import type { PublicTourCardResponse } from '@/src/lib/types/tour.types'
import PublicTourCard from '@/src/components/tours/PublicTourCard'
import SimilarToursCarousel from './SimilarToursCarousel'

export default async function SimilarTours({
  currentTourId,
  city,
  country,
  category,
  limit = 4
}: SimilarToursProps) {
  let tours: PublicTourCardResponse[] = []

  try {
    // 1. Primary search: same city/locationName + category
    let response = await getPublicTours({ 
      cities: city ? [city] : undefined,
      category: category || undefined,
      limit: limit + 5 // Fetch more to allow filtering out current
    })
    
    let filtered = (Array.isArray(response) ? response : [])
      .filter(t => t.id.toString() !== currentTourId)

    // 2. Fallback: if no tours in same city/category, fetch same city (any category)
    if (filtered.length < limit) {
      const cityOnlyResponse = await getPublicTours({ 
        cities: city ? [city] : undefined,
        limit: limit + 5
      })
      const cityOnlyTours = (Array.isArray(cityOnlyResponse) ? cityOnlyResponse : [])
        .filter(t => t.id.toString() !== currentTourId && !filtered.some(f => f.id === t.id))
      filtered = [...filtered, ...cityOnlyTours]
    }
    
    // 3. Last fallback: if still nothing, try searching by category globally
    if (filtered.length < limit) {
      const globalCatResponse = await getPublicTours({ 
        category: category || undefined,
        limit: limit + 5
      }) 
      const globalCatTours = (Array.isArray(globalCatResponse) ? globalCatResponse : [])
        .filter(t => t.id.toString() !== currentTourId && !filtered.some(f => f.id === t.id))
      filtered = [...filtered, ...globalCatTours]
    }
    
    tours = filtered.slice(0, limit)
  } catch (error: any) {
    console.error('[SimilarTours Server Error]:', error)
  }

  if (tours.length === 0) {
    return null
  }

  return (
    <section className="space-y-10">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-theme-primary tracking-tight">
            Similar experiences {city ? `in ${city}` : ''}
          </h2>
          <p className="text-sm font-bold text-theme-muted">
            Hand-picked halal friendly tours for you
          </p>
        </div>
        <Link 
          href="/tours" 
          className="flex items-center gap-2 text-[10px] font-bold text-primary-light dark:text-primary-dark uppercase tracking-widest hover:gap-3 transition-all group pb-1"
        >
          View all
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Cards Carousel - High performance drag on mobile, Grid on desktop */}
      <SimilarToursCarousel tours={tours} />

      {/* Mobile View All Link */}
      <div className="sm:hidden mt-2">
        <Link
          href="/tours"
          className="w-full flex items-center justify-center gap-2 py-4 surface-card rounded-xl text-[10px] font-bold text-theme-primary uppercase tracking-widest border border-theme shadow-sm active:scale-[0.98] transition-all"
        >
          View all experiences
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
