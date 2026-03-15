'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  Shield,
  Sparkles,
  Trophy,
  Crown,
  ChevronRight,
  ArrowRight,
  PlusCircle,
  Info,
  Medal,
  Gem,
  LayoutDashboard
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import apiClient from '@/src/lib/api/client'
import { getGreeting } from '@/src/lib/greeting'
import OnboardingBanner from '@/src/components/dashboard/OnboardingBanner'
import { toast } from 'react-hot-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'not_submitted' | 'verified'

interface GuideProfileData {
  fullName: string
  email: string
  memberSince: string
  totalTrips: number
  totalTravelers: number
  impactScore: number
  verificationStatus: VerificationStatus
  languages: { name: string; proficiency: string }[]
  expertise: string[]
}

interface Badge {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: 'blue' | 'amber' | 'emerald' | 'purple' | 'pink'
}

interface Activity {
  id: string
  title: string
  description: string
  timestamp: string
  icon: React.ElementType
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink'
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BADGES: Badge[] = [
  { id: '1', name: 'Top Rated Guide', description: '4.9+ rating', icon: Trophy, color: 'amber' },
  { id: '2', name: 'Super Guide', description: '100+ tours', icon: Crown, color: 'purple' }
]

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', title: 'New Booking', description: 'Ahmed Khan booked Ottoman Heritage Tour', timestamp: '2 hours ago', icon: Calendar, color: 'blue' },
  { id: '2', title: 'New Review', description: 'Fatima Al-Zahra left 5 stars', timestamp: '5 hours ago', icon: Star, color: 'amber' }
]

// ============================================================================
// PREMIUM COMPONENTS
// ============================================================================

