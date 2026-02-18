// ============================================================================
// HOW IT WORKS PAGE - FIXED
// ============================================================================
// LOCATION: /frontend/src/app/how-it-works/page.tsx
// 
// FIXES APPLIED:
// 1. Added PageLayout wrapper (includes Navigation and Footer)
// 2. Improved step number styling with gradient and glow
// 3. Enhanced hover effects on cards
// 4. Added smooth transitions and animations
// 5. Better visual hierarchy
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  Calendar,
  CreditCard,
  MapPin,
  Users,
  Star,
  Shield,
  CheckCircle,
  Compass,
  Award,
  TrendingUp,
  MessageSquare,
  Smartphone,
  Camera,
  Globe,
  Heart,
  Zap,
  Clock,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Sparkles
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

export const metadata: Metadata = {
  title: 'How It Works | SafariHub',
  description: 'Learn how SafariHub connects travelers with verified local guides for authentic halal-friendly experiences in Lebanon and Turkey.',
  openGraph: {
    title: 'How SafariHub Works',
    description: 'Your guide to authentic travel experiences',
    images: ['/images/og/how-it-works.jpg'],
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

const STATISTICS = [
  { value: '15K+', label: 'Happy Travelers', icon: Users, color: 'blue' },
  { value: '1,200+', label: 'Verified Guides', icon: Award, color: 'amber' },
  { value: '4.8/5', label: 'Average Rating', icon: Star, color: 'emerald' },
  { value: '48h', label: 'Payout Protection', icon: Shield, color: 'purple' },
]

// ============================================================================
// TRAVELER STEPS
// ============================================================================

const TRAVELER_STEPS = [
  {
    icon: Search,
    title: 'Find Your Tour',
    description: 'Browse hundreds of halal-friendly tours in Lebanon and Turkey. Filter by location, price, duration, and interests.',
    details: [
      'Search by destination or activity',
      'Filter by halal certification',
      'Read verified traveler reviews',
      'Compare prices and itineraries'
    ],
    color: 'blue'
  },
  {
    icon: Calendar,
    title: 'Book Instantly or Request',
    description: 'Choose your preferred date and group size. Book instantly or send a request to the guide.',
    details: [
      'Instant Book: Payment → Confirmed',
      'Request to Book: Guide responds within 24h',
      'Group discounts for 4+ people',
      '15-minute cart lock during payment'
    ],
    color: 'amber'
  },
  {
    icon: CreditCard,
    title: 'Pay Securely',
    description: 'All payments are processed through our secure platform. Your money is protected.',
    details: [
      '256-bit SSL encryption',
      'Funds held safely until tour completion',
      'Multiple payment methods',
      '48-hour refund guarantee'
    ],
    color: 'emerald'
  },
  {
    icon: MapPin,
    title: 'Meet Your Guide',
    description: 'On tour day, meet your verified guide at the meeting point. Scan QR code to check in.',
    details: [
      'QR code handshake at meeting point',
      'Real-time guide location sharing',
      'Emergency contact provided',
      'Tour starts on time'
    ],
    color: 'purple'
  },
  {
    icon: Star,
    title: 'Enjoy & Review',
    description: 'Experience authentic local culture. Leave a review and earn loyalty points.',
    details: [
      'Share your experience',
      'Earn loyalty tier discounts',
      'Get reminders to review',
      'Guides can respond to reviews'
    ],
    color: 'pink'
  }
]

// ============================================================================
// GUIDE STEPS
// ============================================================================

const GUIDE_STEPS = [
  {
    icon: Shield,
    title: 'Get Verified',
    description: 'Complete our manual ID verification process to build trust with travelers.',
    details: [
      'Upload government ID',
      'Take a selfie with your ID',
      'Admin review within 24-48 hours',
      'Receive "Verified Guide" badge'
    ],
    color: 'blue'
  },
  {
    icon: Compass,
    title: 'Create Your Tours',
    description: 'Set up your profile and create tours with flexible scheduling and pricing.',
    details: [
      'One-time or recurring tours',
      'Set min/max capacity',
      'Dynamic pricing for weekends/holidays',
      'Halal certification options'
    ],
    color: 'amber'
  },
  {
    icon: Users,
    title: 'Connect with Travelers',
    description: 'Receive booking requests and messages from travelers around the world.',
    details: [
      'Safe chat with contact info blur',
      'Booking notifications',
      'Respond to traveler questions',
      'Build your reputation'
    ],
    color: 'emerald'
  },
  {
    icon: TrendingUp,
    title: 'Earn & Grow',
    description: 'Get paid securely and earn badges as you build your impact score.',
    details: [
      '48-hour payout freeze for safety',
      'Tiered fees (as low as 8%)',
      'Impact score and badges',
      'Promo codes for marketing'
    ],
    color: 'purple'
  }
]

// ============================================================================
// FAQ PREVIEW
// ============================================================================

const FAQ_ITEMS = [
  {
    question: 'Is SafariHub really free for travelers?',
    answer: 'Yes! Creating an account and browsing tours is completely free. You only pay when you book a tour.'
  },
  {
    question: 'How are guides verified?',
    answer: 'Every guide goes through manual ID verification. They upload a government ID and a selfie, which our team reviews within 24-48 hours.'
  },
  {
    question: 'What if I need to cancel?',
    answer: 'Free cancellation up to 48 hours before the tour. Between 24-48 hours, 50% refund. Within 24 hours, no refund.'
  },
  {
    question: 'Are tours really halal-friendly?',
    answer: 'Yes! Tours marked with the Halal badge include prayer spaces, halal food options, and gender-sensitive guides when requested.'
  }
]

// ============================================================================
// STEP CARD COMPONENT - ENHANCED
// ============================================================================

interface StepCardProps {
  icon: React.ElementType
  title: string
  description: string
  details: string[]
  index: number
  isTraveler?: boolean
  color: string
}

function StepCard({ icon: Icon, title, description, details, index, isTraveler = true, color }: StepCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-600 to-indigo-600',
      light: 'bg-blue-100 dark:bg-blue-900/50',
      shadow: 'shadow-blue-500/20'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-600 dark:text-amber-400',
      gradient: 'from-amber-600 to-orange-600',
      light: 'bg-amber-100 dark:bg-amber-900/50',
      shadow: 'shadow-amber-500/20'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-600 dark:text-emerald-400',
      gradient: 'from-emerald-600 to-teal-600',
      light: 'bg-emerald-100 dark:bg-emerald-900/50',
      shadow: 'shadow-emerald-500/20'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400',
      gradient: 'from-purple-600 to-pink-600',
      light: 'bg-purple-100 dark:bg-purple-900/50',
      shadow: 'shadow-purple-500/20'
    },
    pink: {
      bg: 'bg-pink-50 dark:bg-pink-950/30',
      border: 'border-pink-200 dark:border-pink-800',
      text: 'text-pink-600 dark:text-pink-400',
      gradient: 'from-pink-600 to-rose-600',
      light: 'bg-pink-100 dark:bg-pink-900/50',
      shadow: 'shadow-pink-500/20'
    }
  }

  const classes = colorClasses[color as keyof typeof colorClasses]

  return (
    <div className={`
      relative group
      flex gap-6 p-6 sm:p-8
      rounded-2xl border-2
      ${classes.bg} ${classes.border}
      hover:shadow-xl ${classes.shadow}
      transition-all duration-500
      hover:-translate-y-1
      cursor-default
      backdrop-blur-sm
    `}>
      {/* Step Number - Enhanced */}
      <div className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 z-10">
        <div className={`
          relative
          w-10 h-10 sm:w-12 sm:h-12
          rounded-xl
          bg-gradient-to-r ${classes.gradient}
          flex items-center justify-center
          text-white font-bold text-lg sm:text-xl
          shadow-lg ${classes.shadow}
          group-hover:scale-110 group-hover:rotate-3
          transition-all duration-300
          before:absolute before:inset-0 before:rounded-xl
          before:bg-white/20 before:scale-0 before:group-hover:scale-100
          before:transition-transform before:duration-300
        `}>
          {index + 1}
        </div>
        {/* Glow effect */}
        <div className={`
          absolute -inset-1 rounded-xl blur-md opacity-0
          group-hover:opacity-20 transition-opacity duration-300
          bg-gradient-to-r ${classes.gradient}
        `} />
      </div>

      {/* Icon */}
      <div className="flex-shrink-0 mt-2">
        <div className={`
          relative
          w-14 h-14 sm:w-16 sm:h-16
          rounded-xl
          bg-white dark:bg-gray-900
          border-2 ${classes.border}
          flex items-center justify-center
          group-hover:scale-110 group-hover:rotate-3
          transition-all duration-300
          shadow-md group-hover:shadow-xl
        `}>
          <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${classes.text} transition-transform duration-300`} />
          
          {/* Icon glow */}
          <div className={`
            absolute -inset-2 rounded-full blur-md opacity-0
            group-hover:opacity-30 transition-opacity duration-300
            ${classes.light}
          `} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`
          text-xl sm:text-2xl font-bold mb-3
          text-gray-900 dark:text-white
          group-hover:${classes.text}
          transition-colors duration-300
        `}>
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
          {description}
        </p>
        <ul className="space-y-2">
          {details.map((detail, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className={`
                flex-shrink-0 w-5 h-5 rounded-full
                ${classes.light} ${classes.text}
                flex items-center justify-center mt-0.5
                group-hover:scale-110 transition-transform duration-200
              `}>
                <CheckCircle className="w-3 h-3" />
              </div>
              <span>{detail}</span>
            </li>
          ))}
        </ul>

        {/* Decorative corner accent */}
        <div className={`
          absolute top-4 right-4 w-12 h-12 rounded-full
          opacity-0 group-hover:opacity-10 transition-opacity duration-500
          ${classes.light}
        `} />
      </div>
    </div>
  )
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  icon: React.ElementType
  value: string
  label: string
  color: string
}

function StatCard({ icon: Icon, value, label, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
  }

  return (
    <div className={`
      group relative
      p-6 rounded-xl
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      hover:shadow-xl hover:-translate-y-1
      transition-all duration-300
      overflow-hidden
    `}>
      {/* Background decoration */}
      <div className={`
        absolute top-0 right-0 w-24 h-24 rounded-full
        ${colorClasses[color as keyof typeof colorClasses]}
        opacity-0 group-hover:opacity-10
        transition-opacity duration-500
        -translate-y-12 translate-x-12
      `} />

      <div className="relative">
        <div className={`
          inline-flex p-3 rounded-xl mb-3
          ${colorClasses[color as keyof typeof colorClasses]}
          group-hover:scale-110 group-hover:rotate-3
          transition-all duration-300
        `}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {label}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE - WITH PAGE LAYOUT
// ============================================================================

export default function HowItWorksPage() {
  return (
    <PageLayout>
      {/* Main container - full viewport minus navbar */}
      <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-gray-950">
        
        {/* ========================================
            HERO SECTION - Takes remaining height
            ======================================== */}
        <section className="flex-1 min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 text-white overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          {/* Scrollable content container */}
          <div className="relative h-full overflow-y-auto">
            <div className="container-safe mx-auto max-w-7xl py-8 sm:py-12 md:py-16 min-h-full flex items-center">
              <div className="w-full max-w-3xl mx-auto text-center">
                {/* Pre-header badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>YOUR JOURNEY STARTS HERE</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  How{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300">
                    SafariHub
                  </span>{' '}
                  Works
                </h1>
                <p className="text-lg sm:text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
                  Whether you're a traveler seeking authentic experiences or a guide ready to share your expertise,
                  we make the process simple and secure.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {STATISTICS.map((stat, index) => (
                    <StatCard
                      key={index}
                      icon={stat.icon}
                      value={stat.value}
                      label={stat.label}
                      color={stat.color}
                    />
                  ))}
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
                  <ChevronDown className="w-6 h-6 text-white/60" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

        {/* ========================================
            FOR TRAVELERS SECTION
            ======================================== */}
        <section className="py-20 sm:py-24 bg-white dark:bg-gray-950">
          <div className="container-safe mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-4 py-2 mb-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-sm font-bold rounded-full shadow-lg">
                FOR TRAVELERS
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Discover Authentic Experiences
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                From booking to check-in, here's how you'll experience halal-friendly travel with SafariHub.
              </p>
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">
              {TRAVELER_STEPS.map((step, index) => (
                <StepCard
                  key={index}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  details={step.details}
                  index={index}
                  isTraveler={true}
                  color={step.color}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/tours"
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Browse Tours</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================
            FOR GUIDES SECTION
            ======================================== */}
        <section className="py-20 sm:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="container-safe mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-4 py-2 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full shadow-lg">
                FOR GUIDES
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Share Your Expertise
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Turn your passion into income. Here's how to become a verified guide on SafariHub.
              </p>
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">
              {GUIDE_STEPS.map((step, index) => (
                <StepCard
                  key={index}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  details={step.details}
                  index={index}
                  isTraveler={false}
                  color={step.color}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/guide/onboarding"
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Become a Guide</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================
            KEY FEATURES GRID - Enhanced
            ======================================== */}
        <section className="py-20 sm:py-24 bg-white dark:bg-gray-950">
          <div className="container-safe mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose SafariHub?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Built with trust, safety, and halal-friendly travel at its core.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: 'Verified Guides', desc: 'Every guide manually ID-verified by our team. No exceptions.', color: 'blue' },
                { icon: Heart, title: 'Halal-Friendly', desc: 'Prayer spaces, halal food, and gender-sensitive guides available.', color: 'emerald' },
                { icon: CreditCard, title: 'Secure Payments', desc: '48-hour payout freeze protects both travelers and guides.', color: 'amber' },
                { icon: Clock, title: '24/7 Support', desc: 'Our team is always here to help with any issues.', color: 'purple' }
              ].map((feature, index) => {
                const Icon = feature.icon
                const colorClasses = {
                  blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
                  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
                  amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
                  purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
                }

                return (
                  <div
                    key={index}
                    className="group relative p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent to-current/5" />
                    
                    <div className={`
                      inline-flex p-3 rounded-xl mb-4
                      ${colorClasses[feature.color as keyof typeof colorClasses]}
                      group-hover:scale-110 group-hover:rotate-3
                      transition-all duration-300
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>

                    {/* Decorative corner */}
                    <div className={`
                      absolute bottom-0 right-0 w-12 h-12 rounded-full
                      ${colorClasses[feature.color as keyof typeof colorClasses]}
                      opacity-0 group-hover:opacity-10
                      transition-opacity duration-500
                    `} />
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ========================================
            FAQ PREVIEW - Enhanced
            ======================================== */}
        <section className="py-20 sm:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="container-safe mx-auto max-w-4xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Quick answers to common questions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FAQ_ITEMS.map((item, index) => (
                <div
                  key={index}
                  className="group p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.question}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/faq"
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:gap-2 transition-all group"
              >
                <span>View all FAQs</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================
            FINAL CTA - Enhanced
            ======================================== */}
        <section className="relative py-20 sm:py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 text-white overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="container-safe mx-auto max-w-4xl text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers and guides already using SafariHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tours"
                className="group relative px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Find a Tour</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
              <Link
                href="/guide/onboarding"
                className="group relative px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-xl transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Become a Guide</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </section>
      
    </PageLayout>
  )
}