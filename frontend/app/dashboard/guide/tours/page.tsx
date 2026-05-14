// ============================================================================
// GUIDE TOURS LIST - GRID VERSION
// ============================================================================
// LOCATION: /frontend/app/dashboard/guide/tours/page.tsx
// ============================================================================

'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
 Calendar,
 MapPin,
 Users,
 Clock,
 Star,
 TrendingUp,
 CheckCircle,
 AlertCircle,
 Plus,
 Search,
 Filter,
 ChevronLeft,
 ChevronRight,
 RefreshCw,
 MoreVertical,
 Eye,
 Edit,
 Copy,
 PauseCircle,
 PlayCircle,
 Trash2,
 Undo2,
 Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
 getGuideTours, 
 pauseTour, 
 archiveTour, 
 deleteTour, 
 submitTourForReview, 
 withdrawTourFromReview, 
 resumeTour 
} from '@/src/lib/api/tours'
import { TourTemplateResponse, TourTemplateStatus } from '@/src/lib/types/tour.types'
import GuideToursLoading from './skeleton'

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: TourTemplateStatus }) {
  const styles: Record<TourTemplateStatus, { bg: string, text: string, icon: any, label: string }> = {
  PUBLISHED: { bg: 'bg-success-green/10', text: 'text-success-green', icon: CheckCircle, label: 'Live' },
  DRAFT: { bg: 'bg-surface-section', text: 'text-theme-muted', icon: Clock, label: 'Draft' },
  PENDING_REVIEW: { bg: 'bg-primary-light/10', text: 'text-primary-light dark:text-primary-dark', icon: RefreshCw, label: 'Review' },
  PAUSED: { bg: 'bg-accent-light/10', text: 'text-accent-light dark:text-accent-dark', icon: PauseCircle, label: 'Paused' },
  REJECTED: { bg: 'bg-danger-red/10', text: 'text-danger-red', icon: AlertCircle, label: 'Failed' },
  ARCHIVED: { bg: 'bg-surface-section', text: 'text-theme-muted', icon: Trash2, label: 'Archived' }
  }
 const config = styles[status] || styles.DRAFT
 return (
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-black capitalize tracking-normal rounded-full border border-current/10 ${config.bg} ${config.text} backdrop-blur-md`}>
 <config.icon className="w-3 h-3" />
 {config.label}
 </span>
 )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
 const colorClasses: any = {
 blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark border-primary-light/20',
 emerald: 'bg-success-green/10 text-success-green border-success-green/20',
 amber: 'bg-accent-light/10 text-accent-light dark:text-accent-dark border-accent-light/20',
 purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
 }
 return (
 <div className="p-4 sm:p-6 surface-card border border-theme rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg transition-all group active:scale-95">
 <div className={`p-2 sm:p-2.5 rounded-xl border ${colorClasses[color]} w-fit mb-4 group-hover:scale-110 transition-transform`}>
 <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
 </div>
 <div className="text-xl sm:text-3xl font-black text-theme-primary leading-none mb-1 tracking-tight">{value}</div>
 <div className="text-[9px] sm:text-[10px] font-black capitalize tracking-normal text-theme-muted opacity-70">{label}</div>
 </div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideToursPage() {
 const router = useRouter()
 const [tours, setTours] = useState<TourTemplateResponse[]>([])
 const [loading, setLoading] = useState(true)
 const [filterStatus, setFilterStatus] = useState<TourTemplateStatus | 'ALL'>('ALL')
 const [searchTerm, setSearchTerm] = useState('')
 const [currentPage, setCurrentPage] = useState(1)
 const [activeMenuId, setActiveMenuId] = useState<number | null>(null)
 const itemsPerPage = 6

 const fetchTours = async () => {
 try {
 setLoading(true)
 const res = await getGuideTours()
 setTours(res)
 } catch (err) {
 toast.error('Failed to sync inventory')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => { fetchTours() }, [])

 const filteredTours = useMemo(() => {
 return tours.filter(t => {
 if (filterStatus !== 'ALL' && t.status !== filterStatus) return false
 if (searchTerm) {
 const term = searchTerm.toLowerCase()
 return t.title.toLowerCase().includes(term) || (t.locationName?.toLowerCase().includes(term) ?? false)
 }
 return true
 })
 }, [tours, filterStatus, searchTerm])

 const totalPages = Math.ceil(filteredTours.length / itemsPerPage)
 const paginatedTours = filteredTours.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

 const handleAction = async (action: string, tourId: number) => {
 try {
 switch (action) {
 case 'pause': await pauseTour(tourId); toast.success('Paused'); break
 case 'resume': await resumeTour(tourId); toast.success('Submitted'); break
 case 'withdraw': await withdrawTourFromReview(tourId); toast.success('Withdrawn'); break
 case 'submit': await submitTourForReview(tourId); toast.success('Submitted'); break
 case 'delete': if (confirm('Delete this template?')) { await deleteTour(tourId); toast.success('Archived'); } break
 }
 fetchTours()
 } catch (err) {
 toast.error('Action failed')
 }
 }

 if (loading) return <GuideToursLoading />

 return (
 <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
 <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
  
  {/* Header Hub */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
  <div className="space-y-2">
  <h1 className="text-3xl sm:text-5xl font-black text-theme-primary tracking-tight leading-tight capitalize italic">
  My <span className="text-primary-light">Tours</span>.
  </h1>
  <p className="text-[10px] sm:text-xs text-theme-secondary font-black capitalize tracking-normal opacity-70">
  Professional Tour Inventory & Status
  </p>
  </div>
  <Link href="/dashboard/guide/tours/new" className="w-full sm:w-auto px-8 py-4 bg-primary-light hover:bg-primary-light-hover text-white rounded-2xl font-black capitalize tracking-[0.2em] text-[11px] transition-all shadow-2xl shadow-primary-light/30 flex items-center justify-center gap-3 active:scale-95">
  <Plus className="w-5 h-5" /> New Listing
  </Link>
  </div>

  {/* Metric Hub */}
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
  <StatCard icon={Calendar} label="Total" value={tours.length} color="blue" />
  <StatCard icon={CheckCircle} label="Live" value={tours.filter(t => t.status === 'PUBLISHED').length} color="emerald" />
  <StatCard icon={Clock} label="Pending" value={tours.filter(t => t.status === 'PENDING_REVIEW' || t.status === 'DRAFT').length} color="amber" />
  <StatCard icon={TrendingUp} label="Revenue" value="$0" color="purple" />
  <StatCard icon={Star} label="Rating" value="New" color="amber" />
  </div>

  {/* Filter Hub */}
  <div className="surface-card border border-theme rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm">
  <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 flex-1 min-w-0">
  <div className="relative lg:w-56 min-w-0">
  <select
  value={filterStatus}
  onChange={(e) => setFilterStatus(e.target.value as any)}
  className="w-full h-12 pl-4 pr-10 surface-section border border-theme rounded-xl text-[11px] font-black capitalize tracking-normal text-theme-primary focus:ring-2 focus:ring-primary-light appearance-none cursor-pointer"
  >
  {['ALL', 'PUBLISHED', 'DRAFT', 'PENDING_REVIEW', 'PAUSED', 'REJECTED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
  </select>
  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted pointer-events-none" />
  </div>

  <div className="relative flex-1 min-w-0">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
  <input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search catalog..."
  className="w-full h-12 pl-11 pr-4 surface-section border border-theme rounded-xl text-[11px] font-black capitalize tracking-normal text-theme-primary placeholder-gray-500 focus:ring-2 focus:ring-primary-light"
  />
  </div>
  </div>
  <button onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); }} className="h-12 px-6 surface-section text-[11px] font-black capitalize tracking-normal rounded-xl hover:surface-base transition-all border border-theme flex items-center justify-center gap-2 active:scale-95">
  <RefreshCw className="w-4 h-4" /> Reset
  </button>
  </div>
  </div>

  {/* Inventory Grid */}
  <div className="min-h-[400px]">
  <AnimatePresence mode="popLayout">
  {paginatedTours.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {paginatedTours.map((tour, idx) => (
    <motion.div key={tour.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className={`group surface-card border border-theme rounded-[2.5rem] hover:border-primary-light/40 hover:shadow-2xl transition-all duration-500 relative flex flex-col ${activeMenuId === tour.id ? 'z-50' : 'z-10'}`}>
    {/* Media Area */}
    <div className="relative aspect-[4/3] surface-base overflow-hidden rounded-t-[2.5rem] border-b border-theme">
    {tour.media && tour.media[0] ? (
    <Image src={tour.media[0].url} alt={tour.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
    ) : (
    <div className="flex flex-col items-center justify-center h-full text-theme-muted opacity-30"><MapPin className="w-8 h-8 mb-2" /><span className="text-[10px] font-black capitalize tracking-normal">No Media</span></div>
    )}
    <div className="absolute top-4 left-4"><StatusBadge status={tour.status} /></div>
    {tour.halalFriendly && <div className="absolute top-4 right-4 px-3 py-1.5 bg-success-green/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black capitalize tracking-normal rounded-full backdrop-blur-md border border-emerald-500/30 shadow-lg">Halal</div>}
    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
       <div className="px-4 py-2 surface-card/80 backdrop-blur-md rounded-2xl border border-theme shadow-lg">
          <div className="text-lg font-black text-theme-primary leading-none">${tour.basePrice}</div>
          <div className="text-[8px] font-black capitalize tracking-normal text-theme-muted mt-0.5">/ Seat</div>
       </div>
    </div>
    </div>

    {/* Content Area */}
    <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
    <div className="space-y-6">
    <div className="space-y-2">
    <h3 className="text-xl font-black text-theme-primary truncate capitalize italic tracking-tight group-hover:text-primary-light transition-colors">{tour.title}</h3>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-black capitalize tracking-normal text-theme-muted opacity-80">
    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary-light" /> {tour.locationName || 'Unset'}</span>
    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary-light" /> {tour.durationHours}h {tour.durationMinutes}m</span>
    </div>
    </div>

    {tour.status === 'REJECTED' && tour.rejectionReason && (
    <div className="p-3 bg-danger-red/10 border border-danger-red/20 rounded-xl flex gap-3">
    <AlertCircle className="w-4 h-4 text-danger-red shrink-0" />
    <p className="text-[10px] font-bold text-red-700 dark:text-red-400 line-clamp-2">Rejection: {tour.rejectionReason}</p>
    </div>
    )}
    </div>

    <div className="flex items-center justify-between pt-6 mt-6 border-t border-theme">
    <div className="flex items-center gap-6">
    {[
    { label: 'Seats', val: `${tour.minCapacity}-${tour.maxCapacity}` },
    { label: 'Rating', val: 'New' }
    ].map(s => (
    <div key={s.label}>
    <div className="text-sm font-black text-theme-primary leading-none mb-1">{s.val}</div>
    <div className="text-[9px] font-black capitalize tracking-[0.1em] text-theme-muted opacity-60">{s.label}</div>
    </div>
    ))}
    </div>

    <div className="relative">
    <button onClick={() => setActiveMenuId(activeMenuId === tour.id ? null : tour.id)} className={`w-12 h-12 rounded-2xl border transition-all flex items-center justify-center ${activeMenuId === tour.id ? 'bg-primary-light text-white shadow-xl' : 'text-theme-muted hover:text-theme-primary border-theme hover:surface-section shadow-sm'}`}><MoreVertical className="w-5 h-5" /></button>
    <AnimatePresence>
    {activeMenuId === tour.id && (
    <>
    <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
    <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute right-0 bottom-full mb-3 w-56 surface-card border border-theme rounded-3xl shadow-2xl z-50 overflow-hidden p-2">
    {[
    { label: 'Summary', icon: Eye, click: () => router.push(`/dashboard/guide/tours/${tour.id}`) },
    { label: 'Edit Content', icon: Edit, click: () => router.push(`/dashboard/guide/tours/${tour.id}/edit`) },
    { label: 'Schedules', icon: Calendar, click: () => router.push(`/dashboard/guide/tours/${tour.id}/occurrences`) },
    ].map(a => (
    <button key={a.label} onClick={a.click} className="w-full px-4 py-3 text-left text-[10px] font-black capitalize tracking-normal text-theme-secondary hover:text-primary-light hover:bg-primary-light/10 rounded-xl flex items-center gap-3 transition-all"><a.icon className="w-4 h-4" /> {a.label}</button>
    ))}
    <div className="h-px bg-theme my-2" />
    {tour.status === 'DRAFT' && <button onClick={() => handleAction('submit', tour.id)} className="w-full px-4 py-3 text-left text-[10px] font-black capitalize tracking-normal text-indigo-500 hover:bg-indigo-500/10 rounded-xl flex items-center gap-3 transition-all"><Plus className="w-4 h-4" /> Publish Request</button>}
    {tour.status === 'PUBLISHED' && <button onClick={() => handleAction('pause', tour.id)} className="w-full px-4 py-3 text-left text-[10px] font-black capitalize tracking-normal text-accent-light hover:bg-accent-light/10 rounded-xl flex items-center gap-3 transition-all"><PauseCircle className="w-4 h-4" /> Pause Hub</button>}
    <button onClick={() => handleAction('delete', tour.id)} className="w-full px-4 py-3 text-left text-[10px] font-black capitalize tracking-normal text-danger-red hover:bg-danger-red/10 rounded-xl flex items-center gap-3 transition-all"><Trash2 className="w-4 h-4" /> Delete</button>
    </motion.div>
    </>
    )}
    </AnimatePresence>
    </div>
    </div>
    </div>
    </motion.div>
    ))}
    </div>
  ) : (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 surface-card border-2 border-dashed border-theme rounded-[2.5rem] flex flex-col items-center">
  <div className="w-20 h-20 surface-base rounded-full flex items-center justify-center mb-6 shadow-inner border border-theme"><Calendar className="w-10 h-10 text-theme-muted opacity-30" /></div>
  <h3 className="text-xl font-black text-theme-primary capitalize italic tracking-tight mb-2">Inventory Empty</h3>
  <p className="text-[10px] font-black capitalize tracking-normal text-theme-muted opacity-70 max-w-xs mb-8">Start your journey as a professional guide by launching your first expedition listing.</p>
  <Link href="/dashboard/guide/tours/new" className="px-8 py-4 bg-primary-light text-white text-[11px] font-black capitalize tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all">Launch First Expedition</Link>
  </motion.div>
  )}
  </AnimatePresence>
  </div>

  {/* Pagination Feed */}
  {!loading && filteredTours.length > itemsPerPage && (
  <div className="flex items-center justify-between mt-12 pt-8 border-t border-theme">
  <p className="text-[9px] font-black capitalize tracking-[0.3em] text-theme-muted opacity-60">Page {currentPage} of {totalPages}</p>
  <div className="flex gap-4">
  <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }} disabled={currentPage === 1} className="w-12 h-12 flex items-center justify-center surface-card border border-theme rounded-2xl text-theme-muted hover:text-primary-light disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronLeft className="w-6 h-6" /></button>
  <button onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }} disabled={currentPage === totalPages} className="w-12 h-12 flex items-center justify-center surface-card border border-theme rounded-2xl text-theme-muted hover:text-primary-light disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronRight className="w-6 h-6" /></button>
  </div>
  </div>
  )}
 </div>
 </div>
 )
}
