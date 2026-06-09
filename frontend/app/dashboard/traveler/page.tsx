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
 badge: 'bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-900/40 text-accent-light dark:text-accent-dark dark:text-amber-300',
 text: 'text-accent-light dark:text-accent-dark dark:text-amber-300',
 ring: 'ring-accent-light dark:ring-accent-dark/50',
 gradient: 'from-amber-500 to-orange-500',
 },
 SILVER: {
 label: 'Silver',
 icon: '🥈',
 badge: 'bg-slate-100/60 text-slate-700',
 text: 'text-slate-600',
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
    <div className={`surface-card border border-theme rounded-3xl shadow-sm ${className}`}>
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
  const iconColors: Record<string, string> = {
    blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark border-primary-light/20',
    amber: 'bg-accent-light/10 text-accent-light dark:text-accent-dark border-accent-light/20',
    emerald: 'bg-success-green/10 text-success-green dark:text-emerald-400 border-success-green/20',
    purple: 'bg-primary-light/10 text-primary-light dark:text-primary-dark border-primary-light/20'
  }

  return (
    <GlassCard className="p-5 sm:p-6 hover:border-theme-strong transition-all group/stat shadow-sm hover:shadow-lg">
      <div className={`p-2.5 rounded-xl ${iconColors[color]} w-fit mb-4 border transition-transform group-hover/stat:scale-110`}>
        <Icon className="w-4 h-4 sm:w-5 h-5" />
      </div>
      <div className="text-2xl sm:text-3xl font-black text-theme-primary mb-1 tracking-tight leading-none">{value}</div>
      <div className="text-[9px] sm:text-[10px] font-bold capitalize tracking-[0.15em] text-theme-muted opacity-80">{label}</div>
    </GlassCard>
  )
}

