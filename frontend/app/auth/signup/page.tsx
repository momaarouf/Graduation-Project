// ============================================================================
// SIGNUP PAGE - PATH SELECTION (CARD 9)
// ============================================================================
// LOCATION: /frontend/src/app/auth/signup/page.tsx
// 
// PURPOSE: Allow users to choose between Traveler and Guide paths
// 
// PHASE 1 (Current - Card 9):
// - Beautiful UI with path selection cards
// - Preview of benefits for each role
// DUAL THEME: Full light/dark mode support
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import {
    Compass,
    Shield,
    Star,
    Users,
    Globe,
    ChevronRight,
    Award,
    Clock,
    CheckCircle
} from 'lucide-react'
import SignupPathSelector from '@/src/components/auth/SignupPathSelector'
import GuideOnboardingPreview from '@/src/components/auth/GuideOnboardingPreview'
import TravelerBenefitsPreview from '@/src/components/auth/TravelerBenefitsPreview'
import AuthFormFooter from '@/src/components/auth/AuthFormFooter'
import SignupLoading from '@/app/auth/signup/loading'

// ============================================================================
// METADATA - SEO
// ============================================================================
// 
// IMPORTANT: Signup pages should be indexable but with caution
// We want travelers to find us, but guide pages are more targeted
// ============================================================================

export const metadata: Metadata = {
    title: 'Join SafariHub | Traveler or Guide - Choose Your Path',
    description: 'Sign up as a traveler to discover authentic halal-friendly tours, or become a verified guide and share your expertise with the world.',
    keywords: ['travel signup', 'become a guide', 'traveler registration', 'halal tourism', 'Lebanon tours', 'Turkey tours'],
    openGraph: {
        title: 'Start Your Journey with SafariHub',
        description: 'Choose your path - explore authentic experiences or share your local expertise.',
        images: [
            {
                url: '/images/og/signup-og.jpg', // Will add in Phase 2
                width: 1200,
                height: 630,
                alt: 'SafariHub Signup - Choose Traveler or Guide'
            }
        ]
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
    }
}

// ============================================================================
// STATISTICS - Social Proof
// ============================================================================
// Displayed above the fold to build trust
// ============================================================================

const STATISTICS = [
    {
        icon: Users,
        value: '15K+',
        label: 'Happy Travelers',
        description: 'Trusted by travelers worldwide'
    },
    {
        icon: Shield,
        value: '1,200+',
        label: 'Verified Guides',
        description: 'Manually ID-verified guides'
    },
    {
        icon: Star,
        value: '4.8/5',
        label: 'Average Rating',
        description: 'From 5,200+ reviews'
    },
    {
        icon: Globe,
        value: '24+',
        label: 'Cities',
        description: 'Across Lebanon & Turkey'
    }
]

// ============================================================================
// MAIN SIGNUP PAGE COMPONENT
// ============================================================================
// 
// LAYOUT STRUCTURE:
// ┌─────────────────────────────────┐
// │ Header (Social Proof Stats)     │
// ├─────────────────────────────────┤
// │ "Choose Your Path" Title        │
// ├─────────────────────────────────┤
// │ Path Selection Cards            │
// │ ┌───────────┐ ┌───────────┐    │
// │ │ Traveler  │ │ Guide     │    │
// │ │ Card      │ │ Card      │    │
// │ └───────────┘ └───────────┘    │
// ├─────────────────────────────────┤
// │ Dynamic Preview Section         │
// │ (Changes based on selection)    │
// ├─────────────────────────────────┤
// │ Footer (Login link, Terms)      │
// └─────────────────────────────────┘
// ============================================================================

export default async function SignupPage() {
    // In Phase 3: Check if user is already logged in
    // const session = await getServerSession()
    // if (session) redirect('/dashboard')

    return (
        <div className="container-safe mx-auto max-w-5xl py-8 sm:py-12 md:py-16">{/*Changed max-w-7xl to max-w-4xl because guide was taking more space causing in cosistend experience */}

            {/* ========================================
            SOCIAL PROOF HEADER - Stats Bar
            ========================================
            Shown above the fold to build immediate trust
            Grid adapts: 2 columns mobile, 4 columns desktop
        */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12 md:mb-16">
                {STATISTICS.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={index}
                            className="group relative p-4 sm:p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-lg"
                        >
                            {/* Icon with dual theme colors */}
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 group-hover:scale-110 transition-transform duration-300">
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </span>
                            </div>

                            {/* Label and description */}
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                                {stat.label}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                {stat.description}
                            </p>

                            {/* Hover tooltip (desktop only) */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden lg:block">
                                <div className="px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded whitespace-nowrap">
                                    {stat.description}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ========================================
            MAIN HEADLINE
            ========================================
            Clear value proposition for both user types
        */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
                {/* Pre-header badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-full text-xs sm:text-sm font-medium shadow-lg shadow-blue-600/20">
                    <Compass className="w-3.5 h-3.5" />
                    <span>JOIN 15K+ TRAVELERS</span>
                </div>

                {/* Main heading */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    Choose Your{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        Path
                    </span>
                </h1>

                {/* Subheading */}
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Whether you're seeking authentic experiences or ready to share your expertise,
                    SafariHub is your gateway to halal-friendly travel.
                </p>
            </div>

            {/* ========================================
            PATH SELECTION CARDS (Client Component)
            ========================================
            Suspense boundary for loading state
        */}
            <Suspense fallback={<SignupLoading />}>
                <SignupPathSelector />
            </Suspense>

            {/* ========================================
            TRUST BADGES - Security & Privacy
            ========================================
            Reinforce trust signals at decision point
        */}
            <div className="mt-10 sm:mt-12 md:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>100% free to join</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Your data is protected</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Cancel anytime</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Verified community</span>
                </span>
            </div>

            {/* ========================================
            FAQ TEASER - Reduce friction
            ========================================
            Address common concerns before they arise
        */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            For Travelers
                        </p>
                        <Link href="/faq/travelers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                            How do I book a tour?
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            For Guides
                        </p>
                        <Link href="/faq/guides" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                            How does verification work?
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Payments
                        </p>
                        <Link href="/faq/payments" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                            When do guides get paid?
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Safety
                        </p>
                        <Link href="/faq/safety" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                            How are guides verified?
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ========================================
            SCHEMA MARKUP - SEO
            ========================================
            Helps search engines understand the page
        */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'AboutPage',
                        'name': 'SafariHub Signup',
                        'description': 'Join SafariHub as a traveler or guide',
                        'provider': {
                            '@type': 'Organization',
                            'name': 'SafariHub',
                            'sameAs': 'https://safaribub.com'
                        },
                        'potentialAction': {
                            '@type': 'JoinAction',
                            'target': 'https://safaribub.com/auth/signup'
                        }
                    })
                }}
            />
        </div>
    )
}

// ============================================================================
// REVALIDATION STRATEGY
// ============================================================================
//
// This page is static - no data fetching needed in Phase 1
// In Phase 3, we'll add:
//
// export const revalidate = 3600 // Revalidate every hour
//
// This ensures session checks are fresh without rebuilding
// ============================================================================