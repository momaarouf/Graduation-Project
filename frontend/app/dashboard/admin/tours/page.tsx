'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
 ChevronLeft,
 ChevronRight,
 RefreshCw,
 Award,
 Power,
 X,
 Shield,
 ShieldCheck,
 ShieldAlert,
 Fingerprint,
 Languages,
 Activity,
 AlertTriangle,
 FileWarning,
 MessageSquare,
 Repeat,
 FileText,
 Play,
 Info,
 History,
 Star,
 Sparkles,
 Filter
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useBadgeReset } from '@/src/lib/hooks/useBadgeReset'
import { 
 getAdminPendingTours, 
 adminApproveTour, 
 adminRejectTour 
} from '@/src/lib/api/tours'
import { 
 TourTemplateResponse, 
 TourTemplateStatus 
} from '@/src/lib/types/tour.types'
import { isVideoUrl } from '@/src/lib/utils/tour-utils'
import AdminToursSkeleton from './skeleton'

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge = ({ status }: { status: TourTemplateStatus }) => {
 const styles: Record<string, string> = {
  PENDING_REVIEW: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  PUBLISHED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  DRAFT: 'surface-card text-theme-secondary border-theme',
  PAUSED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  ARCHIVED: 'surface-section text-theme-muted border-theme'
 }

 return (
  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black capitalize tracking-normal rounded-full border ${styles[status] || styles.DRAFT}`}>
   <AlertCircle className="w-2.5 h-2.5" />
   {status.replace('_', ' ')}
  </span>
 )
}

// ============================================================================
// HELPERS
// ============================================================================

const safeJsonParse = (data: any, fallback: any = []) => {
 if (!data) return fallback
 if (typeof data !== 'string') return data
 try {
  const parsed = JSON.parse(data)
  return Array.isArray(parsed) ? parsed : [parsed]
 } catch (e) {
  if (data.includes(',')) return data.split(',').map(s => s.trim())
  return [data]
 }
}

// ============================================================================
// TOUR REVIEW MODAL
// ============================================================================

interface ReviewModalProps {
 tour: TourTemplateResponse
 onClose: () => void
 onAction: () => void
}

const ReviewModal = ({ tour, onClose, onAction }: ReviewModalProps) => {
 const [rejectReason, setRejectReason] = useState('')
 const [showRejectForm, setShowRejectForm] = useState(false)
 const [loading, setLoading] = useState(false)
 const [activeMediaIndex, setActiveMediaIndex] = useState(0)

 const languages = safeJsonParse(tour.languages, [])
 const itinerary = safeJsonParse(tour.itinerary, [])
 const inclusions = safeJsonParse(tour.inclusions, [])
 const exclusions = safeJsonParse(tour.exclusions, [])
 const requirements = safeJsonParse(tour.requirements, [])
 const whatToBring = safeJsonParse(tour.whatToBring, [])

 const uniqueMedia = useMemo(() => {
  if (!tour.media) return []
  const seen = new Set()
  return tour.media.filter(m => {
   const isDuplicate = seen.has(m.url)
   seen.add(m.url)
   return !isDuplicate
  })
 }, [tour.media])

 const nextMedia = () => setActiveMediaIndex(prev => (prev + 1) % uniqueMedia.length)
 const prevMedia = () => setActiveMediaIndex(prev => (prev - 1 + uniqueMedia.length) % uniqueMedia.length)

 useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
   if (e.key === 'ArrowRight') nextMedia()
   if (e.key === 'ArrowLeft') prevMedia()
   if (e.key === 'Escape') onClose()
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
 }, [uniqueMedia.length])

 const currentMedia = uniqueMedia.length > 0 ? uniqueMedia[activeMediaIndex] : null

 const handleApprove = async () => {
  if (!confirm(`Are you sure you want to PUBLISH "${tour.title}"?`)) return
  setLoading(true)
  try {
   await adminApproveTour(tour.id)
   toast.success('Tour approved and published!')
   window.dispatchEvent(new CustomEvent('badge-refresh'))
   onAction()
   onClose()
  } catch (err: any) {
   toast.error(err.response?.data?.message || 'Approval failed')
  } finally {
   setLoading(false)
  }
 }

 const handleReject = async () => {
  if (!rejectReason.trim()) {
   toast.error('Please provide a rejection reason')
   return
  }
  setLoading(true)
  try {
   await adminRejectTour(tour.id, rejectReason)
   toast.success('Tour rejected')
   window.dispatchEvent(new CustomEvent('badge-refresh'))
   onAction()
   onClose()
  } catch (err: any) {
   toast.error(err.response?.data?.message || 'Rejection failed')
  } finally {
   setLoading(false)
  }
 }

 return (
  <motion.div 
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
  >
   <motion.div 
    initial={{ scale: 0.95, y: 20 }}
    animate={{ scale: 1, y: 0 }}
    className="w-full h-full sm:h-auto max-w-6xl surface-card rounded-none sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-0 sm:border border-theme flex flex-col sm:max-h-[92vh] animate-in fade-in zoom-in duration-300"
   >
    
    {/* Header */}
    <div className="px-6 py-4 border-b border-theme flex items-center justify-between surface-card sticky top-0 z-20 shadow-sm">
     <div className="flex items-center gap-4">
      <div className="hidden md:flex w-12 h-12 bg-primary-light rounded-2xl items-center justify-center shadow-lg shadow-primary-light/20 text-white shrink-0">
       <ShieldCheck className="w-6 h-6" />
      </div>
      <div>
       <div className="flex items-center gap-2">
        <h3 className="text-xl font-black text-theme-primary tracking-tight">Review Desk</h3>
        <StatusBadge status="PENDING_REVIEW" />
       </div>
       <div className="flex items-center gap-3 mt-0.5">
        <span className="text-[9px] font-black text-theme-muted capitalize tracking-[0.15em] flex items-center gap-1"><Fingerprint className="w-2.5 h-2.5" /> ID-{tour.id}</span>
        <span className="text-[9px] font-black text-theme-muted capitalize tracking-[0.15em] flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {new Date(tour.createdAtUtc).toLocaleDateString()}</span>
       </div>
      </div>
     </div>
     
     <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 surface-section rounded-xl border border-theme">
       <div className="w-6 h-6 rounded-lg bg-primary-light/20 flex items-center justify-center text-primary-light font-black text-[10px]">G</div>
       <span className="text-[10px] font-black text-theme-secondary capitalize tracking-normal">Verified Guide</span>
      </div>
      <button onClick={onClose} className="p-2.5 surface-section hover:bg-danger-red/10 hover:text-danger-red rounded-2xl transition-all active:scale-90">
       <X className="w-6 h-6" />
      </button>
     </div>
    </div>

    {/* Workspace Body */}
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-base">
     <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
      
      {/* Content Column */}
      <div className="lg:col-span-7 p-6 sm:p-10 space-y-10 border-b lg:border-b-0 lg:border-r border-theme">
       
       {/* Hero Section */}
       <div className="space-y-6">
        <div className="flex items-center gap-2">
         <span className="px-2 py-1 bg-primary-light/10 text-primary-light text-[10px] font-black capitalize tracking-normal rounded-lg border border-primary-light/20">
          {tour.category || 'Curated Tour'}
         </span>
         <span className="px-2 py-1 surface-card text-theme-muted text-[10px] font-black capitalize tracking-normal rounded-lg border border-theme">
          {tour.countryCode}
         </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-theme-primary tracking-tight leading-[1.1]">
         {tour.title}
        </h1>
        <p className="text-lg text-theme-secondary border-l-4 border-primary-light pl-6 italic font-medium leading-relaxed">
         {tour.shortDescription || 'No executive summary provided for this template.'}
        </p>
       </div>

       {/* Media Workspace */}
       <div className="space-y-4">
        <div className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-theme shadow-2xl surface-section group/media">
         <AnimatePresence mode="wait">
          <motion.div 
           key={activeMediaIndex}
           initial={{ opacity: 0, scale: 1.05 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0 }}
           className="w-full h-full"
          >
           {currentMedia && isVideoUrl(currentMedia.url) ? (
            <video src={currentMedia.url} controls className="w-full h-full object-cover" />
           ) : currentMedia ? (
            <Image src={currentMedia.url} alt="Review Preview" fill className="object-cover" unoptimized={currentMedia.url.startsWith('data:')} />
           ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-theme-muted gap-4">
             <FileWarning className="w-16 h-16 opacity-10" />
             <p className="text-xs font-black capitalize tracking-normal opacity-30">No Media Assets</p>
            </div>
           )}
          </motion.div>
         </AnimatePresence>

         {uniqueMedia.length > 1 && (
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover/media:opacity-100 transition-opacity">
           <button onClick={prevMedia} className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-auto hover:bg-white/40 transition-all shadow-xl"><ChevronLeft className="w-8 h-8" /></button>
           <button onClick={nextMedia} className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-auto hover:bg-white/40 transition-all shadow-xl"><ChevronRight className="w-8 h-8" /></button>
          </div>
         )}

         <div className="absolute bottom-6 right-6 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/20 capitalize tracking-[0.2em]">
          {activeMediaIndex + 1} / {uniqueMedia.length}
         </div>
        </div>

        {uniqueMedia.length > 1 && (
         <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
          {uniqueMedia.map((m, i) => (
           <button 
            key={i}
            onClick={() => setActiveMediaIndex(i)}
            className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${activeMediaIndex === i ? 'border-primary-light scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
           >
            <Image src={m.url} alt="Thumb" fill className="object-cover" unoptimized={m.url.startsWith('data:')} />
           </button>
          ))}
         </div>
        )}
       </div>

       {/* Full Description */}
       <div className="surface-card p-8 rounded-[2.5rem] border border-theme shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary-light opacity-20" />
        <h4 className="text-[10px] font-black text-theme-muted capitalize tracking-[0.2em] mb-6 flex items-center gap-2">
         <FileText className="w-4 h-4 text-primary-light" /> Full Catalog Description
        </h4>
        <div className="prose prose-lg dark:prose-invert max-w-none text-theme-secondary leading-relaxed whitespace-pre-line font-medium text-sm">
         {tour.description}
        </div>
       </div>

       {/* Itinerary */}
       <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-theme pb-4">
         <h4 className="text-[10px] font-black text-theme-muted capitalize tracking-[0.2em]">Chronological Itinerary</h4>
         <span className="text-[10px] font-black text-primary-light capitalize tracking-normal">{itinerary.length} Phases</span>
        </div>
        <div className="space-y-6">
         {itinerary.length > 0 ? itinerary.map((step: any, idx: number) => (
          <div key={idx} className="relative pl-14 pb-8 last:pb-0 group/step">
           <div className="absolute left-[23px] top-10 bottom-0 w-1 bg-gradient-to-b from-primary-light/40 to-transparent group-last:hidden" />
           <div className="absolute left-0 top-1 w-12 h-12 surface-card border-4 border-primary-light rounded-2xl flex items-center justify-center font-black text-primary-light text-sm shadow-xl z-10 transition-transform group-hover/step:scale-110">
            {idx + 1}
           </div>
           <div className="surface-card p-6 rounded-3xl border border-theme shadow-sm group-hover/step:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
             <h5 className="text-lg font-black text-theme-primary tracking-tight">{step.title}</h5>
             <span className="text-[9px] font-black text-primary-light bg-primary-light/10 px-3 py-1 rounded-full capitalize tracking-normal border border-primary-light/20 self-start sm:self-auto">
              {step.duration || 'Variable Duration'}
             </span>
            </div>
            <p className="text-sm text-theme-secondary leading-relaxed">{step.description}</p>
           </div>
          </div>
         )) : (
          <div className="py-20 surface-card border-2 border-dashed border-theme rounded-[2.5rem] flex flex-col items-center justify-center text-center">
           <History className="w-12 h-12 text-theme-muted opacity-20 mb-4" />
           <p className="text-xs font-black text-theme-muted capitalize tracking-normal">Itinerary Draft Not Provided</p>
          </div>
         )}
        </div>
       </div>
      </div>

      {/* Sidebar Column */}
      <div className="lg:col-span-5 p-6 sm:p-10 space-y-8 surface-section overflow-y-auto h-full scrollbar-hide">
       
       {/* High Level Stats */}
       <div className="grid grid-cols-2 gap-4">
        <div className="p-6 surface-card rounded-3xl border border-theme shadow-sm border-b-4 border-b-primary-light">
         <span className="block text-[10px] font-black text-theme-muted capitalize tracking-[0.15em] mb-2">Base Price</span>
         <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-theme-primary">${tour.basePrice}</span>
          <span className="text-xs font-black text-theme-muted capitalize">{tour.currency}</span>
         </div>
        </div>
        <div className="p-6 surface-card rounded-3xl border border-theme shadow-sm border-b-4 border-b-primary-light">
         <span className="block text-[10px] font-black text-theme-muted capitalize tracking-[0.15em] mb-2">Duration</span>
         <div className="flex items-baseline gap-1 text-theme-primary">
          <span className="text-3xl font-black">{tour.durationHours}</span>
          <span className="text-sm font-black opacity-40">H</span>
          <span className="text-3xl font-black ml-1">{tour.durationMinutes}</span>
          <span className="text-sm font-black opacity-40">M</span>
         </div>
        </div>
       </div>

       {/* Logistics Block */}
       <div className="surface-card p-8 rounded-[2.5rem] border border-theme shadow-sm space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-theme">
         <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-success-green/10 flex items-center justify-center text-success-green">
           <Users className="w-5 h-5" />
          </div>
          <div>
           <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal">Pax Capacity</p>
           <p className="text-lg font-black text-theme-primary">{tour.minCapacity} — {tour.maxCapacity}</p>
          </div>
         </div>
         <div className="text-right">
          <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal">Languages</p>
          <div className="flex flex-wrap justify-end gap-1 mt-1">
           {languages.slice(0, 2).map((l: any, i: number) => (
            <span key={i} className="text-[10px] font-black text-theme-secondary">{typeof l === 'object' ? l.language : l}{i < languages.slice(0,2).length-1 ? ',' : ''}</span>
           ))}
           {languages.length > 2 && <span className="text-[10px] font-black text-primary-light">+{languages.length - 2}</span>}
          </div>
         </div>
        </div>

        <div className="space-y-6">
         <h4 className="text-[10px] font-black text-theme-muted capitalize tracking-[0.2em] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-light" /> Meeting Point
         </h4>
         <div className="p-5 surface-section rounded-2xl border border-theme relative group">
          <h5 className="text-base font-black text-theme-primary leading-tight mb-2">{tour.meetingPointName || 'Central Assembly'}</h5>
          <p className="text-sm text-theme-secondary leading-relaxed">{tour.meetingPointAddress || 'Coordinates provided upon confirmation'}</p>
          {tour.meetingLatitude && (
           <a 
            href={`https://maps.google.com/?q=${tour.meetingLatitude},${tour.meetingLongitude}`} 
            target="_blank" 
            className="mt-4 inline-flex items-center gap-2 text-[10px] font-black text-primary-light hover:text-primary-light-hover capitalize tracking-normal transition-colors"
           >
            Verify Geolocation <Eye className="w-4 h-4" />
           </a>
          )}
         </div>
        </div>
       </div>

       {/* Inclusions / Exclusions */}
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-3xl space-y-4">
         <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-[10px] font-black capitalize tracking-normal">Inclusions</span>
         </div>
         <ul className="space-y-2">
          {inclusions.slice(0, 4).map((item: string, idx: number) => (
           <li key={idx} className="text-xs font-medium text-emerald-800 dark:text-emerald-400 flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
            {item}
           </li>
          ))}
         </ul>
        </div>
        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl space-y-4">
         <div className="flex items-center gap-2 text-red-600">
          <XCircle className="w-4 h-4" />
          <span className="text-[10px] font-black capitalize tracking-normal">Exclusions</span>
         </div>
         <ul className="space-y-2">
          {exclusions.slice(0, 4).map((item: string, idx: number) => (
           <li key={idx} className="text-xs font-medium text-red-800 dark:text-red-400 flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
            {item}
           </li>
          ))}
         </ul>
        </div>
       </div>

       {/* Preparation Requirements */}
       <div className="surface-card p-8 rounded-[2.5rem] border border-theme shadow-sm space-y-6">
        <div className="space-y-6">
         <div>
          <span className="text-[10px] font-black text-theme-muted capitalize tracking-[0.2em] block mb-4">Participant Requirements</span>
          <div className="flex flex-wrap gap-2">
           {requirements.length > 0 ? requirements.map((r: string, idx: number) => (
            <span key={idx} className="px-3 py-1.5 surface-section rounded-xl text-[10px] font-black text-theme-secondary border border-theme">{r}</span>
           )) : <span className="text-xs font-bold text-theme-muted italic">No specific health/age requirements listed.</span>}
          </div>
         </div>
         <div>
          <span className="text-[10px] font-black text-theme-muted capitalize tracking-[0.2em] block mb-4">Required Gear</span>
          <div className="flex flex-wrap gap-2">
           {whatToBring.length > 0 ? whatToBring.map((w: string, idx: number) => (
            <span key={idx} className="px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-xl text-[10px] font-black border border-amber-500/20 capitalize tracking-normal">{w}</span>
           )) : <span className="text-xs font-bold text-theme-muted italic">Standard traveler gear recommended.</span>}
          </div>
         </div>
        </div>
       </div>

      </div>
     </div>
    </div>

    {/* Action Footer */}
    <div className="p-6 sm:p-8 border-t border-theme surface-card z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
     {showRejectForm ? (
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
         <AlertTriangle className="w-5 h-5 text-danger-red" />
         <h4 className="text-xs font-black text-danger-red capitalize tracking-[0.2em]">Rejection Rationale</h4>
        </div>
        <button onClick={() => setShowRejectForm(false)} className="text-[10px] font-black text-theme-muted hover:text-theme-primary capitalize tracking-normal flex items-center gap-1 group">
         <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Decisions
        </button>
       </div>
       <textarea 
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        placeholder="Inform the guide exactly what needs to be rectified (e.g., higher resolution images, clearer meeting point address)..."
        className="w-full p-6 surface-section border-2 border-theme rounded-[2rem] text-sm text-theme-primary focus:ring-2 focus:ring-danger-red focus:border-danger-red outline-none h-32 transition-all shadow-inner"
       />
       <button 
        onClick={handleReject}
        disabled={loading || !rejectReason.trim()}
        className="w-full h-16 bg-danger-red text-white font-black text-xs capitalize tracking-[0.3em] rounded-[1.5rem] shadow-2xl shadow-danger-red/30 hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
       >
        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
        Confirm Enforcement Action
       </button>
      </div>
     ) : (
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl mx-auto">
       <button 
        onClick={() => setShowRejectForm(true)}
        disabled={loading}
        className="flex-1 h-16 surface-card border-2 border-danger-red/20 text-danger-red font-black text-xs capitalize tracking-[0.3em] rounded-[1.5rem] hover:bg-danger-red/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
       >
        <ShieldAlert className="w-5 h-5" />
        Reject Template
       </button>
       <button 
        onClick={handleApprove}
        disabled={loading}
        className="flex-[2] h-16 bg-primary-light text-white font-black text-xs capitalize tracking-[0.3em] rounded-[1.5rem] shadow-2xl shadow-primary-light/30 hover:bg-primary-light-hover active:scale-[0.98] transition-all flex items-center justify-center gap-3"
       >
        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
        Approve & Publish
       </button>
      </div>
     )}
    </div>

   </motion.div>
  </motion.div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminTourModerationPage() {
 const [tours, setTours] = React.useState<TourTemplateResponse[]>([])
 const [loading, setLoading] = React.useState(true)
 const [searchTerm, setSearchTerm] = React.useState('')
 const [selectedTour, setSelectedTour] = React.useState<TourTemplateResponse | null>(null)

 useBadgeReset('admin-tours')

 const fetchTours = async () => {
  try {
   setLoading(true)
   const res = await getAdminPendingTours()
   setTours(res)
  } catch (err: any) {
   toast.error('Failed to load moderation queue')
  } finally {
   setLoading(false)
  }
 }

 React.useEffect(() => {
  fetchTours()
 }, [])

 const filteredTours = React.useMemo(() => {
  return tours.filter(t => 
   t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
   t.locationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
   t.id.toString() === searchTerm
  )
 }, [tours, searchTerm])

 if (loading) {
    return <AdminToursSkeleton />
 }

 return (
  <div className="space-y-8 pb-20">
   
   {/* Header */}
   <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
    <div className="space-y-2">
     <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary-light rounded-2xl flex items-center justify-center shadow-xl shadow-primary-light/20 text-white">
       <Shield className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-black text-primary-light capitalize tracking-[0.2em] bg-primary-light/10 px-3 py-1 rounded-xl border border-primary-light/10">Admin Gatekeeper</span>
     </div>
     <h1 className="text-3xl sm:text-4xl font-black text-theme-primary tracking-tighter">
      Tour <span className="text-primary-light">Moderation</span>
     </h1>
     <p className="text-sm text-theme-muted max-w-lg font-medium">
      Evaluate and authenticate submitted experiences. High-quality metadata is critical for marketplace trust.
     </p>
    </div>
    
    <div className="flex items-center gap-4">
     <div className="px-6 py-4 surface-card rounded-[2rem] border border-theme shadow-sm flex flex-col items-center min-w-[120px] border-b-4 border-b-primary-light">
      <span className="text-[8px] font-black text-theme-muted capitalize tracking-normal mb-1">Queue Depth</span>
      <span className="text-2xl font-black text-theme-primary">{tours.length}</span>
     </div>
     <button 
      onClick={fetchTours}
      className="p-4 surface-card hover:bg-primary-light hover:text-white border border-theme rounded-[1.5rem] transition-all active:scale-90 shadow-sm"
     >
      <RefreshCw className="w-5 h-5" />
     </button>
    </div>
   </div>

   {/* Search & Filters */}
   <div className="relative group">
    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted group-focus-within:text-primary-light transition-colors" />
    <input
     type="text"
     value={searchTerm}
     onChange={(e) => setSearchTerm(e.target.value)}
     placeholder="Search by Title, ID, or Location..."
     className="w-full h-16 pl-16 pr-6 surface-card border-2 border-theme rounded-[2rem] text-sm font-bold text-theme-primary shadow-xl focus:ring-4 focus:ring-primary-light/10 focus:border-primary-light transition-all placeholder-theme-muted/50"
    />
   </div>

   {/* Grid Listing */}
   {filteredTours.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
     {filteredTours.map((tour, idx) => (
      <motion.div 
       key={tour.id}
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: idx * 0.05 }}
       className="group surface-card rounded-[2.5rem] border border-theme overflow-hidden hover:shadow-2xl hover:shadow-primary-light/10 hover:-translate-y-1 transition-all duration-500 flex flex-col"
      >
       {/* Image Area */}
       <div className="h-56 relative overflow-hidden shrink-0">
        {tour.media && tour.media.length > 0 ? (
         <Image 
          src={tour.media[0].url} 
          alt={tour.title} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          unoptimized={tour.media[0].url.startsWith('data:')}
         />
        ) : (
         <div className="w-full h-full surface-section flex items-center justify-center text-theme-muted">
          <AlertCircle className="w-10 h-10 opacity-10" />
         </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        <div className="absolute top-5 left-5">
         <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-[9px] font-black text-white capitalize tracking-[0.2em] shadow-lg">
          {tour.category || 'Curated'}
         </span>
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
         <div className="flex flex-col">
          <span className="text-[10px] font-black text-white/70 capitalize tracking-normal">ID-{tour.id}</span>
          <span className="text-xl font-black text-white truncate max-w-[180px]">{tour.title}</span>
         </div>
         <div className="bg-primary-light px-3 py-1 rounded-xl shadow-lg border border-white/20">
          <span className="text-lg font-black text-white">${tour.basePrice}</span>
         </div>
        </div>
       </div>

       {/* Content Area */}
       <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
         <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
           <MapPin className="w-3.5 h-3.5 text-primary-light" />
           <span className="text-[10px] font-black text-theme-secondary capitalize tracking-normal">{tour.locationName || tour.countryCode}</span>
          </div>
          <span className="text-[9px] font-black text-theme-muted capitalize tracking-normal">{new Date(tour.createdAtUtc).toLocaleDateString()}</span>
         </div>

         <p className="text-xs text-theme-secondary line-clamp-2 leading-relaxed h-10 font-medium">
          {tour.shortDescription || tour.description}
         </p>

         <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 px-2 py-1 surface-section rounded-lg border border-theme">
           <Clock className="w-3 h-3 text-primary-light" />
           <span className="text-[9px] font-black text-theme-muted capitalize">{tour.durationHours}H {tour.durationMinutes}M</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 surface-section rounded-lg border border-theme">
           <Users className="w-3 h-3 text-success-green" />
           <span className="text-[9px] font-black text-theme-muted capitalize">{tour.maxCapacity} MAX</span>
          </div>
          {tour.halalFriendly && (
           <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-[9px] font-black capitalize">Halal</span>
           </div>
          )}
         </div>
        </div>

        <button
         onClick={() => setSelectedTour(tour)}
         className="mt-8 w-full h-12 bg-theme-primary dark:bg-surface-section hover:bg-primary-light hover:text-white text-theme-reverse font-black text-[10px] capitalize tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2 group/btn"
        >
         Review Entry
         <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
       </div>
      </motion.div>
     ))}
    </div>
   ) : (
    <motion.div 
     initial={{ opacity: 0, scale: 0.95 }}
     animate={{ opacity: 1, scale: 1 }}
     className="py-32 surface-card rounded-[3rem] border-2 border-dashed border-theme flex flex-col items-center justify-center text-center px-10 shadow-sm"
    >
     <div className="w-24 h-24 bg-success-green/10 rounded-[2rem] flex items-center justify-center mb-8 text-success-green border border-success-green/20">
      <ShieldCheck className="w-12 h-12" />
     </div>
     <h3 className="text-3xl font-black text-theme-primary mb-3 tracking-tight">Gate Secure</h3>
     <p className="text-theme-muted max-w-sm text-sm font-medium leading-relaxed">
      No pending tour submissions require review. The marketplace is currently synchronized with all approved entries.
     </p>
     <button 
      onClick={fetchTours}
      className="mt-10 px-8 py-3 bg-primary-light hover:bg-primary-light-hover text-white rounded-2xl text-[10px] font-black capitalize tracking-normal transition-all shadow-xl shadow-primary-light/20 flex items-center gap-3"
     >
      <RefreshCw className="w-4 h-4" />
      Sync Vault
     </button>
    </motion.div>
   )}

   {/* Review Modal */}
   {selectedTour && (
    <ReviewModal
     tour={selectedTour}
     onClose={() => setSelectedTour(null)}
     onAction={fetchTours}
    />
   )}

  </div>
 )
}
