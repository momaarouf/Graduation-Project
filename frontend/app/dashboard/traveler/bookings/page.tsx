// ============================================================================
// TRAVELER BOOKINGS MANAGER - CARD 12
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/traveler/bookings/page.tsx
// 
// PURPOSE: Comprehensive view of all bookings with filtering and management
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ View all bookings (upcoming, past, cancelled)
// ✓ Filter by status
// ✓ Cancel bookings with refund calculation
// ✓ View booking details
// ✓ Download tickets/invoices
// ✓ Write reviews for completed trips
// 
// CANCELLATION POLICY:
// - >48h before tour: 100% refund (minus platform fee)
// - 24–48h: 50% refund
// - <24h: no refund
// 
// COLOR PSYCHOLOGY:
// - Blue: Active, confirmed bookings
// - Green: Completed, success
// - Amber: Pending, warning
// - Red: Cancelled, danger
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Calendar,
    Clock,
    MapPin,
    User,
    CreditCard,
    Download,
    XCircle,
    AlertCircle,
    CheckCircle,
    Clock as ClockIcon,
    ChevronRight,
    ChevronLeft,
    Filter,
    Search,
    Eye,
    Star,
    MessageSquare,
    Ticket,
    FileText,
    MoreVertical,
    RefreshCw
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'refunded'

