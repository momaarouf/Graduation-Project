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
import { toast } from 'react-hot-toast'
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
    no_show_guide: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    no_show_traveler: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    cancellation: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    quality: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    payment: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    safety: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    other: 'bg-theme-muted/10 text-theme-secondary border-theme'
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
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded border ${styles[type]}`}>
      {type.includes('no_show') ? <Clock className="w-3 h-3" /> : 
      type === 'quality' ? <Star className="w-3 h-3" /> :
      type === 'payment' ? <DollarSign className="w-3 h-3" /> :
      type === 'safety' ? <Shield className="w-3 h-3" /> :
      <AlertTriangle className="w-3 h-3" />}
      {labels[type]}
    </span>
  )
}

// ============================================================================
// DISPUTE STATUS BADGE
// ============================================================================

const DisputeStatusBadge = ({ status }: { status: DisputeStatus }) => {
  const styles = {
    pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    under_review: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    escalated: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    resolved_refund: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    resolved_payment: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    resolved_partial: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    dismissed: 'bg-theme-muted/10 text-theme-secondary border-theme'
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
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded border ${styles[status]}`}>
      {status.includes('resolved') ? <CheckCircle className="w-3 h-3" /> :
      status === 'escalated' ? <AlertTriangle className="w-3 h-3" /> :
      status === 'under_review' ? <Eye className="w-3 h-3" /> :
      status === 'dismissed' ? <XCircle className="w-3 h-3" /> :
      <Clock className="w-3 h-3" />}
      {labels[status]}
    </span>
  )
}

// ============================================================================
// PRIORITY BADGE
// ============================================================================

