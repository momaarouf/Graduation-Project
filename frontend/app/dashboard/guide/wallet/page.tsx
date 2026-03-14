// ============================================================================
// GUIDE WHISH WALLET MANAGEMENT - CARD 19
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/wallet/page.tsx
// 
// PURPOSE: Manage earnings, payouts, and financial records
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Whish payouts integration
// ✓ Ledger with transaction history
// ✓ PDF invoices
// ✓ 48-hour payout freeze display
// ✓ Balance overview
// ✓ Payout methods management
// 
// PAYOUT RULES:
// - 48-hour payout freeze after tour completion
// - Platform fee deducted
// - Guide fee tier can reduce commission for high-ranked guides
// 
// COLOR PSYCHOLOGY:
// - Blue: Trust, primary actions, available balance
// - Green: Success, completed payouts, positive amounts
// - Amber: Pending, frozen funds, warnings
// - Red: Negative amounts, errors
// - Purple: Premium, high-tier benefits
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Wallet,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    FileText,
    Printer,
    Calendar,
    Filter,
    Search,
    Plus,
    Trash2,
    Edit,
    MoreVertical,
    ChevronRight,
    ChevronLeft,
    RefreshCw,
    Shield,
    Award,
    Sparkles,
    Info,
    HelpCircle,
    CreditCard,
    Banknote,
    Landmark,
    Smartphone,
    Globe,
    Copy,
    Eye,
    EyeOff,
    ChevronDown,
    Check
} from 'lucide-react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type TransactionStatus = 'completed' | 'pending' | 'frozen' | 'failed' | 'cancelled'
type TransactionType = 'payout' | 'refund' | 'fee' | 'adjustment'
type PayoutMethodType = 'bank' | 'card' | 'whish' | 'paypal'

interface Transaction {
    id: string
    tourId?: string
    tourTitle?: string
    bookingReference?: string
    type: TransactionType
    amount: number
    currency: 'USD' | 'TRY' | 'LBP'
    status: TransactionStatus
    description: string
    platformFee?: number
    guideEarnings?: number
    createdAt: string
    completedAt?: string
    estimatedRelease?: string // For frozen funds (48h countdown)
    invoiceUrl?: string
    metadata?: Record<string, any>
}

interface PayoutMethod {
    id: string
    type: PayoutMethodType
    name: string
    details: string
    isDefault: boolean
    verified: boolean
    lastUsed?: string
}

