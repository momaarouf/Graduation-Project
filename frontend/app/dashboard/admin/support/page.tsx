'use client'

import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MoreVertical,
  Mail,
  User,
  Tag,
  Eye,
  Check,
  X,
  Send,
  ArrowLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  adminGetSupportTickets, 
  adminUpdateSupportTicketStatus,
  adminSendSupportMessage,
  AdminSupportTicketResponse 
} from '@/src/lib/api/admin'
import { SupportMessageResponse } from '@/src/lib/api/support'

import toast from 'react-hot-toast'
// Native date formatting replaces date-fns to reduce dependencies

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<AdminSupportTicketResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('ALL')
  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicketResponse | null>(null)
  const [chatMessages, setChatMessages] = useState<SupportMessageResponse[]>([])
  const [replyMessage, setReplyMessage] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])



  const fetchTickets = async () => {
    try {
      setLoading(true)
      const data = await adminGetSupportTickets()
      setTickets(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }



  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim() || isSending) return

    try {
      setIsSending(true)
      await adminSendSupportMessage(selectedTicket.id, replyMessage)
      setReplyMessage('')
      toast.success('Reply sent')
    } catch (error) {
      toast.error('Failed to send reply')
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: AdminSupportTicketResponse['status']) => {
    try {
      setIsUpdating(true)
      const updated = await adminUpdateSupportTicketStatus(id, status, adminNote)
      setTickets(prev => prev.map(t => t.id === id ? updated : t))
      setSelectedTicket(updated)
      toast.success(`Ticket status updated to ${status}`)
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredTickets = (Array.isArray(tickets) ? tickets : []).filter(ticket => {
    const matchesSearch = 
      ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800'
      case 'IN_PROGRESS': return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800'
      case 'RESOLVED': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800'
      case 'CLOSED': return 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-950/30 dark:border-slate-800'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 dark:text-red-400'
      case 'HIGH': return 'text-orange-600 dark:text-orange-400'
      case 'MEDIUM': return 'text-amber-600 dark:text-amber-400'
      case 'LOW': return 'text-emerald-600 dark:text-emerald-400'
      default: return 'text-slate-600'
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-20">
      {/* Header - Only show if no ticket selected on mobile or if on desktop */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Support Tickets</h1>
          <p className="text-theme-secondary">Manage and respond to user inquiries</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchTickets}
            className="p-2 surface-card border border-theme rounded-lg text-theme-muted hover:text-primary-light transition-colors"
          >
            <Clock className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters - Only show if no ticket selected on mobile or if on desktop */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${selectedTicket ? 'hidden lg:grid' : 'grid'}`}>
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            placeholder="Search by name, email or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 surface-card border border-theme rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark transition-all"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-4 py-2.5 surface-card border border-theme rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
        {/* Ticket List - Hidden on mobile if ticket selected */}
        <div className={`lg:col-span-5 space-y-4 ${selectedTicket ? 'hidden lg:block' : 'block'}`}>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-32 surface-card rounded-2xl animate-pulse" />
            ))
          ) : filteredTickets.length === 0 ? (
            <div className="surface-card rounded-2xl p-12 text-center border border-theme">
              <MessageSquare className="w-12 h-12 text-theme-muted mx-auto mb-4" />
              <p className="text-theme-secondary">No support tickets found.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                layoutId={`ticket-${ticket.id}`}
                onClick={() => {
                  setSelectedTicket(ticket)
                  setAdminNote(ticket.adminNote || '')
                }}
                className={`group surface-card border transition-all cursor-pointer rounded-2xl overflow-hidden ${
                  selectedTicket?.id === ticket.id 
                    ? 'border-primary-light dark:border-primary-dark shadow-lg ring-1 ring-primary-light/20' 
                    : 'border-theme hover:border-primary-light/50 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                        <Tag className="w-3 h-3" />
                        {ticket.priority}
                      </span>
                    </div>
                    <span className="text-[10px] text-theme-muted">
                      {new Date(ticket.createdAtUtc).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-theme-primary mb-1 line-clamp-1">{ticket.subject}</h3>
                  <div className="flex items-center gap-4 text-xs text-theme-secondary">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{ticket.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary-light font-medium">
                      <Mail className="w-3 h-3" />
                      <span className="line-clamp-1">{ticket.email}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Ticket Details - Hidden on mobile if no ticket selected */}
        <div className={`lg:col-span-7 h-full ${!selectedTicket ? 'hidden lg:block' : 'block'}`}>
          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div
                key={selectedTicket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="surface-card border border-theme rounded-2xl overflow-hidden shadow-xl sticky top-24"
              >
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-[#c8d8f8] dark:border-[#1a3566] flex items-center justify-between bg-theme-base/50">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Back button for mobile */}
                    <button 
                      onClick={() => setSelectedTicket(null)}
                      className="lg:hidden p-2 -ml-2 surface-section rounded-xl border border-theme text-theme-muted hover:text-primary-light transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="hidden sm:flex w-12 h-12 rounded-xl surface-section items-center justify-center border border-theme">
                      <MessageSquare className="w-6 h-6 text-primary-light" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-theme-muted font-bold tracking-normal">TICKET #{selectedTicket.id}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getStatusColor(selectedTicket.status)}`}>
                          {selectedTicket.status}
                        </span>
                      </div>
                      <h2 className="text-lg font-black text-theme-primary">{selectedTicket.subject}</h2>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 hover:surface-section rounded-lg transition-colors text-theme-muted"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-8 space-y-8">
                  {/* User Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 surface-section rounded-xl border border-theme">
                      <span className="text-[10px] font-black text-theme-muted capitalize tracking-normal block mb-1">From</span>
                      <p className="font-bold text-theme-primary">{selectedTicket.name}</p>
                      <p className="text-xs text-theme-secondary font-medium">{selectedTicket.email}</p>
                    </div>
                    <div className="p-4 surface-section rounded-xl border border-theme">
                      <span className="text-[10px] font-black text-theme-muted capitalize tracking-normal block mb-1">Submitted</span>
                      <p className="font-bold text-theme-primary">{new Date(selectedTicket.createdAtUtc).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-xs text-theme-secondary font-medium">{new Date(selectedTicket.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short', hour12: false })}</p>
                    </div>
                  </div>

                  {/* Original Message */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-theme-muted capitalize tracking-normal block mb-1">User Message</span>
                    <div className="p-4 sm:p-6 surface-section rounded-2xl border border-theme text-theme-primary leading-relaxed shadow-inner">
                      {selectedTicket.message}
                    </div>
                  </div>

                  {/* Reply Area */}
                  {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                    <div className="space-y-3 bg-theme-base/30 p-4 sm:p-5 rounded-2xl border border-theme shadow-inner">
                      <span className="text-[10px] font-black text-theme-muted capitalize tracking-normal block">Email Reply to User</span>
                      <textarea 
                        rows={4}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Draft your reply here... (This will be emailed directly to the user)"
                        className="w-full px-4 py-3 surface-card border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light resize-none"
                      />
                      <div className="flex justify-end">
                        <button 
                          onClick={async () => {
                            await handleSendReply()
                            // Automatically resolve the ticket after replying
                            await handleUpdateStatus(selectedTicket.id, 'RESOLVED')
                          }}
                          disabled={isSending || !replyMessage.trim()}
                          className="px-6 py-2.5 bg-primary-light text-white font-medium rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Send Reply & Resolve
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="space-y-4 pt-6 border-t border-[#c8d8f8] dark:border-[#1a3566]">
                    <div>
                      <label className="text-[10px] font-black text-theme-muted capitalize tracking-normal block mb-2">Resolution Notes</label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Add internal notes about this ticket..."
                        className="w-full px-4 py-3 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light min-h-[100px] resize-none shadow-inner"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                        disabled={isUpdating || selectedTicket.status === 'IN_PROGRESS'}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] capitalize tracking-normal rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
                      >
                        <Clock className="w-4 h-4" />
                        <span>In Progress</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}
                        disabled={isUpdating || selectedTicket.status === 'RESOLVED'}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] capitalize tracking-normal rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
                      >
                        <Check className="w-4 h-4" />
                        <span>Resolve</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedTicket.id, 'CLOSED')}
                        disabled={isUpdating || selectedTicket.status === 'CLOSED'}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-black text-[10px] capitalize tracking-normal rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-slate-700/20"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Close</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 surface-card rounded-[2.5rem] border-2 border-dashed border-theme shadow-sm opacity-60">
                <div className="w-20 h-20 bg-surface-section rounded-2xl flex items-center justify-center mb-6">
                  <Eye className="w-10 h-10 text-theme-muted" />
                </div>
                <h3 className="text-xl font-black text-theme-primary capitalize tracking-tight">Select Ticket</h3>
                <p className="text-sm text-theme-muted max-w-xs mt-2 font-medium">Select a support inquiry from the list to view full manifest and execute resolution protocol.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
