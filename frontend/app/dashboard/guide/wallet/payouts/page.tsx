// ============================================================================
// GUIDE PAYOUT HISTORY - ALL PAST PAYOUTS
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/wallet/payouts/page.tsx
// 
// PURPOSE: Display complete payout history for the guide
// 
// FEATURES:
// - List all payouts with status
// - Filter by date range
// - Filter by status
// - Download statements
// - View payout details
// - Export for tax purposes
// ============================================================================

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
 DollarSign,
 Download,
 Filter,
 Search,
 ChevronLeft,
 ChevronRight,
 RefreshCw,
 CheckCircle,
 XCircle,
 Clock,
 AlertCircle,
 Ban,
 Eye,
 FileText,
 Calendar,
 TrendingUp,
 TrendingDown,
 Wallet
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type PayoutStatus = 'completed' | 'pending' | 'processing' | 'failed' | 'cancelled'

interface Payout {
 id: string
 payoutId: string
 amount: number
 currency: 'USD' | 'TRY' | 'LBP'
 status: PayoutStatus
 method: 'bank' | 'whish' | 'paypal'
 methodDetails: string
 tourTitle?: string
 bookingId?: string
 completedAt?: string
 requestedAt: string
 processedAt?: string
 estimatedArrival?: string
 fee: number
 netAmount: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_PAYOUTS: Payout[] = [
 {
 id: 'p1',
 payoutId: 'PO-2026-001',
 amount: 378.50,
 currency: 'USD',
 status: 'completed',
 method: 'whish',
 methodDetails: 'mehmet.guide@whish.com',
 tourTitle: 'Ottoman Heritage Tour',
 bookingId: 'B123',
 completedAt: '2026-03-15T14:30:00Z',
 requestedAt: '2026-03-10T09:15:00Z',
 processedAt: '2026-03-12T10:30:00Z',
 fee: 18.93,
 netAmount: 359.57
 },
 {
 id: 'p2',
 payoutId: 'PO-2026-002',
 amount: 450.00,
 currency: 'USD',
 status: 'completed',
 method: 'bank',
 methodDetails: 'Bank of America •••• 4567',
 tourTitle: 'Bosphorus Sunset Cruise',
 bookingId: 'B124',
 completedAt: '2026-03-10T09:45:00Z',
 requestedAt: '2026-03-05T11:20:00Z',
 processedAt: '2026-03-07T14:15:00Z',
 fee: 22.50,
 netAmount: 427.50
 },
 {
 id: 'p3',
 payoutId: 'PO-2026-003',
 amount: 890.25,
 currency: 'USD',
 status: 'processing',
 method: 'paypal',
 methodDetails: 'mehmet@email.com',
 tourTitle: 'Cappadocia Balloon Ride',
 bookingId: 'B125',
 requestedAt: '2026-03-08T16:40:00Z',
 processedAt: '2026-03-09T09:15:00Z',
 estimatedArrival: '2026-03-16',
 fee: 44.51,
 netAmount: 845.74
 },
 {
 id: 'p4',
 payoutId: 'PO-2026-004',
 amount: 165.00,
 currency: 'USD',
 status: 'failed',
 method: 'bank',
 methodDetails: 'Bank of America •••• 4567',
 tourTitle: 'Byblos Ruins Tour',
 bookingId: 'B126',
 requestedAt: '2026-03-01T10:10:00Z',
 fee: 8.25,
 netAmount: 156.75
 },
 {
 id: 'p5',
 payoutId: 'PO-2026-005',
 amount: 234.00,
 currency: 'USD',
 status: 'pending',
 method: 'whish',
 methodDetails: 'mehmet.guide@whish.com',
 tourTitle: 'Beirut Food Walk',
 bookingId: 'B127',
 requestedAt: '2026-02-28T14:30:00Z',
 fee: 11.70,
 netAmount: 222.30
 },
 {
 id: 'p6',
 payoutId: 'PO-2026-006',
 amount: 1125.45,
 currency: 'USD',
 status: 'completed',
 method: 'bank',
 methodDetails: 'Chase •••• 8901',
 tourTitle: 'Multiple Tours',
 completedAt: '2026-02-25T11:20:00Z',
 requestedAt: '2026-02-20T09:30:00Z',
 processedAt: '2026-02-22T13:45:00Z',
 fee: 56.27,
 netAmount: 1069.18
 }
]

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge = ({ status }: { status: PayoutStatus }) => {
 const styles = {
 completed: {
 bg: 'bg-success-green/10 dark:bg-success-green/10',
 text: 'text-emerald-700 dark:text-emerald-400',
 border: 'border-success-green dark:border-success-green/50',
 icon: CheckCircle,
 label: 'Completed'
 },
 pending: {
 bg: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-accent-light/10 dark:bg-accent-dark/10',
 text: 'text-accent-light dark:text-accent-dark dark:text-amber-400',
 border: 'border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/50',
 icon: Clock,
 label: 'Pending'
 },
 processing: {
 bg: 'bg-primary-light/10 dark:bg-primary-light/10',
 text: 'text-blue-700 dark:text-primary-dark ',
 border: 'border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark/50',
 icon: RefreshCw,
 label: 'Processing'
 },
 failed: {
 bg: 'bg-danger-red/10 dark:bg-danger-red/10',
 text: 'text-red-700 dark:text-red-400',
 border: 'border-danger-red dark:border-danger-red/50',
 icon: AlertCircle,
 label: 'Failed'
 },
 cancelled: {
 bg: 'surface-section',
 text: 'text-theme-secondary ',
 border: 'border-theme',
 icon: Ban,
 label: 'Cancelled'
 }
 }

 const { bg, text, border, icon: Icon, label } = styles[status]

 return (
 <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${bg} ${text} ${border}`}>
 <Icon className="w-3.5 h-3.5" />
 {label}
 </span>
 )
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

type StatColor = 'blue' | 'emerald' | 'amber' | 'purple' | 'red'

const StatCard = ({
 icon: Icon,
 label,
 value,
 subtext,
 color = 'blue',
 trend
}: {
 icon: any
 label: string
 value: string | number
 subtext?: string
 color?: StatColor
 trend?: number
}) => {
 const colorClasses: Record<StatColor, string> = {
 blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark ',
 emerald: 'bg-success-green/10 dark:bg-emerald-950/30 text-success-green dark:text-emerald-400',
 amber: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-950/30 text-accent-light dark:text-accent-dark dark:text-amber-400',
 purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
 red: 'bg-danger-red/10 dark:bg-red-950/30 text-danger-red dark:text-red-400'
 }

 return (
 <div className="p-5 surface-card border border-theme rounded-xl hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between mb-3">
 <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
 <Icon className="w-5 h-5" />
 </div>
 {trend && (
 <span className={`text-xs font-medium ${trend > 0 ? 'text-success-green' : 'text-danger-red'}`}>
 {trend > 0 ? '+' : ''}{trend}%
 </span>
 )}
 </div>
 <div className="space-y-1">
 <div className="text-2xl font-bold text-theme-primary">
 {value}
 </div>
 <div className="text-xs text-theme-muted ">
 {label}
 </div>
 {subtext && (
 <div className="text-xs text-theme-muted ">
 {subtext}
 </div>
 )}
 </div>
 </div>
 )
}

// ============================================================================
// PAYOUT ROW COMPONENT
// ============================================================================

const PayoutRow = ({ payout }: { payout: Payout }) => {
 const [expanded, setExpanded] = useState(false)

 const formatDate = (dateString?: string) => {
 if (!dateString) return '—'
 return new Date(dateString).toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric'
 })
 }

 const handleDownloadReceipt = () => {
 const receipt = `
SAFARIHUB - PAYOUT RECEIPT
==========================
Payout ID: ${payout.payoutId}
Date: ${formatDate(payout.completedAt || payout.requestedAt)}
Amount: $${payout.amount}
Fee: $${payout.fee}
Net Amount: $${payout.netAmount}
Method: ${payout.method}
Status: ${payout.status}
Tour: ${payout.tourTitle || 'Multiple tours'}
Booking: ${payout.bookingId || 'N/A'}

Thank you for being a SafariHub guide!
 `
 
 const blob = new Blob([receipt], { type: 'text/plain' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = `payout-${payout.payoutId}.txt`
 a.click()
 URL.revokeObjectURL(url)
 toast.success('Receipt downloaded')
 }

 return (
 <div className="surface-card border border-theme rounded-xl overflow-hidden hover:shadow-md transition-all">
 <div className="p-5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 {/* Left side */}
 <div className="flex items-start gap-4">
 <div className="p-2 bg-primary-light/10 rounded-lg">
 <DollarSign className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 </div>
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="font-bold text-theme-primary">
 {payout.payoutId}
 </span>
 <StatusBadge status={payout.status} />
 </div>
 <p className="text-sm text-theme-muted ">
 {payout.tourTitle || 'Multiple tours'} • {payout.methodDetails}
 </p>
 </div>
 </div>

 {/* Right side */}
 <div className="flex items-center gap-4">
 <div className="text-right">
 <div className="text-xl font-bold text-theme-primary">
 ${payout.amount}
 </div>
 <div className="text-xs text-theme-muted ">
 Fee: ${payout.fee}
 </div>
 </div>
 <button
 onClick={() => setExpanded(!expanded)}
 className="p-2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 hover:surface-section dark:hover:surface-card rounded-lg"
 >
 <ChevronRight className={`w-5 h-5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
 </button>
 </div>
 </div>

 {/* Expanded details */}
 {expanded && (
 <div className="mt-4 pt-4 border-t border-theme grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <p className="text-xs text-theme-muted ">Requested</p>
 <p className="text-sm font-medium text-theme-primary">
 {formatDate(payout.requestedAt)}
 </p>
 </div>
 <div>
 <p className="text-xs text-theme-muted ">Processed</p>
 <p className="text-sm font-medium text-theme-primary">
 {formatDate(payout.processedAt)}
 </p>
 </div>
 <div>
 <p className="text-xs text-theme-muted ">Completed/Arrival</p>
 <p className="text-sm font-medium text-theme-primary">
 {formatDate(payout.completedAt || payout.estimatedArrival)}
 </p>
 </div>
 <div>
 <p className="text-xs text-theme-muted ">Gross Amount</p>
 <p className="text-sm font-medium text-theme-primary">
 ${payout.amount}
 </p>
 </div>
 <div>
 <p className="text-xs text-theme-muted ">Platform Fee</p>
 <p className="text-sm font-medium text-danger-red dark:text-red-400">
 -${payout.fee}
 </p>
 </div>
 <div>
 <p className="text-xs text-theme-muted ">Net Amount</p>
 <p className="text-sm font-bold text-success-green dark:text-emerald-400">
 ${payout.netAmount}
 </p>
 </div>
 {payout.bookingId && (
 <div className="sm:col-span-3 flex justify-end">
 <button
 onClick={handleDownloadReceipt}
 className="inline-flex items-center gap-2 px-3 py-1.5 surface-section text-theme-secondary text-sm rounded-lg hover:surface-section dark:hover:surface-section transition-colors"
 >
 <Download className="w-4 h-4" />
 Download Receipt
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuidePayoutHistoryPage() {
 const [filterStatus, setFilterStatus] = useState<PayoutStatus | 'all'>('all')
 const [searchTerm, setSearchTerm] = useState('')
 const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all')
 const [currentPage, setCurrentPage] = useState(1)
 const itemsPerPage = 5

 // Calculate summary stats
 const totalPaid = MOCK_PAYOUTS
 .filter(p => p.status === 'completed')
 .reduce((sum, p) => sum + p.amount, 0)
 
 const totalPending = MOCK_PAYOUTS
 .filter(p => p.status === 'pending' || p.status === 'processing')
 .reduce((sum, p) => sum + p.amount, 0)
 
 const totalFees = MOCK_PAYOUTS
 .reduce((sum, p) => sum + p.fee, 0)

 // Filter payouts
 const filteredPayouts = useMemo(() => {
 return MOCK_PAYOUTS.filter(payout => {
 if (filterStatus !== 'all' && payout.status !== filterStatus) return false
 if (searchTerm) {
 const term = searchTerm.toLowerCase()
 return (
 payout.payoutId.toLowerCase().includes(term) ||
 payout.tourTitle?.toLowerCase().includes(term) ||
 payout.bookingId?.toLowerCase().includes(term)
 )
 }
 return true
 })
 }, [filterStatus, searchTerm])

 const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage)
 const paginatedPayouts = filteredPayouts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

 const resetFilters = () => {
 setFilterStatus('all')
 setSearchTerm('')
 setDateRange('all')
 setCurrentPage(1)
 }

 const handleExportAll = () => {
 const csvContent = [
 ['Payout ID', 'Date', 'Amount', 'Fee', 'Net', 'Status', 'Tour', 'Booking ID'].join(','),
 ...MOCK_PAYOUTS.map(p => [
 p.payoutId,
 new Date(p.requestedAt).toLocaleDateString(),
 p.amount,
 p.fee,
 p.netAmount,
 p.status,
 p.tourTitle || 'Multiple',
 p.bookingId || 'N/A'
 ].join(','))
 ].join('\n')

 const blob = new Blob([csvContent], { type: 'text/csv' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = `payout-history-${new Date().toISOString().split('T')[0]}.csv`
 a.click()
 URL.revokeObjectURL(url)
 toast.success('Payout history exported')
 }

 return (
 <>
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)]">
 <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
 
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <Link
 href="/dashboard/guide/wallet"
 className="text-sm text-theme-muted hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors"
 >
 ← Back to Wallet
 </Link>
 </div>
 <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-1">
 Payout History
 </h1>
 <p className="text-sm text-theme-secondary ">
 View all past and pending payouts
 </p>
 </div>
 <button
 onClick={handleExportAll}
 className="inline-flex items-center gap-2 px-4 py-2 surface-card border border-theme text-theme-secondary rounded-lg hover:surface-section dark:hover:surface-card transition-colors self-start"
 >
 <Download className="w-4 h-4" />
 Export All
 </button>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 <StatCard
 icon={Wallet}
 label="Total Paid Out"
 value={`$${totalPaid}`}
 color="emerald"
 />
 <StatCard
 icon={Clock}
 label="Pending"
 value={`$${totalPending}`}
 subtext="Awaiting processing"
 color="amber"
 />
 <StatCard
 icon={TrendingDown}
 label="Total Fees"
 value={`$${totalFees}`}
 color="red"
 />
 <StatCard
 icon={DollarSign}
 label="Average Payout"
 value={`$${(totalPaid / MOCK_PAYOUTS.filter(p => p.status === 'completed').length).toFixed(2)}`}
 color="blue"
 />
 </div>

 {/* Filters */}
 <div className="flex flex-col sm:flex-row gap-4 mb-6">
 <select
 value={filterStatus}
 onChange={(e) => setFilterStatus(e.target.value as PayoutStatus | 'all')}
 className="px-4 py-2 surface-card border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark shadow-sm"
 >
 <option value="all">All Status</option>
 <option value="completed">Completed</option>
 <option value="processing">Processing</option>
 <option value="pending">Pending</option>
 <option value="failed">Failed</option>
 </select>

 <select
 value={dateRange}
 onChange={(e) => setDateRange(e.target.value as any)}
 className="px-4 py-2 surface-card border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark shadow-sm"
 >
 <option value="all">All Time</option>
 <option value="month">This Month</option>
 <option value="quarter">Last 3 Months</option>
 <option value="year">This Year</option>
 </select>

 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Search by payout ID, tour, or booking..."
 className="w-full pl-9 pr-4 py-2 surface-card border border-theme rounded-xl text-sm text-theme-primary placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 />
 </div>

 <button
 onClick={resetFilters}
 className="px-4 py-2 surface-section text-theme-secondary rounded-xl hover:surface-section dark:hover:surface-section transition-colors flex items-center gap-2"
 >
 <RefreshCw className="w-4 h-4" />
 Reset
 </button>
 </div>

 {/* Results Count */}
 <div className="mb-4 text-sm text-theme-secondary ">
 Showing {paginatedPayouts.length} of {filteredPayouts.length} payouts
 </div>

 {/* Payouts List */}
 <div className="space-y-3">
 {paginatedPayouts.length > 0 ? (
 paginatedPayouts.map(payout => (
 <PayoutRow key={payout.id} payout={payout} />
 ))
 ) : (
 <div className="text-center py-16 surface-card border border-theme rounded-xl">
 <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300 " />
 <h3 className="text-lg font-semibold text-theme-primary mb-2">
 No payouts found
 </h3>
 <p className="text-sm text-theme-secondary ">
 {searchTerm ? 'Try adjusting your search' : 'Your payouts will appear here'}
 </p>
 </div>
 )}
 </div>

 {/* Pagination */}
 {filteredPayouts.length > itemsPerPage && (
 <div className="flex items-center justify-between mt-6">
 <p className="text-sm text-theme-muted ">
 Page {currentPage} of {totalPages}
 </p>
 <div className="flex gap-2">
 <button
 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 disabled={currentPage === 1}
 className="p-2 surface-card border border-theme rounded-xl text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 disabled:opacity-50"
 >
 <ChevronLeft className="w-5 h-5" />
 </button>
 <button
 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
 disabled={currentPage === totalPages}
 className="p-2 surface-card border border-theme rounded-xl text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 disabled:opacity-50"
 >
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </>
 )
}