interface BalanceSummary {
    available: number
    pending: number
    frozen: number
    totalEarned: number
    totalPayouts: number
    platformFees: number
    currency: 'USD' | 'TRY' | 'LBP'
    impactScore: number
    feeTier: 'bronze' | 'silver' | 'gold' | 'platinum'
    feeDiscount: number // percentage
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BALANCE: BalanceSummary = {
    available: 1250.50,
    pending: 450.75,
    frozen: 890.25,
    totalEarned: 5890.00,
    totalPayouts: 4120.50,
    platformFees: 589.00,
    currency: 'USD',
    impactScore: 87,
    feeTier: 'gold',
    feeDiscount: 10 // 10% discount (pay 10% instead of 15%)
}

const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 'tx1',
        tourId: '1',
        tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
        bookingReference: 'SH-1234-5678',
        type: 'payout',
        amount: 378.50,
        currency: 'USD',
        status: 'completed',
        description: 'Payout for tour on March 15, 2026',
        platformFee: 42.50,
        guideEarnings: 378.50,
        createdAt: '2026-03-10T10:30:00Z',
        completedAt: '2026-03-12T14:20:00Z',
        invoiceUrl: '/invoices/INV-2026-001.pdf'
    },
    {
        id: 'tx2',
        tourId: '2',
        tourTitle: 'Beirut Street Food & Cultural Walk',
        bookingReference: 'SH-2345-6789',
        type: 'payout',
        amount: 285.00,
        currency: 'USD',
        status: 'frozen',
        description: 'Payout for tour on March 8, 2026',
        platformFee: 32.00,
        guideEarnings: 285.00,
        createdAt: '2026-03-08T16:45:00Z',
        estimatedRelease: '2026-03-10T16:45:00Z',
        invoiceUrl: '/invoices/INV-2026-002.pdf'
    },
    {
        id: 'tx3',
        tourId: '3',
        tourTitle: 'Cappadocia Sunrise Balloon & Valley Hike',
        bookingReference: 'SH-3456-7890',
        type: 'payout',
        amount: 756.20,
        currency: 'USD',
        status: 'pending',
        description: 'Payout for tour on March 5, 2026',
        platformFee: 84.80,
        guideEarnings: 756.20,
        createdAt: '2026-03-05T09:15:00Z',
        estimatedRelease: '2026-03-07T09:15:00Z'
    },
    {
        id: 'tx4',
        tourId: '4',
        tourTitle: 'Byblos Ancient Ruins & Archaeological Tour',
        bookingReference: 'SH-4567-8901',
        type: 'refund',
        amount: -165.00,
        currency: 'USD',
        status: 'completed',
        description: 'Refund issued for cancellation on February 10, 2026',
        platformFee: -18.50,
        guideEarnings: -165.00,
        createdAt: '2026-02-08T11:20:00Z',
        completedAt: '2026-02-08T14:30:00Z'
    },
    {
        id: 'tx5',
        tourId: '5',
        tourTitle: 'Bosphorus Sunset Cruise with Dinner',
        bookingReference: 'SH-5678-9012',
        type: 'fee',
        amount: -25.80,
        currency: 'USD',
        status: 'completed',
        description: 'Platform fee adjustment',
        createdAt: '2026-02-01T00:00:00Z',
        completedAt: '2026-02-01T00:00:00Z'
    },
    {
        id: 'tx6',
        tourId: '6',
        tourTitle: 'Bekaa Valley Heritage & Nature Tour',
        bookingReference: 'SH-6789-0123',
        type: 'payout',
        amount: 425.00,
        currency: 'USD',
        status: 'failed',
        description: 'Payout failed - bank details need update',
        platformFee: 47.50,
        guideEarnings: 425.00,
        createdAt: '2026-01-28T13:10:00Z'
    }
]

const MOCK_PAYOUT_METHODS: PayoutMethod[] = [
    {
        id: 'pm1',
        type: 'bank',
        name: 'Chase Bank •••• 4567',
        details: 'Checking account',
        isDefault: true,
        verified: true,
        lastUsed: '2026-03-10T14:20:00Z'
    },
    {
        id: 'pm2',
        type: 'whish',
        name: 'Whish Wallet',
        details: 'mehmet.guide@whish.com',
        isDefault: false,
        verified: true,
        lastUsed: '2026-02-15T09:30:00Z'
    },
    {
        id: 'pm3',
        type: 'paypal',
        name: 'PayPal',
        details: 'mehmet.yilmaz@example.com',
        isDefault: false,
        verified: false
    }
]

const MOCK_FEE_TIERS = [
    { tier: 'bronze', commission: '15%', impactRange: '0-500', color: 'amber' },
    { tier: 'silver', commission: '12%', impactRange: '500-1,000', color: 'gray' },
    { tier: 'gold', commission: '10%', impactRange: '1,000-2,000', color: 'amber' },
    { tier: 'platinum', commission: '8%', impactRange: '2,000+', color: 'blue' }
]

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
    status: TransactionStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
    const config = {
        completed: {
            bg: 'bg-emerald-100 dark:bg-emerald-950/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: CheckCircle,
            label: 'Completed'
        },
        pending: {
            bg: 'bg-amber-100 dark:bg-amber-950/30',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-800',
            icon: Clock,
            label: 'Pending'
        },
        frozen: {
            bg: 'bg-blue-100 dark:bg-blue-950/30',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800',
            icon: Shield,
            label: 'Frozen (48h)'
        },
        failed: {
            bg: 'bg-red-100 dark:bg-red-950/30',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-200 dark:border-red-800',
            icon: XCircle,
            label: 'Failed'
        },
        cancelled: {
            bg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-700 dark:text-gray-300',
            border: 'border-gray-200 dark:border-gray-700',
            icon: XCircle,
            label: 'Cancelled'
        }
    }

    const { bg, text, border, icon: Icon, label } = config[status]

    return (
        <span className={`
      inline-flex items-center gap-1
      px-2 py-1
      ${bg}
      ${border}
      border
      rounded-full
      ${text}
      text-xs font-medium
    `}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    )
}

