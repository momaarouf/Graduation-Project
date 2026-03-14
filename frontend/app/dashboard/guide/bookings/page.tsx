// ============================================================================
// GUIDE BOOKINGS LIST - ALL BOOKINGS ACROSS TOURS
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/bookings/page.tsx
// 
// PURPOSE: Display all bookings received across all tours
// 
// FEATURES:
// - List all bookings (upcoming, past, cancelled)
// - Filter by status (confirmed, pending, completed, cancelled)
// - Filter by tour
// - Search by traveler name or booking reference
// - Quick actions (contact traveler, view details)
// - Stats (total bookings, pending, revenue)
// ============================================================================

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Eye,
  MessageSquare,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Star,
  Phone,
  Mail,
  MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no-show'

interface GuideBooking {
  id: string
  bookingReference: string
  tourId: string
  tourTitle: string
  tourImage: string
  tourDate: string
  tourDuration: string
  meetingPoint: string
  status: BookingStatus
  travelerId: string
  travelerName: string
  travelerAvatar?: string
  travelerEmail: string
  travelerPhone: string
  peopleCount: number
  totalPrice: number
  currency: 'USD' | 'TRY' | 'LBP'
  specialRequests?: string
  bookedAt: string
  checkedIn?: boolean
  checkInTime?: string
  hasReviewed?: boolean
}

interface BookingsStats {
  total: number
  confirmed: number
  pending: number
  completed: number
  cancelled: number
  noShow: number
  totalRevenue: number
  averageGroupSize: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BOOKINGS_STATS: BookingsStats = {
  total: 28,
  confirmed: 8,
  pending: 4,
  completed: 12,
  cancelled: 3,
  noShow: 1,
  totalRevenue: 4850,
  averageGroupSize: 2.4
}

const MOCK_BOOKINGS: GuideBooking[] = [
  {
    id: 'b1',
    bookingReference: 'SH-1234-5678',
    tourId: '1',
    tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
    tourImage: '/images/tours/istanbul-ottoman.jpg',
    tourDate: '2026-04-15T09:00:00Z',
    tourDuration: '4 hours',
    meetingPoint: 'Sultanahmet Square Fountain',
    status: 'confirmed',
    travelerId: 't1',
    travelerName: 'Ahmed Khan',
    travelerAvatar: '/images/travelers/ahmed.jpg',
    travelerEmail: 'ahmed.khan@example.com',
    travelerPhone: '+90 555 111 2233',
    peopleCount: 2,
    totalPrice: 178,
    currency: 'USD',
    specialRequests: 'Vegetarian food options',
    bookedAt: '2026-03-20T14:30:00Z',
    checkedIn: false
  },
  {
    id: 'b2',
    bookingReference: 'SH-2345-6789',
    tourId: '1',
    tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
    tourImage: '/images/tours/istanbul-ottoman.jpg',
    tourDate: '2026-04-16T09:00:00Z',
    tourDuration: '4 hours',
    meetingPoint: 'Sultanahmet Square Fountain',
    status: 'confirmed',
    travelerId: 't2',
    travelerName: 'Fatima Al-Zahra',
    travelerAvatar: '/images/travelers/fatima.jpg',
    travelerEmail: 'fatima.z@example.com',
    travelerPhone: '+90 555 222 3344',
    peopleCount: 1,
    totalPrice: 89,
    currency: 'USD',
    bookedAt: '2026-03-21T10:15:00Z',
    checkedIn: false
  },
  {
    id: 'b3',
    bookingReference: 'SH-3456-7890',
    tourId: '2',
    tourTitle: 'Bosphorus Sunset Cruise with Dinner',
    tourImage: '/images/tours/bosphorus-cruise.jpg',
    tourDate: '2026-04-17T17:30:00Z',
    tourDuration: '4 hours',
    meetingPoint: 'Kabataş Ferry Terminal',
    status: 'pending',
    travelerId: 't3',
    travelerName: 'Omar Farooq',
    travelerEmail: 'omar.f@example.com',
    travelerPhone: '+90 555 333 4455',
    peopleCount: 2,
    totalPrice: 258,
    currency: 'USD',
    bookedAt: '2026-03-22T09:45:00Z',
    checkedIn: false
  },
  {
    id: 'b4',
    bookingReference: 'SH-4567-8901',
    tourId: '3',
    tourTitle: 'Cappadocia Sunrise Balloon & Valley Hike',
    tourImage: '/images/tours/cappadocia-balloon.jpg',
    tourDate: '2026-04-18T04:30:00Z',
    tourDuration: '6 hours',
    meetingPoint: 'Göreme Sunrise Point',
    status: 'completed',
    travelerId: 't4',
    travelerName: 'Layla Hassan',
    travelerAvatar: '/images/travelers/layla.jpg',
    travelerEmail: 'layla.h@example.com',
    travelerPhone: '+90 555 444 5566',
    peopleCount: 2,
    totalPrice: 398,
    currency: 'USD',
    bookedAt: '2026-03-10T11:20:00Z',
    checkedIn: true,
    checkInTime: '04:25',
    hasReviewed: true
  },
  {
    id: 'b5',
    bookingReference: 'SH-5678-9012',
    tourId: '4',
    tourTitle: 'Beirut Street Food & Cultural Walk',
    tourImage: '/images/tours/beirut-food.jpg',
    tourDate: '2026-03-10T11:00:00Z',
    tourDuration: '3 hours',
    meetingPoint: 'Beirut Souks Entrance',
    status: 'no-show',
    travelerId: 't5',
    travelerName: 'Hassan Ali',
    travelerEmail: 'hassan.a@example.com',
    travelerPhone: '+961 70 123 456',
    peopleCount: 4,
    totalPrice: 171,
    currency: 'USD',
    bookedAt: '2026-03-01T16:30:00Z',
    checkedIn: false
  }
]

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge = ({ status }: { status: BookingStatus }) => {
  const styles = {
    confirmed: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      icon: CheckCircle,
      label: 'Confirmed'
    },
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
      icon: Clock,
      label: 'Pending'
    },
    completed: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/50',
      icon: CheckCircle,
      label: 'Completed'
    },
    cancelled: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: XCircle,
      label: 'Cancelled'
    },
    'no-show': {
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800/50',
      icon: AlertCircle,
      label: 'No Show'
    }
  }

  const { bg, text, border, icon: Icon, label } = styles[status]

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${bg} ${text} ${border}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
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
  subtext?: string
  color: 'blue' | 'emerald' | 'amber' | 'purple'
}

