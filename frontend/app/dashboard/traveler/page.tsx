'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Calendar,
    Clock,
    MapPin,
    User,
    ChevronRight,
    Compass,
    Sparkles,
    Shield,
    ArrowRight,
    Search,
    CreditCard
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { travelerGetProfile, TravelerProfileResponse } from '@/src/lib/api/traveler'
import { getGreeting } from '@/src/lib/greeting'
import OnboardingBannerWrapper from '@/src/components/dashboard/OnboardingBannerWrapper'
import { toast } from 'react-hot-toast'
import { getTravelerBookings } from '@/src/lib/api/tours'
import { BookingResponse, BookingStatus } from '@/src/lib/types/tour.types'

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
    const [bookings, setBookings] = useState<BookingResponse[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [profileData, bookingsData] = await Promise.all([
                    travelerGetProfile(),
                    getTravelerBookings()
                ])
                setProfile(profileData)
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
                        <StatCard 
                            icon={Compass} 
                            label="Completed Trips" 
                            value={profile?.completedTrips || 0} 
                            color="blue" 
                        />
                        <StatCard 
                            icon={MapPin} 
                            label="Base Location" 
                            value={profile?.country || 'Lebanon'} 
                            color="amber" 
                        />
                        <StatCard 
                            icon={Shield} 
                            label="Profile Status" 
                            value={user?.profileCompleted ? 'Complete' : 'Pending'} 
                            color="purple" 
                        />
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* MAIN CONTENT AREA */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* PAYMENT ALERT BANNER */}
                            {bookings.some(b => b.status === 'PendingPayment') && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="mb-8 p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group"
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

                                {bookings.filter(b => 
                                    ['Confirmed', 'PendingGuide', 'InProgress', 'PendingPayment'].includes(b.status)
                                ).length > 0 ? (
                                    <div className="space-y-4">
                                        {bookings
                                            .filter(b => ['Confirmed', 'PendingGuide', 'InProgress', 'PendingPayment'].includes(b.status))
                                            .slice(0, 1)
                                            .map(booking => (
                                                <div key={booking.id} className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                            booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            booking.status === 'InProgress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            booking.status === 'PendingPayment' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                            'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                                        }`}>
                                                            {booking.status === 'PendingPayment' ? 'Unpaid' : booking.status}
                                                        </span>
                                                        <Link href={`/dashboard/traveler/bookings`} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
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
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Joined SafariHub</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* SIDEBAR AREA */}
                        <div className="space-y-6">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}