// ============================================================================
// ADMIN PLATFORM DASHBOARD - CARD 23
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/admin/page.tsx
// 
// PURPOSE: Central monitoring dashboard for platform health, metrics, and alerts
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Monitor active tours
// ✓ Financial health overview
// ✓ System alerts
// ✓ User growth metrics
// ✓ Platform statistics
// ✓ Recent disputes
// ✓ Verification queue status
// 
// COLOR PSYCHOLOGY:
// - Blue: Primary metrics, active items
// - Green: Positive trends, healthy stats
// - Amber: Warnings, pending items
// - Red: Critical alerts, disputes
// - Purple: Premium, growth metrics
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Flag,
  Eye,
  EyeOff,
  Ban,
  Star,
  Award,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  Download,
  Printer,
  Filter,
  Info,
  HelpCircle,
  Bell,
  Settings,
  LogOut
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type TimeRange = 'today' | 'week' | 'month' | 'year'
type AlertSeverity = 'info' | 'warning' | 'critical' | 'success'
type DisputeStatus = 'pending' | 'resolved' | 'escalated'
type VerificationStatus = 'pending' | 'approved' | 'rejected'

interface PlatformStats {
  totalUsers: number
  activeTravelers: number
  activeGuides: number
  verifiedGuides: number
  pendingVerifications: number
  totalTours: number
  activeTours: number
  completedTours: number
  cancelledTours: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  completedBookings: number
  cancelledBookings: number
}

interface FinancialStats {
  totalRevenue: number
  platformFees: number
  pendingPayouts: number
  completedPayouts: number
  refundsIssued: number
  averageBookingValue: number
  currency: string
  growth: {
    revenue: number
    bookings: number
    users: number
  }
}

interface Alert {
  id: string
  type: 'system' | 'dispute' | 'verification' | 'payout' | 'tour'
  severity: AlertSeverity
  title: string
  description: string
  timestamp: string
  isRead: boolean
  link?: string
}

interface Dispute {
  id: string
  bookingId: string
  tourTitle: string
  travelerName: string
  guideName: string
  reason: string
  amount: number
  currency: string
  status: DisputeStatus
  filedAt: string
  priority: 'high' | 'medium' | 'low'
}

interface VerificationRequest {
  id: string
  guideId: string
  guideName: string
  guideEmail: string
  submittedAt: string
  documents: {
    id: boolean
    selfie: boolean
    certificate?: boolean
  }
  status: VerificationStatus
  priority: 'high' | 'medium' | 'low'
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_PLATFORM_STATS: PlatformStats = {
  totalUsers: 15432,
  activeTravelers: 12456,
  activeGuides: 1243,
  verifiedGuides: 987,
  pendingVerifications: 45,
  totalTours: 2345,
  activeTours: 1890,
  completedTours: 12450,
  cancelledTours: 234,
  totalBookings: 28900,
  pendingBookings: 345,
  confirmedBookings: 15678,
  completedBookings: 11234,
  cancelledBookings: 1643
}

const MOCK_FINANCIAL_STATS: FinancialStats = {
  totalRevenue: 1257800,
  platformFees: 188670,
  pendingPayouts: 45670,
  completedPayouts: 1256700,
  refundsIssued: 23450,
  averageBookingValue: 187,
  currency: 'USD',
  growth: {
    revenue: 23,
    bookings: 18,
    users: 15
  }
}

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'dispute',
    severity: 'critical',
    title: 'High-Priority Dispute Filed',
    description: 'Traveler vs Guide dispute over no-show. Amount: $450',
    timestamp: '2026-03-14T09:30:00Z',
    isRead: false,
    link: '/dashboard/admin/disputes/d1'
  },
  {
    id: '2',
    type: 'verification',
    severity: 'warning',
    title: '45 Pending Verifications',
    description: 'Guide ID verifications waiting for review',
    timestamp: '2026-03-14T08:15:00Z',
    isRead: false,
    link: '/dashboard/admin/verifications'
  },
  {
    id: '3',
    type: 'payout',
    severity: 'info',
    title: 'Batched Payouts Ready',
    description: '$45,670 in payouts ready for processing',
    timestamp: '2026-03-14T00:00:00Z',
    isRead: true,
    link: '/dashboard/admin/payouts'
  },
  {
    id: '4',
    type: 'system',
    severity: 'success',
    title: 'System Health Check',
    description: 'All systems operational. 99.9% uptime',
    timestamp: '2026-03-14T06:00:00Z',
    isRead: true
  },
  {
    id: '5',
    type: 'tour',
    severity: 'warning',
    title: 'Tour Capacity Alert',
    description: '12 tours have not met minimum capacity for tomorrow',
    timestamp: '2026-03-13T23:00:00Z',
    isRead: false,
    link: '/dashboard/admin/tours'
  }
]

