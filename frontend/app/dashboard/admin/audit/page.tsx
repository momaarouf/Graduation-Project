'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
 History, 
 Search, 
 Filter, 
 Download, 
 ChevronLeft, 
 ChevronRight, 
 Clock,
 User,
 AlertCircle,
 FileText,
 RefreshCw,
 Calendar,
 MoreVertical,
 Activity,
 ArrowUpDown,
 Fingerprint,
 Shield,
 Terminal
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminGetAuditEvents } from '@/src/lib/api/admin'
import { AuditEventResponse, AuditPage } from '@/src/lib/api/admin'
import { toast } from 'react-hot-toast'

// ============================================================================
// STATUS BADGES
// ============================================================================

const ActionBadge = ({ action }: { action: string }) => {
 const isCritical = action.includes('BAN') || action.includes('SUSPEND') || action.includes('REJECT') || action.includes('DELETE')
 const isPositive = action.includes('APPROVE') || action.includes('ACTIVATE') || action.includes('RESET') || action.includes('CREATE')
 
 const styles = isCritical 
  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200' 
  : isPositive 
  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200'
  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200'

 const Icon = isCritical ? AlertCircle : isPositive ? CheckCircleIcon : Clock

 return (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${styles}`}>
   <Icon className="w-3 h-3" />
   {action.replace(/_/g, ' ')}
  </span>
 )
}

const CheckCircleIcon = (props: any) => (
 <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
 </svg>
)

// ============================================================================
// AUDIT DETAIL PARSER
// ============================================================================

const AuditDetailRenderer = ({ json }: { json?: string }) => {
 if (!json) return null
 
 try {
  const data = JSON.parse(json)
  const entries = Object.entries(data)
  
  // Group by field (removing 'old' and 'new' prefixes)
  const groups: Record<string, { old: any, new: any }> = {}
  
  entries.forEach(([key, value]) => {
   let fieldName = key
   let type: 'old' | 'new' | 'other' = 'other'
   
   if (key.startsWith('old')) {
    fieldName = key.substring(3)
    type = 'old'
   } else if (key.startsWith('new')) {
    fieldName = key.substring(3)
    type = 'new'
   }
   
   if (!groups[fieldName]) groups[fieldName] = { old: undefined, new: undefined }
   if (type === 'old') groups[fieldName].old = value
   if (type === 'new') groups[fieldName].new = value
   if (type === 'other') groups[fieldName].new = value // Treat as new if no prefix
  })

  return (
   <div className="flex flex-wrap gap-2 mt-2">
    {Object.entries(groups).map(([field, values]) => {
     const hasChange = values.old !== values.new
     if (!hasChange && values.old === null) return null // Skip null-to-null
     
     return (
      <div key={field} className="px-2 py-1 bg-black/5 dark:bg-white/5 rounded-lg border border-theme flex items-center gap-2">
       <span className="text-[9px] font-black text-theme-muted uppercase tracking-widest">{field}:</span>
       <div className="flex items-center gap-1.5">
        {values.old !== undefined && (
         <span className="text-[10px] font-bold text-danger-red line-through opacity-60">
          {values.old === null ? 'null' : String(values.old)}
         </span>
        )}
        <ChevronRight className="w-2.5 h-2.5 text-theme-muted" />
        <span className="text-[10px] font-black text-green-600 dark:text-green-400">
         {values.new === null ? 'null' : String(values.new)}
        </span>
       </div>
      </div>
     )
    })}
   </div>
  )
 } catch (e) {
  return <pre className="text-[9px] font-mono opacity-60">{json}</pre>
 }
}

// ============================================================================
// MOBILE CARD
// ============================================================================

function AuditMobileCard({ event }: { event: AuditEventResponse }) {
 return (
  <motion.div 
   initial={{ opacity: 0, y: 10 }}
   animate={{ opacity: 1, y: 0 }}
   className="surface-card rounded-[2rem] border border-theme p-6 space-y-4 shadow-sm active:scale-[0.98] transition-all"
  >
   <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
     <Calendar className="w-3.5 h-3.5 text-theme-muted" />
     <span className="text-[10px] font-black text-theme-muted uppercase tracking-widest">
      {new Date(event.createdAtUtc).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
     </span>
    </div>
    <span className="px-2 py-0.5 surface-section border border-theme rounded-lg text-[9px] font-black text-theme-muted uppercase tracking-widest">
     {event.targetType} #{event.targetId}
    </span>
   </div>
   
   <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-2xl bg-primary-light/10 flex items-center justify-center text-primary-light border border-primary-light/20 shadow-sm">
     {event.adminEmail ? <Shield className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
    </div>
    <div className="flex-1 min-w-0">
     <p className="text-sm font-black text-theme-primary truncate">
      {event.adminEmail?.split('@')[0] || 'System Core'}
     </p>
     <div className="mt-1 flex items-center gap-2">
      <ActionBadge action={event.action} />
     </div>
    </div>
   </div>
   
   <div className="p-4 surface-section rounded-2xl border border-theme/50 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full bg-primary-light opacity-10" />
    <p className="text-xs font-medium text-theme-secondary leading-relaxed italic">
     "{event.summary}"
    </p>
    <AuditDetailRenderer json={event.detailsJson} />
   </div>
  </motion.div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminAuditPage() {
 const [auditPage, setAuditPage] = useState<AuditPage | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const [isRefreshing, setIsRefreshing] = useState(false)
 const [currentPage, setCurrentPage] = useState(0)
 const [pageSize] = useState(15)
 const [searchTerm, setSearchTerm] = useState('')

 const fetchLogs = async (page: number) => {
  try {
   setIsRefreshing(true)
   const data = await adminGetAuditEvents(page, pageSize)
   setAuditPage(data)
  } catch (err) {
   toast.error('Failed to load audit trail')
  } finally {
   setIsLoading(false)
   setIsRefreshing(false)
  }
 }

 useEffect(() => {
  fetchLogs(currentPage)
 }, [currentPage])

 const filteredEvents = useMemo(() => {
  if (!auditPage) return []
  if (!searchTerm) return auditPage.content

  const term = searchTerm.toLowerCase()
  return auditPage.content.filter(e => 
   e.action.toLowerCase().includes(term) ||
   e.summary.toLowerCase().includes(term) ||
   e.adminEmail?.toLowerCase().includes(term) ||
   e.targetType.toLowerCase().includes(term) ||
   e.targetId?.toString().includes(term)
  )
 }, [auditPage, searchTerm])

 if (isLoading) {
  return (
   <div className="flex flex-col items-center justify-center py-40 gap-6">
    <div className="relative">
     <RefreshCw className="w-16 h-16 text-primary-light animate-spin opacity-10" />
     <History className="absolute inset-0 m-auto w-6 h-6 text-primary-light" />
    </div>
    <div className="text-center">
     <h2 className="text-sm font-black uppercase tracking-[0.3em] text-theme-primary">Synchronizing Ledger</h2>
     <p className="text-xs text-theme-muted mt-2 animate-pulse">Retrieving immutable audit records...</p>
    </div>
   </div>
  )
 }

 return (
  <div className="space-y-8 pb-20">
   {/* Header Section */}
   <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
    <div className="space-y-2">
     <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-theme-primary dark:bg-surface-section rounded-2xl flex items-center justify-center shadow-xl text-theme-reverse">
       <History className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-black text-primary-light uppercase tracking-[0.2em] bg-primary-light/10 px-3 py-1 rounded-xl border border-primary-light/10">Audit Authority</span>
     </div>
     <h1 className="text-3xl sm:text-4xl font-black text-theme-primary tracking-tighter">
      System <span className="text-primary-light">Audit Trail</span>
     </h1>
     <p className="text-sm text-theme-muted max-w-lg font-medium">
      A transparent, immutable log of all administrative interventions and core system state changes.
     </p>
    </div>
    
    <div className="flex items-center gap-4">
     <div className="px-6 py-4 surface-card rounded-[2rem] border border-theme shadow-sm flex flex-col items-center min-w-[120px] border-b-4 border-b-primary-light">
      <span className="text-[8px] font-black text-theme-muted uppercase tracking-widest mb-1">Total Records</span>
      <span className="text-2xl font-black text-theme-primary">{auditPage?.totalElements || 0}</span>
     </div>
     <button 
      onClick={() => fetchLogs(currentPage)}
      disabled={isRefreshing}
      className="p-4 surface-card hover:bg-primary-light hover:text-white border border-theme rounded-[1.5rem] transition-all active:scale-90 shadow-sm disabled:opacity-50"
     >
      <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
     </button>
    </div>
   </div>

   {/* Search & Intelligence */}
   <div className="relative group">
    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted group-focus-within:text-primary-light transition-colors" />
    <input 
     type="text" 
     placeholder="Search by Action, Description, ID or Admin..."
     value={searchTerm}
     onChange={(e) => setSearchTerm(e.target.value)}
     className="w-full h-16 pl-16 pr-6 surface-card border-2 border-theme rounded-[2rem] text-sm font-bold text-theme-primary shadow-xl focus:ring-4 focus:ring-primary-light/10 focus:border-primary-light transition-all placeholder-theme-muted/50"
    />
   </div>

   {/* Listing View */}
   <div className="space-y-4">
    {/* Mobile Card List */}
    <div className="lg:hidden space-y-4">
     {filteredEvents.map((event) => (
      <AuditMobileCard key={event.id} event={event} />
     ))}
    </div>

    {/* Desktop Table View */}
    <div className="hidden lg:block surface-card rounded-[2.5rem] border border-theme shadow-sm overflow-hidden">
     <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
       <thead>
        <tr className="surface-section border-b border-theme">
         {['Timestamp', 'Authority', 'Protocol', 'Manifest', 'Subject'].map(h => (
          <th key={h} className="px-8 py-5 text-[10px] font-black text-theme-muted uppercase tracking-[0.2em]">{h}</th>
         ))}
        </tr>
       </thead>
       <tbody className="divide-y divide-theme">
        {filteredEvents.map((event) => (
         <tr key={event.id} className="hover:surface-section transition-colors group">
          <td className="px-8 py-5">
           <div className="flex flex-col">
            <span className="text-xs font-bold text-theme-primary">
             {new Date(event.createdAtUtc).toLocaleDateString([], { dateStyle: 'medium' })}
            </span>
            <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mt-0.5">
             {new Date(event.createdAtUtc).toLocaleTimeString([], { timeStyle: 'short' })}
            </span>
           </div>
          </td>
          <td className="px-8 py-5">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-light/10 flex items-center justify-center text-primary-light border border-primary-light/20">
             {event.adminEmail ? <Shield className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
             <p className="text-sm font-black text-theme-primary truncate">
              {event.adminEmail?.split('@')[0] || 'SYSTEM'}
             </p>
             <p className="text-[9px] font-black text-theme-muted uppercase tracking-widest">
              {event.adminEmail ? 'Manual Intervention' : 'Automatic Trigger'}
             </p>
            </div>
           </div>
          </td>
          <td className="px-8 py-5">
           <ActionBadge action={event.action} />
          </td>
          <td className="px-8 py-5 max-w-md">
           <div className="space-y-2">
            <p className="text-xs font-medium text-theme-secondary leading-relaxed italic">
             "{event.summary}"
            </p>
            <AuditDetailRenderer json={event.detailsJson} />
           </div>
          </td>
          <td className="px-8 py-5 text-right">
           <div className="inline-flex flex-col items-end">
            <span className="px-3 py-1 bg-black/5 dark:bg-black/20 border border-theme rounded-lg text-[9px] font-black text-theme-muted uppercase tracking-widest">
             {event.targetType}
            </span>
            <span className="text-[10px] font-black text-primary-light mt-1.5">ID-{event.targetId}</span>
           </div>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>

     {/* Empty State */}
     {filteredEvents.length === 0 && (
      <div className="py-24 text-center">
       <div className="w-20 h-20 bg-surface-section rounded-[2rem] flex items-center justify-center mx-auto mb-6">
        <Activity className="w-10 h-10 opacity-20" />
       </div>
       <h3 className="text-xl font-black text-theme-primary uppercase tracking-tight">No Events Recorded</h3>
       <p className="text-sm text-theme-muted mt-2 max-w-xs mx-auto font-medium">No audit activities match your current search parameters in this temporal window.</p>
      </div>
     )}

     {/* Pagination Footer */}
     {auditPage && (
      <div className="px-8 py-6 surface-section border-t border-theme flex flex-col sm:flex-row items-center justify-between gap-4">
       <div className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em]">
        Inventory: <span className="text-theme-primary">{filteredEvents.length}</span> / {auditPage.totalElements} Records
       </div>
       
       <div className="flex items-center gap-2">
        <button 
         disabled={currentPage === 0 || isRefreshing}
         onClick={() => setCurrentPage(p => p - 1)}
         className="p-3 surface-card rounded-xl border border-theme hover:bg-primary-light hover:text-white disabled:opacity-30 transition-all active:scale-90"
        >
         <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1.5 px-4 h-10 surface-card border border-theme rounded-xl">
         <span className="text-xs font-black text-primary-light">{currentPage + 1}</span>
         <span className="text-[10px] font-black text-theme-muted opacity-30">/</span>
         <span className="text-xs font-black text-theme-muted">{auditPage.totalPages}</span>
        </div>

        <button 
         disabled={currentPage >= auditPage.totalPages - 1 || isRefreshing}
         onClick={() => setCurrentPage(p => p + 1)}
         className="p-3 surface-card rounded-xl border border-theme hover:bg-primary-light hover:text-white disabled:opacity-30 transition-all active:scale-90"
        >
         <ChevronRight className="w-4 h-4" />
        </button>
       </div>
      </div>
     )}
    </div>
   </div>
  </div>
 )
}
