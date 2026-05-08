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

import { useState, useEffect, useRef } from 'react'
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
 BadgePercent,
 ZoomIn,
 ZoomOut,
 Move,
 Plus,
 Minus,
 RotateCcw
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
 const constraintsRef = useRef(null)
 const isSaved = isFavorited(id)
 const [isShareOpen, setIsShareOpen] = useState(false)
 const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all')
 const [zoomScale, setZoomScale] = useState(1)
 const [touchStart, setTouchStart] = useState(0)
 const [touchEnd, setTouchEnd] = useState(0)

 // Unify main image into the gallery for seamless switching and deduplicate by URL
 // Ensure we preserve the caption if the mainImage matches an item in the gallery
 const fullGallery: TourMedia[] = [
 ...(gallery || []),
 // Only add mainImage if it's not already in the gallery
 ...(gallery?.some(m => m.url === mainImage) 
 ? [] 
 : [{ id: 'main', type: (isVideoUrl(mainImage) ? 'video' : 'image') as 'image' | 'video', url: mainImage, displayOrder: -1 }])
 ].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

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
 setZoomScale(1)
 // Clean up any stale toasts
 toast.dismiss('gallery-open')
 }


 const formatRating = (rating: number) => {
 return rating.toFixed(1)
 }

 const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.5, 4))
 const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.5, 1))
 const handleResetZoom = () => setZoomScale(1)

 const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX)
 const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
 const handleTouchEnd = () => {
   if (!touchStart || !touchEnd) return
   const distance = touchStart - touchEnd
   if (distance > 50) handleNext()
   if (distance < -50) handlePrev()
   setTouchStart(0)
   setTouchEnd(0)
 }

 const handleWheel = (e: React.WheelEvent) => {
 if (activeMedia.type !== 'image') return
 e.stopPropagation()
 if (e.deltaY < 0) {
 setZoomScale(prev => Math.min(prev + 0.2, 4))
 } else {
 setZoomScale(prev => Math.max(prev - 0.2, 1))
 }
 }

 return (
 <div className="space-y-4">
 {/* ========================================
 MAIN IMAGE GALLERY
 ======================================== */}
 <div className="relative rounded-xl overflow-hidden surface-section group shadow-inner">
 {/* Main content area */}
 <div className="relative aspect-square sm:aspect-[16/9] w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
 >
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

 {/* Caption Overlay (Main View) */}
 {activeMedia?.caption && (
 <div className="absolute bottom-4 left-4 right-4 z-[5] pointer-events-none">
 <p className="text-white text-sm font-medium drop-shadow-md">
 {activeMedia.caption}
 </p>
 </div>
 )}

 {/* Gradient overlay for text readability (only if image) */}
 {activeMedia?.type !== 'video' && (
 <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-[1]" />
 )}

 {/* Lightbox trigger layer (covers entire image but stays behind buttons) */}
 <div 
 className="absolute inset-0 cursor-pointer z-[5]"
 onClick={() => openGallery(activeMediaIndex)}
 />
 </div>

 {/* Navigation arrows (desktop) - OUTSIDE clickable lightbox div */}
 <motion.button
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.9 }}
 onClick={(e) => { e.stopPropagation(); handlePrev() }}
 className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-all shadow-lg opacity-0 lg:opacity-100 group-hover:opacity-100 z-10"
 aria-label="Previous media"
 >
 <ChevronLeft className="w-5 h-5" />
 </motion.button>

 <motion.button
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.9 }}
 onClick={(e) => { e.stopPropagation(); handleNext() }}
 className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-all shadow-lg opacity-0 lg:opacity-100 group-hover:opacity-100 z-10"
 aria-label="Next media"
 >
 <ChevronRight className="w-5 h-5" />
 </motion.button>

 {/* Location Badge (Top Left) */}
 <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none z-10">
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 surface-card rounded-lg text-sm font-bold text-theme-primary shadow-md pointer-events-auto border border-theme ">
 <span className="text-base">{getCountryFlag(country as any)}</span>
 <span>{location}</span>
 </span>
 </div>

 {/* Top-right action buttons */}
 <div className="absolute top-4 right-4 flex gap-2 z-20">
 {/* Full-screen button */}
 <button
 onClick={(e) => { e.stopPropagation(); openGallery(activeMediaIndex) }}
 className="w-10 h-10 surface-card  rounded-lg flex items-center justify-center hover:surface-card dark:hover:surface-base transition-all shadow-lg active:scale-95"
 aria-label="View fullscreen"
 >
 <Maximize className="w-5 h-5 text-theme-secondary" />
 </button>

 {/* Save button */}
 <button
 onClick={(e) => { e.stopPropagation(); toggleFavorite(id) }}
 className="w-10 h-10 surface-card  rounded-lg flex items-center justify-center hover:surface-card dark:hover:surface-base transition-all shadow-lg active:scale-95"
 aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
 >
 <Heart
 className={`w-5 h-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-theme-secondary'}`}
 />
 </button>

 {/* Share button */}
 <div className="relative">
 <motion.button
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.9 }}
 onClick={(e) => { e.stopPropagation(); setIsShareOpen(!isShareOpen) }}
 className="w-10 h-10 surface-card  rounded-lg flex items-center justify-center hover:surface-card dark:hover:surface-base transition-all shadow-lg"
 aria-label="Share tour"
 >
 <Share2 className="w-5 h-5 text-theme-secondary" />
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
 surface-card
 
 rounded-xl
 shadow-2xl
 border border-theme
 p-1.5
