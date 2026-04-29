'use client'

// ============================================================================
// GUIDE REVIEWS COMPONENT — WIRED TO REAL BACKEND
// ============================================================================
// LOCATION: /frontend/src/components/guides/GuideReviews.tsx
//
// PURPOSE: Display real reviews for a guide fetched from the backend.
// Previously rendered MOCK_REVIEWS hardcoded data.
// Now calls: GET /api/reviews/guide/{guideId}?page=0&size=10
// Public endpoint — no auth required.
//
// Shows:
// - Loading spinner while fetching
// - Empty state when the guide has no reviews yet
// - Real review cards with traveler name, rating, comment, date
// - Average overall rating summary at the top
// ============================================================================

import { useState, useEffect } from 'react'
import { Star, User, Loader2 } from 'lucide-react'
import Image from 'next/image'
import apiClient from '@/src/lib/api/client'
import type { ReviewResponse, ReviewSummaryResponse } from '@/src/lib/types/tour.types'

// Props: guideId is the GuideProfile.id from the public guide profile page
export default function GuideReviews({ guideId }: { guideId: string }) {

 // Holds the full summary response (averages + distribution + review page)
 const [summary, setSummary] = useState<ReviewSummaryResponse | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState(false)

 useEffect(() => {
 // Fetch reviews for this guide from the public backend endpoint.
 // No auth token needed — this is a public endpoint.
 const fetchReviews = async () => {
 setIsLoading(true)
 setError(false)
 try {
 const res = await apiClient.get<ReviewSummaryResponse>(
 `/api/reviews/guide/${guideId}`,
 { params: { page: 0, size: 10 } }
 )
 setSummary(res.data)
 } catch (err) {
 // Non-critical failure — show empty state rather than crashing the page
 console.error('Failed to load guide reviews:', err)
 setError(true)
 } finally {
 setIsLoading(false)
 }
 }

 if (guideId) {
 fetchReviews()
 }
 }, [guideId])

 // ── Loading state ─────────────────────────────────────────────────────────
 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-12">
 <Loader2 className="w-6 h-6 animate-spin text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 </div>
 )
 }

 // ── Error or no data ──────────────────────────────────────────────────────
 if (error || !summary || summary.totalReviews === 0) {
 return (
 <div className="text-center py-12 text-theme-muted ">
 <Star className="w-8 h-8 mx-auto mb-3 text-gray-300 " />
 <p className="text-sm">No reviews yet for this guide.</p>
 </div>
 )
 }

 const reviews: ReviewResponse[] = summary.reviews.content

 return (
 <div className="space-y-4">

 {/* Average rating summary — shown above the review list */}
 {summary.averageOverall !== null && (
 <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl">
 <div className="text-3xl font-bold text-theme-primary">
 {summary.averageOverall.toFixed(1)}
 </div>
 <div>
 {/* Render filled stars based on rounded average */}
 <div className="flex items-center gap-0.5 mb-0.5">
 {[...Array(5)].map((_, i) => (
 <Star
 key={i}
 className={`w-4 h-4 ${
 i < Math.round(summary.averageOverall ?? 0)
 ? 'fill-amber-400 text-amber-400'
 : 'text-gray-300 '
 }`}
 />
 ))}
 </div>
 {/* Show total review count below stars */}
 <p className="text-xs text-theme-muted ">
 {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
 </p>
 </div>
 </div>
 )}

 {/* Individual review cards — same UI as before, now real data */}
 {reviews.map((review) => (
 <div
 key={review.id}
 className="surface-card border border-theme rounded-xl p-5"
 >
 <div className="flex items-start gap-3 mb-3">

 {/* Traveler avatar — falls back to User icon if no avatar URL */}
 <div className="w-10 h-10 rounded-full surface-section overflow-hidden flex-shrink-0">
 {review.travelerAvatarUrl ? (
 <Image
 src={review.travelerAvatarUrl}
 alt={review.travelerName}
 width={40}
 height={40}
 className="object-cover"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <User className="w-5 h-5 text-theme-muted" />
 </div>
 )}
 </div>

 <div className="flex-1">
 {/* Traveler name and review date */}
 <div className="flex items-center justify-between">
 <h4 className="font-semibold text-theme-primary">
 {review.travelerName}
 </h4>
 <span className="text-xs text-theme-muted ">
 {/* Format createdAt as relative-friendly date */}
 {new Date(review.createdAt).toLocaleDateString('en-US', {
 month: 'short', day: 'numeric', year: 'numeric'
 })}
 </span>
 </div>

 {/* Tour title this review is for */}
 <p className="text-xs text-theme-muted mb-1">
 {review.tourTitle}
 </p>

 {/* Overall star rating — the headline number */}
 <div className="flex items-center gap-1 mb-2">
 {[...Array(5)].map((_, i) => (
 <Star
 key={i}
 className={`w-3 h-3 ${
 i < review.ratingOverall
 ? 'fill-amber-400 text-amber-400'
 : 'text-gray-300 '
 }`}
 />
 ))}
 </div>

 {/* Review comment — only shown when the traveler left written feedback */}
 {review.comment && (
 <p className="text-sm text-theme-secondary ">
 {review.comment}
 </p>
 )}

 {/* Guide reply — shown when the guide has responded (future feature) */}
 {review.guideReply && (
 <div className="mt-3 ml-2 pl-3 border-l-2 border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark">
 <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
 Guide Response
 </p>
 <p className="text-xs text-theme-secondary italic">
 {review.guideReply}
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 )
}