// ============================================================================
// TRAVELER HOME DASHBOARD - CARD 11
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/traveler/page.tsx
// 
// PURPOSE: Central hub for travelers to manage their trips and profile
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Upcoming trip countdown
// ✓ Booking history
// ✓ QR ticket for upcoming tours
// ✓ Loyalty tier badge (Bronze/Silver/Gold/Platinum)
// ✓ Quick shortcuts to bookings, messages, profile
// 
// COLOR PSYCHOLOGY:
// - Blue: Trust, primary actions
// - Gold: Loyalty, premium tiers
// - Green: Success, completed actions
// - Orange: Call-to-action, adventure
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import {
    Calendar,
    Clock,
    MapPin,
    User,
    CreditCard,
    MessageSquare,
    Settings,
    LogOut,
    ChevronRight,
    Star,
    Award,
    TrendingUp,
    Ticket,
    Heart,
    Shield,
    Bell,
    Compass,
    Users,
    Camera,
    Gift,
    Sparkles
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// ============================================================================
// METADATA - Protected page, noindex
// ============================================================================

export const metadata: Metadata = {
    title: 'Traveler Dashboard | SafariHub',
    description: 'Manage your bookings, view upcoming trips, and track your loyalty rewards.',
    robots: {
        index: false, // Don't index dashboard pages
        follow: false,
    }
}

// ============================================================================
// MOCK DATA - Will be replaced with API calls in Phase 3
// ============================================================================

const MOCK_TRAVELER = {
    id: 'trav-123',
    name: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    avatar: '/images/travelers/ahmed.jpg',
    memberSince: '2025-06-15',
    loyaltyTier: 'gold' as const,
    streakCount: 12,
    totalTrips: 24,
    reviewReminderEnabled: true,
}

const MOCK_UPCOMING_TRIPS = [
    {
        id: 'booking-1',
        tourId: '1',
        tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
        tourImage: '/images/tours/istanbul-ottoman.jpg',
        guideName: 'Mehmet Yilmaz',
        guideAvatar: '/images/guides/mehmet.jpg',
        date: '2026-03-15T09:00:00Z',
        duration: '4 hours',
        location: 'Istanbul',
        country: 'Turkey',
        bookingStatus: 'confirmed',
        peopleCount: 2,
        totalPrice: 178,
        currency: 'USD',
        hasQR: true,
    },
    {
        id: 'booking-2',
        tourId: '2',
        tourTitle: 'Beirut Street Food & Cultural Walk',
        tourImage: '/images/tours/beirut-food.jpg',
        guideName: 'Layla Hassan',
        guideAvatar: '/images/guides/layla.jpg',
        date: '2026-03-22T11:00:00Z',
        duration: '3 hours',
        location: 'Beirut',
        country: 'Lebanon',
        bookingStatus: 'confirmed',
        peopleCount: 4,
        totalPrice: 171, // With group discount
        currency: 'USD',
        hasQR: true,
    },
    {
        id: 'booking-3',
        tourId: '3',
        tourTitle: 'Cappadocia Sunrise Balloon & Valley Hike',
        tourImage: '/images/tours/cappadocia-balloon.jpg',
        guideName: 'Ahmet Demir',
        guideAvatar: '/images/guides/ahmet.jpg',
        date: '2026-04-05T04:30:00Z',
        duration: '6 hours',
        location: 'Cappadocia',
        country: 'Turkey',
        bookingStatus: 'pending',
        peopleCount: 2,
        totalPrice: 398,
        currency: 'USD',
        hasQR: false,
    }
]

const MOCK_PAST_TRIPS = [
    {
        id: 'past-1',
        tourTitle: 'Byblos Ancient Ruins & Archaeological Tour',
        date: '2026-02-10T10:00:00Z',
        location: 'Byblos',
        country: 'Lebanon',
        guideName: 'Elias Khoury',
        rating: 5,
        reviewLeft: true,
    },
    {
        id: 'past-2',
        tourTitle: 'Bosphorus Sunset Cruise with Dinner',
        date: '2026-01-28T17:30:00Z',
        location: 'Istanbul',
        country: 'Turkey',
        guideName: 'Zeynep Kaya',
        rating: null,
        reviewLeft: false,
    }
]

const MOCK_LOYALTY_TIERS = {
    bronze: { trips: 0, discount: 0, color: 'amber' },
    silver: { trips: 3, discount: 3, color: 'gray' },
    gold: { trips: 10, discount: 5, color: 'amber' },
    platinum: { trips: 25, discount: 8, color: 'blue' }
}

// ============================================================================
// TIER BADGE COMPONENT
// ============================================================================

interface TierBadgeProps {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

function TierBadge({ tier }: TierBadgeProps) {
    const tierConfig = {
        bronze: {
            bg: 'bg-amber-100 dark:bg-amber-950/30',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-800',
            icon: Award,
            label: 'Bronze'
        },
        silver: {
            bg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-700 dark:text-gray-300',
            border: 'border-gray-200 dark:border-gray-700',
            icon: Award,
            label: 'Silver'
        },
        gold: {
            bg: 'bg-amber-100 dark:bg-amber-950/30',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-800',
            icon: Award,
            label: 'Gold'
        },
        platinum: {
            bg: 'bg-blue-100 dark:bg-blue-950/30',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800',
            icon: Star,
            label: 'Platinum'
        }
    }

    const config = tierConfig[tier]
    const Icon = config.icon

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${config.bg} ${config.border} border rounded-full ${config.text} text-xs font-semibold`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label} Tier
        </div>
    )
}

// ============================================================================
// COUNTDOWN TIMER COMPONENT
// ============================================================================

interface CountdownTimerProps {
    targetDate: string
}

function CountdownTimer({ targetDate }: CountdownTimerProps) {
    // In a real app, this would update every minute
    // For Phase 1, we'll just show static days

    const date = new Date(targetDate)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return (
        <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
                {diffDays} {diffDays === 1 ? 'day' : 'days'}
            </span>
            <span className="text-gray-500 dark:text-gray-400">to go</span>
        </div>
    )
}

// ============================================================================
// UPCOMING TRIP CARD COMPONENT
// ============================================================================

interface UpcomingTripCardProps {
    trip: typeof MOCK_UPCOMING_TRIPS[0]
}

function UpcomingTripCard({ trip }: UpcomingTripCardProps) {
    const date = new Date(trip.date)
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })

    return (
        <div className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row">
                {/* Image section */}
                <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-gray-100 dark:bg-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 ${trip.bookingStatus === 'confirmed' ? 'bg-emerald-600' : 'bg-amber-600'} text-white text-xs font-medium rounded-lg`}>
                            {trip.bookingStatus === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                    </div>
                </div>

                {/* Content section */}
                <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {trip.tourTitle}
                        </h3>
                        <div className="flex items-center gap-2">
                            <CountdownTimer targetDate={trip.date} />
                            {trip.hasQR && (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg flex items-center gap-1">
                                    <Ticket className="w-3 h-3" />
                                    QR Ready
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formattedDate}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {trip.location}, {trip.country}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {trip.peopleCount} {trip.peopleCount === 1 ? 'person' : 'people'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {trip.guideName}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                ${trip.totalPrice}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                total
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Link
                            href={`/bookings/${trip.id}`}
                            className="flex-1 text-center px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                        >
                            View Details
                        </Link>
                        {trip.hasQR && (
                            <Link
                                href={`/bookings/${trip.id}/ticket`}
                                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                            >
                                <Ticket className="w-4 h-4" />
                                <span className="hidden sm:inline">QR Ticket</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// PAST TRIP CARD COMPONENT
// ============================================================================

interface PastTripCardProps {
    trip: typeof MOCK_PAST_TRIPS[0]
}

function PastTripCard({ trip }: PastTripCardProps) {
    const date = new Date(trip.date)
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {trip.tourTitle}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{trip.location}</span>
                        <span>•</span>
                        <span>{trip.guideName}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {trip.rating ? (
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {trip.rating}
                        </span>
                    </div>
                ) : (
                    <Link
                        href={`/bookings/${trip.id}/review`}
                        className="px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white text-xs font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                    >
                        Write Review
                    </Link>
                )}
            </div>
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
    change?: string
    color: 'blue' | 'emerald' | 'amber' | 'purple'
}

function StatCard({ icon: Icon, label, value, change, color }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
        purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
    }

    return (
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
                {change && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        {change}
                    </span>
                )}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
                {label}
            </div>
        </div>
    )
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export default function TravelerDashboardPage() {
    // In Phase 3, this would fetch real data
    // const { traveler, upcomingTrips, pastTrips } = await getTravelerDashboard()

    return (
        <PageLayout>
            {/* Page offset for navbar */}
            <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">

                <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">

                    {/* ========================================
              HEADER - Welcome + Quick Actions
              ======================================== */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                Welcome back, Ahmed! 👋
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Member since June 2025 • 24 trips completed
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <TierBadge tier={MOCK_TRAVELER.loyaltyTier} />
                            <div className="flex items-center gap-2">
                                <button className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative">
                                    <Bell className="w-4 h-4" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                </button>
                                <button className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ========================================
              STATS GRID
              ======================================== */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            icon={Calendar}
                            label="Upcoming Trips"
                            value={MOCK_UPCOMING_TRIPS.length}
                            color="blue"
                        />
                        <StatCard
                            icon={Star}
                            label="Loyalty Streak"
                            value={`${MOCK_TRAVELER.streakCount} weeks`}
                            change="+2"
                            color="amber"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Total Saved"
                            value="$342"
                            change="+$89"
                            color="emerald"
                        />
                        <StatCard
                            icon={Users}
                            label="Traveled With"
                            value="47 people"
                            color="purple"
                        />
                    </div>

                    {/* ========================================
              UPCOMING TRIPS SECTION
              ======================================== */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Upcoming Trips
                            </h2>
                            <Link
                                href="/bookings"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                                View all
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {MOCK_UPCOMING_TRIPS.map((trip) => (
                                <UpcomingTripCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                    </div>

                    {/* ========================================
              TWO COLUMN LAYOUT - Recent & Quick Actions
              ======================================== */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Activity / Past Trips */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold text-gray-900 dark:text-white">
                                        Recent Trips
                                    </h2>
                                    <Link
                                        href="/bookings/history"
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        View history
                                    </Link>
                                </div>

                                <div className="space-y-2">
                                    {MOCK_PAST_TRIPS.map((trip) => (
                                        <PastTripCard key={trip.id} trip={trip} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions & Info */}
                        <div className="space-y-4">
                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                                <h2 className="font-bold text-gray-900 dark:text-white mb-3">
                                    Quick Actions
                                </h2>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href="/search"
                                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Compass className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Explore
                                        </span>
                                    </Link>
                                    <Link
                                        href="/messages"
                                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <MessageSquare className="w-5 h-5 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Messages
                                        </span>
                                    </Link>
                                    <Link
                                        href="/wishlist"
                                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Heart className="w-5 h-5 mx-auto mb-1 text-rose-600 dark:text-rose-400" />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Wishlist
                                        </span>
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <User className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Profile
                                        </span>
                                    </Link>
                                </div>
                            </div>

                            {/* Loyalty Progress */}
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-bold text-gray-900 dark:text-white">
                                        Next Tier
                                    </h2>
                                    <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Gold → Platinum</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">14/25 trips</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full w-[56%] bg-gradient-to-r from-amber-500 to-blue-500 rounded-full" />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        11 more trips to unlock 8% discount
                                    </p>
                                </div>
                            </div>

                            {/* Referral Card */}
                            <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-xl text-white">
                                <div className="flex items-start justify-between mb-3">
                                    <Sparkles className="w-5 h-5 text-amber-300" />
                                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                        Limited time
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-1">Refer & Earn</h3>
                                <p className="text-sm text-blue-100 mb-4">
                                    Get $20 credit for every friend who books their first tour
                                </p>
                                <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                                    Share Invite Link
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ========================================
              RECOMMENDATIONS (Future Phase)
              ======================================== */}
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Recommended for You
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow"
                                >
                                    <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2" />
                                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-1" />
                                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}