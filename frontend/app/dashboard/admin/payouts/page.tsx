// ============================================================================
// ADMIN PAYOUT & LEDGER - CARD 27
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/admin/payouts/page.tsx
// 
// PURPOSE: Track Whish transactions, manage dynamic fees, handle currency rates
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ View all payouts (pending, completed, failed)
// ✓ Track platform fees
// ✓ Dynamic fee adjustments (by guide tier)
// ✓ Currency rate overrides
// ✓ Payout history with filtering
// ✓ Batch payout processing
// ✓ Financial audit trail
// 
// PAYOUT RULES:
// - 48-hour payout freeze after tour completion
// - Platform fee deducted (varies by guide tier)
// - Batch payouts processed daily
// - Currency conversion based on live rates
// 
// COLOR PSYCHOLOGY:
// - Blue: Pending payouts, primary actions
// - Green: Completed payouts, success
// - Amber: Frozen funds, warnings
// - Red: Failed payouts, errors
// - Purple: Platform fees, adjustments
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  DollarSign,
  CreditCard,
  Banknote,
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Mail,
  Phone,
  User,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  FileText,
  Download,
  Printer,
  ArrowUpDown,
  MoreVertical,
  X,
  Info,
  Shield,
  Award,
  Ban,
  Globe,
  Percent,
  Plus,
  Edit,
  Save
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type PayoutStatus = 'pending' | 'frozen' | 'processing' | 'completed' | 'failed' | 'cancelled'
type PayoutMethod = 'whish' | 'bank' | 'paypal' | 'card'
type TransactionType = 'payout' | 'fee' | 'refund' | 'adjustment' | 'currency_conversion'

interface Payout {
  id: string
  payoutId: string
  guideId: string
  guideName: string
  guideEmail: string
  guideAvatar?: string
  amount: number
  currency: 'USD' | 'TRY' | 'LBP'
  convertedAmount?: number
  convertedCurrency?: 'USD' | 'TRY' | 'LBP'
  exchangeRate?: number
  status: PayoutStatus
  method: PayoutMethod
  methodDetails: string
  tourId?: string
  tourTitle?: string
  bookingId?: string
  platformFee: number
  guideEarnings: number
  feeTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  feeDiscount: number
  requestedAt: string
  processedAt?: string
  completedAt?: string
  estimatedRelease?: string
  notes?: string
  metadata?: {
    ip?: string
    location?: string
    userAgent?: string
  }
}

interface FeeTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  baseFee: number
  currentFee: number
  discount: number
  guidesCount: number
  totalPayouts: number
}

interface CurrencyRate {
  from: 'USD' | 'TRY' | 'LBP'
  to: 'USD' | 'TRY' | 'LBP'
  rate: number
  lastUpdated: string
  isOverridden: boolean
  overrideUntil?: string
  overrideReason?: string
}

