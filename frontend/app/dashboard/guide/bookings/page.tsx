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
 const styles = {
 [BookingStatus.Confirmed]: {
 bg: 'bg-success-green/10 dark:bg-success-green/10',
 text: 'text-emerald-700 dark:text-emerald-400',
 border: 'border-success-green dark:border-success-green/50',
 icon: CheckCircle,
 label: 'Confirmed'
 },
 [BookingStatus.PendingGuide]: {
 bg: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-accent-light/10 dark:bg-accent-dark/10',
 text: 'text-accent-light dark:text-accent-dark dark:text-amber-400',
 border: 'border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/50',
 icon: Clock,
 label: 'Pending'
 },
 [BookingStatus.Completed]: {
 bg: 'bg-primary-light/10 dark:bg-primary-light/10',
 text: 'text-blue-700 dark:text-primary-dark ',
 border: 'border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark/50',
 icon: CheckCircle,
 label: 'Completed'
 },
 [BookingStatus.Cancelled]: {
 bg: 'surface-section',
 text: 'text-theme-secondary ',
 border: 'border-theme',
 icon: XCircle,
 label: 'Cancelled'
 },
 [BookingStatus.Rejected]: {
 bg: 'bg-danger-red/10 dark:bg-danger-red/10',
 text: 'text-red-700 dark:text-red-400',
 border: 'border-danger-red dark:border-danger-red/50',
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
 bg: 'surface-section',
 text: 'text-theme-secondary ',
 border: 'border-theme',
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
 blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark ',
 emerald: 'bg-success-green/10 dark:bg-emerald-950/30 text-success-green dark:text-emerald-400',
 amber: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-950/30 text-accent-light dark:text-accent-dark dark:text-amber-400',
 purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
 }

 return (
 <div className="p-5 surface-card border border-theme rounded-xl hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between mb-3">
 <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
 <Icon className="w-5 h-5" />
 </div>
 </div>
 <div className="space-y-1">
 <div className="text-2xl font-bold text-theme-primary">{value}</div>
 <div className="text-xs text-theme-muted uppercase tracking-wider font-bold">{label}</div>
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
 <div className="surface-card border border-theme rounded-xl overflow-hidden hover:shadow-lg transition-all shadow-sm">
 <div className="p-5">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
 <div className="flex items-start gap-3">
 {/* Tour Info */}
 <div>
 <h3 className="font-bold text-lg text-theme-primary mb-1">
 {booking.tourTitle}
 </h3>
 <div className="flex items-center gap-4 text-xs text-theme-muted ">
 <span className="flex items-center gap-1.5 font-mono">
 REF: SH-{booking.id.toString().padStart(4, '0')}
 </span>
 <span className="flex items-center gap-1.5">
 <Calendar className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark" />
 {formatDate(booking.startTimeUtc)}
 </span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <StatusBadge status={booking.status} />
 <Link
 href={`/dashboard/guide/bookings/${booking.id}`}
 className="p-2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 hover:surface-section dark:hover:surface-card rounded-lg transition-colors"
 >
 <Eye className="w-4 h-4" />
 </Link>
 </div>
 </div>

 {/* Traveler & Details */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-theme my-4">
 {/* Traveler */}
 <div className="flex items-center gap-3">
 {booking.traveler ? (
 <Link
 href={`/travelers/${booking.traveler.id}`}
 className="group/traveler flex items-center gap-3"
 >
 <div className="w-10 h-10 rounded-full bg-primary-light/20 dark:bg-primary-dark/20 flex items-center justify-center text-primary-light dark:text-primary-dark dark:text-primary-dark font-bold group-hover/traveler:ring-2 group-hover/traveler:ring-primary-light dark:ring-primary-dark transition-all overflow-hidden">
 {booking.traveler.fullName?.charAt(0) || 'T'}
 </div>
 <div>
 <p className="font-bold text-theme-primary group-hover/traveler:text-primary-light dark:text-primary-dark dark:group-hover/traveler:text-primary-light dark:text-primary-dark transition-colors">
 {booking.traveler.fullName}
 </p>
 <div className="flex items-center gap-3 text-xs text-theme-muted ">
 <span className="flex items-center gap-1">
 <Users className="w-3 h-3" />
 {booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'}
 </span>
 {booking.bookingMode && (
 <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${booking.bookingMode === 'Instant'
 ? 'bg-success-green/20 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
 : 'bg-primary-light/20 dark:bg-primary-dark/20 text-blue-700 dark:text-blue-300'
 }`}>
 {booking.bookingMode.replace('_', ' ')}
 </span>
 )}
 </div>
 </div>
 </Link>
 ) : (
 <div className="flex items-center gap-3 opacity-50">
 <div className="w-10 h-10 rounded-full surface-section flex items-center justify-center text-theme-muted font-bold">
 T
 </div>
 <div>
 <p className="font-bold text-theme-muted italic">
 Traveler Info Hidden
 </p>
 </div>
 </div>
 )}
 </div>

 {/* Price & Primary Actions */}
 <div className="flex items-center gap-4">
 <div className="text-right mr-2">
 <div className="text-xl font-black text-theme-primary">
 {booking.currency} {booking.finalPrice.toFixed(2)}
 </div>
 <div className={`text-[10px] font-black uppercase tracking-widest ${
 booking.status === BookingStatus.PendingPayment 
 ? 'text-indigo-600 dark:text-indigo-400 animate-pulse' 
 : 'text-theme-muted '
 }`}>
 {booking.status === BookingStatus.PendingPayment ? 'Awaiting Payment' : 'Total Paid'}
 </div>
 </div>

 <div className="flex items-center gap-2">
 <Link
 href={`/dashboard/guide/messages?tourId=${booking.tourId}&bookingId=${booking.id}`}
 className="p-2.5 bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark border border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark rounded-xl hover:bg-primary-light/20 dark:bg-primary-dark/20 dark:hover:surface-base transition-all"
 title="Message Traveler"
 >
 <MessageSquare className="w-4 h-4" />
 </Link>

 {isPending && (
 <div className="flex items-center gap-2">
 <button
 onClick={() => onReject(booking.id)}
 disabled={isActionLoading}
 className="p-2.5 bg-danger-red/10 dark:bg-red-950/30 text-danger-red dark:text-red-400 border border-danger-red dark:border-danger-red/50 rounded-xl hover:bg-danger-red/20 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
 title="Reject booking"
 >
 <X className="w-4 h-4" />
 </button>
 <button
 onClick={() => onConfirm(booking.id)}
 disabled={isActionLoading}
 className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-success-green/20 transition-all disabled:opacity-50 flex items-center gap-2 px-4 font-bold text-xs"
 >
 <Check className="w-4 h-4" />
 Confirm
 </button>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Expandable Details */}
 {expanded && (
 <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pb-2">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm surface-section p-4 rounded-xl">
 <div className="space-y-1">
 <p className="text-[10px] font-black text-theme-muted uppercase tracking-widest">Contact Info</p>
 {booking.traveler ? (
 <>
 <p className="font-medium text-theme-primary">{booking.traveler.email}</p>
 <p className="text-theme-secondary ">{booking.traveler.phoneE164}</p>
 </>
 ) : (
 <p className="text-theme-muted italic">Traveler info hidden</p>
 )}
 </div>
 <div className="space-y-1">
 <p className="text-[10px] font-black text-theme-muted uppercase tracking-widest">Booked On</p>
 <p className="text-theme-secondary ">{new Date(booking.createdAtUtc).toLocaleString()}</p>
 </div>
 </div>
 </div>
 )}

 {/* Expand/Collapse */}
 <button
 onClick={() => setExpanded(!expanded)}
 className="text-xs font-bold text-primary-light dark:text-primary-dark dark:text-primary-dark hover:text-blue-700 flex items-center gap-1 px-1 py-1"
 >
 {expanded ? 'Hide Details' : 'Show Details'}
 </button>
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
 weekday: 'short',
 month: 'short',
 day: 'numeric',
 hour: 'numeric',
 minute: '2-digit'
 })
 }

 return (
 <div className="surface-card border border-theme rounded-xl overflow-hidden hover:shadow-md transition-all shadow-sm">
 <div className="p-5">
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
 <div className="flex items-start gap-3">
 <div className={`p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400`}>
 <Users className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-bold text-lg text-theme-primary mb-1">
 {entry.tourTitle}
 </h3>
 <div className="flex items-center gap-4 text-xs text-theme-muted ">
 <span className="flex items-center gap-1.5 font-mono surface-section px-1.5 py-0.5 rounded">
 POS: {entry.position}
 </span>
 <span className="flex items-center gap-1.5">
 <Calendar className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark" />
 {formatDate(entry.startTimeUtc)}
 </span>
 </div>
 </div>
 </div>
 <div className="flex flex-col items-end gap-1">
 <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50">
 <Clock className="w-3.5 h-3.5" />
 Waiting
 </span>
 <p className="text-[10px] text-theme-muted font-medium">Joined {new Date(entry.createdAtUtc).toLocaleDateString()}</p>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-t border-theme mt-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-primary-light/20 dark:bg-primary-dark/20 flex items-center justify-center text-primary-light dark:text-primary-dark dark:text-primary-dark font-bold">
 {entry.travelerName?.charAt(0) || 'T'}
 </div>
 <div>
 <p className="font-bold text-theme-primary">
 {entry.travelerName}
 </p>
 <div className="flex items-center gap-3 text-xs text-theme-muted ">
 <span className="flex items-center gap-1">
 <MessageSquare className="w-3 h-3" />
 {entry.travelerEmail}
 </span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-6">
 <div className="text-right">
 <div className="text-xl font-black text-theme-primary">
 {entry.peopleCount}
 </div>
 <div className="text-[10px] font-black uppercase tracking-widest text-theme-muted">
 Seats Requested
 </div>
 </div>
 <Link
 href={`/dashboard/guide/messages?tourId=${entry.occurrenceId}&travelerId=${entry.travelerId}`}
 className="p-2.5 bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark border border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark rounded-xl hover:bg-primary-light/20 dark:bg-primary-dark/20 dark:hover:surface-base transition-all"
 title="Message Traveler"
 >
 <MessageSquare className="w-4 h-4" />
 </Link>
 </div>
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
 // Mark booking notifications as read when visiting the bookings dashboard
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
 <RefreshCw className="w-10 h-10 text-primary-light dark:text-primary-dark animate-spin" />
 <p className="text-theme-secondary font-bold">Synchronizing bookings...</p>
 </div>
 </div>
 )
 }

 return (
 <>
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)]">
 <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10">

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
 <div>
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light/20 dark:bg-primary-dark/20 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
 Income Hub
 </div>
 <h1 className="text-3xl font-black text-theme-primary mb-1 tracking-tight">
 All Bookings
 </h1>
 <p className="text-sm text-theme-secondary font-medium">
 Manage incoming requests and upcoming tours
 </p>
 </div>
 <Link
 href="/dashboard/guide"
 className="inline-flex items-center gap-2 px-6 py-3 surface-card border border-theme text-theme-secondary font-bold rounded-xl hover:surface-section dark:hover:surface-card transition-all shadow-sm"
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
 icon={Users}
 label="Waitlist Size"
 value={stats.waitlistSize}
 color="purple"
 />
 </div>

 {/* Tab Switcher */}
 <div className="flex items-center gap-1 p-1 surface-section rounded-xl mb-8 w-fit">
 <button
 onClick={() => setActiveTab('bookings')}
 className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
 activeTab === 'bookings'
 ? 'surface-card text-primary-light dark:text-primary-dark shadow-sm'
 : 'text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300'
 }`}
 >
 Bookings ({filteredBookings.length})
 </button>
 <button
 onClick={() => setActiveTab('waitlist')}
 className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
 activeTab === 'waitlist'
 ? 'surface-card text-primary-light dark:text-primary-dark shadow-sm'
 : 'text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300'
 }`}
 >
 Waitlist ({waitlistEntries.length})
 </button>
 </div>

 {/* Filters */}
 <div className="flex flex-col sm:flex-row gap-4 mb-8">
 <div className="relative flex-1 group">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light dark:text-primary-dark transition-colors" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Search traveler, tour or reference..."
 className="w-full pl-9 pr-4 py-3 surface-card border border-theme rounded-xl text-sm text-theme-primary placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20 focus:border-primary-light dark:border-primary-dark transition-all shadow-sm"
 />
 </div>

 <div className="flex gap-2">
 <select
 value={filterStatus}
 onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'all')}
 className="px-4 py-3 surface-card border border-theme rounded-xl text-sm font-bold text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark shadow-sm"
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
 className="p-3 surface-card border border-theme text-theme-muted hover:text-primary-light dark:text-primary-dark rounded-xl transition-all shadow-sm active:scale-95"
 title="Refresh"
 >
 <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
 </button>
 </div>
 </div>

 <div className="mb-4 flex items-center justify-between">
 <span className="text-xs font-bold text-theme-muted uppercase tracking-widest">
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
 className="p-3 surface-card border border-theme rounded-xl text-theme-muted hover:text-primary-light dark:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
 >
 <ChevronLeft className="w-5 h-5" />
 </button>
 <button
 onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0) }}
 disabled={currentPage === totalPages}
 className="p-3 surface-card border border-theme rounded-xl text-theme-muted hover:text-primary-light dark:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
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