const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'd1',
    bookingId: 'b123',
    tourTitle: 'Ottoman Heritage Tour',
    travelerName: 'Ahmed Khan',
    guideName: 'Mehmet Yilmaz',
    reason: 'Guide no-show at meeting point',
    amount: 450,
    currency: 'USD',
    status: 'pending',
    filedAt: '2026-03-14T09:30:00Z',
    priority: 'high'
  },
  {
    id: 'd2',
    bookingId: 'b124',
    tourTitle: 'Beirut Food Walk',
    travelerName: 'Fatima Hassan',
    guideName: 'Layla Hassan',
    reason: 'Tour duration shorter than advertised',
    amount: 175,
    currency: 'USD',
    status: 'pending',
    filedAt: '2026-03-13T14:20:00Z',
    priority: 'medium'
  },
  {
    id: 'd3',
    bookingId: 'b125',
    tourTitle: 'Cappadocia Balloon Ride',
    travelerName: 'Omar Farooq',
    guideName: 'Ahmet Demir',
    reason: 'Weather cancellation dispute',
    amount: 398,
    currency: 'USD',
    status: 'escalated',
    filedAt: '2026-03-12T11:15:00Z',
    priority: 'high'
  }
]

const MOCK_VERIFICATION_REQUESTS: VerificationRequest[] = [
  {
    id: 'v1',
    guideId: 'g123',
    guideName: 'Mehmet Yilmaz',
    guideEmail: 'mehmet.y@example.com',
    submittedAt: '2026-03-14T10:15:00Z',
    documents: {
      id: true,
      selfie: true,
      certificate: true
    },
    status: 'pending',
    priority: 'high'
  },
  {
    id: 'v2',
    guideId: 'g124',
    guideName: 'Layla Hassan',
    guideEmail: 'layla.h@example.com',
    submittedAt: '2026-03-14T09:30:00Z',
    documents: {
      id: true,
      selfie: true,
      certificate: false
    },
    status: 'pending',
    priority: 'medium'
  },
  {
    id: 'v3',
    guideId: 'g125',
    guideName: 'Ahmet Demir',
    guideEmail: 'ahmet.d@example.com',
    submittedAt: '2026-03-13T16:45:00Z',
    documents: {
      id: true,
      selfie: true
    },
    status: 'pending',
    priority: 'low'
  }
]

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  subtext?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink' | 'red'
  onClick?: () => void
}

function StatCard({ icon: Icon, label, value, subtext, trend, color, onClick }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
  }

  return (
    <div
      onClick={onClick}
      className={`
        p-5
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        rounded-xl
        ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`
          p-2.5
          rounded-lg
          ${colorClasses[color]}
        `}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.direction === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span className="text-xs font-medium">{trend.value}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </div>
        {subtext && (
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {subtext}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// ALERT ITEM COMPONENT
// ============================================================================

interface AlertItemProps {
  alert: Alert
  onMarkRead: (id: string) => void
}

function AlertItem({ alert, onMarkRead }: AlertItemProps) {
  const severityColors = {
    info: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    warning: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    critical: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    success: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
  }

  const time = new Date(alert.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <div className={`
      p-3
      border
      rounded-lg
      ${severityColors[alert.severity]}
      ${!alert.isRead ? 'ring-2 ring-offset-2' : ''}
    `}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-semibold text-sm">
          {alert.title}
        </h4>
        {!alert.isRead && (
          <span className="
            w-2 h-2
            bg-blue-600
            rounded-full
            animate-pulse
            flex-shrink-0
          " />
        )}
      </div>
      <p className="text-xs mb-2 opacity-90">
        {alert.description}
      </p>
      <div className="flex items-center justify-between text-xs">
        <span className="opacity-70">{time}</span>
        <div className="flex items-center gap-2">
          {alert.link && (
            <Link
              href={alert.link}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              View details
            </Link>
          )}
          {!alert.isRead && (
            <button
              onClick={() => onMarkRead(alert.id)}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// DISPUTE ROW COMPONENT
// ============================================================================

interface DisputeRowProps {
  dispute: Dispute
}

function DisputeRow({ dispute }: DisputeRowProps) {
  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
    resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
    escalated: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
  }

  const priorityColors = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-amber-600 dark:text-amber-400',
    low: 'text-blue-600 dark:text-blue-400'
  }

  const time = new Date(dispute.filedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <tr className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900 dark:text-white">
          {dispute.tourTitle}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Booking #{dispute.bookingId}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-gray-900 dark:text-white">{dispute.travelerName}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">vs {dispute.guideName}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-gray-900 dark:text-white">${dispute.amount}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{dispute.reason}</div>
      </td>
      <td className="px-4 py-3">
        <span className={`
          px-2 py-1
          text-xs font-medium
          rounded-full
          ${statusColors[dispute.status]}
        `}>
          {dispute.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-medium ${priorityColors[dispute.priority]}`}>
          {dispute.priority}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
        {time}
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/dashboard/admin/disputes/${dispute.id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          Review
        </Link>
      </td>
    </tr>
  )
}

