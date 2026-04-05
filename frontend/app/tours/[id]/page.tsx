// ============================================================================
// TOUR DETAIL PAGE - CARD 7
// ============================================================================
// LOCATION: /frontend/src/app/tours/[id]/page.tsx
// 
// PURPOSE: Display complete tour information with booking widget
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Visual itinerary with map points (future)
// ✓ Guide portfolio with verification badge
// ✓ Halal certification info
// ✓ Dynamic pricing breakdown
// ✓ Group discount display
// ✓ Waitlist indication
// ✓ Review system with guide replies
// 
// COLOR PSYCHOLOGY:
// - Blue: Trust (Verified, Secure booking)
// - Green: Success (Halal certified, Available)
// - Orange: Action (Book now, CTA)
// - Gold: Premium (Loyalty tier, Top rated)
// - Red: Alert (Limited spots, Waitlist)
// 
// SEO STRATEGY:
// - Dynamic metadata generation
// - Semantic HTML5
// - Schema.org markup
// - Open Graph tags
// ============================================================================

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type {ResolvingMetadata } from 'next'
import PageLayout from '@/src/components/layout/PageLayout'
import TourHero from '@/src/components/tour-detail/TourHero'
import TourInfo from '@/src/components/tour-detail/TourInfo'
import TourGuide from '@/src/components/tour-detail/TourGuide'
import BookingCard from '@/src/components/tour-detail/BookingCard'
import ReviewList from '@/src/components/tour-detail/ReviewList'
import SimilarTours from '@/src/components/tour-detail/SimilarTours'
import { MOCK_TOUR_DETAIL, MOCK_REVIEWS, BookingMode, TourStatus } from '@/src/types/tour-detail.types'
import { getPublicTourDetail, getTourReviews } from '@/src/lib/api/tours'
import { Metadata } from 'next'
import { ChevronLeft } from 'lucide-react'
import BookingCardWrapper from '@/src/components/tour-detail/BookingCardWrapper'
import CinematicBackground from '@/src/components/layout/CinematicBackground'
import { parseItinerary, parseList } from '@/src/lib/utils/tour-parser'
import { Suspense } from 'react'
// ============================================================================
// DYNAMIC METADATA - SEO CRITICAL
// ============================================================================
// 
// Generates page-specific metadata for:
// - Search engines (title, description, keywords)
// - Social sharing (Open Graph)
// - Twitter cards
// - Canonical URLs
// ============================================================================

