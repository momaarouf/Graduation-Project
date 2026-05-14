// ============================================================================
// REVIEW LIST - TRAVELER FEEDBACK & GUIDE REPLIES
// ============================================================================
// LOCATION: /frontend/src/components/tour-detail/ReviewList.tsx
// 
// PURPOSE: Social proof and quality feedback for the tour
// 
// FEATURES:
// 1. Rating summary with star distribution
// 2. Individual review cards with traveler tier badges
// 3. Guide reply display (Phase 1 mock)
// 4. Helpful voting (Phase 2)
// 5. Attached images with lightbox (Phase 2)
// ============================================================================

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
 Star,
 ThumbsUp,
 MessageSquare,
 ChevronDown,
 Filter,
 CheckCircle,
 MoreVertical,
 Send,
 Loader2,
 X
} from 'lucide-react'
import type { ReviewListProps } from '@/src/types/tour-detail.types'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { toggleReviewHelpful, replyToReview, getTourReviews } from '@/src/lib/api/tours'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function ReviewList({
 reviews: initialReviews = [],
 averageRating = 0,
 totalReviews = 0,
 reviewSummary,
 tourGuideId,
 tourId,
 isFullPage = false
}: ReviewListProps) {
 const { user } = useAuth()
 const [reviews, setReviews] = useState<any[]>(initialReviews || [])
 const [filterRating, setFilterRating] = useState<number | null>(null)
 const [sortBy, setSortBy] = useState('newest')
 const [isFiltering, setIsFiltering] = useState(false)
 const [activeDropdown, setActiveDropdown] = useState<'filter' | 'sort' | 'review-menu-' | null>(null)
 const [replyingTo, setReplyingTo] = useState<string | null>(null)
 const [replyContent, setReplyContent] = useState('')
 const [isSubmittingReply, setIsSubmittingReply] = useState(false)
 const [showDebugIds, setShowDebugIds] = useState(false)
 const [votingIds, setVotingIds] = useState<Set<string>>(new Set())

 // Update reviews when filters change
 useEffect(() => {
 const fetchFiltered = async () => {
 if (activeDropdown === 'filter' || activeDropdown === 'sort') return 
 
 console.log(`[ReviewList] Filtering reviews for rating ${filterRating}, sort ${sortBy}`)
 setIsFiltering(true)
 try {
 const res = await getTourReviews(tourId, { 
 page: 0, 
 size: isFullPage ? 50 : 10, 
 rating: filterRating, 
 sort: sortBy 
 })
 if (res.reviews?.content) {
 setReviews(res.reviews.content.map((r: any) => ({
 ...r,
 id: String(r.id),
 travelerId: String(r.travelerId)
 })))
 } else {
 setReviews([])
 }
 } catch (err) {
 console.error('Failed to filter reviews:', err)
 toast.error('Could not apply filter')
 } finally {
 setIsFiltering(false)
 }
 }

 // Don't re-fetch on mount if filters are default
 if (filterRating === null && sortBy === 'newest') return 
 
 fetchFiltered()
 }, [filterRating, sortBy, tourId, isFullPage])

 // Standardize reviews on mount or prop change
 useEffect(() => {
 setReviews(initialReviews)
 }, [initialReviews])

 // Re-fetch reviews on client-side mount if user is logged in
 // This synchronizes 'isHelpful' status which is missed during anonymous server-side fetch
 useEffect(() => {
 if (user && initialReviews.length > 0) {
 const syncHelpfulStatus = async () => {
 try {
 const res = await getTourReviews(tourId, { page: 0, size: reviews.length || 10 })
 if (res.reviews?.content) {
 setReviews(prev => res.reviews.content.map((newReview: any) => {
 const existing = prev.find(p => String(p.id) === String(newReview.id))
 return {
 ...newReview,
 id: String(newReview.id),
 travelerId: String(newReview.travelerId),
 guideReply: newReview.guideReply ? {
 comment: typeof newReview.guideReply === 'string' ? newReview.guideReply : newReview.guideReply.comment,
 createdAt: newReview.guideRepliedAt ?? newReview.createdAt
 } : existing?.guideReply
 }
 }))
 }
 } catch (err) {
 console.error('[ReviewList] Failed to sync helpful status:', err)
 }
 }
 syncHelpfulStatus()
 }
 }, [user?.userId, tourId]) // Re-run if user changes or tour changes

 // Safe date formatting to prevent hydration mismatches
 const [mounted, setMounted] = useState(false)
 useEffect(() => { setMounted(true) }, [])

 const formatDate = (dateStr: string, options: Intl.DateTimeFormatOptions) => {
   if (!mounted) return "" 
   try {
     return new Date(dateStr).toLocaleDateString('en-US', options)
   } catch (e) {
     return ""
   }
 }

 const userRole = user?.role?.toUpperCase()
 const isAdmin = userRole === 'ADMIN'
 const isAuthorized = userRole === 'GUIDE' || isAdmin
 
 // Improved ownership check: match guideProfileId OR userId to the tour's guideId
 const isOwner = isAuthorized && (
 String(user?.guideProfileId || '').trim() === String(tourGuideId || '').trim() || 
 String(user?.userId || '').trim() === String(tourGuideId || '').trim()
 )

 const canReply = isAdmin || isOwner

 // Log for debugging (only in development or for guides/admins)
 useEffect(() => {
 if (isAuthorized) {
 console.log('[ReviewList] Ownership Context:', {
 role: userRole,
 userId: user?.userId,
 guideProfileId: user?.guideProfileId,
 tourGuideId: tourGuideId,
 isOwner,
 isAdmin,
 canReply
 })
 }
 }, [user, tourGuideId, isAuthorized, isOwner, isAdmin, canReply, userRole])

 const handleToggleHelpful = async (reviewId: string) => {
 if (!user) {
 toast.error('Please login to vote')
 return
 }

 if (votingIds.has(reviewId)) return 

 setVotingIds(prev => new Set(prev).add(reviewId))

 try {
 const result = await toggleReviewHelpful(reviewId)
 
 // Sync with backend response (exact count AND new state)
 setReviews(prev => prev.map(r => {
 if (r.id === reviewId) {
 return {
 ...r,
 helpfulCount: result.helpfulCount,
 isHelpful: result.isHelpful
 }
 }
 return r
 }))

 toast.success(result.isHelpful ? 'Marked as helpful' : 'Vote removed')
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Failed to update vote')
 } finally {
 setVotingIds(prev => {
 const next = new Set(prev)
 next.delete(reviewId)
 return next
 })
 }
 }

 const handleReply = async () => {
 if (!replyingTo || !replyContent.trim()) return

 setIsSubmittingReply(true)
 try {
 const result = await replyToReview(replyingTo, replyContent)
 
 setReviews(prev => prev.map(r => {
 if (r.id === replyingTo) {
 return {
 ...r,
 guideReply: {
 comment: result.guideReply as string || replyContent,
 createdAt: result.guideRepliedAt || new Date().toISOString()
 }
 }
 }
 return r
 }))

 setReplyingTo(null)
 setReplyContent('')
 toast.success('Successfully replied to review')
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Failed to submit reply')
 } finally {
 setIsSubmittingReply(false)
 }
 }

 const formatRating = (rating: number) => (rating || 0).toFixed(1)
 
 const renderStars = (rating: number, size = "w-4 h-4") => {
 return [...Array(5)].map((_, i) => {
 const isFull = i < Math.floor(rating);
 const isHalf = i === Math.floor(rating) && rating % 1 >= 0.5;
 
 return (
 <div key={i} className="relative">
 {/* Base Empty Star */}
 <Star className={`${size} text-gray-300 dark:text-gray-700 fill-gray-100 dark:fill-gray-800/50`} />
 
 {/* Overlay Full or Half Star */}
 {isFull && (
 <Star className={`absolute inset-0 ${size} fill-amber-400 text-amber-400`} />
 )}
 {isHalf && (
 <div className="absolute inset-0 overflow-hidden w-[50%]">
 <Star className={`${size} fill-amber-400 text-amber-400`} />
 </div>
 )}
 </div>
 );
 });
 };

 return (
 <section id="reviews" className="py-4">
 <div className="space-y-8">
 {/* Debug Toggle for Admins/Guides */}
 {isAuthorized && (
 <div className="flex justify-end">
 <button 
 onClick={() => setShowDebugIds(!showDebugIds)}
 className="text-[10px] capitalize font-bold tracking-normal text-theme-muted hover:text-primary-light dark:text-primary-dark transition-colors flex items-center gap-1.5 px-3 py-1 rounded-lg border border-theme"
 >
 {showDebugIds ? 'Hide Debug Info' : 'Show Debug Info'}
 </button>
 </div>
 )}

 {/* HEADER & SUMMARY */}
 <div className="flex flex-col md:flex-row gap-10">
 <div className="space-y-4 md:w-48 text-center md:text-left">
 <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark">Traveler Reviews</h2>
 <div className="space-y-1">
 <p className="text-5xl font-bold text-theme-primary">{formatRating(averageRating)}</p>
 <div className="flex items-center justify-center md:justify-start gap-1">
 {renderStars(averageRating)}
 </div>
 <p className="text-sm text-theme-muted ">{totalReviews.toLocaleString()} reviews</p>
 </div>
 </div>

 <div className="flex-1 space-y-2">
 {[5, 4, 3, 2, 1].map((star) => {
 const count = reviewSummary ? (reviewSummary as any)[`${star === 5 ? 'five' : star === 4 ? 'four' : star === 3 ? 'three' : star === 2 ? 'two' : 'one'}Star`] : 0
 const percentage = Math.round((count / totalReviews) * 100) || 0
 return (
 <div key={star} className="flex items-center gap-3">
 <span className="text-xs font-medium text-theme-secondary w-3">{star}</span>
 <div className="flex-1 h-2 surface-section rounded-lg overflow-hidden">
 <div className="h-full bg-amber-400 rounded-lg" style={{ width: `${percentage}%` }} />
 </div>
 <span className="text-xs font-medium text-theme-muted w-8">{percentage}%</span>
 </div>
 )
 })}
 </div>
 </div>

 {/* FILTERS & SORT */}
 <div className="flex items-center justify-between py-4 border-y border-theme relative">
 <div className="relative">
 <button 
 onClick={() => setActiveDropdown(activeDropdown === 'filter' ? null : 'filter')}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-theme text-sm font-bold shadow-sm transition-all hover:shadow-md ${filterRating ? 'bg-primary-light/10 text-primary-light border-primary-light/30' : 'surface-card text-theme-muted '}`}
 >
 <Filter className="w-4 h-4" /> 
 {filterRating ? `${filterRating} Stars` : 'Filter reviews'}
 </button>
 
 <AnimatePresence>
 {activeDropdown === 'filter' && (
 <>
 <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
 <motion.div 
 initial={{ opacity: 0, y: 10 }} 
 animate={{ opacity: 1, y: 0 }} 
 exit={{ opacity: 0, y: 10 }}
 className="absolute top-full left-0 mt-2 w-48 surface-card border border-theme rounded-xl shadow-xl z-20 overflow-hidden"
 >
 <div className="p-2 space-y-1">
 <button onClick={() => { setFilterRating(null); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm rounded-xl hover:surface-section dark:hover:surface-card font-medium translate-colors">All Ratings</button>
 {[5, 4, 3, 2, 1].map(r => (
 <button key={r} onClick={() => { setFilterRating(r); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm rounded-xl hover:surface-section dark:hover:surface-card font-medium translate-colors">{r} Stars Only</button>
 ))}
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>

 <div className="relative">
 <button 
 onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
 className="flex items-center gap-2 px-4 py-2 rounded-lg border border-theme surface-card text-theme-muted text-sm font-bold shadow-sm transition-all hover:shadow-md"
 >
 {sortBy === 'newest' ? 'Most Relevant' : sortBy === 'highest' ? 'Highest Rating' : 'Lowest Rating'} 
 <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'sort' ? 'rotate-180' : ''}`} />
 </button>

 <AnimatePresence>
 {activeDropdown === 'sort' && (
 <>
 <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
 <motion.div 
 initial={{ opacity: 0, y: 10 }} 
 animate={{ opacity: 1, y: 0 }} 
 exit={{ opacity: 0, y: 10 }}
 className="absolute top-full right-0 mt-2 w-48 surface-card border border-theme rounded-xl shadow-xl z-20 overflow-hidden"
 >
 <div className="p-2 space-y-1">
 <button onClick={() => { setSortBy('newest'); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm rounded-xl hover:surface-section dark:hover:surface-card font-medium translate-colors">Most Relevant</button>
 <button onClick={() => { setSortBy('highest'); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm rounded-xl hover:surface-section dark:hover:surface-card font-medium translate-colors">Highest Rating</button>
 <button onClick={() => { setSortBy('lowest'); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm rounded-xl hover:surface-section dark:hover:surface-card font-medium translate-colors">Lowest Rating</button>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>
 </div>

 {isFiltering && (
 <div className="flex items-center justify-center py-10">
 <Loader2 className="w-8 h-8 animate-spin text-primary-light dark:text-primary-dark" />
 </div>
 )}

 {/* REVIEW LIST */}
 <div className="space-y-8">
  {reviews.length === 0 && !isFiltering && (
  <div className="py-12 text-center space-y-4 surface-card rounded-xl border border-dashed border-primary-light/20">
  <div className="w-16 h-16 bg-primary-light/5 rounded-full flex items-center justify-center mx-auto">
  <MessageSquare className="w-8 h-8 text-theme-muted opacity-50" />
  </div>
  <div className="space-y-1">
  <p className="text-lg font-bold text-theme-primary">No reviews yet</p>
  <p className="text-sm text-theme-muted">Be the first to share your experience after taking this tour.</p>
  </div>
  </div>
  )}

  {reviews.map((review) => (
 <div key={review.id} className="space-y-4 relative">
 {/* Debug ID Overlay */}
 {showDebugIds && (
 <div className="absolute -top-2 -right-2 z-20 bg-primary-light text-[9px] text-white px-2 py-0.5 rounded font-mono shadow-xl border border-primary-light dark:border-primary-dark">
 Review ID: {review.id} | Tour Owner ID: {tourGuideId}
 </div>
 )}

 <div className="flex items-start justify-between">
 <Link href={`/travelers/${review.travelerId}`} className="flex items-center gap-3 group">
 <div className="relative w-10 h-10 rounded-lg overflow-hidden surface-section transition-transform group-hover:scale-105">
 {review.travelerAvatarUrl ? (
 <Image src={review.travelerAvatarUrl} alt={review.travelerName} fill className="object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-theme-muted">
 <Star className="w-5 h-5 fill-current" />
 </div>
 )}
 </div>
 <div>
 <div className="flex items-center gap-2">
 <p className="font-bold text-theme-primary group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">{review.travelerName}</p>
 {review.travelerTier && (
 <span className="px-2 py-0.5 bg-primary-light/10 text-primary-light rounded-lg text-[10px] font-bold capitalize tracking-normal border border-primary-light/20">{review.travelerTier}</span>
 )}
 </div>
  <p className="text-xs text-theme-muted ">
  Toured {formatDate(review.tourDate, { month: 'short', year: 'numeric' })}
  </p>
 </div>
 </Link>
 <div className="relative">
 <button 
 onClick={() => setActiveDropdown(activeDropdown === `review-menu-${review.id}` as any ? null : `review-menu-${review.id}` as any)}
 className="p-1 hover:surface-section dark:hover:surface-card rounded-lg transition-colors"
 >
 <MoreVertical className="w-4 h-4 text-theme-muted group-hover:text-theme-secondary dark:hover:text-gray-200" />
 </button>

 <AnimatePresence>
 {activeDropdown === `review-menu-${review.id}` as any && (
 <>
 <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }} 
 animate={{ opacity: 1, scale: 1 }} 
 exit={{ opacity: 0, scale: 0.95 }}
 className="absolute top-full right-0 mt-1 w-32 surface-card border border-theme rounded-xl shadow-xl z-20 overflow-hidden"
 >
 <div className="p-1">
 <button 
 onClick={() => { toast.success('Review reported. Our team will review it.'); setActiveDropdown(null); }} 
 className="w-full text-left px-3 py-2 text-xs font-bold text-danger-red hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
 >
 Report Review
 </button>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <div className="flex items-center gap-0.5">
 {renderStars(review.ratingOverall || 0, "w-3.5 h-3.5")}
 </div>
  <span className="text-sm text-theme-muted whitespace-nowrap">
  {formatDate(review.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
  </span>
 </div>

 <div className="space-y-4">
 <p className="text-sm text-theme-secondary leading-relaxed">{review.comment}</p>
 </div>

 {/* Guide Reply - Bubble Style */}
 {review.guideReply && (
 <div className="ml-10 p-5 surface-section border border-theme rounded-xl rounded-tl-none space-y-2 shadow-sm">
 <div className="flex items-center gap-2">
 <p className="text-[10px] font-bold text-primary-light capitalize tracking-[0.2em]">Guide Response</p>
 <CheckCircle className="w-3" />
 </div>
 <p className="text-sm text-theme-muted leading-relaxed">
"{typeof review.guideReply === 'string' ? review.guideReply : review.guideReply.comment}"
 </p>
 </div>
 )}

 <div className="flex items-center gap-6 pt-2">
 <button 
 onClick={() => handleToggleHelpful(review.id)}
 disabled={votingIds.has(review.id)}
 className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
 review.isHelpful ? 'text-primary-light dark:text-primary-dark' : 'text-theme-muted hover:text-primary-light dark:text-primary-dark'
 } ${votingIds.has(review.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 {votingIds.has(review.id) ? (
 <Loader2 className="w-3.5 h-3.5 animate-spin" />
 ) : (
 <ThumbsUp className={`w-3.5 h-3.5 ${review.isHelpful ? 'fill-current' : ''}`} />
 )}
 Helpful ({review.helpfulCount})
 </button>
 
 {canReply && !review.guideReply && (
 <button 
 onClick={() => setReplyingTo(review.id)}
 className="flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-primary-light dark:text-primary-dark transition-colors"
 >
 <MessageSquare className="w-3.5 h-3.5" /> Reply
 </button>
 )}
 </div>
 </div>
 ))}

 {!isFullPage && totalReviews > reviews.length && (
 <Link href={`/tours/${tourId}/reviews`} className="w-full py-4 block text-center text-sm font-bold capitalize tracking-normal text-theme-primary border border-theme rounded-lg hover:surface-section dark:hover:surface-card transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
 Read all {totalReviews} reviews
 </Link>
 )}
 </div>
 </div>

 <AnimatePresence>
 {replyingTo && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReplyingTo(null)} className="absolute inset-0 bg-black/60 " />
 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg surface-card rounded-xl p-6 shadow-2xl space-y-6">
 <div className="flex items-center justify-between">
 <h3 className="text-xl font-bold text-primary-light dark:text-primary-dark">Reply to {reviews.find(r => r.id === replyingTo)?.travelerName}'s feedback</h3>
 <button onClick={() => setReplyingTo(null)} className="p-2 hover:surface-section dark:hover:surface-card rounded-lg transition-colors"><X className="w-5 h-5 text-theme-muted" /></button>
 </div>
 <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Write your professional response..." rows={5} className="w-full px-4 py-3 surface-section border-0 focus:ring-2 focus:ring-primary-light dark:ring-primary-dark rounded-xl text-theme-primary placeholder:text-theme-muted outline-none resize-none" />
 <div className="flex gap-4">
 <button onClick={() => setReplyingTo(null)} className="flex-1 py-3 text-sm font-bold text-theme-muted hover:surface-section dark:hover:surface-card rounded-lg transition-all border border-theme ">Cancel</button>
 <button onClick={handleReply} disabled={!replyContent.trim() || isSubmittingReply} className="flex-1 py-3 bg-primary-light hover:bg-primary-light-hover disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-all shadow-xl shadow-primary-light/20 flex items-center justify-center gap-2">
 {isSubmittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post Reply
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </section>
 )
}
