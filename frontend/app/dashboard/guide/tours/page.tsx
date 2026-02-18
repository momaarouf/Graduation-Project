// ============================================================================
// GUIDE TOURS LIST - CARD 16 (EXTENSION)
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/tours/page.tsx
// 
// PURPOSE: Display all tours created by the guide with status and stats
// 
// FEATURES:
// - List all tours (draft, published, paused, completed)
// - Filter by status
// - Search tours
// - Quick stats (total tours, active, pending, completed)
// - Quick actions (edit, duplicate, pause, delete)
// - View bookings per tour
// - Performance metrics (bookings, revenue, rating)
// ============================================================================

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Edit,
  Copy,
  PauseCircle,
  PlayCircle,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Sparkles,
  BarChart3
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import toast from 'react-hot-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type TourStatus = 'draft' | 'published' | 'paused' | 'completed' | 'cancelled'

interface TourListItem {
  id: string
  title: string
  mainImage: string
  location: string
  city: string
  country: 'lebanon' | 'turkey'
  status: TourStatus
  price: number
  currency: 'USD' | 'TRY' | 'LBP'
  minCapacity: number
  maxCapacity: number
  totalBookings: number
  totalRevenue: number
  averageRating: number
  reviewCount: number
  nextDate?: string
  createdAt: string
  updatedAt: string
  isHalalCertified: boolean
  hasRecurring: boolean
}

interface ToursStats {
  total: number
  published: number
  draft: number
  paused: number
  completed: number
  totalBookings: number
  totalRevenue: number
  averageRating: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TOURS_STATS: ToursStats = {
  total: 12,
  published: 5,
  draft: 3,
  paused: 2,
  completed: 2,
  totalBookings: 87,
  totalRevenue: 8450,
  averageRating: 4.8
}

const MOCK_TOURS: TourListItem[] = [
  {
    id: '1',
    title: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
    mainImage: '/images/tours/istanbul-ottoman.jpg',
    location: 'Istanbul',
    city: 'istanbul',
    country: 'turkey',
    status: 'published',
    price: 89,
    currency: 'USD',
    minCapacity: 2,
    maxCapacity: 8,
    totalBookings: 24,
    totalRevenue: 2136,
    averageRating: 4.9,
    reviewCount: 18,
    nextDate: '2026-04-15T09:00:00Z',
    createdAt: '2026-01-10T10:30:00Z',
    updatedAt: '2026-03-01T14:20:00Z',
    isHalalCertified: true,
    hasRecurring: true
  },
  {
    id: '2',
    title: 'Bosphorus Sunset Cruise with Dinner',
    mainImage: '/images/tours/bosphorus-cruise.jpg',
    location: 'Istanbul',
    city: 'istanbul',
    country: 'turkey',
    status: 'published',
    price: 129,
    currency: 'USD',
    minCapacity: 4,
    maxCapacity: 20,
    totalBookings: 42,
    totalRevenue: 5418,
    averageRating: 4.8,
    reviewCount: 36,
    nextDate: '2026-04-16T17:30:00Z',
    createdAt: '2026-01-15T09:45:00Z',
    updatedAt: '2026-03-02T11:10:00Z',
    isHalalCertified: true,
    hasRecurring: true
  },
  {
    id: '3',
    title: 'Cappadocia Sunrise Balloon & Valley Hike',
    mainImage: '/images/tours/cappadocia-balloon.jpg',
    location: 'Cappadocia',
    city: 'cappadocia',
    country: 'turkey',
    status: 'published',
    price: 199,
    currency: 'USD',
    minCapacity: 2,
    maxCapacity: 12,
    totalBookings: 15,
    totalRevenue: 2985,
    averageRating: 5.0,
    reviewCount: 14,
    nextDate: '2026-04-18T04:30:00Z',
    createdAt: '2026-02-01T13:20:00Z',
    updatedAt: '2026-03-03T16:45:00Z',
    isHalalCertified: false,
    hasRecurring: true
  },
  {
    id: '4',
    title: 'Beirut Street Food & Cultural Walk',
    mainImage: '/images/tours/beirut-food.jpg',
    location: 'Beirut',
    city: 'beirut',
    country: 'lebanon',
    status: 'draft',
    price: 45,
    currency: 'USD',
    minCapacity: 1,
    maxCapacity: 6,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    reviewCount: 0,
    createdAt: '2026-02-20T11:30:00Z',
    updatedAt: '2026-02-20T11:30:00Z',
    isHalalCertified: true,
    hasRecurring: false
  },
  {
    id: '5',
    title: 'Byblos Ancient Ruins & Archaeological Tour',
    mainImage: '/images/tours/byblos-ruins.jpg',
    location: 'Byblos',
    city: 'byblos',
    country: 'lebanon',
    status: 'paused',
    price: 55,
    currency: 'USD',
    minCapacity: 1,
    maxCapacity: 15,
    totalBookings: 6,
    totalRevenue: 330,
    averageRating: 4.5,
    reviewCount: 4,
    nextDate: '2026-04-20T10:00:00Z',
    createdAt: '2026-01-05T15:40:00Z',
    updatedAt: '2026-03-05T09:15:00Z',
    isHalalCertified: false,
    hasRecurring: false
  }
]

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge = ({ status }: { status: TourStatus }) => {
  const styles = {
    published: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      icon: CheckCircle,
      label: 'Published'
    },
    draft: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: Clock,
      label: 'Draft'
    },
    paused: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
      icon: PauseCircle,
      label: 'Paused'
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
interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  subtext?: string
  color: 'blue' | 'emerald' | 'amber' | 'purple'  // ← Add this union type
}
// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

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
// TOUR CARD COMPONENT
// ============================================================================

