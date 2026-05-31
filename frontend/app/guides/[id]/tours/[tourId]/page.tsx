// ============================================================================
// PORTFOLIO TOUR DETAIL - PUBLIC SIGNATURE EXPERIENCE VIEW
// ============================================================================
// LOCATION: /frontend/app/guides/[id]/tours/[tourId]/page.tsx
// 
// PURPOSE: Display a detailed"Signature Experience" of a specific tour in a guide's portfolio
// using the same visual language as the public tour details page, without booking logic.
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import PageLayout from '@/src/components/layout/PageLayout'
import LoadingOverlay from '@/src/components/ui/LoadingOverlay'
import { getPortfolioTourDetail } from '@/src/lib/api/tours'
import { GuidePortfolioTourDetailResponse } from '@/src/lib/types/tour.types'
import { parseItinerary, parseList } from '@/src/lib/utils/tour-parser'

// Shared UI Components from public tour detail
import TourHero from '@/src/components/tour-detail/TourHero'
import TourInfo from '@/src/components/tour-detail/TourInfo'
import TourGuide from '@/src/components/tour-detail/TourGuide'
import ReviewSection from '@/src/components/tour-detail/ReviewSection'
import { BookingMode, TourStatus } from '@/src/types/tour-detail.types'

export default function PortfolioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rawGuideId = params.id as string
  const rawTourId = params.tourId as string
  const guideId = parseInt(rawGuideId)
  const tourId = parseInt(rawTourId)
  const isInvalid = isNaN(guideId) || isNaN(tourId)

  const [tour, setTour] = useState<GuidePortfolioTourDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (isInvalid) {
        setError(true)
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const res = await getPortfolioTourDetail(guideId, tourId)
        setTour(res)
      } catch (err) {
        console.error('Failed to load portfolio detail:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [guideId, tourId])

  if (loading) return <LoadingOverlay isVisible={true} message="Opening signature experience..." />

  if (error || !tour) {
    return (
      <PageLayout>
        <div className="pt-20 pb-20 text-center container-safe">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-theme-primary mb-2">Tour History Not Found</h1>
            <p className="text-theme-muted mb-8">
              We couldn't retrieve the details for this specific portfolio item.
            </p>
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-light text-white font-semibold rounded-xl hover:bg-primary-light-hover transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Parse structured data
  const itinerary = parseItinerary(tour.itinerary)
  const inclusions = parseList(tour.inclusions)
  const exclusions = parseList(tour.exclusions)
  const requirements = parseList(tour.requirements)
  const whatToBring = parseList(tour.whatToBring)
  const tourTags = parseList(tour.tags)
  const tourLanguages = parseList(tour.languages)

  const gallery = (tour.media || []).map((m: any) => ({
    id: m.id.toString(),
    type: (m.mediaType || 'IMAGE').toLowerCase() as 'image' | 'video',
    url: m.url,
    caption: m.caption,
    displayOrder: m.displayOrder || 0
  }))

  const mainImage = gallery[0]?.url || '/images/defaults/tour-hero.jpg'
  const normalizedBookingMode = tour.instantBook ? BookingMode.INSTANT : BookingMode.REQUEST
  const normalizedStatus = (tour.status as any) || TourStatus.SCHEDULED

  return (
    <PageLayout>
      <div className="relative max-w-5xl mx-auto px-4 pt-1 sm:pt-12 pb-12">
        {/* Navigation Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-4 group px-0 py-2 bg-transparent text-[10px] font-bold capitalize tracking-normal text-theme-secondary hover:text-primary-light dark:hover:text-primary-dark transition-all"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Go Back
        </button>

        <div className="space-y-6">
          {/* HERO SECTION */}
          <div className="surface-card rounded-xl p-4 sm:p-6 shadow-xl border border-theme">
            <TourHero
              id={tour.id}
              title={tour.title}
              category={tour.category || undefined}
              location={tour.locationName || tour.region || ''}
              country={tour.countryCode as any}
              mainImage={mainImage}
              gallery={gallery}
              averageRating={tour.averageRating || 0}
              totalReviews={tour.reviewCount || 0}
              isHalalCertified={tour.halalFriendly}
              bookingMode={normalizedBookingMode}
              status={normalizedStatus}
            />
          </div>

          {/* INFO SECTION */}
          <div className="surface-card border border-theme shadow-xl rounded-xl p-6 sm:p-8">
            <TourInfo
              description={tour.description}
              itinerary={itinerary}
              inclusions={inclusions}
              exclusions={exclusions}
              requirements={requirements}
              whatToBring={whatToBring}
              meetingPoint={{
                name: tour.meetingPointName || '',
                address: tour.meetingPointAddress || '',
                instructions: tour.meetingPointInstructions || ''
              }}
              safetyMeasures={[]}
              isHalalCertified={tour.halalFriendly}
              tags={tourTags}
              languages={tourLanguages}
              durationHours={tour.durationHours}
              durationMinutes={tour.durationMinutes}
              occurrences={[]}
              route={[]}
            />
          </div>

          {/* GUIDE SECTION */}
          <div className="surface-card border border-theme shadow-xl rounded-xl p-6 sm:p-8">
            <TourGuide
              guide={{
                id: tour.guideId.toString(),
                displayName: tour.guideDisplayName,
                verified: tour.guideVerified,
                avatar: tour.guideAvatarUrl || '/images/defaults/avatar.jpg',
                averageRating: tour.averageRating || 5.0,
                totalReviews: tour.reviewCount || 0,
                languages: tourLanguages
              }}
              tourId={tour.id}
              tourTitle={tour.title}
            />
          </div>

          {/* REVIEWS SECTION */}
          {(tour.reviewCount || 0) > 0 && (
            <div className="surface-card border border-theme shadow-xl rounded-xl p-6 sm:p-8">
              <ReviewSection
                tourId={tour.id}
                tourAverageRating={tour.averageRating || 0}
                tourReviewCount={tour.reviewCount || 0}
                tourGuideId={tour.guideId}
              />
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
