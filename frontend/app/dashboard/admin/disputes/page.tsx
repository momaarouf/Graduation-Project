// ============================================================================
// ADMIN DISPUTE COURT - CARD 26
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/admin/disputes/page.tsx
// 
// PURPOSE: Handle no-show resolutions, evidence matching, and payment/refund decisions
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ No-show resolution
// ✓ Evidence matching (traveler vs guide claims)
// ✓ Release payment or issue refund
// ✓ Dispute history tracking
// ✓ Priority queue
// ✓ Resolution notes
// 
// DISPUTE TYPES:
// - No-show: Guide didn't appear
// - Cancellation: Late cancellation
// - Quality: Tour not as described
// - Payment: Payment issues
// - Safety: Safety concerns
// 
// COLOR PSYCHOLOGY:
// - Red: High priority, disputes, refunds
// - Amber: Medium priority, pending
// - Green: Resolved, payments released
// - Blue: Low priority, information
// - Purple: Escalated, under review
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getAllDisputesAdmin, resolveDisputeAdmin, rejectDisputeAdmin, markUnderReviewAdmin, DisputeResponse } from '@/src/lib/api/disputes'
import {
  Scale,
  AlertTriangle,
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
  Flag,
  FileText,
  MessageSquare,
  DollarSign,
  CreditCard,
  ArrowUpDown,
  MoreVertical,
  X,
  Info,
  Shield,
  Award,
  Ban,
  Heart,
  Star,
  MapPin,
  Camera
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type DisputeType = 
  | 'no_show_guide' 
  | 'no_show_traveler' 
  | 'cancellation' 
  | 'quality' 
  | 'payment' 
  | 'safety' 
  | 'other'

type DisputeStatus = 
  | 'pending' 
  | 'under_review' 
  | 'escalated' 
  | 'resolved_refund' 
  | 'resolved_payment' 
  | 'resolved_partial' 
  | 'dismissed'

type DisputePriority = 'high' | 'medium' | 'low'

interface DisputeEvidence {
  id: string
  type: 'message' | 'photo' | 'receipt' | 'statement'
  submittedBy: 'traveler' | 'guide' | 'system'
  content: string
  url?: string
  timestamp: string
}

interface Dispute {
  id: string
  disputeId: string
  type: DisputeType
  status: DisputeStatus
  priority: DisputePriority
  bookingId: string
  tourId: string
  tourTitle: string
  tourImage?: string
  tourDate: string
  tourLocation: string
  amount: number
  currency: 'USD' | 'TRY' | 'LBP'
  
  traveler: {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
    totalTrips: number
    joinedAt: string
  }
  
  guide: {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
    totalTrips: number
    impactScore: number
    joinedAt: string
  }
  
  travelerClaim: {
    description: string
    requestedAction: 'refund' | 'partial_refund' | 'rebooking' | 'other'
    requestedAmount?: number
    evidence: DisputeEvidence[]
    submittedAt: string
  }
  
  guideClaim?: {
    description: string
    response: 'accept' | 'dispute' | 'counter'
    counterOffer?: string
    evidence: DisputeEvidence[]
    submittedAt: string
  }
  
  adminNotes?: {
    id: string
    adminId: string
    adminName: string
    content: string
    createdAt: string
  }[]
  
  history: {
    id: string
    action: string
    adminId?: string
    adminName?: string
    reason?: string
    timestamp: string
  }[]
  
  deadline: string
  timeRemaining: number // in hours
}

interface DisputeStats {
  total: number
  pending: number
  underReview: number
  escalated: number
  resolved: number
  highPriority: number
  totalAmount: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_DISPUTE_STATS: DisputeStats = {
  total: 28,
  pending: 12,
  underReview: 8,
  escalated: 3,
  resolved: 5,
  highPriority: 7,
  totalAmount: 3450
}

const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'd1',
    disputeId: 'DSP-2026-001',
    type: 'no_show_guide',
    status: 'pending',
    priority: 'high',
    bookingId: 'B123',
    tourId: 't1',
    tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
    tourImage: '/images/tours/istanbul-ottoman.jpg',
    tourDate: '2026-03-10T09:00:00Z',
    tourLocation: 'Istanbul, Turkey',
    amount: 178,
    currency: 'USD',
    
    traveler: {
      id: 'trav123',
      name: 'Ahmed Khan',
      email: 'ahmed.khan@example.com',
      phone: '+90 555 111 2233',
      avatar: '/images/travelers/ahmed.jpg',
      totalTrips: 12,
      joinedAt: '2025-06-15'
    },
    
    guide: {
      id: 'guide123',
      name: 'Mehmet Yilmaz',
      email: 'mehmet.yilmaz@example.com',
      phone: '+90 555 123 4567',
      avatar: '/images/guides/mehmet.jpg',
      totalTrips: 156,
      impactScore: 87,
      joinedAt: '2023-06-01'
    },
    
    travelerClaim: {
      description: 'Guide did not show up at meeting point. Waited for 45 minutes and tried calling but no response.',
      requestedAction: 'refund',
      requestedAmount: 178,
      evidence: [
        {
          id: 'e1',
          type: 'message',
          submittedBy: 'traveler',
          content: 'Screenshots of messages showing attempts to contact guide',
          timestamp: '2026-03-10T09:45:00Z'
        },
        {
          id: 'e2',
          type: 'photo',
          submittedBy: 'traveler',
          content: 'Photo of empty meeting point with timestamp',
          timestamp: '2026-03-10T09:30:00Z'
        }
      ],
      submittedAt: '2026-03-10T10:15:00Z'
    },
    
    guideClaim: {
      description: 'I was at the meeting point. Traveler arrived 30 minutes late and I had to start the tour with other guests.',
      response: 'dispute',
      evidence: [
        {
          id: 'e3',
          type: 'message',
          submittedBy: 'guide',
          content: 'Messages showing I was at the location',
          timestamp: '2026-03-10T09:50:00Z'
        }
      ],
      submittedAt: '2026-03-10T11:20:00Z'
    },
    
    history: [
      {
        id: 'h1',
        action: 'Dispute filed by traveler',
        timestamp: '2026-03-10T10:15:00Z'
      },
      {
        id: 'h2',
        action: 'Guide responded',
        timestamp: '2026-03-10T11:20:00Z'
      }
    ],
    
    deadline: '2026-03-13T10:15:00Z',
    timeRemaining: 24
  },
  {
    id: 'd2',
    disputeId: 'DSP-2026-002',
    type: 'quality',
    status: 'under_review',
    priority: 'medium',
    bookingId: 'B124',
    tourId: 't2',
    tourTitle: 'Beirut Street Food & Cultural Walk',
    tourImage: '/images/tours/beirut-food.jpg',
    tourDate: '2026-03-08T11:00:00Z',
    tourLocation: 'Beirut, Lebanon',
    amount: 171,
    currency: 'USD',
    
    traveler: {
      id: 'trav124',
      name: 'Fatima Hassan',
      email: 'fatima.h@example.com',
      phone: '+961 70 123 456',
      avatar: '/images/travelers/fatima.jpg',
      totalTrips: 5,
      joinedAt: '2025-09-20'
    },
    
    guide: {
      id: 'guide124',
      name: 'Layla Hassan',
      email: 'layla.hassan@example.com',
      phone: '+961 70 123 456',
      avatar: '/images/guides/layla.jpg',
      totalTrips: 89,
      impactScore: 92,
      joinedAt: '2024-02-15'
    },
    
    travelerClaim: {
      description: 'Tour was only 2 hours instead of advertised 3 hours. Skipped several promised food stops.',
      requestedAction: 'partial_refund',
      requestedAmount: 85,
      evidence: [
        {
          id: 'e4',
          type: 'photo',
          submittedBy: 'traveler',
          content: 'Photos showing end time',
          timestamp: '2026-03-08T13:15:00Z'
        }
      ],
      submittedAt: '2026-03-08T15:30:00Z'
    },
    
    guideClaim: {
      description: 'Tour duration was affected by heavy traffic. All food stops were included but some were quicker than usual.',
      response: 'counter',
      counterOffer: '50% refund',
      evidence: [],
      submittedAt: '2026-03-09T10:15:00Z'
    },
    
    adminNotes: [
      {
        id: 'n1',
        adminId: 'admin2',
        adminName: 'Moderator',
        content: 'Reviewing timeline and photos. Traffic conditions verified.',
        createdAt: '2026-03-09T14:20:00Z'
      }
    ],
    
    history: [
      {
        id: 'h3',
        action: 'Dispute filed by traveler',
        timestamp: '2026-03-08T15:30:00Z'
      },
      {
        id: 'h4',
        action: 'Guide responded with counter offer',
        timestamp: '2026-03-09T10:15:00Z'
      },
      {
        id: 'h5',
        action: 'Assigned to moderator',
        adminName: 'Moderator',
        timestamp: '2026-03-09T14:00:00Z'
      }
    ],
    
    deadline: '2026-03-15T15:30:00Z',
    timeRemaining: 48
  },
  {
    id: 'd3',
    disputeId: 'DSP-2026-003',
    type: 'no_show_traveler',
    status: 'escalated',
    priority: 'high',
    bookingId: 'B125',
    tourId: 't3',
    tourTitle: 'Cappadocia Sunrise Balloon & Valley Hike',
    tourImage: '/images/tours/cappadocia-balloon.jpg',
    tourDate: '2026-03-07T04:30:00Z',
    tourLocation: 'Cappadocia, Turkey',
    amount: 398,
    currency: 'USD',
    
    traveler: {
      id: 'trav125',
      name: 'Omar Farooq',
      email: 'omar.f@example.com',
      phone: '+90 555 333 4455',
      totalTrips: 2,
      joinedAt: '2026-01-10'
    },
    
    guide: {
      id: 'guide125',
      name: 'Ahmet Demir',
      email: 'ahmet.demir@example.com',
      phone: '+90 555 987 6543',
      avatar: '/images/guides/ahmet.jpg',
      totalTrips: 45,
      impactScore: 78,
      joinedAt: '2024-08-20'
    },
    
    travelerClaim: {
      description: 'I arrived at the meeting point but guide was not there. Waited until 5:00 AM.',
      requestedAction: 'refund',
      requestedAmount: 398,
      evidence: [],
      submittedAt: '2026-03-07T10:30:00Z'
    },
    
    guideClaim: {
      description: 'Traveler never showed up. I waited with other guests until 4:45 AM and had to leave.',
      response: 'dispute',
      evidence: [
        {
          id: 'e5',
          type: 'photo',
          submittedBy: 'guide',
          content: 'Photo of group at meeting point',
          timestamp: '2026-03-07T04:35:00Z'
        }
      ],
      submittedAt: '2026-03-07T12:15:00Z'
    },
    
    adminNotes: [
      {
        id: 'n2',
        adminId: 'admin1',
        adminName: 'Admin User',
        content: 'Conflicting claims. Requesting additional evidence from both parties.',
        createdAt: '2026-03-08T09:00:00Z'
      }
    ],
    
    history: [
      {
        id: 'h6',
        action: 'Dispute filed by traveler',
        timestamp: '2026-03-07T10:30:00Z'
      },
      {
        id: 'h7',
        action: 'Guide responded',
        timestamp: '2026-03-07T12:15:00Z'
      },
      {
        id: 'h8',
        action: 'Escalated to senior admin',
        adminName: 'Admin User',
        reason: 'Conflicting claims, need investigation',
        timestamp: '2026-03-08T09:30:00Z'
      }
    ],
    
    deadline: '2026-03-14T10:30:00Z',
    timeRemaining: 18
  },
  {
    id: 'd4',
    disputeId: 'DSP-2026-004',
    type: 'payment',
    status: 'pending',
    priority: 'medium',
    bookingId: 'B126',
    tourId: 't4',
    tourTitle: 'Byblos Ancient Ruins & Archaeological Tour',
    tourImage: '/images/tours/byblos-ruins.jpg',
    tourDate: '2026-03-05T10:00:00Z',
    tourLocation: 'Byblos, Lebanon',
    amount: 110,
    currency: 'USD',
    
    traveler: {
      id: 'trav126',
      name: 'Layla Mahmoud',
      email: 'layla.m@example.com',
      phone: '+961 76 789 012',
      totalTrips: 8,
      joinedAt: '2025-11-05'
    },
    
    guide: {
      id: 'guide126',
      name: 'Elias Khoury',
      email: 'elias.khoury@example.com',
      phone: '+961 76 789 012',
      totalTrips: 23,
      impactScore: 65,
      joinedAt: '2025-03-10'
    },
    
    travelerClaim: {
      description: 'Guide requested additional payment in cash during the tour.',
      requestedAction: 'refund',
      requestedAmount: 110,
      evidence: [
        {
          id: 'e6',
          type: 'message',
          submittedBy: 'traveler',
          content: 'Screenshot of messages where guide asks for extra payment',
          timestamp: '2026-03-05T12:30:00Z'
        }
      ],
      submittedAt: '2026-03-05T14:15:00Z'
    },
    
    guideClaim: {
      description: 'I never asked for extra payment. This is false accusation.',
      response: 'dispute',
      evidence: [],
      submittedAt: '2026-03-06T09:20:00Z'
    },
    
    history: [
      {
        id: 'h9',
        action: 'Dispute filed by traveler',
        timestamp: '2026-03-05T14:15:00Z'
      },
      {
        id: 'h10',
        action: 'Guide responded',
        timestamp: '2026-03-06T09:20:00Z'
      }
    ],
    
    deadline: '2026-03-12T14:15:00Z',
    timeRemaining: 36
  }
]

