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
import type {ResolvingMetadata } from 'next'
import PageLayout from '@/src/components/layout/PageLayout'
import TourHero from '@/src/components/tour-detail/TourHero'
import TourInfo from '@/src/components/tour-detail/TourInfo'
import TourGuide from '@/src/components/tour-detail/TourGuide'
import BookingCard from '@/src/components/tour-detail/BookingCard'
import ReviewList from '@/src/components/tour-detail/ReviewList'
import SimilarTours from '@/src/components/tour-detail/SimilarTours'
import { MOCK_TOUR_DETAIL, MOCK_REVIEWS } from '@/src/types/tour-detail.types'
import { getTourById } from '@/src/lib/api/tours'
import { Metadata } from 'next'
import BookingCardWrapper from '@/src/components/tour-detail/BookingCardWrapper'
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
    const tour = MOCK_TOUR_DETAIL // In Phase 2: await getTourById(id)

    if (!tour) {
        return {
            title: 'Tour Not Found',
            description: 'The requested tour could not be found.'
        }
    }

    const previousImages = (await parent).openGraph?.images || []
    const tourUrl = `https://safaribub.com/tours/${id}`

    return {
        title: `${tour.title} | SafariHub`,
        description: tour.description.substring(0, 160),
        keywords: [
            tour.location,
            tour.country,
            'halal tour',
            'muslim friendly',
            'guided tour',
            'travel',
            ...tour.itinerary.map(stop => stop.title).slice(0, 5)
        ].join(', '),

        openGraph: {
            title: tour.title,
            description: tour.description.substring(0, 160),
            url: tourUrl,
            siteName: 'SafariHub',
            images: [
                {
                    url: tour.mainImage,
                    width: 1200,
                    height: 630,
                    alt: tour.title
                },
                ...previousImages
            ],
            locale: 'en_US',
            type: 'website',
        },

        twitter: {
            card: 'summary_large_image',
            title: tour.title,
            description: tour.description.substring(0, 160),
            images: [tour.mainImage],
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
    const tour = await getTourById({id})// await only once

    // In Phase 2: fetch tour data from API
    // const tour = await getTourById(id)
    // const reviews = await getTourReviews(id)
    // const similarTours = await getSimilarTours(id)

    
    const reviews = MOCK_REVIEWS

    if (!tour) {
        notFound()
    }

    return (
        <PageLayout>
            {/* 
        ========================================
        PAGE OFFSET - SINGLE SOURCE OF TRUTH
        ========================================
        
        pt-14/sm:pt-16: Offsets fixed navbar
        This matches the Tours page pattern
      */}
            <div className="pt-14 sm:pt-16">

                {/* 
          ========================================
          MAIN CONTENT WRAPPER
          ========================================
          
          Container-safe: Responsive padding
          mx-auto: Center content
          max-w-7xl: Maximum width for large screens
        */}
                <div className="container-safe mx-auto max-w-7xl">

                    {/* 
            ========================================
            LAYOUT: 2-COLUMN GRID
            ========================================
            
            DESKTOP:
            ┌─────────────────┬─────────────┐
            │ Hero            │             │
            ├─────────────────┤  Booking    │
            │ Info           │    Card     │
            ├─────────────────┤             │
            │ Guide Profile  │             │
            ├─────────────────┴─────────────┤
            │ Reviews                      │
            ├───────────────────────────────┤
            │ Similar Tours               │
            └───────────────────────────────┘
            
            MOBILE:
            ┌─────────────────┐
            │ Hero           │
            ├─────────────────┤
            │ Booking Card   │ ← Sticky on mobile
            ├─────────────────┤
            │ Info           │
            ├─────────────────┤
            │ Guide Profile  │
            ├─────────────────┤
            │ Reviews        │
            ├─────────────────┤
            │ Similar Tours  │
            └─────────────────┘
          */}
                    <div className=" grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 py-6 lg:py-8 ">

                        {/* ========================================
               LEFT COLUMN - MAIN CONTENT
               ========================================
               lg:col-span-2: Takes 2/3 on desktop
               Full width on mobile
            */}
                        <div className="lg:col-span-2 space-y-6 lg:space-y-8">

                            {/* Hero Section - Gallery, Title, Quick Info */}
                            <TourHero
                                title={tour.title}
                                location={tour.location}
                                country={tour.country}
                                mainImage={tour.mainImage}
                                gallery={tour.gallery}
                                averageRating={tour.averageRating}
                                totalReviews={tour.totalReviews}
                                isHalalCertified={tour.isHalalCertified}
                                bookingMode={tour.bookingMode}
                                status={tour.status}
                            />

                            {/* Tour Information - Description, Itinerary, Inclusions */}
                            <TourInfo
                                description={tour.description}
                                itinerary={tour.itinerary}
                                inclusions={tour.inclusions}
                                exclusions={tour.exclusions}
                                requirements={tour.requirements}
                                whatToBring={tour.whatToBring}
                                meetingPoint={tour.meetingPoint}
                                safetyMeasures={tour.safetyMeasures}
                                isHalalCertified={tour.isHalalCertified}
                                halalCertificationDetails={tour.halalCertificationDetails}
                            />

                            {/* Guide Profile - Bio, Languages, Stats, Badges */}
                            <TourGuide guide={tour.guide} />

                            {/* Reviews - List, Summary, Rating Distribution */}
                            <ReviewList
                                reviews={reviews}
                                averageRating={tour.averageRating}
                                totalReviews={tour.totalReviews}
                                reviewSummary={tour.reviewSummary}
                            />
                        </div>

                        {/* ========================================
               RIGHT COLUMN - BOOKING WIDGET
               ========================================
               lg:col-span-1: Takes 1/3 on desktop
               Sticky on desktop, hidden on mobile
            */}
                        <div className="lg:col-span-1">
                            <div className="lg:sticky lg:top-24 space-y-6">
                                <BookingCardWrapper tour={tour} />{/*Client component with handlers */}
                                
                            </div>
                        </div>

                        {/* ========================================
               SIMILAR TOURS - FULL WIDTH
               ========================================
               Spans full width below the 2-column layout
            */}
                        <div className="col-span-1 lg:col-span-3 mt-6 lg:mt-8">
                            <SimilarTours
                                currentTourId={tour.id}
                                city={tour.city}
                                country={tour.country}
                                limit={4}
                            />
                        </div>
                    </div>
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