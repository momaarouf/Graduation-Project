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
  
  const baseClass = "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm flex items-center gap-1.5"
  
  if (isCritical) return (
    <span className={`${baseClass} bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30`}>
      <AlertCircle className="w-3 h-3" />
      {action.replace(/_/g, ' ')}
    </span>
  )
  
  if (isPositive) return (
    <span className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30`}>
      <Activity className="w-3 h-3" />
      {action.replace(/_/g, ' ')}
    </span>
  )
  
  return (
    <span className={`${baseClass} bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30`}>
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
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Trail</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Immutable log of all administrative and system actions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => fetchLogs(currentPage)}
            className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Administrator</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Action Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {isLoading ? (
                Array(pageSize).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {new Date(event.createdAtUtc).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                          {event.adminEmail?.[0].toUpperCase() || 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {event.adminEmail?.split('@')[0] || 'System'}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate tracking-tight uppercase font-medium">
                             {event.adminEmail ? 'Admin' : 'Auto'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ActionBadge action={event.action} />
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                        "{event.summary}"
                      </p>
                      {event.detailsJson && (
                        <div className="mt-1.5 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-[10px] text-gray-400 font-mono line-clamp-1 group-hover:line-clamp-none transition-all border border-gray-100 dark:border-gray-800">
                          {event.detailsJson}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-block px-2 py-1 rounded bg-gray-50 dark:bg-gray-800 text-[10px] font-bold text-gray-500 uppercase">
                        {event.targetType} #{event.targetId}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <History className="w-12 h-12 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No audit events match your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {auditPage && (
          <div className="p-5 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="text-gray-900 dark:text-white">{filteredEvents.length}</span> of <span className="text-gray-900 dark:text-white">{auditPage.totalElements}</span> entries
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 0 || isLoading}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1 px-4">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md">
                  {currentPage + 1}
                </span>
                <span className="text-xs text-gray-400">/</span>
                <span className="text-xs text-gray-500 font-medium">
                  {auditPage.totalPages}
                </span>
              </div>

              <button 
                disabled={currentPage >= auditPage.totalPages - 1 || isLoading}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
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