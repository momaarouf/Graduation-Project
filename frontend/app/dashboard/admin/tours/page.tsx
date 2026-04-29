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
 AlertTriangle,
 FileWarning,
 MessageSquare,
 Repeat,
 FileText,
 Play,
 Info
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

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge = ({ status }: { status: TourTemplateStatus }) => {
 const styles: Record<string, string> = {
 PENDING_REVIEW: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark dark:text-amber-400 border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/50',
 PUBLISHED: 'bg-success-green/10 dark:bg-success-green/10 text-emerald-700 dark:text-emerald-400 border-success-green dark:border-success-green/50',
 REJECTED: 'bg-danger-red/10 dark:bg-danger-red/10 text-red-700 dark:text-red-400 border-danger-red dark:border-danger-red/50',
 DRAFT: 'surface-section text-theme-secondary border-theme',
 PAUSED: 'bg-accent-light/10 dark:bg-accent-dark/10/50 dark:bg-amber-800/20 text-accent-light dark:text-accent-dark dark:text-accent-light dark:text-accent-dark border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/30',
 ARCHIVED: 'surface-section text-theme-muted border-theme'
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
 if (!confirm(`Are you sure you want to PUBLISH"${tour.title}"?`)) return
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
 className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 surface-base  font-sans"
 >
 <motion.div 
 initial={{ scale: 0.98, y: 10 }}
 animate={{ scale: 1, y: 0 }}
 className="w-full h-full sm:h-auto max-w-6xl surface-card rounded-none sm:rounded-[2rem] shadow-2xl overflow-hidden border-0 sm:border border-theme flex flex-col sm:max-h-[90vh]"
 >
 
 {/* Header - Compact Logic */}
 <div className="px-6 py-4 border-b border-theme flex items-center justify-between surface-card sticky top-0 z-20">
 <div className="flex items-center gap-4">
 <div className="hidden md:flex w-12 h-12 bg-primary-light rounded-xl items-center justify-center shadow-lg shadow-primary-light/20 text-white shrink-0">
 <ShieldCheck className="w-6 h-6" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-xl font-bold text-theme-primary tracking-tight">Review Desk</h3>
 <span className="px-2 py-0.5 bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark dark:text-amber-400 text-[9px] font-bold uppercase tracking-widest rounded-md border border-accent-light dark:border-accent-dark/20">Pending</span>
 </div>
 <div className="flex items-center gap-3 mt-0.5">
 <span className="text-[9px] font-bold text-theme-muted uppercase tracking-widest flex items-center gap-1"><Fingerprint className="w-2.5 h-2.5" /> ID-{tour.id}</span>
 <span className="text-[9px] font-bold text-theme-muted uppercase tracking-widest flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {new Date(tour.createdAtUtc).toLocaleDateString()}</span>
 </div>
 </div>
 </div>
 
 <div className="flex items-center gap-3">
 <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 surface-section rounded-lg border border-theme">
 <div className="w-6 h-6 rounded-md bg-primary-light/20 dark:bg-primary-dark/20 dark:bg-primary-light/20 flex items-center justify-center text-primary-light dark:text-primary-dark dark:text-primary-dark font-bold text-[10px]">G</div>
 <span className="text-[10px] font-bold text-theme-secondary">Verified Guide</span>
 </div>
 <button onClick={onClose} className="w-10 h-10 flex items-center justify-center surface-section hover:bg-danger-red/10 dark:hover:bg-red-950/30 hover:text-danger-red rounded-xl transition-all">
 <X className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Workspace Body */}
 <div className="flex-1 overflow-y-auto custom-scrollbar">
 <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
 
 {/* Left Column (Col-7) */}
 <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-theme space-y-8">
 
 {/* Title Area */}
 <div>
 <div className="flex items-center gap-2 mb-3">
 <span className="px-2 py-0.5 bg-primary-light/10 dark:bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark text-[9px] font-bold uppercase tracking-wider rounded">
 {tour.category || 'Tour'}
 </span>
 <span className="px-2 py-0.5 surface-section text-theme-muted text-[9px] font-bold uppercase tracking-wider rounded">
 {tour.countryCode}
 </span>
 </div>
 <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight leading-tight mb-4">
 {tour.title}
 </h1>
 <p className="text-base text-theme-secondary border-l-2 border-primary-light dark:border-primary-dark pl-4 italic">
 {tour.shortDescription || 'No professional introduction provided.'}
 </p>
 </div>

 {/* Media Gallery */}
 <div className="space-y-3">
 <div className="relative aspect-video rounded-xl overflow-hidden border border-theme shadow-md surface-section">
 <AnimatePresence mode="wait">
 <motion.div 
 key={activeMediaIndex}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="w-full h-full"
 >
 {currentMedia && isVideoUrl(currentMedia.url) ? (
 <video src={currentMedia.url} controls className="w-full h-full object-cover" />
 ) : currentMedia ? (
 <Image src={currentMedia.url} alt="Tour Preview" fill className="object-cover" unoptimized={currentMedia.url.startsWith('data:')} />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-theme-muted"><FileWarning className="w-12 h-12 opacity-20" /></div>
 )}
 </motion.div>
 </AnimatePresence>

 {uniqueMedia.length > 1 && (
 <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
 <button onClick={prevMedia} className="w-10 h-10 surface-card dark:bg-black/40  rounded-full flex items-center justify-center text-white pointer-events-auto hover:surface-card transition-all shadow-lg"><ChevronLeft className="w-6 h-6" /></button>
 <button onClick={nextMedia} className="w-10 h-10 surface-card dark:bg-black/40  rounded-full flex items-center justify-center text-white pointer-events-auto hover:surface-card transition-all shadow-lg"><ChevronRight className="w-6 h-6" /></button>
 </div>
 )}

 <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/40  rounded-full text-[10px] font-bold text-white border border-theme-strong uppercase tracking-widest">
 {activeMediaIndex + 1} / {uniqueMedia.length}
 </div>
 </div>

 {uniqueMedia.length > 1 && (
 <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide px-0.5">
 {uniqueMedia.map((m, i) => (
 <button 
 key={m.id || i}
 onClick={() => setActiveMediaIndex(i)}
 className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${activeMediaIndex === i ? 'border-primary-light dark:border-primary-dark scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
 >
 <Image src={m.url} alt="Thumb" fill className="object-cover" unoptimized={m.url.startsWith('data:')} />
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Description */}
 <div className="surface-section p-6 rounded-[1.5rem] border border-theme">
 <h4 className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-4 flex items-center gap-2">
 <FileText className="w-4 h-4 text-primary-light dark:text-primary-dark" /> Administrative Description
 </h4>
 <div className="prose prose-sm dark:prose-invert max-w-none text-theme-secondary leading-relaxed whitespace-pre-line">
 {tour.description}
 </div>
 </div>

 {/* Itinerary */}
 <div className="space-y-6">
 <h4 className="text-[10px] font-bold text-theme-muted uppercase tracking-widest border-b border-theme pb-2">Experience Timeline</h4>
 <div className="space-y-4">
 {itinerary.length > 0 ? itinerary.map((step: any, idx: number) => (
 <div key={idx} className="relative pl-10 pb-6 last:pb-0 group">
 <div className="absolute left-[15px] top-8 bottom-0 w-0.5 surface-section group-last:hidden" />
 <div className="absolute left-0 top-0.5 w-8 h-8 surface-card border-2 border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark rounded-lg flex items-center justify-center font-bold text-xs shadow-sm z-10">
 {idx + 1}
 </div>
 <div>
 <div className="flex items-center gap-3 mb-1">
 <h5 className="text-base font-bold text-theme-primary">{step.title}</h5>
 <span className="text-[9px] font-bold text-primary-light dark:text-primary-dark bg-primary-light/10 dark:bg-primary-light/10 px-2 py-0.5 rounded uppercase">{step.duration || 'Flexible'}</span>
 </div>
 <p className="text-sm text-theme-muted ">{step.description}</p>
 </div>
 </div>
 )) : (
 <p className="text-xs font-bold text-theme-muted uppercase tracking-widest text-center py-6 border-2 border-dashed border-theme rounded-xl">Itinerary Missing</p>
 )}
 </div>
 </div>
 </div>

 {/* Right Column (Col-5) */}
 <div className="lg:col-span-5 p-6 sm:p-8 space-y-8 surface-section">
 
 {/* Price & Duration */}
 <div className="grid grid-cols-2 gap-4">
 <div className="p-5 surface-card rounded-xl border border-theme shadow-sm">
 <span className="block text-[9px] font-bold text-theme-muted uppercase tracking-widest mb-1">Price Point</span>
 <div className="flex items-baseline gap-1">
 <span className="text-2xl font-black text-theme-primary">${tour.basePrice}</span>
 <span className="text-[10px] font-bold text-theme-muted uppercase">{tour.currency}</span>
 </div>
 </div>
 <div className="p-5 surface-card rounded-xl border border-theme shadow-sm">
 <span className="block text-[9px] font-bold text-theme-muted uppercase tracking-widest mb-1">Run Time</span>
 <div className="flex items-baseline gap-1">
 <span className="text-2xl font-black text-theme-primary">{tour.durationHours}h {tour.durationMinutes}m</span>
 </div>
 </div>
 </div>

 {/* Capacity / Languages */}
 <div className="p-6 surface-card rounded-[1.5rem] border border-theme shadow-sm space-y-6">
 <div className="flex items-center justify-between pb-4 border-b border-theme">
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-success-green" />
 <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">Pax Capacity</span>
 </div>
 <span className="text-base font-bold text-theme-primary">{tour.minCapacity} — {tour.maxCapacity}</span>
 </div>
 <div className="space-y-3">
 <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block">Languages</span>
 <div className="flex flex-wrap gap-1.5">
 {languages.length > 0 ? languages.map((l: any, idx: number) => {
 const label = typeof l === 'object' ? `${l.language}` : l
 return <span key={idx} className="px-2 py-1 surface-section border border-theme rounded text-[10px] font-bold text-theme-secondary uppercase">{label}</span>
 }) : <span className="text-[10px] font-bold text-theme-muted">English</span>}
 </div>
 </div>
 </div>

 {/* Logistics */}
 <div className="p-6 surface-card rounded-[1.5rem] border border-theme shadow-sm">
 <h4 className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-6">Logistics Hub</h4>
 <div className="space-y-6">
 <div className="flex gap-4">
 <div className="w-10 h-10 bg-primary-light/10 dark:bg-primary-light/10 text-primary-light dark:text-primary-dark rounded-lg flex items-center justify-center shrink-0 border border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark"><MapPin className="w-5 h-5" /></div>
 <div>
 <span className="block text-[8px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Assembly Point</span>
 <h5 className="text-base font-bold text-theme-primary leading-tight">{tour.meetingPointName || 'Standard'}</h5>
 <p className="text-xs text-theme-muted mt-0.5">{tour.meetingPointAddress || 'Address not listed'}</p>
 {tour.meetingLatitude && (
 <a href={`https://maps.google.com/?q=${tour.meetingLatitude},${tour.meetingLongitude}`} target="_blank" className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold text-primary-light dark:text-primary-dark hover:underline">
 View Map <Eye className="w-3 h-3" />
 </a>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Preparation */}
 <div className="p-6 surface-card rounded-[1.5rem] border border-theme shadow-sm space-y-6">
 <div className="space-y-4">
 <div>
 <span className="text-[9px] font-bold text-theme-muted uppercase tracking-widest block mb-2">Requirements</span>
 <div className="flex flex-wrap gap-1.5">
 {requirements.length > 0 ? requirements.map((r: string, idx: number) => (
 <span key={idx} className="px-2 py-1 surface-section rounded text-[10px] font-bold text-theme-muted border border-theme">{r}</span>
 )) : <span className="text-[10px] italic text-theme-muted">None</span>}
 </div>
 </div>
 <div>
 <span className="text-[9px] font-bold text-theme-muted uppercase tracking-widest block mb-2">To Bring</span>
 <div className="flex flex-wrap gap-1.5">
 {whatToBring.length > 0 ? whatToBring.map((w: string, idx: number) => (
 <span key={idx} className="px-2 py-1 bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-accent-light/10 dark:bg-accent-dark/5 text-accent-light dark:text-accent-dark text-[10px] font-bold border border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/30 rounded">{w}</span>
 )) : <span className="text-[10px] italic text-theme-muted">Standard kits</span>}
 </div>
 </div>
 </div>
 </div>

 {/* Inclusions */}
 <div className="grid grid-cols-2 gap-3">
 <div className="p-4 bg-success-green/10 dark:bg-success-green/5 rounded-xl border border-success-green dark:border-success-green">
 <h4 className="text-[9px] font-bold text-success-green uppercase mb-2">In</h4>
 <ul className="text-[10px] space-y-1 font-medium text-emerald-800 dark:text-emerald-400">
 {inclusions.slice(0, 3).map((item: string, idx: number) => <li key={idx} className="truncate">• {item}</li>)}
 </ul>
 </div>
 <div className="p-4 bg-rose-50 dark:bg-rose-500/5 rounded-xl border border-rose-100 dark:border-rose-800">
 <h4 className="text-[9px] font-bold text-rose-600 uppercase mb-2">Out</h4>
 <ul className="text-[10px] space-y-1 font-medium text-rose-800 dark:text-rose-400">
 {exclusions.slice(0, 3).map((item: string, idx: number) => <li key={idx} className="truncate">• {item}</li>)}
 </ul>
 </div>
 </div>

 </div>
 </div>
 </div>

 {/* Action Footer */}
 <div className="p-6 border-t border-theme surface-card z-30">
 {showRejectForm ? (
 <div className="w-full max-w-2xl mx-auto space-y-4">
 <div className="flex items-center justify-between">
 <h4 className="text-[11px] font-bold text-rose-600 uppercase tracking-widest">Rejection Rationale</h4>
 <button onClick={() => setShowRejectForm(false)} className="text-[10px] font-bold text-theme-muted hover:text-theme-primary underline">Cancel</button>
 </div>
 <textarea 
 value={rejectReason}
 onChange={(e) => setRejectReason(e.target.value)}
 placeholder="Provide specific feedback for the guide..."
 className="w-full p-4 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:ring-1 focus:ring-rose-500 h-28"
 />
 <button 
 onClick={handleReject}
 disabled={loading || !rejectReason.trim()}
 className="w-full h-14 bg-rose-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-500/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
 >
 {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
 Confirm Rejection
 </button>
 </div>
 ) : (
 <div className="flex gap-4 w-full max-w-4xl mx-auto">
 <button 
 onClick={() => setShowRejectForm(true)}
 disabled={loading}
 className="flex-1 h-14 surface-card border border-rose-200 dark:border-rose-900/50 text-rose-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
 >
 <ShieldAlert className="w-5 h-5" />
 Reject
 </button>
 <button 
 onClick={handleApprove}
 disabled={loading}
 className="flex-[2] h-14 bg-primary-light text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary-light/20 hover:bg-primary-light-hover transition-all flex items-center justify-center gap-2"
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
 t.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
 )
 }, [tours, searchTerm])

 if (loading) {
 return (
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
 <RefreshCw className="w-10 h-10 text-primary-light dark:text-primary-dark animate-spin" />
 <p className="text-xs font-black text-theme-muted uppercase tracking-widest animate-pulse">Scanning Global Departures...</p>
 </div>
 )
 }

 return (
 <div className="pt-14 sm:pt-16 min-h-screen bg-transparent sm:surface-section dark:sm:surface-base">
 <div className="container-safe mx-auto max-w-7xl py-6 sm:py-8">
 
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
 <div>
 <div className="flex items-center gap-2 mb-3">
 <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shadow-md shadow-primary-light/20 text-white">
 <Shield className="w-4 h-4" />
 </div>
 <h4 className="text-[9px] font-bold text-primary-light dark:text-primary-dark dark:text-primary-dark uppercase tracking-widest bg-primary-light/10 px-2.5 py-1 rounded-md">Moderation Queue</h4>
 </div>
 <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight mb-2">
 Tour <span className="text-primary-light dark:text-primary-dark">Verification</span>
 </h1>
 <p className="text-xs font-bold text-theme-muted max-w-sm">
 Validate and publish submitted tour templates to the global marketplace.
 </p>
 </div>
 
 <div className="flex items-center gap-3">
 <div className="px-4 py-2 surface-card rounded-2xl border border-theme shadow-sm flex flex-col items-end">
 <span className="text-[8px] font-bold text-theme-muted uppercase tracking-widest">Pending</span>
 <span className="text-lg font-black text-theme-primary">{tours.length}</span>
 </div>
 <button 
 onClick={fetchTours}
 className="p-3 surface-section hover:surface-section text-theme-secondary rounded-2xl transition-all"
 >
 <RefreshCw className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Search */}
 <div className="relative mb-8">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Filter queue..."
 className="w-full h-12 pl-12 pr-6 surface-card border border-theme rounded-2xl text-sm font-bold text-theme-primary shadow-sm focus:ring-1 focus:ring-primary-light dark:ring-primary-dark transition-all placeholder-gray-400"
 />
 </div>

 {/* Main Listing */}
 {filteredTours.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
 {filteredTours.map((tour, idx) => (
 <motion.div 
 key={tour.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.03 }}
 className="group surface-card rounded-3xl border border-theme overflow-hidden hover:shadow-xl hover:shadow-primary-light/5 transition-all duration-300 flex flex-col sm:flex-row"
 >
 <div className="w-full sm:w-44 h-40 sm:h-auto relative overflow-hidden shrink-0">
 {tour.media && tour.media.length > 0 ? (
 <Image 
 src={tour.media[0].url} 
 alt={tour.title} 
 fill 
 className="object-cover group-hover:scale-105 transition-transform duration-500"
 unoptimized={tour.media[0].url.startsWith('data:')}
 />
 ) : (
 <div className="w-full h-full surface-section flex items-center justify-center text-gray-300">
 <AlertCircle className="w-8 h-8 opacity-20" />
 </div>
 )}
 <div className="absolute top-3 left-3">
 <span className="px-2 py-0.5 bg-black/40  rounded text-[8px] font-bold text-white uppercase tracking-widest leading-none">
 {tour.category || 'Curated'}
 </span>
 </div>
 </div>

 <div className="flex-1 p-5 flex flex-col justify-between">
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-[9px] font-bold text-primary-light dark:text-primary-dark dark:text-primary-dark uppercase tracking-wider">#{tour.id} • {tour.countryCode}</span>
 <span className="text-[9px] font-bold text-theme-muted">
 {new Date(tour.createdAtUtc).toLocaleDateString()}
 </span>
 </div>
 
 <div>
 <h3 className="text-lg font-bold text-theme-primary leading-tight mb-1 group-hover:text-primary-light dark:text-primary-dark transition-colors line-clamp-1">
 {tour.title}
 </h3>
 <p className="text-[11px] text-theme-muted line-clamp-2 leading-snug h-8">
 {tour.shortDescription || tour.description}
 </p>
 </div>

 <div className="flex flex-wrap gap-1.5">
 {tour.halalFriendly && (
 <span className="px-1.5 py-0.5 bg-success-green/10 dark:bg-success-green/5 text-success-green text-[8px] font-bold uppercase rounded border border-success-green dark:border-success-green">Halal</span>
 )}
 <span className="px-1.5 py-0.5 bg-primary-light/10 dark:bg-primary-light/5 text-primary-light dark:text-primary-dark text-[8px] font-bold uppercase rounded border border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark">{tour.durationHours}h {tour.durationMinutes}m</span>
 </div>
 </div>
 
 <div className="flex items-center justify-between pt-4 mt-4 border-t border-theme">
 <div className="flex flex-col">
 <span className="text-[8px] font-bold text-theme-muted uppercase tracking-widest leading-none mb-0.5">Rate</span>
 <div className="flex items-baseline gap-1">
 <span className="text-xl font-black text-theme-primary">${tour.basePrice}</span>
 <span className="text-[9px] font-bold text-theme-muted uppercase">{tour.currency}</span>
 </div>
 </div>
 <button
 onClick={() => setSelectedTour(tour)}
 className="h-10 px-4 surface-base text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary-light dark:hover:bg-primary-light hover:text-white transition-all flex items-center gap-1.5 group/btn"
 >
 Review
 <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
 </button>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 ) : (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="py-20 surface-card rounded-3xl border border-theme flex flex-col items-center justify-center text-center px-6"
 >
 <div className="w-16 h-16 bg-success-green/20 dark:bg-success-green/20 rounded-xl flex items-center justify-center mb-6 text-success-green">
 <CheckCircle className="w-8 h-8" />
 </div>
 <h3 className="text-xl font-bold text-theme-primary mb-2">Queue Clear</h3>
 <p className="text-theme-muted max-w-xs text-xs font-bold leading-relaxed">
 All pending submissions have been processed. New items will appear here for verification.
 </p>
 <button 
 onClick={fetchTours}
 className="mt-8 px-6 py-2 surface-section hover:surface-section rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-theme-muted flex items-center gap-2"
 >
 <RefreshCw className="w-3.5 h-3.5" />
 Refresh
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
 </div>
 )
}