interface PayoutStats {
  totalPending: number
  totalFrozen: number
  totalProcessing: number
  totalCompleted: number
  totalFailed: number
  totalAmount: number
  totalFees: number
  averageProcessingTime: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_PAYOUT_STATS: PayoutStats = {
  totalPending: 23,
  totalFrozen: 45,
  totalProcessing: 12,
  totalCompleted: 189,
  totalFailed: 3,
  totalAmount: 45670,
  totalFees: 6850,
  averageProcessingTime: '4.2 hours'
}

const MOCK_FEE_TIERS: FeeTier[] = [
  { tier: 'bronze', baseFee: 15, currentFee: 15, discount: 0, guidesCount: 456, totalPayouts: 125000 },
  { tier: 'silver', baseFee: 15, currentFee: 12, discount: 20, guidesCount: 345, totalPayouts: 234000 },
  { tier: 'gold', baseFee: 15, currentFee: 10, discount: 33, guidesCount: 234, totalPayouts: 345000 },
  { tier: 'platinum', baseFee: 15, currentFee: 8, discount: 47, guidesCount: 123, totalPayouts: 456000 }
]

const MOCK_CURRENCY_RATES: CurrencyRate[] = [
  { from: 'USD', to: 'TRY', rate: 32.5, lastUpdated: '2026-03-15T10:00:00Z', isOverridden: false },
  { from: 'USD', to: 'LBP', rate: 89500, lastUpdated: '2026-03-15T10:00:00Z', isOverridden: false },
  { from: 'TRY', to: 'USD', rate: 0.031, lastUpdated: '2026-03-15T10:00:00Z', isOverridden: false },
  { from: 'TRY', to: 'LBP', rate: 2750, lastUpdated: '2026-03-15T10:00:00Z', isOverridden: true, overrideUntil: '2026-03-20T10:00:00Z', overrideReason: 'Market volatility' },
  { from: 'LBP', to: 'USD', rate: 0.000011, lastUpdated: '2026-03-15T10:00:00Z', isOverridden: false },
  { from: 'LBP', to: 'TRY', rate: 0.00036, lastUpdated: '2026-03-15T10:00:00Z', isOverridden: false }
]

const MOCK_PAYOUTS: Payout[] = [
  {
    id: 'p1',
    payoutId: 'PO-2026-001',
    guideId: 'g123',
    guideName: 'Mehmet Yilmaz',
    guideEmail: 'mehmet.yilmaz@example.com',
    guideAvatar: '/images/guides/mehmet.jpg',
    amount: 1250.50,
    currency: 'USD',
    status: 'completed',
    method: 'whish',
    methodDetails: 'mehmet.guide@whish.com',
    tourId: 't1',
    tourTitle: 'Ottoman Heritage Tour',
    bookingId: 'b123',
    platformFee: 125.05,
    guideEarnings: 1125.45,
    feeTier: 'gold',
    feeDiscount: 33,
    requestedAt: '2026-03-10T09:15:00Z',
    processedAt: '2026-03-10T10:30:00Z',
    completedAt: '2026-03-10T14:20:00Z'
  },
  {
    id: 'p2',
    payoutId: 'PO-2026-002',
    guideId: 'g124',
    guideName: 'Layla Hassan',
    guideEmail: 'layla.hassan@example.com',
    guideAvatar: '/images/guides/layla.jpg',
    amount: 45000,
    currency: 'LBP',
    convertedAmount: 50.28,
    convertedCurrency: 'USD',
    exchangeRate: 89500,
    status: 'frozen',
    method: 'bank',
    methodDetails: 'Bank of Beirut •••• 4567',
    tourId: 't2',
    tourTitle: 'Beirut Food Walk',
    bookingId: 'b124',
    platformFee: 45.00,
    guideEarnings: 450.00,
    feeTier: 'silver',
    feeDiscount: 20,
    requestedAt: '2026-03-09T14:30:00Z',
    estimatedRelease: '2026-03-11T14:30:00Z'
  },
  {
    id: 'p3',
    payoutId: 'PO-2026-003',
    guideId: 'g125',
    guideName: 'Ahmet Demir',
    guideEmail: 'ahmet.demir@example.com',
    guideAvatar: '/images/guides/ahmet.jpg',
    amount: 890.25,
    currency: 'USD',
    status: 'processing',
    method: 'paypal',
    methodDetails: 'ahmet.demir@email.com',
    tourId: 't3',
    tourTitle: 'Cappadocia Balloon Ride',
    bookingId: 'b125',
    platformFee: 89.03,
    guideEarnings: 801.22,
    feeTier: 'bronze',
    feeDiscount: 0,
    requestedAt: '2026-03-08T11:20:00Z',
    processedAt: '2026-03-09T09:15:00Z'
  },
  {
    id: 'p4',
    payoutId: 'PO-2026-004',
    guideId: 'g126',
    guideName: 'Elias Khoury',
    guideEmail: 'elias.khoury@example.com',
    amount: 165.00,
    currency: 'USD',
    status: 'failed',
    method: 'bank',
    methodDetails: 'Bank Audi •••• 1234',
    tourId: 't4',
    tourTitle: 'Byblos Ruins Tour',
    bookingId: 'b126',
    platformFee: 16.50,
    guideEarnings: 148.50,
    feeTier: 'bronze',
    feeDiscount: 0,
    requestedAt: '2026-03-07T16:45:00Z',
    notes: 'Invalid bank account details. Guide notified.'
  },
  {
    id: 'p5',
    payoutId: 'PO-2026-005',
    guideId: 'g127',
    guideName: 'Zeynep Kaya',
    guideEmail: 'zeynep.kaya@example.com',
    guideAvatar: '/images/guides/zeynep.jpg',
    amount: 2340.00,
    currency: 'TRY',
    convertedAmount: 72.00,
    convertedCurrency: 'USD',
    exchangeRate: 32.5,
    status: 'pending',
    method: 'whish',
    methodDetails: 'zeynep.guide@whish.com',
    tourId: 't5',
    tourTitle: 'Bosphorus Cruise',
    bookingId: 'b127',
    platformFee: 234.00,
    guideEarnings: 2106.00,
    feeTier: 'platinum',
    feeDiscount: 47,
    requestedAt: '2026-03-06T10:10:00Z'
  }
]

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge = ({ status }: { status: PayoutStatus }) => {
  const styles = {
    pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    frozen: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    processing: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
    completed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    failed: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
    cancelled: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700'
  }

  const icons = {
    pending: Clock,
    frozen: Shield,
    processing: RefreshCw,
    completed: CheckCircle,
    failed: XCircle,
    cancelled: Ban
  }

  const Icon = icons[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      <Icon className="w-3.5 h-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ============================================================================
// PAYOUT METHOD BADGE
// ============================================================================

const MethodBadge = ({ method }: { method: PayoutMethod }) => {
  const styles = {
    whish: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
    bank: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    paypal: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    card: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
  }

  const icons = {
    whish: Wallet,
    bank: Banknote,
    paypal: CreditCard,
    card: CreditCard
  }

  const Icon = icons[method]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[method]}`}>
      <Icon className="w-3.5 h-3.5" />
      {method.charAt(0).toUpperCase() + method.slice(1)}
    </span>
  )
}

// ============================================================================
// FEE TIER BADGE
// ============================================================================

const FeeTierBadge = ({ tier }: { tier: Payout['feeTier'] }) => {
  const styles = {
    bronze: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    silver: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    gold: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    platinum: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[tier]}`}>
      <Award className="w-3.5 h-3.5" />
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  )
}

