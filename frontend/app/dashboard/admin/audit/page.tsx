// ============================================================================
// ADMIN AUDIT TRAIL & NOTIFICATIONS - CARD 29
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/admin/audit/page.tsx
// 
// PURPOSE: Complete audit logs of all system actions and mass notification system
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Complete audit trail of all admin actions
// ✓ User action logging (guides, travelers)
// ✓ System event tracking
// ✓ Mass notifications to users
// ✓ Filter and search logs
// ✓ Export audit data
// 
// AUDIT TYPES:
// - Admin actions: approvals, rejections, bans, overrides
// - User actions: bookings, cancellations, disputes
// - System events: payouts, failures, alerts
// - Security events: logins, verifications
// 
// COLOR PSYCHOLOGY:
// - Blue: Admin actions, info
// - Amber: User actions, warnings
// - Green: System events, success
// - Red: Security events, critical
// - Purple: Mass notifications
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  History,
  Bell,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
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
  Save,
  Send,
  Flag,
  Lock,
  Unlock,
  LogIn,
  LogOut,
  CreditCard,
  DollarSign
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type AuditActionType = 
  | 'admin_login' | 'admin_logout'
  | 'guide_approve' | 'guide_reject' | 'guide_ban' | 'guide_unban'
  | 'tour_approve' | 'tour_reject' | 'tour_moderate'
  | 'dispute_resolve' | 'dispute_escalate'
  | 'payout_process' | 'payout_fail' | 'payout_retry'
  | 'fee_override' | 'rate_override'
  | 'notification_send' | 'notification_bulk'
  | 'user_login' | 'user_logout' | 'user_register'
  | 'booking_create' | 'booking_cancel' | 'booking_complete'
  | 'review_submit' | 'review_flag'
  | 'system_alert' | 'system_error' | 'system_warning'

type AuditSeverity = 'info' | 'warning' | 'critical' | 'success'
type AuditCategory = 'admin' | 'user' | 'system' | 'security' | 'notification'

interface AuditLog {
  id: string
  timestamp: string
  actionType: AuditActionType
  category: AuditCategory
  severity: AuditSeverity
  actorId: string
  actorName: string
  actorRole: 'admin' | 'guide' | 'traveler' | 'system'
  actorAvatar?: string
  targetId?: string
  targetName?: string
  targetType?: 'guide' | 'traveler' | 'tour' | 'booking' | 'dispute' | 'payout'
  description: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  location?: string
}

interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'email' | 'sms' | 'push' | 'in_app'
  targetRoles: ('traveler' | 'guide' | 'admin')[]
  lastUsed?: string
  usageCount: number
}

