// ============================================================================
// WISHLIST CONTENT COMPONENT
// ============================================================================
// LOCATION: /frontend/src/components/wishlist/WishlistContent.tsx
// 
// PURPOSE: Reusable logic and UI for the Wishlist / Inspiration List
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
 Heart,
 Trash2,
 Share2,
 MapPin,
 Clock,
 Star,
 ChevronRight,
 Loader2,
 ArrowRight,
 MoonStar,
 TicketCheck,
 Baby,
 BadgePercent,
 Play
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getWishlistTours } from '@/src/lib/api/wishlist'
import { PublicTourCardResponse } from '@/src/lib/types/tour.types'
import { useWishlist } from '@/src/lib/contexts/WishlistContext'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { isVideoUrl } from '@/src/lib/utils/tour-utils'

// ============================================================================
// WISHLIST CARD COMPONENT
// ============================================================================

const WishlistCard = ({ tour, onRemove, index }: { tour: PublicTourCardResponse; onRemove: (id: number) => void; index: number }) => {
 const [isHovered, setIsHovered] = useState(false)
 const durationText = tour.durationHours !== null 
 ? `${tour.durationHours}h${tour.durationMinutes ? ` ${tour.durationMinutes}m` : ''}`
 : 'Duration N/A'
 
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 whileHover={{ y: -4 }}
 className="group surface-card border border-theme rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300"
 >
 <div className="flex flex-col sm:flex-row h-full">
 {/* Image Section */}
 <div 
 className="relative w-full sm:w-64 h-48 sm:h-auto surface-section overflow-hidden"
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 >
 <motion.div
 whileHover={{ scale: 1.1 }}
 transition={{ duration: 0.6 }}
 className="w-full h-full"
 >
 {isVideoUrl(tour.coverImageUrl) ? (
 <div className="relative w-full h-full">
 <video
 src={tour.coverImageUrl!}
 className="w-full h-full object-cover"
 muted
 playsInline
 loop
 autoPlay={isHovered}
 />
 {!isHovered && (
 <div className="absolute inset-0 flex items-center justify-center bg-black/10">
 <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
 <Play className="w-5 h-5 text-white fill-white" />
 </div>
 </div>
 )}
 </div>
 ) : (
 <Image 
 src={tour.coverImageUrl || '/images/placeholder-tour.jpg'} 
 alt={tour.title} 
 fill 
 className="object-cover" 
 />
 )}
 </motion.div>
 
 {/* Overlays */}
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 
 {/* Floating Remove Button */}
 <button
 onClick={() => onRemove(tour.id)}
 className="absolute top-3 right-3 z-20 p-2.5 surface-card text-danger-red rounded-xl shadow-lg hover:bg-danger-red hover:text-white transition-all active:scale-90 border border-theme opacity-100"
 title="Remove from favorites"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>

 {/* Content Section */}
 <div className="flex-1 flex flex-col p-4 sm:p-6">
 <div className="flex justify-between items-start gap-4 mb-2">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <div className="text-[9px] font-black text-primary-light dark:text-primary-dark capitalize tracking-[0.2em]">
 {tour.category || 'Experience'}
 </div>
 {tour.isPremium && (
 <div className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/30 border border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/50 rounded-full text-[9px] font-bold capitalize tracking-normal text-amber-600 dark:text-amber-400 flex items-center gap-1">
 <Star className="w-2.5 h-2.5 fill-current" />
 Premium
 </div>
 )}
 </div>
 <h3 className="text-lg sm:text-xl font-extrabold text-theme-primary leading-tight group-hover:text-primary-light transition-colors capitalize tracking-tight">
 {tour.title}
 </h3>
 </div>
 <div className="text-right">
 <div className="text-xl sm:text-2xl font-black text-theme-primary tracking-tight">
 <span className="text-xs font-bold mr-0.5 opacity-50">{tour.currency}</span>
 {tour.basePrice}
 </div>
 <div className="text-[9px] text-theme-muted capitalize font-black tracking-normal opacity-60">per person</div>
 </div>
 </div>

 <div className="flex items-center gap-3 mt-2 mb-4">
 {tour.halalFriendly && (
 <div className="flex items-center gap-1 text-[11px] font-bold text-success-green dark:text-emerald-500 capitalize tracking-normal" title="Halal / Muslim Friendly">
 <MoonStar className="w-3.5 h-3.5" />
 </div>
 )}
 {tour.instantBook && (
 <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-accent-light dark:text-accent-dark capitalize tracking-normal" title="Instant Confirmation">
 <TicketCheck className="w-3.5 h-3.5" />
 </div>
 )}
 {tour.isFamilyFriendly && (
 <div className="flex items-center gap-1 text-[11px] font-bold text-pink-600 dark:text-pink-500 capitalize tracking-normal" title="Family Friendly">
 <Baby className="w-3.5 h-3.5" />
 </div>
 )}
 {tour.hasGroupDiscount && (
 <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-500 capitalize tracking-normal" title="Group Discounts Available">
 <BadgePercent className="w-3.5 h-3.5" />
 </div>
 )}
 </div>

 <div className="flex items-center gap-2 mb-4 group/guide">
 <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-primary-light dark:text-primary-dark">
 {tour.guideDisplayName.charAt(0)}
 </div>
 <p className="text-sm text-theme-secondary ">
 With <span className="font-semibold text-theme-primary">{tour.guideDisplayName}</span>
 </p>
 </div>

 <div className="grid grid-cols-3 gap-2 py-4 border-y border-theme mb-auto">
 <div className="flex flex-col gap-1">
 <span className="text-[10px] text-theme-muted capitalize font-bold tracking-normal">Location</span>
 <span className="text-xs font-semibold text-theme-secondary flex items-center gap-1 truncate">
 <MapPin className="w-3 h-3 text-primary-light dark:text-primary-dark" />
 {tour.locationName || tour.city || tour.countryCode}
 </span>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-[10px] text-theme-muted capitalize font-bold tracking-normal">Duration</span>
 <span className="text-xs font-semibold text-theme-secondary flex items-center gap-1">
 <Clock className="w-3 h-3 text-primary-light dark:text-primary-dark" />
 {durationText}
 </span>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-[10px] text-theme-muted capitalize font-bold tracking-normal">Rating</span>
 <span className="text-xs font-semibold text-theme-secondary flex items-center gap-1">
 <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
 {tour.averageRating?.toFixed(1) || 'N/A'}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-3 mt-6">
 <Link
 href={`/tours/${tour.id}`}
 className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-light text-white text-[11px] font-extrabold capitalize tracking-normal rounded-xl hover:bg-primary-light-hover transition-all shadow-2xl shadow-primary-light/30 active:scale-95"
 >
 Learn More
 <ArrowRight className="w-4 h-4" />
 </Link>
 <button
 onClick={() => {
 const url = `${window.location.origin}/tours/${tour.id}`
 navigator.clipboard.writeText(url)
 toast.success('Ready to share!')
 }}
 className="p-3.5 surface-base text-theme-secondary border border-theme rounded-xl hover:bg-surface-hover transition-all active:scale-95"
 >
 <Share2 className="w-5 h-5" />
 </button>
 </div>
 </div>
 </div>
 </motion.div>
 )
}

