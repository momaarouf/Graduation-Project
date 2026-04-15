'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Calendar,
    Clock,
    MapPin,
    ChevronRight,
    Compass,
    Sparkles,
    ArrowRight,
    Search,
    CreditCard,
    Star,
    Trophy,
    Zap
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { travelerGetProfile, travelerGetLoyaltyStatus, TravelerProfileResponse, LoyaltyStatusResponse, LoyaltyTierType } from '@/src/lib/api/traveler'
import { getGreeting } from '@/src/lib/greeting'
import OnboardingBannerWrapper from '@/src/components/dashboard/OnboardingBannerWrapper'
import { toast } from 'react-hot-toast'
import { getTravelerBookings } from '@/src/lib/api/tours'
import { BookingResponse } from '@/src/lib/types/tour.types'

// ============================================================================
// LOYALTY TIER CONFIG
// Maps each tier to its brand colors and icon for consistent UI rendering
// ============================================================================

const TIER_CONFIG: Record<LoyaltyTierType, {
    label: string
    icon: string
    badge: string
    text: string
    ring: string
    gradient: string
}> = {
    BRONZE: {
        label: 'Bronze',
        icon: '🥉',
        badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
        text: 'text-amber-700 dark:text-amber-300',
        ring: 'ring-amber-300/50',
        gradient: 'from-amber-500 to-orange-500',
    },
    SILVER: {
        label: 'Silver',
        icon: '🥈',
        badge: 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300',
        text: 'text-slate-600 dark:text-slate-300',
        ring: 'ring-slate-300/50',
        gradient: 'from-slate-400 to-gray-500',
    },
    GOLD: {
        label: 'Gold',
        icon: '🥇',
        badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
        text: 'text-yellow-700 dark:text-yellow-400',
        ring: 'ring-yellow-400/60',
        gradient: 'from-yellow-500 to-amber-400',
    },
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white/70 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl shadow-xl shadow-blue-500/5 ${className}`}>
            {children}
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color }: {
    icon: React.ElementType
    label: string
    value: string | number
    color: 'blue' | 'amber' | 'emerald' | 'purple'
}) {
    const colors: Record<string, string> = {
        blue: 'from-blue-500 to-indigo-600',
        amber: 'from-amber-500 to-orange-600',
        emerald: 'from-emerald-500 to-teal-600',
        purple: 'from-purple-500 to-pink-600',
    }
    return (
        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
            <GlassCard className="p-6 h-full flex flex-col justify-between overflow-hidden group">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{value}</div>
                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</div>
                </div>
            </GlassCard>
        </motion.div>
    )
}

/** Loyalty tier stat card — replaces the plain "Profile Status" card */
function LoyaltyStatCard({ loyalty }: { loyalty: LoyaltyStatusResponse | null }) {
    const tier = (loyalty?.loyaltyTier ?? 'BRONZE') as LoyaltyTierType
    const cfg = TIER_CONFIG[tier]

    return (
        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }} className="relative">
            <GlassCard className={`p-6 h-full flex flex-col justify-between overflow-hidden group ring-2 ${cfg.ring}`}>
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${cfg.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${cfg.gradient} text-white shadow-lg`}>
                        <Trophy className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full ${cfg.badge}`}>
                        {cfg.icon} {cfg.label}
                    </span>
                </div>
                <div className="relative z-10">
                    <div className={`text-3xl font-black tracking-tight mb-1 ${cfg.text}`}>
                        {loyalty ? `${loyalty.discountPct}% off` : '—'}
                    </div>
                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Loyalty Tier
                    </div>
                    {loyalty && loyalty.tripsToNextTier > 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {loyalty.tripsToNextTier} trip{loyalty.tripsToNextTier !== 1 ? 's' : ''} to {loyalty.nextTier ? loyalty.nextTier.charAt(0) + loyalty.nextTier.slice(1).toLowerCase() : ''}
                        </p>
                    )}
                    {loyalty && loyalty.tripsToNextTier === 0 && (
                        <p className="text-xs text-yellow-500 mt-1 font-bold">✨ Top tier achieved!</p>
                    )}
                </div>
            </GlassCard>
        </motion.div>
    )
}

/** Sidebar loyalty progress card */
function LoyaltyProgressCard({ loyalty }: { loyalty: LoyaltyStatusResponse | null }) {
    if (!loyalty) return null

    const tier = loyalty.loyaltyTier as LoyaltyTierType
    const cfg = TIER_CONFIG[tier]

    // Compute clean progress percentage within the current tier range.
    // Backend gives us tripsToNextTier so we can derive the target.
    let cleanProgress = 0
    if (tier === 'BRONZE') {
        const target = loyalty.completedTrips + loyalty.tripsToNextTier  // = silverMinTrips
        cleanProgress = target > 0 ? Math.min(100, (loyalty.completedTrips / target) * 100) : 0
    } else if (tier === 'SILVER') {
        // Between silverMin (5) and goldMin (silverMin + tripsToNextTier)
        const goldTotal = loyalty.completedTrips + loyalty.tripsToNextTier
        const silverMin = goldTotal - (loyalty.tripsToNextTier > 0 ? goldTotal - loyalty.completedTrips + loyalty.tripsToNextTier : 0)
        // Simplified: 0 tripsToNextTier = 100%, otherwise scale from 5
        cleanProgress = loyalty.tripsToNextTier === 0
            ? 100
            : Math.max(0, Math.min(100, ((loyalty.completedTrips - 5) / (goldTotal - 5)) * 100))
    } else {
        cleanProgress = 100
    }

    return (
        <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${cfg.gradient} text-white shadow-md`}>
                    <Star className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-sm">Loyalty Status</h3>
                    <p className="text-xs text-gray-500">{cfg.icon} {cfg.label} Member</p>
                </div>
            </div>

            {/* Progress bar to next tier */}
            {loyalty.tripsToNextTier > 0 && loyalty.nextTier && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-500">{cfg.label}</span>
                        <span className={`text-xs font-bold uppercase ${TIER_CONFIG[loyalty.nextTier].text}`}>
                            {loyalty.nextTier.charAt(0) + loyalty.nextTier.slice(1).toLowerCase()}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(cleanProgress)}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        {loyalty.tripsToNextTier} more trip{loyalty.tripsToNextTier !== 1 ? 's' : ''} to unlock{' '}
                        <span className={`font-bold ${TIER_CONFIG[loyalty.nextTier].text}`}>
                            {loyalty.nextTierDiscountPct}% discount
                        </span>
                    </p>
                </div>
            )}

            {loyalty.tripsToNextTier === 0 && (
                <div className="text-center p-3 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/30 mb-4">
                    <p className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">✨ Max Tier Achieved!</p>
                    <p className="text-xs text-yellow-500 mt-1">You earn {loyalty.discountPct}% off every booking.</p>
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{loyalty.completedTrips}</div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">Trips Done</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <div className={`text-2xl font-black ${cfg.text}`}>{loyalty.discountPct}%</div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">Your Discount</div>
                </div>
            </div>
        </GlassCard>
    )
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export default function TravelerDashboardPage() {
    const { user } = useAuth()
    const [profile, setProfile] = useState<TravelerProfileResponse | null>(null)
    const [loyalty, setLoyalty] = useState<LoyaltyStatusResponse | null>(null)
    const [bookings, setBookings] = useState<BookingResponse[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [profileData, loyaltyData, bookingsData] = await Promise.all([
                    travelerGetProfile(),
                    travelerGetLoyaltyStatus().catch(() => null), // non-critical — don't fail whole page
                    getTravelerBookings(),
                ])
                setProfile(profileData)
                setLoyalty(loyaltyData)
                setBookings(bookingsData || [])
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error)
                toast.error('Could not load detailed stats')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 animate-pulse font-medium">Loading your adventure...</p>
                </div>
            </div>
        )
    }

    // Find the first active booking that has a loyalty discount applied
    const discountedBooking = bookings.find(
        (b) =>
            b.tierDiscountAmount &&
            b.tierDiscountAmount > 0 &&
            ['Confirmed', 'InProgress'].includes(b.status as string)
    )

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950/50">
            {/* Background decorative blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    <OnboardingBannerWrapper />

                    {/* HERO */}
                    <div className="mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                        >
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                    <Sparkles className="w-3 h-3" />
                                    {getGreeting()}
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                    Hi, {user?.fullName?.split(' ')[0] || 'Traveler'}! <span className="text-blue-600">Explore</span> more.
                                </h1>
                                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 font-medium">
                                    Ready for your next trip to {profile?.country || 'Lebanon'}?
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href="/tours"
                                    className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold shadow-xl shadow-blue-500/30 transition-all flex items-center gap-3 group"
                                >
                                    <Search className="w-5 h-5" />
                                    Find Tours
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* STATS GRID */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                    >
                        <StatCard icon={Compass} label="Completed Trips" value={profile?.completedTrips || 0} color="blue" />
                        <StatCard icon={MapPin} label="Base Location" value={profile?.country || 'Lebanon'} color="amber" />
                        {/* Loyalty Tier replaces the plain "Profile Status" card */}
                        <LoyaltyStatCard loyalty={loyalty} />
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* MAIN CONTENT */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* PAYMENT ALERT */}
                            {bookings.some((b) => b.status === 'PendingPayment') && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30">
                                            <CreditCard className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black tracking-tight mb-1">Action Required: Payment Pending</h3>
                                            <p className="text-indigo-100 text-sm font-medium">You have an unpaid booking. Complete payment now to secure your spot.</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/dashboard/traveler/bookings"
                                        className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all shadow-lg active:scale-95 relative z-10"
                                    >
                                        Pay Now
                                    </Link>
                                </motion.div>
                            )}

                            {/* LOYALTY SAVINGS BANNER — only if a confirmed booking has a tier discount */}
                            {discountedBooking && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-5 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-[2rem] text-white shadow-xl shadow-amber-500/20 flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm">
                                            🎉 Loyalty discount applied! You saved ${discountedBooking.tierDiscountAmount?.toFixed(2)} on &ldquo;{discountedBooking.tourTitle}&rdquo;.
                                        </p>
                                        <p className="text-amber-100 text-xs mt-0.5">
                                            Your {loyalty ? loyalty.loyaltyTier.charAt(0) + loyalty.loyaltyTier.slice(1).toLowerCase() : ''} tier earns you {loyalty?.discountPct}% off every trip.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* UPCOMING TRIPS */}
                            <GlassCard className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Your Upcoming Trips</h2>
                                        <p className="text-sm text-gray-500 font-medium">Get ready for your next adventure</p>
                                    </div>
                                    <Link href="/dashboard/traveler/bookings" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                                        View All
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>

                                {bookings.filter((b) =>
                                    ['Confirmed', 'PendingGuide', 'InProgress', 'PendingPayment'].includes(b.status as string)
                                ).length > 0 ? (
                                    <div className="space-y-4">
                                        {bookings
                                            .filter((b) => ['Confirmed', 'PendingGuide', 'InProgress', 'PendingPayment'].includes(b.status as string))
                                            .slice(0, 1)
                                            .map((booking) => (
                                                <div
                                                    key={booking.id}
                                                    className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                                                            <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 dark:text-white">{booking.tourTitle}</h4>
                                                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                                <Clock className="w-4 h-4" />
                                                                {new Date(booking.startTimeUtc).toLocaleDateString()}
                                                            </div>
                                                            {/* Loyalty discount indicator */}
                                                            {booking.tierDiscountAmount && booking.tierDiscountAmount > 0 && (
                                                                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                                                                    🏅 You saved ${booking.tierDiscountAmount.toFixed(2)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                            booking.status === 'Confirmed'
                                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                : booking.status === 'InProgress'
                                                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                                : booking.status === 'PendingPayment'
                                                                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                                : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                                        }`}>
                                                            {booking.status === 'PendingPayment' ? 'Unpaid' : booking.status}
                                                        </span>
                                                        <Link href="/dashboard/traveler/bookings" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                                            <ChevronRight className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No upcoming trips yet</h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6 font-medium">
                                            Your passport is feeling lonely. Browse our curated tours and book your next escape!
                                        </p>
                                        <Link
                                            href="/tours"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-black hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            Explore Tours
                                        </Link>
                                    </div>
                                )}
                            </GlassCard>

                            {/* RECENT ACTIVITY */}
                            <GlassCard className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                                </div>
                                <div className="space-y-4">
                                    {user?.profileCompleted && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Completed your profile setup</p>
                                        </div>
                                    )}
                                    {loyalty && loyalty.completedTrips > 0 && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                Reached {TIER_CONFIG[loyalty.loyaltyTier].icon} {TIER_CONFIG[loyalty.loyaltyTier].label} loyalty tier
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Joined SafariHub</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* SIDEBAR */}
                        <div className="space-y-6">
                            <LoyaltyProgressCard loyalty={loyalty} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}