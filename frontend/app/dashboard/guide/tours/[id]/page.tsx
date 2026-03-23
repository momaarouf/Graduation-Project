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
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      icon: CheckCircle,
      label: 'Published'
    },
    DRAFT: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: Clock,
      label: 'Draft'
    },
    PENDING_REVIEW: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/50',
      icon: RefreshCw,
      label: 'Pending Review'
    },
    PAUSED: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
      icon: PauseCircle,
      label: 'Paused'
    },
    REJECTED: {
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800/50',
      icon: AlertCircle,
      label: 'Rejected'
    },
    ARCHIVED: {
      bg: 'bg-gray-200 dark:bg-gray-700',
      text: 'text-gray-500 dark:text-gray-400',
      border: 'border-gray-300 dark:border-gray-600',
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
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30',
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-xl font-black text-gray-900 dark:text-white">{value}</div>
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
      setTour(res.data)
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
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Syncing Tour Profile...</p>
      </div>
    )
  }

  if (!tour) return null

  const coverImage = tour.media?.find(m => m.displayOrder === 0)?.url || tour.media?.[0]?.url

  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10">
        
        {/* Breadcrumbs & Simple Navigation */}
        <div className="mb-6">
          <Link 
            href="/dashboard/guide/tours"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to All Tours
          </Link>
        </div>

        {/* Master Header Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm mb-8">
          <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
            
            {/* Left: Image / Status Preview */}
            <div className="sm:w-64 lg:w-80 shrink-0">
               <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 shadow-inner">
                  {coverImage ? (
                    <Image src={coverImage} alt={tour.title} fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
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
                   className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
                 >
                   <Edit className="w-4 h-4" />
                   Edit
                 </Link>
                 <Link
                   href={`/tours/${tour.id}`}
                   target="_blank"
                   className={`flex items-center justify-center gap-2 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl border border-gray-200 dark:border-gray-700 transition-all ${tour.status !== 'PUBLISHED' && 'opacity-50 cursor-not-allowed'}`}
                 >
                   <Eye className="w-4 h-4" />
                   Preview
                 </Link>
               </div>
            </div>

            {/* Right: Info & Primary Actions */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest mb-2">
                <Globe className="w-3 h-3" />
                {tour.category} Tour
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
                {tour.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <span className="flex items-center gap-1.5 capitalize">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {tour.locationName}, {tour.countryCode}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  {tour.basePrice} {tour.currency} <span className="text-xs opacity-60">per person</span>
                </span>
                <span className="flex items-center gap-1.5">
                   <Users className="w-4 h-4 text-blue-500" />
                   {tour.minCapacity}-{tour.maxCapacity} Guests
                </span>
                {tour.halalFriendly && (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    Halal Certified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                 <StatMiniCard icon={Calendar} label="Runs" value={`${tour.completedRunCount || 0} completed`} color="blue" />
                 <StatMiniCard icon={Users} label="Total Guests" value={tour.totalTravelersCount?.toString() || "0"} color="emerald" />
                 <StatMiniCard icon={Star} label="Rating" value={tour.averageRating && tour.reviewCount ? tour.averageRating.toFixed(1) : "New"} color="amber" />
                 <StatMiniCard icon={TrendingUp} label="Revenue" value={`${tour.currency} ${((tour.totalTravelersCount || 0) * tour.basePrice).toLocaleString()}`} color="purple" />
              </div>

              {/* Action Banners */}
              <div className="flex flex-col sm:flex-row gap-3">
                 {tour.status === 'DRAFT' && (
                   <button
                     disabled={isActionLoading}
                     onClick={() => handleAction('submit')}
                     className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                   >
                     {isActionLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                     Submit for Admin Review
                   </button>
                 )}

                 {tour.status === 'PENDING_REVIEW' && (
                   <div className="flex-1 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <div className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-0.5">Under Admin Review</div>
                        <div className="text-xs text-blue-600 dark:text-blue-500 font-medium opacity-80">This typically takes 24-48 hours. You cannot edit content during review.</div>
                      </div>
                      <button
                        disabled={isActionLoading}
                        onClick={() => handleAction('withdraw')}
                        className="px-4 py-2 bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl shadow-sm border border-blue-100 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors shrink-0"
                      >
                        Withdraw
                      </button>
                   </div>
                 )}

                 {tour.status === 'REJECTED' && (
                   <div className="flex-1 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Listing Rejected</div>
                          <p className="text-xs text-red-600 dark:text-red-500 font-medium leading-relaxed">
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
                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-5 h-5" />
                        Manage Dates & Schedule
                      </Link>
                      <button
                        disabled={isActionLoading}
                        onClick={() => handleAction('pause')}
                        className="py-4 px-6 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold rounded-2xl border border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors"
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
                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <Zap className="w-5 h-5" />
                        Resume Listing
                      </button>
                      <Link
                        href={`/dashboard/guide/tours/${tour.id}/occurrences`}
                        className="py-4 px-6 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
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
             <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-tight">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Description Overview
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {tour.description}
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                   <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing Structure</div>
                   <div className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[200px]">
                     {tour.basePrice} {tour.currency} per person base rate
                   </div>
                </div>
             </div>

             {/* Booking Options */}
             <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
                  Booking Configuration
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-4">
                     <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${tour.instantBook ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-blue-50 dark:bg-blue-950/30'}`}>
                          <Zap className={`w-4 h-4 ${tour.instantBook ? 'text-emerald-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-gray-900 dark:text-white">Booking Mode</div>
                           <div className="text-xs text-gray-500 dark:text-gray-400">{tour.instantBook ? 'Instant Book' : 'Request to Book'}</div>
                        </div>
                     </div>
                     <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                          <Clock className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-gray-900 dark:text-white">Type</div>
                           <div className="text-xs text-gray-500 dark:text-gray-400 font-medium capitalize">{tour.isRecurring ? `Recurring (${tour.recurrencePattern})` : 'One-time tour'}</div>
                        </div>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                          <Globe className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-gray-900 dark:text-white">Category</div>
                           <div className="text-xs text-gray-500 dark:text-gray-400 font-medium capitalize">{tour.category}</div>
                        </div>
                     </div>
                     <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
                          <Settings className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-gray-900 dark:text-white">Portfolio Visibility</div>
                           <div className="text-xs text-gray-500 dark:text-gray-400">{tour.showInPortfolio ? 'Visible in guide public portfolio' : 'Hidden from portfolio'}</div>
                        </div>
                     </div>
                   </div>
                </div>
             </div>
           </div>

           {/* Right: Quick Settings & Misc */}
           <div className="space-y-8">
              {/* Meeting Point Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                 <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-widest flex items-center justify-between">
                    Meeting Point
                    <MapPin className="w-4 h-4 text-gray-400" />
                 </h3>
                 <div className="space-y-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
                       <div className="text-xs font-bold text-gray-400 uppercase mb-1">Name</div>
                       <div className="text-sm font-bold text-gray-900 dark:text-white">{tour.meetingPointName || 'Not set'}</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
                       <div className="text-xs font-bold text-gray-400 uppercase mb-1">Address</div>
                       <div className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-2">{tour.meetingPointAddress || 'Not set'}</div>
                    </div>
                 </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-6">
                 <h3 className="text-sm font-black text-red-700 dark:text-red-400 mb-4 uppercase tracking-widest">
                    Danger Zone
                 </h3>
                 <div className="space-y-3">
                    <button
                      onClick={() => handleAction('archive')}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors shadow-sm"
                    >
                       <span className="text-xs font-black uppercase">Archive Tour</span>
                       <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-red-600/60 dark:text-red-400/60 font-medium px-2">
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