// ============================================================================
// DISPUTE TYPE BADGE
// ============================================================================

const DisputeTypeBadge = ({ type }: { type: DisputeType }) => {
  const styles = {
    no_show_guide: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
    no_show_traveler: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    cancellation: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50',
    quality: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    payment: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
    safety: 'bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800/50',
    other: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700'
  }

  const labels = {
    no_show_guide: 'Guide No-Show',
    no_show_traveler: 'Traveler No-Show',
    cancellation: 'Cancellation',
    quality: 'Quality Issue',
    payment: 'Payment Dispute',
    safety: 'Safety Concern',
    other: 'Other'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[type]}`}>
      {type.includes('no_show') ? <Clock className="w-3.5 h-3.5" /> : 
       type === 'quality' ? <Star className="w-3.5 h-3.5" /> :
       type === 'payment' ? <DollarSign className="w-3.5 h-3.5" /> :
       type === 'safety' ? <Shield className="w-3.5 h-3.5" /> :
       <AlertTriangle className="w-3.5 h-3.5" />}
      {labels[type]}
    </span>
  )
}

// ============================================================================
// DISPUTE STATUS BADGE
// ============================================================================

const DisputeStatusBadge = ({ status }: { status: DisputeStatus }) => {
  const styles = {
    pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    under_review: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    escalated: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
    resolved_refund: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
    resolved_payment: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    resolved_partial: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    dismissed: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700'
  }

  const labels = {
    pending: 'Pending',
    under_review: 'Under Review',
    escalated: 'Escalated',
    resolved_refund: 'Resolved (Refund)',
    resolved_payment: 'Resolved (Payment)',
    resolved_partial: 'Resolved (Partial)',
    dismissed: 'Dismissed'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {status.includes('resolved') ? <CheckCircle className="w-3.5 h-3.5" /> :
       status === 'escalated' ? <AlertTriangle className="w-3.5 h-3.5" /> :
       status === 'under_review' ? <Eye className="w-3.5 h-3.5" /> :
       status === 'dismissed' ? <XCircle className="w-3.5 h-3.5" /> :
       <Clock className="w-3.5 h-3.5" />}
      {labels[status]}
    </span>
  )
}

// ============================================================================
// PRIORITY BADGE
// ============================================================================

const PriorityBadge = ({ priority }: { priority: DisputePriority }) => {
  const styles = {
    high: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
    medium: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    low: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
  }

  const icons = {
    high: AlertTriangle,
    medium: Clock,
    low: Info
  }

  const Icon = icons[priority]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[priority]}`}>
      <Icon className="w-3.5 h-3.5" />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

