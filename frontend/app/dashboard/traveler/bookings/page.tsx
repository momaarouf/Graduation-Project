'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useBadgeReset } from '@/src/lib/hooks/useBadgeReset'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
 getTravelerBookings, 
 cancelBooking, 
 getMyWaitlist, 
 leaveWaitlist, 
 getTravelerReviews 
} from '@/src/lib/api/tours'
import { notificationsApi } from '@/src/lib/api/notifications'
import { BookingResponse, BookingStatus, WaitlistResponse } from '@/src/lib/types/tour.types'
import { usePaymentCountdown } from '@/src/hooks/usePaymentCountdown'
import {
 Calendar,
 Clock,
 MapPin,
 CheckCircle,
 XCircle,
 AlertCircle,
 ChevronRight,
 Search,
 Filter,
 Eye,
 Ticket,
 Download,
 Star,
 Smartphone,
 RefreshCw,
 CreditCard,
 Loader2,
 AlertTriangle,
 User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================================================
// STATUS BADGE
// ============================================================================

function StatusBadge({ status }: { status: BookingStatus }) {
  const statusConfig: Record<BookingStatus, { className: string, icon: any, label: string }> = {
    [BookingStatus.Confirmed]: { className: 'badge-success', icon: CheckCircle, label: 'Confirmed' },
    [BookingStatus.PendingGuide]: { className: 'badge-warning', icon: Clock, label: 'Pending' },
    [BookingStatus.Completed]: { className: 'badge-primary', icon: CheckCircle, label: 'Completed' },
    [BookingStatus.Cancelled]: { className: 'badge-danger', icon: XCircle, label: 'Cancelled' },
    [BookingStatus.Rejected]: { className: 'badge-neutral', icon: XCircle, label: 'Rejected' },
    [BookingStatus.PendingPayment]: { className: 'badge-accent', icon: CreditCard, label: 'Awaiting' },
    [BookingStatus.Expired]: { className: 'badge-neutral', icon: AlertCircle, label: 'Expired' },
    [BookingStatus.InProgress]: { className: 'badge-success', icon: RefreshCw, label: 'In Progress' },
    [BookingStatus.Waitlisted]: { className: 'badge-warning', icon: Clock, label: 'Waitlist' }
  }
  const cfg = statusConfig[status] || statusConfig[BookingStatus.PendingGuide]
  return (
    <span className={`badge-base ${cfg.className} gap-1.5 shadow-sm transition-all text-[9px] uppercase tracking-widest py-1`}>
      <cfg.icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

// ============================================================================
// PAYMENT COUNTDOWN
// ============================================================================

function PaymentCountdownPill({ deadlineUtc, onExpired }: { deadlineUtc: string, onExpired?: () => void }) {
 const countdown = usePaymentCountdown(deadlineUtc)
 const firedRef = useRef(false)

 useEffect(() => {
 if (countdown?.isExpired && !firedRef.current && onExpired) {
 firedRef.current = true
 onExpired()
 }
 }, [countdown?.isExpired, onExpired])

 if (!countdown) return null
 if (countdown.isExpired) {
 return (
 <div className="flex items-center gap-2 px-3 py-2 badge-danger rounded-xl mb-4">
 <XCircle className="w-4 h-4" />
 <span className="text-[10px] font-bold uppercase tracking-widest">Expired</span>
 </div>
 )
 }

 const isCritical = countdown.urgency === 'critical'
 const badgeClass = isCritical ? 'badge-danger' : 'badge-warning'

 return (
 <div className={`flex items-center gap-3 px-4 py-2.5 ${badgeClass} rounded-xl mb-4 group`}>
 <Clock className={`w-4 h-4 ${isCritical ? 'animate-pulse' : ''}`} />
  <span className="text-[10px] font-bold uppercase tracking-widest">
  Pay in: {countdown.minutesLeft}m {countdown.secondsLeft}s
  </span>
 </div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TravelerBookingsPage() {
 const router = useRouter()
 const [bookings, setBookings] = useState<BookingResponse[]>([])
 const [waitlistEntries, setWaitlistEntries] = useState<WaitlistResponse[]>([])
 const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set())
 const [isLoading, setIsLoading] = useState(true)
 const [activeFilter, setActiveFilter] = useState('all')
 const [searchQuery, setSearchQuery] = useState('')

 useBadgeReset('traveler-bookings')

 const fetchBookings = async () => {
 setIsLoading(true)
 try {
 const [b, w, r] = await Promise.all([
 getTravelerBookings(),
 getMyWaitlist().catch(() => []),
 getTravelerReviews().catch(() => ({ content: [] }))
 ])
 setBookings(b || []); setWaitlistEntries(w || [])
 setReviewedIds(new Set((r?.content || []).map((x: any) => x.bookingId)))
 } catch (err) {
 toast.error('Failed to sync history')
 } finally {
 setIsLoading(false)
 }
 }

 useEffect(() => {
 fetchBookings()
 notificationsApi.markBookingNotificationsRead().then(() => window.dispatchEvent(new CustomEvent('badge-refresh')))
 }, [])

 const filteredBookings = useMemo(() => {
 return bookings.filter(b => {
 if (activeFilter !== 'all') {
 if (activeFilter === 'upcoming') {
 if (!['Confirmed', 'PendingGuide', 'PendingPayment'].includes(b.status)) return false
 } else if (activeFilter === 'completed') {
 if (b.status !== BookingStatus.Completed) return false
 } else if (activeFilter === 'cancelled') {
 if (b.status !== BookingStatus.Cancelled && b.status !== BookingStatus.Rejected) return false
 }
 }
 if (searchQuery) {
 const q = searchQuery.toLowerCase()
 return b.tourTitle.toLowerCase().includes(q) || b.id.toString().includes(q)
 }
 return true
 })
 }, [bookings, activeFilter, searchQuery])

 if (isLoading && bookings.length === 0) {
 return (
 <div className="min-h-screen flex items-center justify-center surface-section">
 <div className="flex flex-col items-center gap-4">
 <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
 <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted animate-pulse">Syncing Expedition Log...</p>
 </div>
 </div>
 )
 }

 return (
 <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
 <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
 
 {/* Header Hub */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
  <div className="space-y-1">
  <h1 className="text-2xl sm:text-4xl font-extrabold text-theme-primary tracking-tight leading-tight uppercase">
  My <span className="text-primary-light">Bookings</span>.
  </h1>
  <p className="text-[10px] text-theme-secondary font-black uppercase tracking-widest opacity-70">
  Journey History & Reservation Hub
  </p>
  </div>
 <Link href="/tours" className="w-full sm:w-auto px-8 py-4 bg-primary-light hover:bg-primary-light-hover text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-2xl shadow-primary-light/30 flex items-center justify-center gap-3 active:scale-95">
 <Calendar className="w-5 h-5" /> Explore Tours
 </Link>
 </div>

 {/* Filter Hub */}
 <div className="space-y-4">
  <div className="flex p-1 surface-card border border-theme rounded-2xl overflow-x-auto no-scrollbar shadow-sm items-center gap-1">
  {['all', 'upcoming', 'completed', 'cancelled', 'waitlist'].map((f) => (
  <button 
    key={f} 
    onClick={() => setActiveFilter(f)} 
    className={`flex-shrink-0 min-w-[80px] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center text-center ${
      activeFilter === f 
        ? 'bg-primary-light text-white shadow-lg shadow-primary-light/20' 
        : 'text-theme-muted hover:text-theme-primary hover:bg-surface-base'
    }`}
  >
  {f}
  </button>
  ))}
  </div>
 <div className="relative group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
 <input type="text" placeholder="Search reservations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-4 surface-card border border-theme rounded-2xl text-[11px] font-black uppercase tracking-widest text-theme-primary focus:ring-2 focus:ring-primary-light transition-all shadow-sm" />
 </div>
 </div>

 {/* Booking Grid */}
 <div className="space-y-6 min-h-[400px]">
 <AnimatePresence mode="popLayout">
 {filteredBookings.length > 0 ? 
  filteredBookings.map((b, idx) => (
  <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group surface-card border border-theme rounded-2xl sm:rounded-3xl hover:border-primary-light/40 hover:shadow-2xl transition-all duration-500 overflow-hidden">
  <div className="flex flex-row">
  {/* Cover Area */}
  <div className="relative w-32 sm:w-60 flex-shrink-0 surface-base overflow-hidden border-r border-theme">
  {b.tourCoverImageUrl ? (
  <Image src={b.tourCoverImageUrl} alt={b.tourTitle} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
  ) : (
  <div className="flex flex-col items-center justify-center h-full text-theme-muted opacity-30"><MapPin className="w-6 h-6 mb-1" /><span className="text-[9px] font-bold uppercase tracking-tight">No Media</span></div>
  )}
  <div className="absolute top-2 left-2 origin-top-left"><StatusBadge status={b.status} /></div>
  </div>

  {/* Content Area */}
  <div className="flex-1 p-3 sm:p-6 flex flex-col justify-between min-w-0 min-h-[140px] sm:min-h-0">
  <div className="space-y-1 sm:space-y-4">
  <h3 className="text-[14px] sm:text-xl font-extrabold text-theme-primary line-clamp-1 sm:line-clamp-none uppercase tracking-tight leading-tight">{b.tourTitle}</h3>
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-tight text-theme-muted">
  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-theme-secondary" /> {new Date(b.startTimeUtc).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
  <span className="flex items-center gap-1.5"><Smartphone className="w-3 h-3 text-theme-secondary" /> ID: {b.id}</span>
  <span className="flex items-center gap-1.5 border-l border-theme pl-3"><User className="w-3 h-3 text-theme-secondary" /> {b.peopleCount} {b.peopleCount === 1 ? 'Guest' : 'Guests'}</span>
  </div>

  {b.status === BookingStatus.PendingPayment && b.paymentDeadlineUtc && (
  <div className="mt-2"><PaymentCountdownPill deadlineUtc={b.paymentDeadlineUtc} onExpired={() => fetchBookings()} /></div>
  )}
  </div>

  <div className="flex items-end justify-between mt-auto pt-3 border-t border-theme">
  <div className="flex flex-col">
  <span className="text-[8px] font-bold text-theme-muted uppercase tracking-widest leading-none mb-0.5">Total Amount</span>
  <div className="text-[14px] sm:text-2xl font-extrabold text-price leading-none tracking-tight">{b.currency} {b.finalPrice}</div>
  </div>
  <div className="flex items-center gap-1.5">
  <Link href={`/dashboard/traveler/bookings/${b.id}`} className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-surface-base hover:bg-surface-hover border border-theme text-theme-primary text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-1 active:scale-95">Details</Link>
  {b.qrCode && b.status === BookingStatus.Confirmed && <Link href={`/dashboard/traveler/bookings/${b.id}/ticket`} className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 active:scale-95 shadow-sm shadow-green-500/20"><Ticket className="w-3 h-3" /> Ticket</Link>}
  {b.status === BookingStatus.Completed && !reviewedIds.has(b.id) && <Link href={`/bookings/${b.id}/review`} className="px-2.5 py-1.5 sm:px-4 sm:py-2 btn-accent text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all active:scale-95 flex items-center gap-1 shadow-sm shadow-orange-500/20"><Star className="w-3 h-3" /> Review</Link>}
  <button className="p-1.5 text-theme-muted hover:text-theme-primary transition-colors ml-1"><Download className="w-4 h-4" /></button>
  </div>
  </div>
  </div>
  </div>
  </motion.div>
  )) : (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 surface-card border-2 border-dashed border-theme rounded-[2.5rem] flex flex-col items-center">
  <div className="w-20 h-20 surface-base rounded-full flex items-center justify-center mb-6 shadow-inner border border-theme"><Calendar className="w-10 h-10 text-theme-muted opacity-30" /></div>
  <h3 className="text-xl font-extrabold text-theme-primary uppercase tracking-tight mb-2">History Clear</h3>
  <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted opacity-70 max-w-xs mb-8">You haven't embarked on any expeditions yet. Explore our curated tours to start your story.</p>
  <Link href="/tours" className="btn-primary px-10 py-4 text-[11px] font-extrabold uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all">Start Your Search</Link>
  </motion.div>
  )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 )
}
