// ============================================================================
// GUIDE PROMO CODE FACTORY - CARD 20
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/promos/page.tsx
// 
// PURPOSE: Create and manage promotional codes for tours
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Create promo codes for discounts
// ✓ Discount can come from guide or platform
// ✓ Set expiration dates
// ✓ Usage limits
// ✓ Track redemption stats
// ✓ Performance analytics
// 
// DISCOUNT TYPES:
// - Guide-funded: Discount comes from guide's earnings
// - Platform-funded: Discount covered by platform
// - Fixed amount: e.g., $20 off
// - Percentage: e.g., 15% off
// 
// COLOR PSYCHOLOGY:
// - Blue: Active promos, primary actions
// - Green: High redemption, successful promos
// - Amber: Expiring soon, warnings
// - Red: Expired, inactive
// - Purple: Platform-funded promos
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import {
    Ticket,
    Plus,
    Copy,
    Trash2,
    Edit,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    Users,
    DollarSign,
    Percent,
    TrendingUp,
    TrendingDown,
    Award,
    Sparkles,
    Shield,
    AlertCircle,
    Info,
    HelpCircle,
    Search,
    Filter,
    ChevronRight,
    ChevronLeft,
    Download,
    Printer,
    Eye,
    EyeOff,
    RefreshCw,
    Gift,
    Zap,
    ChevronDown,
    Check
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    Transition,
    Popover,
    PopoverButton,
    PopoverPanel
} from '@headlessui/react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type DiscountType = 'percentage' | 'fixed'
type FundSource = 'guide' | 'platform'
type PromoStatus = 'active' | 'expired' | 'scheduled' | 'paused' | 'depleted'
type ApplicableTo = 'all' | 'specific' | 'new' | 'repeat'

interface PromoCode {
    id: string
    code: string
    description: string
    discountType: DiscountType
    discountValue: number
    fundSource: FundSource
    status: PromoStatus
    applicableTo: ApplicableTo
    applicableTours?: string[] // Tour IDs if applicableTo = 'specific'
    minSpend?: number
    maxDiscount?: number
    usageLimit?: number
    usageCount: number
    perUserLimit?: number
    startDate: string
    endDate?: string
    createdAt: string
    updatedAt: string
    performance: {
        revenue: number
        bookings: number
        averageOrderValue: number
        redemptions: number
    }
}

