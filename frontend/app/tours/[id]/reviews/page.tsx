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
 getPublicTourDetail(Number(id)),
 getTourReviews(id, { page: 0, size: 100 }) // Page 0, 100 items for now
 ])

 if (!tour) return notFound()

 return (
 <PageLayout>
 
 <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 relative z-10">
 {/* Header: Back Navigation & Title */}
 <div className="space-y-6">
 <Link 
 href={`/tours/${id}`}
 className="inline-flex items-center gap-2 text-sm font-bold text-primary-light dark:text-primary-dark hover:text-blue-700 transition-colors bg-primary-light/10 px-4 py-2 rounded-xl group"
 >
 <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
 Back to {tour.title}
 </Link>
 
 <div className="space-y-2">
 <h1 className="text-4xl font-extrabold text-theme-primary tracking-tight">
 All Reviews
 </h1>
 <p className="text-theme-muted ">
 Honest feedback from travelers who experienced this tour.
 </p>
 </div>
 </div>

 {/* Review List - Reusing the component but in full-page mode */}
 <div className="surface-card  rounded-3xl p-8 border border-white/20 shadow-2xl">
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
 isFullPage={true} // Hides the"Read all" button to prevent infinite loops
 />

 {/* Pagination Placeholder (Phase 2) */}
 {tourReviews.reviews?.totalPages > 1 && (
 <div className="mt-12 pt-8 border-t border-[#c8d8f8] dark:border-[#1a3566] flex items-center justify-between">
 <div className="text-sm text-theme-muted ">
 Showing {tourReviews.reviews.content.length} of {tourReviews.totalReviews} reviews
 </div>
 <div className="flex gap-2">
 <button disabled className="px-4 py-2 text-sm font-bold text-theme-muted cursor-not-allowed border border-theme rounded-xl">
 Previous
 </button>
 <button disabled className="px-4 py-2 text-sm font-bold text-theme-muted cursor-not-allowed border border-theme rounded-xl">
 Next
 </button>
 </div>
 </div>
 )}
 
 {/* Trust Banner */}
 <div className="mt-12 p-6 bg-primary-light/10 rounded-2xl flex items-start gap-4">
 <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center shrink-0">
 <Info className="w-5 h-5 text-white" />
 </div>
 <div className="space-y-1">
 <h4 className="font-bold text-theme-primary">Authentic Feedback</h4>
 <p className="text-sm text-theme-secondary ">
 All reviews are from verified travelers who have completed this tour. We do not edit or remove negative feedback unless it violates our community guidelines.
 </p>
 </div>
 </div>
 </div>
 </div>
 
 </PageLayout>
 )
 } catch (err) {
 console.error('Error loading reviews page:', err)
 return notFound()
 }
}
