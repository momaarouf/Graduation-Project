'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Clock, MapPin, Users, Leaf, CheckCircle, ChevronRight, Play } from 'lucide-react'
import { getGuidePortfolio } from '@/src/lib/api/tours'
import { GuidePortfolioTourResponse } from '@/src/lib/types/tour.types'
import { isVideoUrl } from '@/src/lib/utils/tour-utils'

export default function GuideToursGrid({ guideId }: { guideId: string }) {
  const [tours, setTours] = useState<GuidePortfolioTourResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredTourId, setHoveredTourId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchTours() {
      try {
        const response = await getGuidePortfolio(parseInt(guideId))
        setTours(response)
      } catch (error) {
        console.error('Failed to fetch guide tours:', error)
      } finally {
        setLoading(false)
      }
    }
    if (guideId) fetchTours()
  }, [guideId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (tours.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No tours available in the portfolio yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {tours.map((tour) => (
        <Link
          key={tour.id}
          href={`/guides/${guideId}/tours/${tour.id}`}
          className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px]"
        >
          <div 
            className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800"
            onMouseEnter={() => setHoveredTourId(tour.id)}
            onMouseLeave={() => setHoveredTourId(null)}
          >
            {isVideoUrl(tour.coverImageUrl) ? (
              <div className="relative w-full h-full">
                <video
                  src={tour.coverImageUrl!}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  muted
                  playsInline
                  loop
                  autoPlay={hoveredTourId === tour.id}
                />
                {hoveredTourId !== tour.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Image
                src={tour.coverImageUrl || '/images/placeholder-tour.jpg'}
                alt={tour.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
            
            {/* High-End Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {tour.halalFriendly && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                  <Leaf className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                  Halal
                </div>
              )}
            </div>
            
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1.5 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${tour.currentlyAvailable ? 'bg-blue-600/80 text-white' : 'bg-gray-600/80 text-gray-200'}`}>
                {tour.currentlyAvailable ? 'Active' : 'Offline'}
              </div>
            </div>
          </div>

          <div className="p-8 flex flex-col flex-1">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
              {tour.title}
            </h3>
            
            <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>{tour.region || tour.locationName}</span>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100/50 dark:border-white/5 flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Impact</span>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-black text-gray-900 dark:text-white">{tour.totalTravelersCount}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">served</span>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.2em] block mb-1">From</span>
                <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                  {tour.currency} {tour.basePrice}
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
