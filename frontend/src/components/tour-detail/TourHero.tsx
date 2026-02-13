// ============================================================================
// TOUR HERO - GALLERY & QUICK INFO
// ============================================================================
// LOCATION: /frontend/src/components/tour-detail/TourHero.tsx
// 
// PURPOSE: Hero section with image gallery, title, and key metrics
// 
// FEATURES:
// 1. Main image with thumbnail gallery
// 2. Lightbox for full-screen viewing (Phase 2)
// 3. Video play button for tour previews
// 4. Save/wishlist button
// 5. Share button
// 6. Halal certification badge
// 7. Booking mode indicator (Instant/Request)
// 8. Rating summary
// ============================================================================

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    Star,
    Heart,
    Share2,
    Leaf,
    Zap,
    Clock,
    MapPin,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Play,
    X
} from 'lucide-react'
import type { TourHeroProps, TourMedia } from '@/src/types/tour-detail.types'
import { getCountryFlag } from '@/src/components/search/SearchResultsGrid'

export default function TourHero({
    title,
    location,
    country,
    mainImage,
    gallery,
    averageRating,
    totalReviews,
    isHalalCertified,
    bookingMode,
    status
}: TourHeroProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [isShareOpen, setIsShareOpen] = useState(false)

    const allImages = [mainImage, ...gallery.filter((m: TourMedia) => m.type === 'image').map((m: TourMedia) => m.url)]
    const videos = gallery.filter((m: TourMedia) => m.type === 'video')

    const handlePrevImage = () => {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))
    }

    const handleNextImage = () => {
        setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))
    }

    const formatRating = (rating: number) => {
        return rating.toFixed(1)
    }

    return (
        <div className="space-y-4">
            {/* ========================================
          MAIN IMAGE GALLERY
          ======================================== */}
            <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                {/* Main image */}
                <div
                    className="relative aspect-[16/9] w-full cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                >
                    <Image
                        src={allImages[activeImageIndex]}
                        alt={title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-cover"
                        priority
                    />

                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Navigation arrows (desktop) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrevImage() }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-900 transition-all shadow-lg opacity-0 lg:opacity-100 group-hover:opacity-100"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleNextImage() }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-900 transition-all shadow-lg opacity-0 lg:opacity-100 group-hover:opacity-100"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Top-left badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {/* Country flag */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-lg">
                            <span className="text-base">{getCountryFlag(country)}</span>
                            <span>{location}</span>
                        </span>

                        {/* Halal certified badge */}
                        {isHalalCertified && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/95 dark:bg-emerald-950/95 backdrop-blur-sm rounded-full text-sm font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
                                <Leaf className="w-4 h-4" />
                                <span>Halal Certified</span>
                            </span>
                        )}

                        {/* Booking mode badge */}
                        <span className={`
              inline-flex items-center gap-1.5
              px-3 py-1.5
              backdrop-blur-sm
              rounded-full
              text-sm font-medium
              shadow-lg
              ${bookingMode === 'instant'
                                ? 'bg-amber-50/95 dark:bg-amber-950/95 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50'
                                : 'bg-blue-50/95 dark:bg-blue-950/95 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50'
                            }
            `}>
                            {bookingMode === 'instant' ? (
                                <Zap className="w-4 h-4" />
                            ) : (
                                <Clock className="w-4 h-4" />
                            )}
                            <span>
                                {bookingMode === 'instant' ? 'Instant Booking' : 'Request to Book'}
                            </span>
                        </span>
                    </div>

                    {/* Top-right action buttons */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        {/* Save button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved) }}
                            className="
                w-10 h-10
                bg-white/95 dark:bg-gray-900/95
                backdrop-blur-sm
                rounded-full
                flex items-center justify-center
                hover:bg-white dark:hover:bg-gray-900
                transition-all
                shadow-lg
              "
                            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                        >
                            <Heart
                                className={`
                  w-5 h-5
                  transition-colors
                  ${isSaved
                                        ? 'fill-red-500 text-red-500'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }
                `}
                            />
                        </button>

                        {/* Share button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsShareOpen(!isShareOpen) }}
                            className="
                w-10 h-10
                bg-white/95 dark:bg-gray-900/95
                backdrop-blur-sm
                rounded-full
                flex items-center justify-center
                hover:bg-white dark:hover:bg-gray-900
                transition-all
                shadow-lg
                relative
              "
                            aria-label="Share tour"
                        >
                            <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />

                            {/* Share dropdown */}
                            {isShareOpen && (
                                <div className="
                  absolute top-full right-0 mt-2
                  w-48
                  bg-white dark:bg-gray-900
                  rounded-lg
                  shadow-xl
                  border border-gray-200 dark:border-gray-800
                  p-2
                  z-50
                ">
                                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                        Copy link
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                        Share on WhatsApp
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                        Share on Twitter
                                    </button>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Video play button (if exists) */}
                    {videos.length > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); /* Open video modal */ }}
                            className="
                absolute bottom-4 left-4
                flex items-center gap-2
                px-4 py-2
                bg-white/95 dark:bg-gray-900/95
                backdrop-blur-sm
                rounded-full
                text-sm font-medium
                text-gray-700 dark:text-gray-300
                hover:bg-white dark:hover:bg-gray-900
                transition-all
                shadow-lg
              "
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Watch preview
                        </button>
                    )}

                    {/* Image counter */}
                    <div className="
            absolute bottom-4 right-4
            px-3 py-1.5
            bg-black/70 dark:bg-black/70
            backdrop-blur-sm
            rounded-full
            text-xs font-medium
            text-white
          ">
                        {activeImageIndex + 1} / {allImages.length}
                    </div>
                </div>

                {/* Thumbnail strip */}
                <div className="
          flex gap-2 p-2
          overflow-x-auto
          scrollbar-hide
          bg-gray-50 dark:bg-gray-900
        ">
                    {allImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`
                relative
                flex-shrink-0
                w-20 h-20
                rounded-lg
                overflow-hidden
                transition-all
                ${activeImageIndex === index
                                    ? 'ring-2 ring-blue-600 dark:ring-blue-400 ring-offset-2'
                                    : 'opacity-70 hover:opacity-100'
                                }
              `}
                        >
                            <Image
                                src={image}
                                alt={`${title} - image ${index + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </button>
                    ))}

                    {/* Video thumbnails */}
                    {videos.map((video: TourMedia, index: number) => (
                        <button
                            key={video.id}
                            className="
                relative
                flex-shrink-0
                w-20 h-20
                rounded-lg
                overflow-hidden
                opacity-70 hover:opacity-100
                transition-all
              "
                        >
                            <Image
                                src={video.thumbnail || video.url}
                                alt={`${title} video ${index + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="w-6 h-6 text-white fill-white" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ========================================
          TITLE & QUICK STATS
          ======================================== */}
            <div className="space-y-3">
                <h1 className="
          text-2xl sm:text-3xl lg:text-4xl
          font-bold
          text-gray-900 dark:text-white
          leading-tight
        ">
                    {title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                    {/* Rating */}
                    <Link href="#reviews" className="flex items-center gap-1.5 group">
                        <div className="flex items-center">
                            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                            <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                                {formatRating(averageRating)}
                            </span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            ({totalReviews.toLocaleString()} reviews)
                        </span>
                    </Link>

                    {/* Verified badge */}
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Verified tour</span>
                    </span>

                    {/* Location with map link */}
                    <Link
                        href="#meeting-point"
                        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <MapPin className="w-4 h-4" />
                        <span>View meeting point</span>
                    </Link>
                </div>
            </div>

            {/* ========================================
          LIGHTBOX MODAL (Phase 2 Enhancement)
          ========================================
          For Phase 1, we'll keep it simple
          Add full-screen gallery modal in Phase 2
      */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    {/* Full gallery implementation in Phase 2 */}
                </div>
            )}
        </div>
    )
}