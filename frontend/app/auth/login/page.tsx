// ============================================================================
// LOGIN PAGE - COMPLETE (WITH BACK BUTTON)
// ============================================================================
// LOCATION: /frontend/src/app/auth/login/page.tsx
// 
// PURPOSE: User authentication with email/password
// 
// FEATURES:
// ✓ Email/password login with validation
// ✓ "Remember me" functionality
// ✓ Links to signup & password reset
// ✓ Social login placeholders
// ✓ Form validation with real-time feedback
// ✓ Error handling
// ✓ Loading states
// ✓ Back button (now in page, not layout)
// ✓ Dual theme support
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { 
    Mail, 
    Lock, 
    Shield, 
    Chrome, 
    Apple, 
    Github,
    ChevronLeft,
    Sparkles
} from 'lucide-react'
import LoginForm from '@/src/components/auth/LoginForm'
import AuthLayout from '@/app/auth/layout'
import LoginLoading from './loading'

// ============================================================================
// METADATA - SEO
// ============================================================================

export const metadata: Metadata = {
    title: 'Sign In | SafariHub - Travel Marketplace',
    description: 'Sign in to your SafariHub account to manage bookings, messages, and more.',
    robots: {
        index: false, // Don't index auth pages
        follow: false,
    },
    openGraph: {
        title: 'Sign In to SafariHub',
        description: 'Access your travel account',
        images: ['/images/og/auth-og.jpg'],
    }
}

// ============================================================================
// STATISTICS - Social Proof
// ============================================================================

const STATISTICS = [
    { label: 'Happy Travelers', value: '15K+' },
    { label: 'Verified Guides', value: '1,200+' },
    { label: 'Cities', value: '24+' },
    { label: '5-Star Reviews', value: '4.8/5' }
]

// ============================================================================
// TESTIMONIALS - Social Proof
// ============================================================================

const TESTIMONIALS = [
    {
        quote: "SafariHub made our family trip to Turkey unforgettable. The verified guides gave us peace of mind.",
        author: "Ahmed Khan",
        role: "Traveler, Gold Tier",
        initials: "AK"
    },
    {
        quote: "As a guide, the platform's halal-friendly focus helped me connect with the perfect travelers.",
        author: "Mehmet Yilmaz",
        role: "Guide, Platinum Tier",
        initials: "MY"
    }
]

// ============================================================================
// MAIN LOGIN PAGE
// ============================================================================

export default function LoginPage() {
    // In Phase 3: Check if user is already logged in
    // const session = await getServerSession()
    // if (session) redirect('/dashboard')

    return (
        <AuthLayout hideBackButton={false}>
            <div className="container-safe mx-auto max-w-6xl pt-20 sm:pt-24 py-8 sm:py-12">
                
                            {/* ========================================
                                BACK BUTTON - NOW IN PAGE (ONLY ONCE)
                                ======================================== */}
                            <div className="mb-6">
                                <Link
                                    href="/"
                                    className="
                                        inline-flex items-center gap-1.5 
                                        text-sm text-gray-600 dark:text-gray-400 
                                        hover:text-blue-600 dark:hover:text-blue-400 
                                        transition-colors 
                                        group
                                    "
                                >
                                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                    <span>Back to Home</span>
                                </Link>
                            </div>
                
                {/* ========================================
                    TWO COLUMN LAYOUT - Desktop Only
                    ======================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    
                    {/* ========================================
                        LEFT COLUMN - Welcome & Benefits (Desktop)
                        ======================================== */}
                    <div className="hidden lg:block space-y-8 sticky top-24">
                        
                        {/* Welcome Header */}
                        <div className="space-y-4">
                            <div className="
                                inline-flex items-center gap-2 
                                px-3 py-1.5 
                                bg-blue-50 dark:bg-blue-900/20 
                                border border-blue-200 dark:border-blue-800 
                                rounded-full
                            ">
                                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                    Secure Login
                                </span>
                            </div>
                            
                            <h1 className="text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                                Welcome Back to{' '}
                                <span className="text-blue-600 dark:text-blue-400">
                                    SafariHub
                                </span>
                            </h1>
                            
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Sign in to continue your journey with verified guides and authentic experiences.
                            </p>
                        </div>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {STATISTICS.map((stat, index) => (
                                <div
                                    key={index}
                                    className="
                                        p-4 
                                        bg-white dark:bg-gray-900 
                                        border border-gray-200 dark:border-gray-800 
                                        rounded-xl
                                        hover:shadow-md 
                                        transition-shadow
                                    "
                                >
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust Badges */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>256-bit SSL encryption</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>GDPR compliant data protection</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Two-factor authentication available</span>
                            </div>
                        </div>

                        {/* Testimonials */}
                        <div className="space-y-4">
                            {TESTIMONIALS.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="
                                        p-6 
                                        bg-gradient-to-br from-blue-50 to-indigo-50 
                                        dark:from-blue-950/30 dark:to-indigo-950/30 
                                        rounded-2xl 
                                        border border-blue-200 dark:border-blue-800
                                    "
                                >
                                    <p className="text-sm italic text-gray-700 dark:text-gray-300 mb-4">
                                        "{testimonial.quote}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="
                                            w-10 h-10 
                                            rounded-full 
                                            bg-gradient-to-br from-amber-200 to-amber-300 
                                            dark:from-amber-700 dark:to-amber-800 
                                            flex items-center justify-center 
                                            text-amber-900 dark:text-amber-100 
                                            font-bold
                                        ">
                                            {testimonial.initials}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {testimonial.author}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {testimonial.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ========================================
                        RIGHT COLUMN - Login Form
                        ======================================== */}
                    <div className="w-full max-w-md mx-auto lg:mx-0">
                        
                        {/* Mobile Header (shown only on mobile) */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="
                                inline-flex items-center gap-2 
                                px-3 py-1.5 
                                bg-blue-50 dark:bg-blue-900/20 
                                border border-blue-200 dark:border-blue-800 
                                rounded-full
                                mb-4
                            ">
                                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                    Secure Login
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Welcome Back
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Sign in to continue your journey
                            </p>
                        </div>

                        {/* Login Form with Suspense */}
                        <Suspense fallback={<LoginLoading />}>
                            <LoginForm />
                        </Suspense>

                        {/* Mobile Trust Badges */}
                        <div className="lg:hidden mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                SSL Secured
                            </span>
                            <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                GDPR Compliant
                            </span>
                            <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                24/7 Support
                            </span>
                        </div>

                        {/* Terms & Privacy (Mobile) */}
                        <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-6 lg:hidden">
                            By signing in, you agree to our{' '}
                            <Link 
                                href="/terms" 
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Terms
                            </Link>{' '}
                            and{' '}
                            <Link 
                                href="/privacy" 
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>

                {/* ========================================
                    SCHEMA MARKUP - SEO
                    ======================================== */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebPage',
                            'name': 'Login',
                            'description': 'Sign in to SafariHub travel marketplace',
                            'publisher': {
                                '@type': 'Organization',
                                'name': 'SafariHub'
                            },
                            'potentialAction': {
                                '@type': 'LoginAction',
                                'target': 'https://safaribub.com/auth/login'
                            }
                        })
                    }}
                />
            </div>
        </AuthLayout>
    )
}