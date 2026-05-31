// ============================================================================
// TOUR DETAIL PAGE - CARD 7
// ============================================================================
// LOCATION: /frontend/src/app/tours/[id]/page.tsx
// 
// PURPOSE: Display complete tour information with booking widget
// ============================================================================

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type {ResolvingMetadata } from 'next'
import PageLayout from '@/src/components/layout/PageLayout'
import TourHero from '@/src/components/tour-detail/TourHero'
import TourInfo from '@/src/components/tour-detail/TourInfo'
import TourGuide from '@/src/components/tour-detail/TourGuide'
import SimilarTours from '@/src/components/tour-detail/SimilarTours'
import ReviewSection from '@/src/components/tour-detail/ReviewSection'
import { getPublicTourDetail, getTourRoute } from '@/src/lib/api/tours'
import { Metadata } from 'next'
import { ChevronLeft } from 'lucide-react'
import BookingCardWrapper from '@/src/components/tour-detail/BookingCardWrapper'
import { parseItinerary, parseList } from '@/src/lib/utils/tour-parser'
import { Suspense } from 'react'
import { BookingMode, TourStatus } from '@/src/types/tour-detail.types'

interface PageProps {
 params: Promise<{ id: string }>
 searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  let tour: any = null
  try {
    tour = await getPublicTourDetail(Number(id))
  } catch {
    // If fetch fails, return minimal metadata
  }

  if (!tour) {
    return {
      title: 'Tour | SafariHub',
      description: 'Discover amazing guided tours.',
    }
  }

  const mainImage = tour.media?.[0]?.url || '/images/defaults/tour-hero.jpg'
  const tourUrl = `https://safarihub.com/tours/${id}`