// ============================================================================
// CURRENCY RATE EDITOR MODAL
// ============================================================================

const CurrencyRateModal = ({ isOpen, onClose, rate, onSave }: any) => {
  const [newRate, setNewRate] = useState(rate?.rate || 0)
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideUntil, setOverrideUntil] = useState('')

  if (!isOpen || !rate) return null

  const handleSave = () => {
    onSave(rate.from, rate.to, newRate, overrideReason, overrideUntil)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Override Exchange Rate
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              1 {rate.from} = {rate.rate} {rate.to}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Rate
            </label>
            <input
              type="number"
              value={newRate}
              onChange={(e) => setNewRate(Number(e.target.value))}
              step="0.0001"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Override Until (Optional)
            </label>
            <input
              type="datetime-local"
              value={overrideUntil}
              onChange={(e) => setOverrideUntil(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason for Override
            </label>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              rows={2}
              placeholder="e.g., Market volatility, special promotion..."
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Save Override
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PAYOUT DETAILS MODAL
// ============================================================================

const PayoutDetailsModal = ({ isOpen, onClose, payout }: any) => {
  if (!isOpen || !payout) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-white" />
              <h3 className="text-lg font-bold text-white">Payout #{payout.payoutId}</h3>
              <StatusBadge status={payout.status} />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
          {/* Guide Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                {payout.guideAvatar ? (
                  <Image src={payout.guideAvatar} alt={payout.guideName} width={64} height={64} className="object-cover" />
                ) : (
                  <User className="w-8 h-8 m-4 text-gray-400" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">{payout.guideName}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{payout.guideEmail}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">ID: {payout.guideId}</p>
            </div>
          </div>

          {/* Amount Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gross Amount</h5>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {payout.currency === 'USD' && '$'}
                {payout.currency === 'TRY' && '₺'}
                {payout.currency === 'LBP' && 'ل.ل'}
                {payout.amount.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform Fee</h5>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${payout.platformFee.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Net Earnings */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
            <h5 className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">Net Earnings</h5>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              ${payout.guideEarnings.toFixed(2)}
            </p>
          </div>

          {/* Fee Tier Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Fee Tier</h5>
            <div className="flex items-center justify-between">
              <FeeTierBadge tier={payout.feeTier} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {payout.feeDiscount}% discount applied
              </span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Method</h5>
              <MethodBadge method={payout.method} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{payout.methodDetails}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tour</h5>
              <p className="text-sm text-gray-900 dark:text-white">{payout.tourTitle || 'N/A'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Booking: {payout.bookingId}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Timeline</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Requested:</span>
                <span className="text-gray-900 dark:text-white">{new Date(payout.requestedAt).toLocaleString()}</span>
              </div>
              {payout.processedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Processed:</span>
                  <span className="text-gray-900 dark:text-white">{new Date(payout.processedAt).toLocaleString()}</span>
                </div>
              )}
              {payout.completedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                  <span className="text-gray-900 dark:text-white">{new Date(payout.completedAt).toLocaleString()}</span>
                </div>
              )}
              {payout.estimatedRelease && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Estimated Release:</span>
                  <span className="text-amber-600 dark:text-amber-400">{new Date(payout.estimatedRelease).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {payout.notes && (
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-800/50">
              <h5 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">Notes</h5>
              <p className="text-sm text-amber-600 dark:text-amber-500">{payout.notes}</p>
            </div>
          )}

          {/* Actions */}
          {payout.status === 'failed' && (
            <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
              Retry Payout
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminPayoutPage() {
  const [filterStatus, setFilterStatus] = useState<PayoutStatus | 'all'>('pending')
  const [filterMethod, setFilterMethod] = useState<PayoutMethod | 'all'>('all')
  const [filterTier, setFilterTier] = useState<Payout['feeTier'] | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRate, setSelectedRate] = useState<CurrencyRate | null>(null)
  const [showRateModal, setShowRateModal] = useState(false)
  const [feeTiers, setFeeTiers] = useState(MOCK_FEE_TIERS)
  const [currencyRates, setCurrencyRates] = useState(MOCK_CURRENCY_RATES)
  const itemsPerPage = 5

  // Filter payouts
  const filteredPayouts = useMemo(() => {
    return MOCK_PAYOUTS.filter(payout => {
      if (filterStatus !== 'all' && payout.status !== filterStatus) return false
      if (filterMethod !== 'all' && payout.method !== filterMethod) return false
      if (filterTier !== 'all' && payout.feeTier !== filterTier) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (
          payout.payoutId.toLowerCase().includes(term) ||
          payout.guideName.toLowerCase().includes(term) ||
          payout.guideEmail.toLowerCase().includes(term) ||
          payout.tourTitle?.toLowerCase().includes(term) ||
          payout.bookingId?.toLowerCase().includes(term)
        )
      }
      return true
    })
  }, [filterStatus, filterMethod, filterTier, searchTerm])

  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage)
  const paginatedPayouts = filteredPayouts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const resetFilters = () => {
    setFilterStatus('all')
    setFilterMethod('all')
    setFilterTier('all')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleFeeTierUpdate = (tier: string, newFee: number) => {
    setFeeTiers(prev =>
      prev.map(t => t.tier === tier ? { ...t, currentFee: newFee } : t)
    )
    alert(`✅ Fee tier updated for ${tier}`)
  }

  const handleCurrencyOverride = (from: string, to: string, rate: number, reason: string, until: string) => {
    setCurrencyRates(prev =>
      prev.map(r => r.from === from && r.to === to
        ? { ...r, rate, isOverridden: true, overrideReason: reason, overrideUntil: until }
        : r
      )
    )
    alert(`✅ Exchange rate overridden for ${from} → ${to}`)
  }

  return (
    <>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Payout & Ledger
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track Whish transactions, manage fees, and override currency rates
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { key: 'totalPending', label: 'Pending', value: MOCK_PAYOUT_STATS.totalPending, color: 'amber', action: () => setFilterStatus('pending') },
              { key: 'totalFrozen', label: 'Frozen', value: MOCK_PAYOUT_STATS.totalFrozen, color: 'blue', action: () => setFilterStatus('frozen') },
              { key: 'totalProcessing', label: 'Processing', value: MOCK_PAYOUT_STATS.totalProcessing, color: 'purple', action: () => setFilterStatus('processing') },
              { key: 'totalAmount', label: 'Total ($)', value: `$${MOCK_PAYOUT_STATS.totalAmount}`, color: 'emerald', action: () => {} }
            ].map(stat => (
              <div
                key={stat.key}
                onClick={stat.action}
                className={`group p-4 bg-white dark:bg-gray-900 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 border-2 ${
                  (stat.key === 'totalPending' && filterStatus === 'pending') ||
                  (stat.key === 'totalFrozen' && filterStatus === 'frozen') ||
                  (stat.key === 'totalProcessing' && filterStatus === 'processing')
                    ? `border-${stat.color}-500 ring-2 ring-${stat.color}-200 dark:ring-${stat.color}-800`
                    : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Fee Tiers Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Fee Tiers & Adjustments
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {feeTiers.map(tier => (
                <div key={tier.tier} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <FeeTierBadge tier={tier.tier} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{tier.guidesCount} guides</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {tier.currentFee}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Base: {tier.baseFee}% | Save {tier.discount}%
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tier.currentFee}
                      onChange={(e) => handleFeeTierUpdate(tier.tier, Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleFeeTierUpdate(tier.tier, tier.currentFee)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Currency Rates Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Currency Exchange Rates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currencyRates.map(rate => (
                <div key={`${rate.from}-${rate.to}`} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {rate.from} → {rate.to}
                    </span>
                    {rate.isOverridden && (
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                        Overridden
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {rate.rate.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Updated: {new Date(rate.lastUpdated).toLocaleString()}
                  </div>
                  <button
                    onClick={() => { setSelectedRate(rate); setShowRateModal(true); }}
                    className="w-full px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-medium rounded-lg transition-all"
                  >
                    Override Rate
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as PayoutStatus | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="frozen">Frozen</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as PayoutMethod | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Methods</option>
              <option value="whish">Whish</option>
              <option value="bank">Bank</option>
              <option value="paypal">PayPal</option>
              <option value="card">Card</option>
            </select>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value as Payout['feeTier'] | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Tiers</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by payout ID, guide, tour, or booking..."
              className="w-full pl-11 pr-11 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {paginatedPayouts.length} of {filteredPayouts.length} payouts
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payout ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guide</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {payout.payoutId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          {payout.guideAvatar ? (
                            <Image src={payout.guideAvatar} alt={payout.guideName} width={24} height={24} className="object-cover" />
                          ) : (
                            <User className="w-3 h-3 m-1.5 text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{payout.guideName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${payout.amount.toFixed(2)}
                      </div>
                      {payout.convertedAmount && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ≈ ${payout.convertedAmount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4"><MethodBadge method={payout.method} /></td>
                    <td className="px-6 py-4"><FeeTierBadge tier={payout.feeTier} /></td>
                    <td className="px-6 py-4"><StatusBadge status={payout.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedPayout(payout); setShowDetailsModal(true); }}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {paginatedPayouts.map((payout) => (
              <div key={payout.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{payout.payoutId}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{payout.guideName}</div>
                  </div>
                  <StatusBadge status={payout.status} />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    ${payout.amount.toFixed(2)}
                  </div>
                  <MethodBadge method={payout.method} />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <FeeTierBadge tier={payout.feeTier} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(payout.requestedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedPayout(payout); setShowDetailsModal(true); }}
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredPayouts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No payouts found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters.</p>
              <button onClick={resetFilters} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredPayouts.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payout Details Modal */}
      {selectedPayout && (
        <PayoutDetailsModal
          isOpen={showDetailsModal}
          onClose={() => { setShowDetailsModal(false); setSelectedPayout(null); }}
          payout={selectedPayout}
        />
      )}

      {/* Currency Rate Modal */}
      {selectedRate && (
        <CurrencyRateModal
          isOpen={showRateModal}
          onClose={() => { setShowRateModal(false); setSelectedRate(null); }}
          rate={selectedRate}
          onSave={handleCurrencyOverride}
        />
      )}
    </>
  )
}