interface AuditStats {
  totalEvents: number
  adminActions: number
  userActions: number
  systemEvents: number
  securityEvents: number
  criticalEvents: number
  last24Hours: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_AUDIT_STATS: AuditStats = {
  totalEvents: 15432,
  adminActions: 2345,
  userActions: 8765,
  systemEvents: 3456,
  securityEvents: 456,
  criticalEvents: 89,
  last24Hours: 567
}

const MOCK_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'nt1',
    name: 'Welcome Email',
    subject: 'Welcome to SafariHub!',
    content: 'Thank you for joining SafariHub...',
    type: 'email',
    targetRoles: ['traveler', 'guide'],
    lastUsed: '2026-03-15T10:30:00Z',
    usageCount: 1234
  },
  {
    id: 'nt2',
    name: 'Booking Confirmation',
    subject: 'Your booking is confirmed',
    content: 'Your tour booking has been confirmed...',
    type: 'email',
    targetRoles: ['traveler'],
    lastUsed: '2026-03-15T09:15:00Z',
    usageCount: 3456
  },
  {
    id: 'nt3',
    name: 'Payout Processed',
    subject: 'Your payout has been sent',
    content: 'Your earnings have been transferred...',
    type: 'email',
    targetRoles: ['guide'],
    lastUsed: '2026-03-14T16:20:00Z',
    usageCount: 567
  },
  {
    id: 'nt4',
    name: 'Verification Approved',
    subject: 'Your guide verification is complete',
    content: 'Congratulations! Your guide profile is now verified...',
    type: 'email',
    targetRoles: ['guide'],
    lastUsed: '2026-03-14T14:45:00Z',
    usageCount: 234
  },
  {
    id: 'nt5',
    name: 'Dispute Update',
    subject: 'Update on your dispute',
    content: 'There has been an update to your dispute case...',
    type: 'email',
    targetRoles: ['traveler', 'guide'],
    lastUsed: '2026-03-13T11:10:00Z',
    usageCount: 89
  }
]

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'a1',
    timestamp: '2026-03-15T14:30:00Z',
    actionType: 'guide_approve',
    category: 'admin',
    severity: 'success',
    actorId: 'admin1',
    actorName: 'Admin User',
    actorRole: 'admin',
    targetId: 'g123',
    targetName: 'Mehmet Yilmaz',
    targetType: 'guide',
    description: 'Approved guide verification',
    details: {
      documents: ['id', 'selfie', 'certificate'],
      notes: 'All documents verified'
    },
    ipAddress: '192.168.1.100',
    location: 'Istanbul, Turkey'
  },
  {
    id: 'a2',
    timestamp: '2026-03-15T13:45:00Z',
    actionType: 'dispute_resolve',
    category: 'admin',
    severity: 'info',
    actorId: 'admin2',
    actorName: 'Moderator',
    actorRole: 'admin',
    targetId: 'd123',
    targetName: 'DSP-2026-001',
    targetType: 'dispute',
    description: 'Resolved dispute in favor of traveler',
    details: {
      resolution: 'full_refund',
      amount: 178,
      notes: 'Guide no-show confirmed'
    },
    ipAddress: '192.168.1.101'
  },
  {
    id: 'a3',
    timestamp: '2026-03-15T11:20:00Z',
    actionType: 'booking_cancel',
    category: 'user',
    severity: 'warning',
    actorId: 'trav123',
    actorName: 'Ahmed Khan',
    actorRole: 'traveler',
    targetId: 'b123',
    targetName: 'Ottoman Heritage Tour',
    targetType: 'booking',
    description: 'Traveler cancelled booking',
    details: {
      reason: 'change_of_plans',
      refundAmount: 178,
      cancellationPolicy: '48h+'
    },
    ipAddress: '192.168.1.45'
  },
  {
    id: 'a4',
    timestamp: '2026-03-15T10:15:00Z',
    actionType: 'payout_process',
    category: 'system',
    severity: 'success',
    actorId: 'system',
    actorName: 'System',
    actorRole: 'system',
    targetId: 'p123',
    targetName: 'PO-2026-001',
    targetType: 'payout',
    description: 'Batch payout processed successfully',
    details: {
      amount: 4560,
      payouts: 12,
      fees: 684
    }
  },
  {
    id: 'a5',
    timestamp: '2026-03-15T09:30:00Z',
    actionType: 'rate_override',
    category: 'admin',
    severity: 'warning',
    actorId: 'admin1',
    actorName: 'Admin User',
    actorRole: 'admin',
    description: 'Overrode USD to LBP exchange rate',
    details: {
      from: 'USD',
      to: 'LBP',
      oldRate: 89500,
      newRate: 90000,
      reason: 'Market volatility'
    },
    ipAddress: '192.168.1.100'
  },
  {
    id: 'a6',
    timestamp: '2026-03-15T08:45:00Z',
    actionType: 'guide_ban',
    category: 'admin',
    severity: 'critical',
    actorId: 'admin3',
    actorName: 'Security Admin',
    actorRole: 'admin',
    targetId: 'g125',
    targetName: 'Ahmet Demir',
    targetType: 'guide',
    description: 'Permanently banned guide due to fraud',
    details: {
      reason: 'fraud',
      evidence: ['multiple_complaints', 'payment_disputes'],
      permanent: true
    },
    ipAddress: '192.168.1.102'
  },
  {
    id: 'a7',
    timestamp: '2026-03-14T22:15:00Z',
    actionType: 'system_alert',
    category: 'system',
    severity: 'critical',
    actorId: 'system',
    actorName: 'System',
    actorRole: 'system',
    description: 'Payment gateway connection failed',
    details: {
      service: 'whish',
      error: 'timeout',
      retryCount: 3,
      recovered: true
    }
  },
  {
    id: 'a8',
    timestamp: '2026-03-14T18:30:00Z',
    actionType: 'notification_bulk',
    category: 'notification',
    severity: 'info',
    actorId: 'admin2',
    actorName: 'Moderator',
    actorRole: 'admin',
    description: 'Sent bulk notification to all guides',
    details: {
      template: 'maintenance_notice',
      recipients: 1234,
      success: 1230,
      failed: 4
    },
    ipAddress: '192.168.1.101'
  },
  {
    id: 'a9',
    timestamp: '2026-03-14T16:20:00Z',
    actionType: 'user_login',
    category: 'security',
    severity: 'info',
    actorId: 'trav456',
    actorName: 'Fatima Hassan',
    actorRole: 'traveler',
    description: 'User logged in from new device',
    details: {
      device: 'iPhone 15',
      browser: 'Safari',
      location: 'Beirut, Lebanon'
    },
    ipAddress: '192.168.1.67',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    location: 'Beirut, Lebanon'
  },
  {
    id: 'a10',
    timestamp: '2026-03-14T14:45:00Z',
    actionType: 'fee_override',
    category: 'admin',
    severity: 'warning',
    actorId: 'admin1',
    actorName: 'Admin User',
    actorRole: 'admin',
    description: 'Adjusted fee tier for platinum guides',
    details: {
      tier: 'platinum',
      oldFee: 10,
      newFee: 8,
      reason: 'Promotional period'
    },
    ipAddress: '192.168.1.100'
  }
]