const PriorityBadge = ({ priority }: { priority: DisputePriority }) => {
  const styles = {
    high: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
  }

  const icons = {
    high: AlertTriangle,
    medium: Clock,
    low: Info
  }

  const Icon = icons[priority]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded border ${styles[priority]}`}>
      <Icon className="w-3 h-3" />
      {priority}
    </span>
  )
}

// ============================================================================
// TIME REMAINING BADGE
// ============================================================================

const TimeRemainingBadge = ({ hours }: { hours: number }) => {
  const getColor = () => {
    if (hours < 12) return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
    if (hours < 24) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded border ${getColor()}`}>
      <Clock className="w-3 h-3" />
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
      toast.error('Please add resolution notes')
      return
    }
    onResolve(dispute.id, resolution, resolutionAmount, resolutionNotes)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-5xl surface-card rounded-t-3xl sm:rounded-2xl shadow-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden border-t sm:border border-theme animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 px-5 py-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-bold text-white">Dispute #{dispute.id}</h3>
                <div className="flex gap-2 mt-0.5">
                  <DisputeStatusBadge status={dispute.status} />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 surface-section rounded-xl border border-theme flex flex-col justify-center">
              <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-1">Status & Priority</span>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={dispute.priority} />
                <TimeRemainingBadge hours={dispute.timeRemaining} />
              </div>
            </div>
            <div className="md:col-span-2 p-4 surface-section rounded-xl border border-theme flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                <Image src={dispute.tourImage} alt={dispute.tourTitle} width={48} height={48} className="object-cover w-full h-full" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-theme-primary truncate">{dispute.tourTitle}</h4>
                <p className="text-xs text-theme-muted truncate">{dispute.tourLocation}</p>
              </div>
              <div className="ml-auto text-right">
                <span className="text-lg font-black text-primary-light dark:text-primary-dark">${dispute.amount}</span>
                <p className="text-[10px] text-theme-muted uppercase font-bold tracking-widest">{dispute.currency}</p>
              </div>
            </div>
          </div>

          {/* Arbitration Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traveler Claim */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h5 className="text-xs font-bold text-theme-primary uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-light" />
                  Traveler Side
                </h5>
                <span className="text-[10px] text-theme-muted">{new Date(dispute.travelerClaim.submittedAt).toLocaleDateString()}</span>
              </div>
              <div className="p-4 bg-primary-light/5 border border-primary-light/20 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-section border border-theme overflow-hidden">
                    {dispute.traveler.avatar ? (
                      <Image src={dispute.traveler.avatar} alt={dispute.traveler.name} width={40} height={40} className="object-cover" />
                    ) : (
                      <User className="w-5 h-5 m-2.5 text-theme-muted" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-theme-primary">{dispute.traveler.name}</p>
                    <p className="text-[10px] text-theme-muted">UID: {dispute.traveler.id}</p>
                  </div>
                </div>
                <p className="text-sm text-theme-secondary leading-relaxed bg-surface-card p-3 rounded-xl border border-theme">
                  {dispute.travelerClaim.description}
                </p>
                {dispute.travelerClaim.evidence.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {dispute.travelerClaim.evidence.map((ev: any) => (
                      <div key={ev.id} className="p-2 surface-card rounded-lg border border-theme text-center">
                        <span className="text-[10px] font-bold text-theme-muted uppercase">{ev.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Guide Response */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h5 className="text-xs font-bold text-theme-primary uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success-green" />
                  Guide Side
                </h5>
                {dispute.guideClaim && <span className="text-[10px] text-theme-muted">{new Date(dispute.guideClaim.submittedAt).toLocaleDateString()}</span>}
              </div>
              <div className="p-4 bg-success-green/5 border border-success-green/20 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-section border border-theme overflow-hidden">
                    {dispute.guide.avatar ? (
                      <Image src={dispute.guide.avatar} alt={dispute.guide.name} width={40} height={40} className="object-cover" />
                    ) : (
                      <User className="w-5 h-5 m-2.5 text-theme-muted" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-theme-primary">{dispute.guide.name}</p>
                    <p className="text-[10px] text-theme-muted">UID: {dispute.guide.id}</p>
                  </div>
                </div>
                {dispute.guideClaim ? (
                  <p className="text-sm text-theme-secondary leading-relaxed bg-surface-card p-3 rounded-xl border border-theme">
                    {dispute.guideClaim.description}
                  </p>
                ) : (
                  <div className="py-6 text-center border-2 border-dashed border-theme rounded-xl">
                    <p className="text-xs text-theme-muted font-medium italic">Waiting for guide response...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resolution Footer */}
          <div className="mt-8 pt-6 border-t border-theme">
            {dispute.status === 'resolved_refund' || dispute.status === 'resolved_payment' ? (
              <div className="p-4 bg-theme-muted/10 rounded-xl border border-theme">
                <h6 className="text-sm font-bold text-theme-primary mb-2">Arbitration Completed</h6>
                <p className="text-xs text-theme-secondary italic">"{dispute.resolutionNote || 'Resolved by administrator.'}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {!showResolutionForm ? (
                  <button
                    onClick={() => setShowResolutionForm(true)}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Scale className="w-5 h-5" />
                    Resolve Dispute Now
                  </button>
                ) : (
                  <div className="surface-section p-4 rounded-2xl border border-theme space-y-4">
                    <h6 className="text-sm font-bold text-theme-primary">Final Resolution</h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1.5">Decision</label>
                        <select
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value as any)}
                          className="w-full px-4 py-2.5 surface-card border border-theme rounded-xl text-sm font-medium"
                        >
                          <option value="refund">Full Refund to Traveler</option>
                          <option value="payment">Release to Guide</option>
                          <option value="dismiss">Dismiss Case</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1.5">Resolution Notes</label>
                        <textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Explain your arbitration decision..."
                          className="w-full px-4 py-2.5 surface-card border border-theme rounded-xl text-sm min-h-[44px]"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleResolve} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all">Submit</button>
                      <button onClick={() => setShowResolutionForm(false)} className="flex-1 py-3 surface-card border border-theme text-theme-secondary font-bold rounded-xl active:scale-95 transition-all">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MOBILE CARD
// ============================================================================

const MobileCard = ({ dispute, onSelect }: any) => (
  <div className="surface-card border border-theme rounded-2xl p-4 space-y-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">#{dispute.disputeId}</div>
        <h4 className="font-bold text-theme-primary truncate leading-tight">{dispute.tourTitle}</h4>
        <p className="text-[11px] text-theme-muted mt-1">{new Date(dispute.tourDate).toLocaleDateString()}</p>
      </div>
      <DisputeStatusBadge status={dispute.status} />
    </div>

    <div className="flex items-center justify-between p-3 bg-surface-section rounded-xl border border-theme">
      <div className="flex -space-x-3">
        {[dispute.traveler, dispute.guide].map((u, i) => (
          <div key={i} className="w-8 h-8 rounded-full border-2 border-surface-card bg-surface-base overflow-hidden">
             {u.avatar ? <Image src={u.avatar} alt="" width={32} height={32} className="object-cover" /> : <User className="w-4 h-4 m-1.5 text-theme-muted" />}
          </div>
        ))}
      </div>
      <div className="text-right">
        <span className="text-sm font-black text-primary-light dark:text-primary-dark">${dispute.amount}</span>
        <div className="flex gap-1 mt-1">
          <PriorityBadge priority={dispute.priority} />
        </div>
      </div>
    </div>

    <button
      onClick={onSelect}
      className="w-full py-3 bg-primary-light/10 text-primary-light hover:bg-primary-light hover:text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all border border-primary-light/20"
    >
      Review Arbitration
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

 const handleResolve = async (id: string, resolution: string, amount: number, notes: string) => {
  try {
  if (resolution === 'dismiss') {
  await rejectDisputeAdmin(Number(id), notes)
  } else {
  await resolveDisputeAdmin(Number(id), { resolutionNote: notes, refundAmount: amount })
  }
  toast.success(`Dispute resolved as ${resolution}`)
  fetchDisputes()
  } catch (e) {
  console.error('Failed to resolve dispute:', e)
  toast.error('Error resolving dispute')
  }
  }

  // Real-time stats calculation
  const stats = useMemo(() => {
    return {
      total: realDisputes.length,
      pending: realDisputes.filter(d => d.status === 'pending').length,
      underReview: realDisputes.filter(d => d.status === 'under_review').length,
      highPriority: realDisputes.filter(d => d.priority === 'high').length,
    }
  }, [realDisputes])

 // Filter disputes
 const filteredDisputes = useMemo(() => {
 return realDisputes.filter(dispute => {
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
 }, [filterType, filterStatus, filterPriority, searchTerm, realDisputes])

 const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage)
 const paginatedDisputes = filteredDisputes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

 const resetFilters = () => {
 setFilterType('all')
 setFilterStatus('pending')
 setFilterPriority('all')
 setSearchTerm('')
 setCurrentPage(1)
 }

 return (
    <>
    <div className="min-h-screen surface-base">
  <div className="container-safe mx-auto max-w-7xl py-6 sm:py-10 px-4 sm:px-6">
  
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
     <div>
       <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-1 tracking-tight">
         Dispute Court
       </h1>
       <p className="text-xs sm:text-sm text-theme-secondary">
         Neutral arbitration and conflict resolution center
       </p>
     </div>
     <button
       onClick={resetFilters}
       className="px-5 py-2.5 bg-primary-light hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 self-start active:scale-95"
     >
       <RefreshCw className="w-3.5 h-3.5" />
       Reset Court
     </button>
   </div>

   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
     {[
       { key: 'total', label: 'Total Cases', value: stats.total, color: 'blue', action: () => setFilterStatus('all') },
       { key: 'pending', label: 'Awaiting Review', value: stats.pending, color: 'amber', action: () => setFilterStatus('pending') },
       { key: 'underReview', label: 'In Arbitration', value: stats.underReview, color: 'blue', action: () => setFilterStatus('under_review') },
       { key: 'highPriority', label: 'Critical Priority', value: stats.highPriority, color: 'red', action: () => setFilterPriority('high') }
     ].map(stat => {
       const isActive = (stat.key === 'highPriority' && filterPriority === 'high') ||
                       (stat.key === 'underReview' && filterStatus === 'under_review') ||
                       (stat.key === 'pending' && filterStatus === 'pending') ||
                       (stat.key === 'total' && filterStatus === 'all');
       
       const c = stat.color === 'red' ? 'red' : stat.color === 'amber' ? 'amber' : 'blue';

       return (
         <div
           key={stat.key}
           onClick={stat.action}
           className={`group p-4 sm:p-6 surface-card rounded-2xl cursor-pointer transition-all hover:shadow-xl border-2 relative overflow-hidden ${
             isActive 
             ? `border-${c}-500/50 shadow-lg shadow-${c}-500/10` 
             : 'border-theme'
           }`}
         >
           <div className={`text-2xl sm:text-3xl font-bold text-${c}-600 dark:text-${c}-400 mb-1 sm:mb-2`}>
             {stat.value}
           </div>
           <div className="text-[9px] sm:text-[10px] text-theme-muted font-bold uppercase tracking-widest leading-tight">{stat.label}</div>
         </div>
       );
     })}
   </div>

 {/* Filters */}
 <div className="flex flex-col sm:flex-row gap-4 mb-6">
 <select
 value={filterType}
 onChange={(e) => setFilterType(e.target.value as DisputeType | 'all')}
 className="px-4 py-2 surface-card border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-light dark:ring-accent-dark shadow-sm"
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
 className="px-4 py-2 surface-card border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-light dark:ring-accent-dark shadow-sm"
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
 className="px-4 py-2 surface-card border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-light dark:ring-accent-dark shadow-sm"
 >
 <option value="all">All Priority</option>
 <option value="high">High</option>
 <option value="medium">Medium</option>
 <option value="low">Low</option>
 </select>
 </div>

 {/* Search */}
 <div className="relative mb-6">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Search by dispute ID, tour, or parties..."
 className="w-full pl-11 pr-11 py-3 surface-card border border-theme rounded-xl text-sm text-theme-primary placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-light dark:ring-accent-dark shadow-sm"
 />
 {searchTerm && (
 <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary">
 <X className="w-4 h-4" />
 </button>
 )}
 </div>

 {/* Results Count */}
 <div className="mb-4 text-sm text-theme-secondary ">
 Showing {paginatedDisputes.length} of {filteredDisputes.length} disputes
 </div>

 {/* Desktop Table */}
 <div className="hidden lg:block surface-card border border-theme rounded-xl overflow-hidden shadow-sm">
 <table className="w-full">
 <thead className="surface-section border-b border-theme">
 <tr>
 <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">Dispute ID</th>
 <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">Tour</th>
 <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">Parties</th>
 <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">Type</th>
 <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">Status</th>
 <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">Priority</th>
 <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">Deadline</th>
 <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
 {paginatedDisputes.map((dispute) => (
 <tr key={dispute.id} className="hover:surface-section dark:hover:surface-card transition-colors">
 <td className="px-6 py-4 text-sm font-medium text-theme-primary">
 {dispute.disputeId}
 </td>
 <td className="px-6 py-4">
 <div className="text-sm text-theme-primary">{dispute.tourTitle}</div>
 <div className="text-xs text-theme-muted ">${dispute.amount}</div>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-full surface-section overflow-hidden">
 {dispute.traveler.avatar ? (
 <Image src={dispute.traveler.avatar} alt={dispute.traveler.name} width={24} height={24} className="object-cover" />
 ) : (
 <User className="w-3 h-3 m-1.5 text-theme-muted" />
 )}
 </div>
 <span className="text-xs text-theme-secondary ">vs</span>
 <div className="w-6 h-6 rounded-full surface-section overflow-hidden">
 {dispute.guide.avatar ? (
 <Image src={dispute.guide.avatar} alt={dispute.guide.name} width={24} height={24} className="object-cover" />
 ) : (
 <User className="w-3 h-3 m-1.5 text-theme-muted" />
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
 <Scale className="w-8 h-8 text-accent-light dark:text-accent-dark dark:text-amber-400" />
 </div>
 <h3 className="text-lg font-semibold text-theme-primary mb-2">No disputes found</h3>
 <p className="text-sm text-theme-muted mb-4">Try adjusting your filters.</p>
 <button onClick={resetFilters} className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
 Clear Filters
 </button>
 </div>
 )}

 {/* Pagination */}
 {filteredDisputes.length > 0 && (
 <div className="flex items-center justify-between mt-6">
 <p className="text-sm text-theme-muted ">Page {currentPage} of {totalPages}</p>
 <div className="flex gap-2">
 <button
 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 disabled={currentPage === 1}
 className="p-2 surface-card border border-theme rounded-xl text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
 >
 <ChevronLeft className="w-5 h-5" />
 </button>
 <button
 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
 disabled={currentPage === totalPages}
 className="p-2 surface-card border border-theme rounded-xl text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
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
