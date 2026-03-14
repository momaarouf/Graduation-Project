'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Calendar,
    Clock,
    MapPin,
    User,
    ChevronRight,
    Star,
    Award,
    TrendingUp,
    Ticket,
    Compass,
    Users,
    Sparkles,
    Shield,
    ArrowRight,
    Search
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { travelerGetProfile, TravelerProfileResponse } from '@/src/lib/api/traveler'
import OnboardingBannerWrapper from '@/src/components/dashboard/OnboardingBannerWrapper'
import { toast } from 'react-hot-toast'

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

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export default function TravelerDashboardPage() {
    const { user } = useAuth()
    const [profile, setProfile] = useState<TravelerProfileResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await travelerGetProfile()
                setProfile(data)
            } catch (error) {
                console.error('Failed to fetch traveler profile:', error)
                // Fallback to minimal data if profile fetch fails
                toast.error('Could not load detailed stats')
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950/50">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    
                    <OnboardingBannerWrapper />

                    {/* HERO SECTION */}
                    <div className="mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                        >
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                    <Sparkles className="w-3 h-3" />
                                    Welcome Back
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
                                    href="/"
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
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                    >
                        <StatCard 
                            icon={Compass} 
                            label="Completed Trips" 
                            value={profile?.completedTrips || 0} 
                            color="blue" 
                        />
                        <StatCard 
                            icon={Award} 
                            label="Loyalty Tier" 
                            value={profile?.loyaltyTier || 'Bronze'} 
                            color="amber" 
                        />
                        <StatCard 
                            icon={TrendingUp} 
                            label="Weekly Streak" 
                            value={profile?.streakCount || 0} 
                            color="emerald" 
                        />
                        <StatCard 
                            icon={Shield} 
                            label="Verification" 
                            value={profile?.emailVerified ? 'Verified' : 'Pending'} 
                            color="purple" 
                        />
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* MAIN CONTENT AREA */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* UPCOMING TRIPS PLACEHOLDER */}
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

                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No upcoming trips yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6 font-medium">
                                        Your passport is feeling lonely. Browse our curated tours and book your next escape!
                                    </p>
                                    <Link 
                                        href="/" 
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-black hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Explore Tours
                                    </Link>
                                </div>
                            </GlassCard>

                            {/* SAVED TOURS / RECENT TRIPS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <GlassCard className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl">
                                            <Star className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Joined the {profile?.loyaltyTier} Tier</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Completed profile setup</p>
                                        </div>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                                            <Ticket className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Referral Reward</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-4">
                                        Invite a friend and get <span className="text-gray-900 dark:text-white font-bold">$20 credit.</span>
                                    </p>
                                    <button className="w-full py-2 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-xl text-xs font-black hover:opacity-90 transition-opacity">
                                        Share Link
                                    </button>
                                </GlassCard>
                            </div>
                        </div>

                        {/* SIDEBAR AREA */}
                        <div className="space-y-6">
                            {/* LOYALTY PROGRESS */}
                            <GlassCard className="p-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs mb-6">Loyalty Progress</h3>
                                
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{profile?.loyaltyTier} Status</span>
                                    <span className="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                                        {profile?.completedTrips || 0} / 25 Trips
                                    </span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(((profile?.completedTrips || 0) / 25) * 100, 100)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                    {Math.max(25 - (profile?.completedTrips || 0), 0)} more trips to unlock <span className="text-gray-900 dark:text-white font-bold">Platinum</span> benefits!
                                </p>
                            </GlassCard>

                            {/* QUICK LINKS */}
                            <GlassCard className="p-6">
                                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs mb-4">Shortcuts</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/dashboard/traveler/profile" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                                        <User className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform mb-2" />
                                        <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Profile</span>
                                    </Link>
                                    <Link href="/dashboard/traveler/bookings" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group">
                                        <Clock className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform mb-2" />
                                        <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Activity</span>
                                    </Link>
                                    <Link href="/dashboard/traveler/settings" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                                        <Users className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform mb-2" />
                                        <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Account</span>
                                    </Link>
                                    <Link href="/auth/reset-password" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group">
                                        <Shield className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform mb-2" />
                                        <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Security</span>
                                    </Link>
                                </div>
                            </GlassCard>

                            {/* NEWSLETTER/PROMO */}
                            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors" />
                                <Sparkles className="w-10 h-10 text-blue-400 mb-4" />
                                <h3 className="text-xl font-black leading-tight mb-2">Beirut Edition Tours</h3>
                                <p className="text-sm text-gray-400 mb-6 font-medium">Get exclusive early access to hidden gems in Byblos.</p>
                                <button className="px-6 py-2.5 bg-white text-gray-950 rounded-xl text-xs font-black hover:bg-blue-50 transition-colors">
                                    Notify Me
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}