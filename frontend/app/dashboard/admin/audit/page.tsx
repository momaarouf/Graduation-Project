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
 Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminGetAuditEvents } from '@/src/lib/api/admin'
import { AuditEventResponse, AuditPage } from '@/src/lib/api/admin'
import { toast } from 'react-hot-toast'

// ==================== SEVERITY/CATEGORY BADGES ====================

const ActionBadge = ({ action }: { action: string }) => {
 const isCritical = action.includes('BAN') || action.includes('SUSPEND') || action.includes('REJECT')
 const isPositive = action.includes('APPROVE') || action.includes('ACTIVATE') || action.includes('RESET')
 
 const baseClass ="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm flex items-center gap-1.5"
 
 if (isCritical) return (
 <span className={`${baseClass} bg-danger-red/10 text-red-700 border-danger-red dark:bg-red-900/20 dark:text-red-400 dark:border-danger-red/30`}>
 <AlertCircle className="w-3 h-3" />
 {action.replace(/_/g, ' ')}
 </span>
 )
 
 if (isPositive) return (
 <span className={`${baseClass} bg-success-green/10 text-emerald-700 border-success-green dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-success-green/30`}>
 <Activity className="w-3 h-3" />
 {action.replace(/_/g, ' ')}
 </span>
 )
 
 return (
 <span className={`${baseClass} bg-primary-light/10 text-blue-700 border-primary-light dark:border-primary-dark dark:text-primary-dark dark:border-primary-light dark:border-primary-dark/30`}>
 <Clock className="w-3 h-3" />
 {action.replace(/_/g, ' ')}
 </span>
 )
}

// ==================== AUDIT PAGE ====================

