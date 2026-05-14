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
 LayoutDashboard,
 Users
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { getGreeting } from '@/src/lib/greeting'
import OnboardingBannerWrapper from '@/src/components/dashboard/OnboardingBannerWrapper'
import { toast } from 'react-hot-toast'
import { getGuideProfile, getGuideBookings, getGuideTours } from '@/src/lib/api/tours'
import { GuideProfileResponse } from '@/src/lib/types/guide.types'
import { GuideBookingResponse, BookingStatus, TourTemplateResponse } from '@/src/lib/types/tour.types'

// ============================================================================
// PREMIUM COMPONENTS
// ============================================================================

function GlassCard({ children, className ="" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`surface-card border border-theme rounded-2xl sm:rounded-3xl transition-all duration-300 ${className}`}>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: 'blue' | 'amber' | 'emerald' | 'purple' }) {
  const iconColors: Record<string, string> = {
    blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark border-primary-light/20',
    amber: 'bg-accent-light/10 text-accent-light dark:text-accent-dark border-accent-light/20',
    emerald: 'bg-success-green/10 text-success-green dark:text-emerald-400 border-success-green/20',
    purple: 'bg-primary-light/10 text-primary-light dark:text-primary-dark border-primary-light/20'
  }

  return (
    <GlassCard className="p-4 sm:p-6 group hover:border-primary-light/30 shadow-sm hover:shadow-lg">
      <div className={`p-2.5 rounded-xl ${iconColors[color]} w-fit mb-4 border transition-transform group-hover:scale-110`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-theme-primary mb-1 tracking-tight leading-none">
        {value}
      </div>
      <div className="text-[9px] sm:text-[10px] font-bold capitalize tracking-[0.15em] text-theme-muted opacity-80">
        {label}
      </div>
    </GlassCard>
  )
}

function VerificationBadge({ status }: { status: string }) {
  const normalizedStatus = (status?.toLowerCase() || 'not_submitted')
  
  const config: any = {
    pending: { bg: 'bg-accent-light/10', text: 'text-accent-light dark:text-accent-dark', icon: Clock, label: 'Pending' },
    approved: { bg: 'bg-success-green/10', text: 'text-success-green dark:text-emerald-400', icon: CheckCircle, label: 'Verified' },
    verified: { bg: 'bg-success-green/10', text: 'text-success-green dark:text-emerald-400', icon: CheckCircle, label: 'Verified' },
    rejected: { bg: 'bg-danger-red/10', text: 'text-danger-red dark:text-red-400', icon: AlertCircle, label: 'Failed' },
    not_submitted: { bg: 'surface-section', text: 'text-theme-secondary', icon: Shield, label: 'Not Verified' }
  }

  const { bg, text, icon: Icon, label } = config[normalizedStatus] || config.not_submitted

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${bg} ${text} text-[10px] font-bold capitalize tracking-normal border border-current/10`}>
      <Icon className="w-3 h-3" />
      {label}
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

import GuideDashboardLoading from './skeleton'

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
       const [p, b, t] = await Promise.all([getGuideProfile(), getGuideBookings(), getGuideTours()])
       setProfile(p); setBookings(b); setTours(t)
     } catch (err) {
       toast.error('Could not load some stats')
     } finally {
       setLoading(false)
     }
   }
   fetchDashboardData()
 }, [])

 if (loading) return <GuideDashboardLoading />

 // Derived stats
 const tourStats = {
   total: tours.length,
   published: tours.filter(t => t.status === 'PUBLISHED').length,
   pending: tours.filter(t => t.status === 'PENDING_REVIEW').length,
   drafts: tours.filter(t => t.status === 'DRAFT').length
 }
 const activeToursCount = tours.filter(t => t.status === 'PUBLISHED').length
 const upcomingBookings = bookings
   .filter(b => b.status === BookingStatus.Confirmed || b.status === BookingStatus.PendingGuide)
   .filter(b => new Date(b.startTimeUtc) > new Date())
   .sort((a, b) => new Date(a.startTimeUtc).getTime() - new Date(b.startTimeUtc).getTime())
   .slice(0, 3)

 return (
  <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
  <div className="relative pt-6 sm:pt-10 pb-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
  
  <OnboardingBannerWrapper verificationStatus={profile?.verificationStatus || 'not_submitted'} />

  {/* Hero Hub */}
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-8">
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-light/10 text-primary-light dark:text-primary-dark rounded-full text-[10px] font-bold capitalize tracking-[0.2em]">
          <Sparkles className="w-3.5 h-3.5" />
          {getGreeting()}
        </div>
        <VerificationBadge status={profile?.verificationStatus || 'not_submitted'} />
      </div>
      <h1 className="text-3xl sm:text-5xl font-bold text-theme-primary tracking-tight leading-tight capitalize drop-shadow-sm">
        Hi, {profile?.fullName.split(' ')[0] || 'Guide'}!
      </h1>
    </div>

    <div className="flex gap-4">
      {(!user?.profileCompleted || !user?.emailVerified || profile?.verificationStatus !== 'approved') ? (
        <div className="relative group w-full sm:w-auto">
          <button disabled className="w-full px-8 py-4 surface-section text-theme-muted rounded-2xl font-bold capitalize tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 cursor-not-allowed border-2 border-theme shadow-xl">
            <PlusCircle className="w-5 h-5" /> Create New Tour
            <Shield className="w-4 h-4 text-accent-light" />
          </button>
          <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 p-5 bg-slate-900 text-white text-[10px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl z-50 border border-slate-700">
            <p className="font-bold mb-2 text-amber-400 flex items-center gap-2 capitalize tracking-normal"><AlertCircle className="w-4 h-4" /> Locked</p>
            <div className="leading-relaxed opacity-90 font-bold">Verification required to publish:
              <ul className="mt-2 list-disc list-inside space-y-1">
                {!user?.emailVerified && <li>Verify Email</li>}
                {!user?.profileCompleted && <li>Complete Profile</li>}
                {profile?.verificationStatus !== 'approved' && <li>ID Approval</li>}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <Link href="/dashboard/guide/tours/new" className="w-full sm:w-auto px-8 py-4 bg-primary-light hover:bg-primary-light-hover text-white rounded-2xl font-bold capitalize tracking-[0.2em] text-[11px] transition-all shadow-2xl shadow-primary-light/30 flex items-center justify-center gap-3 active:scale-95">
          <PlusCircle className="w-5 h-5" /> Create New Tour
        </Link>
      )}
    </div>
  </motion.div>

  {/* Metric Grid */}
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
    <StatCard icon={Calendar} label="Inventory" value={tourStats.total} color="blue" />
    <StatCard icon={Clock} label="Trips" value={profile?.totalTrips || 0} color="amber" />
    <StatCard icon={LayoutDashboard} label="Active" value={activeToursCount} color="emerald" />
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
    <div className="lg:col-span-2 space-y-8 sm:space-y-12">
      
      {/* Portfolio Status */}
      <GlassCard className="p-6 sm:p-10 relative group overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-theme-primary capitalize tracking-tight">Portfolio Status</h2>
            <p className="text-[10px] sm:text-xs text-theme-muted font-bold capitalize tracking-normal opacity-70 mt-1">Template distribution</p>
          </div>
          <div className="p-4 bg-primary-light/10 rounded-2xl"><LayoutDashboard className="w-6 h-6 text-primary-light" /></div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-bold capitalize tracking-[0.2em] text-theme-muted px-1">
              <span>Performance</span>
              <span className="text-primary-light">{tourStats.total} Total</span>
            </div>
            <div className="flex gap-1.5 h-4 surface-section rounded-full overflow-hidden p-1 border border-theme">
              <div style={{ width: `${(tourStats.published / (tourStats.total || 1)) * 100}%` }} className="h-full bg-success-green rounded-full shadow-lg" />
              <div style={{ width: `${(tourStats.pending / (tourStats.total || 1)) * 100}%` }} className="h-full bg-accent-light rounded-full shadow-lg" />
              <div style={{ width: `${(tourStats.drafts / (tourStats.total || 1)) * 100}%` }} className="h-full bg-primary-light rounded-full shadow-lg" />
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4 mt-6">
              {[
                { label: 'Published', val: tourStats.published, color: 'bg-success-green', text: 'text-success-green' },
                { label: 'Review', val: tourStats.pending, color: 'bg-accent-light', text: 'text-accent-light' },
                { label: 'Drafts', val: tourStats.drafts, color: 'bg-primary-light', text: 'text-primary-light' }
              ].map(s => (
                <div key={s.label} className={`flex items-center gap-2.5 text-[10px] font-bold capitalize tracking-normal ${s.text}`}>
                  <div className={`w-2 h-2 rounded-full ${s.color} shadow-lg`} /> {s.val} {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Schedule Feed */}
      <GlassCard className="p-6 sm:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-theme-primary capitalize tracking-tight">Upcoming Feed</h2>
            <p className="text-[10px] sm:text-xs text-theme-muted font-bold capitalize tracking-normal opacity-70 mt-1">Confirmed & Pending trips</p>
          </div>
          <Link href="/dashboard/guide/tours" className="text-[10px] font-bold capitalize tracking-normal text-primary-light hover:opacity-70 flex items-center gap-1.5 group">
            View Feed <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.map(b => (
              <div key={b.id} onClick={() => router.push(`/dashboard/guide/bookings/${b.id}`)} className="p-5 sm:p-6 surface-section border border-theme rounded-2xl hover:border-primary-light/40 hover:shadow-2xl transition-all cursor-pointer active:scale-[0.98] group/item">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="w-14 h-14 bg-primary-light/10 rounded-2xl flex items-center justify-center text-primary-light flex-shrink-0 group-hover/item:scale-110 transition-transform">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm sm:text-lg text-theme-primary truncate group-hover/item:text-primary-light transition-colors tracking-tight">{b.tourTitle}</h4>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2">
                        <span suppressHydrationWarning className="text-[9px] sm:text-[10px] font-bold capitalize tracking-normal text-theme-muted flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-orange-500" /> {new Date(b.startTimeUtc).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold capitalize tracking-normal text-primary-light flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" /> {b.peopleCount} {b.peopleCount === 1 ? 'Guest' : 'Guests'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-4 sm:pt-0 border-t sm:border-0 border-theme">
                    <div className={`px-4 py-2 rounded-full text-[9px] font-bold capitalize tracking-[0.2em] border ${b.status === BookingStatus.Confirmed ? 'bg-success-green/10 text-success-green border-success-green/20' : 'bg-accent-light/10 text-accent-light border-accent-light/20'}`}>
                      {b.status}
                    </div>
                    <ChevronRight className="w-5 h-5 text-theme-muted sm:hidden" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-section rounded-[2rem] p-12 text-center border-2 border-dashed border-theme">
            <div className="w-20 h-20 bg-surface-base rounded-full flex items-center justify-center mx-auto mb-6 border border-theme shadow-inner">
              <Calendar className="w-10 h-10 text-theme-muted" />
            </div>
            <h3 className="text-sm font-bold text-theme-primary mb-3 capitalize tracking-normal">Quiet Horizon</h3>
            <p className="text-[10px] text-theme-muted max-w-xs mx-auto mb-8 font-bold capitalize tracking-normal opacity-60">Your upcoming schedule is currently clear.</p>
            <Link href="/dashboard/guide/tours" className="inline-flex items-center gap-3 px-8 py-4 bg-primary-light text-white text-[11px] font-bold capitalize tracking-normal rounded-2xl hover:scale-105 active:scale-95 shadow-2xl transition-all">
              Launch New Tour
            </Link>
          </div>
        )}
      </GlassCard>
    </div>
  </div>
  </div>
  </div>
  </div>
 );
}
