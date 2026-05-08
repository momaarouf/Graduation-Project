// ============================================================================
// REVIEW SECTION - STREAMED SERVER COMPONENT
// ============================================================================
// LOCATION: /frontend/src/components/tour-detail/ReviewSection.tsx
// 
// PURPOSE: Fetches and displays reviews for a tour
// 
// FEATURES:
// 1. Decoupled from main page fetch for streaming
// 2. Consistent mapping between backend response and ReviewList UI
// ============================================================================

import { getTourReviews } from '@/src/lib/api/tours'
import ReviewList from './ReviewList'

interface ReviewSectionProps {
  tourId: string | number
  tourAverageRating: number
  tourReviewCount: number
  tourGuideId: number
}

export default async function ReviewSection({
  tourId,
  tourAverageRating,
  tourReviewCount,
  tourGuideId
}: ReviewSectionProps) {
  let reviewSummary: any = null

  try {
    reviewSummary = await getTourReviews(tourId, { page: 0, size: 10 })
  } catch (err) {
    console.error(`[ReviewSection] Error loading reviews for ${tourId}:`, err)
  }

  return (
    <ReviewList
      reviews={(reviewSummary?.reviews?.content || []).map((r: any) => ({
        ...r,
        id: String(r.id),
        travelerId: String(r.travelerId),
        guideReply: r.guideReply ? { 
          comment: typeof r.guideReply === 'string' ? r.guideReply : r.guideReply.comment, 
          createdAt: r.guideRepliedAt ?? r.createdAt 
        } : undefined,
      }))}
      averageRating={reviewSummary?.averageOverall ?? tourAverageRating}
      totalReviews={reviewSummary?.totalReviews ?? tourReviewCount}
      reviewSummary={reviewSummary?.distribution}
      tourGuideId={tourGuideId}
      tourId={tourId.toString()}
    />
  )
}