// ============================================================================
// SEVERITY BADGE
// ============================================================================

const SeverityBadge = ({ severity }: { severity: AuditSeverity }) => {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    critical: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
    success: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
  }

  const icons = {
    info: Info,
    warning: AlertTriangle,
    critical: XCircle,
    success: CheckCircle
  }

  const Icon = icons[severity]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[severity]}`}>
      <Icon className="w-3.5 h-3.5" />
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  )
}

// ============================================================================
// CATEGORY BADGE
// ============================================================================

const CategoryBadge = ({ category }: { category: AuditCategory }) => {
  const styles = {
    admin: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
    user: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    system: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    security: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
    notification: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[category]}`}>
      {category === 'admin' && <Shield className="w-3.5 h-3.5" />}
      {category === 'user' && <User className="w-3.5 h-3.5" />}
      {category === 'system' && <Globe className="w-3.5 h-3.5" />}
      {category === 'security' && <Lock className="w-3.5 h-3.5" />}
      {category === 'notification' && <Bell className="w-3.5 h-3.5" />}
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  )
}

// ============================================================================
// NOTIFICATION MODAL
// ============================================================================

const NotificationModal = ({ isOpen, onClose, onSend }: any) => {
  const [formData, setFormData] = useState({
    type: 'email' as 'email' | 'sms' | 'push' | 'in_app',
    targetRoles: [] as ('traveler' | 'guide' | 'admin')[],
    subject: '',
    content: '',
    template: ''
  })

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!formData.subject.trim() || !formData.content.trim() || formData.targetRoles.length === 0) {
      alert('Please fill in all required fields')
      return
    }
    onSend(formData)
    onClose()
  }

  const toggleRole = (role: 'traveler' | 'guide' | 'admin') => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Send Mass Notification
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notification Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push Notification</option>
                <option value="in_app">In-App Message</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Use Template (Optional)
              </label>
              <select
                value={formData.template}
                onChange={(e) => {
                  const template = MOCK_NOTIFICATION_TEMPLATES.find(t => t.id === e.target.value)
                  if (template) {
                    setFormData({
                      ...formData,
                      template: e.target.value,
                      subject: template.subject,
                      content: template.content,
                      targetRoles: template.targetRoles
                    })
                  }
                }}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select template</option>
                {MOCK_NOTIFICATION_TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Roles
            </label>
            <div className="flex gap-4">
              {(['traveler', 'guide', 'admin'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.targetRoles.includes(role)
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Notification
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
// AUDIT DETAILS MODAL (Fixed height with scroll)
// ============================================================================

const AuditDetailsModal = ({ isOpen, onClose, log }: any) => {
  if (!isOpen || !log) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh]">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 px-6 py-4 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-white" />
              <h3 className="text-lg font-bold text-white">Audit Log Details</h3>
              <SeverityBadge severity={log.severity} />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Actor Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                {log.actorAvatar ? (
                  <Image src={log.actorAvatar} alt={log.actorName} width={48} height={48} className="object-cover" />
                ) : (
                  <User className="w-5 h-5 m-3.5 text-gray-400" />
                )}
              </div>
            </div>
            <div className="min-w-0">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">{log.actorName}</h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <CategoryBadge category={log.category} />
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{log.actorRole}</span>
              </div>
            </div>
          </div>

          {/* Action Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action</h5>
              <p className="text-gray-900 dark:text-white capitalize break-words">{log.actionType.replace(/_/g, ' ')}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timestamp</h5>
              <p className="text-gray-900 dark:text-white break-words">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h5>
            <p className="text-gray-900 dark:text-white break-words">{log.description}</p>
          </div>

          {/* Target Info (if exists) */}
          {log.targetName && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target</h5>
              <p className="text-gray-900 dark:text-white break-words">{log.targetName}</p>
              {log.targetType && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">Type: {log.targetType}</p>
              )}
            </div>
          )}

          {/* Details */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Details</h5>
            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>

          {/* Metadata */}
          {(log.ipAddress || log.location) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {log.ipAddress && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IP Address</h5>
                  <p className="text-sm text-gray-900 dark:text-white font-mono break-words">{log.ipAddress}</p>
                </div>
              )}
              {log.location && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</h5>
                  <p className="text-sm text-gray-900 dark:text-white break-words">{log.location}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminAuditPage() {
  const [filterCategory, setFilterCategory] = useState<AuditCategory | 'all'>('all')
  const [filterSeverity, setFilterSeverity] = useState<AuditSeverity | 'all'>('all')
  const [filterActor, setFilterActor] = useState<'admin' | 'guide' | 'traveler' | 'system' | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const itemsPerPage = 10

  // Filter logs
  const filteredLogs = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter(log => {
      if (filterCategory !== 'all' && log.category !== filterCategory) return false
      if (filterSeverity !== 'all' && log.severity !== filterSeverity) return false
      if (filterActor !== 'all' && log.actorRole !== filterActor) return false
      
      const now = new Date()
      const logDate = new Date(log.timestamp)
      if (dateRange === 'today') {
        if (logDate.toDateString() !== now.toDateString()) return false
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7))
        if (logDate < weekAgo) return false
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
        if (logDate < monthAgo) return false
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (
          log.description.toLowerCase().includes(term) ||
          log.actorName.toLowerCase().includes(term) ||
          log.targetName?.toLowerCase().includes(term) ||
          log.actionType.toLowerCase().includes(term)
        )
      }
      return true
    })
  }, [filterCategory, filterSeverity, filterActor, dateRange, searchTerm])

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const resetFilters = () => {
    setFilterCategory('all')
    setFilterSeverity('all')
    setFilterActor('all')
    setDateRange('week')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleSendNotification = (data: any) => {
    alert(`✅ Notification sent to ${data.targetRoles.length} role(s)`)
    console.log('Send notification:', data)
    setShowNotificationModal(false)
  }

  const handleExport = () => {
    alert('📥 Exporting audit logs (CSV format)')
  }

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Audit Trail & Notifications
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete system audit logs and mass notification center
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNotificationModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start"
              >
                <Bell className="w-4 h-4" />
                Send Notification
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { key: 'totalEvents', label: 'Total Events', value: MOCK_AUDIT_STATS.totalEvents, color: 'blue' },
              { key: 'adminActions', label: 'Admin Actions', value: MOCK_AUDIT_STATS.adminActions, color: 'purple' },
              { key: 'userActions', label: 'User Actions', value: MOCK_AUDIT_STATS.userActions, color: 'green' },
              { key: 'criticalEvents', label: 'Critical', value: MOCK_AUDIT_STATS.criticalEvents, color: 'red' }
            ].map(stat => (
              <div
                key={stat.key}
                className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
              >
                <div className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as AuditCategory | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Categories</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="system">System</option>
              <option value="security">Security</option>
              <option value="notification">Notification</option>
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as AuditSeverity | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Severity</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
              <option value="success">Success</option>
            </select>
            <select
              value={filterActor}
              onChange={(e) => setFilterActor(e.target.value as any)}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Actors</option>
              <option value="admin">Admin</option>
              <option value="guide">Guide</option>
              <option value="traveler">Traveler</option>
              <option value="system">System</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Search and Export */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs by description, actor, target..."
                className="w-full pl-11 pr-11 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {paginatedLogs.length} of {filteredLogs.length} logs
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actor</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          {log.actorAvatar ? (
                            <Image src={log.actorAvatar} alt={log.actorName} width={24} height={24} className="object-cover" />
                          ) : (
                            <User className="w-3 h-3 m-1.5 text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{log.actorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">
                        {log.actionType.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{log.description}</div>
                    </td>
                    <td className="px-6 py-4"><CategoryBadge category={log.category} /></td>
                    <td className="px-6 py-4"><SeverityBadge severity={log.severity} /></td>
                    <td className="px-6 py-4">
                      {log.targetName ? (
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">{log.targetName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{log.targetType}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedLog(log); setShowDetailsModal(true); }}
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
            {paginatedLogs.map((log) => (
              <div key={log.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      {log.actorAvatar ? (
                        <Image src={log.actorAvatar} alt={log.actorName} width={32} height={32} className="object-cover" />
                      ) : (
                        <User className="w-4 h-4 m-2 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{log.actorName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{log.actorRole}</div>
                    </div>
                  </div>
                  <SeverityBadge severity={log.severity} />
                </div>
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white capitalize mb-1">
                    {log.actionType.replace(/_/g, ' ')}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{log.description}</p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <CategoryBadge category={log.category} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedLog(log); setShowDetailsModal(true); }}
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
                <History className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No audit logs found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters.</p>
              <button onClick={resetFilters} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredLogs.length > 0 && (
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

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onSend={handleSendNotification}
      />

      {/* Audit Details Modal */}
      {selectedLog && (
        <AuditDetailsModal
          isOpen={showDetailsModal}
          onClose={() => { setShowDetailsModal(false); setSelectedLog(null); }}
          log={selectedLog}
        />
      )}
    </PageLayout>
  )
}