interface PromoStats {
    totalActive: number
    totalRedemptions: number
    totalRevenue: number
    averageRedemptionRate: number
    topPerformingCode: string
    platformFundedCount: number
    guideFundedCount: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_PROMOS: PromoCode[] = [
    {
        id: 'promo1',
        code: 'WELCOME10',
        description: '10% off for new travelers',
        discountType: 'percentage',
        discountValue: 10,
        fundSource: 'platform',
        status: 'active',
        applicableTo: 'new',
        minSpend: 50,
        maxDiscount: 30,
        usageLimit: 100,
        usageCount: 45,
        perUserLimit: 1,
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-12-31T23:59:59Z',
        createdAt: '2025-12-15T10:30:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        performance: {
            revenue: 2250,
            bookings: 45,
            averageOrderValue: 50,
            redemptions: 45
        }
    },
    {
        id: 'promo2',
        code: 'SUMMER20',
        description: '$20 off summer tours',
        discountType: 'fixed',
        discountValue: 20,
        fundSource: 'guide',
        status: 'active',
        applicableTo: 'all',
        minSpend: 100,
        usageLimit: 50,
        usageCount: 28,
        perUserLimit: 1,
        startDate: '2026-06-01T00:00:00Z',
        endDate: '2026-08-31T23:59:59Z',
        createdAt: '2026-05-20T14:15:00Z',
        updatedAt: '2026-06-01T00:00:00Z',
        performance: {
            revenue: 2800,
            bookings: 28,
            averageOrderValue: 100,
            redemptions: 28
        }
    },
    {
        id: 'promo3',
        code: 'FAMILY5',
        description: '5% off for families of 4+',
        discountType: 'percentage',
        discountValue: 5,
        fundSource: 'guide',
        status: 'active',
        applicableTo: 'all',
        usageLimit: 200,
        usageCount: 156,
        perUserLimit: 1,
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-12-31T23:59:59Z',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        performance: {
            revenue: 7800,
            bookings: 156,
            averageOrderValue: 50,
            redemptions: 156
        }
    },
    {
        id: 'promo4',
        code: 'EARLYBIRD',
        description: '15% off for early bookings',
        discountType: 'percentage',
        discountValue: 15,
        fundSource: 'platform',
        status: 'scheduled',
        applicableTo: 'all',
        minSpend: 75,
        maxDiscount: 50,
        usageLimit: 100,
        usageCount: 0,
        perUserLimit: 1,
        startDate: '2026-09-01T00:00:00Z',
        endDate: '2026-11-30T23:59:59Z',
        createdAt: '2026-08-01T09:00:00Z',
        updatedAt: '2026-08-01T09:00:00Z',
        performance: {
            revenue: 0,
            bookings: 0,
            averageOrderValue: 0,
            redemptions: 0
        }
    },
    {
        id: 'promo5',
        code: 'FLASH25',
        description: '25% off flash sale',
        discountType: 'percentage',
        discountValue: 25,
        fundSource: 'platform',
        status: 'expired',
        applicableTo: 'all',
        minSpend: 100,
        maxDiscount: 75,
        usageLimit: 50,
        usageCount: 50,
        perUserLimit: 1,
        startDate: '2026-07-01T00:00:00Z',
        endDate: '2026-07-07T23:59:59Z',
        createdAt: '2026-06-15T11:30:00Z',
        updatedAt: '2026-07-08T00:00:00Z',
        performance: {
            revenue: 5000,
            bookings: 50,
            averageOrderValue: 100,
            redemptions: 50
        }
    },
    {
        id: 'promo6',
        code: 'REPEAT15',
        description: '15% off for returning travelers',
        discountType: 'percentage',
        discountValue: 15,
        fundSource: 'guide',
        status: 'active',
        applicableTo: 'repeat',
        minSpend: 60,
        maxDiscount: 40,
        usageLimit: 150,
        usageCount: 89,
        perUserLimit: 3,
        startDate: '2026-02-01T00:00:00Z',
        endDate: '2026-12-31T23:59:59Z',
        createdAt: '2026-01-15T16:20:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
        performance: {
            revenue: 5340,
            bookings: 89,
            averageOrderValue: 60,
            redemptions: 89
        }
    }
]

