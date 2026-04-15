'use client'

import React, { useState, useEffect } from 'react'
import { useBadgeReset } from '@/src/lib/hooks/useBadgeReset'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { getTravelerBookings, cancelBooking, getMyWaitlist, leaveWaitlist, getTravelerReviews } from '@/src/lib/api/tours'
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
    FileText,
    Eye,
    Ticket,
    Download,
    Star,
    User,
    Smartphone,
    RefreshCw,
    CreditCard,
    Loader2,
    AlertTriangle
} from 'lucide-react'

// TYPES - We use BookingResponse from tour.types.ts

// Mock data removed in favor of real API

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
    status: BookingStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
    const statusConfig = {
        [BookingStatus.Confirmed]: {
            bg: 'bg-emerald-100 dark:bg-emerald-950/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: CheckCircle,
            label: 'Confirmed'
        },
        [BookingStatus.PendingGuide]: {
            bg: 'bg-amber-100 dark:bg-amber-950/30',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-800',
            icon: Clock,
            label: 'Pending Guide'
        },
        [BookingStatus.Completed]: {
            bg: 'bg-blue-100 dark:bg-blue-950/30',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800',
            icon: CheckCircle,
            label: 'Completed'
        },
        [BookingStatus.Cancelled]: {
            bg: 'bg-red-100 dark:bg-red-950/30',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-200 dark:border-red-800',
            icon: XCircle,
            label: 'Cancelled'
        },
        [BookingStatus.Rejected]: {
            bg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-700 dark:text-gray-300',
            border: 'border-gray-200 dark:border-gray-700',
            icon: XCircle,
            label: 'Rejected'
        },
        [BookingStatus.PendingPayment]: {
            bg: 'bg-indigo-100 dark:bg-indigo-950/30',
            text: 'text-indigo-700 dark:text-indigo-300',
            border: 'border-indigo-200 dark:border-indigo-800',
            icon: CreditCard,
            label: 'Awaiting Payment'
        },
        [BookingStatus.Expired]: {
            bg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-500 dark:text-gray-400',
            border: 'border-gray-200 dark:border-gray-700',
            icon: AlertCircle,
            label: 'Expired'
        },
        [BookingStatus.InProgress]: {
            bg: 'bg-emerald-50 dark:bg-emerald-950/20',
            text: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-100 dark:border-emerald-900/50',
            icon: RefreshCw,
            label: 'In Progress'
        },
        [BookingStatus.Waitlisted]: {
            bg: 'bg-purple-100 dark:bg-purple-950/30',
            text: 'text-purple-700 dark:text-purple-300',
            border: 'border-purple-200 dark:border-purple-800',
            icon: Clock,
            label: 'Waitlisted'
        }
    }

    const config = statusConfig[status] || statusConfig[BookingStatus.PendingGuide]
    const Icon = config.icon

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border} shadow-sm transition-all duration-300`}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    )
}

// ============================================================================
// FILTER BAR COMPONENT
// ============================================================================

interface FilterBarProps {
    activeFilter: string
    onFilterChange: (filter: string) => void
    searchQuery: string
    onSearchChange: (query: string) => void
}

function FilterBar({ activeFilter, onFilterChange, searchQuery, onSearchChange }: FilterBarProps) {
    const filters = [
        { id: 'all', label: 'All' },
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
        { id: 'pending', label: 'Pending Request' },
        { id: 'waitlist', label: 'Waitlist' }
    ]

    return (
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Tabs */}
            <div className="flex p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-x-auto no-scrollbar">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`
                            whitespace-nowrap px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300
                            ${activeFilter === filter.id
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }
                        `}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by tour title or ID..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
            </div>
        </div>
    )
}

// ============================================================================
// CANCELLATION MODAL
// ============================================================================

interface CancellationModalProps {
    booking: BookingResponse | null
    isOpen: boolean
    onClose: () => void
    onConfirm: (bookingId: number) => void
    isLoading?: boolean
}

function CancellationModal({ booking, isOpen, onClose, onConfirm, isLoading = false }: CancellationModalProps) {
    if (!isOpen || !booking) return null

    const now = new Date()
    const tourDate = new Date(booking.startTimeUtc)
    const hoursDiff = (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundPercent = 0
    let refundMessage = ''

    if (hoursDiff > 48) {
        refundPercent = 100
        refundMessage = 'Full refund'
    } else if (hoursDiff > 24) {
        refundPercent = 50
        refundMessage = '50% refund'
    } else {
        refundPercent = 0
        refundMessage = 'No refund'
    }

    const refundAmount = (booking.finalPrice * refundPercent) / 100

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Cancel Booking
                        </h3>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to cancel <span className="font-semibold text-gray-900 dark:text-white">{booking.tourTitle}</span>?
                    </p>

                    {/* Refund info */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Booking amount</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {booking.currency} {booking.finalPrice}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Refund policy</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                                {refundPercent}%
                            </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-medium text-gray-900 dark:text-white">Estimated refund</span>
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {booking.currency} {refundAmount.toFixed(2)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">
                            {refundMessage}
                        </p>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        Refunds will be processed back to your original payment method within 5-7 business days.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-20:0 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => onConfirm(booking.id)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                        Cancel Booking
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// PAYMENT COUNTDOWN PILL — compact in-card timer for PendingPayment bookings
// ============================================================================

interface PaymentCountdownPillProps {
    deadlineUtc: string
    onExpired?: () => void
}

function PaymentCountdownPill({ deadlineUtc, onExpired }: PaymentCountdownPillProps) {
    const countdown = usePaymentCountdown(deadlineUtc)
    const firedRef = React.useRef(false)

    // Fire onExpired exactly once when the countdown hits zero.
    // Uses a ref so the effect doesn’t re-fire on re-renders.
    React.useEffect(() => {
        if (countdown?.isExpired && !firedRef.current && onExpired) {
            firedRef.current = true
            onExpired()
        }
    }, [countdown?.isExpired, onExpired])

    if (!countdown) return null

    if (countdown.isExpired) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg mb-3">
                <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-xs font-bold text-red-700 dark:text-red-300">
                    Payment window expired — booking cancelled
                </span>
            </div>
        )
    }

    const isCritical = countdown.urgency === 'critical'
    const isWarning  = countdown.urgency === 'warning'

    const containerClass = isCritical
        ? 'flex items-center gap-2.5 px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg mb-3'
        : isWarning
        ? 'flex items-center gap-2.5 px-3 py-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg mb-3'
        : 'flex items-center gap-2.5 px-3 py-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-3'

    const textClass = isCritical
        ? 'text-xs font-bold text-red-700 dark:text-red-300'
        : isWarning
        ? 'text-xs font-bold text-orange-700 dark:text-orange-300'
        : 'text-xs font-bold text-amber-700 dark:text-amber-300'

    const timerClass = isCritical
        ? 'text-sm font-black tabular-nums text-red-600 dark:text-red-400 animate-pulse ml-auto shrink-0'
        : isWarning
        ? 'text-sm font-black tabular-nums text-orange-600 dark:text-orange-400 animate-pulse ml-auto shrink-0'
        : 'text-sm font-black tabular-nums text-amber-700 dark:text-amber-300 ml-auto shrink-0'

    const barClass = isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-amber-500'

    return (
        <div className="mb-3 space-y-1.5">
            <div className={containerClass}>
                {isCritical || isWarning
                    ? <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isCritical ? 'text-red-500 animate-bounce' : 'text-orange-500'}`} />
                    : <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                }
                <span className={textClass}>
                    {isCritical ? 'Pay now or booking cancels!' : 'Complete payment to confirm seat'}
                </span>
                <span className={timerClass}>{countdown.displayString}</span>
            </div>
            {/* Progress bar — drains from full to empty over the 15-minute window */}
            <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${barClass}`}
                    style={{ width: `${Math.max(0, Math.min(100, (countdown.totalSeconds / 900) * 100))}%` }}
                />
            </div>
        </div>
    )
}

// ============================================================================
// BOOKING CARD COMPONENT
// ============================================================================

interface BookingCardProps {
    booking: BookingResponse
    onCancel: (booking: BookingResponse) => void
    onExpired: (bookingId: number) => void
    isReviewed: boolean
}

function BookingCard({ booking, onCancel, onExpired, isReviewed }: BookingCardProps) {
    const router = useRouter()
    const [isPaying, setIsPaying] = useState(false)
    const date = new Date(booking.startTimeUtc)
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })

    const isUpcoming = booking.status === BookingStatus.Confirmed || 
                       booking.status === BookingStatus.PendingGuide || 
                       booking.status === BookingStatus.PendingPayment
    // In real app, we check if date is in future
    const isFuture = date.getTime() > Date.now()
    const canCancel = isUpcoming && isFuture

    const handlePayNow = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        router.push(`/bookings/confirmation?id=${booking.id}`)
    }

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 shadow-sm">
            <div className="flex flex-col sm:flex-row">
                {/* Image Placeholder - since BookingResponse doesn't have image yet */}
                <div className="relative w-full sm:w-48 h-32 sm:h-auto overflow-hidden">
                    {booking.tourCoverImageUrl ? (
                        <img 
                            src={booking.tourCoverImageUrl} 
                            alt={booking.tourTitle}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-3 left-3">
                        <StatusBadge status={booking.status} />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                                {booking.tourTitle}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                    {formattedDate}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                                    ID: {booking.id}
                                </span>
                            </div>
                        </div>
                        <div className="text-right sm:pl-4">
                            <div className="text-xl font-black text-gray-900 dark:text-white">
                                {booking.currency} {booking.finalPrice}
                            </div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'}
                            </div>
                        </div>
                    </div>

                    {/* Reference & Ticket Code */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Reference
                            </div>
                            <span className="text-xs font-mono font-bold text-gray-900 dark:text-gray-300">
                                SH-{booking.id.toString().padStart(4, '0')}
                            </span>
                        </div>

                        {booking.qrCode && booking.status === BookingStatus.Confirmed && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(booking.qrCode || "");
                                    toast.success('Ticket code copied for guide!', {
                                        icon: '🎫',
                                        style: { borderRadius: '12px', background: '#333', color: '#fff' }
                                    });
                                }}
                                className="group flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-all active:scale-95"
                                title="Copy code for guide"
                            >
                                <p className="text-lg font-mono font-bold tracking-tight">
                                    SH-{booking.id.toString().padStart(6, '0')}
                                </p>
                                <Smartphone className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        )}
                    </div>

                    {/* Payment Countdown — compact pill shown on PendingPayment cards */}
                    {booking.status === BookingStatus.PendingPayment && booking.paymentDeadlineUtc && (
                        <PaymentCountdownPill
                            deadlineUtc={booking.paymentDeadlineUtc}
                            onExpired={() => onExpired(booking.id)}
                        />
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Link
                            href={`/dashboard/traveler/bookings/${booking.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-xs font-bold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            Details
                        </Link>

                        {booking.status === BookingStatus.Confirmed && booking.qrCode && (
                            <Link
                                href={`/dashboard/traveler/bookings/${booking.id}/ticket`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 dark:bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-800 transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95"
                            >
                                <Ticket className="w-3.5 h-3.5" />
                                Ticket
                            </Link>
                        )}

                        {booking.status === BookingStatus.Completed && !isReviewed && (
                            <Link
                                // The review form is located at /app/bookings/[id]/review/page.tsx
                                href={`/bookings/${booking.id}/review`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 dark:bg-amber-700 text-white text-xs font-bold rounded-lg hover:bg-amber-700 dark:hover:bg-amber-800 transition-all shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95"
                            >
                                <Star className="w-3.5 h-3.5" />
                                Review
                            </Link>
                        )}

                        {booking.status === BookingStatus.Completed && isReviewed && (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-bold rounded-lg cursor-default">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Reviewed
                            </span>
                        )}

                        {canCancel && (
                            <button
                                onClick={() => onCancel(booking)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancel
                            </button>
                        )}

                        {booking.status === BookingStatus.PendingPayment && (
                            <button
                                onClick={handlePayNow}
                                disabled={isPaying}
                                className="inline-flex items-center gap-1.5 px-6 py-2 bg-indigo-600 dark:bg-indigo-700 text-white text-xs font-black rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                            >
                                {isPaying ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <CreditCard className="w-3.5 h-3.5" />
                                )}
                                Pay Now
                            </button>
                        )}

                        {booking.status !== BookingStatus.Completed && 
                         booking.status !== BookingStatus.Cancelled && 
                         booking.status !== BookingStatus.Expired && (
                            <Link
                                href={`/tours/${booking.tourId}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all active:scale-95 transition-all"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Edit
                            </Link>
                        )}

                        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ml-auto active:scale-95">
                            <Download className="w-3.5 h-3.5" />
                            Invoice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TravelerBookingsPage() {
    const [bookings, setBookings] = React.useState<BookingResponse[]>([])
    const [waitlistEntries, setWaitlistEntries] = React.useState<WaitlistResponse[]>([])
    const [reviewedBookingIds, setReviewedBookingIds] = React.useState<Set<number>>(new Set())
    const [isLoading, setIsLoading] = React.useState(true)
    const [isCancelling, setIsCancelling] = React.useState(false)
    const [isLeavingWaitlist, setIsLeavingWaitlist] = React.useState<number | null>(null)

    useBadgeReset('traveler-bookings')
    const [activeFilter, setActiveFilter] = React.useState('all')
    const [searchQuery, setSearchQuery] = React.useState('')
    const [selectedBooking, setSelectedBooking] = React.useState<BookingResponse | null>(null)
    const [showCancelModal, setShowCancelModal] = React.useState(false)

    React.useEffect(() => {
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
            // Fetch bookings, waitlist entries, and reviews in parallel
            const [bookingsRes, waitlistRes, reviewsRes] = await Promise.all([
                getTravelerBookings(),
                getMyWaitlist().catch(() => [] as WaitlistResponse[]),
                getTravelerReviews().catch(() => ({ content: [] }))
            ])
            setBookings(bookingsRes || [])
            setWaitlistEntries(waitlistRes || [])
            
            // Extract the set of booking IDs that already have reviews
            // Note: reviewsRes might be the direct object content if getTravelerReviews was updated
            const reviewedIds = new Set<number>(
                (reviewsRes?.content || []).map((r: any) => r.bookingId)
            )
            setReviewedBookingIds(reviewedIds)
        } catch (err: any) {
            console.error('Failed to fetch bookings:', err)
            toast.error('Failed to load your bookings')
        } finally {
            setIsLoading(false)
        }
    }

    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
        // Filter by status
        if (activeFilter !== 'all') {
            if (activeFilter === 'upcoming') {
                if (
                    booking.status !== BookingStatus.Confirmed && 
                    booking.status !== BookingStatus.PendingGuide &&
                    booking.status !== BookingStatus.PendingPayment
                ) return false
            } else if (activeFilter === 'completed') {
                if (booking.status !== BookingStatus.Completed) return false
            } else if (activeFilter === 'cancelled') {
                if (booking.status !== BookingStatus.Cancelled && booking.status !== BookingStatus.Rejected) return false
            } else if (activeFilter === 'pending') {
                if (booking.status !== BookingStatus.PendingGuide) return false
            }
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                booking.tourTitle.toLowerCase().includes(query) ||
                booking.id.toString().includes(query)
            )
        }

        return true
    })

    const handleCancelClick = (booking: BookingResponse) => {
        setSelectedBooking(booking)
        setShowCancelModal(true)
    }

    const handleConfirmCancel = async (bookingId: number) => {
        setIsCancelling(true)
        try {
            await cancelBooking(bookingId)
            toast.success('Booking cancelled successfully')
            fetchBookings() // Refresh list
        } catch (err: any) {
            console.error('Cancellation failed:', err)
            toast.error(err.response?.data?.message || 'Failed to cancel booking')
        } finally {
            setIsCancelling(false)
            setShowCancelModal(false)
        }
    }

    // Leave waitlist — cancels the traveler's waitlist entry
    const handleLeaveWaitlist = async (waitlistId: number) => {
        setIsLeavingWaitlist(waitlistId)
        try {
            await leaveWaitlist(waitlistId)
            toast.success('Removed from waitlist')
            fetchBookings() // Refresh both bookings and waitlist
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to leave waitlist')
        } finally {
            setIsLeavingWaitlist(null)
        }
    }

    // Optimistic expiry — called by PaymentCountdownPill when the 15-min timer hits zero.
    // Immediately flips the booking to Expired in local state so the status badge,
    // Pay Now button, and Cancel button all disappear without waiting for the server.
    // The backend scheduler will have also processed the booking within 60 seconds;
    // a background refetch is triggered as well to confirm the final server state.
    const handleBookingExpired = (bookingId: number) => {
        // 1. Optimistic update — instant UI feedback
        setBookings(prev =>
            prev.map(b =>
                b.id === bookingId
                    ? { ...b, status: BookingStatus.Expired }
                    : b
            )
        )
        // 2. Background refetch after 3 seconds to confirm backend state
        setTimeout(() => fetchBookings(), 3000)
    }


    // handleSimulateMockAction removed - logic moved to MockPaymentSimulator component

    if (isLoading && bookings.length === 0) {
        return (
            <div className="pt-24 flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-bold animate-pulse">Loading adventures...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Page offset */}
            <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">

                <div className="container-safe mx-auto max-w-7xl py-8 sm:py-12 px-4">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                                My Activity
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                My Bookings
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                                Track your upcoming tours and relive past memories
                            </p>
                        </div>
                        <Link
                            href="/tours"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition-all shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95"
                        >
                            <Calendar className="w-5 h-5" />
                            Book New Tour
                        </Link>
                    </div>

                    {/* Filter Bar */}
                    <FilterBar
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />

                    {/* Waitlist Entries — shown when filter is 'waitlist' or 'all' */}
                    {(activeFilter === 'waitlist' || activeFilter === 'all') && waitlistEntries.length > 0 && (
                        <div className="mb-8">
                            {activeFilter === 'all' && (
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-purple-500" />
                                    Waitlist ({waitlistEntries.length})
                                </h2>
                            )}
                            <div className="grid gap-4">
                                {waitlistEntries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800/50 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                                                        <Clock className="w-3 h-3" />
                                                        Waitlisted
                                                    </span>
                                                    <span className="text-xs text-gray-500">#{entry.position} in queue</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {entry.tourTitle || `Occurrence #${entry.occurrenceId}`}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {entry.peopleCount} {entry.peopleCount === 1 ? 'person' : 'people'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Joined {new Date(entry.createdAtUtc).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleLeaveWaitlist(entry.id)}
                                                disabled={isLeavingWaitlist === entry.id}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {isLeavingWaitlist === entry.id ? (
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <XCircle className="w-3.5 h-3.5" />
                                                )}
                                                Leave Waitlist
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bookings List — hidden when filter is 'waitlist' */}
                    {activeFilter !== 'waitlist' && filteredBookings.length > 0 && (
                        <div className="grid gap-6">
                            {filteredBookings.map((booking) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onCancel={handleCancelClick}
                                    onExpired={handleBookingExpired}
                                    isReviewed={reviewedBookingIds.has(booking.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty State — show when no results in active filter */}
                    {activeFilter !== 'waitlist' && filteredBookings.length === 0 && (
                        <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl overflow-hidden relative">
                            {/* Decorative elements */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center transform hover:rotate-6 transition-transform">
                                    <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                                    No bookings found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-sm mx-auto font-medium">
                                    {searchQuery
                                        ? `We couldn't find any results for "${searchQuery}"`
                                        : "You haven't made any bookings yet. Ready for a new journey?"}
                                </p>
                                <Link
                                    href="/tours"
                                    className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 dark:bg-blue-700 text-white font-black rounded-2xl hover:bg-blue-700 dark:hover:bg-blue-800 transition-all shadow-xl shadow-blue-500/20 active:scale-95 group"
                                >
                                    Explore Tours
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Waitlist empty state */}
                    {activeFilter === 'waitlist' && waitlistEntries.length === 0 && (
                        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                            <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Waitlist Entries</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">You&apos;re not on any waitlists right now.</p>
                        </div>
                    )}

                    {/* Summary Stats */}
                    <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[
                            { label: 'Total Bookings', value: bookings.length, color: 'text-gray-900 dark:text-white', bg: 'bg-white dark:bg-gray-900' },
                            { label: 'Upcoming', value: bookings.filter(b => b.status === BookingStatus.Confirmed || b.status === BookingStatus.PendingGuide).length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
                            { label: 'Completed', value: bookings.filter(b => b.status === BookingStatus.Completed).length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-900/10' },
                            { 
                                label: 'Total Spend', 
                                value: `${bookings[0]?.currency || 'USD'} ${bookings
                                    .filter(b => [BookingStatus.Confirmed, BookingStatus.Completed, BookingStatus.InProgress].includes(b.status))
                                    .reduce((sum, b) => sum + Number(b.finalPrice), 0)
                                    .toFixed(0)}`, 
                                color: 'text-amber-600 dark:text-amber-400', 
                                bg: 'bg-amber-50/50 dark:bg-amber-900/10' 
                            }
                        ].map((stat, i) => (
                            <div key={i} className={`p-6 ${stat.bg} border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:translate-y-[-4px] transition-all duration-300 group`}>
                                <div className={`text-3xl font-black ${stat.color} group-hover:scale-110 transition-transform origin-left`}>
                                    {stat.value}
                                </div>
                                <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest mt-2">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <CancellationModal
                booking={selectedBooking}
                isOpen={showCancelModal}
                isLoading={isCancelling}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
            />
        </>
    )
}