export default function AdminAuditPage() {
 const [auditPage, setAuditPage] = useState<AuditPage | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const [currentPage, setCurrentPage] = useState(0)
 const [pageSize] = useState(15)
 const [searchTerm, setSearchTerm] = useState('')

 const fetchLogs = async (page: number) => {
 try {
 setIsLoading(true)
 const data = await adminGetAuditEvents(page, pageSize)
 setAuditPage(data)
 } catch (err) {
 console.error('Failed to fetch audit logs:', err)
 toast.error('Failed to load audit trail')
 } finally {
 setIsLoading(false)
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
 e.targetType.toLowerCase().includes(term)
 )
 }, [auditPage, searchTerm])

 return (
 <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <div className="p-2 bg-primary-light/20 dark:bg-primary-dark/20 rounded-lg">
 <History className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 </div>
 <h1 className="text-2xl font-bold text-theme-primary">Audit Trail</h1>
 </div>
 <p className="text-theme-muted text-sm">
 Immutable log of all administrative and system actions
 </p>
 </div>
 
 <div className="flex items-center gap-3">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input 
 type="text" 
 placeholder="Filter logs..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-10 pr-4 py-2 surface-card border border-theme rounded-xl text-sm focus:ring-2 focus:ring-primary-light dark:ring-primary-dark outline-none w-64 shadow-sm"
 />
 </div>
 <button 
 onClick={() => fetchLogs(currentPage)}
 className="p-2 surface-card border border-theme rounded-xl hover:surface-section dark:hover:surface-card transition-colors shadow-sm"
 >
 <RefreshCw className={`w-4 h-4 text-theme-muted ${isLoading ? 'animate-spin' : ''}`} />
 </button>
 </div>
 </div>

 {/* Main Table Container */}
 <div className="surface-card rounded-2xl border border-theme shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="surface-section border-b border-theme">
 <th className="px-6 py-4 text-[11px] font-bold text-theme-muted uppercase tracking-widest">Timestamp</th>
 <th className="px-6 py-4 text-[11px] font-bold text-theme-muted uppercase tracking-widest">Administrator</th>
 <th className="px-6 py-4 text-[11px] font-bold text-theme-muted uppercase tracking-widest">Action Type</th>
 <th className="px-6 py-4 text-[11px] font-bold text-theme-muted uppercase tracking-widest">Description</th>
 <th className="px-6 py-4 text-[11px] font-bold text-theme-muted uppercase tracking-widest text-right">Target</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
 {isLoading ? (
 Array(pageSize).fill(0).map((_, i) => (
 <tr key={i}>
 {Array(5).fill(0).map((_, j) => (
 <td key={j} className="px-6 py-4">
 <div className="h-4 surface-section animate-pulse rounded" />
 </td>
 ))}
 </tr>
 ))
 ) : filteredEvents.length > 0 ? (
 filteredEvents.map((event) => (
 <tr key={event.id} className="hover:bg-primary-light/50 dark:hover:surface-base transition-colors group">
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <Calendar className="w-3.5 h-3.5 text-theme-muted" />
 <span className="text-xs font-medium text-theme-secondary ">
 {new Date(event.createdAtUtc).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
 </span>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2.5">
 <div className="w-7 h-7 rounded-full bg-primary-light/20 dark:bg-primary-dark/20 flex items-center justify-center text-[10px] font-bold text-primary-light dark:text-primary-dark dark:text-primary-dark border border-primary-light dark:border-primary-dark/50 dark:border-primary-light dark:border-primary-dark/50">
 {event.adminEmail?.[0].toUpperCase() || 'S'}
 </div>
 <div className="min-w-0">
 <p className="text-xs font-semibold text-theme-primary truncate">
 {event.adminEmail?.split('@')[0] || 'System'}
 </p>
 <p className="text-[10px] text-theme-muted truncate tracking-tight uppercase font-medium">
 {event.adminEmail ? 'Admin' : 'Auto'}
 </p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <ActionBadge action={event.action} />
 </td>
 <td className="px-6 py-4 max-w-sm">
 <p className="text-xs text-theme-secondary leading-relaxed italic">
"{event.summary}"
 </p>
 {event.detailsJson && (
 <div className="mt-1.5 p-2 surface-section rounded-lg text-[10px] text-theme-muted font-mono line-clamp-1 group-hover:line-clamp-none transition-all border border-theme">
 {event.detailsJson}
 </div>
 )}
 </td>
 <td className="px-6 py-4 text-right">
 <div className="inline-block px-2 py-1 rounded surface-section text-[10px] font-bold text-theme-muted uppercase">
 {event.targetType} #{event.targetId}
 </div>
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={5} className="px-6 py-12 text-center">
 <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
 <p className="text-theme-muted text-sm font-medium">No audit events match your search.</p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination Footer */}
 {auditPage && (
 <div className="p-5 surface-section border-t border-theme flex items-center justify-between">
 <div className="text-xs text-theme-muted font-medium">
 Showing <span className="text-theme-primary">{filteredEvents.length}</span> of <span className="text-theme-primary">{auditPage.totalElements}</span> entries
 </div>
 
 <div className="flex items-center gap-1">
 <button 
 disabled={currentPage === 0 || isLoading}
 onClick={() => setCurrentPage(p => p - 1)}
 className="p-2 rounded-lg hover:surface-card dark:hover:surface-card disabled:opacity-30 transition-all border border-transparent hover:border-theme dark:hover:border-theme-strong"
 >
 <ChevronLeft className="w-4 h-4" />
 </button>
 
 <div className="flex items-center gap-1 px-4">
 <span className="text-xs font-bold text-primary-light dark:text-primary-dark bg-primary-light/10 px-2.5 py-1 rounded-md">
 {currentPage + 1}
 </span>
 <span className="text-xs text-theme-muted">/</span>
 <span className="text-xs text-theme-muted font-medium">
 {auditPage.totalPages}
 </span>
 </div>

 <button 
 disabled={currentPage >= auditPage.totalPages - 1 || isLoading}
 onClick={() => setCurrentPage(p => p + 1)}
 className="p-2 rounded-lg hover:surface-card dark:hover:surface-card disabled:opacity-30 transition-all border border-transparent hover:border-theme dark:hover:border-theme-strong"
 >
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 )
}