"
 >
 <button 
 onClick={(e) => { e.stopPropagation(); handleShare('copy') }}
 className="w-full text-left px-3 py-2 text-xs font-bold text-theme-secondary hover:surface-section dark:hover:surface-card rounded-xl flex items-center gap-2 transition-colors"
 >
 <Share2 className="w-4 h-4" />
 Copy link
 </button>
 <button 
 onClick={(e) => { e.stopPropagation(); handleShare('whatsapp') }}
 className="w-full text-left px-3 py-2 text-xs font-bold text-theme-secondary hover:surface-section dark:hover:surface-card rounded-xl flex items-center gap-2 transition-colors"
 >
 <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center text-white">
 <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-4.821 4.991c-1.59 0-3.147-.419-4.515-1.21L5.33 19.01l.865-3.153a8.21 8.21 0 0 1-1.125-4.162c0-4.542 3.7-8.242 8.243-8.242 2.201 0 4.271.857 5.827 2.414a8.196 8.196 0 0 1 2.413 5.828c0 4.542-3.7 8.242-8.242 8.242" /></svg>
 </div>
 WhatsApp
 </button>
 <button 
 onClick={(e) => { e.stopPropagation(); handleShare('twitter') }}
 className="w-full text-left px-3 py-2 text-xs font-bold text-theme-secondary hover:surface-section dark:hover:surface-card rounded-xl flex items-center gap-2 transition-colors"
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
 
 rounded-lg
 text-xs font-medium
 text-white
 shadow-lg
 z-10