interface PageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { params }: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // In Phase 2: fetch tour data from API
    // For Phase 1: use mock data
    const { id } = await params
    const res = await getPublicTourDetail(Number(id))
    const tour = res.data

    if (!tour) {
        return {
            title: 'Tour Not Found',
            description: 'The requested tour could not be found.'
        }
    }

    const previousImages = (await parent).openGraph?.images || []
    const tourUrl = `https://safaribub.com/tours/${id}`
    const itinerary = parseItinerary(tour.itinerary)
    const mainImage = tour.media?.[0]?.url || '/images/defaults/tour-hero.jpg'

    return {
        title: `${tour.title || 'Tour'} | SafariHub`,
        description: tour.description?.substring(0, 160) || '',
        keywords: [
            tour.locationName || '',
            tour.region || '',
            tour.countryCode || '',
            'halal tour',
            'muslim friendly',
            'guided tour',
            'travel',
            ...(itinerary || []).map((stop: any) => stop.title).slice(0, 5)
        ].join(', '),

        openGraph: {
            title: tour.title,
            description: tour.description?.substring(0, 160) || '',
            url: tourUrl,
            siteName: 'SafariHub',
            images: [
                {
                    url: mainImage,
                    width: 1200,
                    height: 630,
                    alt: tour.title || 'Tour Image'
                },
                ...previousImages
            ],
            locale: 'en_US',
            type: 'website',
        },

        twitter: {
            card: 'summary_large_image',
            title: tour.title,
            description: tour.description?.substring(0, 160) || '',
            images: [mainImage],
        },

        alternates: {
            canonical: tourUrl,
        },

        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    }
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function TourDetailPage({ params}:PageProps ) {
    const {id} =await params
    // Parallel fetch for tour data and reviews for maximum throughput
    let tour: any = null
    let reviewSummary: any = null

    try {
        const [tourRes, reviewsRes] = await Promise.allSettled([
            getPublicTourDetail(Number(id)),
            // Reusing getTourReviews instead of raw axios for consistency
            getTourReviews(id, 0, 10).catch(() => ({ data: null }))
        ])

        if (tourRes.status === 'fulfilled') {
            tour = tourRes.value.data
        }

        if (reviewsRes.status === 'fulfilled') {
            reviewSummary = (reviewsRes.value as any).data
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
            <div className="max-w-7xl mx-auto px-4 pt-20 sm:pt-28 pb-8">
                {/* Navigation Back */}
                <Link
                    href="/tours"
                    className="inline-flex items-center gap-2 mb-8 group text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to all tours
                </Link>

                <Suspense fallback={<div className="h-96 flex items-center justify-center font-black animate-pulse text-gray-400">LOADING TOUR...</div>}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <TourHero
                            id={tour.id}
                            title={tour.title}
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
                        />

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
                        />

                        <ReviewList
                            reviews={reviewSummary?.reviews.content.map((r: any) => ({
                              // Map backend ReviewResponse to standardized ReviewDetail
                              ...r,
                              id: String(r.id),
                              travelerId: String(r.travelerId),
                              // Ensure guideReply is handled consistently if it's a string from backend
                              guideReply: r.guideReply ? { 
                                comment: r.guideReply, 
                                createdAt: r.guideRepliedAt ?? r.createdAt 
                              } : undefined,
                            })) ?? []}
                            averageRating={reviewSummary?.averageOverall ?? tour.averageRating ?? 0}
                            totalReviews={reviewSummary?.totalReviews ?? tour.reviewCount ?? 0}
                            reviewSummary={reviewSummary?.distribution}
                            tourGuideId={tour.guideId}
                            tourId={id}
                        />
                    </div>

                    {/* Right Column: Booking */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <BookingCardWrapper
                                tourId={tour.id.toString()}
                                basePrice={tour.basePrice}
                                currency={tour.currency}
                                minCapacity={tour.minCapacity}
                                maxCapacity={tour.maxCapacity}
                                bookingMode={normalizedBookingMode}
                                occurrences={tour.occurrences || []}
                                waitlistCount={tour.occurrences?.[0]?.waitlistCount || 0}
                                isWaitlistAvailable={true} // Allow waitlist whenever a specific occurrence cannot accommodate the group
                                hasGroupDiscount={tour.hasGroupDiscount}
                                groupDiscountThreshold={tour.groupDiscountThreshold}
                                groupDiscountPercent={tour.groupDiscountPercent}
                                activeBookingId={tour.activeBookings?.[0]?.id}
                                activeBookingOccurrenceId={tour.activeBookings?.[0]?.occurrenceId}
                                activeBookingPeopleCount={tour.activeBookings?.[0]?.peopleCount}
                            />
                        </div>
                    </div>
                </div>
                </Suspense>

                {/* Similar Tours */}
                <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-900">
                    <SimilarTours
                        currentTourId={tour.id.toString()}
                        city={tour.locationName as any}
                        country={tour.countryCode as any}
                        category={tour.category || undefined}
                    />
                </div>
            </div>
        </PageLayout>
    )
}

// ============================================================================
// LOADING STATE (Optional)
// ============================================================================
//
// Next.js 15+ supports loading.tsx in the same folder
// Create /frontend/src/app/tours/[id]/loading.tsx for skeleton
// ============================================================================

// ============================================================================
// ERROR STATE (Optional)
// ============================================================================
//
// Create /frontend/src/app/tours/[id]/error.tsx for error boundary
// ============================================================================

// ============================================================================
// NOT FOUND STATE (Optional)
// ============================================================================
//
// Create /frontend/src/app/tours/[id]/not-found.tsx for 404
// ============================================================================