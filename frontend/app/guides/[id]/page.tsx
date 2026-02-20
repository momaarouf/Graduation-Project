// ============================================================================
// GUIDE PUBLIC PROFILE - PUBLIC FACING GUIDE PAGE
// ============================================================================
// LOCATION: /frontend/src/app/guides/[id]/page.tsx
// 
// PURPOSE: Display guide information to travelers
// 
// FEATURES:
// - Guide bio and stats
// - Languages spoken
// - Expertise areas
// - Reviews and ratings
// - All tours by this guide
// - Contact/Message button
// - Verification badges
// - Impact score display
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Star,
  MapPin,
  Globe,
  Award,
  Shield,
  CheckCircle,
  MessageSquare,
  Calendar,
  Users,
  Clock,
  ChevronRight,
  Sparkles,
  Heart,
  Camera,
  Leaf,
  TrendingUp,
  Medal,
  Gem,
  Trophy
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import GuideToursGrid from '@/src/components/guides/GuideToursGrid'
import GuideReviews from '@/src/components/guides/GuideReviews'

export const metadata: Metadata = {
  title: 'Guide Profile | SafariHub',
  description: 'View guide profile, reviews, and available tours.',
  robots: {
    index: true,
    follow: true,
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_GUIDE = {
  id: 'guide-123',
  name: 'Mehmet Yilmaz',
  avatar: '/images/guides/mehmet.jpg',
  coverImage: '/images/guides/mehmet-cover.jpg',
  tagline: 'Licensed Historian & Istanbul Native',
  bio: `Salam! I'm Mehmet, a licensed historian and Istanbul native. I've been guiding travelers through the city's rich Islamic heritage for over 8 years. My passion is showing how Ottoman history connects to our modern understanding of faith and culture.

I specialize in halal-friendly tours, ensuring Muslim travelers feel comfortable with prayer accommodations, halal food options, and gender-sensitive guiding when requested.

Member of the Turkish Tourist Guides Association and certified in Ottoman Paleography.`,
  location: 'Istanbul, Turkey',
  languages: [
    { language: 'English', proficiency: 'Native' },
    { language: 'Arabic', proficiency: 'Advanced' },
    { language: 'Turkish', proficiency: 'Native' },
    { language: 'French', proficiency: 'Intermediate' }
  ],
  expertise: [
    'Ottoman History',
    'Islamic Architecture',
    'Halal Tourism',
    'Cultural Heritage',
    'Family Tours',
    'Photography Spots'
  ],
  badges: [
    { type: 'top_rated', label: 'Top Rated', icon: Trophy },
    { type: 'super_guide', label: 'Super Guide', icon: Medal },
    { type: 'halal_specialist', label: 'Halal Specialist', icon: Leaf },
    { type: 'family_expert', label: 'Family Expert', icon: Heart }
  ],
  stats: {
    impactScore: 87,
    totalTrips: 156,
    totalTravelers: 1243,
    averageRating: 4.9,
    totalReviews: 128,
    responseRate: 98,
    responseTime: '< 1 hour',
    memberSince: '2023',
    verifiedSince: '2024'
  },
  verified: true
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideProfilePage({ params }: { params: { id: string } }) {
  const guide = MOCK_GUIDE // In Phase 2: fetch by ID

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 bg-gray-50 dark:bg-gray-950">
        
        {/* Cover Image */}
        <div className="relative h-48 sm:h-64 md:h-80 bg-gradient-to-r from-blue-600 to-indigo-700">
          <Image
            src={guide.coverImage}
            alt={`${guide.name} cover`}
            fill
            className="object-cover opacity-70"
          />
        </div>

        {/* Profile Header */}
        <div className="container-safe mx-auto max-w-7xl relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20 mb-8">
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-900 overflow-hidden shadow-xl">
                <Image src={guide.avatar} alt={guide.name} width={128} height={128} className="object-cover" />
              </div>
              {guide.verified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {guide.name}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  {guide.badges.slice(0, 3).map((badge, index) => {
                    const Icon = badge.icon
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full"
                        title={badge.label}
                      >
                        <Icon className="w-3 h-3" />
                      </span>
                    )
                  })}
                </div>
              </div>
              <p className="text-lg text-blue-600 dark:text-blue-400 mb-2">
                {guide.tagline}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {guide.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Since {guide.stats.memberSince}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {guide.stats.responseTime} response
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href={`/messages/new?user=${guide.id}`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Message {guide.name.split(' ')[0]}
              </Link>
              <button className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Award}
              label="Impact Score"
              value={guide.stats.impactScore}
              color="amber"
            />
            <StatCard
              icon={Users}
              label="Travelers"
              value={guide.stats.totalTravelers}
              color="blue"
            />
            <StatCard
              icon={Star}
              label="Rating"
              value={`${guide.stats.averageRating} (${guide.stats.totalReviews})`}
              color="emerald"
            />
            <StatCard
              icon={TrendingUp}
              label="Response Rate"
              value={`${guide.stats.responseRate}%`}
              color="purple"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Bio & Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Bio */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  About {guide.name}
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {guide.bio}
                </div>
              </div>

              {/* Languages & Expertise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Languages
                  </h3>
                  <div className="space-y-3">
                    {guide.languages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">{lang.language}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {guide.expertise.map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Badges & Quick Info */}
            <div className="space-y-6">
              
              {/* All Badges */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Badges & Achievements
                </h3>
                <div className="space-y-3">
                  {guide.badges.map((badge, index) => {
                    const Icon = badge.icon
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{badge.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Earned 2025</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Verification Status */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Verification
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Identity Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Phone Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Email Verified</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total Trips</span>
                    <span className="font-medium text-gray-900 dark:text-white">{guide.stats.totalTrips}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total Travelers</span>
                    <span className="font-medium text-gray-900 dark:text-white">{guide.stats.totalTravelers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Response Rate</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{guide.stats.responseRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tours by this Guide */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Tours by {guide.name}
              </h2>
              <Link
                href={`/tours?guide=${guide.id}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <GuideToursGrid guideId={guide.id} />
          </div>

          {/* Reviews */}
          <div className="mt-12 pb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Reviews ({guide.stats.totalReviews})
              </h2>
              <Link
                href={`/guides/${guide.id}/reviews`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                See all reviews
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <GuideReviews guideId={guide.id} />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}