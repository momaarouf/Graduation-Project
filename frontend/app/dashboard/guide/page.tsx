// ============================================================================
// GUIDE DASHBOARD SCORE & ANALYTICS - CARD 22
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/page.tsx
// 
// PURPOSE: Central dashboard showing guide performance, impact score, and analytics
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Weighted impact score
// ✓ Completed trips count
// ✓ Total travelers count
// ✓ Earnings overview
// ✓ Performance trends
// ✓ Badges and achievements
// ✓ Recent activity feed
// 
// IMPACT SCORE CALCULATION:
// - Completed tours (40%)
// - Average rating (30%)
// - Response rate (15%)
// - Repeat travelers (15%)
// 
// COLOR PSYCHOLOGY:
// - Blue: Trust, primary metrics
// - Gold: Impact score, achievements
// - Green: Positive trends, completed
// - Amber: Warnings, pending
// - Purple: Premium, top performer
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Award,
  TrendingUp,
  Users,
  Calendar,
  Star,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Shield,
  Sparkles,
  Medal,
  Trophy,
  Gem,
  Crown,
  Heart,
  MessageSquare,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Download,
  Printer,
  Filter,
  RefreshCw,
  Info,
  HelpCircle
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type TimeRange = 'week' | 'month' | 'year' | 'all'
type TrendDirection = 'up' | 'down' | 'stable'

interface ImpactScore {
  overall: number
  breakdown: {
    completedTrips: number // 40% weight
    averageRating: number // 30% weight
    responseRate: number // 15% weight
    repeatTravelers: number // 15% weight
  }
  trend: TrendDirection
  change: number
  rank: number
  totalGuides: number
}

interface TripStats {
  total: number
  completed: number
  cancelled: number
  noShows: number
  upcoming: number
  pending: number
  trend: TrendDirection
  change: number
}

interface TravelerStats {
  total: number
  newThisMonth: number
  repeatRate: number
  averageGroupSize: number
  topNationalities: {
    country: string
    count: number
    flag: string
  }[]
}

interface EarningsStats {
  total: number
  thisMonth: number
  pending: number
  averagePerTrip: number
  platformFees: number
  netEarnings: number
  currency: string
  trend: TrendDirection
  change: number
}

interface RatingStats {
  average: number
  total: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  responseRate: number
  averageResponseTime: string
}

interface Badge {
  id: string
  name: string
  description: string
  icon: React.ElementType
  earnedAt: string
  color: 'blue' | 'amber' | 'emerald' | 'purple' | 'pink'
  isNew?: boolean
}

interface Activity {
  id: string
  type: 'booking' | 'review' | 'payout' | 'achievement' | 'message'
  title: string
  description: string
  timestamp: string
  icon: React.ElementType
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink'
  link?: string
}