const MOCK_PROMO_STATS: PromoStats = {
    totalActive: 4,
    totalRedemptions: 368,
    totalRevenue: 23190,
    averageRedemptionRate: 68.5,
    topPerformingCode: 'FAMILY5',
    platformFundedCount: 3,
    guideFundedCount: 3
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
    status: PromoStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
    const config = {
        active: {
            bg: 'bg-emerald-100 dark:bg-emerald-950/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: CheckCircle,
            label: 'Active'
        },
        expired: {
            bg: 'bg-red-100 dark:bg-red-950/30',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-200 dark:border-red-800',
            icon: XCircle,
            label: 'Expired'
        },
        scheduled: {
            bg: 'bg-blue-100 dark:bg-blue-950/30',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800',
            icon: Clock,
            label: 'Scheduled'
        },
        paused: {
            bg: 'bg-amber-100 dark:bg-amber-950/30',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-800',
            icon: AlertCircle,
            label: 'Paused'
        },
        depleted: {
            bg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-700 dark:text-gray-300',
            border: 'border-gray-200 dark:border-gray-700',
            icon: XCircle,
            label: 'Depleted'
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
// FUND SOURCE BADGE COMPONENT
// ============================================================================

interface FundSourceBadgeProps {
    source: FundSource
}

function FundSourceBadge({ source }: FundSourceBadgeProps) {
    return source === 'platform' ? (
        <span className="
      inline-flex items-center gap-1
      px-2 py-1
      bg-purple-100 dark:bg-purple-950/30
      text-purple-700 dark:text-purple-300
      text-xs font-medium
      rounded-full
    ">
            <Sparkles className="w-3 h-3" />
            Platform
        </span>
    ) : (
        <span className="
      inline-flex items-center gap-1
      px-2 py-1
      bg-blue-100 dark:bg-blue-950/30
      text-blue-700 dark:text-blue-300
      text-xs font-medium
      rounded-full
    ">
            <Award className="w-3 h-3" />
            Guide
        </span>
    )
}

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

interface StatCardProps {
    icon: React.ElementType
    label: string
    value: string | number
    subtext?: string
    trend?: 'up' | 'down'
    trendValue?: string
    color: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink'
}

function StatCard({ icon: Icon, label, value, subtext, trend, trendValue, color }: StatCardProps) {
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
                {trend && (
                    <span className={`
            text-xs font-medium
            ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
          `}>
                        {trendValue}
                    </span>
                )}
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
                {value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
                {label}
            </div>
            {subtext && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {subtext}
                </div>
            )}
        </div>
    )
}

// ============================================================================
// PROMO CARD COMPONENT
// ============================================================================

interface PromoCardProps {
    promo: PromoCode
    onEdit: (id: string) => void
    onDuplicate: (id: string) => void
    onDelete: (id: string) => void
}

function PromoCard({ promo, onEdit, onDuplicate, onDelete }: PromoCardProps) {
    const [showDetails, setShowDetails] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopyCode = () => {
        navigator.clipboard.writeText(promo.code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const startDate = new Date(promo.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })

    const endDate = promo.endDate ? new Date(promo.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : 'No expiry'

    const redemptionRate = promo.usageLimit
        ? Math.round((promo.usageCount / promo.usageLimit) * 100)
        : null

    const daysUntilEnd = promo.endDate
        ? Math.ceil((new Date(promo.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null

    return (
        <div className="
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
      overflow-hidden
      hover:shadow-lg
      transition-shadow
    ">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="
              w-10 h-10
              bg-blue-100 dark:bg-blue-900/30
              rounded-lg
              flex items-center justify-center
            ">
                            <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white font-mono">
                                    {promo.code}
                                </h3>
                                <button
                                    onClick={handleCopyCode}
                                    className="
                    p-1
                    text-gray-400 hover:text-gray-600
                    dark:text-gray-500 dark:hover:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    rounded
                    transition-colors
                  "
                                    title="Copy code"
                                >
                                    {copied ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {promo.description}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <StatusBadge status={promo.status} />
                        <FundSourceBadge source={promo.fundSource} />
                    </div>
                </div>

                {/* Discount Display */}
                <div className="flex items-center gap-4">
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {promo.discountType === 'percentage' ? 'Percentage off' : 'Fixed amount'}
                        </div>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />
                    <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {promo.usageCount} / {promo.usageLimit || '∞'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Redemptions
                        </div>
                    </div>
                </div>

                {/* Progress bar (if limited) */}
                {promo.usageLimit && (
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500 dark:text-gray-400">Usage</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {redemptionRate}%
                            </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${redemptionRate && redemptionRate > 80 ? 'bg-red-500' :
                                    redemptionRate && redemptionRate > 50 ? 'bg-amber-500' :
                                        'bg-emerald-500'
                                    }`}
                                style={{ width: `${redemptionRate}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Details Toggle */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="
          w-full
          px-5 py-2
          bg-gray-50 dark:bg-gray-800/50
          text-xs text-gray-600 dark:text-gray-400
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-colors
          flex items-center justify-between
        "
            >
                <span>View details</span>
                {showDetails ? <ChevronRight className="w-3 h-3 rotate-90" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            {/* Expanded Details */}
            {showDetails && (
                <div className="p-5 space-y-4">
                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</div>
                            <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                                <Calendar className="w-3 h-3" />
                                {startDate}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</div>
                            <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                                <Calendar className="w-3 h-3" />
                                {endDate}
                            </div>
                        </div>
                    </div>

                    {/* Restrictions */}
                    <div className="space-y-2">
                        {promo.minSpend && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Minimum spend</span>
                                <span className="font-medium text-gray-900 dark:text-white">${promo.minSpend}</span>
                            </div>
                        )}
                        {promo.maxDiscount && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Maximum discount</span>
                                <span className="font-medium text-gray-900 dark:text-white">${promo.maxDiscount}</span>
                            </div>
                        )}
                        {promo.perUserLimit && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Per user limit</span>
                                <span className="font-medium text-gray-900 dark:text-white">{promo.perUserLimit} use(s)</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Applicable to</span>
                            <span className="font-medium text-gray-900 dark:text-white capitalize">
                                {promo.applicableTo} travelers
                            </span>
                        </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Performance
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
                                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    ${promo.performance.revenue}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Bookings</div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                    {promo.performance.bookings}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Order</div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                    ${promo.performance.averageOrderValue}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Redemptions</div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                    {promo.performance.redemptions}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expiry Warning */}
                    {daysUntilEnd && daysUntilEnd <= 7 && daysUntilEnd > 0 && promo.status === 'active' && (
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg flex items-start gap-2">
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 dark:text-amber-300">
                                Expires in {daysUntilEnd} days
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Actions Footer */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-2">
                <button
                    onClick={() => onEdit(promo.id)}
                    className="
            p-2
            text-gray-500 hover:text-gray-700
            dark:text-gray-400 dark:hover:text-gray-200
            hover:bg-gray-200 dark:hover:bg-gray-700
            rounded-lg
            transition-colors
          "
                    title="Edit"
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDuplicate(promo.id)}
                    className="
            p-2
            text-gray-500 hover:text-gray-700
            dark:text-gray-400 dark:hover:text-gray-200
            hover:bg-gray-200 dark:hover:bg-gray-700
            rounded-lg
            transition-colors
          "
                    title="Duplicate"
                >
                    <Copy className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(promo.id)}
                    className="
            p-2
            text-red-600 hover:text-red-700
            dark:text-red-400 dark:hover:text-red-300
            hover:bg-red-50 dark:hover:bg-red-950/30
            rounded-lg
            transition-colors
          "
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

// ============================================================================
// CUSTOM DATE PICKER COMPONENT
// ============================================================================

interface CustomDatePickerProps {
    label: string
    value: string
    onChange: (date: string) => void
    required?: boolean
    minDate?: string
}

function CustomDatePicker({ label, value, onChange, required, minDate }: CustomDatePickerProps) {
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const monthName = viewDate.toLocaleString('default', { month: 'long' })

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

    const handleSelectDay = (day: number) => {
        const selectedDate = new Date(year, month, day)
        // Format to YYYY-MM-DD for consistency with input[type=date]
        const formatted = selectedDate.toISOString().split('T')[0]
        onChange(formatted)
    }

    const isToday = (day: number) => {
        const today = new Date()
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
    }

    const isSelected = (day: number) => {
        if (!value) return false
        const d = new Date(value)
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
    }

    const calendarDays: (number | null)[] = []
    const firstDay = firstDayOfMonth(year, month)
    const daysCount = daysInMonth(year, month)

    // Padding for start of month
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null)
    }
    // Actual days
    for (let i = 1; i <= daysCount; i++) {
        calendarDays.push(i)
    }

    const displayValue = value ? new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : 'Select date'

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Popover className="relative">
                <PopoverButton className="
          w-full flex items-center gap-2
          px-3 py-2
          bg-gray-50 dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-xl
          text-sm text-left
          text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all duration-200
        ">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                        {displayValue}
                    </span>
                </PopoverButton>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                >
                    <PopoverPanel className="
            absolute z-50 mt-2 p-4
            w-72 sm:w-80
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-800
            rounded-2xl
            shadow-2xl
            focus:outline-none
          ">
                        {({ close }) => (
                            <>
                                {/* Calendar Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        type="button"
                                        onClick={prevMonth}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                        {monthName} {year}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={nextMonth}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Week Days */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                        <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase">
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((day, idx) => (
                                        <div key={idx} className="h-8 flex items-center justify-center">
                                            {day ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleSelectDay(day)
                                                        close()
                                                    }}
                                                    className={`
                            w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all
                            ${isSelected(day)
                                                            ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-500/20'
                                                            : isToday(day)
                                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                          `}
                                                >
                                                    {day}
                                                </button>
                                            ) : (
                                                <div className="w-8 h-8" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </PopoverPanel>
                </Transition>
            </Popover>
        </div>
    )
}

// ============================================================================
// CREATE PROMO MODAL
// ============================================================================

interface CreatePromoModalProps {
    isOpen: boolean
    onClose: () => void
    onCreate: (promoData: any) => void
}

function CreatePromoModal({ isOpen, onClose, onCreate }: CreatePromoModalProps) {
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage' as DiscountType,
        discountValue: 10,
        fundSource: 'guide' as FundSource,
        applicableTo: 'all' as ApplicableTo,
        minSpend: '',
        maxDiscount: '',
        usageLimit: '',
        perUserLimit: '1',
        startDate: '',
        endDate: '',
        hasEndDate: false
    })

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onCreate(formData)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="
        w-full max-w-2xl
        bg-white dark:bg-gray-900
        rounded-2xl
        shadow-2xl
        max-h-[90vh]
        overflow-y-auto
      ">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Gift className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Create New Promo Code
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            <XCircle className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Promo Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            className="
                w-full
                px-3 py-2
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                font-mono
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
                            placeholder="e.g., SUMMER20"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="
                w-full
                px-3 py-2
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
                            placeholder="e.g., 20% off summer tours"
                        />
                    </div>

                    {/* Discount Type and Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Discount Type
                            </label>
                            <Listbox
                                value={formData.discountType}
                                onChange={(val) => setFormData({ ...formData, discountType: val })}
                            >
                                <div className="relative">
                                    <ListboxButton className="
                    relative w-full flex items-center justify-between
                    px-3 py-2
                    bg-gray-50 dark:bg-gray-800 
                    border border-gray-200 dark:border-gray-700 
                    rounded-xl text-sm text-left 
                    text-gray-900 dark:text-white 
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition-all duration-200
                  ">
                                        <span className="truncate">
                                            {formData.discountType === 'percentage' ? 'Percentage (%)' : 'Fixed Amount ($)'}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                    </ListboxButton>
                                    <Transition
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <ListboxOptions className="
                      absolute z-50 mt-1 max-h-60 w-full overflow-auto 
                      rounded-xl bg-white dark:bg-gray-900 
                      py-1 text-sm shadow-xl ring-1 ring-black/5 dark:ring-white/10 
                      focus:outline-none
                    ">
                                            <ListboxOption
                                                value="percentage"
                                                className={({ focus, selected }) => `
                          relative cursor-default select-none py-2 px-4 transition-colors
                          ${focus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}
                          ${selected ? 'font-semibold' : 'font-normal'}
                        `}
                                            >
                                                Percentage (%)
                                            </ListboxOption>
                                            <ListboxOption
                                                value="fixed"
                                                className={({ focus, selected }) => `
                          relative cursor-default select-none py-2 px-4 transition-colors
                          ${focus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}
                          ${selected ? 'font-semibold' : 'font-normal'}
                        `}
                                            >
                                                Fixed Amount ($)
                                            </ListboxOption>
                                        </ListboxOptions>
                                    </Transition>
                                </div>
                            </Listbox>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Discount Value
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) })}
                                className="
                  w-full
                  px-3 py-2
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-xl
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                                required
                            />
                        </div>
                    </div>

                    {/* Fund Source */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fund Source
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={formData.fundSource === 'guide'}
                                    onChange={() => setFormData({ ...formData, fundSource: 'guide' })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Guide-funded</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={formData.fundSource === 'platform'}
                                    onChange={() => setFormData({ ...formData, fundSource: 'platform' })}
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Platform-funded</span>
                            </label>
                        </div>
                    </div>

                    {/* Applicable To */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Applicable To
                        </label>
                        <Listbox
                            value={formData.applicableTo}
                            onChange={(val) => setFormData({ ...formData, applicableTo: val })}
                        >
                            <div className="relative">
                                <ListboxButton className="
                  relative w-full flex items-center justify-between
                  px-3 py-2
                  bg-gray-50 dark:bg-gray-800 
                  border border-gray-200 dark:border-gray-700 
                  rounded-xl text-sm text-left 
                  text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition-all duration-200
                ">
                                    <span className="truncate">
                                        {formData.applicableTo === 'all' ? 'All travelers' :
                                            formData.applicableTo === 'new' ? 'New travelers only' :
                                                'Repeat travelers only'}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                </ListboxButton>
                                <Transition
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <ListboxOptions className="
                    absolute z-50 mt-1 max-h-60 w-full overflow-auto 
                    rounded-xl bg-white dark:bg-gray-900 
                    py-1 text-sm shadow-xl ring-1 ring-black/5 dark:ring-white/10 
                    focus:outline-none
                  ">
                                        {[
                                            { id: 'all', name: 'All travelers' },
                                            { id: 'new', name: 'New travelers only' },
                                            { id: 'repeat', name: 'Repeat travelers only' }
                                        ].map((opt) => (
                                            <ListboxOption
                                                key={opt.id}
                                                value={opt.id}
                                                className={({ focus, selected }) => `
                          relative cursor-default select-none py-2 px-4 transition-colors
                          ${focus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}
                          ${selected ? 'font-semibold' : 'font-normal'}
                        `}
                                            >
                                                {opt.name}
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>

                    {/* Limits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Min. Spend (optional)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.minSpend}
                                onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                                className="
                  w-full
                  px-3 py-2
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                                placeholder="e.g., 50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Max Discount (optional)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.maxDiscount}
                                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                className="
                  w-full
                  px-3 py-2
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                                placeholder="e.g., 30"
                            />
                        </div>
                    </div>

                    {/* Usage Limits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Total Usage Limit
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.usageLimit}
                                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                className="
                  w-full
                  px-3 py-2
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                                placeholder="Leave empty for unlimited"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Per User Limit
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.perUserLimit}
                                onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                                className="
                  w-full
                  px-3 py-2
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <CustomDatePicker
                            label="Start Date"
                            value={formData.startDate}
                            onChange={(date) => setFormData({ ...formData, startDate: date })}
                            required
                        />
                        <div className="space-y-1">
                            <label className="flex items-center gap-2 mb-1.5">
                                <input
                                    type="checkbox"
                                    checked={formData.hasEndDate}
                                    onChange={(e) => setFormData({ ...formData, hasEndDate: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                                    Has end date
                                </span>
                            </label>
                            {formData.hasEndDate ? (
                                <CustomDatePicker
                                    label=""
                                    value={formData.endDate}
                                    onChange={(date) => setFormData({ ...formData, endDate: date })}
                                />
                            ) : (
                                <div className="h-[38px] flex items-center px-3 text-xs text-gray-400 dark:text-gray-600 italic">
                                    No expiration
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="
                flex-1
                px-4 py-2
                bg-blue-600 hover:bg-blue-700
                text-white font-medium
                rounded-lg
                transition-colors
              "
                        >
                            Create Promo Code
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="
                flex-1
                px-4 py-2
                bg-gray-100 dark:bg-gray-800
                text-gray-700 dark:text-gray-300
                rounded-lg
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition-colors
              "
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ============================================================================
// DELETE CONFIRMATION MODAL
// ============================================================================

interface DeleteConfirmModalProps {
    isOpen: boolean
    promoCode: string
    onClose: () => void
    onConfirm: () => void
}

function DeleteConfirmModal({ isOpen, promoCode, onClose, onConfirm }: DeleteConfirmModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="
        w-full max-w-md
        bg-white dark:bg-gray-900
        rounded-2xl
        shadow-2xl
        overflow-hidden
      ">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="
              w-10 h-10
              bg-red-100 dark:bg-red-900/30
              rounded-full
              flex items-center justify-center
            ">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Delete Promo Code
                        </h3>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Are you sure you want to delete <span className="font-mono font-bold text-gray-900 dark:text-white">{promoCode}</span>?
                        This action cannot be undone.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onConfirm}
                            className="
                flex-1
                px-4 py-2
                bg-red-600 hover:bg-red-700
                text-white font-medium
                rounded-lg
                transition-colors
              "
                        >
                            Delete
                        </button>
                        <button
                            onClick={onClose}
                            className="
                flex-1
                px-4 py-2
                bg-gray-100 dark:bg-gray-800
                text-gray-700 dark:text-gray-300
                rounded-lg
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition-colors
              "
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
// MAIN PAGE
// ============================================================================

export default function GuidePromosPage() {
    const [promos, setPromos] = useState<PromoCode[]>(MOCK_PROMOS)
    const [stats] = useState<PromoStats>(MOCK_PROMO_STATS)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null)
    const [filterStatus, setFilterStatus] = useState<PromoStatus | 'all'>('all')
    const [filterSource, setFilterSource] = useState<FundSource | 'all'>('all')
    const [searchTerm, setSearchTerm] = useState('')

    const STATUS_OPTIONS = [
        { id: 'all', name: 'All Status' },
        { id: 'active', name: 'Active' },
        { id: 'scheduled', name: 'Scheduled' },
        { id: 'expired', name: 'Expired' },
        { id: 'depleted', name: 'Depleted' }
    ]

    const SOURCE_OPTIONS = [
        { id: 'all', name: 'All Sources' },
        { id: 'guide', name: 'Guide-funded' },
        { id: 'platform', name: 'Platform-funded' }
    ]

    // Filter promos
    const filteredPromos = promos.filter(promo => {
        // Status filter
        if (filterStatus !== 'all' && promo.status !== filterStatus) return false

        // Source filter
        if (filterSource !== 'all' && promo.fundSource !== filterSource) return false

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            return (
                promo.code.toLowerCase().includes(term) ||
                promo.description.toLowerCase().includes(term)
            )
        }

        return true
    })

    const handleEdit = (id: string) => {
        console.log('Edit promo:', id)
        // In Phase 4: Open edit modal
    }

    const handleDuplicate = (id: string) => {
        const promo = promos.find(p => p.id === id)
        if (promo) {
            console.log('Duplicate promo:', promo)
            // In Phase 4: Create copy with -COPY suffix
        }
    }

    const handleDelete = (id: string) => {
        const promo = promos.find(p => p.id === id)
        if (promo) {
            setSelectedPromo(promo)
            setShowDeleteModal(true)
        }
    }

    const confirmDelete = () => {
        if (selectedPromo) {
            setPromos(prev => prev.filter(p => p.id !== selectedPromo.id))
            setShowDeleteModal(false)
            setSelectedPromo(null)
        }
    }

    const handleCreatePromo = (data: any) => {
        console.log('Create promo:', data)
        setShowCreateModal(false)
        // In Phase 4: API call to create promo
    }

    return (
        <PageLayout>
            {/* Page offset */}
            <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">

                <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                Promo Code Factory
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Create and manage promotional codes to attract more travelers
                            </p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
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
                            <Plus className="w-4 h-4" />
                            New Promo Code
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            icon={Ticket}
                            label="Active Promos"
                            value={stats.totalActive}
                            color="blue"
                        />
                        <StatCard
                            icon={Users}
                            label="Redemptions"
                            value={stats.totalRedemptions}
                            color="emerald"
                        />
                        <StatCard
                            icon={DollarSign}
                            label="Revenue"
                            value={`$${stats.totalRevenue}`}
                            color="amber"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Avg. Redemption"
                            value={`${stats.averageRedemptionRate}%`}
                            color="purple"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Filters:</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
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

                            {/* Source Filter */}
                            <div className="relative w-44">
                                <Listbox value={filterSource} onChange={setFilterSource}>
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
                                                <span className="truncate">
                                                    {SOURCE_OPTIONS.find(opt => opt.id === filterSource)?.name}
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
                                                {SOURCE_OPTIONS.map((option) => (
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
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by promo code or description..."
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

                    {/* Promos Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredPromos.length > 0 ? (
                            filteredPromos.map(promo => (
                                <PromoCard
                                    key={promo.id}
                                    promo={promo}
                                    onEdit={handleEdit}
                                    onDuplicate={handleDuplicate}
                                    onDelete={handleDelete}
                                />
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-12">
                                <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    No promo codes found
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Tips Section */}
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    Promo Code Tips
                                </h4>
                                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                                    <li>• Use memorable codes like SUMMER20 or FAMILY5</li>
                                    <li>• Platform-funded promos don't affect your earnings</li>
                                    <li>• Set usage limits to control your budget</li>
                                    <li>• Target new or repeat travelers for better results</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Promo Modal */}
            <CreatePromoModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreatePromo}
            />

            {/* Delete Confirmation Modal */}
            {selectedPromo && (
                <DeleteConfirmModal
                    isOpen={showDeleteModal}
                    promoCode={selectedPromo.code}
                    onClose={() => {
                        setShowDeleteModal(false)
                        setSelectedPromo(null)
                    }}
                    onConfirm={confirmDelete}
                />
            )}
        </PageLayout>
    )
}