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

import Image from 'next/image'
import {
    Star,
    ThumbsUp,
    MessageSquare,
    ChevronDown,
    Filter,
    CheckCircle,
    MoreVertical
} from 'lucide-react'
import type { ReviewListProps } from '@/src/types/tour-detail.types'

export default function ReviewList({
    reviews,
    averageRating,
    totalReviews,
    reviewSummary
}: ReviewListProps) {

    const formatRating = (rating: number) => rating.toFixed(1)

    return (
        <section id="reviews" className="pt-10 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-8">

                {/* ========================================
            HEADER & SUMMARY
            ======================================== */}
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Summary Score */}
                    <div className="space-y-4 md:w-48 text-center md:text-left">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Traveler Reviews
                        </h2>
                        <div className="space-y-1">
                            <p className="text-5xl font-bold text-gray-900 dark:text-white">
                                {formatRating(averageRating)}
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {totalReviews.toLocaleString()} reviews
                            </p>
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviewSummary ? (reviewSummary as any)[`${star === 5 ? 'five' : star === 4 ? 'four' : star === 3 ? 'three' : star === 2 ? 'two' : 'one'}Star`] : 0
                            const percentage = Math.round((count / totalReviews) * 100) || 0

                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-3">
                                        {star}
                                    </span>
                                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8">
                                        {percentage}%
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ========================================
            FILTERS & SORT (Phase 2 Placeholder)
            ======================================== */}
                <div className="flex items-center justify-between py-4 border-y border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <Filter className="w-4 h-4" />
                            Filter by rating
                        </button>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Most Relevant
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>

                {/* ========================================
            REVIEW LIST
            ======================================== */}
                <div className="space-y-8">
                    {reviews.map((review) => (
                        <div key={review.id} className="space-y-4">
                            {/* Traveler Info */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        {review.travelerAvatar ? (
                                            <Image
                                                src={review.travelerAvatar}
                                                alt={review.travelerName}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Star className="w-5 h-5 fill-current" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                {review.travelerName}
                                            </p>
                                            {review.travelerTier && (
                                                <span className={`
                          px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
                          ${review.travelerTier === 'gold' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}
                        `}>
                                                    {review.travelerTier}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Toured {new Date(review.tourDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Rating & Date */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-400 whitespace-nowrap">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>

                            {/* Comment Content */}
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {review.comment}
                                </p>

                                {/* Attached Images */}
                                {review.images && review.images.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {review.images.map((img, i) => (
                                            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 cursor-zoom-in">
                                                <Image src={img} alt="Review attachment" fill className="object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Guide Reply */}
                            {review.guideReply && (
                                <div className="
                  ml-6 p-4
                  bg-gray-50 dark:bg-gray-800/50
                  border-l-2 border-blue-500
                  rounded-r-2xl
                  space-y-2
                ">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Guide Response
                                        </p>
                                        <CheckCircle className="w-3 h-3 text-blue-500" />
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                        "{review.guideReply.comment}"
                                    </p>
                                </div>
                            )}

                            {/* Review Actions */}
                            <div className="flex items-center gap-6 pt-2">
                                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    Helpful ({review.helpfulCount})
                                </button>
                                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Reply
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Load More Button */}
                    <button className="
            w-full py-4
            text-sm font-bold text-gray-900 dark:text-white
            border border-gray-200 dark:border-gray-800
            rounded-2xl
            hover:bg-gray-50 dark:hover:bg-gray-800
            transition-all
          ">
                        Read all {totalReviews} reviews
                    </button>
                </div>
            </div>
        </section>
    )
}
