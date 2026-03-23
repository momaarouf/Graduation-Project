'use client'

import { useState, useEffect, useMemo } from 'react'
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
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Award,
  Power,
  X,
  Shield,
  MessageSquare,
  Repeat,
  FileText,
  Play,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  getAdminPendingTours, 
  adminApproveTour, 
  adminRejectTour 
} from '@/src/lib/api/tours'
import { 
  TourTemplateResponse, 
  TourTemplateStatus 
} from '@/src/lib/types/tour.types'

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge = ({ status }: { status: TourTemplateStatus }) => {
  const styles: Record<string, string> = {
    PENDING_REVIEW: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    PUBLISHED: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    REJECTED: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
    DRAFT: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    PAUSED: 'bg-amber-50/50 dark:bg-amber-800/20 text-amber-600 dark:text-amber-500 border-amber-100 dark:border-amber-900/30',
    ARCHIVED: 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${styles[status] || styles.DRAFT}`}>
      <AlertCircle className="w-3 h-3" />
      {status.replace('_', ' ')}
    </span>
  )
}

// ============================================================================
// TOUR REVIEW MODAL
// ============================================================================

import { isVideoUrl } from '@/src/lib/utils/tour-utils'

interface ReviewModalProps {
  tour: TourTemplateResponse
  onClose: () => void
  onAction: () => void
}

const safeJsonParse = (data: any, fallback: any = []) => {
  if (!data) return fallback
  if (typeof data !== 'string') return data
  try {
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch (e) {
    // If it's a comma separated string but not JSON
    if (data.includes(',')) return data.split(',').map(s => s.trim())
    return [data]
  }
}

const ReviewModal = ({ tour, onClose, onAction }: ReviewModalProps) => {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)

  // Parse JSON fields
  const languages = safeJsonParse(tour.languages, [])
  const itinerary = safeJsonParse(tour.itinerary, [])
  const inclusions = safeJsonParse(tour.inclusions, [])
  const exclusions = safeJsonParse(tour.exclusions, [])
  const requirements = safeJsonParse(tour.requirements, [])
  const whatToBring = safeJsonParse(tour.whatToBring, [])

  // Deduplicate media by URL (to handle potential backend duplicates)
  const uniqueMedia = useMemo(() => {
    if (!tour.media) return []
    const seen = new Set()
    return tour.media.filter(m => {
      const isDuplicate = seen.has(m.url)
      seen.add(m.url)
      return !isDuplicate
    })
  }, [tour.media])

  const nextMedia = () => {
    setActiveMediaIndex(prev => (prev + 1) % uniqueMedia.length)
  }

  const prevMedia = () => {
    setActiveMediaIndex(prev => (prev - 1 + uniqueMedia.length) % uniqueMedia.length)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextMedia()
      if (e.key === 'ArrowLeft') prevMedia()
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
      onAction()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Rejection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white transform rotate-3">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                  Moderation <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 font-black">Review</span>
                </h3>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Case Reference</span>
                   <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-black text-gray-600 dark:text-gray-400">#{tour.id}</span>
                </div>
              </div>
           </div>
           <button onClick={onClose} className="p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-2xl transition-all text-gray-500 hover:rotate-90">
             <X className="w-7 h-7" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          
          {/* Top Section: Intro & Media */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
             <div className="lg:col-span-2 space-y-8">
                <div>
                   <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tight italic">{tour.title}</h1>
                   <div className="flex flex-wrap gap-2">
                      <StatusBadge status={tour.status} />
                      {tour.halalFriendly && (
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3" /> Halal
                        </span>
                      )}
                      {tour.isPremium && (
                        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                          <Award className="w-3 h-3" /> Premium
                        </span>
                      )}
                      {tour.isFamilyFriendly && (
                        <span className="px-3 py-1 bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-800/50 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                           <Users className="w-3 h-3" /> Family
                        </span>
                      )}
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 text-[10px] font-black uppercase tracking-widest rounded-full">{tour.countryCode}</span>
                   </div>
                </div>
                
                <div className="relative">
                   <div className="absolute -left-4 top-0 bottom-0 w-1 bg-blue-500/20 rounded-full" />
                   <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-semibold text-lg italic pl-4">"{tour.shortDescription || 'No professional introduction provided.'}"</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Base Pricing</span>
                      <div className="flex items-baseline gap-1.5">
                         <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">${tour.basePrice}</span>
                         <span className="text-xs font-bold text-gray-400 uppercase">{tour.currency}</span>
                      </div>
                   </div>
                   <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Duration</span>
                      <div className="flex items-baseline gap-1.5">
                         <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">
                           {tour.durationHours || 0}<span className="text-lg opacity-50 ml-0.5">h</span> {tour.durationMinutes || 0}<span className="text-lg opacity-50 ml-0.5">m</span>
                         </span>
                      </div>
                   </div>
                </div>

                <div className="p-5 bg-blue-50/30 dark:bg-blue-500/5 rounded-3xl border border-blue-100/50 dark:border-blue-900/30">
                   <div className="flex items-center justify-between mb-3 border-b border-blue-100/30 dark:border-blue-900/30 pb-3">
                      <div className="flex items-center gap-2">
                         <Users className="w-4 h-4 text-blue-500" />
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Capacity Range</span>
                      </div>
                      <span className="text-lg font-black text-gray-900 dark:text-white">{tour.minCapacity} — {tour.maxCapacity} Guests</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Globe className="w-4 h-4 text-emerald-500" />
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spoken Languages</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 justify-end">
                         {languages.length > 0 ? languages.map((l: any, idx: number) => {
                            const label = typeof l === 'object' ? `${l.language} (${l.proficiency})` : l
                            return (
                               <span key={idx} className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase">
                                  {label}
                               </span>
                            )
                         }) : 'English'}
                      </div>
                   </div>
                </div>
             </div>

             <div className="lg:col-span-3 space-y-4">
                <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl group bg-gray-100 dark:bg-gray-900 focus:outline-none ring-offset-4 focus:ring-4 focus:ring-blue-500/20" tabIndex={0}>
                   {currentMedia ? (
                     isVideoUrl(currentMedia.url) ? (
                        <video 
                           src={currentMedia.url} 
                           controls 
                           className="w-full h-full object-cover"
                           key={currentMedia.url}
                           autoPlay
                           muted
                        />
                     ) : (
                        <Image 
                           src={currentMedia.url} 
                           alt={tour.title} 
                           fill 
                           className="object-cover group-hover:scale-105 transition-transform duration-700"
                           unoptimized={currentMedia.url.startsWith('data:')}
                        />
                     )
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400">
                       <AlertCircle className="w-16 h-16 opacity-20" />
                     </div>
                   )}

                   {/* Navigation Arrows */}
                   {uniqueMedia.length > 1 && (
                     <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10 pointer-events-none">
                       <button 
                         onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                         className="w-14 h-14 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 transition-all active:scale-90 pointer-events-auto shadow-xl group/btn"
                       >
                         <ChevronLeft className="w-8 h-8 group-hover/btn:-translate-x-1 transition-transform" />
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                         className="w-14 h-14 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 transition-all active:scale-90 pointer-events-auto shadow-xl group/btn"
                       >
                         <ChevronRight className="w-8 h-8 group-hover/btn:translate-x-1 transition-transform" />
                       </button>
                     </div>
                   )}
                   
                   <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 pointer-events-none">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="px-2 py-0.5 bg-blue-600 rounded text-[9px] font-black text-white uppercase tracking-widest leading-none">Asset {activeMediaIndex + 1}/{uniqueMedia.length}</span>
                      </div>
                      <h4 className="text-white text-xl font-black italic tracking-tight">{isVideoUrl(currentMedia?.url) ? 'Dynamic Video Content' : 'High Resolution Detail'}</h4>
                   </div>
                </div>
                
                {uniqueMedia && uniqueMedia.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-6 gap-3 pt-2">
                    {uniqueMedia.map((m, i) => (
                      <button 
                        key={m.id || i} 
                        onClick={() => setActiveMediaIndex(i)}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shadow-lg bg-gray-100 dark:bg-gray-800 group/thumb ${activeMediaIndex === i ? 'border-blue-500 ring-4 ring-blue-500/20 scale-105 z-10' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-60 hover:opacity-100'}`}
                      >
                        {isVideoUrl(m.url) ? (
                           <div className="w-full h-full relative">
                              <video src={m.url} className="w-full h-full object-cover opacity-50" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover/thumb:scale-110 transition-transform">
                                    <ChevronRight className="w-4 h-4 fill-current ml-0.5" />
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <Image 
                              src={m.url} 
                              alt={`Thumbnail ${i}`} 
                              fill 
                              className="object-cover group-hover/thumb:scale-110 transition-transform duration-500"
                              unoptimized={m.url.startsWith('data:')}
                           />
                         )}
                         {activeMediaIndex === i && (
                           <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                         )}
                      </button>
                    ))}
                  </div>
                )}
             </div>
          </div>           <hr className="border-gray-100 dark:border-gray-800" />
           
           {/* Full Narrative & Context - NOW FULL WIDTH FOR MORE SPACE */}
           <section className="p-10 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/40 dark:to-gray-900/20 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                  <FileText className="w-32 h-32 text-blue-500" />
               </div>
               
               <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                     <div>
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Detailed Storytelling</h4>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">Full Narrative & Context</h3>
                     </div>
                     <div className="flex items-center gap-4 group">
                        <div className="text-right">
                           <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Authored by</span>
                           <span className="text-sm font-black text-gray-700 dark:text-gray-300">Verified Professional Guide</span>
                        </div>
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue-500 flex items-center justify-center italic text-blue-500 font-black shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform">
                           G
                        </div>
                     </div>
                  </div>
                  
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                     <div className="text-lg font-medium text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-justify">
                        {tour.description}
                     </div>
                  </div>
               </div>
           </section>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Left Column: Itinerary Timeline */}
              <div className="lg:col-span-2 space-y-8">
                 <div className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-gray-50 dark:border-gray-800 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Chronological Itinerary</h4>
                       <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">{itinerary.length} Phases</span>
                    </div>

                    <div className="space-y-0 relative">
                       {itinerary.length > 0 ? itinerary.map((step: any, idx: number) => (
                          <div key={idx} className="relative pl-12 pb-10 last:pb-0 group">
                             {idx !== itinerary.length - 1 && (
                                <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent" />
                             )}
                             <div className="absolute left-0 top-0 w-10 h-10 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-2xl flex items-center justify-center text-blue-600 text-xs font-black shadow-lg z-10 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {idx + 1}
                             </div>
                             <div className="pt-1">
                                <div className="flex items-center justify-between mb-2">
                                   <h5 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{step.title}</h5>
                                   <span className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">{step.duration}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
                             </div>
                          </div>
                       )) : (
                          <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                             <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">No Chronological Data Provided</p>
                          </div>
                       )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <section className="p-8 bg-emerald-50/20 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/30">
                      <div className="flex items-center gap-2 mb-6">
                         <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                            <CheckCircle className="w-4 h-4" />
                         </div>
                         <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Premium Inclusions</h4>
                      </div>
                      <ul className="space-y-3">
                         {inclusions.length > 0 ? inclusions.map((item: string, idx: number) => (
                            <li key={idx} className="flex gap-2 text-sm font-bold text-gray-700 dark:text-emerald-300">
                               <span className="text-emerald-500 mt-1 shrink-0">•</span> {item}
                            </li>
                         )) : <li className="text-xs italic text-gray-400">Standard market inclusions apply.</li>}
                      </ul>
                   </section>

                   <section className="p-8 bg-red-50/20 dark:bg-red-500/5 rounded-3xl border border-red-100/50 dark:border-red-900/30">
                      <div className="flex items-center gap-2 mb-6">
                         <div className="p-2 bg-red-500 rounded-xl text-white shadow-lg shadow-red-500/20">
                            <XCircle className="w-4 h-4" />
                         </div>
                         <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Explicit Exclusions</h4>
                      </div>
                      <ul className="space-y-3">
                         {exclusions.length > 0 ? exclusions.map((item: string, idx: number) => (
                            <li key={idx} className="flex gap-2 text-sm font-bold text-gray-700 dark:text-red-300">
                               <span className="text-red-500 mt-1 shrink-0">•</span> {item}
                            </li>
                         )) : <li className="text-xs italic text-gray-400">Standard market exclusions apply.</li>}
                      </ul>
                   </section>
                </div>
             </div>

              {/* Right Column: Requirements & Distribution */}
              <div className="space-y-8">
                 <section className="p-8 bg-blue-50/20 dark:bg-blue-500/5 rounded-[2.5rem] border border-blue-100/50 dark:border-blue-900/30">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">Preparation Advice</h4>
                    <div className="space-y-6">
                       <div>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 text-center border-b border-blue-100 dark:border-blue-900/30 pb-2">Essential Requirements</span>
                          <div className="flex flex-wrap gap-2 justify-center">
                             {requirements.length > 0 ? requirements.map((r: string, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-bold text-gray-600 dark:text-gray-400 shadow-sm">
                                   {r}
                                </span>
                             )) : <span className="text-[10px] italic text-gray-400">No specific prep required.</span>}
                          </div>
                       </div>
                       <div>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 text-center border-b border-blue-100 dark:border-blue-900/30 pb-2">What to Bring</span>
                          <div className="flex flex-wrap gap-2 justify-center">
                             {whatToBring.length > 0 ? whatToBring.map((w: string, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-bold text-gray-600 dark:text-gray-400 shadow-sm">
                                   {w}
                                </span>
                             )) : <span className="text-[10px] italic text-gray-400">None specified.</span>}
                          </div>
                       </div>
                    </div>
                 </section>

                 <section className="p-8 bg-gray-50/50 dark:bg-gray-900/30 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-blue-500" /> Location & Assembly
                    </h4>
                    <div className="space-y-6">
                       <div className="flex gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 shrink-0">
                             <MapPin className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Meeting Location</span>
                             <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">{tour.meetingPointName || 'Central Landmark'}</p>
                             <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{tour.meetingPointAddress || 'Coordinates not provided'}</p>
                          </div>
                       </div>
                    </div>
                 </section>
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-10 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 flex items-center justify-center">
           {showRejectForm ? (
             <div className="w-full max-w-2xl space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                   <h4 className="text-sm font-black text-red-600 uppercase tracking-[0.2em]">Define Rejection Rationale</h4>
                   <button onClick={() => setShowRejectForm(false)} className="text-[10px] font-black text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest border-b border-transparent hover:border-gray-400 transition-all">Back to Review</button>
                </div>
                <div className="relative group">
                   <textarea
                     value={rejectReason}
                     onChange={(e) => setRejectReason(e.target.value)}
                     placeholder="Detailed feedback for the guide... (e.g. 'Please clarify the meeting point', 'Media resolution is too low')"
                     className="w-full p-8 bg-white dark:bg-gray-950 border-2 border-red-500/10 rounded-[2rem] text-sm font-semibold text-gray-900 dark:text-white focus:border-red-500/40 transition-all placeholder-gray-400 resize-none h-40 shadow-inner group-hover:border-red-500/20"
                   />
                   <div className="absolute top-4 right-4 text-red-500/20">
                      <MessageSquare className="w-6 h-6" />
                   </div>
                </div>
                <button
                  onClick={handleReject}
                  disabled={loading || !rejectReason.trim()}
                  className="w-full h-16 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black rounded-2xl shadow-2xl shadow-red-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                >
                   {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <XCircle className="w-6 h-6" />}
                   CONFIRM FORMAL REJECTION
                </button>
             </div>
           ) : (
             <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={loading}
                  className="h-16 bg-white dark:bg-gray-900 text-red-600 border-2 border-red-500/10 hover:border-red-500 font-black rounded-2xl transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-sm hover:shadow-red-500/5 group"
                >
                   <XCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                   REJECT SUBMISSION
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="h-16 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:grayscale group"
                >
                   {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                   APPROVE & PUBLISH LIVE
                </button>
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
  const [tours, setTours] = useState<TourTemplateResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTour, setSelectedTour] = useState<TourTemplateResponse | null>(null)

  const fetchTours = async () => {
    try {
      setLoading(true)
      const res = await getAdminPendingTours()
      setTours(res.data)
    } catch (err: any) {
      toast.error('Failed to load moderation queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTours()
  }, [])

  const filteredTours = useMemo(() => {
    return tours.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [tours, searchTerm])

  if (loading) {
     return (
       <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
         <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
         <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Scanning Global Departures...</p>
       </div>
     )
  }

  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-transparent sm:bg-gray-50 dark:sm:bg-gray-950">
      <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
           <div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                    <Shield className="w-5 h-5" />
                 </div>
                 <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">HQ Moderation Centre</h4>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                Tour <span className="text-blue-600">Review</span> Queue
              </h1>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 max-w-md">
                Monitor and validate new tour templates before they go live on the marketplace.
              </p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="px-5 py-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-end">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Items</span>
                 <span className="text-xl font-black text-gray-900 dark:text-white">{tours.length}</span>
              </div>
              <button 
                onClick={fetchTours}
                className="p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-400 rounded-2xl transition-all active:scale-95"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
           </div>
        </div>

        {/* Search */}
        <div className="relative mb-10">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
           <input
             type="text"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             placeholder="Search queue by title or location..."
             className="w-full h-16 pl-16 pr-6 bg-white dark:bg-gray-900 border-none rounded-[1.25rem] text-sm font-bold text-gray-900 dark:text-white shadow-xl shadow-gray-200/50 dark:shadow-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
           />
        </div>

        {/* Main Listing */}
        {filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {filteredTours.map(tour => (
               <div 
                 key={tour.id} 
                 className="group bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300"
               >
                  <div className="flex items-stretch h-full">
                     <div className="w-40 relative hidden sm:block shrink-0">
                        {tour.media && tour.media.length > 0 ? (
                          <Image 
                            src={tour.media[0].url} 
                            alt={tour.title} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized={tour.media[0].url.startsWith('data:')}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300">
                             <AlertCircle className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                     </div>
                     <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="min-h-[110px] flex flex-col">
                           <div className="flex items-center justify-between gap-3 mb-2">
                              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{tour.countryCode} • {tour.category || 'Tour'}</span>
                              <span className="text-[10px] font-bold text-gray-400">{new Date(tour.createdAtUtc).toLocaleDateString()}</span>
                           </div>
                           <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-1 h-7">{tour.title}</h3>
                           <p className="text-xs font-bold text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">{tour.shortDescription || tour.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-gray-400 uppercase">Settlement</span>
                              <span className="text-lg font-black text-gray-900 dark:text-white">${tour.basePrice} <span className="text-[10px]">{tour.currency}</span></span>
                           </div>
                           <button
                             onClick={() => setSelectedTour(tour)}
                             className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                           >
                             Full Review
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="py-32 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Zero Items in Queue</h3>
             <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-xs">
               Everything is up to date! There are no new tours waiting for moderation at this moment.
             </p>
          </div>
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
    </div>
  )
}