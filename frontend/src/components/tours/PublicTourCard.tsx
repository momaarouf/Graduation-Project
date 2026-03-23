'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    MapPin,
    Star,
    User,
    CheckCircle,
    Clock,
    Heart,
    Camera,
    MoonStar,
    TicketCheck,
    Baby,
    BadgePercent,
    Play
} from 'lucide-react'
import { PublicTourCardResponse } from '@/src/lib/types/tour.types'
import { getCountryFlag, isVideoUrl } from '@/src/lib/utils/tour-utils'
import { useWishlist } from '@/src/lib/contexts/WishlistContext'

export interface PublicTourCardProps {
    tour: PublicTourCardResponse
}

export default function PublicTourCard({ tour }: PublicTourCardProps) {
    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const { isFavorited, toggleFavorite } = useWishlist()
    const isLiked = isFavorited(tour.id)

    const formatPrice = (amount: number, currency: string) => {
        if (currency === 'USD') return `$${amount}`
        if (currency === 'TRY') return `₺${amount}`
        return `${amount} ${currency}`
    }

    const nextDateFormatted = tour.nextOccurrenceStartUtc 
        ? new Date(tour.nextOccurrenceStartUtc).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : null

    return (
        <Link
            href={`/tours/${tour.id}`}
            className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px]"
        >
            {/* Image section */}
            <div 
                className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {tour.coverImageUrl ? (
                    isVideoUrl(tour.coverImageUrl) ? (
                        <div className="relative w-full h-full">
                            <video
                                src={tour.coverImageUrl}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                muted
                                playsInline
                                loop
                                autoPlay={isHovered}
                            />
                            {!isHovered && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                                        <Play className="w-6 h-6 text-white fill-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Image
                            src={tour.coverImageUrl}
                            alt={tour.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className={`object-cover transition-all duration-700 group-hover:scale-110 ${isImageLoaded ? 'opacity-100' : 'opacity-0 scale-105'}`}
                            onLoad={() => setIsImageLoaded(true)}
                            unoptimized={tour.coverImageUrl.startsWith('data:')}
                        />
                    )
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-700">
                        <Camera className="w-12 h-12" />
                    </div>
                )}

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-[11px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                        <span>{getCountryFlag(tour.countryCode)}</span>
                        <span>{tour.locationName || tour.region}</span>
                    </span>
                </div>

                <button
                    onClick={(e) => {
                        e.preventDefault()
                        toggleFavorite(tour.id)
                    }}
                    className="absolute top-4 right-4 p-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full hover:bg-white transition-all shadow-xl hover:scale-110 active:scale-95"
                >
                    <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col">
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {tour.isPremium && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/50 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400" title="Premium Tour">
                            <Star className="w-3 h-3 fill-current" />
                            <span>Premium</span>
                        </div>
                    )}
                </div>

                <div className="flex items-start justify-between gap-4 mb-3">
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {tour.title}
                   </h3>
                </div>

                {/* Subtle Features Icons (Professional Approach) */}
                <div className="flex items-center gap-3 mb-3">
                    {tour.halalFriendly && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest" title="Halal / Muslim Friendly">
                            <MoonStar className="w-3.5 h-3.5" />
                        </div>
                    )}
                    {tour.instantBook && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest" title="Instant Confirmation">
                            <TicketCheck className="w-3.5 h-3.5" />
                        </div>
                    )}
                    {tour.isFamilyFriendly && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-pink-600 dark:text-pink-500 uppercase tracking-widest" title="Family Friendly">
                            <Baby className="w-3.5 h-3.5" />
                        </div>
                    )}
                    {tour.hasGroupDiscount && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-500 uppercase tracking-widest" title="Group Discounts Available">
                            <BadgePercent className="w-3.5 h-3.5" />
                        </div>
                    )}
                </div>

                {/* Meta details */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
                        {tour.guideAvatarUrl ? (
                            <Image 
                                src={tour.guideAvatarUrl} 
                                alt={tour.guideDisplayName} 
                                width={24} 
                                height={24} 
                                className="object-cover"
                            />
                        ) : (
                            <User className="w-3.5 h-3.5 text-gray-400" />
                        )}
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate">
                        {tour.guideDisplayName}
                    </span>
                    {tour.guideVerified && (
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                    )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-4">
                   <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                         <Star key={i} className={`w-4 h-4 ${i < (tour.averageRating || 5) ? 'fill-current' : 'text-gray-200 dark:text-gray-800'}`} />
                      ))}
                   </div>
                   <span className="text-sm font-black text-gray-900 dark:text-white">{tour.averageRating?.toFixed(1) || '5.0'}</span>
                   <span className="text-xs font-bold text-gray-500">({tour.reviewCount || 0})</span>
                </div>

                {/* Price & Date Bottom Bar */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-end justify-between">
                    <div className="flex flex-col">
                       <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1.5">From</span>
                       <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                           {formatPrice(tour.basePrice, tour.currency)}
                       </span>
                    </div>
                    
                    {nextDateFormatted && (
                       <div className="flex flex-col items-end">
                          <span className="text-[11px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                             <Clock className="w-3 h-3" />
                             Upcoming
                          </span>
                          <span className="text-sm font-black text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-800/30">
                             {nextDateFormatted}
                          </span>
                       </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