const StatCard = ({ icon: Icon, label, value, subtext, color }: StatCardProps) => {
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
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        {subtext && <div className="text-xs text-gray-400 dark:text-gray-500">{subtext}</div>}
      </div>
    </div>
  )
}

// ============================================================================
// BOOKING CARD COMPONENT
// ============================================================================

const BookingCard = ({ booking }: { booking: GuideBooking }) => {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

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
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all">
      <div className="p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            {/* Tour Image */}
            <div className="relative w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
              <Image src={booking.tourImage} alt={booking.tourTitle} fill className="object-cover" />
            </div>

            {/* Tour Info */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                {booking.tourTitle}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Ref: {booking.bookingReference}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(booking.tourDate)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={booking.status} />
            <button
              onClick={() => router.push(`/dashboard/guide/bookings/${booking.id}`)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Traveler & Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Traveler */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              {booking.travelerAvatar ? (
                <Image src={booking.travelerAvatar} alt={booking.travelerName} width={40} height={40} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {booking.travelerName}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Users className="w-3 h-3" />
                <span>{booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'}</span>
              </div>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                ${booking.totalPrice}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {booking.peopleCount} × ${booking.totalPrice / booking.peopleCount}
              </div>
            </div>

            <button
              onClick={() => router.push(`/dashboard/guide/messages?traveler=${booking.travelerId}`)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Message traveler"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${booking.travelerEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {booking.travelerEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${booking.travelerPhone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {booking.travelerPhone}
                </a>
              </div>
            </div>

            {/* Meeting Point */}
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-gray-600 dark:text-gray-400">{booking.meetingPoint}</span>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">Special request:</span> {booking.specialRequests}
                </p>
              </div>
            )}

            {/* Check-in Info */}
            {booking.checkedIn && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <p className="text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Checked in at {booking.checkInTime}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {expanded ? 'Show less' : 'Show more details'}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideBookingsPage() {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Get unique tours for filter
  const uniqueTours = useMemo(() => {
    const tours = new Set(MOCK_BOOKINGS.map(b => b.tourTitle))
    return Array.from(tours)
  }, [])

  const [selectedTour, setSelectedTour] = useState<string>('all')

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return MOCK_BOOKINGS.filter(booking => {
      if (filterStatus !== 'all' && booking.status !== filterStatus) return false
      if (selectedTour !== 'all' && booking.tourTitle !== selectedTour) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (
          booking.travelerName.toLowerCase().includes(term) ||
          booking.bookingReference.toLowerCase().includes(term) ||
          booking.tourTitle.toLowerCase().includes(term)
        )
      }
      return true
    })
  }, [filterStatus, selectedTour, searchTerm])

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const resetFilters = () => {
    setFilterStatus('all')
    setSelectedTour('all')
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                All Bookings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage bookings across all your tours
              </p>
            </div>
            <Link
              href="/dashboard/guide"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors self-start"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <StatCard
              icon={Calendar}
              label="Total Bookings"
              value={MOCK_BOOKINGS_STATS.total}
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              label="Confirmed"
              value={MOCK_BOOKINGS_STATS.confirmed}
              color="emerald"
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={MOCK_BOOKINGS_STATS.pending}
              color="amber"
            />
            <StatCard
              icon={DollarSign}
              label="Revenue"
              value={`$${MOCK_BOOKINGS_STATS.totalRevenue}`}
              color="purple"
            />
            <StatCard
              icon={Users}
              label="Avg. Group"
              value={MOCK_BOOKINGS_STATS.averageGroupSize}
              color="amber"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>

            <select
              value={selectedTour}
              onChange={(e) => setSelectedTour(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Tours</option>
              {uniqueTours.map(tour => (
                <option key={tour} value={tour}>{tour}</option>
              ))}
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by traveler, reference, or tour..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {paginatedBookings.length} of {filteredBookings.length} bookings
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No bookings found
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'Try adjusting your search' : 'You have no bookings yet'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredBookings.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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