// ============================================================================
// VERIFICATION REQUEST ROW COMPONENT
// ============================================================================

interface VerificationRowProps {
  request: VerificationRequest
}

function VerificationRow({ request }: VerificationRowProps) {
  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
    rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
  }

  const priorityColors = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-amber-600 dark:text-amber-400',
    low: 'text-blue-600 dark:text-blue-400'
  }

  const time = new Date(request.submittedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <tr className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900 dark:text-white">
          {request.guideName}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {request.guideEmail}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {request.documents.id && (
            <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
              ID ✓
            </span>
          )}
          {request.documents.selfie && (
            <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
              Selfie ✓
            </span>
          )}
          {request.documents.certificate && (
            <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
              Cert ✓
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-medium ${priorityColors[request.priority]}`}>
          {request.priority}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
        {time}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/admin/verifications/${request.id}`}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Review
          </Link>
          <span className="text-xs text-gray-300 dark:text-gray-700">|</span>
          <span className="text-xs text-amber-600 dark:text-amber-400 cursor-pointer hover:underline">
            Reject
          </span>
        </div>
      </td>
    </tr>
  )
}

// ============================================================================
// MAIN ADMIN DASHBOARD
// ============================================================================

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [showAllAlerts, setShowAllAlerts] = useState(false)

  const unreadAlerts = alerts.filter(a => !a.isRead).length
  const visibleAlerts = showAllAlerts ? alerts : alerts.slice(0, 3)

  const handleMarkRead = (id: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, isRead: true } : alert
      )
    )
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
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor platform health, manage disputes, and review verifications
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="
                  px-3 py-2
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-800
                  rounded-lg
                  text-sm
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button className="
                p-2
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-lg
                text-gray-500 hover:text-gray-700
                dark:text-gray-400 dark:hover:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-colors
              ">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alerts Bar */}
          {unreadAlerts > 0 && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <span className="font-bold">{unreadAlerts} unread alert{unreadAlerts !== 1 ? 's' : ''}</span> require your attention
              </p>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Users}
              label="Total Users"
              value={MOCK_PLATFORM_STATS.totalUsers.toLocaleString()}
              subtext={`${MOCK_PLATFORM_STATS.activeTravelers.toLocaleString()} travelers, ${MOCK_PLATFORM_STATS.activeGuides.toLocaleString()} guides`}
              trend={{ value: MOCK_FINANCIAL_STATS.growth.users, direction: 'up' }}
              color="blue"
              onClick={() => console.log('Navigate to users')}
            />
            <StatCard
              icon={Calendar}
              label="Active Tours"
              value={MOCK_PLATFORM_STATS.activeTours.toLocaleString()}
              subtext={`${MOCK_PLATFORM_STATS.completedTours.toLocaleString()} completed`}
              color="emerald"
              onClick={() => console.log('Navigate to tours')}
            />
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`$${(MOCK_FINANCIAL_STATS.totalRevenue / 1000).toFixed(1)}K`}
              subtext={`Fees: $${(MOCK_FINANCIAL_STATS.platformFees / 1000).toFixed(1)}K`}
              trend={{ value: MOCK_FINANCIAL_STATS.growth.revenue, direction: 'up' }}
              color="purple"
              onClick={() => console.log('Navigate to financials')}
            />
            <StatCard
              icon={Shield}
              label="Pending Verifications"
              value={MOCK_PLATFORM_STATS.pendingVerifications}
              subtext={`${MOCK_VERIFICATION_REQUESTS.length} new today`}
              color="amber"
              onClick={() => console.log('Navigate to verifications')}
            />
          </div>

          {/* Main Grid - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Alerts and Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Alerts Section */}
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
              ">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    System Alerts
                    {unreadAlerts > 0 && (
                      <span className="
                        px-1.5 py-0.5
                        bg-red-600
                        text-white text-xs font-bold
                        rounded-full
                      ">
                        {unreadAlerts}
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() => setShowAllAlerts(!showAllAlerts)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showAllAlerts ? 'Show less' : 'View all'}
                  </button>
                </div>

                <div className="space-y-3">
                  {visibleAlerts.map(alert => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </div>
              </div>

              {/* Recent Disputes */}
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
              ">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
                    Active Disputes
                  </h2>
                  <Link
                    href="/dashboard/admin/disputes"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View all
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                        <th className="px-4 py-2">Tour</th>
                        <th className="px-4 py-2">Parties</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Priority</th>
                        <th className="px-4 py-2">Filed</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_DISPUTES.map(dispute => (
                        <DisputeRow key={dispute.id} dispute={dispute} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - Verification Queue and Quick Stats */}
            <div className="space-y-6">
              {/* Verification Queue */}
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
              ">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Verification Queue
                  </h2>
                  <Link
                    href="/dashboard/admin/verifications"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View all
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {MOCK_VERIFICATION_REQUESTS.map(request => (
                    <div key={request.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {request.guideName}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {request.guideEmail}
                          </p>
                        </div>
                        <span className={`
                          px-2 py-0.5
                          text-xs font-medium
                          rounded-full
                          ${request.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300' : ''}
                          ${request.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' : ''}
                          ${request.priority === 'low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300' : ''}
                        `}>
                          {request.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {request.documents.id && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                            ID
                          </span>
                        )}
                        {request.documents.selfie && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                            Selfie
                          </span>
                        )}
                        {request.documents.certificate && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                            Certificate
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </span>
                        <Link
                          href={`/dashboard/admin/verifications/${request.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
              ">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Platform Health
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Verified Guides</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {MOCK_PLATFORM_STATS.verifiedGuides} / {MOCK_PLATFORM_STATS.activeGuides}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${(MOCK_PLATFORM_STATS.verifiedGuides / MOCK_PLATFORM_STATS.activeGuides) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2">
                    <span className="text-gray-600 dark:text-gray-400">Booking Completion</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {((MOCK_PLATFORM_STATS.completedBookings / MOCK_PLATFORM_STATS.totalBookings) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${(MOCK_PLATFORM_STATS.completedBookings / MOCK_PLATFORM_STATS.totalBookings) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2">
                    <span className="text-gray-600 dark:text-gray-400">Cancellation Rate</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {((MOCK_PLATFORM_STATS.cancelledBookings / MOCK_PLATFORM_STATS.totalBookings) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full"
                      style={{ width: `${(MOCK_PLATFORM_STATS.cancelledBookings / MOCK_PLATFORM_STATS.totalBookings) * 100}%` }}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Avg. Booking Value</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${MOCK_FINANCIAL_STATS.averageBookingValue}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600 dark:text-gray-400">Platform Fee Rate</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {((MOCK_FINANCIAL_STATS.platformFees / MOCK_FINANCIAL_STATS.totalRevenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="
                bg-gradient-to-br from-blue-600 to-indigo-700
                dark:from-blue-700 dark:to-indigo-800
                rounded-xl
                p-6
                text-white
              ">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href="/dashboard/admin/verifications"
                    className="
                      block
                      w-full
                      px-4 py-2
                      bg-white/20 hover:bg-white/30
                      rounded-lg
                      text-sm
                      transition-colors
                    "
                  >
                    Review Verifications
                  </Link>
                  <Link
                    href="/dashboard/admin/disputes"
                    className="
                      block
                      w-full
                      px-4 py-2
                      bg-white/20 hover:bg-white/30
                      rounded-lg
                      text-sm
                      transition-colors
                    "
                  >
                    Handle Disputes
                  </Link>
                  <Link
                    href="/dashboard/admin/payouts"
                    className="
                      block
                      w-full
                      px-4 py-2
                      bg-white/20 hover:bg-white/30
                      rounded-lg
                      text-sm
                      transition-colors
                    "
                  >
                    Process Payouts
                  </Link>
                  <Link
                    href="/dashboard/admin/tours"
                    className="
                      block
                      w-full
                      px-4 py-2
                      bg-white/20 hover:bg-white/30
                      rounded-lg
                      text-sm
                      transition-colors
                    "
                  >
                    Moderate Tours
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}