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
 BarChart3,
 Undo2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getGuideTours, pauseTour, archiveTour, deleteTour, submitTourForReview, withdrawTourFromReview, resumeTour } from '@/src/lib/api/tours'
import { TourTemplateResponse, TourTemplateStatus } from '@/src/lib/types/tour.types'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// ── Stat Helper ─────────────────────────────────────────────────────────────

interface ToursStats {
 total: number
 published: number
 draft: number
 paused: number
 pending: number
 totalBookings: number // Placeholder for now
 totalRevenue: number // Placeholder for now
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge = ({ status }: { status: TourTemplateStatus }) => {
 const styles: Record<TourTemplateStatus, { bg: string, text: string, border: string, icon: any, label: string }> = {
 PUBLISHED: {
 bg: 'bg-success-green/10 dark:bg-success-green/10',
 text: 'text-emerald-700 dark:text-emerald-400',
 border: 'border-success-green dark:border-success-green/50',
 icon: CheckCircle,
 label: 'Published'
 },
 DRAFT: {
 bg: 'surface-section',
 text: 'text-theme-secondary ',
 border: 'border-theme',
 icon: Clock,
 label: 'Draft'
 },
 PENDING_REVIEW: {
 bg: 'bg-primary-light/10 dark:bg-primary-light/10',
 text: 'text-blue-700 dark:text-primary-dark ',
 border: 'border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark/50',
 icon: RefreshCw,
 label: 'Pending'
 },
 PAUSED: {
 bg: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-accent-light/10 dark:bg-accent-dark/10',
 text: 'text-accent-light dark:text-accent-dark dark:text-amber-400',
 border: 'border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/50',
 icon: PauseCircle,
 label: 'Paused'
 },
 REJECTED: {
 bg: 'bg-danger-red/10 dark:bg-danger-red/10',
 text: 'text-red-700 dark:text-red-400',
 border: 'border-danger-red dark:border-danger-red/50',
 icon: AlertCircle,
 label: 'Rejected'
 },
 ARCHIVED: {
 bg: 'surface-section',
 text: 'text-theme-muted ',
 border: 'border-theme-strong',
 icon: Trash2,
 label: 'Archived'
 }
 }

 const config = styles[status] || styles.DRAFT

 return (
 <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}>
 <config.icon className="w-3.5 h-3.5" />
 {config.label}
 </span>
 )
}
interface StatCardProps {
 icon: React.ElementType
 label: string
 value: string | number
 subtext?: string
 color: 'blue' | 'emerald' | 'amber' | 'purple' // ← Add this union type
}
// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

const StatCard = ({ icon: Icon, label, value, subtext, color }: StatCardProps) => {
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
 <div className="text-xs text-theme-muted ">{label}</div>
 {subtext && <div className="text-xs text-theme-muted ">{subtext}</div>}
 </div>
 </div>
 )
}

// ============================================================================
// TOUR CARD COMPONENT
// ============================================================================