// ============================================================================
// BALANCE CARD COMPONENT
// ============================================================================

interface BalanceCardProps {
    balance: BalanceSummary
}

function BalanceCard({ balance }: BalanceCardProps) {
    const [showBalance, setShowBalance] = useState(true)

    const formatAmount = (amount: number) => {
        return showBalance ? `$${amount.toFixed(2)}` : '••••••'
    }

    return (
        <div className="
      bg-gradient-to-br from-blue-600 to-indigo-700
      dark:from-blue-700 dark:to-indigo-800
      rounded-xl
      p-6
      text-white
    ">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    <h2 className="font-semibold">Wallet Balance</h2>
                </div>
                <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            <div className="mb-6">
                <div className="text-3xl font-bold mb-1">
                    {formatAmount(balance.available)}
                </div>
                <p className="text-blue-100 text-sm">Available for payout</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-sm text-blue-200 mb-1">Pending</div>
                    <div className="font-semibold">{formatAmount(balance.pending)}</div>
                </div>
                <div>
                    <div className="text-sm text-blue-200 mb-1">Frozen (48h)</div>
                    <div className="font-semibold">{formatAmount(balance.frozen)}</div>
                </div>
            </div>

            {/* Fee tier info */}
            <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">Fee Tier</span>
                    <span className="font-semibold capitalize">{balance.feeTier}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">Commission</span>
                    <span className="font-semibold">{balance.feeDiscount}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">Impact Score</span>
                    <span className="font-semibold">{balance.impactScore}</span>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

interface StatCardProps {
    icon: React.ElementType
    label: string
    value: string
    change?: string
    color: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink'
}

function StatCard({ icon: Icon, label, value, change, color }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
        purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
        pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400'
    }

    return (
        <div className="
      p-4
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
    ">
            <div className="flex items-center justify-between mb-2">
                <div className={`
          p-2
          rounded-lg
          ${colorClasses[color]}
        `}>
                    <Icon className="w-4 h-4" />
                </div>
                {change && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        {change}
                    </span>
                )}
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
                {value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
                {label}
            </div>
        </div>
    )
}

// ============================================================================
// TRANSACTION ROW COMPONENT
// ============================================================================

interface TransactionRowProps {
    transaction: Transaction
    onViewInvoice: (transactionId: string) => void
}

function TransactionRow({ transaction, onViewInvoice }: TransactionRowProps) {
    const date = new Date(transaction.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })

    const isPositive = transaction.amount > 0
    const isRefund = transaction.type === 'refund'

    return (
        <div className="
      p-4
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
      hover:shadow-md
      transition-shadow
    ">
            <div className="flex items-start justify-between">
                {/* Left side - Transaction info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {transaction.tourTitle || transaction.description}
                        </span>
                        <StatusBadge status={transaction.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{date}</span>
                        {transaction.bookingReference && (
                            <>
                                <span>•</span>
                                <span>Ref: {transaction.bookingReference}</span>
                            </>
                        )}
                        {transaction.estimatedRelease && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Releases {new Date(transaction.estimatedRelease).toLocaleDateString()}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Fee breakdown */}
                    {transaction.platformFee !== undefined && (
                        <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                                Platform fee: ${Math.abs(transaction.platformFee).toFixed(2)}
                            </span>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                                Your earnings: ${Math.abs(transaction.guideEarnings || transaction.amount).toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right side - Amount and actions */}
                <div className="flex items-center gap-3">
                    <div className={`text-right font-bold ${isRefund ? 'text-red-600' : isPositive ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {isPositive ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </div>

                    {transaction.invoiceUrl && (
                        <button
                            onClick={() => onViewInvoice(transaction.id)}
                            className="
                p-2
                text-gray-500 hover:text-gray-700
                dark:text-gray-400 dark:hover:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-800
                rounded-lg
                transition-colors
              "
                            title="View Invoice"
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Error message for failed transactions */}
            {transaction.status === 'failed' && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-300">
                        Payout failed. Please update your payout method and try again.
                    </p>
                </div>
            )}
        </div>
    )
}

// ============================================================================
// PAYOUT METHOD CARD COMPONENT
// ============================================================================

interface PayoutMethodCardProps {
    method: PayoutMethod
    onSetDefault: (id: string) => void
    onRemove: (id: string) => void
    onEdit: (id: string) => void
}

function PayoutMethodCard({ method, onSetDefault, onRemove, onEdit }: PayoutMethodCardProps) {
    const getIcon = () => {
        switch (method.type) {
            case 'bank': return Landmark
            case 'card': return CreditCard
            case 'whish': return Wallet
            case 'paypal': return Globe
            default: return CreditCard
        }
    }

    const Icon = getIcon()

    return (
        <div className="
      p-4
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
      relative
    ">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="
            w-10 h-10
            bg-gray-100 dark:bg-gray-800
            rounded-lg
            flex items-center justify-center
          ">
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                {method.name}
                            </h4>
                            {method.isDefault && (
                                <span className="
                  px-1.5 py-0.5
                  bg-blue-100 dark:bg-blue-900/30
                  text-blue-700 dark:text-blue-300
                  text-xs font-medium
                  rounded
                ">
                                    Default
                                </span>
                            )}
                            {method.verified ? (
                                <span className="
                  px-1.5 py-0.5
                  bg-emerald-100 dark:bg-emerald-900/30
                  text-emerald-700 dark:text-emerald-300
                  text-xs font-medium
                  rounded
                  flex items-center gap-0.5
                ">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                </span>
                            ) : (
                                <span className="
                  px-1.5 py-0.5
                  bg-amber-100 dark:bg-amber-900/30
                  text-amber-700 dark:text-amber-300
                  text-xs font-medium
                  rounded
                ">
                                    Unverified
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {method.details}
                        </p>
                        {method.lastUsed && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Last used: {new Date(method.lastUsed).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {!method.isDefault && (
                        <button
                            onClick={() => onSetDefault(method.id)}
                            className="
                p-2
                text-blue-600 hover:text-blue-700
                dark:text-blue-400 dark:hover:text-blue-300
                hover:bg-blue-50 dark:hover:bg-blue-950/30
                rounded-lg
                transition-colors
              "
                            title="Set as default"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(method.id)}
                        className="
              p-2
              text-gray-500 hover:text-gray-700
              dark:text-gray-400 dark:hover:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-800
              rounded-lg
              transition-colors
            "
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onRemove(method.id)}
                        className="
              p-2
              text-red-600 hover:text-red-700
              dark:text-red-400 dark:hover:text-red-300
              hover:bg-red-50 dark:hover:bg-red-950/30
              rounded-lg
              transition-colors
            "
                        title="Remove"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// FEE TIER INFO COMPONENT
// ============================================================================

function FeeTierInfo() {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
      p-6
    ">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Fee Tiers & Impact Score
                </h3>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {expanded ? 'Show less' : 'Learn more'}
                </button>
            </div>

            <div className="space-y-3">
                {MOCK_FEE_TIERS.map((tier) => (
                    <div key={tier.tier} className="flex items-center gap-3">
                        <div className="w-16 text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                            {tier.tier}
                        </div>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${tier.tier === 'bronze' ? 'w-1/4 bg-amber-700/50' :
                                        tier.tier === 'silver' ? 'w-1/2 bg-gray-500' :
                                            tier.tier === 'gold' ? 'w-3/4 bg-amber-500' :
                                                'w-full bg-blue-500'
                                    }`}
                            />
                        </div>
                        <div className="w-16 text-sm font-semibold text-gray-900 dark:text-white">
                            {tier.commission}
                        </div>
                    </div>
                ))}
            </div>

            {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Your impact score is calculated based on:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>Number of completed tours</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>Average traveler rating</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>Response rate and time</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>Number of repeat travelers</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
}

// ============================================================================
// MAIN WALLET PAGE
// ============================================================================

export default function GuideWalletPage() {
    const [balance] = useState<BalanceSummary>(MOCK_BALANCE)
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
    const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>(MOCK_PAYOUT_METHODS)
    const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'all'>('all')

    const STATUS_OPTIONS = [
        { id: 'all', name: 'All Status' },
        { id: 'completed', name: 'Completed' },
        { id: 'pending', name: 'Pending' },
        { id: 'frozen', name: 'Frozen' },
        { id: 'failed', name: 'Failed' }
    ]

    const DATE_OPTIONS = [
        { id: 'all', name: 'All Time' },
        { id: 'week', name: 'This Week' },
        { id: 'month', name: 'This Month' },
        { id: 'year', name: 'This Year' }
    ]

    // Filter transactions
    const filteredTransactions = transactions.filter(transaction => {
        // Status filter
        if (filterStatus !== 'all' && transaction.status !== filterStatus) return false

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            return (
                transaction.tourTitle?.toLowerCase().includes(term) ||
                transaction.bookingReference?.toLowerCase().includes(term) ||
                transaction.description.toLowerCase().includes(term)
            )
        }

        return true
    })

    const handleViewInvoice = (transactionId: string) => {
        // In Phase 4: Open PDF or download
        console.log('View invoice for:', transactionId)
    }

    const handleSetDefaultPayout = (methodId: string) => {
        setPayoutMethods(prev =>
            prev.map(m => ({
                ...m,
                isDefault: m.id === methodId
            }))
        )
    }

    const handleRemovePayoutMethod = (methodId: string) => {
        setPayoutMethods(prev => prev.filter(m => m.id !== methodId))
    }

    const handleEditPayoutMethod = (methodId: string) => {
        console.log('Edit payout method:', methodId)
    }

    const handleAddPayoutMethod = () => {
        console.log('Add payout method')
    }

    const handleRequestPayout = () => {
        console.log('Request payout')
    }

    return (
        <>
            {/* Page offset */}
            <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">

                <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                Wallet & Earnings
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage your payouts, view transaction history, and track your earnings
                            </p>
                        </div>

                        <button
                            onClick={handleRequestPayout}
                            className="
                flex items-center gap-2
                px-4 py-2
                bg-blue-600 hover:bg-blue-700
                text-white
                rounded-lg
                transition-colors
                self-start
              "
                        >
                            <DollarSign className="w-4 h-4" />
                            Request Payout
                        </button>
                    </div>

                    {/* Balance and Stats Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                        {/* Balance Card - spans 2 columns on desktop */}
                        <div className="lg:col-span-2">
                            <BalanceCard balance={balance} />
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                            <StatCard
                                icon={TrendingUp}
                                label="Total Earned"
                                value={`$${balance.totalEarned.toFixed(2)}`}
                                color="emerald"
                            />
                            <StatCard
                                icon={TrendingDown}
                                label="Platform Fees"
                                value={`$${balance.platformFees.toFixed(2)}`}
                                color="amber"
                            />
                            <StatCard
                                icon={Award}
                                label="Impact Score"
                                value={balance.impactScore.toString()}
                                change="+5"
                                color="purple"
                            />
                            <StatCard
                                icon={Sparkles}
                                label="Fee Discount"
                                value={`${balance.feeDiscount}%`}
                                color="blue"
                            />
                        </div>
                    </div>

                    {/* Payout Methods Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Payout Methods
                            </h2>
                            <button
                                onClick={handleAddPayoutMethod}
                                className="
                  flex items-center gap-1
                  text-sm text-blue-600 dark:text-blue-400
                  hover:text-blue-700 dark:hover:text-blue-300
                "
                            >
                                <Plus className="w-4 h-4" />
                                Add Method
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {payoutMethods.map(method => (
                                <PayoutMethodCard
                                    key={method.id}
                                    method={method}
                                    onSetDefault={handleSetDefaultPayout}
                                    onRemove={handleRemovePayoutMethod}
                                    onEdit={handleEditPayoutMethod}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Transactions Section */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Transaction History
                            </h2>

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Status Filter */}
                                <div className="relative w-40">
                                    <Listbox value={filterStatus} onChange={setFilterStatus}>
                                        <div className="relative">
                                            <ListboxButton className="
                        relative w-full flex items-center justify-between
                        px-3 py-1.5
                        bg-white dark:bg-gray-900 
                        border border-gray-200 dark:border-gray-800 
                        rounded-xl text-sm text-left 
                        text-gray-900 dark:text-white 
                        hover:border-blue-400 dark:hover:border-blue-500 
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                        transition-all duration-200 shadow-sm
                      ">
                                                <span className="flex items-center gap-2 truncate">
                                                    <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                                    <span className="truncate">
                                                        {STATUS_OPTIONS.find(opt => opt.id === filterStatus)?.name}
                                                    </span>
                                                </span>
                                                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 transition-transform duration-200 ui-open:rotate-180" />
                                            </ListboxButton>

                                            <Transition
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <ListboxOptions className="
                          absolute z-50 mt-1.5 max-h-60 w-full overflow-auto 
                          rounded-xl bg-white dark:bg-gray-900 
                          py-1.5 text-sm shadow-xl ring-1 ring-black/5 dark:ring-white/10 
                          focus:outline-none scrollbar-hide
                        ">
                                                    {STATUS_OPTIONS.map((option) => (
                                                        <ListboxOption
                                                            key={option.id}
                                                            value={option.id}
                                                            className={({ focus, selected }) => `
                                relative cursor-default select-none py-2 px-8 transition-colors
                                ${focus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}
                                ${selected ? 'font-semibold' : 'font-normal'}
                              `}
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                                        {option.name}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-blue-600 dark:text-blue-400">
                                                                            <Check className="w-3.5 h-3.5" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </ListboxOption>
                                                    ))}
                                                </ListboxOptions>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                </div>

                                {/* Date Range Filter */}
                                <div className="relative w-36">
                                    <Listbox value={dateRange} onChange={setDateRange}>
                                        <div className="relative">
                                            <ListboxButton className="
                        relative w-full flex items-center justify-between
                        px-3 py-1.5
                        bg-white dark:bg-gray-900 
                        border border-gray-200 dark:border-gray-800 
                        rounded-xl text-sm text-left 
                        text-gray-900 dark:text-white 
                        hover:border-blue-400 dark:hover:border-blue-500 
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                        transition-all duration-200 shadow-sm
                      ">
                                                <span className="flex items-center gap-2 truncate">
                                                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                                    <span className="truncate">
                                                        {DATE_OPTIONS.find(opt => opt.id === dateRange)?.name}
                                                    </span>
                                                </span>
                                                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 transition-transform duration-200 ui-open:rotate-180" />
                                            </ListboxButton>

                                            <Transition
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <ListboxOptions className="
                          absolute z-50 mt-1.5 max-h-60 w-full overflow-auto 
                          rounded-xl bg-white dark:bg-gray-900 
                          py-1.5 text-sm shadow-xl ring-1 ring-black/5 dark:ring-white/10 
                          focus:outline-none scrollbar-hide
                        ">
                                                    {DATE_OPTIONS.map((option) => (
                                                        <ListboxOption
                                                            key={option.id}
                                                            value={option.id}
                                                            className={({ focus, selected }) => `
                                relative cursor-default select-none py-2 px-8 transition-colors
                                ${focus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}
                                ${selected ? 'font-semibold' : 'font-normal'}
                              `}
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                                        {option.name}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-blue-600 dark:text-blue-400">
                                                                            <Check className="w-3.5 h-3.5" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </ListboxOption>
                                                    ))}
                                                </ListboxOptions>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search transactions by tour, reference, or description..."
                                className="
                  w-full
                  pl-9 pr-4 py-2
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-800
                  rounded-lg
                  text-sm
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                            />
                        </div>

                        {/* Transactions List */}
                        <div className="space-y-3">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map(transaction => (
                                    <TransactionRow
                                        key={transaction.id}
                                        transaction={transaction}
                                        onViewInvoice={handleViewInvoice}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No transactions found
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Load More (pagination) */}
                        {filteredTransactions.length > 0 && (
                            <div className="flex justify-center mt-6">
                                <button className="
                  px-4 py-2
                  bg-gray-100 dark:bg-gray-800
                  text-gray-700 dark:text-gray-300
                  rounded-lg
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  transition-colors
                  flex items-center gap-2
                ">
                                    <RefreshCw className="w-4 h-4" />
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Fee Tier Information */}
                    <div className="mt-8">
                        <FeeTierInfo />
                    </div>

                    {/* 48-Hour Freeze Explanation */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                48-Hour Payout Freeze
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                Funds are held for 48 hours after tour completion to ensure traveler satisfaction
                                and resolve any disputes. This protects both you and the traveler.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}