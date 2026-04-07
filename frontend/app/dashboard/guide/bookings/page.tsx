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
import { getGuideBookings, confirmBooking, rejectBooking } from '@/src/lib/api/tours'
import { GuideBookingResponse, BookingStatus } from '@/src/lib/types/tour.types'

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge = ({ status }: { status: BookingStatus }) => {
  const styles = {
    [BookingStatus.Confirmed]: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      icon: CheckCircle,
      label: 'Confirmed'
    },
    [BookingStatus.PendingGuide]: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
      icon: Clock,
      label: 'Pending'
    },
    [BookingStatus.Completed]: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/50',
      icon: CheckCircle,
      label: 'Completed'
    },
    [BookingStatus.Cancelled]: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: XCircle,
      label: 'Cancelled'
    },
    [BookingStatus.Rejected]: {
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800/50',
      icon: AlertCircle,
      label: 'Rejected'
    },
    // Fallbacks for other statuses
    [BookingStatus.PendingPayment]: {
      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
      text: 'text-indigo-700 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800/50',
      icon: CreditCard,
      label: 'Awaiting Payment'
    },
    [BookingStatus.InProgress]: {
      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
      text: 'text-indigo-700 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800/50',
      icon: RefreshCw,
      label: 'In Progress'
    },
    [BookingStatus.Waitlisted]: {
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800/50',
      icon: Users,
      label: 'Waitlisted'
    },
    [BookingStatus.Expired]: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-500',
      border: 'border-gray-200 dark:border-gray-700',
      icon: XCircle,
      label: 'Expired'
    }
  }

  const style = styles[status] || styles[BookingStatus.Expired]
  const Icon = style.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${style.bg} ${style.text} ${style.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {style.label}
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
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
  }

  return (
    <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">{label}</div>
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
  const [expanded, setExpanded] = React.useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const isPending = booking.status === BookingStatus.PendingGuide

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all shadow-sm">
      <div className="p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            {/* Tour Info */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                {booking.tourTitle}
              </h3>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5 font-mono">
                  REF: SH-{booking.id.toString().padStart(4, '0')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  {formatDate(booking.startTimeUtc)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={booking.status} />
            <Link
              href={`/dashboard/guide/bookings/${booking.id}`}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Traveler & Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-gray-100 dark:border-gray-800 my-4">
          {/* Traveler */}
          <div className="flex items-center gap-3">
            {booking.traveler ? (
              <Link
                href={`/travelers/${booking.traveler.id}`}
                className="group/traveler flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold group-hover/traveler:ring-2 group-hover/traveler:ring-blue-500 transition-all overflow-hidden">
                  {booking.traveler.fullName?.charAt(0) || 'T'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white group-hover/traveler:text-blue-600 dark:group-hover/traveler:text-blue-400 transition-colors">
                    {booking.traveler.fullName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'}
                    </span>
                    {booking.bookingMode && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${booking.bookingMode === 'Instant'
                        ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                        }`}>
                        {booking.bookingMode.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 font-bold">
                  T
                </div>
                <div>
                  <p className="font-bold text-gray-500 dark:text-gray-400 italic">
                    Traveler Info Hidden
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Price & Primary Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <div className="text-xl font-black text-gray-900 dark:text-white">
                {booking.currency} {booking.finalPrice.toFixed(2)}
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest ${
                booking.status === BookingStatus.PendingPayment 
                  ? 'text-indigo-600 dark:text-indigo-400 animate-pulse' 
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {booking.status === BookingStatus.PendingPayment ? 'Awaiting Payment' : 'Total Paid'}
              </div>
            </div>

            {isPending ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReject(booking.id)}
                  disabled={isActionLoading}
                  className="p-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
                  title="Reject booking"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onConfirm(booking.id)}
                  disabled={isActionLoading}
                  className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-2 px-4 font-bold text-xs"
                >
                  <Check className="w-4 h-4" />
                  Confirm
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push(`/dashboard/guide/bookings/${booking.id}`)}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                title="View details"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Details */}
        {expanded && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Contact Info</p>
                {booking.traveler ? (
                  <>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.traveler.email}</p>
                    <p className="text-gray-600 dark:text-gray-400">{booking.traveler.phoneE164}</p>
                  </>
                ) : (
                  <p className="text-gray-400 italic">Traveler info hidden</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Booked On</p>
                <p className="text-gray-600 dark:text-gray-400">{new Date(booking.createdAtUtc).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 px-1 py-1"
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideBookingsPage() {
  const [bookings, setBookings] = React.useState<GuideBookingResponse[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isActionLoading, setIsActionLoading] = React.useState(false)
  const [filterStatus, setFilterStatus] = React.useState<BookingStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  useBadgeReset('guide-bookings')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const res = await getGuideBookings()
      setBookings(res.data || [])
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err)
      toast.error('Failed to load bookings')
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

  // Filter bookings
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

    return {
      total: bookings.length,
      active: active.length,
      pending: pending.length,
      revenue
    }
  }, [bookings])

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (isLoading && bookings.length === 0) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 font-bold">Synchronizing bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                Income Hub
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">
                All Bookings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Manage incoming requests and upcoming tours
              </p>
            </div>
            <Link
              href="/dashboard/guide"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Calendar}
              label="Grand Total"
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              label="Active"
              value={stats.active}
              color="emerald"
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={stats.pending}
              color="amber"
            />
            <StatCard
              icon={DollarSign}
              label="Est. Revenue"
              value={`$${stats.revenue.toLocaleString()}`}
              color="purple"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search traveler, tour or reference..."
                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'all')}
                className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
                className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-blue-600 rounded-xl transition-all shadow-sm active:scale-95"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest">
              Showing {filteredBookings.length} results
            </span>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {paginatedBookings.length > 0 ? (
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
              <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto text-sm font-medium">
                  {searchTerm ? 'We couldn\'t find any bookings matching your search criteria.' : 'You haven\'t received any bookings for your tours yet.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => { setSearchTerm(''); setFilterStatus('all') }}
                    className="mt-6 text-blue-600 font-bold text-sm hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredBookings.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-8 px-2">
              <span className="text-sm font-medium text-gray-500">
                Page <span className="text-gray-900 dark:text-white font-bold">{currentPage}</span> of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0) }}
                  disabled={currentPage === 1}
                  className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0) }}
                  disabled={currentPage === totalPages}
                  className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