interface MonthlyPerformance {
  month: string
  trips: number
  earnings: number
  rating: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_IMPACT_SCORE: ImpactScore = {
  overall: 87,
  breakdown: {
    completedTrips: 156,
    averageRating: 4.9,
    responseRate: 98,
    repeatTravelers: 42
  },
  trend: 'up',
  change: 5,
  rank: 12,
  totalGuides: 1243
}

const MOCK_TRIP_STATS: TripStats = {
  total: 187,
  completed: 156,
  cancelled: 8,
  noShows: 3,
  upcoming: 12,
  pending: 8,
  trend: 'up',
  change: 15
}

const MOCK_TRAVELER_STATS: TravelerStats = {
  total: 1243,
  newThisMonth: 89,
  repeatRate: 34,
  averageGroupSize: 2.4,
  topNationalities: [
    { country: 'United States', count: 342, flag: '🇺🇸' },
    { country: 'United Kingdom', count: 287, flag: '🇬🇧' },
    { country: 'Germany', count: 198, flag: '🇩🇪' },
    { country: 'France', count: 156, flag: '🇫🇷' },
    { country: 'Canada', count: 124, flag: '🇨🇦' }
  ]
}

const MOCK_EARNINGS: EarningsStats = {
  total: 32450,
  thisMonth: 4250,
  pending: 1250,
  averagePerTrip: 187,
  platformFees: 3245,
  netEarnings: 29205,
  currency: 'USD',
  trend: 'up',
  change: 12
}

const MOCK_RATING_STATS: RatingStats = {
  average: 4.9,
  total: 128,
  distribution: {
    5: 98,
    4: 25,
    3: 4,
    2: 1,
    1: 0
  },
  responseRate: 98,
  averageResponseTime: '< 1 hour'
}

const MOCK_BADGES: Badge[] = [
  {
    id: '1',
    name: 'Top Rated Guide',
    description: 'Maintained 4.9+ rating for 6 months',
    icon: Trophy,
    earnedAt: '2025-12-01T00:00:00Z',
    color: 'amber',
    isNew: false
  },
  {
    id: '2',
    name: 'Super Guide',
    description: 'Completed 100+ tours with 5-star reviews',
    icon: Crown,
    earnedAt: '2026-01-15T00:00:00Z',
    color: 'purple',
    isNew: false
  },
  {
    id: '3',
    name: 'Halal Specialist',
    description: 'Certified in Halal tourism practices',
    icon: Medal,
    earnedAt: '2025-08-20T00:00:00Z',
    color: 'emerald',
    isNew: false
  },
  {
    id: '4',
    name: 'Family Expert',
    description: 'Guided 50+ family tours',
    icon: Heart,
    earnedAt: '2026-02-10T00:00:00Z',
    color: 'pink',
    isNew: true
  },
  {
    id: '5',
    name: 'Early Adopter',
    description: 'Joined in the first year',
    icon: Sparkles,
    earnedAt: '2023-06-01T00:00:00Z',
    color: 'blue',
    isNew: false
  }
]

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking',
    description: 'Ahmed Khan booked Ottoman Heritage Tour for 2 people',
    timestamp: '2026-03-14T09:30:00Z',
    icon: Calendar,
    color: 'blue',
    link: '/dashboard/guide/bookings/b1'
  },
  {
    id: '2',
    type: 'review',
    title: 'New 5-Star Review',
    description: 'Fatima Al-Zahra left a review: "Amazing tour, highly recommended!"',
    timestamp: '2026-03-13T14:15:00Z',
    icon: Star,
    color: 'amber',
    link: '/dashboard/guide/reviews/r1'
  },
  {
    id: '3',
    type: 'achievement',
    title: 'New Badge Earned',
    description: 'You earned the "Family Expert" badge!',
    timestamp: '2026-03-12T10:00:00Z',
    icon: Award,
    color: 'pink',
    link: '/dashboard/guide/profile#badges'
  },
  {
    id: '4',
    type: 'payout',
    title: 'Payout Processed',
    description: '$378.50 has been sent to your bank account',
    timestamp: '2026-03-11T16:45:00Z',
    icon: DollarSign,
    color: 'emerald',
    link: '/dashboard/guide/wallet'
  },
  {
    id: '5',
    type: 'message',
    title: 'New Message',
    description: 'Omar Farooq sent you a message about Cappadocia tour',
    timestamp: '2026-03-11T11:20:00Z',
    icon: MessageSquare,
    color: 'purple',
    link: '/dashboard/guide/messages/conv-3'
  }
]

const MOCK_MONTHLY_PERFORMANCE: MonthlyPerformance[] = [
  { month: 'Oct', trips: 12, earnings: 2250, rating: 4.8 },
  { month: 'Nov', trips: 15, earnings: 2850, rating: 4.9 },
  { month: 'Dec', trips: 18, earnings: 3420, rating: 4.9 },
  { month: 'Jan', trips: 22, earnings: 4180, rating: 5.0 },
  { month: 'Feb', trips: 25, earnings: 4750, rating: 4.9 },
  { month: 'Mar', trips: 28, earnings: 5320, rating: 4.9 }
]

// ============================================================================
// IMPACT SCORE CARD COMPONENT
// ============================================================================

interface ImpactScoreCardProps {
  score: ImpactScore
}

