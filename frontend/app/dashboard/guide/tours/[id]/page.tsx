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
 Trash2,
 Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getGuideTour, pauseTour, resumeTour, archiveTour, submitTourForReview, withdrawTourFromReview } from '@/src/lib/api/tours'
import { TourTemplateResponse, TourTemplateStatus } from '@/src/lib/types/tour.types'
import GuideTourSummarySkeleton from './skeleton'

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge = ({ status }: { status: TourTemplateStatus }) => {
 const styles: Record<TourTemplateStatus, { bg: string, text: string, border: string, icon: any, label: string }> = {
 PUBLISHED: {
 bg: 'bg-success-green/10',
 text: 'text-emerald-700 dark:text-emerald-400',
 border: 'border-success-green/20',
 icon: CheckCircle,
 label: 'Published'
 },
 DRAFT: {
 bg: 'surface-section',
 text: 'text-theme-secondary',
 border: 'border-theme',
 icon: Clock,
 label: 'Draft'
 },
 PENDING_REVIEW: {
 bg: 'bg-primary-light/10',
 text: 'text-blue-700 dark:text-primary-dark',
 border: 'border-primary-light/20',
 icon: RefreshCw,
 label: 'Pending Review'
 },
 PAUSED: {
 bg: 'bg-accent-light/10',
 text: 'text-accent-light dark:text-amber-400',
 border: 'border-accent-light/20',
 icon: PauseCircle,
 label: 'Paused'
 },
 REJECTED: {
 bg: 'bg-danger-red/10',
 text: 'text-red-700 dark:text-red-400',
 border: 'border-danger-red/20',
 icon: AlertCircle,
 label: 'Rejected'
 },
 ARCHIVED: {
 bg: 'surface-section',
 text: 'text-theme-muted',
 border: 'border-theme-strong',
 icon: Trash2,
 label: 'Archived'
 }
 }

 const config = styles[status] || styles.DRAFT

 return (
 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black capitalize tracking-normal rounded-full border ${config.bg} ${config.text} ${config.border} shadow-sm backdrop-blur-md`}>
 <config.icon className="w-3.5 h-3.5" />
 {config.label}
 </span>
 )
}

// ============================================================================
// STAT MINI CARD
// ============================================================================

const StatMiniCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => {
 const colorMap: any = {
 blue: 'text-primary-light dark:text-primary-dark bg-primary-light/10 border-primary-light/20',
 emerald: 'text-success-green dark:text-emerald-400 bg-success-green/10 border-success-green/20',
 amber: 'text-accent-light dark:text-amber-400 bg-accent-light/10 border-accent-light/20',
 purple: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
 }

 return (
 <div className="surface-card border border-theme p-6 sm:p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-primary-light/20 transition-all group flex flex-col justify-between h-full">
 <div className="flex items-center justify-between mb-4">
 <div className={`p-3 rounded-2xl border ${colorMap[color] || colorMap.blue} transition-transform group-hover:scale-110`}>
 <Icon className="w-5 h-5" />
 </div>
 <div className="text-[10px] font-black capitalize tracking-[0.2em] text-theme-muted opacity-60">{label}</div>
 </div>
 <div>
 <div className="text-3xl font-black text-theme-primary tracking-tight italic">{value}</div>
 </div>
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
    return <GuideTourSummarySkeleton />
 }

 if (!tour) return null

 const coverImage = tour.media?.find(m => m.displayOrder === 0)?.url || tour.media?.[0]?.url

 return (
 <div className="pt-14 sm:pt-16 min-h-screen surface-base">
 <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10 space-y-10">
  
  {/* Breadcrumbs & Simple Navigation */}
  <div>
  <Link 
  href="/dashboard/guide/tours"
  className="inline-flex items-center gap-2 text-xs font-black capitalize tracking-normal text-theme-muted hover:text-primary-light transition-all"
  >
  <ChevronLeft className="w-4 h-4" />
  Inventory Catalog
  </Link>
  </div>

  {/* Master Header Card */}
  <div className="surface-card border border-theme rounded-[2.5rem] overflow-hidden shadow-sm">
  <div className="p-6 sm:p-10 flex flex-col lg:flex-row gap-10">
  
  {/* Left: Image / Status Preview */}
  <div className="sm:w-64 lg:w-80 shrink-0">
  <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden surface-section mb-6 shadow-inner border border-theme">
  {coverImage ? (
  <Image src={coverImage} alt={tour.title} fill className="object-cover" />
  ) : (
  <div className="flex flex-col items-center justify-center h-full gap-2 text-theme-muted opacity-30">
  <MapPin className="w-10 h-10" />
  <span className="text-[10px] font-black capitalize tracking-normal">No Media</span>
  </div>
  )}
  <div className="absolute top-4 left-4">
  <StatusBadge status={tour.status} />
  </div>
  </div>

  {/* Quick Buttons below image */}
  <div className="grid grid-cols-2 gap-3">
  <Link
  href={`/dashboard/guide/tours/${tour.id}/edit`}
  className="flex items-center justify-center gap-2 py-3 surface-section hover:surface-base text-theme-primary font-black text-[10px] capitalize tracking-normal rounded-2xl border border-theme transition-all active:scale-95"
  >
  <Edit className="w-4 h-4" />
  Edit
  </Link>
  <Link
  href={`/tours/${tour.id}`}
  target="_blank"
  className={`flex items-center justify-center gap-2 py-3 surface-section hover:surface-base text-theme-primary font-black text-[10px] capitalize tracking-normal rounded-2xl border border-theme transition-all active:scale-95 ${tour.status !== 'PUBLISHED' && 'opacity-30 cursor-not-allowed pointer-events-none'}`}
  >
  <Eye className="w-4 h-4" />
  Preview
  </Link>
  </div>
  </div>

  {/* Right: Info & Primary Actions */}
  <div className="flex-1 min-w-0 flex flex-col justify-between">
  <div>
  <div className="flex items-center gap-2 text-primary-light dark:text-primary-dark font-black text-[10px] capitalize tracking-[0.3em] mb-4">
  <Sparkles className="w-4 h-4" />
  {tour.category} EXPEDITION
  </div>
  <h1 className="text-4xl sm:text-5xl font-black text-theme-primary mb-6 tracking-tighter leading-none italic">
  {tour.title}
  </h1>

  <div className="flex flex-wrap items-center gap-6 text-[10px] font-black capitalize tracking-normal text-theme-muted mb-8">
  <span className="flex items-center gap-2">
  <MapPin className="w-4 h-4 text-primary-light" />
  {tour.locationName}, {tour.countryCode}
  </span>
  <span className="flex items-center gap-2">
  <Clock className="w-4 h-4 text-primary-light" />
  {tour.durationHours}h {tour.durationMinutes}m
  </span>
  <span className="flex items-center gap-2">
  <Users className="w-4 h-4 text-success-green" />
  {tour.minCapacity}-{tour.maxCapacity} Guests
  </span>
  </div>
  </div>

  {/* Action Banners */}
  <div className="flex flex-col sm:flex-row gap-4">
  {tour.status === 'DRAFT' && (
  <button
  disabled={isActionLoading}
  onClick={() => handleAction('submit')}
  className="flex-1 py-4 bg-primary-light hover:bg-primary-light-hover text-white font-black capitalize tracking-[0.2em] text-[11px] rounded-2xl shadow-2xl shadow-primary-light/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
  >
  {isActionLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
  Request Publication
  </button>
  )}

  {tour.status === 'PENDING_REVIEW' && (
  <div className="flex-1 p-5 bg-primary-light/5 rounded-2xl border border-primary-light/20 flex flex-col sm:flex-row items-center justify-between gap-4">
  <div>
  <div className="text-[10px] font-black capitalize tracking-[0.2em] text-blue-700 dark:text-primary-dark mb-1">Under Review</div>
  <div className="text-[9px] font-black capitalize tracking-normal text-theme-muted opacity-60">Listing being vetted by safety team.</div>
  </div>
  <button
  disabled={isActionLoading}
  onClick={() => handleAction('withdraw')}
  className="px-6 py-2.5 surface-card text-theme-primary font-black text-[10px] capitalize tracking-normal rounded-xl border border-theme hover:surface-base transition-all"
  >
  Withdraw
  </button>
  </div>
  )}

  {tour.status === 'REJECTED' && (
  <div className="flex-1 p-5 bg-danger-red/5 rounded-2xl border border-danger-red/20">
  <div className="flex items-start gap-4 mb-4">
  <AlertCircle className="w-5 h-5 text-danger-red shrink-0" />
  <div>
  <div className="text-[10px] font-black capitalize tracking-[0.2em] text-red-700 mb-1">Publication Failed</div>
  <p className="text-[9px] font-black capitalize tracking-normal text-danger-red/70 leading-relaxed">
  {tour.rejectionReason || 'Vetting failed. Check policy compliance.'}
  </p>
  </div>
  </div>
  <Link
  href={`/dashboard/guide/tours/${tour.id}/edit`}
  className="inline-flex items-center gap-2 px-6 py-2.5 bg-danger-red text-white font-black text-[10px] capitalize tracking-normal rounded-xl hover:bg-red-700 transition-all"
  >
  <Edit className="w-3.5 h-3.5" />
  Resolve Issues
  </Link>
  </div>
  )}

  {tour.status === 'PUBLISHED' && (
  <div className="flex-1 flex flex-col sm:flex-row gap-4">
  <Link
  href={`/dashboard/guide/tours/${tour.id}/occurrences`}
  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black capitalize tracking-[0.2em] text-[11px] rounded-2xl transition-all shadow-2xl shadow-success-green/20 flex items-center justify-center gap-3"
  >
  <Calendar className="w-5 h-5" />
  Manage Schedule
  </Link>
  <button
  disabled={isActionLoading}
  onClick={() => handleAction('pause')}
  className="py-4 px-8 bg-accent-light/10 text-accent-light font-black capitalize tracking-normal rounded-2xl border border-accent-light/20 hover:bg-accent-light/20 transition-all"
  >
  <PauseCircle className="w-5 h-5" />
  </button>
  </div>
  )}
  
  {tour.status === 'PAUSED' && (
  <div className="flex-1 flex flex-col sm:flex-row gap-4">
  <button
  disabled={isActionLoading}
  onClick={() => handleAction('resume')}
  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black capitalize tracking-[0.2em] text-[11px] rounded-2xl transition-all shadow-2xl shadow-success-green/20 flex items-center justify-center gap-3"
  >
  <Zap className="w-5 h-5" />
  Resume
  </button>
  <Link
  href={`/dashboard/guide/tours/${tour.id}/occurrences`}
  className="py-4 px-8 surface-section text-theme-primary font-black capitalize tracking-normal rounded-2xl border border-theme hover:surface-base transition-all flex items-center justify-center"
  >
  <Calendar className="w-5 h-5" />
  </Link>
  </div>
  )}
  </div>
  </div>
  </div>
  </div>

  {/* Wide Stats Strip */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatMiniCard 
    icon={CheckCircle} 
    label="Runs" 
    value={`${tour.completedRunCount || 0} completed`} 
    color="blue" 
  />
  <StatMiniCard 
    icon={Users} 
    label="Total Guests" 
    value={tour.totalTravelersCount?.toString() ||"0"} 
    color="emerald" 
  />
  <StatMiniCard 
    icon={Star} 
    label="Rating" 
    value={tour.averageRating && tour.reviewCount ? tour.averageRating.toFixed(1) :"New"} 
    color="amber" 
  />
  <StatMiniCard 
    icon={DollarSign} 
    label="Revenue" 
    value={`${tour.currency} ${((tour.totalTravelersCount || 0) * tour.basePrice).toLocaleString()}`} 
    color="purple" 
  />
  </div>

  {/* Details Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
  
  {/* Left: Content Preview */}
  <div className="lg:col-span-2 space-y-10">
  
  {/* General Description */}
  <div className="surface-card border border-theme rounded-[2.5rem] p-8 sm:p-12 shadow-sm">
  <h2 className="text-2xl font-black text-theme-primary mb-8 flex items-center gap-3 capitalize italic tracking-tight">
  <BarChart3 className="w-7 h-7 text-primary-light" />
  Description Hub
  </h2>
  <div className="prose dark:prose-invert max-w-none">
  <p className="text-theme-secondary text-lg leading-relaxed italic opacity-80">
  {tour.description}
  </p>
  </div>
  
  <div className="mt-10 pt-8 border-t border-theme flex items-center justify-between">
  <div className="text-[10px] font-black text-theme-muted capitalize tracking-[0.2em]">Base Rate Economy</div>
  <div className="text-xl font-black text-theme-primary italic">
  {tour.basePrice} {tour.currency} <span className="text-[10px] font-black capitalize not-italic opacity-40 ml-1">/ Seat</span>
  </div>
  </div>
  </div>

  {/* Booking Options */}
  <div className="surface-card border border-theme rounded-[2.5rem] p-8 sm:p-12 shadow-sm">
  <h2 className="text-2xl font-black text-theme-primary mb-10 capitalize italic tracking-tight">
  Logistics & Logic
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
  <div className="space-y-8">
  <div className="flex items-start gap-4">
  <div className={`p-3 rounded-2xl border ${tour.instantBook ? 'bg-success-green/10 border-success-green/20 text-success-green' : 'bg-primary-light/10 border-primary-light/20 text-primary-light'}`}>
  <Zap className="w-5 h-5" />
  </div>
  <div>
  <div className="text-[10px] font-black capitalize tracking-normal text-theme-muted mb-1">Booking Mode</div>
  <div className="text-sm font-black text-theme-primary">{tour.instantBook ? 'INSTANT ACTIVATION' : 'REQUEST BASED'}</div>
  </div>
  </div>
  <div className="flex items-start gap-4">
  <div className="p-3 rounded-2xl border bg-success-green/10 border-success-green/20 text-success-green">
  <Clock className="w-5 h-5" />
  </div>
  <div>
  <div className="text-[10px] font-black capitalize tracking-normal text-theme-muted mb-1">Duration</div>
  <div className="text-sm font-black text-theme-primary">{tour.durationHours}H {tour.durationMinutes}M</div>
  </div>
  </div>
  </div>

  <div className="space-y-8">
  <div className="flex items-start gap-4">
  <div className="p-3 rounded-2xl border bg-purple-500/10 border-purple-500/20 text-purple-600">
  <Settings className="w-5 h-5" />
  </div>
  <div>
  <div className="text-[10px] font-black capitalize tracking-normal text-theme-muted mb-1">Schedule Type</div>
  <div className="text-sm font-black text-theme-primary capitalize">{tour.isRecurring ? `${tour.recurrencePattern} RECURRENCE` : 'ONE-TIME EXPEDITION'}</div>
  </div>
  </div>
  <div className="flex items-start gap-4">
  <div className="p-3 rounded-2xl border bg-accent-light/10 border-accent-light/20 text-accent-light">
  <Globe className="w-5 h-5" />
  </div>
  <div>
  <div className="text-[10px] font-black capitalize tracking-normal text-theme-muted mb-1">Category</div>
  <div className="text-sm font-black text-theme-primary capitalize">{tour.category}</div>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>

  {/* Right: Quick Settings & Misc */}
  <div className="space-y-10">
  {/* Meeting Point Card */}
  <div className="surface-card border border-theme rounded-[2.5rem] p-8 shadow-sm">
  <h3 className="text-[11px] font-black text-theme-primary mb-6 capitalize tracking-[0.2em] flex items-center justify-between italic">
  Meeting Hub
  <MapPin className="w-5 h-5 text-primary-light" />
  </h3>
  <div className="space-y-6">
  <div className="p-5 surface-section rounded-2xl border border-theme">
  <div className="text-[9px] font-black text-theme-muted capitalize tracking-normal mb-1 opacity-60">Location Name</div>
  <div className="text-sm font-black text-theme-primary">{tour.meetingPointName || 'NOT SPECIFIED'}</div>
  </div>
  <div className="p-5 surface-section rounded-2xl border border-theme">
  <div className="text-[9px] font-black text-theme-muted capitalize tracking-normal mb-1 opacity-60">Digital Address</div>
  <div className="text-sm text-theme-secondary font-black leading-relaxed line-clamp-3">{tour.meetingPointAddress || 'NOT SPECIFIED'}</div>
  </div>
  </div>
  </div>

  {/* Danger Zone */}
  <div className="bg-danger-red/5 border border-danger-red/20 rounded-[2.5rem] p-8">
  <h3 className="text-[11px] font-black text-red-700 dark:text-red-400 mb-6 capitalize tracking-[0.2em] italic">
  Terminal Actions
  </h3>
  <div className="space-y-4">
  <button
  onClick={() => handleAction('archive')}
  className="w-full flex items-center justify-between p-4 rounded-2xl surface-card border border-danger-red/20 hover:bg-danger-red/10 text-danger-red transition-all active:scale-95 shadow-sm"
  >
  <span className="text-[10px] font-black capitalize tracking-normal">Archive Template</span>
  <Trash2 className="w-4 h-4" />
  </button>
  <p className="text-[9px] text-danger-red/50 font-black capitalize tracking-[0.1em] px-2 leading-relaxed">
  Permanently hide this expedition from all catalogs. Non-reversible action.
  </p>
  </div>
  </div>
  </div>
  </div>

 </div>
 </div>
 )
}
