'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import {
 DollarSign, CreditCard, Banknote, Wallet, TrendingUp, TrendingDown,
 CheckCircle, XCircle, Clock, Calendar, Mail, Phone, User, Users,
 Search, Filter, ChevronLeft, ChevronRight, RefreshCw, Eye, FileText,
 Download, Printer, ArrowUpDown, MoreVertical, X, Info, Shield, Award,
 Ban, Globe, Percent, Plus, Edit, Save, Loader2
} from 'lucide-react'
import { adminGetPayouts, adminGetPayoutSummary, adminUpdateGuideFeeMultiplier, AdminPayoutResponse, AdminPayoutSummaryResponse } from '@/src/lib/api/admin'
import toast from 'react-hot-toast'
import AdminPayoutsSkeleton from './skeleton'

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge = ({ status }: { status: AdminPayoutResponse['status'] }) => {
 const styles = {
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200',
  frozen: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200',
  processing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200',
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200',
  failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200',
  cancelled: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200'
 }

 const icons = {
  pending: Clock,
  frozen: Shield,
  processing: RefreshCw,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: Ban
 }

 const Icon = icons[status] || Info

 return (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold capitalize tracking-normal rounded-full border ${styles[status]}`}>
   <Icon className="w-3 h-3" />
   {status}
  </span>
 )
}

// ============================================================================
// PAYOUT METHOD BADGE
// ============================================================================

const MethodBadge = ({ method }: { method: AdminPayoutResponse['method'] }) => {
 const styles = {
  whish: 'text-purple-600 dark:text-purple-400',
  bank: 'text-blue-600 dark:text-blue-400',
  paypal: 'text-sky-600 dark:text-sky-400',
  card: 'text-emerald-600 dark:text-emerald-400',
  stripe: 'text-indigo-600 dark:text-indigo-400'
 }

 const icons = {
  whish: Wallet,
  bank: Banknote,
  paypal: CreditCard,
  card: CreditCard,
  stripe: Globe
 }

 const Icon = (icons as any)[method] || Banknote

 return (
  <div className="flex items-center gap-1.5">
   <Icon className={`w-3.5 h-3.5 ${(styles as any)[method]}`} />
   <span className="text-xs font-medium capitalize text-theme-secondary">{method}</span>
  </div>
 )
}

// ============================================================================
// DETAILS MODAL
// ============================================================================

const PayoutDetailsModal = ({ isOpen, onClose, payout }: { isOpen: boolean, onClose: () => void, payout: AdminPayoutResponse }) => {
 if (!isOpen) return null

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
   <div className="w-full max-w-2xl surface-card rounded-3xl shadow-2xl overflow-hidden border border-theme animate-in fade-in zoom-in duration-200">
    {/* Header */}
    <div className="bg-gradient-to-r from-primary-light to-primary-dark p-6 text-white">
     <div className="flex justify-between items-start">
      <div>
       <p className="text-[10px] font-black capitalize tracking-[0.2em] opacity-80 mb-1">Transaction Receipt</p>
       <h3 className="text-2xl font-black">{payout.payoutId}</h3>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
       <X className="w-6 h-6" />
      </button>
     </div>
    </div>

    <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
     {/* Guide & Status */}
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 surface-section rounded-2xl border border-theme">
      <div className="flex items-center gap-4">
       <div className="w-12 h-12 rounded-2xl bg-primary-light/10 flex items-center justify-center font-black text-primary-light text-xl border border-primary-light/20">
        {payout.guideName.charAt(0)}
       </div>
       <div>
        <h4 className="font-bold text-theme-primary">{payout.guideName}</h4>
        <p className="text-xs text-theme-muted">{payout.guideEmail}</p>
       </div>
      </div>
      <StatusBadge status={payout.status} />
     </div>

     {/* Financials */}
     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 surface-section rounded-2xl border border-theme">
       <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1">Gross Amount</p>
       <p className="text-xl font-black text-theme-primary">{payout.currency} {payout.amount.toLocaleString()}</p>
      </div>
      <div className="p-4 surface-section rounded-2xl border border-theme">
       <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1">Platform Fee</p>
       <p className="text-xl font-black text-danger-red">-{payout.currency} {payout.platformFee.toLocaleString()}</p>
      </div>
      <div className="p-4 bg-primary-light/5 border border-primary-light/20 rounded-2xl">
       <p className="text-[10px] font-black text-primary-light capitalize tracking-normal mb-1">Net Earnings</p>
       <p className="text-xl font-black text-primary-light">{payout.currency} {payout.guideEarnings.toLocaleString()}</p>
      </div>
     </div>

     {/* Metadata */}
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="space-y-4">
       <h5 className="text-[10px] font-black text-theme-muted capitalize tracking-normal">Payout Details</h5>
       <div className="space-y-2">
        <div className="flex justify-between text-xs">
         <span className="text-theme-muted">Method</span>
         <MethodBadge method={payout.method} />
        </div>
        <div className="flex justify-between text-xs">
         <span className="text-theme-muted">Account</span>
         <span className="font-bold text-theme-primary">{payout.methodDetails}</span>
        </div>
        <div className="flex justify-between text-xs">
         <span className="text-theme-muted">Fee Multiplier</span>
         <span className="font-bold text-theme-primary">x{payout.feeMultiplier}</span>
        </div>
       </div>
      </div>

      <div className="space-y-4">
       <h5 className="text-[10px] font-black text-theme-muted capitalize tracking-normal">Timeline</h5>
       <div className="space-y-2 text-xs">
        <div className="flex justify-between">
         <span className="text-theme-muted">Requested</span>
         <span className="text-theme-primary">{new Date(payout.requestedAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
         <span className="text-theme-muted">Estimated Release</span>
         <span className="text-theme-primary">{payout.estimatedRelease ? new Date(payout.estimatedRelease).toLocaleString() : 'N/A'}</span>
        </div>
        {payout.completedAt && (
         <div className="flex justify-between">
          <span className="text-theme-muted">Completed</span>
          <span className="text-green-600 font-bold">{new Date(payout.completedAt).toLocaleString()}</span>
         </div>
        )}
       </div>
      </div>
     </div>

     {/* Tour Connection */}
     <div className="p-4 surface-section rounded-2xl border border-theme flex items-center justify-between">
      <div className="flex items-center gap-3">
       <Globe className="w-5 h-5 text-primary-light" />
       <div>
        <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal">Linked Tour</p>
        <p className="text-sm font-bold text-theme-primary truncate max-w-[200px]">{payout.tourTitle || 'Custom Adjustment'}</p>
       </div>
      </div>
      <p className="text-[10px] font-bold text-theme-muted">ID: {payout.bookingId || 'N/A'}</p>
     </div>
    </div>
   </div>
  </div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminPayoutPage() {
 const [payouts, setPayouts] = useState<AdminPayoutResponse[]>([])
 const [summary, setSummary] = useState<AdminPayoutSummaryResponse | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const [isRefreshing, setIsRefreshing] = useState(false)

 // Filters
 const [searchTerm, setSearchTerm] = useState('')
 const [statusFilter, setStatusFilter] = useState<string>('ALL')

 // Modals
 const [selectedPayout, setSelectedPayout] = useState<AdminPayoutResponse | null>(null)

 useEffect(() => { fetchData() }, [])

 const fetchData = async () => {
  setIsRefreshing(true)
  try {
   const [payoutsData, summaryData] = await Promise.all([
    adminGetPayouts(),
    adminGetPayoutSummary()
   ])
   setPayouts(payoutsData)
   setSummary(summaryData)
  } catch (err) {
   toast.error('Failed to load financial data')
  } finally {
   setIsLoading(false)
   setIsRefreshing(false)
  }
 }

 const filteredPayouts = useMemo(() => {
  return payouts.filter(p => {
   const matchesSearch = !searchTerm || 
    p.payoutId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.guideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.guideEmail.toLowerCase().includes(searchTerm.toLowerCase())
   
   const matchesStatus = statusFilter === 'ALL' || p.status.toUpperCase() === statusFilter
   
   return matchesSearch && matchesStatus
  })
 }, [payouts, searchTerm, statusFilter])

 if (isLoading) {
    return <AdminPayoutsSkeleton />
 }

 return (
  <div className="space-y-6 pb-20">
   {/* Header */}
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
     <h1 className="text-2xl font-black text-theme-primary capitalize tracking-tight flex items-center gap-3">
      <Wallet className="w-8 h-8 text-primary-light" />
      Payout Registry
     </h1>
     <p className="text-sm text-theme-muted">Manage financial settlements and platform fee telemetry</p>
    </div>
    <button 
     onClick={fetchData} 
     disabled={isRefreshing}
     className="px-6 py-3 bg-primary-light hover:bg-primary-light-hover text-white rounded-2xl text-xs font-black capitalize tracking-normal transition-all shadow-lg shadow-primary-light/20 active:scale-95 flex items-center gap-2"
    >
     <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
     {isRefreshing ? 'Syncing...' : 'Sync Data'}
    </button>
   </div>

   {/* Stats Grid */}
   {summary && (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
     {[
      { label: 'Frozen Funds', value: summary.totalFrozen, icon: Shield, color: 'blue', filter: 'FROZEN' },
      { label: 'Pending Payout', value: summary.totalPending, icon: Clock, color: 'amber', filter: 'PENDING' },
      { label: 'Total Volume', value: `$${summary.totalAmount.toLocaleString()}`, icon: TrendingUp, color: 'emerald', filter: 'ALL' },
      { label: 'Revenue (Fees)', value: `$${summary.totalFees.toLocaleString()}`, icon: Percent, color: 'indigo', filter: 'ALL' }
     ].map(s => (
      <button 
       key={s.label}
       onClick={() => setStatusFilter(s.filter)}
       className="p-5 surface-card border border-theme rounded-3xl text-left hover:shadow-xl transition-all group active:scale-95 border-b-4 border-b-theme hover:border-b-primary-light"
      >
       <div className={`w-10 h-10 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <s.icon className={`w-5 h-5 text-${s.color}-600 dark:text-${s.color}-400`} />
       </div>
       <p className="text-2xl font-black text-theme-primary">{s.value}</p>
       <p className="text-[10px] font-black text-theme-muted capitalize tracking-[0.1em] mt-1">{s.label}</p>
      </button>
     ))}
    </div>
   )}

   {/* Controls */}
   <div className="surface-card p-4 rounded-3xl border border-theme shadow-sm flex flex-col lg:flex-row gap-4">
    <div className="flex-1 relative">
     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
     <input 
      type="text" 
      placeholder="Search by ID, Guide, or Email..." 
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      className="w-full pl-11 pr-4 py-3 surface-section border border-theme rounded-2xl text-sm focus:ring-2 focus:ring-primary-light outline-none transition-all shadow-inner"
     />
    </div>
    <div className="flex gap-2">
     <select 
      value={statusFilter}
      onChange={e => setStatusFilter(e.target.value)}
      className="px-4 py-3 surface-section border border-theme rounded-2xl text-xs font-black capitalize tracking-normal text-theme-secondary outline-none cursor-pointer hover:border-primary-light transition-colors"
     >
      <option value="ALL">All Status</option>
      <option value="PENDING">Pending</option>
      <option value="FROZEN">Frozen</option>
      <option value="COMPLETED">Completed</option>
      <option value="FAILED">Failed</option>
     </select>
     <button 
      onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
      className="p-3 surface-section border border-theme rounded-2xl hover:bg-danger-red/10 group transition-colors"
     >
      <X className="w-4 h-4 text-theme-muted group-hover:text-danger-red" />
     </button>
    </div>
   </div>

   {/* Mobile Card View */}
   <div className="lg:hidden space-y-4">
    {filteredPayouts.map(p => (
     <div 
      key={p.id} 
      onClick={() => setSelectedPayout(p)}
      className="p-5 surface-card border border-theme rounded-3xl shadow-sm space-y-4 active:scale-[0.98] transition-transform"
     >
      <div className="flex justify-between items-start">
       <div>
        <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1">{p.payoutId}</p>
        <h4 className="font-bold text-theme-primary">{p.guideName}</h4>
       </div>
       <StatusBadge status={p.status} />
      </div>
      <div className="flex justify-between items-end">
       <div>
        <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1">Total Payout</p>
        <p className="text-xl font-black text-primary-light">{p.currency} {p.amount.toLocaleString()}</p>
       </div>
       <div className="text-right">
        <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1">Method</p>
        <MethodBadge method={p.method} />
       </div>
      </div>
     </div>
    ))}
   </div>

   {/* Desktop Table View */}
   <div className="hidden lg:block surface-card rounded-3xl border border-theme overflow-hidden shadow-sm">
    <table className="w-full border-collapse">
     <thead>
      <tr className="surface-section border-b border-theme">
       {['ID', 'Guide', 'Amount', 'Earnings', 'Method', 'Status', 'Actions'].map(h => (
        <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-theme-muted capitalize tracking-[0.2em]">{h}</th>
       ))}
      </tr>
     </thead>
     <tbody className="divide-y divide-theme">
      {filteredPayouts.map(p => (
       <tr 
        key={p.id} 
        onClick={() => setSelectedPayout(p)}
        className="hover:surface-section transition-colors cursor-pointer group"
       >
        <td className="px-6 py-4">
         <span className="text-xs font-bold text-theme-primary">{p.payoutId}</span>
        </td>
        <td className="px-6 py-4">
         <div className="flex flex-col">
          <span className="text-sm font-bold text-theme-primary">{p.guideName}</span>
          <span className="text-[10px] text-theme-muted truncate max-w-[120px]">{p.guideEmail}</span>
         </div>
        </td>
        <td className="px-6 py-4">
         <span className="text-sm font-black text-theme-primary">{p.currency} {p.amount.toLocaleString()}</span>
        </td>
        <td className="px-6 py-4">
         <div className="flex flex-col">
          <span className="text-xs font-bold text-green-600 dark:text-green-400">+{p.currency} {p.guideEarnings.toLocaleString()}</span>
          <span className="text-[10px] text-danger-red opacity-60">-{p.currency} {p.platformFee.toLocaleString()} fee</span>
         </div>
        </td>
        <td className="px-6 py-4">
         <MethodBadge method={p.method} />
        </td>
        <td className="px-6 py-4">
         <StatusBadge status={p.status} />
        </td>
        <td className="px-6 py-4 text-right">
         <button className="p-2 hover:bg-primary-light/10 rounded-xl transition-colors group-hover:scale-110">
          <ChevronRight className="w-5 h-5 text-theme-muted group-hover:text-primary-light" />
         </button>
        </td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>

   {/* Empty State */}
   {filteredPayouts.length === 0 && (
    <div className="surface-card rounded-3xl border-2 border-dashed border-theme py-20 flex flex-col items-center justify-center text-center">
     <div className="w-16 h-16 rounded-full bg-surface-section flex items-center justify-center mb-4">
      <DollarSign className="w-8 h-8 opacity-20" />
     </div>
     <h3 className="text-lg font-black text-theme-primary capitalize tracking-tight">Ledger Empty</h3>
     <p className="text-sm text-theme-muted mt-1 max-w-xs mx-auto">No financial entries match your current search or status filter criteria.</p>
     <button 
      onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
      className="mt-6 px-6 py-2 border border-theme rounded-xl text-xs font-bold capitalize tracking-normal hover:surface-section transition-colors"
     >
      Clear All Filters
     </button>
    </div>
   )}

   {/* Details Modal */}
   {selectedPayout && (
    <PayoutDetailsModal 
     isOpen={!!selectedPayout}
     onClose={() => setSelectedPayout(null)}
     payout={selectedPayout}
    />
   )}
  </div>
 )
}