// ============================================================================
// WISH LIST CONTENT
// ============================================================================

export default function WishlistContent() {
 const [wishlist, setWishlist] = useState<PublicTourCardResponse[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const { toggleFavorite } = useWishlist()
 const { user } = useAuth()

 const isGuide = user?.role === 'GUIDE'
 const title = isGuide ? 'Inspiration List' : 'My Wishlist'
 const subtitle = isGuide 
 ? 'Tours you\'ve saved for market research and inspiration.' 
 : 'Tours you\'ve saved for your next adventure.'

 const fetchWishlist = async () => {
 try {
 setIsLoading(true)
 const data = await getWishlistTours()
 setWishlist(data)
 } catch (err) {
 console.error('Failed to fetch wishlist:', err)
 toast.error('Failed to load wishlist')
 } finally {
 setIsLoading(false)
 }
 }

 useEffect(() => {
 fetchWishlist()
 }, [])

 const handleRemove = async (id: number) => {
 try {
 await toggleFavorite(id)
 setWishlist(prev => prev.filter(tour => tour.id !== id))
 } catch (err) {
 // Error handled in context
 }
 }

 const handleShareWishlist = () => {
 const tourNames = wishlist.map(t => t.title).join('\n- ')
 const text = `My SafariHub Wishlist:\n- ${tourNames}`
 
 if (navigator.share) {
 navigator.share({
 title: 'My SafariHub Wishlist',
 text: text,
 url: window.location.href
 })
 } else {
 navigator.clipboard.writeText(text)
 toast.success('Wishlist copied to clipboard!')
 }
 }

 return (
 <div className="w-full">
 <div className="container-safe mx-auto max-w-5xl py-4 sm:py-12">
 
 {/* Header Section */}
 <motion.div 
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-12 border-b border-theme pb-8 sm:pb-10"
 >
 <div>
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2.5 bg-primary-light rounded-2xl shadow-lg shadow-primary-light/20">
 <Heart className="w-6 h-6 text-white fill-white/20" />
 </div>
 <span className="text-sm font-bold text-theme-muted capitalize tracking-normal">Saved Experiences</span>
 </div>
 <h1 className="text-2xl sm:text-4xl font-extrabold text-theme-primary mb-1 tracking-tight capitalize">
 {title}
 </h1>
 <p className="text-sm sm:text-lg text-theme-secondary font-medium capitalize tracking-normal opacity-70">
 {subtitle}
 </p>
 </div>

 {!isLoading && wishlist.length > 0 && (
 <div className="flex items-center gap-3">
 <div className="px-4 py-2 bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark rounded-xl text-sm font-bold border border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark/30">
 {wishlist.length} Items
 </div>
 <button
 onClick={handleShareWishlist}
 className="p-3 surface-card border border-theme text-theme-secondary rounded-xl hover:surface-section dark:hover:surface-card transition-all shadow-sm active:scale-95"
 title="Share Wishlist"
 >
 <Share2 className="w-5 h-5" />
 </button>
 </div>
 )}
 </motion.div>

 {/* Transitioning Content */}
 <AnimatePresence mode="wait">
 {isLoading ? (
    <div className="w-full animate-pulse">
      <div className="flex flex-col gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="surface-card border border-theme rounded-2xl overflow-hidden h-72 sm:h-64 flex flex-col sm:flex-row">
            <div className="w-full sm:w-64 h-48 sm:h-full surface-section" />
            <div className="flex-1 p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-7 w-64 surface-section rounded" />
                  <div className="h-4 w-32 surface-section rounded" />
                </div>
                <div className="h-10 w-10 surface-section rounded-xl" />
              </div>
              <div className="flex gap-8">
                <div className="space-y-2">
                  <div className="h-3 w-12 surface-section rounded" />
                  <div className="h-5 w-20 surface-section rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-12 surface-section rounded" />
                  <div className="h-5 w-20 surface-section rounded" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-12 flex-1 surface-section rounded-xl" />
                <div className="h-12 w-12 surface-section rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
 ) : wishlist.length > 0 ? (
 <motion.div 
 key="list"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col gap-8"
 >
 <AnimatePresence>
 {wishlist.map((tour, index) => (
 <WishlistCard 
 key={tour.id} 
 tour={tour} 
 onRemove={handleRemove} 
 index={index}
 />
 ))}
 </AnimatePresence>
 </motion.div>
 ) : (
 <motion.div 
 key="empty"
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="text-center py-32 px-6 surface-card border border-theme rounded-[3rem] shadow-sm relative overflow-hidden"
 >
 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
 
 <div className="inline-flex items-center justify-center w-32 h-32 mb-8 surface-section rounded-[2.5rem] relative group">
 <Heart className="w-12 h-12 text-theme-muted transition-colors group-hover:text-red-400" />
 <div className="absolute inset-0 bg-primary-light/5 rounded-full animate-ping pointer-events-none" />
 </div>
 
 <h3 className="text-xl sm:text-3xl font-extrabold text-theme-primary mb-3 capitalize tracking-tight">
 Start your collection
 </h3>
 <p className="text-[10px] sm:text-xl text-theme-muted mb-8 max-w-xs sm:max-w-md mx-auto font-black capitalize tracking-normal opacity-70 leading-relaxed">
 Save the experiences that speak to you and we'll keep them here for your next perfect trip.
 </p>
 
 <Link
 href="/tours"
 className="inline-flex items-center gap-3 px-8 py-4 bg-primary-light text-white text-[11px] font-extrabold capitalize tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-primary-light/30 active:scale-95 group"
 >
 Explore Tours
 <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
 </Link>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 )
}