  return {
    title: `${tour.title || 'Tour'} | SafariHub`,
    description: tour.description?.substring(0, 160) || '',
    openGraph: {
      title: tour.title,
      description: tour.description?.substring(0, 160) || '',
      url: tourUrl,
      siteName: 'SafariHub',
      images: [{ url: mainImage, width: 1200, height: 630, alt: tour.title || 'Tour Image' }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tour.title,
      description: tour.description?.substring(0, 160) || '',
      images: [mainImage],
    },
    alternates: { canonical: tourUrl },
  }
}

export default async function TourDetailPage({ params}:PageProps ) {
 const {id} =await params
 
 let tour: any = null
 try {
  // Fetch only the core tour detail first - this is the critical path
  const [tourRes, routeRes] = await Promise.allSettled([
   getPublicTourDetail(Number(id)),
   getTourRoute(Number(id)).catch(() => ({ waypoints: [] }))
  ])

  if (tourRes.status === 'fulfilled') {
   tour = tourRes.value
  }

  if (routeRes.status === 'fulfilled') {
   tour.route = (routeRes.value as any)?.waypoints || []
  }
 } catch (err) {
  console.error(`[Server] Error loading tour detail for ${id}:`, err)
 }

 if (!tour) {
  notFound()
 }

 // Normalizing media for TourHero
 const gallery = (tour.media || []).map((m: any) => ({
  id: m.id.toString(),
  type: (m.mediaType || 'IMAGE').toLowerCase() as 'image' | 'video',
  url: m.url,
  caption: m.caption,
  displayOrder: m.displayOrder || 0
 }))

 const mainImage = gallery[0]?.url || '/images/defaults/tour-hero.jpg'
 const itinerary = parseItinerary(tour.itinerary)
 const normalizedBookingMode = tour.instantBook ? BookingMode.INSTANT : BookingMode.REQUEST
 const normalizedStatus = (tour.status as any) || TourStatus.SCHEDULED
 const tourTags = parseList(tour.tags)
 const tourLanguages = parseList(tour.languages)

 return (
  <PageLayout>
  <div className="relative max-w-7xl mx-auto px-4 pt-1 sm:pt-12 pb-4">
  {/* Navigation Back */}
  <Link
  href="/tours"
  className="inline-flex items-center gap-2 mb-4 group px-0 py-2 bg-transparent text-[10px] font-bold capitalize tracking-normal text-theme-secondary hover:text-primary-light dark:hover:text-primary-dark transition-all"
  >
  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
  Back to all tours
  </Link>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Left Column: Content */}
  <div className="lg:col-span-2 space-y-6">
  {/* HERO SECTION */}
  <div className="surface-card rounded-xl p-4 sm:p-6 shadow-xl border border-theme ">
  <TourHero
  id={tour.id}
  title={tour.title}
  category={tour.category}
  location={tour.locationName || tour.region || ''}
  country={tour.countryCode as any}
  mainImage={mainImage}
  gallery={gallery}
  averageRating={tour.averageRating || 0}
  totalReviews={tour.reviewCount || 0}
  isHalalCertified={tour.halalFriendly}
  bookingMode={normalizedBookingMode}
  status={normalizedStatus}
  isPremium={tour.isPremium}
  isFamilyFriendly={tour.isFamilyFriendly}
  hasGroupDiscount={tour.hasGroupDiscount}
  />
  </div>

  {/* INFO SECTION */}
  <div className="surface-card border border-theme shadow-xl rounded-xl p-6 sm:p-8 ">
  <Suspense fallback={<div className="h-40 animate-pulse surface-section rounded-xl" />}>
  <TourInfo
  description={tour.description}
  itinerary={itinerary}
  inclusions={parseList(tour.inclusions)}
  exclusions={parseList(tour.exclusions)}
  requirements={parseList(tour.requirements)}
  whatToBring={parseList(tour.whatToBring)}
  meetingPoint={{
  name: tour.meetingPointName || '',
  address: tour.meetingPointAddress || '',
  lat: tour.meetingLatitude || undefined,
  lng: tour.meetingLongitude || undefined,
  instructions: tour.meetingPointInstructions || ''
  }}
  safetyMeasures={[]}
  isHalalCertified={tour.halalFriendly}
  tags={tourTags}
  languages={tourLanguages}
  durationHours={tour.durationHours}
  durationMinutes={tour.durationMinutes}
  occurrences={tour.occurrences}
  route={tour.route}
  />
  </Suspense>
  </div>

  {/* GUIDE SECTION */}
  <div className="surface-card border border-theme shadow-xl rounded-xl p-6 sm:p-8 ">
  <Suspense fallback={<div className="h-20 animate-pulse surface-section rounded-xl" />}>
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
  </Suspense>
  </div>

  {/* REVIEWS SECTION - STREAMED */}
  <div className="surface-card border border-theme shadow-xl rounded-xl p-6 sm:p-8 ">
  <Suspense fallback={<div className="h-40 flex items-center justify-center font-bold animate-pulse text-theme-muted">LOADING REVIEWS...</div>}>
  <ReviewSection
  tourId={tour.id}
  tourAverageRating={tour.averageRating || 0}
  tourReviewCount={tour.reviewCount || 0}
  tourGuideId={tour.guideId}
  />
  </Suspense>
  </div>
  </div>

  {/* Right Column: Booking */}
  <div className="lg:col-span-1">
  <div className="sticky top-24">
  <Suspense fallback={<div className="h-96 animate-pulse surface-card rounded-2xl" />}>
  <BookingCardWrapper
  tourId={tour.id.toString()}
  tourTitle={tour.title}
  guideId={tour.guideId.toString()}
  guideName={tour.guideDisplayName}
  basePrice={tour.basePrice}
  currency={tour.currency}
  minCapacity={tour.minCapacity}
  maxCapacity={tour.maxCapacity}
  bookingMode={normalizedBookingMode}
  occurrences={tour.occurrences || []}
  waitlistCount={tour.occurrences?.[0]?.waitlistCount || 0}
  isWaitlistAvailable={true}
  hasGroupDiscount={tour.hasGroupDiscount}
  groupDiscountThreshold={tour.groupDiscountThreshold}
  groupDiscountPercent={tour.groupDiscountPercent}
  activeWaitlistEntries={tour.activeWaitlistEntries || []}
  />
  </Suspense>
  </div>
  </div>
  </div>

  {/* Similar Tours - STREAMED */}
  <div className="mt-8 pt-8 border-t border-[#c8d8f8] dark:border-[#1a3566] ">
  <Suspense fallback={<div className="h-60 flex items-center justify-center font-bold animate-pulse text-theme-muted">FINDING SIMILAR EXPERIENCES...</div>}>
  <SimilarTours
  currentTourId={tour.id.toString()}
  city={tour.locationName as any}
  country={tour.countryCode as any}
  category={tour.category || undefined}
  />
  </Suspense>
  </div>
  </div>
  </PageLayout>
 )
}