function ImpactScoreCard({ score }: ImpactScoreCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getTrendIcon = () => {
    if (score.trend === 'up') return <ArrowUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    if (score.trend === 'down') return <ArrowDown className="w-4 h-4 text-red-600 dark:text-red-400" />
    return null
  }

  return (
    <div className="
      bg-gradient-to-br from-blue-600 to-indigo-700
      dark:from-blue-700 dark:to-indigo-800
      rounded-xl
      p-6
      text-white
    ">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          <h2 className="font-semibold">Impact Score</h2>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        <div className="text-4xl font-bold mb-1">
          {score.overall}
        </div>
        <div className="flex items-center gap-2 text-blue-100">
          <span>Rank #{score.rank} of {score.totalGuides}</span>
          <span className="flex items-center gap-1">
            {getTrendIcon()}
            {score.change}% this month
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-3 pt-4 border-t border-white/20">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-200">Completed Trips (40%)</span>
              <span className="font-semibold">{score.breakdown.completedTrips}</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-white rounded-full" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-200">Average Rating (30%)</span>
              <span className="font-semibold">{score.breakdown.averageRating}</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-5/6 bg-white rounded-full" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-200">Response Rate (15%)</span>
              <span className="font-semibold">{score.breakdown.responseRate}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-11/12 bg-white rounded-full" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-200">Repeat Travelers (15%)</span>
              <span className="font-semibold">{score.breakdown.repeatTravelers}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-white rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  subtext?: string
  trend?: {
    direction: TrendDirection
    value: string
  }
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink'
  onClick?: () => void
}

function StatCard({ icon: Icon, label, value, subtext, trend, color, onClick }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400'
  }

  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    stable: 'text-gray-600 dark:text-gray-400'
  }

  const TrendIcon = trend?.direction === 'up' ? ArrowUp : trend?.direction === 'down' ? ArrowDown : null

  return (
    <div
      onClick={onClick}
      className={`
        p-5
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        rounded-xl
        ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`
          p-2.5
          rounded-lg
          ${colorClasses[color]}
        `}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trendColors[trend.direction]}`}>
            {TrendIcon && <TrendIcon className="w-3 h-3" />}
            <span className="text-xs font-medium">{trend.value}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </div>
        {subtext && (
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {subtext}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// BADGE CARD COMPONENT
// ============================================================================

interface BadgeCardProps {
  badge: Badge
}

function BadgeCard({ badge }: BadgeCardProps) {
  const Icon = badge.icon
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800'
  }

  const date = new Date(badge.earnedAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })

  return (
    <div className={`
      relative
      p-4
      ${colorClasses[badge.color]}
      border
      rounded-xl
      flex items-start gap-3
    `}>
      <div className={`
        p-2
        rounded-lg
        bg-white dark:bg-gray-900
        shadow-sm
      `}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="font-semibold text-sm truncate">
            {badge.name}
          </h4>
          {badge.isNew && (
            <span className="
              px-1.5 py-0.5
              bg-emerald-600
              text-white text-[10px] font-bold
              rounded-full
              animate-pulse
            ">
              NEW
            </span>
          )}
        </div>
        <p className="text-xs opacity-80 mb-1 line-clamp-2">
          {badge.description}
        </p>
        <p className="text-[10px] opacity-60">
          Earned {date}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

interface ActivityItemProps {
  activity: Activity
}

function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = activity.icon
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400'
  }

  const time = new Date(activity.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <div className="
      flex items-start gap-3
      p-3
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
      hover:shadow-md
      transition-shadow
    ">
      <div className={`
        p-2
        rounded-lg
        ${colorClasses[activity.color]}
      `}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
            {activity.title}
          </h4>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {time}
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {activity.description}
        </p>
        {activity.link && (
          <Link
            href={activity.link}
            className="
              inline-flex items-center gap-1
              text-xs text-blue-600 dark:text-blue-400
              hover:underline
            "
          >
            View details
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// PERFORMANCE CHART COMPONENT
// ============================================================================

interface PerformanceChartProps {
  data: MonthlyPerformance[]
  type: 'trips' | 'earnings' | 'rating'
}

function PerformanceChart({ data, type }: PerformanceChartProps) {
  const maxValue = type === 'trips'
    ? Math.max(...data.map(d => d.trips))
    : type === 'earnings'
      ? Math.max(...data.map(d => d.earnings))
      : 5

  const getBarColor = (value: number) => {
    if (type === 'rating') {
      if (value >= 4.8) return 'bg-emerald-500'
      if (value >= 4.5) return 'bg-blue-500'
      if (value >= 4.0) return 'bg-amber-500'
      return 'bg-red-500'
    }
    return 'bg-blue-600 dark:bg-blue-500'
  }

  const getValue = (item: MonthlyPerformance) => {
    if (type === 'trips') return item.trips
    if (type === 'earnings') return item.earnings / 100 // Scale for display
    return item.rating
  }

  const getLabel = (item: MonthlyPerformance) => {
    if (type === 'trips') return `${item.trips}`
    if (type === 'earnings') return `$${item.earnings}`
    return item.rating.toFixed(1)
  }

  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((item, index) => {
        const value = getValue(item)
        const height = (value / maxValue) * 100
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full">
              <div
                className={`
                  w-full
                  ${getBarColor(value)}
                  rounded-t-lg
                  transition-all
                  group-hover:opacity-80
                `}
                style={{ height: `${height}%` }}
              />
              {/* Tooltip */}
              <div className="
                absolute -top-8 left-1/2 -translate-x-1/2
                px-2 py-1
                bg-gray-900 dark:bg-white
                text-white dark:text-gray-900
                text-xs font-medium
                rounded
                opacity-0 group-hover:opacity-100
                transition-opacity
                pointer-events-none
                whitespace-nowrap
                z-10
              ">
                {item.month}: {getLabel(item)}
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.month}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export default function GuideDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [showAllBadges, setShowAllBadges] = useState(false)

  const visibleBadges = showAllBadges ? MOCK_BADGES : MOCK_BADGES.slice(0, 3)

  return (
    <PageLayout>
      {/* Page offset */}
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Guide Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your performance, earnings, and impact score
              </p>
            </div>

            {/* Time range selector */}
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="
                  px-3 py-2
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-800
                  rounded-lg
                  text-sm
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
              <button className="
                p-2
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-lg
                text-gray-500 hover:text-gray-700
                dark:text-gray-400 dark:hover:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-colors
              ">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Impact Score and Key Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Impact Score - spans 2 columns */}
            <div className="lg:col-span-2">
              <ImpactScoreCard score={MOCK_IMPACT_SCORE} />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 lg:col-span-2">
              <StatCard
                icon={Star}
                label="Average Rating"
                value={MOCK_RATING_STATS.average}
                subtext={`${MOCK_RATING_STATS.total} reviews`}
                trend={{ direction: 'up', value: '+0.2' }}
                color="amber"
                onClick={() => console.log('Navigate to reviews')}
              />
              <StatCard
                icon={DollarSign}
                label="This Month"
                value={`$${MOCK_EARNINGS.thisMonth}`}
                subtext={`${MOCK_EARNINGS.trend === 'up' ? '+' : '-'}${MOCK_EARNINGS.change}%`}
                trend={{ direction: MOCK_EARNINGS.trend, value: `${MOCK_EARNINGS.change}%` }}
                color="emerald"
                onClick={() => console.log('Navigate to wallet')}
              />
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Calendar}
              label="Total Trips"
              value={MOCK_TRIP_STATS.total}
              subtext={`${MOCK_TRIP_STATS.completed} completed`}
              trend={{ direction: MOCK_TRIP_STATS.trend, value: `+${MOCK_TRIP_STATS.change}` }}
              color="blue"
              onClick={() => console.log('Navigate to trips')}
            />
            <StatCard
              icon={Users}
              label="Total Travelers"
              value={MOCK_TRAVELER_STATS.total}
              subtext={`${MOCK_TRAVELER_STATS.newThisMonth} this month`}
              color="purple"
              onClick={() => console.log('Navigate to travelers')}
            />
            <StatCard
              icon={TrendingUp}
              label="Response Rate"
              value={`${MOCK_RATING_STATS.responseRate}%`}
              subtext={MOCK_RATING_STATS.averageResponseTime}
              trend={{ direction: 'up', value: '+2%' }}
              color="emerald"
            />
            <StatCard
              icon={Clock}
              label="Upcoming"
              value={MOCK_TRIP_STATS.upcoming}
              subtext={`${MOCK_TRIP_STATS.pending} pending`}
              color="amber"
              onClick={() => console.log('Navigate to upcoming')}
            />
          </div>

          {/* Performance Chart and Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Performance Chart */}
            <div className="lg:col-span-2">
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
              ">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Performance Trend
                  </h3>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-gray-500 dark:text-gray-400">Trips</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                      <span className="text-gray-500 dark:text-gray-400">Earnings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span className="text-gray-500 dark:text-gray-400">Rating</span>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <PerformanceChart data={MOCK_MONTHLY_PERFORMANCE} type="trips" />
              </div>
            </div>

            {/* Badges */}
            <div>
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
              ">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Badges & Achievements
                  </h3>
                  <button
                    onClick={() => setShowAllBadges(!showAllBadges)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showAllBadges ? 'Show less' : `View all (${MOCK_BADGES.length})`}
                  </button>
                </div>

                <div className="space-y-3">
                  {visibleBadges.map(badge => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>

                {!showAllBadges && MOCK_BADGES.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    +{MOCK_BADGES.length - 3} more badges
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Feed */}
            <div className="lg:col-span-2">
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
              ">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Recent Activity
                  </h3>
                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    View all
                  </button>
                </div>

                <div className="space-y-3">
                  {MOCK_ACTIVITIES.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats Sidebar */}
            <div>
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
                space-y-4
              ">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Quick Stats
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Repeat Travelers</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {MOCK_TRAVELER_STATS.repeatRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avg. Group Size</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {MOCK_TRAVELER_STATS.averageGroupSize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Cancellation Rate</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {((MOCK_TRIP_STATS.cancelled / MOCK_TRIP_STATS.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">No-Show Rate</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {((MOCK_TRIP_STATS.noShows / MOCK_TRIP_STATS.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Top Nationalities
                  </h4>
                  <div className="space-y-2">
                    {MOCK_TRAVELER_STATS.topNationalities.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="text-base">{item.flag}</span>
                          <span className="text-gray-600 dark:text-gray-400">{item.country}</span>
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Rating Distribution
                  </h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = MOCK_RATING_STATS.distribution[star as keyof typeof MOCK_RATING_STATS.distribution]
                      const percentage = (count / MOCK_RATING_STATS.total) * 100
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-8 text-gray-500 dark:text-gray-400">{star}★</span>
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-gray-600 dark:text-gray-400">
                            {count}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/dashboard/guide/tours/new"
              className="
                p-4
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                text-center
                hover:shadow-md
                transition-shadow
                group
              "
            >
              <Calendar className="w-5 h-5 mx-auto mb-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Create Tour
              </span>
            </Link>
            <Link
              href="/dashboard/guide/wallet"
              className="
                p-4
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                text-center
                hover:shadow-md
                transition-shadow
                group
              "
            >
              <DollarSign className="w-5 h-5 mx-auto mb-2 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Withdraw
              </span>
            </Link>
            <Link
              href="/dashboard/guide/messages"
              className="
                p-4
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                text-center
                hover:shadow-md
                transition-shadow
                group
              "
            >
              <MessageSquare className="w-5 h-5 mx-auto mb-2 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Messages
              </span>
            </Link>
            <Link
              href="/dashboard/guide/promos"
              className="
                p-4
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                text-center
                hover:shadow-md
                transition-shadow
                group
              "
            >
              <Sparkles className="w-5 h-5 mx-auto mb-2 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Promo Codes
              </span>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}