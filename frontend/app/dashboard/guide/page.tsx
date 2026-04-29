'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
 PlusCircle, 
 Calendar, 
 Clock, 
 CheckCircle, 
 AlertCircle, 
 Shield, 
 Sparkles, 
 ChevronRight, 
 ArrowRight,
 LayoutDashboard,
 MessageSquare,
 Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { getGreeting } from '@/src/lib/greeting'
import OnboardingBannerWrapper from '@/src/components/dashboard/OnboardingBannerWrapper'
import { toast } from 'react-hot-toast'
import { getGuideProfile, getGuideBookings, getGuideTours } from '@/src/lib/api/tours'
import { GuideProfileResponse } from '@/src/lib/types/guide.types'
import { GuideBookingResponse, BookingStatus, TourTemplateResponse, TourTemplateStatus } from '@/src/lib/types/tour.types'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'not_submitted' | 'verified'

// ============================================================================
// PREMIUM COMPONENTS
// ============================================================================

function GlassCard({ children, className ="" }: { children: React.ReactNode, className?: string }) {
 return (
 <div className={`surface-card  border border-theme rounded-3xl shadow-xl shadow-primary-light/5 ${className}`}>
 {children}
 </div>
 )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: 'blue' | 'amber' | 'emerald' | 'purple' }) {
 const colors: Record<string, string> = {
 blue: 'bg-primary-light dark:bg-primary-dark shadow-primary-light/20',
 amber: 'bg-accent-light dark:bg-accent-dark shadow-accent-light/20',
 emerald: 'bg-success-green shadow-success-green/20',
 purple: 'bg-primary-light shadow-primary-light/20'
 }

 return (
 <motion.div
 whileHover={{ y: -5 }}
 transition={{ type:"spring", stiffness: 400, damping: 10 }}
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
 <div className="text-3xl font-black text-theme-primary tracking-tight mb-1">
 {value}
 </div>
 <div className="text-sm font-semibold text-theme-muted uppercase tracking-wider">
 {label}
 </div>
 </div>
 </GlassCard>
 </motion.div>
 )
}

