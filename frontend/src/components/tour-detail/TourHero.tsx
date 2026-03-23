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
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useWishlist } from '@/src/lib/contexts/WishlistContext'
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
    X,
    Maximize,
    TicketCheck,
    MoonStar,
    Baby,
    BadgePercent
} from 'lucide-react'
import { BookingMode, TourStatus, type TourHeroProps, type TourMedia } from '@/src/types/tour-detail.types'
import { getCountryFlag, isVideoUrl } from '@/src/lib/utils/tour-utils'
import VideoPlayer from '@/src/components/ui/VideoPlayer'

export default function TourHero({
    id,
    title,
    location,
    country,
    mainImage,
    gallery,
    averageRating,
    totalReviews,
    isHalalCertified,
    bookingMode,
    status,
    isPremium,
    isFamilyFriendly,
    hasGroupDiscount
}: TourHeroProps) {
    const [activeMediaIndex, setActiveMediaIndex] = useState(0)
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
    const { isFavorited, toggleFavorite } = useWishlist()
    const isSaved = isFavorited(id)
    const [isShareOpen, setIsShareOpen] = useState(false)
    const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all')

    // Unify main image into the gallery for seamless switching and deduplicate by URL
    const fullGallery: TourMedia[] = [
        { id: 'main', type: (isVideoUrl(mainImage) ? 'video' : 'image') as 'image' | 'video', url: mainImage, displayOrder: 0 },
        ...(gallery || [])
    ].reduce((acc: TourMedia[], current) => {
        const isDuplicate = acc.some(item => item.url === current.url)
        if (!isDuplicate) {
            acc.push(current)
        }
        return acc
    }, []).sort((a, b) => a.displayOrder - b.displayOrder)

    const activeMedia = fullGallery[activeMediaIndex]

    const handlePrev = () => {
        setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : fullGallery.length - 1))
    }

    const handleNext = () => {
        setActiveMediaIndex((prev) => (prev < fullGallery.length - 1 ? prev + 1 : 0))
    }

    const filteredGallery = fullGallery.filter(item => 
        mediaFilter === 'all' ? true : item.type === mediaFilter
    )

    const firstVideo = fullGallery.find(m => m.type === 'video')

    const handleShare = (platform: 'whatsapp' | 'twitter' | 'copy') => {
        const url = window.location.href
        const text = `Check out this amazing tour: ${title}`

        if (platform === 'copy') {
            navigator.clipboard.writeText(url)
            toast.success('Link copied to clipboard!')
            setIsShareOpen(false)
            return
        }

        let shareUrl = ''
        if (platform === 'whatsapp') {
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
        } else if (platform === 'twitter') {
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        }

        window.open(shareUrl, '_blank', 'noopener,noreferrer')
        setIsShareOpen(false)
    }

    const openGallery = (index: number) => {
        setActiveMediaIndex(index)
        setIsGalleryModalOpen(true)
    }

    const formatRating = (rating: number) => {
        return rating.toFixed(1)
    }

    return (
        <div className="space-y-4">
            {/* ========================================
          MAIN IMAGE GALLERY
          ======================================== */}
            <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                {/* Main content area */}
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                    {activeMedia?.type === 'video' ? (
                        <VideoPlayer 
                            url={activeMedia.url} 
                            poster={activeMedia.thumbnail || mainImage}
                            className="w-full h-full"
                            autoPlay={true}
                            muted={true}
                            objectFit="cover"
                        />
                    ) : (
                        <Image
                            src={activeMedia?.url || mainImage}
                            alt={title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 66vw"
                            className="object-cover"
                            priority
                        />
                    )}

                    {/* Gradient overlay for text readability (only if image) */}
                    {activeMedia?.type !== 'video' && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-[1]" />
                    )}

                    {/* Lightbox trigger layer (covers entire image but stays behind buttons) */}
                    <div 
                        className="absolute inset-0 cursor-pointer z-0"
                        onClick={() => openGallery(activeMediaIndex)}
                    />
                </div>

                {/* Navigation arrows (desktop) - OUTSIDE clickable lightbox div */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); handlePrev() }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-900 transition-all shadow-lg opacity-0 lg:opacity-100 group-hover:opacity-100 z-10"
                    aria-label="Previous media"
                >
                    <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); handleNext() }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-900 transition-all shadow-lg opacity-0 lg:opacity-100 group-hover:opacity-100 z-10"
                    aria-label="Next media"
                >
                    <ChevronRight className="w-5 h-5" />
                </motion.button>

                {/* Location Badge (Top Left) */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none z-10">
                    {/* Country flag */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-lg pointer-events-auto">
                        <span className="text-base">{getCountryFlag(country as any)}</span>
                        <span>{location}</span>
                    </span>
                </div>

                {/* Top-right action buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                    {/* Full-screen button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); openGallery(activeMediaIndex) }}
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
                        aria-label="View fullscreen"
                    >
                        <Maximize className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </motion.button>

                    {/* Save button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(id) }}
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
                    </motion.button>

                    {/* Share button */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); setIsShareOpen(!isShareOpen) }}
                            className="w-10 h-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-all shadow-lg"
                            aria-label="Share tour"
                        >
                            <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </motion.button>

                        {/* Share dropdown */}
                        <AnimatePresence>
                            {isShareOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="
                      absolute top-full right-0 mt-2
                      w-48
                      bg-white dark:bg-gray-900/95
                      backdrop-blur-md
                      rounded-xl
                      shadow-2xl
                      border border-gray-100 dark:border-gray-800
                      p-1.5
                    "
                                >
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleShare('copy') }}
                                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Copy link
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleShare('whatsapp') }}
                                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center text-white">
                                            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-4.821 4.991c-1.59 0-3.147-.419-4.515-1.21L5.33 19.01l.865-3.153a8.21 8.21 0 0 1-1.125-4.162c0-4.542 3.7-8.242 8.243-8.242 2.201 0 4.271.857 5.827 2.414a8.196 8.196 0 0 1 2.413 5.828c0 4.542-3.7 8.242-8.242 8.242" /></svg>
                                        </div>
                                        WhatsApp
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleShare('twitter') }}
                                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <div className="w-4 h-4 bg-black rounded flex items-center justify-center text-white">
                                            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                        </div>
                                        Twitter / X
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Image counter (Bottom Right) */}
                <div className="
                    absolute bottom-4 right-4
                    px-3 py-1.5
                    bg-black/70 dark:bg-black/70
                    backdrop-blur-sm
                    rounded-full
                    text-xs font-medium
                    text-white
                    shadow-lg
                    z-10
                ">
                    {activeMediaIndex + 1} / {fullGallery.length}
                </div>

                {/* Media Filter Tabs */}
                <div className="flex items-center gap-1 p-2 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setMediaFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            mediaFilter === 'all' 
                                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        All ({fullGallery.length})
                    </button>
                    <button
                        onClick={() => setMediaFilter('image')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            mediaFilter === 'image' 
                                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Photos ({fullGallery.filter(m => m.type === 'image').length})
                    </button>
                    {fullGallery.some(m => m.type === 'video') && (
                        <button
                            onClick={() => setMediaFilter('video')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                mediaFilter === 'video' 
                                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Videos ({fullGallery.filter(m => m.type === 'video').length})
                        </button>
                    )}
                </div>

                {/* Thumbnail strip */}
                <div className="
          flex gap-2 p-2
          overflow-x-auto
          scrollbar-hide
          bg-gray-50 dark:bg-gray-900
        ">
                    {filteredGallery.map((item) => {
                        const originalIndex = fullGallery.findIndex(m => m.id === item.id)
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveMediaIndex(originalIndex)}
                                className={`
                    relative
                    flex-shrink-0
                    w-20 h-20
                    rounded-lg
                    overflow-hidden
                    transition-all
                    ${activeMediaIndex === originalIndex
                                        ? 'ring-2 ring-blue-600 dark:ring-blue-400 ring-offset-2'
                                        : 'opacity-70 hover:opacity-100'
                                    }
                  `}
                            >
                                <Image
                                    src={item.type === 'video' ? (item.thumbnail || mainImage) : item.url}
                                    alt={`${title} - ${item.type}`}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                                {item.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <Play className="w-6 h-6 text-white fill-white shadow-lg" />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ========================================
          TITLE & QUICK STATS
          ======================================== */}
            <div className="space-y-4 pt-2">
                {/* Feature Badges Row */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Booking mode badge */}
                    <motion.span 
                        whileHover={{ scale: 1.02 }}
                        className={`
                            inline-flex items-center gap-2
                            px-3 py-1.5
                            rounded-full
                            text-[10px] font-black uppercase tracking-[0.1em]
                            shadow-sm transition-all
                            ${bookingMode === BookingMode.INSTANT
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50'
                                : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800'
                            }
                        `}
                    >
                        {bookingMode === BookingMode.INSTANT ? (
                            <TicketCheck className="w-3.5 h-3.5" />
                        ) : (
                            <Clock className="w-3.5 h-3.5" />
                        )}
                        <span>
                            {bookingMode === BookingMode.INSTANT ? 'Instant Confirmation' : 'Request to Book'}
                        </span>
                    </motion.span>

                    {/* Halal certified badge */}
                    {isHalalCertified && (
                        <motion.span 
                            whileHover={{ scale: 1.02 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/50 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm text-emerald-600 dark:text-emerald-400 transition-all"
                        >
                            <MoonStar className="w-3.5 h-3.5 fill-current" />
                            <span>Halal Certified</span>
                        </motion.span>
                    )}

                    {/* Premium badge */}
                    {isPremium && (
                        <motion.span 
                            whileHover={{ scale: 1.02 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/50 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm text-amber-600 dark:text-amber-400 transition-all"
                        >
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>Premium</span>
                        </motion.span>
                    )}

                    {/* Family Friendly badge */}
                    {isFamilyFriendly && (
                        <motion.span 
                            whileHover={{ scale: 1.02 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-800/50 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm text-pink-600 dark:text-pink-400 transition-all"
                        >
                            <Baby className="w-3.5 h-3.5" />
                            <span>Family Friendly</span>
                        </motion.span>
                    )}

                    {/* Group Discount badge */}
                    {hasGroupDiscount && (
                        <motion.span 
                            whileHover={{ scale: 1.02 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/50 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm text-purple-600 dark:text-purple-400 transition-all"
                        >
                            <BadgePercent className="w-3.5 h-3.5" />
                            <span>Group Discount</span>
                        </motion.span>
                    )}

                    {/* Status Badge (Special states) */}
                    {status && status !== TourStatus.SCHEDULED && status !== TourStatus.CONFIRMED && (
                        <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm text-amber-600 dark:text-amber-400">
                            {status.replace('_', ' ')}
                        </span>
                    )}
                </div>
                <h1 className="
          text-3xl sm:text-4xl lg:text-5xl
          font-black tracking-tight
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

            {/* Unified Gallery Modal */}
            <AnimatePresence>
                {isGalleryModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center"
                        onClick={() => setIsGalleryModalOpen(false)}
                    >
                        {/* Modal Header */}
                        <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-[110] bg-gradient-to-b from-black/60 to-transparent">
                            <div className="text-white">
                                <h3 className="text-lg font-bold">{title}</h3>
                                <p className="text-sm text-white/60">{activeMediaIndex + 1} / {fullGallery.length}</p>
                            </div>
                            <button
                                onClick={() => setIsGalleryModalOpen(false)}
                                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Navigation - Prev */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev() }}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md z-[110]"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>

                        {/* Modal Content */}
                        <motion.div
                            key={activeMediaIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-6xl h-[70vh] flex items-center justify-center p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {activeMedia.type === 'video' ? (
                                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                                    <VideoPlayer
                                        url={activeMedia.url}
                                        poster={activeMedia.thumbnail || mainImage}
                                        className="w-full h-full"
                                        autoPlay={true}
                                        muted={false}
                                    />
                                </div>
                            ) : (
                                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                                    <Image
                                        src={activeMedia.url}
                                        alt={title}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            )}
                        </motion.div>

                        {/* Modal Navigation - Next */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext() }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md z-[110]"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        {/* Modal Footer (Thumbnail Strip) */}
                        <div className="absolute bottom-10 inset-x-0 flex justify-center px-6 overflow-hidden z-[110]">
                            <div className="flex gap-3 overflow-x-auto scrollbar-hide py-4 px-8 bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10">
                                {fullGallery.map((item, idx) => (
                                    <button
                                        key={item.id}
                                        onClick={(e) => { e.stopPropagation(); setActiveMediaIndex(idx) }}
                                        className={`relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                                            activeMediaIndex === idx ? 'ring-2 ring-blue-500 scale-110' : 'opacity-40 hover:opacity-100'
                                        }`}
                                    >
                                        <Image
                                            src={item.type === 'video' ? (item.thumbnail || mainImage) : item.url}
                                            alt={`Gallery ${idx}`}
                                            fill
                                            className="object-cover"
                                        />
                                        {item.type === 'video' && <Play className="absolute inset-0 m-auto w-6 h-6 text-white fill-current opacity-60" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}