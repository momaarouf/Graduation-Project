'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useBadgeReset } from '@/src/lib/hooks/useBadgeReset'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
 Calendar,
 Clock,
 Users,
 DollarSign,
 Eye,
 MessageSquare,
 Search,
 ChevronLeft,
 ChevronRight,
 RefreshCw,
 CheckCircle,
 XCircle,
 AlertCircle,
 User,
 Star,
 Download,
 Check,
 X,
 CreditCard
} from 'lucide-react'
import toast from 'react-hot-toast'
import { notificationsApi } from '@/src/lib/api/notifications'
import { getGuideBookings, confirmBooking, rejectBooking, getGuideWaitlist } from '@/src/lib/api/tours'
import { GuideBookingResponse, BookingStatus, WaitlistResponse } from '@/src/lib/types/tour.types'

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge = ({ status }: { status: BookingStatus }) => {
  const statusConfig: Record<BookingStatus, { className: string, icon: any, label: string }> = {
    [BookingStatus.Confirmed]: { className: 'badge-success', icon: CheckCircle, label: 'Confirmed' },
    [BookingStatus.PendingGuide]: { className: 'badge-warning', icon: Clock, label: 'Pending' },
    [BookingStatus.Completed]: { className: 'badge-primary', icon: CheckCircle, label: 'Completed' },
    [BookingStatus.Cancelled]: { className: 'badge-neutral', icon: XCircle, label: 'Cancelled' },
    [BookingStatus.Rejected]: { className: 'badge-danger', icon: AlertCircle, label: 'Rejected' },
    [BookingStatus.PendingPayment]: { className: 'badge-accent', icon: CreditCard, label: 'Awaiting Payment' },
    [BookingStatus.InProgress]: { className: 'badge-success', icon: RefreshCw, label: 'In Progress' },
    [BookingStatus.Waitlisted]: { className: 'badge-warning', icon: Users, label: 'Waitlisted' },
    [BookingStatus.Expired]: { className: 'badge-neutral', icon: XCircle, label: 'Expired' }
  }

  const cfg = statusConfig[status] || statusConfig[BookingStatus.Expired]
  const Icon = cfg.icon

  return (
    <span className={`badge-base ${cfg.className} gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  color: 'blue' | 'emerald' | 'amber' | 'purple'
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark',
    emerald: 'bg-success-green/10 text-success-green dark:text-emerald-400',
    amber: 'bg-accent-light/10 text-accent-light dark:text-accent-dark',
    purple: 'bg-primary-light/10 text-primary-light dark:text-primary-dark' // Standardized purple to blue/primary
  }

  return (
    <div className="p-3.5 sm:p-5 surface-card border border-theme rounded-xl hover:shadow-md transition-shadow active:scale-[0.98]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`p-1.5 sm:p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
      <div className="space-y-0.5 sm:space-y-1">
        <div className="text-lg sm:text-2xl font-bold text-theme-primary leading-tight">{value}</div>
        <div className="text-[9px] sm:text-[10px] font-bold text-theme-muted uppercase tracking-widest">{label}</div>
      </div>
    </div>
  )
}

// ============================================================================
// BOOKING CARD COMPONENT
// ============================================================================

interface BookingCardProps {
 booking: GuideBookingResponse
 onConfirm: (id: number) => void
 onReject: (id: number) => void
 isActionLoading: boolean
}

const BookingCard = ({ booking, onConfirm, onReject, isActionLoading }: BookingCardProps) => {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const isPending = booking.status === BookingStatus.PendingGuide

  return (
    <div className="surface-card border border-theme rounded-xl overflow-hidden hover:shadow-md transition-all shadow-sm active:scale-[0.99]">
      <div className="p-3.5 sm:p-5">
        {/* Row 1: Title & Price */}
        <div className="flex justify-between items-start gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-[15px] sm:text-base text-theme-primary truncate uppercase tracking-tight">
              {booking.tourTitle}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-theme-muted bg-surface-base px-1.5 py-0.5 rounded border border-theme">
                #{booking.id.toString().padStart(4, '0')}
              </span>
              <span className="text-[10px] text-theme-muted flex items-center gap-1 font-bold uppercase tracking-widest">
                <Calendar className="w-3 h-3 text-theme-secondary" />
                {formatDate(booking.startTimeUtc)}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-base sm:text-lg font-extrabold text-price leading-none tracking-tight">
              {booking.currency} {booking.finalPrice.toFixed(0)}
            </div>
            <div className="mt-2 flex justify-end">
              <StatusBadge status={booking.status} />
            </div>
          </div>
        </div>

        {/* Row 2: Traveler & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-theme">
          <div className="flex items-center gap-2 min-w-0">
            {booking.traveler ? (
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary-light/10 flex items-center justify-center text-primary-light text-[10px] font-bold shrink-0 border border-primary-light/20">
                  {booking.traveler.fullName?.charAt(0) || 'T'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-theme-primary truncate max-w-[100px] sm:max-w-none uppercase tracking-tight">
                    {booking.traveler.fullName}
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] text-theme-muted uppercase font-bold tracking-widest">
                    <Users className="w-2.5 h-2.5 text-theme-secondary" />
                    {booking.peopleCount} {booking.peopleCount === 1 ? 'PAX' : 'PAX'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Traveler Hidden</div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/dashboard/guide/messages?tourId=${booking.tourId}&bookingId=${booking.id}`}
              className="w-8 h-8 flex items-center justify-center bg-surface-base text-primary-light border border-theme rounded-lg hover:bg-surface-hover transition-all active:scale-90"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
            <Link
              href={`/dashboard/guide/bookings/${booking.id}`}
              className="w-8 h-8 flex items-center justify-center text-theme-muted hover:text-theme-primary rounded-lg transition-all active:scale-90"
            >
              <Eye className="w-4 h-4" />
            </Link>

            {isPending && (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  onClick={() => onReject(booking.id)}
                  className="w-8 h-8 flex items-center justify-center badge-danger border border-danger-red/20 rounded-lg active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onConfirm(booking.id)}
                  className="h-8 px-4 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest active:scale-95 shadow-sm shadow-emerald-500/20"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// WAITLIST CARD COMPONENT
// ============================================================================

interface WaitlistCardProps {
 entry: WaitlistResponse
}

const WaitlistCard = ({ entry }: WaitlistCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="surface-card border border-theme rounded-xl overflow-hidden hover:shadow-md transition-all shadow-sm active:scale-[0.99]">
      <div className="p-3.5 sm:p-5">
        <div className="flex justify-between items-start gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-[15px] sm:text-base text-theme-primary truncate uppercase tracking-tight">
              {entry.tourTitle}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold badge-primary px-2 py-0.5 rounded-full uppercase tracking-widest">
                POS: {entry.position}
              </span>
              <span className="text-[10px] text-theme-muted flex items-center gap-1 font-bold uppercase tracking-widest">
                <Calendar className="w-3 h-3 text-theme-secondary" />
                {formatDate(entry.startTimeUtc)}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-base sm:text-lg font-extrabold text-theme-primary leading-none tracking-tight">
              {entry.peopleCount} <span className="text-[9px] text-theme-muted uppercase font-bold tracking-widest">Seats</span>
            </div>
            <div className="mt-2 flex justify-end">
              <span className="badge-base badge-neutral gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                Waiting
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-theme">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-light/10 flex items-center justify-center text-primary-light text-xs font-bold shrink-0">
              {entry.travelerName?.charAt(0) || 'T'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-theme-primary truncate max-w-[120px]">
                {entry.travelerName}
              </p>
              <p className="text-[10px] text-theme-muted truncate">{entry.travelerEmail}</p>
            </div>
          </div>
          <Link
            href={`/dashboard/guide/messages?tourId=${entry.occurrenceId}&travelerId=${entry.travelerId}`}
            className="w-8 h-8 flex items-center justify-center bg-primary-light/5 text-primary-light border border-primary-light/20 rounded-lg active:scale-90"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideBookingsPage() {
  const [bookings, setBookings] = React.useState<GuideBookingResponse[]>([])
  const [waitlistEntries, setWaitlistEntries] = React.useState<WaitlistResponse[]>([])
  const [activeTab, setActiveTab] = React.useState<'bookings' | 'waitlist'>('bookings')
  const [isLoading, setIsLoading] = React.useState(true)
  const [isActionLoading, setIsActionLoading] = React.useState(false)
  const [filterStatus, setFilterStatus] = React.useState<BookingStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  useBadgeReset('guide-bookings')

  useEffect(() => {
    fetchBookings()
    notificationsApi.markBookingNotificationsRead()
      .then(() => {
        window.dispatchEvent(new CustomEvent('badge-refresh'))
      })
      .catch(err => console.error('Failed to clear notifications:', err))
  }, [])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const [bookingsRes, waitlistRes] = await Promise.all([
        getGuideBookings(),
        getGuideWaitlist()
      ])
      setBookings(bookingsRes || [])
      setWaitlistEntries(waitlistRes || [])
    } catch (err: any) {
      console.error('Failed to fetch data:', err)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async (id: number) => {
    setIsActionLoading(true)
    try {
      await confirmBooking(id)
      toast.success('Booking confirmed!')
      window.dispatchEvent(new CustomEvent('badge-refresh'))
      fetchBookings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to confirm booking')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleReject = async (id: number) => {
    if (!confirm('Are you sure you want to reject this booking?')) return
    setIsActionLoading(true)
    try {
      await rejectBooking(id)
      toast.success('Booking rejected')
      window.dispatchEvent(new CustomEvent('badge-refresh'))
      fetchBookings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject booking')
    } finally {
      setIsActionLoading(false)
    }
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (filterStatus !== 'all' && booking.status !== filterStatus) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (
          booking.traveler?.fullName?.toLowerCase().includes(term) ||
          booking.id.toString().includes(term) ||
          booking.tourTitle.toLowerCase().includes(term)
        )
      }
      return true
    })
  }, [bookings, filterStatus, searchTerm])

  const stats = useMemo(() => {
    const active = bookings.filter(b => b.status === BookingStatus.Confirmed || b.status === BookingStatus.PendingGuide)
    const pending = bookings.filter(b => b.status === BookingStatus.PendingGuide)
    const revenue = bookings
      .filter(b => b.status === BookingStatus.Confirmed || b.status === BookingStatus.Completed)
      .reduce((sum, b) => sum + b.finalPrice, 0)

    const waitlistSize = waitlistEntries.reduce((sum, e) => sum + e.peopleCount, 0)

    return {
      total: bookings.length,
      active: active.length,
      pending: pending.length,
      revenue,
      waitlistSize,
      waitlistCount: waitlistEntries.length
    }
  }, [bookings, waitlistEntries])

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (isLoading && bookings.length === 0) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-primary-light animate-spin" />
          <p className="text-theme-secondary font-bold">Synchronizing bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar">
      <div className="max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
            <div className="text-left">
              <h1 className="text-2xl sm:text-4xl font-bold text-theme-primary mb-1 sm:mb-2 tracking-tight">
                All <span className="text-primary-light dark:text-primary-dark">Bookings</span>.
              </h1>
              <p className="text-xs sm:text-sm text-theme-secondary font-medium">
                Manage incoming requests and upcoming tours
              </p>
            </div>
            <Link
              href="/dashboard/guide"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 surface-card border border-theme text-theme-secondary font-bold rounded-xl hover:surface-section transition-all shadow-sm active:scale-95 text-[10px] uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4 text-theme-secondary" />
              Back to Dashboard
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <StatCard icon={Calendar} label="Grand Total" value={stats.total} color="blue" />
            <StatCard icon={CheckCircle} label="Active" value={stats.active} color="emerald" />
            <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
            <StatCard icon={Users} label="Waitlist" value={stats.waitlistSize} color="purple" />
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 surface-section rounded-xl mb-6 w-full sm:w-fit overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'bookings'
                  ? 'surface-card text-primary-light dark:text-primary-dark shadow-sm'
                  : 'text-theme-muted hover:text-theme-secondary'
              }`}
            >
              Bookings ({filteredBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'waitlist'
                  ? 'surface-card text-primary-light dark:text-primary-dark shadow-sm'
                  : 'text-theme-muted hover:text-theme-secondary'
              }`}
            >
              Waitlist ({waitlistEntries.length})
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search traveler, tour or reference..."
                className="w-full pl-10 pr-4 py-3 surface-card border border-theme rounded-xl text-sm text-theme-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light/20 transition-all shadow-sm"
              />
            </div>

            <div className="flex gap-2 min-w-0">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'all')}
                className="flex-1 min-w-0 px-4 py-3 surface-card border border-theme rounded-xl text-sm font-bold text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light shadow-sm appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value={BookingStatus.PendingGuide}>Pending Approval</option>
                <option value={BookingStatus.Confirmed}>Confirmed</option>
                <option value={BookingStatus.Completed}>Completed</option>
                <option value={BookingStatus.Cancelled}>Cancelled</option>
                <option value={BookingStatus.Rejected}>Rejected</option>
              </select>

              <button
                onClick={fetchBookings}
                className="w-12 h-12 flex items-center justify-center surface-card border border-theme text-theme-muted hover:text-primary-light rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">
              Showing {activeTab === 'bookings' ? filteredBookings.length : waitlistEntries.length} {activeTab}
            </span>
          </div>

          {/* Content List */}
          <div className="space-y-4">
            {activeTab === 'bookings' ? (
              paginatedBookings.length > 0 ? (
                paginatedBookings.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                    isActionLoading={isActionLoading}
                  />
                ))
              ) : (
                <div className="text-center py-20 surface-card border border-theme rounded-2xl shadow-sm">
                  <div className="w-16 h-16 mx-auto mb-4 surface-section rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-300 " />
                  </div>
                  <h3 className="text-xl font-bold text-theme-primary mb-2">
                    No bookings found
                  </h3>
                  <p className="text-theme-secondary max-w-xs mx-auto text-sm font-medium">
                    {searchTerm ? 'We couldn\'t find any bookings matching your search criteria.' : 'You haven\'t received any bookings for your tours yet.'}
                  </p>
                </div>
              )
            ) : (
              waitlistEntries.length > 0 ? (
                waitlistEntries.map(entry => (
                  <WaitlistCard key={entry.id} entry={entry} />
                ))
              ) : (
                <div className="text-center py-20 surface-card border border-theme rounded-2xl shadow-sm">
                  <div className="w-16 h-16 mx-auto mb-4 surface-section rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-gray-300 " />
                  </div>
                  <h3 className="text-xl font-bold text-theme-primary mb-2">
                    Waitlist is empty
                  </h3>
                  <p className="text-theme-secondary max-w-xs mx-auto text-sm font-medium">
                    There are no travelers currently waiting for your full tours.
                  </p>
                </div>
              )
            )}
          </div>

          {/* Pagination */}
          {filteredBookings.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-8 px-2">
              <span className="text-sm font-medium text-theme-muted">
                Page <span className="text-theme-primary font-bold">{currentPage}</span> of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0) }}
                  disabled={currentPage === 1}
                  className="p-3 surface-card border border-theme rounded-xl text-theme-muted hover:text-primary-light disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0) }}
                  disabled={currentPage === totalPages}
                  className="p-3 surface-card border border-theme rounded-xl text-theme-muted hover:text-primary-light disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  )
}