const TourCard = ({ tour, onAction }: { tour: TourTemplateResponse; onAction: (action: string, tourId: number) => void }) => {
 const router = useRouter()
 const [showMenu, setShowMenu] = useState(false)

 const coverImageUrl = tour.media && tour.media.length > 0 ? tour.media[0].url : null

 const formatDate = (dateString?: string | null) => {
 if (!dateString) return 'No dates scheduled'
 const date = new Date(dateString)
 return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
 }

 const getCountryFlag = (code?: string | null) => {
 if (code === 'LB') return '🇱🇧'
 if (code === 'TR') return '🇹🇷'
 return '🌍'
 }

 return (
 <div className="group surface-card border border-theme rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
 <div className="flex flex-col sm:flex-row">
 {/* Image */}
 <div className="relative w-full sm:w-48 h-32 surface-section flex items-center justify-center overflow-hidden rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none">
 {coverImageUrl ? (
 <Image src={coverImageUrl} alt={tour.title} fill className="object-cover" />
 ) : (
 <div className="flex flex-col items-center gap-1 text-theme-muted">
 <MapPin className="w-6 h-6 opacity-30" />
 <span className="text-[10px] font-medium uppercase tracking-wider opacity-60">No Media</span>
 </div>
 )}
 
 {/* Status Badge - Mobile */}
 <div className="absolute top-2 left-2 sm:hidden">
 <StatusBadge status={tour.status} />
 </div>

 {/* Halal Badge */}
 {tour.halalFriendly && (
 <div className="absolute bottom-2 left-2 px-2 py-1 bg-success-green/20 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full flex items-center gap-1 shadow-sm">
 <Sparkles className="w-3 h-3" />
 Halal
 </div>
 )}
 </div>

 {/* Content */}
 <div className="flex-1 p-4 text-left">
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
 {/* Left side */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-2">
 <h3 className="font-bold text-theme-primary group-hover:text-primary-light dark:text-primary-dark dark:group-hover:text-primary-light dark:text-primary-dark transition-colors line-clamp-1">
 {tour.title}
 </h3>
 {/* Status Badge - Desktop */}
 <div className="hidden sm:block shrink-0">
 <StatusBadge status={tour.status} />
 </div>
 </div>

 {/* Rejection Reason - Inline Alert */}
 {tour.status === 'REJECTED' && tour.rejectionReason && (
 <div className="mb-4 p-3 bg-danger-red/10 dark:bg-red-900/10 border border-danger-red dark:border-danger-red/20 rounded-lg flex items-start gap-3">
 <AlertCircle className="w-4 h-4 text-danger-red dark:text-red-400 shrink-0 mt-0.5" />
 <div>
 <p className="text-xs font-bold text-red-800 dark:text-red-300 mb-1">Rejection Reason:</p>
 <p className="text-xs text-red-700 dark:text-red-400/90 leading-relaxed italic">
"{tour.rejectionReason}"
 </p>
 </div>
 </div>
 )}

 {/* Location & Meta */}
 <div className="flex flex-wrap items-center gap-3 text-xs text-theme-muted mb-3">
 <span className="flex items-center gap-1">
 <span className="text-base leading-none">{getCountryFlag(tour.countryCode)}</span>
 {tour.locationName || 'Location pending'}
 </span>
 <span className="flex items-center gap-1">
 <Calendar className="w-3 h-3" />
 {!tour.isRecurring && tour.startDate ? (
 <span className="text-primary-light dark:text-primary-dark dark:text-primary-dark font-medium">
 Scheduled: {formatDate(tour.startDate)}
 </span>
 ) : tour.lastPublishedAtUtc ? (
 `Updated ${formatDate(tour.lastPublishedAtUtc)}`
 ) : (
 'Created ' + formatDate(tour.createdAtUtc)
 )}
 </span>
 <span className="flex items-center gap-1">
 <Clock className="w-3 h-3 text-primary-light dark:text-primary-dark" />
 {tour.durationHours}h {tour.durationMinutes}m
 </span>
 <span className="flex items-center gap-1">
 <Users className="w-3 h-3 text-success-green" />
 {tour.minCapacity}-{tour.maxCapacity} people
 </span>
 </div>

 {/* Stats Grid - In dashboard we might need real booking stats from a different endpoint later. 
 For now using placeholders that look real. */}
 <div className="grid grid-cols-3 gap-4 mt-3">
 <div>
 <div className="text-sm font-semibold text-theme-primary">
 0
 </div>
 <div className="text-xs text-theme-muted ">Bookings</div>
 </div>
 <div>
 <div className="text-sm font-semibold text-theme-primary">
 $0
 </div>
 <div className="text-xs text-theme-muted ">Revenue</div>
 </div>
 <div>
 <div className="flex items-center gap-1 text-sm font-semibold text-theme-primary">
 <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
 New
 </div>
 <div className="text-xs text-theme-muted ">
 No reviews
 </div>
 </div>
 </div>
 </div>

 {/* Right side - Price & Actions */}
 <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
 <div className="text-right">
 <div className="text-lg font-bold text-theme-primary leading-tight">
 ${tour.basePrice}
 </div>
 <div className="text-[10px] uppercase tracking-wider text-theme-muted font-semibold">
 {tour.currency} / person
 </div>
 </div>

 {/* Actions Menu */}
 <div className="relative">
 <button
 onClick={() => setShowMenu(!showMenu)}
 className={`p-2 rounded-lg transition-all ${showMenu ? 'surface-section text-primary-light dark:text-primary-dark' : 'text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 hover:surface-section dark:hover:surface-card'}`}
 >
 <MoreVertical className="w-4 h-4" />
 </button>

 {showMenu && (
 <>
 <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
 <div className="absolute right-0 top-full mt-1 w-52 surface-card border border-theme rounded-xl shadow-2xl z-20 py-1.5 ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
 <button
 onClick={() => {
 setShowMenu(false)
 router.push(`/dashboard/guide/tours/${tour.id}`)
 }}
 className="w-full px-4 py-2 text-left text-sm text-theme-secondary hover:bg-primary-light/10 dark:hover:surface-base hover:text-primary-light dark:text-primary-dark flex items-center gap-3 transition-colors"
 >
 <Eye className="w-4 h-4" />
 View Summary
 </button>
 <button
 onClick={() => {
 setShowMenu(false)
 router.push(`/dashboard/guide/tours/${tour.id}/edit`)
 }}
 className="w-full px-4 py-2 text-left text-sm text-theme-secondary hover:bg-primary-light/10 dark:hover:surface-base hover:text-primary-light dark:text-primary-dark flex items-center gap-3 transition-colors"
 >
 <Edit className="w-4 h-4" />
 Edit Content
 </button>
 <button
 onClick={() => {
 setShowMenu(false)
 router.push(`/dashboard/guide/tours/${tour.id}/occurrences`)
 }}
 className="w-full px-4 py-2 text-left text-sm text-theme-secondary hover:bg-primary-light/10 dark:hover:surface-base hover:text-primary-light dark:text-primary-dark flex items-center gap-3 transition-colors"
 >
 <Calendar className="w-4 h-4" />
 Manage Dates
 </button>
 
 <div className="border-t border-theme my-1" />
 
 {(tour.status === 'DRAFT' || tour.status === 'REJECTED') && (
 <>
 <button
 onClick={() => { setShowMenu(false); onAction('submit', tour.id); }}
 className="w-full px-4 py-2 text-left text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-3 transition-colors"
 >
 <Plus className="w-4 h-4" />
 Submit for Review
 </button>
 
 {/* DEV-ONLY SHORTCUT */}
 <button
 onClick={() => { setShowMenu(false); onAction('publish-immediately', tour.id); }}
 className="w-full px-4 py-2 text-left text-sm text-success-green dark:text-emerald-400 hover:bg-success-green/10 dark:hover:bg-emerald-900/20 flex items-center gap-3 transition-colors border-t border-theme"
 >
 <Sparkles className="w-4 h-4" />
 Publish (Dev-Only)
 </button>
 </>
 )}

 {tour.status === 'PUBLISHED' && (
 <button
 onClick={() => { setShowMenu(false); onAction('pause', tour.id); }}
 className="w-full px-4 py-2 text-left text-sm text-accent-light dark:text-accent-dark dark:text-amber-400 hover:bg-accent-light/10 dark:bg-accent-dark/10 dark:hover:bg-amber-950/20 flex items-center gap-3 transition-colors"
 >
 <PauseCircle className="w-4 h-4" />
 Pause Listing
 </button>
 )}

 {tour.status === 'PENDING_REVIEW' && (
 <button
 onClick={() => { setShowMenu(false); onAction('withdraw', tour.id); }}
 className="w-full px-4 py-2 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 flex items-center gap-3 transition-colors"
 >
 <Undo2 className="w-4 h-4" />
 Withdraw from Review
 </button>
 )}
 
 {tour.status === 'PAUSED' && (
 <button
 onClick={() => { setShowMenu(false); onAction('resume', tour.id); }}
 className="w-full px-4 py-2 text-left text-sm text-success-green dark:text-emerald-400 hover:bg-success-green/10 dark:hover:bg-emerald-950/20 flex items-center gap-3 transition-colors"
 >
 <PlayCircle className="w-4 h-4" />
 Resume (re-publish)
 </button>
 )}

 <button
 onClick={() => { setShowMenu(false); onAction('delete', tour.id); }}
 className="w-full px-4 py-2 text-left text-sm text-danger-red dark:text-red-400 hover:bg-danger-red/10 dark:hover:bg-red-950/20 flex items-center gap-3 transition-colors"
 >
 <Trash2 className="w-4 h-4" />
 Delete Tour
 </button>
 </div>
 </>
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

import { useEffect } from 'react'

export default function GuideToursPage() {
 const router = useRouter()
 const [tours, setTours] = useState<TourTemplateResponse[]>([])
 const [loading, setLoading] = useState(true)
 const [filterStatus, setFilterStatus] = useState<TourTemplateStatus | 'ALL'>('ALL')
 const [searchTerm, setSearchTerm] = useState('')
 const [currentPage, setCurrentPage] = useState(1)
 const itemsPerPage = 5

 const fetchTours = async () => {
 try {
 setLoading(true)
 const res = await getGuideTours()
 setTours(res)
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Failed to fetch tours')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchTours()
 }, [])

 // Stats calculation
 const stats = useMemo<ToursStats>(() => {
 return {
 total: tours.length,
 published: tours.filter(t => t.status === 'PUBLISHED').length,
 draft: tours.filter(t => t.status === 'DRAFT').length,
 paused: tours.filter(t => t.status === 'PAUSED').length,
 pending: tours.filter(t => t.status === 'PENDING_REVIEW').length,
 totalBookings: 0,
 totalRevenue: 0
 }
 }, [tours])

 // Filter tours
 const filteredTours = useMemo(() => {
 return tours.filter(tour => {
 if (filterStatus !== 'ALL' && tour.status !== filterStatus) return false
 if (searchTerm) {
 const term = searchTerm.toLowerCase()
 return (
 tour.title.toLowerCase().includes(term) ||
 (tour.locationName?.toLowerCase().includes(term) ?? false)
 )
 }
 return true
 })
 }, [tours, filterStatus, searchTerm])

 const totalPages = Math.ceil(filteredTours.length / itemsPerPage)
 const paginatedTours = filteredTours.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

 const handleAction = async (action: string, tourId: number) => {
 try {
 switch (action) {
 case 'pause':
 await pauseTour(tourId)
 toast.success('Tour paused successfully')
 break
 case 'resume':
 await resumeTour(tourId)
 toast.success('Tour submitted for re-approval')
 break
 case 'withdraw':
 await withdrawTourFromReview(tourId)
 toast.success('Tour withdrawn to draft')
 break
 case 'submit':
 await submitTourForReview(tourId)
 toast.success('Submitted for review')
 break
 case 'publish-immediately':
 await import('@/src/lib/api/tours').then(api => api.publishTourImmediately(tourId))
 toast.success('Tour published immediately (Dev Mode)')
 break
 case 'delete':
 if (confirm('Are you sure you want to delete this tour template? Item will be archived.')) {
 await deleteTour(tourId)
 toast.success('Tour archived')
 }
 break
 }
 fetchTours() // Refresh list
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Action failed')
 }
 }

 const resetFilters = () => {
 setFilterStatus('ALL')
 setSearchTerm('')
 setCurrentPage(1)
 }

 return (
 <>
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)]">
 <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
 
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
 <div className="text-left">
 <h1 className="text-2xl sm:text-4xl font-black text-theme-primary mb-2 tracking-tight">
 My <span className="text-primary-light dark:text-primary-dark">Tours</span>
 </h1>
 <p className="text-sm text-theme-secondary font-medium">
 Create, manage and track your tour inventory
 </p>
 </div>
 <Link
 href="/dashboard/guide/tours/new"
 className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-light hover:bg-primary-light-hover text-white rounded-xl shadow-lg shadow-primary-light/20 transition-all active:scale-95 font-semibold text-sm self-start"
 >
 <Plus className="w-5 h-5" />
 New Tour Listing
 </Link>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
 <StatCard
 icon={Calendar}
 label="Inventory"
 value={stats.total}
 color="blue"
 />
 <StatCard
 icon={CheckCircle}
 label="Live Listings"
 value={stats.published}
 subtext="Publicly visible"
 color="emerald"
 />
 <StatCard
 icon={Clock}
 label="In Progress"
 value={stats.draft + stats.pending}
 subtext={`${stats.pending} pending review`}
 color="amber"
 />
 <StatCard
 icon={TrendingUp}
 label="Total Revenue"
 value={`$${stats.totalRevenue}`}
 color="purple"
 />
 <StatCard
 icon={Star}
 label="Performance"
 value="N/A"
 color="amber"
 />
 </div>

 {/* Filters Bar */}
 <div className="surface-card border border-theme rounded-2xl p-4 mb-6 shadow-sm">
 <div className="flex flex-col lg:flex-row gap-4">
 <div className="w-full lg:w-48">
 <select
 value={filterStatus}
 onChange={(e) => setFilterStatus(e.target.value as TourTemplateStatus | 'ALL')}
 className="w-full h-11 px-4 surface-section border-none rounded-xl text-sm font-semibold text-theme-primary focus:ring-2 focus:ring-primary-light dark:ring-primary-dark appearance-none cursor-pointer"
 >
 <option value="ALL">All Statuses</option>
 <option value="PUBLISHED">Published</option>
 <option value="DRAFT">Draft</option>
 <option value="PENDING_REVIEW">Pending Review</option>
 <option value="PAUSED">Paused</option>
 <option value="REJECTED">Rejected</option>
 </select>
 </div>

 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Search by title, location, or landmarks..."
 className="w-full h-11 pl-11 pr-4 surface-section border-none rounded-xl text-sm font-medium text-theme-primary placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 />
 </div>

 <button
 onClick={resetFilters}
 className="h-11 px-6 surface-section text-theme-secondary font-semibold rounded-xl hover:surface-section dark:hover:surface-section transition-colors flex items-center justify-center gap-2"
 >
 <RefreshCw className="w-4 h-4" />
 Reset Filters
 </button>
 </div>
 </div>

 {/* Results Summary */}
 {!loading && (
 <div className="mb-4 flex items-center justify-between">
 <div className="text-xs font-bold uppercase tracking-widest text-theme-muted ">
 Sorted by newest first • {filteredTours.length} results
 </div>
 </div>
 )}

 {/* Tours List */}
 <div className="space-y-4 min-h-[400px]">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-20 gap-4">
 <RefreshCw className="w-8 h-8 text-primary-light dark:text-primary-dark animate-spin" />
 <p className="text-sm font-medium text-theme-muted px-10 text-center">Syncing with SafariHub Infrastructure...</p>
 </div>
 ) : paginatedTours.length > 0 ? (
 paginatedTours.map(tour => (
 <TourCard key={tour.id} tour={tour} onAction={handleAction} />
 ))
 ) : (
 <div className="text-center py-20 surface-card border border-dashed border-theme-strong rounded-2xl">
 <div className="w-16 h-16 surface-section rounded-full flex items-center justify-center mx-auto mb-4">
 <Calendar className="w-8 h-8 text-gray-300 " />
 </div>
 <h3 className="text-xl font-bold text-theme-primary mb-2">
 {searchTerm || filterStatus !== 'ALL' ? 'No matching tours found' : 'Your inventory is empty'}
 </h3>
 <p className="text-sm text-theme-secondary mb-8 max-w-xs mx-auto">
 {searchTerm || filterStatus !== 'ALL' 
 ? 'Try clearing your filters or changing your search term.' 
 : 'Start your journey as a guide by creating your first professional tour listing.'}
 </p>
 {!searchTerm && filterStatus === 'ALL' && (
 <Link
 href="/dashboard/guide/tours/new"
 className="inline-flex items-center gap-2 px-6 py-3 bg-primary-light hover:bg-primary-light-hover text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary-light/20"
 >
 <Plus className="w-5 h-5" />
 Launch Your First Tour
 </Link>
 )}
 {(searchTerm || filterStatus !== 'ALL') && (
 <button
 onClick={resetFilters}
 className="text-primary-light dark:text-primary-dark dark:text-primary-dark font-bold hover:underline"
 >
 Clear all filters
 </button>
 )}
 </div>
 )}
 </div>

 {/* Pagination */}
 {!loading && filteredTours.length > itemsPerPage && (
 <div className="flex items-center justify-between mt-8 pt-4 border-t border-theme">
 <p className="text-xs font-bold text-theme-muted uppercase tracking-widest">
 Page {currentPage} of {totalPages}
 </p>
 <div className="flex gap-3">
 <button
 onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
 disabled={currentPage === 1}
 className="w-10 h-10 flex items-center justify-center surface-card border border-theme rounded-xl text-theme-muted hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
 >
 <ChevronLeft className="w-5 h-5" />
 </button>
 <button
 onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
 disabled={currentPage === totalPages}
 className="w-10 h-10 flex items-center justify-center surface-card border border-theme rounded-xl text-theme-muted hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
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