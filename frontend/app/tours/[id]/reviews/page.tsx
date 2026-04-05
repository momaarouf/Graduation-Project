// ============================================================================
// DEDICATED REVIEWS PAGE
// ============================================================================
// LOCATION: /frontend/app/tours/[id]/reviews/page.tsx
// 
// PURPOSE: Full-page view for all tour reviews with pagination.
// ============================================================================

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Info } from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import ReviewList from '@/src/components/tour-detail/ReviewList'
import { getPublicTourDetail, getTourReviews } from '@/src/lib/api/tours'
import CinematicBackground from '@/src/components/layout/CinematicBackground'

interface ReviewsPageProps {
    params: Promise<{ id: string }>
}

export default async function TourReviewsPage({ params }: ReviewsPageProps) {
    const { id } = await params

    try {
        // Fetch tour details and all reviews
        const [tour, tourReviews] = await Promise.all([
            getPublicTourDetail(Number(id)).then(res => res.data),
            getTourReviews(id, 0, 100).then(res => res.data) // Page 0, 100 items for now
        ])

        if (!tour) return notFound()

        return (
            <PageLayout>
                <CinematicBackground>
                    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 relative z-10">
                    {/* Header: Back Navigation & Title */}
                    <div className="space-y-6">
                        <Link 
                            href={`/tours/${id}`}
                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl group"
                        >
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Back to {tour.title}
                        </Link>
                        
                        <div className="space-y-2">
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                All Reviews
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Honest feedback from travelers who experienced this tour.
                            </p>
                        </div>
                    </div>

                    {/* Review List - Reusing the component but in full-page mode */}
                    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-3xl p-8 border border-white/20 dark:border-gray-800 shadow-2xl">
                        <ReviewList 
                            reviews={tourReviews.reviews?.content?.map(r => ({
                                ...r,
                                id: String(r.id),
                                travelerId: String(r.travelerId),
                                travelerIsVerified: true,
                                // Standardize guideReply into object shape for UI
                                guideReply: r.guideReply ? {
                                    comment: r.guideReply,
                                    createdAt: r.guideRepliedAt || r.createdAt
                                } : undefined
                            })) || []}
                            averageRating={tourReviews.averageOverall || 0}
                            totalReviews={tourReviews.totalReviews || 0}
                            reviewSummary={tourReviews.distribution}
                            tourGuideId={tour.guideId}
                            tourId={id}
                            isFullPage={true} // Hides the "Read all" button to prevent infinite loops
                        />

                        {/* Pagination Placeholder (Phase 2) */}
                        {tourReviews.reviews?.totalPages > 1 && (
                            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing {tourReviews.reviews.content.length} of {tourReviews.totalReviews} reviews
                                </div>
                                <div className="flex gap-2">
                                    <button disabled className="px-4 py-2 text-sm font-bold text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-800 rounded-xl">
                                        Previous
                                    </button>
                                    <button disabled className="px-4 py-2 text-sm font-bold text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-800 rounded-xl">
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Trust Banner */}
                        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <Info className="w-5 h-5 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-gray-900 dark:text-white">Authentic Feedback</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    All reviews are from verified travelers who have completed this tour. We do not edit or remove negative feedback unless it violates our community guidelines.
                                </p>
                            </div>
                        </div>
                        </div>
                    </div>
                </CinematicBackground>
            </PageLayout>
        )
    } catch (err) {
        console.error('Error loading reviews page:', err)
        return notFound()
    }
}