">
 {activeMediaIndex + 1} / {fullGallery.length}
 </div>

 {/* Media Filter Tabs */}
 <div className="flex items-center gap-1 p-2 surface-section border-b border-primary-light/10 dark:border-primary-dark/10">
 <button
 onClick={() => setMediaFilter('all')}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
 mediaFilter === 'all' 
 ? 'surface-card text-primary-light dark:text-primary-dark dark:text-primary-dark shadow-sm' 
 : 'text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300'
 }`}
 >
 All ({fullGallery.length})
 </button>
 <button
 onClick={() => setMediaFilter('image')}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
 mediaFilter === 'image' 
 ? 'surface-card text-primary-light dark:text-primary-dark dark:text-primary-dark shadow-sm' 
 : 'text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300'
 }`}
 >
 Photos ({fullGallery.filter(m => m.type === 'image').length})
 </button>
 {fullGallery.some(m => m.type === 'video') && (
 <button
 onClick={() => setMediaFilter('video')}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
 mediaFilter === 'video' 
 ? 'surface-card text-primary-light dark:text-primary-dark dark:text-primary-dark shadow-sm' 
 : 'text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300'
 }`}
 >
 Videos ({fullGallery.filter(m => m.type === 'video').length})
 </button>
 )}
 </div>

 {/* Mobile Pagination Dots */}
 <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
   {fullGallery.map((_, idx) => (
     <div 
       key={idx}
       className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeMediaIndex ? 'bg-white w-3' : 'bg-white/50'}`}
     />
   ))}
 </div>

 {/* Thumbnail strip */}
 <div className="
 hidden sm:flex gap-2 p-2
 overflow-x-auto
 scrollbar-hide
 surface-section
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
 rounded-xl
 overflow-hidden
 transition-all
 ${activeMediaIndex === originalIndex
 ? 'ring-2 ring-primary-light dark:ring-primary-dark dark:ring-primary-light dark:ring-primary-dark ring-offset-2'
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
 whileHover={{ scale: 1.05 }}
 className={`inline-flex items-center justify-center w-11 h-11 rounded-lg shadow-lg transition-all ${bookingMode === BookingMode.INSTANT ? 'bg-primary-light/10 text-primary-light border border-primary-light/20' : 'surface-section text-theme-muted border border-theme '}`}
 title={bookingMode === BookingMode.INSTANT ? 'Instant Confirmation' : 'Request to Book'}
 >
 {bookingMode === BookingMode.INSTANT ? (
 <TicketCheck className="w-6 h-6" />
 ) : (
 <Clock className="w-6 h-6" />
 )}
 </motion.span>
 
 {/* Halal certified badge */}
 {isHalalCertified && (
 <motion.span 
 whileHover={{ scale: 1.05 }}
 className="inline-flex items-center justify-center w-11 h-11 bg-emerald-50 dark:bg-emerald-950/30 border border-success-green/20 rounded-lg shadow-lg text-success-green dark:text-emerald-400 transition-all"
 title="Halal Certified"
 >
 <MoonStar className="w-6 h-6 fill-current" />
 </motion.span>
 )}
 
 {/* Premium badge */}
 {isPremium && (
 <motion.span 
 whileHover={{ scale: 1.05 }}
 className="inline-flex items-center justify-center w-11 h-11 bg-amber-50 dark:bg-amber-950/30 border border-accent-light dark:border-accent-dark/20 rounded-lg shadow-lg text-amber-600 dark:text-amber-400 transition-all"
 title="Premium Tour"
 >
 <Star className="w-6 h-6 fill-current" />
 </motion.span>
 )}
 
 {/* Family Friendly badge */}
 {isFamilyFriendly && (
 <motion.span 
 whileHover={{ scale: 1.05 }}
 className="inline-flex items-center justify-center w-11 h-11 bg-pink-50 dark:bg-pink-950/30 border border-pink-500/20 rounded-lg shadow-lg text-pink-600 dark:text-pink-400 transition-all"
 title="Family Friendly"
 >
 <Baby className="w-6 h-6" />
 </motion.span>
 )}
 
 {/* Group Discount badge */}
 {hasGroupDiscount && (
 <motion.span 
 whileHover={{ scale: 1.05 }}
 className="inline-flex items-center justify-center w-11 h-11 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg shadow-sm text-purple-600 dark:text-purple-400 transition-all"
 title="Group Discount"
 >
 <BadgePercent className="w-6 h-6" />
 </motion.span>
 )}
 
 {/* Status Badge (Special states) */}
 {status && status !== TourStatus.SCHEDULED && status !== TourStatus.CONFIRMED && (
 <span 
 className="px-4 h-11 flex items-center justify-center bg-amber-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] shadow-lg"
 >
 {status.replace('_', ' ')}
 </span>
 )}
 </div>
 <h1 className="
 text-2xl sm:text-3xl lg:text-4xl
 font-bold tracking-tight
 text-theme-primary
 leading-tight
">
 {title}
 </h1>

 <div className="flex flex-wrap items-center gap-4 text-sm">
 {/* Rating */}
 <Link href="#reviews" className="flex items-center gap-1.5 group">
 <div className="flex items-center">
 <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
 <span className="ml-1 font-semibold text-theme-primary">
 {formatRating(averageRating)}
 </span>
 </div>
 <span className="text-theme-muted group-hover:text-primary-light dark:text-primary-dark dark:group-hover:text-primary-light dark:text-primary-dark transition-colors">
 ({totalReviews.toLocaleString()} reviews)
 </span>
 </Link>

 {/* Location with map link */}
 <Link
 href="#meeting-point"
 className="flex items-center gap-1 text-theme-muted hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors"
 >
 <MapPin className="w-4 h-4" />
 <span>View meeting point</span>
 </Link>
 </div>
 </div>
  {/* Mobile Booking CTA */}
  <div className="lg:hidden w-full pt-4">
  <button
  onClick={() => document.getElementById('booking-card')?.scrollIntoView({ behavior: 'smooth' })}
  className="w-full py-4 bg-primary-light hover:bg-primary-light-hover text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
  >
  <TicketCheck className="w-5 h-5" />
  BOOK THIS TOUR
  </button>
  </div>

 {/* Unified Gallery Modal - Advanced Immersive Mode */}
 <AnimatePresence>
 {isGalleryModalOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-[9999] bg-black/98  flex flex-col items-center justify-center p-0 md:p-0"
 onClick={() => setIsGalleryModalOpen(false)}
 onWheel={handleWheel}
 >
 {/* Modal Header */}
 <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-[110] bg-gradient-to-b from-black/80 to-transparent">
 <div className="text-white">
 <h3 className="text-lg font-bold truncate max-w-[200px] md:max-w-md">{title}</h3>
 <p className="text-sm text-white/60">{activeMediaIndex + 1} / {fullGallery.length}</p>
 </div>
 
 <div className="flex items-center gap-3">
 <button
 onClick={() => setIsGalleryModalOpen(false)}
 className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20 backdrop-blur-md"
 >
 <X className="w-6 h-6" />
 </button>
 </div>
 </div>

 {/* Modal Navigation - Prev */}
 {zoomScale === 1 && (
 <button
 onClick={(e) => { e.stopPropagation(); handlePrev(); setZoomScale(1) }}
 className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/20 backdrop-blur-md z-[110]"
 >
 <ChevronLeft className="w-8 h-8" />
 </button>
 )}

 {/* Modal Content - Expanded for whole picture */}
 <div
 ref={constraintsRef}
 className={`relative w-full h-full flex items-center justify-center transition-all duration-300 overflow-hidden ${
 zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
 }`}
 onClick={(e) => e.stopPropagation()}
 >
 {activeMedia.type === 'video' ? (
 <div className="w-full max-w-6xl aspect-video rounded-xl overflow-hidden shadow-2xl">
 <VideoPlayer
 url={activeMedia.url}
 poster={activeMedia.thumbnail || mainImage}
 className="w-full h-full"
 autoPlay={true}
 muted={false}
 />
 </div>
 ) : (
 <motion.div 
 className="relative w-full h-full flex items-center justify-center"
 drag={zoomScale > 1}
 dragConstraints={{ 
 left: -800 * (zoomScale - 1), 
 right: 800 * (zoomScale - 1), 
 top: -500 * (zoomScale - 1), 
 bottom: 500 * (zoomScale - 1) 
 }}
 dragElastic={0.15}
 dragMomentum={true}
 dragTransition={{ power: 0.2, timeConstant: 200 }}
 animate={{ 
 scale: zoomScale,
 transition: { type:"spring", stiffness: 300, damping: 30 }
 }}
 onDoubleClick={() => setZoomScale(zoomScale === 1 ? 2.5 : 1)}
 >
 <Image
 src={activeMedia.url}
 alt={title}
 fill
 className="object-contain pointer-events-none"
 priority
 />
 </motion.div>
 )}

 {/* Zoom Hint Overlay - Fixed position */}
 {zoomScale > 1 && (
 <div className="absolute bottom-28 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60  rounded-lg text-white/80 text-xs flex items-center gap-2 pointer-events-none z-[120]">
 <Move className="w-3.5 h-3.5" />
 Drag to explore
 </div>
 )}

 {/* Lightbox Caption */}
 {zoomScale === 1 && activeMedia.caption && (
 <div className="absolute bottom-24 left-0 right-0 text-center px-6 pointer-events-none">
 <p className="inline-block px-6 py-2 bg-black/40  rounded-lg text-white text-lg font-medium shadow-2xl">
 {activeMedia.caption}
 </p>
 </div>
 )}
 </div>

 {/* ADVANCED ZOOM CONTROL BAR (Bottom Center) */}
 {activeMedia.type === 'image' && (
 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/40  border border-theme-strong rounded-xl flex items-center gap-4 z-[130] shadow-2xl">
 <div className="flex items-center gap-1 border-r border-primary-light/10 dark:border-primary-dark/10-strong pr-3">
 <button 
 onClick={(e) => { e.stopPropagation(); handleZoomOut() }}
 className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
 title="Zoom Out"
 >
 <Minus className="w-5 h-5" />
 </button>
 <span className="w-16 text-center text-sm font-bold text-white/90 tabular-nums">
 {Math.round(zoomScale * 100)}%
 </span>
 <button 
 onClick={(e) => { e.stopPropagation(); handleZoomIn() }}
 className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
 title="Zoom In"
 >
 <Plus className="w-5 h-5" />
 </button>
 </div>
 <button 
 onClick={(e) => { e.stopPropagation(); handleResetZoom() }}
 className="px-3 py-1.5 hover:bg-white/10 rounded-xl text-xs font-bold text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
 title="Reset Zoom"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 RESET
 </button>
 </div>
 )}

 {/* Modal Navigation - Next */}
 {zoomScale === 1 && (
 <button
 onClick={(e) => { e.stopPropagation(); handleNext(); setZoomScale(1) }}
 className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/20 backdrop-blur-md z-[110]"
 >
 <ChevronRight className="w-8 h-8" />
 </button>
 )}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}
