// ============================================================================
// TOUR OCCURRENCES - MANAGE RECURRING TOUR DATES
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/tours/[id]/occurrences/page.tsx
// 
// PURPOSE: Manage all occurrences of a recurring tour
// 
// FEATURES:
// - List all occurrences (past and future)
// - Filter by status (scheduled, completed, cancelled)
// - Edit individual occurrence dates/capacity
// - Cancel/reschedule occurrences
// - View bookings per occurrence
// - Add new occurrences
// - Bulk actions for recurring patterns
// ============================================================================

'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  Copy,
  PauseCircle,
  PlayCircle,
  CalendarRange,
  Repeat,
  Download
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import toast from 'react-hot-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type OccurrenceStatus = 'scheduled' | 'completed' | 'cancelled' | 'paused'

interface TourOccurrence {
  id: string
  date: string
  startTime: string
  endTime: string
  status: OccurrenceStatus
  minCapacity: number
  maxCapacity: number
  currentBookings: number
  totalRevenue: number
  guideEarnings: number
  meetingPoint?: string
  specialInstructions?: string
  isWaitlistEnabled: boolean
  waitlistCount: number
}

interface TourInfo {
  id: string
  title: string
  image: string
  location: string
  basePrice: number
  currency: string
  duration: string
  isRecurring: boolean
  recurrencePattern: 'daily' | 'weekly' | 'monthly' | 'custom'
  recurringDays?: string[]
  meetingPoint?: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TOUR: TourInfo = {
  id: '1',
  title: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
  image: '/images/tours/istanbul-ottoman.jpg',
  location: 'Istanbul, Turkey',
  basePrice: 89,
  currency: 'USD',
  duration: '4 hours',
  isRecurring: true,
  recurrencePattern: 'weekly',
  recurringDays: ['Monday', 'Wednesday', 'Friday'],
  meetingPoint: 'Sultanahmet Square Fountain'
}

const MOCK_OCCURRENCES: TourOccurrence[] = [
  {
    id: 'occ1',
    date: '2026-04-15',
    startTime: '09:00',
    endTime: '13:00',
    status: 'scheduled',
    minCapacity: 2,
    maxCapacity: 8,
    currentBookings: 3,
    totalRevenue: 267,
    guideEarnings: 240,
    meetingPoint: 'Sultanahmet Square Fountain',
    isWaitlistEnabled: true,
    waitlistCount: 2
  },
  {
    id: 'occ2',
    date: '2026-04-17',
    startTime: '09:00',
    endTime: '13:00',
    status: 'scheduled',
    minCapacity: 2,
    maxCapacity: 8,
    currentBookings: 5,
    totalRevenue: 445,
    guideEarnings: 400,
    meetingPoint: 'Sultanahmet Square Fountain',
    isWaitlistEnabled: true,
    waitlistCount: 0
  },
  {
    id: 'occ3',
    date: '2026-04-19',
    startTime: '09:00',
    endTime: '13:00',
    status: 'scheduled',
    minCapacity: 2,
    maxCapacity: 8,
    currentBookings: 1,
    totalRevenue: 89,
    guideEarnings: 80,
    meetingPoint: 'Sultanahmet Square Fountain',
    isWaitlistEnabled: true,
    waitlistCount: 0
  },
  {
    id: 'occ4',
    date: '2026-04-12',
    startTime: '09:00',
    endTime: '13:00',
    status: 'completed',
    minCapacity: 2,
    maxCapacity: 8,
    currentBookings: 6,
    totalRevenue: 534,
    guideEarnings: 480,
    meetingPoint: 'Sultanahmet Square Fountain',
    isWaitlistEnabled: false,
    waitlistCount: 0
  },
  {
    id: 'occ5',
    date: '2026-04-10',
    startTime: '09:00',
    endTime: '13:00',
    status: 'cancelled',
    minCapacity: 2,
    maxCapacity: 8,
    currentBookings: 0,
    totalRevenue: 0,
    guideEarnings: 0,
    meetingPoint: 'Sultanahmet Square Fountain',
    isWaitlistEnabled: false,
    waitlistCount: 0
  }
]

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge = ({ status }: { status: OccurrenceStatus }) => {
  const styles = {
    scheduled: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      icon: Calendar,
      label: 'Scheduled'
    },
    completed: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/50',
      icon: CheckCircle,
      label: 'Completed'
    },
    cancelled: {
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800/50',
      icon: XCircle,
      label: 'Cancelled'
    },
    paused: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
      icon: PauseCircle,
      label: 'Paused'
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
// OCCURRENCE CARD COMPONENT
// ============================================================================

const OccurrenceCard = ({ occurrence, onAction }: { occurrence: TourOccurrence; onAction: (action: string, id: string) => void }) => {
  const [showMenu, setShowMenu] = useState(false)
  
  const date = new Date(occurrence.date)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  const capacityPercentage = (occurrence.currentBookings / occurrence.maxCapacity) * 100
  const isAlmostFull = capacityPercentage >= 80
  const isBelowMinimum = occurrence.currentBookings < occurrence.minCapacity

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {formattedDate}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {occurrence.startTime} - {occurrence.endTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={occurrence.status} />
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-10 py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onAction('edit', occurrence.id)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Occurrence
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onAction('duplicate', occurrence.id)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  {occurrence.status === 'scheduled' && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onAction('pause', occurrence.id)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2"
                    >
                      <PauseCircle className="w-4 h-4" />
                      Pause
                    </button>
                  )}
                  {occurrence.status === 'paused' && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onAction('resume', occurrence.id)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Resume
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onAction('cancel', occurrence.id)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Capacity</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {occurrence.currentBookings} / {occurrence.maxCapacity} booked
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isBelowMinimum ? 'bg-red-500' : isAlmostFull ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${capacityPercentage}%` }}
            />
          </div>
          {isBelowMinimum && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              ⚠️ Below minimum capacity ({occurrence.minCapacity} needed)
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              ${occurrence.totalRevenue}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Your Earnings</div>
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              ${occurrence.guideEarnings}
            </div>
          </div>
          {occurrence.isWaitlistEnabled && occurrence.waitlistCount > 0 && (
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Waitlist</div>
              <div className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {occurrence.waitlistCount} people
              </div>
            </div>
          )}
        </div>

        {/* Meeting Point (if different) */}
        {occurrence.meetingPoint && occurrence.meetingPoint !== MOCK_TOUR.meetingPoint && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            📍 {occurrence.meetingPoint}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <Link
            href={`/dashboard/guide/bookings?date=${occurrence.date}`}
            className="flex-1 text-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            View Bookings
          </Link>
          <button
            onClick={() => onAction('edit', occurrence.id)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TourOccurrencesPage() {
  const params = useParams()
  const router = useRouter()
  const tourId = params.id as string
  
  const [filterStatus, setFilterStatus] = useState<OccurrenceStatus | 'all'>('all')
  const [searchMonth, setSearchMonth] = useState('')
  const [occurrences, setOccurrences] = useState(MOCK_OCCURRENCES)
  const [showAddModal, setShowAddModal] = useState(false)

  // Filter occurrences
  const filteredOccurrences = useMemo(() => {
    return occurrences.filter(occ => {
      if (filterStatus !== 'all' && occ.status !== filterStatus) return false
      if (searchMonth) {
        const occMonth = new Date(occ.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        return occMonth.toLowerCase().includes(searchMonth.toLowerCase())
      }
      return true
    })
  }, [occurrences, filterStatus, searchMonth])

  const handleAction = (action: string, id: string) => {
    switch (action) {
      case 'edit':
        router.push(`/dashboard/guide/tours/${tourId}/occurrences/${id}/edit`)
        break
      case 'duplicate':
        toast.success('Occurrence duplicated')
        break
      case 'pause':
        setOccurrences(prev =>
          prev.map(occ => occ.id === id ? { ...occ, status: 'paused' } : occ)
        )
        toast.success('Occurrence paused')
        break
      case 'resume':
        setOccurrences(prev =>
          prev.map(occ => occ.id === id ? { ...occ, status: 'scheduled' } : occ)
        )
        toast.success('Occurrence resumed')
        break
      case 'cancel':
        if (confirm('Cancel this occurrence? All bookings will be refunded.')) {
          setOccurrences(prev =>
            prev.map(occ => occ.id === id ? { ...occ, status: 'cancelled' } : occ)
          )
          toast.success('Occurrence cancelled')
        }
        break
    }
  }

  // Split occurrences into upcoming and past
  const now = new Date()
  const upcomingOccurrences = filteredOccurrences.filter(occ => new Date(occ.date) >= now)
  const pastOccurrences = filteredOccurrences.filter(occ => new Date(occ.date) < now)

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/dashboard/guide/tours/${tourId}`}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  ← Back to Tour
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Tour Occurrences
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {MOCK_TOUR.title} • {MOCK_TOUR.location}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all self-start"
            >
              <Plus className="w-4 h-4" />
              Add Occurrence
            </button>
          </div>

          {/* Recurrence Info */}
          {MOCK_TOUR.isRecurring && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-start gap-3">
                <Repeat className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Recurring Tour Schedule
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    This tour repeats {MOCK_TOUR.recurrencePattern} on {MOCK_TOUR.recurringDays?.join(', ')}.
                    Each occurrence can be managed individually.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as OccurrenceStatus | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="paused">Paused</option>
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchMonth}
                onChange={(e) => setSearchMonth(e.target.value)}
                placeholder="Search by month (e.g., April 2026)..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => {
                setFilterStatus('all')
                setSearchMonth('')
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Upcoming Occurrences */}
          {upcomingOccurrences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Upcoming ({upcomingOccurrences.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingOccurrences.map(occ => (
                  <OccurrenceCard key={occ.id} occurrence={occ} onAction={handleAction} />
                ))}
              </div>
            </div>
          )}

          {/* Past Occurrences */}
          {pastOccurrences.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Past ({pastOccurrences.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastOccurrences.map(occ => (
                  <OccurrenceCard key={occ.id} occurrence={occ} onAction={handleAction} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredOccurrences.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
              <CalendarRange className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No occurrences found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {searchMonth ? 'Try adjusting your search' : 'Add your first occurrence to get started'}
              </p>
              {!searchMonth && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Occurrence
                </button>
              )}
            </div>
          )}

          {/* Add Occurrence Modal - Simplified for now */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Add New Occurrence
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Modal implementation will be added in Phase 2.
                </p>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}