/** Loyalty tier stat card — replaces the plain"Profile Status" card */
function LoyaltyStatCard({ loyalty }: { loyalty: LoyaltyStatusResponse | null }) {
  const tier = (loyalty?.loyaltyTier ?? 'BRONZE') as LoyaltyTierType
  const cfg = TIER_CONFIG[tier]

  return (
    <GlassCard className={`p-5 sm:p-6 border-l-4 ${cfg.ring.replace('ring-', 'border-l-').replace('/50', '')} hover:border-theme-strong transition-all group/loyalty`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 rounded-xl ${cfg.badge} w-fit group-hover/loyalty:scale-110 transition-transform`}>
          <Trophy className="w-4 h-4 sm:w-5 h-5" />
        </div>
        <span className={`text-[10px] sm:text-xs font-bold capitalize tracking-normal px-2 py-1 rounded-xl ${cfg.badge}`}>
          {cfg.icon} {cfg.label}
        </span>
      </div>
      <div>
        <div className={`text-2xl sm:text-3xl font-black mb-0.5 sm:mb-1 tracking-tight ${cfg.text}`}>
          {loyalty ? `${loyalty.discountPct}% off` : '—'}
        </div>
        <div className="text-[10px] sm:text-xs font-bold capitalize tracking-normal text-theme-muted">
          Loyalty Tier
        </div>
        {loyalty && loyalty.tripsToNextTier > 0 && (
          <p className="text-[10px] sm:text-xs text-theme-muted mt-1.5 font-bold capitalize tracking-tighter">
            {loyalty.tripsToNextTier} more to {loyalty.nextTier ? loyalty.nextTier.charAt(0) + loyalty.nextTier.slice(1).toLowerCase() : ''}
          </p>
        )}
        {loyalty && loyalty.tripsToNextTier === 0 && (
          <p className="text-[10px] sm:text-xs text-yellow-500 mt-1.5 font-black capitalize tracking-normal">✨ Top Tier!</p>
        )}
      </div>
    </GlassCard>
  )
}

function LoyaltyProgressCard({ loyalty }: { loyalty: LoyaltyStatusResponse | null }) {
  if (!loyalty) return null

  const tier = loyalty.loyaltyTier as LoyaltyTierType
  const cfg = TIER_CONFIG[tier]

  // Compute clean progress percentage
  let cleanProgress = 0
  if (tier === 'BRONZE') {
    const target = loyalty.completedTrips + loyalty.tripsToNextTier
    cleanProgress = target > 0 ? Math.min(100, (loyalty.completedTrips / target) * 100) : 0
  } else if (tier === 'SILVER') {
    const goldTotal = loyalty.completedTrips + loyalty.tripsToNextTier
    cleanProgress = loyalty.tripsToNextTier === 0 ? 100 : Math.max(0, Math.min(100, ((loyalty.completedTrips - 5) / (goldTotal - 5)) * 100))
  } else {
    cleanProgress = 100
  }

  return (
    <GlassCard className="p-5 sm:p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Trophy className="w-24 h-24 rotate-12" />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className={`p-2.5 rounded-xl ${cfg.badge} w-fit shadow-inner`}>
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h3 className="font-bold text-theme-primary capitalize tracking-normal text-sm">Loyalty Journey</h3>
          <p className="text-xs text-theme-muted font-bold mt-0.5">{cfg.icon} {cfg.label} Elite</p>
        </div>
      </div>

      {/* Progress bar to next tier */}
      {loyalty.tripsToNextTier > 0 && loyalty.nextTier && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[10px] font-bold capitalize tracking-normal text-theme-muted">{cfg.label}</span>
            <span className={`text-[10px] font-black capitalize tracking-normal ${TIER_CONFIG[loyalty.nextTier].text}`}>
              {loyalty.nextTier}
            </span>
          </div>
          <div className="w-full h-3 surface-section rounded-full overflow-hidden p-0.5 border border-theme">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} shadow-lg`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(cleanProgress)}%` }}
              transition={{ duration: 1.2, ease: 'circOut', delay: 0.2 }}
            />
          </div>
          <div className="mt-3 p-3 bg-primary-light/5 dark:bg-primary-dark/5 rounded-xl border border-primary-light/10">
            <p className="text-[10px] text-center text-theme-muted font-medium leading-relaxed">
              Just <span className={`font-black ${cfg.text}`}>{loyalty.tripsToNextTier} more</span> trips to unlock your next tier and its rewards.
            </p>
          </div>
        </div>
      )}

      {loyalty.tripsToNextTier === 0 && (
        <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-500/10 border border-yellow-400/20 mb-6">
          <p className="text-yellow-600 dark:text-yellow-400 font-black text-xs capitalize tracking-normal italic">✨ Legendary Status ✨</p>
          <p className="text-[10px] text-yellow-600/80 dark:text-yellow-400/80 mt-1 font-medium">You have reached the peak of our loyalty program.</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 surface-section rounded-2xl border border-theme shadow-sm group hover:border-theme-strong transition-colors">
          <div className="text-2xl font-black text-theme-primary">{loyalty.completedTrips}</div>
          <div className="text-[10px] font-bold capitalize tracking-normal text-theme-muted mt-1">Trips</div>
        </div>
        <div className="text-center p-4 surface-section rounded-2xl border border-theme shadow-sm group hover:border-theme-strong transition-colors">
          <div className={`text-2xl font-black ${cfg.text}`}>{loyalty.discountPct}%</div>
          <div className="text-[10px] font-bold capitalize tracking-normal text-theme-muted mt-1">Discount</div>
        </div>
      </div>
    </GlassCard>
  )
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

import TravelerDashboardLoading from './skeleton'

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
 getTravelerBookings().catch(() => []), // Not built yet
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

 if (loading) return <TravelerDashboardLoading />

 // Find the first active booking that has a loyalty discount applied
 const discountedBooking = bookings.find(
 (b) =>
 b.tierDiscountAmount &&
 b.tierDiscountAmount > 0 &&
 ['Confirmed', 'InProgress'].includes(b.status as string)
 )

 return (
 <div className="min-h-[calc(100vh-4rem)]">
 {/* Background decorative blobs */}
 <div className="fixed inset-0 pointer-events-none overflow-hidden">
 <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-light/10 rounded-full blur-[120px]" />
 <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]" />
 </div>

 <div className="relative pt-20 sm:pt-24 pb-32 sm:pb-12 px-4 sm:px-6 lg:px-8">
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
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light/10 text-primary-light dark:text-primary-dark rounded-full text-xs font-bold capitalize tracking-normal mb-4">
 <Sparkles className="w-3 h-3" />
 {getGreeting()}
 </div>
  <h1 className="text-2xl sm:text-4xl font-black text-theme-primary tracking-tight leading-[1.1] sm:leading-tight">
  Hi, {user?.fullName?.split(' ')[0] || 'Traveler'}! <br className="sm:hidden" />
  <span className="text-primary-light dark:text-primary-dark">Explore</span> more.
  </h1>
  <p className="mt-3 text-base sm:text-lg text-theme-secondary font-medium">
  Ready for your next trip to {profile?.country || 'Lebanon'}?
  </p>
 </div>
 <div className="flex justify-center md:justify-end">
 <Link
 href="/tours"
 className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-primary-light-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-light/20 flex items-center justify-center gap-2 text-sm capitalize tracking-normal"
 >
 <Search className="w-4 h-4" />
 Find Tours
 </Link>
 </div>
 </motion.div>
 </div>

 {/* STATS GRID */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.1 }}
 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12"
 >
 <StatCard icon={Compass} label="Completed Trips" value={profile?.completedTrips || 0} color="blue" />
 <StatCard icon={MapPin} label="Base Location" value={profile?.country || 'Lebanon'} color="amber" />
 {/* Loyalty Tier replaces the plain"Profile Status" card */}
 <LoyaltyStatCard loyalty={loyalty} />
 </motion.div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* MAIN CONTENT */}
 <div className="lg:col-span-2 space-y-8">

          {/* PAYMENT ALERT */}
          {bookings.some((b) => b.status === 'PendingPayment') && (
            <div className="p-5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-0.5 capitalize tracking-normal text-sm">Payment Required</h3>
                  <p className="text-indigo-100 text-xs font-medium">Complete your unpaid booking to secure your spot.</p>
                </div>
              </div>
              <Link
                href="/dashboard/traveler/bookings"
                className="w-full sm:w-auto px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-xs capitalize tracking-normal hover:bg-indigo-50 transition-all shadow-lg flex-shrink-0 text-center"
              >
                Pay Now
              </Link>
            </div>
          )}

          {/* LOYALTY SAVINGS BANNER */}
          {discountedBooking && (
            <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white shadow-lg shadow-amber-500/20 flex items-center gap-4 border border-white/10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm capitalize tracking-tight truncate pr-2">
                  🎉 Saved ${discountedBooking.tierDiscountAmount?.toFixed(2)} with {loyalty?.loyaltyTier} status!
                </p>
                <p className="text-amber-100 text-[10px] sm:text-xs font-medium mt-0.5">
                  Exclusive {loyalty?.discountPct}% discount applied to &ldquo;{discountedBooking.tourTitle}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* UPCOMING TRIPS */}
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-theme-primary capitalize tracking-normal">Upcoming Trips</h2>
                <p className="text-xs sm:text-sm text-theme-muted font-medium mt-0.5">Your next adventures await</p>
              </div>
              <Link
                href="/dashboard/traveler/bookings"
                className="text-[10px] sm:text-xs font-bold text-primary-light dark:text-primary-dark hover:opacity-80 flex items-center gap-1 group capitalize tracking-normal"
              >
                View All
                <ChevronRight className="w-3 h-3 sm:w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {bookings.filter((b) => ['Confirmed', 'PendingGuide', 'InProgress', 'PendingPayment'].includes(b.status as string)).length > 0 ? (
              <div className="space-y-4">
                {bookings
                  .filter((b) => ['Confirmed', 'PendingGuide', 'InProgress', 'PendingPayment'].includes(b.status as string))
                  .slice(0, 3)
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className="p-5 sm:p-6 surface-section border border-theme rounded-2xl hover:border-theme-strong hover:shadow-2xl transition-all group/card cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div className="flex items-center gap-5 min-w-0">
                          <div className="w-14 h-14 bg-primary-light/10 rounded-2xl flex items-center justify-center text-primary-light flex-shrink-0 group-hover/card:scale-110 transition-transform">
                            <Calendar className="w-7 h-7" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm sm:text-lg text-theme-primary truncate group-hover/card:text-primary-light transition-colors tracking-tight">
                              {booking.tourTitle}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2">
                              <span suppressHydrationWarning className="text-[9px] sm:text-[10px] font-bold capitalize tracking-normal text-theme-muted flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-orange-500" />{' '}
                                {new Date(booking.startTimeUtc).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 pt-4 sm:pt-0 border-t sm:border-0 border-theme">
                          <div
                            className={`px-4 py-2 rounded-full text-[9px] font-bold capitalize tracking-[0.2em] border ${
                              booking.status === 'Confirmed'
                                ? 'bg-success-green/10 text-success-green border-success-green/20'
                                : booking.status === 'InProgress'
                                ? 'bg-primary-light/10 text-primary-light dark:text-primary-dark border-primary-light/20'
                                : booking.status === 'PendingPayment'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : 'bg-accent-light/10 text-accent-light border-accent-light/20'
                            }`}
                          >
                            {booking.status === 'PendingPayment' ? 'Unpaid' : booking.status}
                          </div>
                          <Link
                            href={`/dashboard/traveler/bookings`}
                            className="p-2 surface-card border border-theme rounded-xl hover:bg-primary-light hover:text-white transition-all group-hover/card:translate-x-1"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="surface-section rounded-[2.5rem] p-8 sm:p-12 text-center border-2 border-dashed border-theme">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-theme-muted/5 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-6 h-6 sm:w-8 h-8 text-theme-muted" />
                </div>
                <h3 className="font-bold text-theme-primary mb-2 text-base sm:text-lg capitalize tracking-normal">No upcoming adventures</h3>
                <p className="text-xs sm:text-sm text-theme-muted max-w-xs mx-auto mb-6 leading-relaxed font-medium">
                  The world is waiting! Browse our top-rated tours and start planning your next escape.
                </p>
                <Link
                  href="/tours"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-light text-white rounded-xl text-xs font-bold capitalize tracking-normal hover:bg-primary-light-hover transition-all shadow-lg shadow-primary-light/20 active:scale-95"
                >
                  Start Exploring
                </Link>
              </div>
            )}
          </GlassCard>

  {/* RECENT ACTIVITY */}
  <GlassCard className="p-5 sm:p-6">
  <div className="flex items-center gap-3 mb-6">
  <div className="p-2 bg-primary-light/10 text-primary-light dark:text-primary-dark rounded-xl">
  <Clock className="w-4 h-4 sm:w-5 h-5" />
  </div>
  <h3 className="font-bold text-theme-primary capitalize tracking-normal text-sm sm:text-base">Recent Activity</h3>
  </div>
  <div className="space-y-4">
  {user?.profileCompleted && (
  <div className="flex items-start gap-4">
  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-success-green flex-shrink-0" />
  <p className="text-xs sm:text-sm text-theme-secondary font-medium leading-relaxed">Account setup complete: your traveler profile is ready for adventure.</p>
  </div>
  )}
  {loyalty && loyalty.completedTrips > 0 && (
  <div className="flex items-start gap-4">
  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-light dark:bg-accent-dark flex-shrink-0" />
  <p className="text-xs sm:text-sm text-theme-secondary font-medium leading-relaxed">
  Unlocked {TIER_CONFIG[loyalty.loyaltyTier].icon} {TIER_CONFIG[loyalty.loyaltyTier].label} status! Enjoy exclusive {loyalty.discountPct}% discounts.
  </p>
  </div>
  )}
  <div className="flex items-start gap-4">
  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-light flex-shrink-0" />
  <p className="text-xs sm:text-sm text-theme-secondary font-medium leading-relaxed">Welcome to Tourongo! Your journey to authentic local experiences begins here.</p>
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