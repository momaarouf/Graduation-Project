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
 <div key={i} className="h-80 surface-section animate-pulse rounded-xl" />
 ))}
 </div>
 )
 }

 if (tours.length === 0) {
 return (
 <div className="text-center py-12 surface-section rounded-xl border-2 border-dashed border-theme">
 <p className="text-theme-muted ">No tours available in the portfolio yet.</p>
 </div>
 )
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 {tours.map((tour) => (
 <Link
 key={tour.id}
 href={`/guides/${guideId}/tours/${tour.id}`}
 className="group relative flex flex-col surface-card rounded-[2rem] overflow-hidden border border-theme hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px]"
 >
 <div 
 className="relative aspect-[16/10] overflow-hidden surface-section"
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
 <div className="p-3 surface-card  rounded-full">
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
 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50  rounded-full text-[10px] font-bold text-white capitalize tracking-normal border border-theme-strong shadow-lg">
 <Leaf className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
 Halal
 </div>
 )}
 </div>
 
 <div className="absolute top-4 right-4">
 <div className={`px-3 py-1.5  border border-theme-strong rounded-full text-[10px] font-bold capitalize tracking-normal shadow-lg ${tour.currentlyAvailable ? 'bg-primary-light/80 text-white' : 'surface-section text-gray-200'}`}>
 {tour.currentlyAvailable ? 'Active' : 'Offline'}
 </div>
 </div>
 </div>

 <div className="p-8 flex flex-col flex-1">
 <h3 className="text-xl font-bold text-theme-primary mb-3 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors capitalize">
 {tour.title}
 </h3>
 
 <div className="flex items-center gap-2 text-xs font-bold text-theme-muted capitalize tracking-normal mb-6">
 <MapPin className="w-3.5 h-3.5 text-orange-600" />
 <span>{tour.region || tour.locationName}</span>
 </div>

 <div className="mt-auto pt-6 border-t border-[#c8d8f8] dark:border-[#1a3566] dark:border-theme flex items-end justify-between">
 <div className="flex flex-col">
 <span className="text-[10px] font-bold text-theme-muted capitalize tracking-[0.2em] mb-1">Impact</span>
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-primary-light dark:text-primary-dark" />
 <span className="text-sm font-bold text-theme-primary">{tour.totalTravelersCount}</span>
 <span className="text-[10px] font-bold text-theme-muted capitalize">served</span>
 </div>
 </div>
 
 <div className="text-right">
 <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 capitalize tracking-[0.2em] block mb-1">From</span>
 <div className="text-2xl font-bold text-theme-primary leading-none">
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
