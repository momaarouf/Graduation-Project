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
    limit = 4
}: SimilarToursProps) {
    const [tours, setTours] = useState<PublicTourCardResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSimilarTours = async () => {
            setIsLoading(true)
            try {
                console.log(`[SimilarTours DEBUG] Primary search for city: "${city}"`)
                // 1. Primary search: same city/locationName
                let response = await getPublicTours({ 
                    cities: city ? [city] : undefined
                })
                
                let filtered = (response.data || [])
                    .filter(t => t.id.toString() !== currentTourId)

                // 2. Fallback: if no tours in same city, fetch any published tours
                if (filtered.length === 0) {
                    console.log('[SimilarTours DEBUG] No city matches found. Falling back to global search.')
                    response = await getPublicTours({})
                    filtered = (response.data || [])
                        .filter(t => t.id.toString() !== currentTourId)
                }
                
                // 3. Last fallback: if still nothing, try searching by country/region if available
                if (filtered.length === 0 && country) {
                     console.log('[SimilarTours DEBUG] Falling back to country-wide search.')
                     response = await getPublicTours({ regions: [country] }) 
                     filtered = (response.data || [])
                        .filter(t => t.id.toString() !== currentTourId)
                }
                
                const finalTours = filtered.slice(0, limit)
                console.log(`[SimilarTours DEBUG] Found ${finalTours.length} tours to display.`)
                setTours(finalTours)
            } catch (error) {
                console.error('[SimilarTours Fetch Error]:', error)
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
            <div className="pt-16 border-t border-gray-100 dark:border-gray-900 flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Finding similar experiences...</p>
            </div>
        )
    }

    if (!isLoading && tours.length === 0) {
        return null
    }

    return (
        <section className="pt-16 border-t border-gray-100 dark:border-gray-900">
            <div className="space-y-10">
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Similar experiences in {city}
                        </h2>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            Hand-picked halal friendly tours for you
                        </p>
                    </div>
                    <Link 
                        href="/tours" 
                        className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:gap-3 transition-all group pb-1"
                    >
                        View all
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {tours.map((tour) => (
                        <PublicTourCard key={tour.id} tour={tour} />
                    ))}
                </div>

                {/* Mobile View All */}
                <Link
                    href="/tours"
                    className="sm:hidden w-full flex items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest border border-gray-100 dark:border-gray-700"
                >
                    View all experiences
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </section>
    )
}