// ============================================================================
// TIME REMAINING BADGE
// ============================================================================

const TimeRemainingBadge = ({ hours }: { hours: number }) => {
  const getColor = () => {
    if (hours < 12) return 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50'
    if (hours < 24) return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
    return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getColor()}`}>
      <Clock className="w-3.5 h-3.5" />
      {hours}h left
    </span>
  )
}

// ============================================================================
// DISPUTE DETAILS MODAL
// ============================================================================

const DisputeDetailsModal = ({ isOpen, onClose, dispute, onResolve }: any) => {
  const [resolution, setResolution] = useState<'refund' | 'payment' | 'partial' | 'dismiss'>('refund')
  const [resolutionAmount, setResolutionAmount] = useState(dispute?.amount || 0)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [showResolutionForm, setShowResolutionForm] = useState(false)

  if (!isOpen || !dispute) return null

  const handleResolve = () => {
    if (!resolutionNotes.trim()) {
      alert('Please add resolution notes')
      return
    }
    onResolve(dispute.id, resolution, resolutionAmount, resolutionNotes)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-white" />
              <h3 className="text-lg font-bold text-white">Dispute #{dispute.disputeId}</h3>
              <DisputeStatusBadge status={dispute.status} />
              <PriorityBadge priority={dispute.priority} />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
          {/* Tour Info */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <Image src={dispute.tourImage} alt={dispute.tourTitle} width={64} height={64} className="object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{dispute.tourTitle}</h4>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(dispute.tourDate).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {dispute.tourLocation}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  ${dispute.amount} {dispute.currency}
                </span>
              </div>
            </div>
            <TimeRemainingBadge hours={dispute.timeRemaining} />
          </div>

          {/* Two Columns: Traveler vs Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traveler Column */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-800/50">
                <h5 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Traveler Claim
                </h5>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                      {dispute.traveler.avatar ? (
                        <Image src={dispute.traveler.avatar} alt={dispute.traveler.name} width={40} height={40} className="object-cover" />
                      ) : (
                        <User className="w-4 h-4 m-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{dispute.traveler.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{dispute.traveler.totalTrips} trips</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{dispute.travelerClaim.description}</p>
                <div className="space-y-2">
                  {dispute.travelerClaim.evidence.map((ev: any) => (
                    <div key={ev.id} className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        {ev.type === 'message' && <MessageSquare className="w-3 h-3 text-blue-600" />}
                        {ev.type === 'photo' && <Camera className="w-3 h-3 text-purple-600" />}
                        {ev.type === 'receipt' && <FileText className="w-3 h-3 text-emerald-600" />}
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{ev.type}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{ev.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Guide Column */}
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                <h5 className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Guide Response
                </h5>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                      {dispute.guide.avatar ? (
                        <Image src={dispute.guide.avatar} alt={dispute.guide.name} width={40} height={40} className="object-cover" />
                      ) : (
                        <User className="w-4 h-4 m-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{dispute.guide.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Impact Score: {dispute.guide.impactScore}</p>
                  </div>
                </div>
                {dispute.guideClaim ? (
                  <>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{dispute.guideClaim.description}</p>
                    <div className="space-y-2">
                      {dispute.guideClaim.evidence.map((ev: any) => (
                        <div key={ev.id} className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 mb-1">
                            {ev.type === 'message' && <MessageSquare className="w-3 h-3 text-emerald-600" />}
                            {ev.type === 'photo' && <Camera className="w-3 h-3 text-purple-600" />}
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{ev.type}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{ev.content}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No response yet</p>
                )}
              </div>
            </div>
          </div>

          {/* History Timeline */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              History
            </h5>
            <div className="space-y-3">
              {dispute.history.map((item: any, idx: number) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 mt-2 rounded-full bg-amber-500" />
                    {idx < dispute.history.length - 1 && (
                      <div className="absolute top-4 left-1 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm text-gray-900 dark:text-white">{item.action}</p>
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

          {/* Resolution Form */}
          {dispute.status !== 'resolved_refund' && 
           dispute.status !== 'resolved_payment' && 
           dispute.status !== 'resolved_partial' && 
           dispute.status !== 'dismissed' && (
            <div className="space-y-4">
              {showResolutionForm ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-800/50">
                  <h5 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-3">Resolution</h5>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Decision</label>
                      <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                      >
                        <option value="refund">Full Refund to Traveler</option>
                        <option value="payment">Release Payment to Guide</option>
                        <option value="partial">Partial Refund (50%)</option>
                        <option value="dismiss">Dismiss Dispute</option>
                      </select>
                    </div>

                    {(resolution === 'refund' || resolution === 'partial') && (
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Refund Amount ($)</label>
                        <input
                          type="number"
                          value={resolutionAmount}
                          onChange={(e) => setResolutionAmount(Number(e.target.value))}
                          max={dispute.amount}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Resolution Notes</label>
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        rows={3}
                        placeholder="Explain your decision..."
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleResolve}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        Submit Decision
                      </button>
                      <button
                        onClick={() => setShowResolutionForm(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowResolutionForm(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Scale className="w-5 h-5" />
                  Resolve Dispute
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MOBILE CARD
// ============================================================================

const MobileCard = ({ dispute, onSelect }: any) => (
  <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
    <div className="flex items-start justify-between mb-3">
      <div>
        <div className="font-semibold text-gray-900 dark:text-white">{dispute.disputeId}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{dispute.tourTitle}</div>
      </div>
      <DisputeStatusBadge status={dispute.status} />
    </div>

    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          {dispute.traveler.avatar ? (
            <Image src={dispute.traveler.avatar} alt={dispute.traveler.name} width={24} height={24} className="object-cover" />
          ) : (
            <User className="w-3 h-3 m-1.5 text-gray-400" />
          )}
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">vs</span>
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          {dispute.guide.avatar ? (
            <Image src={dispute.guide.avatar} alt={dispute.guide.name} width={24} height={24} className="object-cover" />
          ) : (
            <User className="w-3 h-3 m-1.5 text-gray-400" />
          )}
        </div>
      </div>
      <PriorityBadge priority={dispute.priority} />
    </div>

    <div className="flex items-center justify-between mb-3 text-xs">
      <span className="text-gray-500 dark:text-gray-400">${dispute.amount}</span>
      <TimeRemainingBadge hours={dispute.timeRemaining} />
    </div>

    <button
      onClick={onSelect}
      className="w-full px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-sm font-medium rounded-lg"
    >
      Review Dispute
    </button>
  </div>
)

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminDisputeCourtPage() {
  const [filterType, setFilterType] = useState<DisputeType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<DisputeStatus | 'all'>('pending')
  const [filterPriority, setFilterPriority] = useState<DisputePriority | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const itemsPerPage = 5

  const [realDisputes, setRealDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDisputes = async () => {
    setLoading(true)
    try {
      const res = await getAllDisputesAdmin(0, 50)
      const mapped = res.content.map((d: DisputeResponse) => ({
        id: d.id.toString(),
        disputeId: `DSP-${d.id}`,
        type: d.reason.toLowerCase(),
        status: d.status.toLowerCase() === 'open' ? 'pending' : d.status.toLowerCase(),
        priority: 'medium',
        bookingId: `BK-${d.bookingId}`,
        tourTitle: `Booking #${d.bookingId}`,
        tourImage: '/images/tours/istanbul-ottoman.jpg',
        tourDate: d.createdAtUtc,
        tourLocation: 'Unknown',
        amount: d.refundAmount || 0,
        currency: 'USD',
        
        traveler: {
          id: d.openedByRole === 'Traveler' ? d.openedByUserId : d.againstUserId,
          name: d.openedByRole === 'Traveler' ? d.openedByFullName : d.againstFullName,
          email: '', phone: '', totalTrips: 0, joinedAt: ''
        },
        
        guide: {
          id: d.openedByRole === 'Guide' ? d.openedByUserId : d.againstUserId,
          name: d.openedByRole === 'Guide' ? d.openedByFullName : d.againstFullName,
          email: '', phone: '', totalTrips: 0, impactScore: 0, joinedAt: ''
        },
        
        travelerClaim: {
          description: d.openedByRole === 'Traveler' ? d.description : (d.againstUserResponse || 'No response yet.'),
          requestedAction: 'refund',
          evidence: [],
          submittedAt: d.createdAtUtc
        },
        
        guideClaim: (d.openedByRole === 'Guide' || d.againstUserResponse) ? {
          description: d.openedByRole === 'Guide' ? d.description : d.againstUserResponse,
          response: 'dispute',
          evidence: [],
          submittedAt: d.createdAtUtc
        } : null,
        
        history: [],
        deadline: new Date(Date.now() + 86400000).toISOString(),
        timeRemaining: 24
      }))
      setRealDisputes(mapped)
    } catch (e) {
      console.error('Failed to fetch disputes:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDisputes()
  }, [])

  // Filter disputes
  const filteredDisputes = useMemo(() => {
    const listToFilter = realDisputes.length > 0 || !loading ? realDisputes : MOCK_DISPUTES
    return listToFilter.filter(dispute => {
      if (filterType !== 'all' && dispute.type !== filterType) return false
      if (filterStatus !== 'all' && dispute.status !== filterStatus) return false
      if (filterPriority !== 'all' && dispute.priority !== filterPriority) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (
          dispute.disputeId.toLowerCase().includes(term) ||
          dispute.tourTitle.toLowerCase().includes(term) ||
          dispute.traveler.name.toLowerCase().includes(term) ||
          dispute.guide.name.toLowerCase().includes(term)
        )
      }
      return true
    })
  }, [filterType, filterStatus, filterPriority, searchTerm])

  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage)
  const paginatedDisputes = filteredDisputes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const resetFilters = () => {
    setFilterType('all')
    setFilterStatus('pending')
    setFilterPriority('all')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleResolve = async (id: string, resolution: string, amount: number, notes: string) => {
    try {
      if (resolution === 'dismiss') {
        await rejectDisputeAdmin(Number(id), notes)
      } else {
        await resolveDisputeAdmin(Number(id), { resolutionNote: notes, refundAmount: amount })
      }
      alert(`✅ Dispute resolved! Decision: ${resolution}, Amount: $${amount}`)
      fetchDisputes()
    } catch (e) {
      console.error('Failed to resolve dispute:', e)
      alert('Error resolving dispute')
    }
  }

  return (
    <>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Dispute Court
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Resolve conflicts between travelers and guides
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
              { key: 'total', label: 'Total', value: MOCK_DISPUTE_STATS.total, color: 'gray', action: () => setFilterStatus('all') },
              { key: 'pending', label: 'Pending', value: MOCK_DISPUTE_STATS.pending, color: 'amber', action: () => setFilterStatus('pending') },
              { key: 'underReview', label: 'Under Review', value: MOCK_DISPUTE_STATS.underReview, color: 'blue', action: () => setFilterStatus('under_review') },
              { key: 'highPriority', label: 'High Priority', value: MOCK_DISPUTE_STATS.highPriority, color: 'red', action: () => setFilterPriority('high') }
            ].map(stat => (
              <div
                key={stat.key}
                onClick={stat.action}
                className={`group p-4 bg-white dark:bg-gray-900 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 border-2 ${
                  (stat.key === 'highPriority' && filterPriority === 'high') ||
                  (stat.key === 'underReview' && filterStatus === 'under_review') ||
                  (stat.key === 'pending' && filterStatus === 'pending') ||
                  (stat.key === 'total' && filterStatus === 'all')
                    ? `border-${stat.color}-500 ring-2 ring-${stat.color}-200 dark:ring-${stat.color}-800`
                    : 'border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700'
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as DisputeType | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            >
              <option value="all">All Types</option>
              <option value="no_show_guide">Guide No-Show</option>
              <option value="no_show_traveler">Traveler No-Show</option>
              <option value="cancellation">Cancellation</option>
              <option value="quality">Quality Issue</option>
              <option value="payment">Payment Dispute</option>
              <option value="safety">Safety Concern</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as DisputeStatus | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="escalated">Escalated</option>
              <option value="resolved_refund">Resolved (Refund)</option>
              <option value="resolved_payment">Resolved (Payment)</option>
              <option value="resolved_partial">Resolved (Partial)</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as DisputePriority | 'all')}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by dispute ID, tour, or parties..."
              className="w-full pl-11 pr-11 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {paginatedDisputes.length} of {filteredDisputes.length} disputes
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dispute ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tour</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parties</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedDisputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {dispute.disputeId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{dispute.tourTitle}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">${dispute.amount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          {dispute.traveler.avatar ? (
                            <Image src={dispute.traveler.avatar} alt={dispute.traveler.name} width={24} height={24} className="object-cover" />
                          ) : (
                            <User className="w-3 h-3 m-1.5 text-gray-400" />
                          )}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">vs</span>
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          {dispute.guide.avatar ? (
                            <Image src={dispute.guide.avatar} alt={dispute.guide.name} width={24} height={24} className="object-cover" />
                          ) : (
                            <User className="w-3 h-3 m-1.5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><DisputeTypeBadge type={dispute.type} /></td>
                    <td className="px-6 py-4"><DisputeStatusBadge status={dispute.status} /></td>
                    <td className="px-6 py-4"><PriorityBadge priority={dispute.priority} /></td>
                    <td className="px-6 py-4"><TimeRemainingBadge hours={dispute.timeRemaining} /></td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedDispute(dispute); setShowDetailsModal(true); }}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {paginatedDisputes.map((dispute) => (
              <MobileCard
                key={dispute.id}
                dispute={dispute}
                onSelect={() => { setSelectedDispute(dispute); setShowDetailsModal(true); }}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredDisputes.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-amber-900/30 rounded-full flex items-center justify-center">
                <Scale className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No disputes found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters.</p>
              <button onClick={resetFilters} className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredDisputes.length > 0 && (
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

      {/* Details Modal */}
      {selectedDispute && (
        <DisputeDetailsModal
          isOpen={showDetailsModal}
          onClose={() => { setShowDetailsModal(false); setSelectedDispute(null); }}
          dispute={selectedDispute}
          onResolve={handleResolve}
        />
      )}
    </>
  )
}