interface Booking {
    id: string
    tourId: string
    tourTitle: string
    tourImage: string
    guideName: string
    guideAvatar?: string
    date: string
    duration: string
    location: string
    country: string
    status: BookingStatus
    peopleCount: number
    totalPrice: number
    currency: 'USD' | 'TRY' | 'LBP'
    bookingReference: string
    cancellationDeadline?: string
    refundEligible?: boolean
    refundAmount?: number
    refundPercent?: number
    hasReview: boolean
    canReview: boolean
    qrCode?: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BOOKINGS: Booking[] = [
    {
        id: 'b1',
        tourId: '1',
        tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
        tourImage: '/images/tours/istanbul-ottoman.jpg',
        guideName: 'Mehmet Yilmaz',
        date: '2026-03-15T09:00:00Z',
        duration: '4 hours',
        location: 'Istanbul',
        country: 'Turkey',
        status: 'confirmed',
        peopleCount: 2,
        totalPrice: 178,
        currency: 'USD',
        bookingReference: 'SH-1234-5678',
        cancellationDeadline: '2026-03-13T09:00:00Z',
        refundEligible: true,
        hasReview: false,
        canReview: false,
        qrCode: '/qr/booking-1.png'
    },
    {
        id: 'b2',
        tourId: '2',
        tourTitle: 'Beirut Street Food & Cultural Walk',
        tourImage: '/images/tours/beirut-food.jpg',
        guideName: 'Layla Hassan',
        date: '2026-03-22T11:00:00Z',
        duration: '3 hours',
        location: 'Beirut',
        country: 'Lebanon',
        status: 'confirmed',
        peopleCount: 4,
        totalPrice: 171,
        currency: 'USD',
        bookingReference: 'SH-2345-6789',
        cancellationDeadline: '2026-03-20T11:00:00Z',
        refundEligible: true,
        hasReview: false,
        canReview: false,
        qrCode: '/qr/booking-2.png'
    },
    {
        id: 'b3',
        tourId: '3',
        tourTitle: 'Cappadocia Sunrise Balloon & Valley Hike',
        tourImage: '/images/tours/cappadocia-balloon.jpg',
        guideName: 'Ahmet Demir',
        date: '2026-04-05T04:30:00Z',
        duration: '6 hours',
        location: 'Cappadocia',
        country: 'Turkey',
        status: 'pending',
        peopleCount: 2,
        totalPrice: 398,
        currency: 'USD',
        bookingReference: 'SH-3456-7890',
        cancellationDeadline: '2026-04-03T04:30:00Z',
        refundEligible: true,
        hasReview: false,
        canReview: false,
        qrCode: '/qr/booking-3.png'
    },
    {
        id: 'b4',
        tourId: '4',
        tourTitle: 'Byblos Ancient Ruins & Archaeological Tour',
        tourImage: '/images/tours/byblos-ruins.jpg',
        guideName: 'Elias Khoury',
        date: '2026-02-10T10:00:00Z',
        duration: '2.5 hours',
        location: 'Byblos',
        country: 'Lebanon',
        status: 'completed',
        peopleCount: 3,
        totalPrice: 165,
        currency: 'USD',
        bookingReference: 'SH-4567-8901',
        refundEligible: false,
        hasReview: true,
        canReview: false,
    },
    {
        id: 'b5',
        tourId: '5',
        tourTitle: 'Bosphorus Sunset Cruise with Dinner',
        tourImage: '/images/tours/bosphorus-cruise.jpg',
        guideName: 'Zeynep Kaya',
        date: '2026-01-28T17:30:00Z',
        duration: '4 hours',
        location: 'Istanbul',
        country: 'Turkey',
        status: 'completed',
        peopleCount: 2,
        totalPrice: 258,
        currency: 'USD',
        bookingReference: 'SH-5678-9012',
        refundEligible: false,
        hasReview: false,
        canReview: true,
    },
    {
        id: 'b6',
        tourId: '6',
        tourTitle: 'Bekaa Valley Heritage & Nature Tour',
        tourImage: '/images/tours/bekaa-heritage.jpg',
        guideName: 'Nadine Abboud',
        date: '2026-01-15T08:00:00Z',
        duration: '5 hours',
        location: 'Bekaa Valley',
        country: 'Lebanon',
        status: 'cancelled',
        peopleCount: 4,
        totalPrice: 380,
        currency: 'USD',
        bookingReference: 'SH-6789-0123',
        refundEligible: true,
        refundAmount: 380,
        refundPercent: 100,
        hasReview: false,
        canReview: false,
    }
]

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
    status: BookingStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
    const statusConfig = {
        confirmed: {
            bg: 'bg-emerald-100 dark:bg-emerald-950/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: CheckCircle,
            label: 'Confirmed'
        },
        pending: {
            bg: 'bg-amber-100 dark:bg-amber-950/30',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-800',
            icon: ClockIcon,
            label: 'Pending'
        },
        completed: {
            bg: 'bg-blue-100 dark:bg-blue-950/30',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800',
            icon: CheckCircle,
            label: 'Completed'
        },
        cancelled: {
            bg: 'bg-red-100 dark:bg-red-950/30',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-200 dark:border-red-800',
            icon: XCircle,
            label: 'Cancelled'
        },
        refunded: {
            bg: 'bg-purple-100 dark:bg-purple-950/30',
            text: 'text-purple-700 dark:text-purple-300',
            border: 'border-purple-200 dark:border-purple-800',
            icon: RefreshCw,
            label: 'Refunded'
        }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 ${config.bg} ${config.border} border rounded-full ${config.text} text-xs font-medium`}>
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
        { id: 'all', label: 'All Bookings' },
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
        { id: 'pending', label: 'Pending' },
    ]

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter.id ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Search bar */}
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search bookings..."
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>
        </div>
    )
}

// ============================================================================
// CANCELLATION MODAL
// ============================================================================

interface CancellationModalProps {
    booking: Booking | null
    isOpen: boolean
    onClose: () => void
    onConfirm: (bookingId: string) => void
}

function CancellationModal({ booking, isOpen, onClose, onConfirm }: CancellationModalProps) {
    if (!isOpen || !booking) return null

    const now = new Date()
    const tourDate = new Date(booking.date)
    const hoursDiff = (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundPercent = 0
    let refundMessage = ''

    if (hoursDiff > 48) {
        refundPercent = 100
        refundMessage = 'Full refund (minus platform fee)'
    } else if (hoursDiff > 24) {
        refundPercent = 50
        refundMessage = '50% refund'
    } else {
        refundPercent = 0
        refundMessage = 'No refund (cancellation within 24h)'
    }

    const refundAmount = (booking.totalPrice * refundPercent) / 100

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
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
                                ${booking.totalPrice}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Refund policy</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                                {refundPercent}%
                            </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-medium text-gray-900 dark:text-white">You'll get</span>
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                ${refundAmount.toFixed(2)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {refundMessage}
                        </p>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        Platform fees are non-refundable. Refunds will be processed within 5-7 business days.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Keep Booking
                    </button>
                    <button
                        onClick={() => {
                            onConfirm(booking.id)
                            onClose()
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Cancel Booking
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// BOOKING CARD COMPONENT
// ============================================================================

interface BookingCardProps {
    booking: Booking
    onCancel: (booking: Booking) => void
}

function BookingCard({ booking, onCancel }: BookingCardProps) {
    const router = useRouter()
    const date = new Date(booking.date)
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })

    const isUpcoming = booking.status === 'confirmed' || booking.status === 'pending'
    const canCancel = isUpcoming && booking.refundEligible

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-gray-100 dark:bg-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <StatusBadge status={booking.status} />
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                {booking.tourTitle}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formattedDate}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {booking.location}, {booking.country}
                                </span>
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {booking.guideName}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                ${booking.totalPrice}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'}
                            </div>
                        </div>
                    </div>

                    {/* Reference */}
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {booking.bookingReference}
                        </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Link
                            href={`/bookings/${booking.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white text-xs font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                        >
                            <Eye className="w-3 h-3" />
                            Details
                        </Link>

                        {booking.qrCode && (
                            <Link
                                href={`/bookings/${booking.id}/ticket`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 dark:bg-emerald-700 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-800 transition-colors"
                            >
                                <Ticket className="w-3 h-3" />
                                Ticket
                            </Link>
                        )}

                        {booking.canReview && (
                            <Link
                                href={`/bookings/${booking.id}/review`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 dark:bg-amber-700 text-white text-xs font-medium rounded-lg hover:bg-amber-700 dark:hover:bg-amber-800 transition-colors"
                            >
                                <Star className="w-3 h-3" />
                                Review
                            </Link>
                        )}

                        {canCancel && (
                            <button
                                onClick={() => onCancel(booking)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 dark:bg-red-700 text-white text-xs font-medium rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
                            >
                                <XCircle className="w-3 h-3" />
                                Cancel
                            </button>
                        )}

                        <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-auto">
                            <Download className="w-3 h-3" />
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
    const [activeFilter, setActiveFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [showCancelModal, setShowCancelModal] = useState(false)

    // Filter bookings
    const filteredBookings = MOCK_BOOKINGS.filter(booking => {
        // Filter by status
        if (activeFilter !== 'all') {
            if (activeFilter === 'upcoming') {
                if (booking.status !== 'confirmed' && booking.status !== 'pending') return false
            } else if (booking.status !== activeFilter) {
                return false
            }
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                booking.tourTitle.toLowerCase().includes(query) ||
                booking.location.toLowerCase().includes(query) ||
                booking.guideName.toLowerCase().includes(query) ||
                booking.bookingReference.toLowerCase().includes(query)
            )
        }

        return true
    })

    const handleCancelClick = (booking: Booking) => {
        setSelectedBooking(booking)
        setShowCancelModal(true)
    }

    const handleConfirmCancel = (bookingId: string) => {
        // In Phase 3: API call to cancel booking
        console.log('Cancelling booking:', bookingId)
        // Show success message
        // Refresh data
    }

    return (
        <PageLayout>
            {/* Page offset */}
            <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">

                <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                My Bookings
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage your tours, view tickets, and write reviews
                            </p>
                        </div>
                        <Link
                            href="/tours"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                        >
                            <Calendar className="w-4 h-4" />
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

                    {/* Bookings List */}
                    {filteredBookings.length > 0 ? (
                        <div className="space-y-4">
                            {filteredBookings.map((booking) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onCancel={handleCancelClick}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No bookings found
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                {searchQuery
                                    ? `No results for "${searchQuery}"`
                                    : "You haven't made any bookings yet"}
                            </p>
                            <Link
                                href="/tours"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                            >
                                Explore Tours
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}

                    {/* Summary Stats */}
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {MOCK_BOOKINGS.length}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Total Bookings
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Upcoming
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {MOCK_BOOKINGS.filter(b => b.status === 'completed').length}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Completed
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                ${MOCK_BOOKINGS.reduce((sum, b) => sum + b.totalPrice, 0)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Total Spent
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancellation Modal */}
            <CancellationModal
                booking={selectedBooking}
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
            />
        </PageLayout>
    )
}