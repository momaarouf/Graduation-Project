// ============================================================================
// ADMIN TOUR MODERATION & ALERTS - CARD 28
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/admin/tours/page.tsx
// 
// PURPOSE: Monitor, approve, and manage tours with capacity alerts
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Approve tours before publishing
// ✓ Capacity alerts (min/max not met)
// ✓ Regional kill switch (pause bookings by region)
// ✓ Tour listing with filters
// ✓ Tour details view
// ✓ Moderation actions
// 
// COLOR PSYCHOLOGY:
// - Blue: Active, approved tours
// - Green: Meeting capacity, healthy
// - Amber: Capacity warnings, pending
// - Red: Capacity issues, rejected
// - Purple: Regional controls
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Globe,
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Shield,
  Award,
  Flag,
  Ban,
  Power,
  Bell,
  Mail,
  MessageSquare,
  Edit,
  Trash2,
  MoreVertical,
  X
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type TourStatus = 'pending' | 'approved' | 'rejected' | 'paused' | 'live'
type CapacityStatus = 'healthy' | 'warning' | 'critical'
type Region = 'lebanon' | 'turkey' | 'both'

interface Tour {
  id: string
  guideId: string
  guideName: string
  guideAvatar?: string
  title: string
  description: string
  location: string
  city: string
  region: 'lebanon' | 'turkey'
  mainImage: string
  price: number
  currency: 'USD' | 'TRY' | 'LBP'
  minCapacity: number
  maxCapacity: number
  currentBookings: number
  status: TourStatus
  submittedAt: string
  startDate: string
  endDate?: string
  isRecurring: boolean
  categories: string[]
  languages: string[]
  halalCertified: boolean
  alerts?: {
    type: 'min_capacity' | 'max_capacity' | 'last_minute' | 'guide_unverified'
    message: string
  }[]
}

interface RegionControl {
  region: Region
  isActive: boolean
  pausedAt?: string
  reason?: string
}