function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white/70 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl shadow-xl shadow-blue-500/5 ${className}`}>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: 'blue' | 'amber' | 'emerald' | 'purple' }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/20',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/20',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    purple: 'from-purple-500 to-pink-600 shadow-purple-500/20'
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="relative"
    >
      <GlassCard className="p-6 h-full flex flex-col justify-between overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
            {value}
          </div>
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const normalizedStatus = (status?.toLowerCase() || 'not_submitted') as VerificationStatus
  
  const config = {
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: Clock, label: 'Pending' },
    approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: CheckCircle, label: 'Verified' },
    verified: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: CheckCircle, label: 'Verified' },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-600', icon: AlertCircle, label: 'Failed' },
    not_submitted: { bg: 'bg-gray-500/10', text: 'text-gray-600', icon: Shield, label: 'Not Verified' }
  }

  const { bg, text, icon: Icon, label } = config[normalizedStatus] || config.not_submitted

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${bg} ${text} text-[10px] font-black uppercase tracking-widest border border-current/10`}>
      <Icon className="w-3 h-3" />
      {label}
    </div>
  )
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export default function GuideDashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<GuideProfileData | null>(null)
  
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await apiClient.get('/api/guide/profile')
        setProfile(res.data)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        toast.error('Could not load some stats')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 animate-pulse font-medium">Preparing your workspace...</p>
        </div>
      </div>
    )
  }

  const impactScore = profile?.impactScore || 0
  const isIdVerified = ['approved', 'verified', 'pending'].includes(profile?.verificationStatus || '')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950/50">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <OnboardingBanner 
            role="Guide" 
            profileCompleted={!!user?.profileCompleted}
            emailVerified={!!user?.emailVerified} 
            idVerified={isIdVerified} 
            userEmail={user?.email}
          />

          {/* HERO SECTION */}
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    {getGreeting()}
                  </div>
                  <VerificationBadge status={profile?.verificationStatus || 'not_submitted'} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                  Hi, {profile?.fullName.split(' ')[0] || 'Guide'}! <span className="text-blue-600">Growth</span> awaits.
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 font-medium">
                  Your impact score is up <span className="text-emerald-600 font-bold">+2.4%</span> this week.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/dashboard/guide/tours/new"
                  className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold shadow-xl shadow-blue-500/30 transition-all flex items-center gap-3 group"
                >
                  <PlusCircle className="w-5 h-5" />
                  Create New Tour
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <StatCard 
              icon={Calendar} 
              label="Total Trips" 
              value={profile?.totalTrips || 0} 
              color="blue" 
            />
            <StatCard 
              icon={Award} 
              label="Impact Score" 
              value={`${impactScore}%`} 
              color="amber" 
            />
            <StatCard 
              icon={TrendingUp} 
              label="Response Rate" 
              value="98%" 
              color="emerald" 
            />
            <StatCard 
              icon={DollarSign} 
              label="Pending Earnings" 
              value="$0.00" 
              color="purple" 
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* MAIN CONTENT AREA */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* IMPACT SCORE DETAIL */}
              <GlassCard className="p-8 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Performance Deep Dive</h2>
                      <p className="text-sm text-gray-500 font-medium">How your store is measured</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase tracking-wider text-gray-500">
                          <span>Completed Tours</span>
                          <span className="text-blue-600">40% weight</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-blue-600" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase tracking-wider text-gray-500">
                          <span>Average Rating</span>
                          <span className="text-amber-600">30% weight</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-amber-500" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-500/5 dark:bg-white/5 rounded-3xl p-6 border border-blue-500/10">
                      <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase mb-4">
                        <Info className="w-4 h-4" />
                        Quick Tip
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        Guide who respond to inquiries within 2 hours are 3x more likely to get the booking.
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* UPCOMING TRIPS PLACEHOLDER (Guide Version) */}
              <GlassCard className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Upcoming Schedule</h2>
                    <p className="text-sm text-gray-500 font-medium">Manage your booked tour occurrences</p>
                  </div>
                  <Link href="/dashboard/guide/tours" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                    View All
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No booked tours yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6 font-medium">
                    You haven't received any bookings for the upcoming week. Promote your tours on social media!
                  </p>
                  <Link 
                    href="/dashboard/guide/tours/new" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-black hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Manage Templates
                  </Link>
                </div>
              </GlassCard>
            </div>

            {/* SIDEBAR AREA */}
            <div className="space-y-6">
              {/* EARNINGS PROGRESS */}
              <GlassCard className="p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs mb-6">Wallet Balance</h3>
                
                <div className="mb-6">
                  <div className="text-4xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">$0.00</div>
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Ready for withdrawal
                  </p>
                </div>

                <button disabled className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                  Withdraw Funds
                </button>
              </GlassCard>

              {/* ACHIEVEMENTS */}
              <GlassCard className="p-6">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs mb-4 text-center">Badges</h3>
                <div className="flex justify-center gap-4 mb-6">
                  <motion.div whileHover={{ scale: 1.1 }} className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                    <Trophy className="w-6 h-6" />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                    <Crown className="w-6 h-6" />
                  </motion.div>
                  <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-300">
                    <Medal className="w-6 h-6" />
                  </div>
                </div>
                <button className="w-full text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">
                  View All Achievements
                </button>
              </GlassCard>

              {/* QUICK LINKS */}
              <GlassCard className="p-6">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs mb-4">Shortcuts</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/dashboard/guide/profile" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                    <Users className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Profile</span>
                  </Link>
                  <Link href="/dashboard/guide/tours" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group">
                    <Clock className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Activity</span>
                  </Link>
                  <Link href="/dashboard/guide/settings" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                    <LayoutDashboard className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Account</span>
                  </Link>
                  <Link href="/auth/reset-password" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group">
                    <Shield className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Security</span>
                  </Link>
                </div>
              </GlassCard>

              {/* PROMO / HANDBOOK */}
              <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-colors" />
                <Gem className="w-10 h-10 text-blue-300 mb-4" />
                <h3 className="text-xl font-black leading-tight mb-2">Guide Handbook</h3>
                <p className="text-sm text-blue-200/80 mb-6 font-medium">Tips from top performers on how to 3x your tour bookings.</p>
                <button className="px-6 py-2.5 bg-white text-gray-950 rounded-xl text-xs font-black hover:bg-blue-50 transition-colors">
                  Open Guide Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
