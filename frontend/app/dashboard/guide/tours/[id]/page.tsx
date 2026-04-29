'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
 BarChart3, 
 Calendar, 
 ChevronLeft, 
 Edit, 
 Eye, 
 MapPin, 
 MoreVertical, 
 Plus, 
 Settings, 
 Star, 
 TrendingUp, 
 Users, 
 Clock, 
 CheckCircle, 
 PauseCircle, 
 AlertCircle,
 RefreshCw,
 Zap,
 DollarSign,
 Globe,
 Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getGuideTour, pauseTour, resumeTour, archiveTour, submitTourForReview, withdrawTourFromReview } from '@/src/lib/api/tours'
import { TourTemplateResponse, TourTemplateStatus } from '@/src/lib/types/tour.types'

// ============================================================================
// STATUS BADGE COMPONENT (Reuse or local)
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
 label: 'Pending Review'
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
 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
 <config.icon className="w-4 h-4" />
 {config.label}
 </span>
 )
}

// ============================================================================
// STAT MINI CARD
// ============================================================================

const StatMiniCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => {
 const colorMap: any = {
 blue: 'text-primary-light dark:text-primary-dark dark:text-primary-dark bg-primary-light/10 ',
 emerald: 'text-success-green dark:text-emerald-400 bg-success-green/10 dark:bg-emerald-950/30',
 amber: 'text-accent-light dark:text-accent-dark dark:text-amber-400 bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-950/30',
 purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30',
 }

 return (
 <div className="surface-card border border-theme p-4 rounded-2xl shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.blue}`}>
 <Icon className="w-4 h-4" />
 </div>
 <span className="text-xs font-bold text-theme-muted uppercase tracking-widest">{label}</span>
 </div>
 <div className="text-xl font-black text-theme-primary">{value}</div>
 </div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TourSummaryPage({ params }: { params: Promise<{ id: string }> }) {
 const unwrappedParams = use(params)
 const id = unwrappedParams.id
 
 const router = useRouter()
 const [tour, setTour] = useState<TourTemplateResponse | null>(null)
 const [loading, setLoading] = useState(true)
 const [isActionLoading, setIsActionLoading] = useState(false)

 const fetchTour = async () => {
 try {
 setLoading(true)
 const res = await getGuideTour(parseInt(id))
 setTour(res)
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Failed to fetch tour details')
 router.push('/dashboard/guide/tours')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchTour()
 }, [id])

 const handleAction = async (action: string) => {
 if (!tour) return
 setIsActionLoading(true)
 try {
 switch (action) {
 case 'submit':
 await submitTourForReview(tour.id)
 toast.success('Submitted for admin review')
 break
 case 'withdraw':
 await withdrawTourFromReview(tour.id)
 toast.success('Withdrawn from review')
 break
 case 'pause':
 await pauseTour(tour.id)
 toast.success('Tour paused (hidden from public)')
 break
 case 'resume':
 await resumeTour(tour.id)
 toast.success('Tour published again')
 break
 case 'archive':
 if (confirm('Are you sure? Archiving is permanent and will hide this tour from all active lists.')) {
 await archiveTour(tour.id)
 toast.success('Tour archived')
 }
 break
 }
 fetchTour() // refresh
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Action failed')
 } finally {
 setIsActionLoading(false)
 }
 }

 if (loading) {
 return (
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
 <RefreshCw className="w-8 h-8 text-primary-light dark:text-primary-dark animate-spin" />
 <p className="text-sm font-medium text-theme-muted">Syncing Tour Profile...</p>
 </div>
 )
 }

 if (!tour) return null

 const coverImage = tour.media?.find(m => m.displayOrder === 0)?.url || tour.media?.[0]?.url

 return (
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)]">
 <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10">
 
 {/* Breadcrumbs & Simple Navigation */}
 <div className="mb-6">
 <Link 
 href="/dashboard/guide/tours"
 className="inline-flex items-center gap-2 text-sm font-bold text-theme-muted hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors"
 >
 <ChevronLeft className="w-4 h-4" />
 Back to All Tours
 </Link>
 </div>

 {/* Master Header Card */}
 <div className="surface-card border border-theme rounded-3xl overflow-hidden shadow-sm mb-8">
 <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
 
 {/* Left: Image / Status Preview */}
 <div className="sm:w-64 lg:w-80 shrink-0">
 <div className="relative aspect-[4/3] rounded-2xl overflow-hidden surface-section mb-4 shadow-inner">
 {coverImage ? (
 <Image src={coverImage} alt={tour.title} fill className="object-cover" />
 ) : (
 <div className="flex flex-col items-center justify-center h-full gap-2 text-theme-muted">
 <Image className="w-10 h-10 opacity-20" src="" alt="" /> {/* Placeholder icon */}
 <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">No High-Res Media</span>
 </div>
 )}
 <div className="absolute top-3 left-3">
 <StatusBadge status={tour.status} />
 </div>
 </div>

 {/* Quick Buttons below image */}
 <div className="grid grid-cols-2 gap-2">
 <Link
 href={`/dashboard/guide/tours/${tour.id}/edit`}
 className="flex items-center justify-center gap-2 py-2.5 surface-section hover:surface-section dark:hover:surface-section text-theme-secondary font-bold text-sm rounded-xl border border-theme transition-all"
 >
 <Edit className="w-4 h-4" />
 Edit
 </Link>
 <Link
 href={`/tours/${tour.id}`}
 target="_blank"
 className={`flex items-center justify-center gap-2 py-2.5 surface-section hover:surface-section dark:hover:surface-section text-theme-secondary font-bold text-sm rounded-xl border border-theme transition-all ${tour.status !== 'PUBLISHED' && 'opacity-50 cursor-not-allowed'}`}
 >
 <Eye className="w-4 h-4" />
 Preview
 </Link>
 </div>
 </div>

 {/* Right: Info & Primary Actions */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 text-primary-light dark:text-primary-dark dark:text-primary-dark font-black text-xs uppercase tracking-widest mb-2">
 <Globe className="w-3 h-3" />
 {tour.category} Tour
 </div>
 <h1 className="text-3xl sm:text-4xl font-black text-theme-primary mb-4 tracking-tight leading-tight">
 {tour.title}
 </h1>

 <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-theme-muted mb-6 pb-6 border-b border-theme">
 <span className="flex items-center gap-1.5 capitalize">
 <MapPin className="w-4 h-4 text-theme-muted" />
 {tour.locationName}, {tour.countryCode}
 </span>
 <span className="flex items-center gap-1.5">
 <DollarSign className="w-4 h-4 text-success-green" />
 {tour.basePrice} {tour.currency} <span className="text-xs opacity-60">per person</span>
 </span>
 <span className="flex items-center gap-1.5 p-1 px-2.5 bg-primary-light/10 dark:bg-primary-light/10 text-blue-700 dark:text-primary-dark rounded-xl border border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark/50">
 <Users className="w-4 h-4" />
 {tour.minCapacity}-{tour.maxCapacity} Guests
 </span>
 <span className="flex items-center gap-1.5 p-1 px-2.5 bg-indigo-50 dark:bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
 <Clock className="w-4 h-4" />
 {tour.durationHours}h {tour.durationMinutes}m duration
 </span>
 {tour.halalFriendly && (
 <span className="flex items-center gap-1.5 text-success-green dark:text-emerald-400 font-bold">
 <CheckCircle className="w-4 h-4" />
 Halal Certified
 </span>
 )}
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
 <StatMiniCard icon={Calendar} label="Runs" value={`${tour.completedRunCount || 0} completed`} color="blue" />
 <StatMiniCard icon={Users} label="Total Guests" value={tour.totalTravelersCount?.toString() ||"0"} color="emerald" />
 <StatMiniCard icon={Star} label="Rating" value={tour.averageRating && tour.reviewCount ? tour.averageRating.toFixed(1) :"New"} color="amber" />
 <StatMiniCard icon={TrendingUp} label="Revenue" value={`${tour.currency} ${((tour.totalTravelersCount || 0) * tour.basePrice).toLocaleString()}`} color="purple" />
 </div>

 {/* Action Banners */}
 <div className="flex flex-col sm:flex-row gap-3">
 {tour.status === 'DRAFT' && (
 <button
 disabled={isActionLoading}
 onClick={() => handleAction('submit')}
 className="flex-1 py-4 bg-primary-light hover:bg-primary-light-hover text-white font-black rounded-2xl shadow-xl shadow-primary-light/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
 >
 {isActionLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
 Submit for Admin Review
 </button>
 )}

 {tour.status === 'PENDING_REVIEW' && (
 <div className="flex-1 p-4 bg-primary-light/10 rounded-2xl border border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="text-center sm:text-left">
 <div className="text-sm font-bold text-blue-700 dark:text-primary-dark mb-0.5">Under Admin Review</div>
 <div className="text-xs text-primary-light dark:text-primary-dark dark:text-primary-dark font-medium opacity-80">This typically takes 24-48 hours. You cannot edit content during review.</div>
 </div>
 <button
 disabled={isActionLoading}
 onClick={() => handleAction('withdraw')}
 className="px-4 py-2 surface-card text-primary-light dark:text-primary-dark dark:text-primary-dark font-bold text-xs rounded-xl shadow-sm border border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark hover:bg-primary-light/10 dark:hover:surface-base transition-colors shrink-0"
 >
 Withdraw
 </button>
 </div>
 )}

 {tour.status === 'REJECTED' && (
 <div className="flex-1 p-4 bg-danger-red/10 dark:bg-red-900/20 rounded-2xl border border-danger-red dark:border-danger-red">
 <div className="flex items-start gap-3 mb-4">
 <AlertCircle className="w-5 h-5 text-danger-red dark:text-red-400 shrink-0 mt-0.5" />
 <div>
 <div className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Listing Rejected</div>
 <p className="text-xs text-danger-red dark:text-danger-red font-medium leading-relaxed">
 <strong>Reason:</strong> {tour.rejectionReason || 'Please review your content for accuracy and safety compliance.'}
 </p>
 </div>
 </div>
 <Link
 href={`/dashboard/guide/tours/${tour.id}/edit`}
 className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-colors"
 >
 <Edit className="w-4 h-4" />
 Fix and Resubmit
 </Link>
 </div>
 )}

 {tour.status === 'PUBLISHED' && (
 <div className="flex-1 flex flex-col sm:flex-row gap-3">
 <Link
 href={`/dashboard/guide/tours/${tour.id}/occurrences`}
 className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-success-green/20 flex items-center justify-center gap-2"
 >
 <Calendar className="w-5 h-5" />
 Manage Dates & Schedule
 </Link>
 <button
 disabled={isActionLoading}
 onClick={() => handleAction('pause')}
 className="py-4 px-6 bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-900/20 text-accent-light dark:text-accent-dark dark:text-amber-400 font-bold rounded-2xl border border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors"
 >
 <PauseCircle className="w-5 h-5" />
 </button>
 </div>
 )}
 
 {tour.status === 'PAUSED' && (
 <div className="flex-1 flex flex-col sm:flex-row gap-3">
 <button
 disabled={isActionLoading}
 onClick={() => handleAction('resume')}
 className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-success-green/20 flex items-center justify-center gap-2"
 >
 <Zap className="w-5 h-5" />
 Resume Listing
 </button>
 <Link
 href={`/dashboard/guide/tours/${tour.id}/occurrences`}
 className="py-4 px-6 surface-section text-theme-secondary font-bold rounded-2xl border border-theme hover:surface-section dark:hover:surface-section transition-colors flex items-center justify-center"
 >
 <Calendar className="w-5 h-5" />
 </Link>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Details Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Left: Content Preview */}
 <div className="lg:col-span-2 space-y-8">
 
 {/* General Description */}
 <div className="surface-card border border-theme rounded-3xl p-6 sm:p-8 shadow-sm">
 <h2 className="text-xl font-black text-theme-primary mb-4 flex items-center gap-2 uppercase tracking-tight">
 <BarChart3 className="w-5 h-5 text-primary-light dark:text-primary-dark" />
 Description Overview
 </h2>
 <div className="prose dark:prose-invert max-w-none">
 <p className="text-theme-secondary leading-relaxed">
 {tour.description}
 </p>
 </div>
 
 <div className="mt-8 pt-6 border-t border-theme flex items-center justify-between">
 <div className="text-xs font-bold text-theme-muted uppercase tracking-widest">Pricing Structure</div>
 <div className="text-sm font-black text-theme-primary truncate max-w-[200px]">
 {tour.basePrice} {tour.currency} per person base rate
 </div>
 </div>
 </div>

 {/* Booking Options */}
 <div className="surface-card border border-theme rounded-3xl p-6 sm:p-8 shadow-sm">
 <h2 className="text-xl font-black text-theme-primary mb-6 uppercase tracking-tight">
 Booking Configuration
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 <div className="space-y-4">
 <div className="flex items-start gap-3">
 <div className={`p-2 rounded-lg ${tour.instantBook ? 'bg-success-green/10 dark:bg-emerald-950/30' : 'bg-primary-light/10 '}`}>
 <Zap className={`w-4 h-4 ${tour.instantBook ? 'text-success-green' : 'text-primary-light dark:text-primary-dark'}`} />
 </div>
 <div>
 <div className="text-sm font-bold text-theme-primary">Booking Mode</div>
 <div className="text-xs text-theme-muted ">{tour.instantBook ? 'Instant Book' : 'Request to Book'}</div>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="p-2 rounded-lg bg-success-green/10 dark:bg-emerald-950/30">
 <Clock className="w-4 h-4 text-success-green" />
 </div>
 <div>
 <div className="text-sm font-bold text-theme-primary">Duration</div>
 <div className="text-xs text-theme-muted font-medium capitalize">{tour.durationHours}h {tour.durationMinutes}m</div>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex items-start gap-3">
 <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
 <Settings className="w-4 h-4 text-purple-600" />
 </div>
 <div>
 <div className="text-sm font-bold text-theme-primary">Type</div>
 <div className="text-xs text-theme-muted font-medium capitalize">{tour.isRecurring ? `Recurring (${tour.recurrencePattern})` : 'One-time tour'}</div>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex items-start gap-3">
 <div className="p-2 rounded-lg bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-950/30">
 <Globe className="w-4 h-4 text-accent-light dark:text-accent-dark" />
 </div>
 <div>
 <div className="text-sm font-bold text-theme-primary">Category</div>
 <div className="text-xs text-theme-muted font-medium capitalize">{tour.category}</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Right: Quick Settings & Misc */}
 <div className="space-y-8">
 {/* Meeting Point Card */}
 <div className="surface-card border border-theme rounded-3xl p-6 shadow-sm">
 <h3 className="text-sm font-black text-theme-primary mb-4 uppercase tracking-widest flex items-center justify-between">
 Meeting Point
 <MapPin className="w-4 h-4 text-theme-muted" />
 </h3>
 <div className="space-y-4">
 <div className="p-3 surface-section rounded-2xl border border-theme">
 <div className="text-xs font-bold text-theme-muted uppercase mb-1">Name</div>
 <div className="text-sm font-bold text-theme-primary">{tour.meetingPointName || 'Not set'}</div>
 </div>
 <div className="p-3 surface-section rounded-2xl border border-theme">
 <div className="text-xs font-bold text-theme-muted uppercase mb-1">Address</div>
 <div className="text-sm text-theme-secondary font-medium line-clamp-2">{tour.meetingPointAddress || 'Not set'}</div>
 </div>
 </div>
 </div>

 {/* Danger Zone */}
 <div className="bg-danger-red/10/50 dark:bg-red-950/10 border border-danger-red dark:border-danger-red/30 rounded-3xl p-6">
 <h3 className="text-sm font-black text-red-700 dark:text-red-400 mb-4 uppercase tracking-widest">
 Danger Zone
 </h3>
 <div className="space-y-3">
 <button
 onClick={() => handleAction('archive')}
 className="w-full flex items-center justify-between p-3 rounded-2xl surface-card border border-danger-red dark:border-danger-red/50 hover:bg-danger-red/10 dark:hover:bg-red-900/20 text-danger-red dark:text-red-400 transition-colors shadow-sm"
 >
 <span className="text-xs font-black uppercase">Archive Tour</span>
 <Trash2 className="w-4 h-4" />
 </button>
 <p className="text-[10px] text-danger-red/60 dark:text-red-400/60 font-medium px-2">
 Archiving is non-reversible. This tour will no longer be visible to anyone.
 </p>
 </div>
 </div>
 </div>
 </div>

 </div>
 </div>
 )
}