function VerificationBadge({ status }: { status: string }) {
 const normalizedStatus = (status?.toLowerCase() || 'not_submitted') as VerificationStatus
 
 const config = {
 pending: { bg: 'bg-accent-light/10 dark:bg-accent-dark/10', text: 'text-accent-light dark:text-accent-dark', icon: Clock, label: 'Pending' },
 approved: { bg: 'bg-success-green/10', text: 'text-success-green', icon: CheckCircle, label: 'Verified' },
 verified: { bg: 'bg-success-green/10', text: 'text-success-green', icon: CheckCircle, label: 'Verified' },
 rejected: { bg: 'bg-danger-red/10', text: 'text-danger-red', icon: AlertCircle, label: 'Failed' },
 not_submitted: { bg: 'surface-section', text: 'text-theme-secondary', icon: Shield, label: 'Not Verified' }
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
 const router = useRouter()
 const [loading, setLoading] = useState(true)
 const [profile, setProfile] = useState<GuideProfileResponse | null>(null)
 const [bookings, setBookings] = useState<GuideBookingResponse[]>([])
 const [tours, setTours] = useState<TourTemplateResponse[]>([])
 
 useEffect(() => {
 async function fetchDashboardData() {
 try {
 setLoading(true)
 const [profileRes, bookingsRes, toursRes] = await Promise.all([
 getGuideProfile(),
 getGuideBookings(),
 getGuideTours()
 ])
 setProfile(profileRes)
 setBookings(bookingsRes)
 setTours(toursRes)
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
 <div className="min-h-screen flex items-center justify-center surface-section">
 <div className="flex flex-col items-center gap-4">
 <div className="w-12 h-12 border-4 border-primary-light dark:border-primary-dark border-t-transparent rounded-full animate-spin" />
 <p className="text-theme-muted animate-pulse font-medium">Preparing your workspace...</p>
 </div>
 </div>
 )
 }

 const impactScore = profile?.impactScore || 0
 const isIdVerified = profile?.verificationStatus === 'approved'

 // Derived data
 const upcomingBookings = bookings
 .filter(b => b.status === BookingStatus.Confirmed || b.status === BookingStatus.PendingGuide)
 .filter(b => new Date(b.startTimeUtc) > new Date())
 .sort((a, b) => new Date(a.startTimeUtc).getTime() - new Date(b.startTimeUtc).getTime())
 .slice(0, 3)

 const recentActivities = bookings
 .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime())
 .slice(0, 5)
 .map(b => ({
 id: b.id.toString(),
 title: b.status === BookingStatus.PendingGuide ? 'New Booking Request' : 'Booking Confirmed',
 description: `${b.traveler?.fullName || 'Traveler'} booked ${b.tourTitle}`,
 timestamp: new Date(b.createdAtUtc).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
 icon: b.status === BookingStatus.PendingGuide ? AlertCircle : CheckCircle,
 color: b.status === BookingStatus.PendingGuide ? 'amber' : 'emerald' as const
 }))

 const totalEarnings = bookings
 .filter(b => b.status === BookingStatus.Completed || b.status === BookingStatus.Confirmed)
 .reduce((acc, b) => acc + Number(b.netEarnings || b.finalPrice), 0)

 const tourStats = {
 published: tours.filter(t => t.status === 'PUBLISHED').length,
 pending: tours.filter(t => t.status === 'PENDING_REVIEW').length,
 drafts: tours.filter(t => t.status === 'DRAFT').length,
 rejected: tours.filter(t => t.status === 'REJECTED').length,
 total: tours.length
 }

 const pendingRequests = bookings.filter(b => b.status === BookingStatus.PendingGuide).length
 
 const totalTravelers = bookings
 .filter(b => b.status === BookingStatus.Completed || b.status === BookingStatus.Confirmed)
 .reduce((acc, b) => acc + b.peopleCount, 0)

 const activeTours = tours.filter(t => t.status === 'PUBLISHED').length

 return (
 <div className="min-h-[calc(100vh-4rem)]">
 {/* Background Decorative Elements */}
 <div className="fixed inset-0 pointer-events-none overflow-hidden">
 <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-light/10 rounded-full blur-[120px]" />
 <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-success-green/10 rounded-full blur-[100px]" />
 </div>

 <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
 <div className="max-w-7xl mx-auto">
 
 <OnboardingBannerWrapper 
 verificationStatus={profile?.verificationStatus || 'not_submitted'} 
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
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark rounded-full text-xs font-bold uppercase tracking-widest">
 <Sparkles className="w-3 h-3" />
 {getGreeting()}
 </div>
 <VerificationBadge status={profile?.verificationStatus || 'not_submitted'} />
 </div>
 <h1 className="text-4xl sm:text-5xl font-black text-theme-primary tracking-tight leading-tight">
 Hi, {profile?.fullName.split(' ')[0] || 'Guide'}! <span className="text-primary-light dark:text-primary-dark">Growth</span> awaits.
 </h1>
 </div>

 <div className="flex gap-3">
 {(!user?.profileCompleted || !user?.emailVerified || profile?.verificationStatus !== 'approved') ? (
 <div className="relative group">
 <button
 disabled
 className="px-6 py-4 surface-section text-theme-muted rounded-3xl font-bold transition-all flex items-center gap-3 cursor-not-allowed border border-theme-strong"
 >
 <PlusCircle className="w-5 h-5" />
 Create New Tour
 <Shield className="w-4 h-4 text-accent-light dark:text-accent-dark" />
 </button>
 <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-4 surface-base text-white text-xs rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50 border border-theme-strong">
 <p className="font-bold mb-1 text-amber-400 flex items-center gap-1">
 <AlertCircle className="w-3 h-3" /> Verification Required
 </p>
 <div className="leading-relaxed opacity-80">
 To maintain marketplace trust, you must:
 <ul className="mt-1 list-disc list-inside space-y-0.5">
 {!user?.emailVerified && <li>Verify your email</li>}
 {!user?.profileCompleted && <li>Complete your profile</li>}
 {profile?.verificationStatus !== 'approved' && <li>Get ID approved</li>}
 </ul>
 </div>
 <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
 </div>
 </div>
 ) : (
 <Link
 href="/dashboard/guide/tours/new"
 className="px-6 py-4 bg-primary-light hover:bg-primary-light-hover text-white rounded-3xl font-bold shadow-xl shadow-primary-light/30 transition-all flex items-center gap-3 group"
 >
 <PlusCircle className="w-5 h-5" />
 Create New Tour
 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
 </Link>
 )}
 </div>
 </motion.div>
 </div>

 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.1 }}
 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
 >
 <StatCard 
 icon={Calendar} 
 label="Total Tours" 
 value={tourStats.total} 
 color="blue" 
 />
 <StatCard 
 icon={Clock} 
 label="Completed Trips" 
 value={profile?.totalTrips || 0} 
 color="amber" 
 />
 <StatCard 
 icon={LayoutDashboard} 
 label="Active Inventory" 
 value={activeTours} 
 color="emerald" 
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
 <h2 className="text-2xl font-black text-theme-primary tracking-tight">Tour Inventory</h2>
 <p className="text-sm text-theme-muted font-medium">Status of your tour templates</p>
 </div>
 <div className="p-3 bg-primary-light/10 rounded-2xl">
 <LayoutDashboard className="w-6 h-6 text-primary-light dark:text-primary-dark" />
 </div>
 </div>

 <div className="space-y-6">
 <div className="space-y-2">
 <div className="flex justify-between text-xs font-black uppercase tracking-wider text-theme-muted">
 <span>Portfolio Balance</span>
 <span className="text-primary-light dark:text-primary-dark">{tourStats.total} Total</span>
 </div>
 <div className="flex gap-1 h-2 surface-section rounded-full overflow-hidden">
 <div style={{ width: `${(tourStats.published / (tourStats.total || 1)) * 100}%` }} className="h-full bg-success-green" />
 <div style={{ width: `${(tourStats.pending / (tourStats.total || 1)) * 100}%` }} className="h-full bg-accent-light/10 dark:bg-accent-dark" />
 <div style={{ width: `${(tourStats.drafts / (tourStats.total || 1)) * 100}%` }} className="h-full bg-primary-light" />
 </div>
 <div className="flex gap-4 mt-2">
 <div className="flex items-center gap-1.5 text-[10px] font-bold text-success-green">
 <span className="w-1.5 h-1.5 rounded-full bg-success-green" />
 {tourStats.published} Published
 </div>
 <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent-light dark:text-accent-dark">
 <span className="w-1.5 h-1.5 rounded-full bg-accent-light/10 dark:bg-accent-dark" />
 {tourStats.pending} Under Review
 </div>
 <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary-light dark:text-primary-dark">
 <span className="w-1.5 h-1.5 rounded-full bg-primary-light" />
 {tourStats.drafts} Drafts
 </div>
 </div>
 </div>
 </div>
 </div>
 </GlassCard>

 {/* UPCOMING SCHEDULE */}
 <GlassCard className="p-8">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h2 className="text-2xl font-black text-theme-primary tracking-tight">Upcoming Schedule</h2>
 <p className="text-sm text-theme-muted font-medium">Manage your booked tour occurrences</p>
 </div>
 <Link href="/dashboard/guide/tours" className="text-sm font-bold text-primary-light dark:text-primary-dark hover:text-blue-700 flex items-center gap-1 group">
 View All
 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>

 {upcomingBookings.length > 0 ? (
 <div className="space-y-4">
 {upcomingBookings.map(b => (
 <div 
 key={b.id} 
 onClick={() => router.push(`/dashboard/guide/bookings/${b.id}`)}
 className="p-6 surface-section border border-theme rounded-[2rem] hover:border-primary-light/50 hover:surface-card dark:hover:surface-card transition-all group mb-4 cursor-pointer"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-primary-light/10 rounded-2xl flex items-center justify-center text-primary-light dark:text-primary-dark">
 <Calendar className="w-6 h-6" />
 </div>
 <div>
 <h4 className="font-black text-theme-primary tracking-tight group-hover:text-primary-light dark:text-primary-dark transition-colors">
 {b.tourTitle}
 </h4>
 <div className="flex items-center gap-3 mt-1">
 <span className="text-xs font-bold text-theme-muted flex items-center gap-1">
 <Clock className="w-3 h-3" />
 {new Date(b.startTimeUtc).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
 </span>
 <span className="text-xs font-bold text-primary-light dark:text-primary-dark flex items-center gap-1">
 <Users className="w-3 h-3" />
 {b.peopleCount} {b.peopleCount === 1 ? 'guest' : 'guests'}
 </span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <Link 
 href={`/dashboard/guide/messages?tourId=${b.tourId}&bookingId=${b.id}`}
 onClick={(e) => e.stopPropagation()}
 className="p-2 bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark rounded-xl hover:bg-primary-light/20 transition-all active:scale-95"
 title="Message Guest"
 >
 <MessageSquare className="w-4 h-4" />
 </Link>
 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
 b.status === BookingStatus.Confirmed 
 ? 'bg-success-green/10 text-success-green' 
 : 'bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark'
 }`}>
 {b.status}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="surface-section rounded-3xl p-12 text-center border-2 border-dashed border-theme">
 <div className="w-16 h-16 bg-primary-light/20 dark:bg-primary-dark/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
 <Calendar className="w-8 h-8 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 </div>
 <h3 className="text-xl font-bold text-theme-primary mb-2">No booked tours yet</h3>
 <p className="text-theme-muted max-w-xs mx-auto mb-6 font-medium">
 You haven't received any bookings for the upcoming week. Promote your tours on social media!
 </p>
 <Link 
 href="/dashboard/guide/tours/new" 
 className="inline-flex items-center gap-2 px-6 py-3 surface-card border border-theme rounded-2xl text-sm font-black hover:surface-section dark:hover:surface-card transition-colors"
 >
 Manage Templates
 </Link>
 </div>
 )}
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
