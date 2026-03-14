// ============================================================================
// ADMIN BLACKLIST MANAGEMENT - CARD 25
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/admin/blacklist/page.tsx
// 
// PURPOSE: Manage revoked guides and maintain public blacklist
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ View all blacklisted guides
// ✓ Add/Remove guides from blacklist
// ✓ Set ban reasons and duration
// ✓ Public-facing registry integration
// ✓ Search and filter blacklisted guides
// ✓ Ban history tracking
// 
// PRIVACY COMPLIANCE:
// - Public registry shows anonymized IDs only
// - Admin view shows full details
// - Personal information protected
// 
// COLOR PSYCHOLOGY:
// - Red: Banned, revoked
// - Amber: Pending review, temporary bans
// - Blue: Active, view details
// - Purple: Permanent bans
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Shield,
  Ban,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Mail,
  Phone,
  User,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff,
  Flag,
  FileText,
  Plus,
  Trash2,
  Edit,
  MoreVertical,
  X,
  Info,
  Globe,
  Lock,
  Unlock,
  History
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type BanReason = 
  | 'fraud' 
  | 'harassment' 
  | 'no_show' 
  | 'false_advertising' 
  | 'safety_violation' 
  | 'payment_dispute' 
  | 'other'

type BanDuration = 'temporary' | 'permanent' | 'under_review'
type BanStatus = 'active' | 'expired' | 'appealed' | 'overturned' | 'under_review'

interface BlacklistedGuide {
  id: string
  guideId: string
  guideName: string
  guideEmail: string
  guidePhone: string
  guideAvatar?: string
  banReason: BanReason
  banDuration: BanDuration
  status: BanStatus
  bannedAt: string
  bannedBy: string
  bannedByAdmin: string
  expiresAt?: string
  description: string
  evidence?: {
    id: string
    type: 'complaint' | 'dispute' | 'review'
    reference: string
    description: string
  }[]
  appeal?: {
    filedAt: string
    reason: string
    status: 'pending' | 'approved' | 'rejected'
    decision?: string
    decidedBy?: string
    decidedAt?: string
  }
  notes?: {
    id: string
    adminId: string
    adminName: string
    content: string
    createdAt: string
  }[]
  history: {
    id: string
    action: 'banned' | 'unbanned' | 'appealed' | 'overturned' | 'expired' | 'note_added'
    adminId?: string
    adminName?: string
    reason?: string
    timestamp: string
  }[]
}