interface TourStats {
  total: number
  pending: number
  approved: number
  rejected: number
  live: number
  capacityWarnings: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TOUR_STATS: TourStats = {
  total: 234,
  pending: 23,
  approved: 156,
  rejected: 12,
  live: 43,
  capacityWarnings: 18
}

const MOCK_REGION_CONTROLS: RegionControl[] = [
  { region: 'lebanon', isActive: true },
  { region: 'turkey', isActive: true },
  { region: 'both', isActive: true }
]

const MOCK_TOURS: Tour[] = [
  {
    id: 't1',
    guideId: 'g123',
    guideName: 'Mehmet Yilmaz',
    guideAvatar: '/images/guides/mehmet.jpg',
    title: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
    description: 'Explore the heart of the Ottoman Empire with a licensed historian...',
    location: 'Istanbul',
    city: 'Istanbul',
    region: 'turkey',
    mainImage: '/images/tours/istanbul-ottoman.jpg',
    price: 89,
    currency: 'USD',
    minCapacity: 2,
    maxCapacity: 8,
    currentBookings: 3,
    status: 'live',
    submittedAt: '2026-03-10T10:15:00Z',
    startDate: '2026-04-01T09:00:00Z',
    isRecurring: true,
    categories: ['historical', 'cultural'],
    languages: ['English', 'Arabic', 'Turkish'],
    halalCertified: true,
    alerts: []
  },
  {
    id: 't2',
    guideId: 'g124',
    guideName: 'Layla Hassan',
    guideAvatar: '/images/guides/layla.jpg',
    title: 'Beirut Street Food & Cultural Walk',
    description: 'Taste your way through Beirut with a local food expert...',
    location: 'Beirut',
    city: 'Beirut',
    region: 'lebanon',
    mainImage: '/images/tours/beirut-food.jpg',
    price: 45,
    currency: 'USD',
    minCapacity: 1,
    maxCapacity: 6,
    currentBookings: 2,
    status: 'live',
    submittedAt: '2026-03-09T14:30:00Z',
    startDate: '2026-04-05T11:00:00Z',
    isRecurring: false,
    categories: ['food', 'cultural'],
    languages: ['English', 'Arabic'],
    halalCertified: true,
    alerts: []
  },
  {
    id: 't3',
    guideId: 'g125',
    guideName: 'Ahmet Demir',
    guideAvatar: '/images/guides/ahmet.jpg',
    title: 'Cappadocia Sunrise Balloon & Valley Hike',
    description: 'Experience the magic of Cappadocia from above...',
    location: 'Cappadocia',
    city: 'Cappadocia',
    region: 'turkey',
    mainImage: '/images/tours/cappadocia-balloon.jpg',
    price: 199,
    currency: 'USD',
    minCapacity: 2,
    maxCapacity: 12,
    currentBookings: 2,
    status: 'pending',
    submittedAt: '2026-03-08T09:45:00Z',
    startDate: '2026-04-10T04:30:00Z',
    isRecurring: true,
    categories: ['adventure', 'nature'],
    languages: ['English', 'Turkish'],
    halalCertified: false,
    alerts: [
      {
        type: 'min_capacity',
        message: 'Only 2 bookings, minimum 4 required for tour to run'
      }
    ]
  },
  {
      id: 't4',
      guideId: 'g126',
      guideName: 'Elias Khoury',
      title: 'Byblos Ancient Ruins & Archaeological Tour',
      location: 'Byblos',
      city: 'Byblos',
      region: 'lebanon',
      mainImage: '/images/tours/byblos-ruins.jpg',
      price: 55,
      currency: 'USD',
      minCapacity: 1,
      maxCapacity: 15,
      currentBookings: 14,
      status: 'pending',
      submittedAt: '2026-03-07T16:20:00Z',
      startDate: '2026-04-12T10:00:00Z',
      isRecurring: false,
      categories: ['historical'],
      languages: ['English', 'Arabic', 'French'],
      halalCertified: false,
      alerts: [
          {
              type: 'max_capacity',
              message: 'Almost full (14/15 spots booked)'
          }
      ],
      description: ''
  },
  {
    id: 't5',
    guideId: 'g127',
    guideName: 'Zeynep Kaya',
    guideAvatar: '/images/guides/zeynep.jpg',
    title: 'Bosphorus Sunset Cruise with Dinner',
    description: 'Enjoy a romantic sunset cruise on the Bosphorus...',
    location: 'Istanbul',
    city: 'Istanbul',
    region: 'turkey',
    mainImage: '/images/tours/bosphorus-cruise.jpg',
    price: 129,
    currency: 'USD',
    minCapacity: 4,
    maxCapacity: 20,
    currentBookings: 3,
    status: 'rejected',
    submittedAt: '2026-03-06T11:10:00Z',
    startDate: '2026-04-15T17:30:00Z',
    isRecurring: true,
    categories: ['nature', 'food'],
    languages: ['English', 'Turkish'],
    halalCertified: true,
    alerts: [
      {
        type: 'min_capacity',
        message: 'Only 3 bookings, minimum 4 required'
      }
    ]
  }
]

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge = ({ status }: { status: TourStatus }) => {
  const styles = {
    pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    approved: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    rejected: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
    paused: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    live: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
  }

  const icons = {
    pending: AlertCircle,
    approved: CheckCircle,
    rejected: XCircle,
    paused: Ban,
    live: Globe
  }

  const Icon = icons[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      <Icon className="w-3.5 h-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ============================================================================
// CAPACITY BADGE
// ============================================================================

const CapacityBadge = ({ tour }: { tour: Tour }) => {
  const percentage = (tour.currentBookings / tour.maxCapacity) * 100
  const needsMin = tour.currentBookings < tour.minCapacity

  let status: CapacityStatus = 'healthy'
  let message = `${tour.currentBookings}/${tour.maxCapacity} booked`

  if (needsMin) {
    status = 'critical'
    message = `Needs ${tour.minCapacity - tour.currentBookings} more to run`
  } else if (percentage >= 90) {
    status = 'warning'
    message = `Almost full (${tour.currentBookings}/${tour.maxCapacity})`
  }

  const styles = {
    healthy: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    critical: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      <Users className="w-3.5 h-3.5" />
      {message}
    </span>
  )
}

// ============================================================================
// REGION CONTROL CARD
// ============================================================================

const RegionControlCard = ({ control, onToggle }: { control: RegionControl; onToggle: () => void }) => {
  const regionColors = {
    lebanon: 'from-emerald-600 to-emerald-700',
    turkey: 'from-blue-600 to-blue-700',
    both: 'from-purple-600 to-purple-700'
  }

  const regionNames = {
    lebanon: 'Lebanon',
    turkey: 'Turkey',
    both: 'Both Regions'
  }

  return (
    <div className={`p-4 bg-gradient-to-r ${regionColors[control.region]} rounded-xl text-white`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <h4 className="font-semibold">{regionNames[control.region]}</h4>
        </div>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${control.isActive ? 'bg-white/30' : 'bg-white/10'}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${control.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>
      <p className="text-sm text-white/90">
        {control.isActive ? 'Bookings active' : 'Bookings paused'}
      </p>
    </div>
  )
}

// ============================================================================
// TOUR DETAILS MODAL
// ============================================================================

const TourDetailsModal = ({ isOpen, onClose, tour, onApprove, onReject }: any) => {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!isOpen || !tour) return null

  const handleApprove = () => {
    if (window.confirm(`Approve tour "${tour.title}"?`)) {
      onApprove(tour.id)
      onClose()
    }
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    if (window.confirm(`Reject tour "${tour.title}"?`)) {
      onReject(tour.id, rejectReason)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Tour Details</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
          {/* Tour Header */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <Image src={tour.mainImage} alt={tour.title} width={80} height={80} className="object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tour.title}</h4>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={tour.status} />
                <CapacityBadge tour={tour} />
              </div>
            </div>
          </div>

          {/* Guide Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Guide Information
            </h5>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                  {tour.guideAvatar ? (
                    <Image src={tour.guideAvatar} alt={tour.guideName} width={40} height={40} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-400">G</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{tour.guideName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {tour.guideId}</p>
              </div>
            </div>
          </div>

          {/* Tour Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</h5>
              <p className="text-gray-900 dark:text-white flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                {tour.location}, {tour.city}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</h5>
              <p className="text-gray-900 dark:text-white flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-gray-400" />
                ${tour.price} {tour.currency}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capacity</h5>
              <p className="text-gray-900 dark:text-white flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400" />
                Min: {tour.minCapacity} / Max: {tour.maxCapacity}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bookings</h5>
              <p className="text-gray-900 dark:text-white flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                {tour.currentBookings} booked
              </p>
            </div>
          </div>

          {/* Categories & Languages */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories & Languages</h5>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {tour.categories.map(cat => (
                  <span key={cat} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-lg">
                    {cat}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {tour.languages.map(lang => (
                  <span key={lang} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-lg">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {tour.alerts && tour.alerts.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-800/50">
              <h5 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Alerts
              </h5>
              <div className="space-y-2">
                {tour.alerts.map((alert, idx) => (
                  <p key={idx} className="text-sm text-amber-600 dark:text-amber-500">{alert.message}</p>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {tour.status === 'pending' && (
            <div className="space-y-3">
              {showRejectForm ? (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-800/50">
                  <h5 className="text-sm font-medium text-red-700 dark:text-red-400 mb-3">Rejection Reason</h5>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this tour is being rejected..."
                    rows={2}
                    className="w-full p-3 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleReject} className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
                      Confirm Rejection
                    </button>
                    <button onClick={() => setShowRejectForm(false)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={handleApprove} className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Approve Tour
                  </button>
                  <button onClick={() => setShowRejectForm(true)} className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminTourModerationPage() {
  const [filterStatus, setFilterStatus] = useState<TourStatus | 'all'>('pending')
  const [filterRegion, setFilterRegion] = useState<Region | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [regionControls, setRegionControls] = useState(MOCK_REGION_CONTROLS)
  const itemsPerPage = 5

  // Filter tours
  const filteredTours = useMemo(() => {
    return MOCK_TOURS.filter(tour => {
      if (filterStatus !== 'all' && tour.status !== filterStatus) return false
      if (filterRegion !== 'all' && tour.region !== filterRegion) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (
          tour.title.toLowerCase().includes(term) ||
          tour.guideName.toLowerCase().includes(term) ||
          tour.location.toLowerCase().includes(term)
        )
      }
      return true
    })
  }, [filterStatus, filterRegion, searchTerm])

  const totalPages = Math.ceil(filteredTours.length / itemsPerPage)
  const paginatedTours = filteredTours.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const resetFilters = () => {
    setFilterStatus('all')
    setFilterRegion('all')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleApprove = (id: string) => {
    alert(`✅ Tour approved!`)
    console.log('Approve tour:', id)
  }

  const handleReject = (id: string, reason: string) => {
    alert(`❌ Tour rejected!`)
    console.log('Reject tour:', id, reason)
  }

  const toggleRegion = (region: Region) => {
    setRegionControls(prev =>
      prev.map(r => r.region === region ? { ...r, isActive: !r.isActive } : r)
    )
    alert(`🔄 Bookings ${regionControls.find(r => r.region === region)?.isActive ? 'paused' : 'activated'} for ${region}`)
  }

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Tour Moderation
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Approve, reject, and monitor tours across all regions
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            {[
              { key: 'all', label: 'Total Tours', value: MOCK_TOUR_STATS.total, color: 'blue', action: () => setFilterStatus('all') },
              { key: 'pending', label: 'Pending', value: MOCK_TOUR_STATS.pending, color: 'amber', action: () => setFilterStatus('pending') },
              { key: 'approved', label: 'Approved', value: MOCK_TOUR_STATS.approved, color: 'emerald', action: () => setFilterStatus('approved') },
              { key: 'live', label: 'Live', value: MOCK_TOUR_STATS.live, color: 'blue', action: () => setFilterStatus('live') },
              { key: 'warnings', label: 'Warnings', value: MOCK_TOUR_STATS.capacityWarnings, color: 'red', action: () => {} }
            ].map(stat => (
              <div
                key={stat.key}
                onClick={stat.action}
                className={`group p-4 bg-white dark:bg-gray-900 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 border-2 ${
                  filterStatus === stat.key
                    ? `border-${stat.color}-500 ring-2 ring-${stat.color}-200 dark:ring-${stat.color}-800`
                    : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Regional Controls */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Power className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Regional Kill Switch
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {regionControls.map(control => (
                <RegionControlCard
                  key={control.region}
                  control={control}
                  onToggle={() => toggleRegion(control.region)}
                />
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TourStatus | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="live">Live</option>
              <option value="paused">Paused</option>
            </select>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value as Region | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Regions</option>
              <option value="turkey">Turkey</option>
              <option value="lebanon">Lebanon</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by tour title, guide name, or location..."
              className="w-full pl-11 pr-11 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {paginatedTours.length} of {filteredTours.length} tours
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tour</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guide</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedTours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          <Image src={tour.mainImage} alt={tour.title} width={40} height={40} className="object-cover" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{tour.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tour.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          {tour.guideAvatar ? (
                            <Image src={tour.guideAvatar} alt={tour.guideName} width={24} height={24} className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-[8px] font-bold text-gray-400">G</span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{tour.guideName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={tour.status} /></td>
                    <td className="px-6 py-4"><CapacityBadge tour={tour} /></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${
                        tour.region === 'turkey' 
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                          : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                      }`}>
                        <Globe className="w-3 h-3" />
                        {tour.region}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedTour(tour); setShowDetailsModal(true); }}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {paginatedTours.map((tour) => (
              <div key={tour.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <Image src={tour.mainImage} alt={tour.title} width={64} height={64} className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{tour.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tour.location}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <StatusBadge status={tour.status} />
                  <CapacityBadge tour={tour} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      {tour.guideAvatar ? (
                        <Image src={tour.guideAvatar} alt={tour.guideName} width={24} height={24} className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[8px] font-bold text-gray-400">G</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{tour.guideName}</span>
                  </div>
                  <button
                    onClick={() => { setSelectedTour(tour); setShowDetailsModal(true); }}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-medium rounded-lg"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTours.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
                <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tours found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or check back later.</p>
              <button onClick={resetFilters} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredTours.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedTour && (
        <TourDetailsModal
          isOpen={showDetailsModal}
          onClose={() => { setShowDetailsModal(false); setSelectedTour(null); }}
          tour={selectedTour}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </PageLayout>
  )
}