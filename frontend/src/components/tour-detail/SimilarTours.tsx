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

import Image from 'next/image'
import Link from 'next/link'
import {
    Star,
    MapPin,
    Clock,
    CheckCircle,
    ChevronRight,
    Leaf
} from 'lucide-react'
import type { SimilarToursProps } from '@/src/types/tour-detail.types'
import { MOCK_SIMILAR_TOURS } from '@/src/types/tour-detail.types'
import { getCountryFlag } from '@/src/components/search/SearchResultsGrid'

export default function SimilarTours({
    city,
    country,
    limit = 4
}: SimilarToursProps) {

    // In Phase 2: await getSimilarTours({ city, country, limit })
    const tours = MOCK_SIMILAR_TOURS.slice(0, limit)

    return (
        <section className="pt-10 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Similar experiences in {city}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Hand-picked halal friendly tours around you
                        </p>
                    </div>
                    <Link
                        href="/tours"
                        className="hidden sm:flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all"
                    >
                        Explore all
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-4 
          gap-6
        ">
                    {tours.map((tour) => (
                        <Link
                            key={tour.id}
                            href={`/tours/${tour.id}`}
                            className="group space-y-3"
                        >
                            {/* Card Image */}
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <Image
                                    src={tour.mainImage}
                                    alt={tour.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Badge Overlay */}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    {tour.halalCertified && (
                                        <div className="
                      w-8 h-8
                      bg-white/90 dark:bg-gray-900/90
                      backdrop-blur-sm
                      rounded-full
                      flex items-center justify-center
                      text-emerald-600 dark:text-emerald-400
                      shadow-sm
                    ">
                                            <Leaf className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                {/* Price Overlay */}
                                <div className="
                  absolute bottom-3 right-3
                  px-2.5 py-1.5
                  bg-black/70 backdrop-blur-sm
                  rounded-lg
                  text-white text-xs font-bold
                ">
                                    From ${tour.price}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <span>{getCountryFlag(tour.country as any)}</span>
                                        <span>{tour.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{tour.duration}</span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {tour.title}
                                </h3>

                                <div className="flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">{tour.rating}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">({tour.reviewCount})</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile View All */}
                <Link
                    href="/tours"
                    className="sm:hidden w-full flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-bold text-gray-900 dark:text-white"
                >
                    View all experiences
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </section>
    )
}