const TourCard = ({ tour, onAction }: { tour: TourListItem; onAction: (action: string, tourId: string) => void }) => {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No dates scheduled'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getCountryFlag = (country: string) => {
    return country === 'lebanon' ? '🇱🇧' : '🇹🇷'
  }

  return (
    <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-48 h-32 bg-gray-100 dark:bg-gray-800">
          <Image src={tour.mainImage} alt={tour.title} fill className="object-cover" />
          
          {/* Status Badge - Mobile */}
          <div className="absolute top-2 left-2 sm:hidden">
            <StatusBadge status={tour.status} />
          </div>

          {/* Halal Badge */}
          {tour.isHalalCertified && (
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Halal
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            {/* Left side */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {tour.title}
                </h3>
                {/* Status Badge - Desktop */}
                <div className="hidden sm:block">
                  <StatusBadge status={tour.status} />
                </div>
              </div>

              {/* Location & Meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <span className="text-base">{getCountryFlag(tour.country)}</span>
                  {tour.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(tour.nextDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {tour.minCapacity}-{tour.maxCapacity} people
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {tour.totalBookings}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Bookings</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${tour.totalRevenue}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {tour.averageRating > 0 ? tour.averageRating.toFixed(1) : 'New'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {tour.reviewCount > 0 ? `${tour.reviewCount} reviews` : 'No reviews'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Price & Actions */}
            <div className="flex sm:flex-col items-center sm:items-end gap-3">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${tour.price}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">per person</div>
              </div>

              {/* Actions Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-10 py-1">
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        router.push(`/dashboard/guide/tours/${tour.id}`)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        router.push(`/dashboard/guide/tours/${tour.id}/edit`)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Tour
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        router.push(`/dashboard/guide/tours/${tour.id}/bookings`)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      View Bookings
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        router.push(`/dashboard/guide/tours/${tour.id}/analytics`)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-800 my-1" />
                    {tour.status === 'published' ? (
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          onAction('pause', tour.id)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2"
                      >
                        <PauseCircle className="w-4 h-4" />
                        Pause Tour
                      </button>
                    ) : tour.status === 'paused' ? (
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          onAction('resume', tour.id)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Resume Tour
                      </button>
                    ) : null}
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onAction('duplicate', tour.id)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onAction('delete', tour.id)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideToursPage() {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<TourStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter tours
  const filteredTours = useMemo(() => {
    return MOCK_TOURS.filter(tour => {
      if (filterStatus !== 'all' && tour.status !== filterStatus) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (
          tour.title.toLowerCase().includes(term) ||
          tour.location.toLowerCase().includes(term)
        )
      }
      return true
    })
  }, [filterStatus, searchTerm])

  const totalPages = Math.ceil(filteredTours.length / itemsPerPage)
  const paginatedTours = filteredTours.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleAction = (action: string, tourId: string) => {
    switch (action) {
      case 'pause':
        toast.success('Tour paused successfully')
        break
      case 'resume':
        toast.success('Tour resumed successfully')
        break
      case 'duplicate':
        toast.success('Tour duplicated')
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this tour?')) {
          toast.success('Tour deleted')
        }
        break
    }
  }

  const resetFilters = () => {
    setFilterStatus('all')
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                My Tours
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage and monitor all your tour listings
              </p>
            </div>
            <Link
              href="/dashboard/guide/tours/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all self-start"
            >
              <Plus className="w-4 h-4" />
              Create New Tour
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <StatCard
              icon={Calendar}
              label="Total Tours"
              value={MOCK_TOURS_STATS.total}
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              label="Published"
              value={MOCK_TOURS_STATS.published}
              subtext="Live"
              color="emerald"
            />
            <StatCard
              icon={Clock}
              label="Draft"
              value={MOCK_TOURS_STATS.draft}
              color="amber"
            />
            <StatCard
              icon={DollarSign}
              label="Revenue"
              value={`$${MOCK_TOURS_STATS.totalRevenue}`}
              color="purple"
            />
            <StatCard
              icon={Star}
              label="Avg Rating"
              value={MOCK_TOURS_STATS.averageRating}
              color="amber"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TourStatus | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Tours</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tours by title or location..."
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
            Showing {paginatedTours.length} of {filteredTours.length} tours
          </div>

          {/* Tours List */}
          <div className="space-y-4">
            {paginatedTours.length > 0 ? (
              paginatedTours.map(tour => (
                <TourCard key={tour.id} tour={tour} onAction={handleAction} />
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No tours found
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm ? 'Try adjusting your search' : 'Create your first tour to get started'}
                </p>
                {!searchTerm && (
                  <Link
                    href="/dashboard/guide/tours/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Tour
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredTours.length > itemsPerPage && (
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
    </PageLayout>
  )
}