// ============================================================================
// SIMILAR TOURS - RECOMMENDATION ENGINE
// ============================================================================
// LOCATION: /frontend/src/components/tour-detail/SimilarTours.tsx
// 
// PURPOSE: Recommend other tours based on location and theme
// 
// FEATURES:
// 1. Horizontal scroll on mobile, grid on desktop
// 2. Compact tour cards
// 3. Dynamic fetching based on city (Phase 2)
// 4. Halal indicator and price primary view
// ============================================================================

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
 ChevronRight,
 Loader2
} from 'lucide-react'
import type { SimilarToursProps } from '@/src/types/tour-detail.types'
import { getPublicTours } from '@/src/lib/api/tours'
import type { PublicTourCardResponse } from '@/src/lib/types/tour.types'

import PublicTourCard from '@/src/components/tours/PublicTourCard'

export default function SimilarTours({
 currentTourId,
 city,
 country,
 category,
 limit = 4
}: SimilarToursProps) {
 const [tours, setTours] = useState<PublicTourCardResponse[]>([])
 const [isLoading, setIsLoading] = useState(true)

 useEffect(() => {
 const fetchSimilarTours = async () => {
 setIsLoading(true)
 try {
 console.log(`[SimilarTours DEBUG] Primary search for city:"${city}", category:"${category}"`)
 // 1. Primary search: same city/locationName + category
 let response = await getPublicTours({ 
 cities: city ? [city] : undefined,
 category: category || undefined
 })
 
 let filtered = (Array.isArray(response) ? response : [])
 .filter(t => t.id.toString() !== currentTourId)

 // 2. Fallback: if no tours in same city/category, fetch same city (any category)
 if (filtered.length < limit) {
 console.log('[SimilarTours DEBUG] Fewer city/category matches found. Falling back to city-only search.')
 const cityOnlyResponse = await getPublicTours({ cities: city ? [city] : undefined })
 const cityOnlyTours = (Array.isArray(cityOnlyResponse) ? cityOnlyResponse : [])
 .filter(t => t.id.toString() !== currentTourId && !filtered.some(f => f.id === t.id))
 filtered = [...filtered, ...cityOnlyTours]
 }
 
 // 3. Last fallback: if still nothing, try searching by category globally
 if (filtered.length < limit) {
 console.log('[SimilarTours DEBUG] Falling back to global category-wide search.')
 const globalCatResponse = await getPublicTours({ category: category || undefined }) 
 const globalCatTours = (Array.isArray(globalCatResponse) ? globalCatResponse : [])
 .filter(t => t.id.toString() !== currentTourId && !filtered.some(f => f.id === t.id))
 filtered = [...filtered, ...globalCatTours]
 }
 
 const finalTours = filtered.slice(0, limit)
 console.log(`[SimilarTours DEBUG] Found ${finalTours.length} tours to display.`)
 setTours(finalTours)
 } catch (error: any) {
 // If 401, ignore and just show nothing (don't break the page)
 if (error?.response?.status !== 401) {
 console.error('[SimilarTours Fetch Error]:', error)
 }
 } finally {
 setIsLoading(false)
 }
 }

 if (city || country) {
 fetchSimilarTours()
 }
 }, [city, country, currentTourId, limit])

 if (isLoading) {
 return (
 <div className="pt-16 border-t border-theme flex flex-col items-center justify-center py-20 text-theme-muted">
 <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-light dark:text-primary-dark" />
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-muted">Finding similar experiences...</p>
 </div>
 )
 }

 if (!isLoading && tours.length === 0) {
 return null
 }

 return (
 <section className="pt-16 border-t border-theme ">
 <div className="space-y-10">
 <div className="flex items-end justify-between">
 <div className="space-y-1">
 <h2 className="text-3xl font-black text-primary-light dark:text-primary-dark tracking-tight">
 Similar experiences in {city}
 </h2>
 <p className="text-sm font-bold text-theme-muted ">
 Hand-picked halal friendly tours for you
 </p>
 </div>
 <Link 
 href="/tours" 
 className="flex items-center gap-2 text-[10px] font-black text-primary-light dark:text-primary-dark dark:text-primary-dark uppercase tracking-widest hover:gap-3 transition-all group pb-1"
 >
 View all
 <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
 </Link>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 {tours.map((tour, index) => (
 <PublicTourCard key={tour.id} tour={tour} showHint={index === 0} />
 ))}
 </div>

 {/* Mobile View All */}
 <Link
 href="/tours"
 className="sm:hidden w-full flex items-center justify-center gap-2 py-4 surface-card rounded-xl text-[10px] font-black text-theme-primary uppercase tracking-widest border border-theme"
 >
 View all experiences
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 </section>
 )
}