interface BlacklistStats {
  total: number
  active: number
  permanent: number
  temporary: number
  underReview: number
  appealed: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BLACKLIST_STATS: BlacklistStats = {
  total: 45,
  active: 38,
  permanent: 12,
  temporary: 23,
  underReview: 3,
  appealed: 2
}

const MOCK_BLACKLISTED_GUIDES: BlacklistedGuide[] = [
  {
    id: 'bl1',
    guideId: 'g123',
    guideName: 'Mehmet Yilmaz',
    guideEmail: 'mehmet.yilmaz@example.com',
    guidePhone: '+90 555 123 4567',
    guideAvatar: '/images/guides/mehmet.jpg',
    banReason: 'fraud',
    banDuration: 'permanent',
    status: 'active',
    bannedAt: '2026-02-15T10:30:00Z',
    bannedBy: 'admin1',
    bannedByAdmin: 'Admin User',
    description: 'Charged travelers outside the platform for 5 separate bookings, then canceled.',
    evidence: [
      {
        id: 'e1',
        type: 'complaint',
        reference: 'CMP-2026-001',
        description: 'Traveler reported being asked to pay via bank transfer'
      },
      {
        id: 'e2',
        type: 'dispute',
        reference: 'DSP-2026-023',
        description: 'Payment dispute raised for unauthorized charges'
      }
    ],
    history: [
      {
        id: 'h1',
        action: 'banned',
        adminId: 'admin1',
        adminName: 'Admin User',
        reason: 'Multiple reports of fraud. Evidence confirmed.',
        timestamp: '2026-02-15T10:30:00Z'
      }
    ]
  },
  {
    id: 'bl2',
    guideId: 'g124',
    guideName: 'Layla Hassan',
    guideEmail: 'layla.hassan@example.com',
    guidePhone: '+961 70 123 456',
    guideAvatar: '/images/guides/layla.jpg',
    banReason: 'no_show',
    banDuration: 'temporary',
    status: 'active',
    bannedAt: '2026-03-01T14:20:00Z',
    bannedBy: 'admin2',
    bannedByAdmin: 'Moderator',
    expiresAt: '2026-06-01T14:20:00Z',
    description: 'Failed to show for 3 confirmed bookings within 30 days.',
    evidence: [
      {
        id: 'e3',
        type: 'complaint',
        reference: 'CMP-2026-045',
        description: 'Traveler waited 2 hours at meeting point'
      },
      {
        id: 'e4',
        type: 'complaint',
        reference: 'CMP-2026-052',
        description: 'Second no-show incident'
      }
    ],
    appeal: {
      filedAt: '2026-03-05T09:15:00Z',
      reason: 'Medical emergency, can provide doctor note',
      status: 'pending'
    },
    history: [
      {
        id: 'h2',
        action: 'banned',
        adminId: 'admin2',
        adminName: 'Moderator',
        reason: '3 no-shows in 30 days',
        timestamp: '2026-03-01T14:20:00Z'
      },
      {
        id: 'h3',
        action: 'appealed',
        reason: 'Medical emergency, can provide doctor note',
        timestamp: '2026-03-05T09:15:00Z'
      }
    ]
  },
  {
    id: 'bl3',
    guideId: 'g125',
    guideName: 'Ahmet Demir',
    guideEmail: 'ahmet.demir@example.com',
    guidePhone: '+90 555 987 6543',
    guideAvatar: '/images/guides/ahmet.jpg',
    banReason: 'harassment',
    banDuration: 'permanent',
    status: 'active',
    bannedAt: '2026-01-10T11:45:00Z',
    bannedBy: 'admin1',
    bannedByAdmin: 'Admin User',
    description: 'Multiple reports of inappropriate conduct and harassment during tours.',
    evidence: [
      {
        id: 'e5',
        type: 'complaint',
        reference: 'CMP-2026-012',
        description: 'Traveler reported uncomfortable comments'
      },
      {
        id: 'e6',
        type: 'complaint',
        reference: 'CMP-2026-018',
        description: 'Second traveler with similar complaint'
      }
    ],
    history: [
      {
        id: 'h4',
        action: 'banned',
        adminId: 'admin1',
        adminName: 'Admin User',
        reason: 'Multiple harassment complaints verified',
        timestamp: '2026-01-10T11:45:00Z'
      }
    ]
  },
  {
    id: 'bl4',
    guideId: 'g126',
    guideName: 'Fatima Yilmaz',
    guideEmail: 'fatima.y@example.com',
    guidePhone: '+90 555 456 7890',
    banReason: 'false_advertising',
    banDuration: 'temporary',
    status: 'active',
    bannedAt: '2026-02-20T09:30:00Z',
    bannedBy: 'admin2',
    bannedByAdmin: 'Moderator',
    expiresAt: '2026-05-20T09:30:00Z',
    description: 'Tour description misrepresented duration and inclusions repeatedly.',
    evidence: [
      {
        id: 'e7',
        type: 'complaint',
        reference: 'CMP-2026-034',
        description: 'Tour was 2 hours shorter than advertised'
      }
    ],
    history: [
      {
        id: 'h5',
        action: 'banned',
        adminId: 'admin2',
        adminName: 'Moderator',
        reason: 'Multiple complaints about false advertising',
        timestamp: '2026-02-20T09:30:00Z'
      }
    ]
  },
  {
    id: 'bl5',
    guideId: 'g127',
    guideName: 'Omar Kaya',
    guideEmail: 'omar.kaya@example.com',
    guidePhone: '+90 555 789 0123',
    banReason: 'payment_dispute',
    banDuration: 'under_review',
    status: 'under_review',
    bannedAt: '2026-03-12T16:10:00Z',
    bannedBy: 'admin3',
    bannedByAdmin: 'Support Agent',
    description: 'Multiple payment disputes from different travelers. Under investigation.',
    evidence: [
      {
        id: 'e8',
        type: 'dispute',
        reference: 'DSP-2026-045',
        description: 'Traveler disputed charge for cancelled tour'
      },
      {
        id: 'e9',
        type: 'dispute',
        reference: 'DSP-2026-046',
        description: 'Second payment dispute'
      }
    ],
    history: [
      {
        id: 'h6',
        action: 'banned',
        adminId: 'admin3',
        adminName: 'Support Agent',
        reason: 'Multiple payment disputes, pending investigation',
        timestamp: '2026-03-12T16:10:00Z'
      }
    ]
  }
]

// ============================================================================
// BAN REASON BADGE
// ============================================================================

const BanReasonBadge = ({ reason }: { reason: BanReason }) => {
  const styles = {
    fraud: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
    harassment: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50',
    no_show: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    false_advertising: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    safety_violation: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
    payment_dispute: 'bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800/50',
    other: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700'
  }

  const labels = {
    fraud: 'Fraud',
    harassment: 'Harassment',
    no_show: 'No Show',
    false_advertising: 'False Advertising',
    safety_violation: 'Safety Violation',
    payment_dispute: 'Payment Dispute',
    other: 'Other'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[reason]}`}>
      <AlertTriangle className="w-3.5 h-3.5" />
      {labels[reason]}
    </span>
  )
}

// ============================================================================
// BAN DURATION BADGE (Fixed)
// ============================================================================

const BanDurationBadge = ({ duration, status }: { duration: BanDuration; status: BanStatus }) => {
  const styles = {
    permanent: {
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800/50',
      icon: Ban,
      label: 'Permanent'
    },
    temporary: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
      icon: Clock,
      label: 'Temporary'
    },
    under_review: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/50',
      icon: Eye,
      label: 'Under Review'
    }
  }

  const s = styles[duration]
  const Icon = s.icon

  if (status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700">
        <CheckCircle className="w-3.5 h-3.5" />
        Expired
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {s.label}
    </span>
  )
}

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge = ({ status }: { status: BanStatus }) => {
  const styles = {
    active: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
    expired: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    appealed: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    overturned: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    under_review: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' 
  }

  const icons = {
    active: Ban,
    expired: CheckCircle,
    appealed: Eye,
    overturned: Unlock,
    under_review: Eye
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
// ADD TO BLACKLIST MODAL
// ============================================================================

const AddToBlacklistModal = ({ isOpen, onClose, onAdd }: any) => {
  const [formData, setFormData] = useState({
    guideId: '',
    reason: 'fraud' as BanReason,
    duration: 'permanent' as BanDuration,
    description: '',
    evidence: ''
  })

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!formData.guideId.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields')
      return
    }
    onAdd(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Ban className="w-5 h-5" />
              Add to Blacklist
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Guide ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.guideId}
              onChange={(e) => setFormData({ ...formData, guideId: e.target.value })}
              placeholder="e.g., g123"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value as BanReason })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="fraud">Fraud</option>
                <option value="harassment">Harassment</option>
                <option value="no_show">No Show</option>
                <option value="false_advertising">False Advertising</option>
                <option value="safety_violation">Safety Violation</option>
                <option value="payment_dispute">Payment Dispute</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value as BanDuration })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="permanent">Permanent</option>
                <option value="temporary">Temporary (90 days)</option>
                <option value="under_review">Under Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Describe the reason for banning..."
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Evidence (optional)
            </label>
            <textarea
              value={formData.evidence}
              onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
              rows={2}
              placeholder="Reference numbers, complaint IDs, etc."
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Add to Blacklist
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
// BLACKLIST DETAILS MODAL
// ============================================================================

const BlacklistDetailsModal = ({ isOpen, onClose, entry, onRemove, onUpdate }: any) => {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  if (!isOpen || !entry) return null

  const handleRemove = () => {
    if (window.confirm(`Remove ${entry.guideName} from blacklist?`)) {
      onRemove(entry.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Ban className="w-5 h-5" />
              Blacklist Details
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
          {/* Guide Profile */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 p-0.5">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                {entry.guideAvatar ? (
                  <Image src={entry.guideAvatar} alt={entry.guideName} width={64} height={64} className="object-cover" />
                ) : (
                  <User className="w-8 h-8 m-4 text-gray-400" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">{entry.guideName}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {entry.guideId}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={entry.status} />
              <BanDurationBadge duration={entry.banDuration} status={entry.status} />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-600 dark:text-red-400" />
                Email
              </h5>
              <a href={`mailto:${entry.guideEmail}`} className="text-red-600 dark:text-red-400 hover:underline break-all">
                {entry.guideEmail}
              </a>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-600 dark:text-red-400" />
                Phone
              </h5>
              <a href={`tel:${entry.guidePhone}`} className="text-red-600 dark:text-red-400 hover:underline">
                {entry.guidePhone}
              </a>
            </div>
          </div>

          {/* Ban Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                Banned At
              </h5>
              <p className="text-gray-900 dark:text-white">{new Date(entry.bannedAt).toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">by {entry.bannedByAdmin}</p>
            </div>
            {entry.expiresAt && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Expires At
                </h5>
                <p className="text-gray-900 dark:text-white">{new Date(entry.expiresAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
              Description
            </h5>
            <p className="text-gray-900 dark:text-white">{entry.description}</p>
          </div>

          {/* Evidence */}
          {entry.evidence && entry.evidence.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
                Evidence
              </h5>
              <div className="space-y-2">
                {entry.evidence.map((ev: any) => (
                  <div key={ev.id} className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{ev.type}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{ev.reference}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{ev.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appeal */}
          {entry.appeal && (
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-800/50">
              <h5 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Appeal Filed
              </h5>
              <p className="text-sm text-amber-600 dark:text-amber-500 mb-2">{entry.appeal.reason}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Filed: {new Date(entry.appeal.filedAt).toLocaleString()}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  entry.appeal.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  entry.appeal.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {entry.appeal.status}
                </span>
              </div>
            </div>
          )}

          {/* History Timeline */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-red-600 dark:text-red-400" />
              History
            </h5>
            <div className="space-y-3">
              {entry.history.map((item: any, idx: number) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      item.action === 'banned' ? 'bg-red-500' :
                      item.action === 'unbanned' ? 'bg-emerald-500' :
                      item.action === 'appealed' ? 'bg-amber-500' :
                      item.action === 'overturned' ? 'bg-blue-500' : 'bg-gray-500'
                    }`} />
                    {idx < entry.history.length - 1 && (
                      <div className="absolute top-4 left-1 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{item.action.replace('_', ' ')}</p>
                    {item.adminName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">by {item.adminName}</p>
                    )}
                    {item.reason && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.reason}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {entry.status === 'active' && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(true)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Unlock className="w-5 h-5" />
                Remove from Blacklist
              </button>
              <button
                onClick={() => alert('Edit feature coming in Phase 6')}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Edit Entry
              </button>
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

export default function AdminBlacklistPage() {
  const [filterReason, setFilterReason] = useState<BanReason | 'all'>('all')
  const [filterDuration, setFilterDuration] = useState<BanDuration | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<BanStatus | 'all'>('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState<BlacklistedGuide | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const itemsPerPage = 5

  // Filter entries
  const filteredEntries = useMemo(() => {
    return MOCK_BLACKLISTED_GUIDES.filter(entry => {
      if (filterReason !== 'all' && entry.banReason !== filterReason) return false
      if (filterDuration !== 'all' && entry.banDuration !== filterDuration) return false
      if (filterStatus !== 'all' && entry.status !== filterStatus) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (
          entry.guideName.toLowerCase().includes(term) ||
          entry.guideEmail.toLowerCase().includes(term) ||
          entry.guideId.toLowerCase().includes(term)
        )
      }
      return true
    })
  }, [filterReason, filterDuration, filterStatus, searchTerm])

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const resetFilters = () => {
    setFilterReason('all')
    setFilterDuration('all')
    setFilterStatus('active')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleAddToBlacklist = (data: any) => {
    alert(`✅ Guide added to blacklist!`)
    console.log('Add to blacklist:', data)
    setShowAddModal(false)
  }

  const handleRemoveFromBlacklist = (id: string) => {
    alert(`✅ Guide removed from blacklist!`)
    console.log('Remove from blacklist:', id)
  }

  const handleUpdateEntry = (id: string, data: any) => {
    alert(`✅ Blacklist entry updated!`)
    console.log('Update blacklist:', id, data)
  }

  return (
    <>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Blacklist Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage revoked guides and maintain public blacklist
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Filters
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start"
              >
                <Ban className="w-4 h-4" />
                Add to Blacklist
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            {[
              { key: 'total', label: 'Total', value: MOCK_BLACKLIST_STATS.total, color: 'gray', action: () => setFilterStatus('all') },
              { key: 'active', label: 'Active', value: MOCK_BLACKLIST_STATS.active, color: 'red', action: () => setFilterStatus('active') },
              { key: 'permanent', label: 'Permanent', value: MOCK_BLACKLIST_STATS.permanent, color: 'purple', action: () => setFilterDuration('permanent') },
              { key: 'temporary', label: 'Temporary', value: MOCK_BLACKLIST_STATS.temporary, color: 'amber', action: () => setFilterDuration('temporary') },
              { key: 'appealed', label: 'Appealed', value: MOCK_BLACKLIST_STATS.appealed, color: 'blue', action: () => setFilterStatus('appealed') }
            ].map(stat => (
              <div
                key={stat.key}
                onClick={stat.action}
                className={`group p-4 bg-white dark:bg-gray-900 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 border-2 ${
                  (stat.key === 'permanent' && filterDuration === 'permanent') ||
                  (stat.key === 'temporary' && filterDuration === 'temporary') ||
                  (stat.key === 'active' && filterStatus === 'active') ||
                  (stat.key === 'appealed' && filterStatus === 'appealed') ||
                  (stat.key === 'total' && filterStatus === 'all')
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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value as BanReason | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            >
              <option value="all">All Reasons</option>
              <option value="fraud">Fraud</option>
              <option value="harassment">Harassment</option>
              <option value="no_show">No Show</option>
              <option value="false_advertising">False Advertising</option>
              <option value="safety_violation">Safety Violation</option>
              <option value="payment_dispute">Payment Dispute</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filterDuration}
              onChange={(e) => setFilterDuration(e.target.value as BanDuration | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            >
              <option value="all">All Durations</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
              <option value="under_review">Under Review</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as BanStatus | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="appealed">Appealed</option>
              <option value="overturned">Overturned</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or guide ID..."
              className="w-full pl-11 pr-11 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {paginatedEntries.length} of {filteredEntries.length} blacklisted guides
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guide</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Banned At</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 p-0.5">
                          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                            {entry.guideAvatar ? (
                              <Image src={entry.guideAvatar} alt={entry.guideName} width={32} height={32} className="object-cover" />
                            ) : (
                              <User className="w-4 h-4 m-2 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{entry.guideName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {entry.guideId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><BanReasonBadge reason={entry.banReason} /></td>
                    <td className="px-6 py-4"><BanDurationBadge duration={entry.banDuration} status={entry.status} /></td>
                    <td className="px-6 py-4"><StatusBadge status={entry.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{new Date(entry.bannedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedEntry(entry); setShowDetailsModal(true); }}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
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
            {paginatedEntries.map((entry) => (
              <div key={entry.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                      {entry.guideAvatar ? (
                        <Image src={entry.guideAvatar} alt={entry.guideName} width={48} height={48} className="object-cover" />
                      ) : (
                        <User className="w-5 h-5 m-3.5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{entry.guideName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {entry.guideId}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <BanReasonBadge reason={entry.banReason} />
                  <BanDurationBadge duration={entry.banDuration} status={entry.status} />
                  <StatusBadge status={entry.status} />
                </div>
                <button
                  onClick={() => { setSelectedEntry(entry); setShowDetailsModal(true); }}
                  className="w-full px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-medium rounded-lg"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-900/30 rounded-full flex items-center justify-center">
                <Ban className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No blacklisted guides found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or add a new entry.</p>
              <button onClick={resetFilters} className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredEntries.length > 0 && (
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

      {/* Add Modal */}
      <AddToBlacklistModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddToBlacklist}
      />

      {/* Details Modal */}
      {selectedEntry && (
        <BlacklistDetailsModal
          isOpen={showDetailsModal}
          onClose={() => { setShowDetailsModal(false); setSelectedEntry(null); }}
          entry={selectedEntry}
          onRemove={handleRemoveFromBlacklist}
          onUpdate={handleUpdateEntry}
        />
      )}
    </>
  )
}