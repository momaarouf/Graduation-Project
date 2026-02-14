// ============================================================================
// ADMIN GUIDE VERIFICATION QUEUE - CARD 24 (ENHANCED DESIGN)
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/admin/verifications/page.tsx
// 
// PURPOSE: Manual ID verification interface for guides
// 
// DESIGN ENHANCEMENTS:
// ✓ Glass-morphism effect on modals
// ✓ Gradient buttons with hover animations
// ✓ Subtle shadows for depth
// ✓ Improved card hover states
// ✓ Better visual hierarchy
// ✓ Consistent with your premium design language
// ============================================================================

'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import {
  Shield,
  Camera,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Award,
  Flag,
  FileText,
  ZoomIn,
  ZoomOut,
  X,
  Info,
  Star,
  Sparkles
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired'
type PriorityLevel = 'high' | 'medium' | 'low'
type DocumentType = 'id' | 'selfie' | 'certificate'

interface VerificationDocument {
  id: string
  type: DocumentType
  url: string
  filename: string
  uploadedAt: string
  notes?: string
}

interface VerificationRequest {
  id: string
  guideId: string
  guideName: string
  guideEmail: string
  guidePhone: string
  guideAvatar?: string
  submittedAt: string
  priority: PriorityLevel
  status: VerificationStatus
  documents: VerificationDocument[]
  adminNotes?: string
  history: {
    id: string
    action: string
    adminName?: string
    reason?: string
    timestamp: string
  }[]
}

interface VerificationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  expired: number
  highPriority: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_VERIFICATION_STATS: VerificationStats = {
  total: 156,
  pending: 45,
  approved: 98,
  rejected: 8,
  expired: 5,
  highPriority: 12
}

const MOCK_VERIFICATION_REQUESTS: VerificationRequest[] = [
  {
    id: 'v1',
    guideId: 'g123',
    guideName: 'Mehmet Yilmaz',
    guideEmail: 'mehmet.yilmaz@example.com',
    guidePhone: '+90 555 123 4567',
    guideAvatar: '/images/guides/mehmet.jpg',
    submittedAt: '2026-03-14T10:15:00Z',
    priority: 'high',
    status: 'pending',
    documents: [
      { id: 'doc1', type: 'id', url: '/docs/mehmet-id.jpg', filename: 'mehmet-id-front.jpg', uploadedAt: '2026-03-14T10:10:00Z' },
      { id: 'doc2', type: 'id', url: '/docs/mehmet-id-back.jpg', filename: 'mehmet-id-back.jpg', uploadedAt: '2026-03-14T10:10:00Z' },
      { id: 'doc3', type: 'selfie', url: '/docs/mehmet-selfie.jpg', filename: 'mehmet-selfie.jpg', uploadedAt: '2026-03-14T10:12:00Z' },
      { id: 'doc4', type: 'certificate', url: '/docs/mehmet-cert.jpg', filename: 'guide-certificate.pdf', uploadedAt: '2026-03-14T10:14:00Z' }
    ],
    adminNotes: '',
    history: [{ id: 'h1', action: 'submitted', timestamp: '2026-03-14T10:15:00Z' }]
  },
  {
    id: 'v2',
    guideId: 'g124',
    guideName: 'Layla Hassan',
    guideEmail: 'layla.hassan@example.com',
    guidePhone: '+961 70 123 456',
    guideAvatar: '/images/guides/layla.jpg',
    submittedAt: '2026-03-14T09:30:00Z',
    priority: 'medium',
    status: 'pending',
    documents: [
      { id: 'doc5', type: 'id', url: '/docs/layla-id.jpg', filename: 'layla-id.jpg', uploadedAt: '2026-03-14T09:25:00Z' },
      { id: 'doc6', type: 'selfie', url: '/docs/layla-selfie.jpg', filename: 'layla-selfie.jpg', uploadedAt: '2026-03-14T09:28:00Z' }
    ],
    adminNotes: '',
    history: [{ id: 'h2', action: 'submitted', timestamp: '2026-03-14T09:30:00Z' }]
  },
  {
    id: 'v3',
    guideId: 'g125',
    guideName: 'Ahmet Demir',
    guideEmail: 'ahmet.demir@example.com',
    guidePhone: '+90 555 987 6543',
    guideAvatar: '/images/guides/ahmet.jpg',
    submittedAt: '2026-03-13T16:45:00Z',
    priority: 'low',
    status: 'pending',
    documents: [
      { id: 'doc7', type: 'id', url: '/docs/ahmet-id.jpg', filename: 'ahmet-id.jpg', uploadedAt: '2026-03-13T16:40:00Z' },
      { id: 'doc8', type: 'selfie', url: '/docs/ahmet-selfie.jpg', filename: 'ahmet-selfie.jpg', uploadedAt: '2026-03-13T16:42:00Z' }
    ],
    adminNotes: '',
    history: [{ id: 'h3', action: 'submitted', timestamp: '2026-03-13T16:45:00Z' }]
  },
  {
    id: 'v4',
    guideId: 'g126',
    guideName: 'Fatima Yilmaz',
    guideEmail: 'fatima.y@example.com',
    guidePhone: '+90 555 456 7890',
    submittedAt: '2026-03-13T14:20:00Z',
    priority: 'high',
    status: 'approved',
    documents: [
      { id: 'doc9', type: 'id', url: '/docs/fatima-id.jpg', filename: 'fatima-id.jpg', uploadedAt: '2026-03-13T14:15:00Z' },
      { id: 'doc10', type: 'selfie', url: '/docs/fatima-selfie.jpg', filename: 'fatima-selfie.jpg', uploadedAt: '2026-03-13T14:18:00Z' }
    ],
    adminNotes: 'All documents look good. Verified identity.',
    history: [
      { id: 'h4', action: 'submitted', timestamp: '2026-03-13T14:20:00Z' },
      { id: 'h5', action: 'approved', adminName: 'Admin User', timestamp: '2026-03-13T15:35:00Z' }
    ]
  },
  {
    id: 'v5',
    guideId: 'g127',
    guideName: 'Omar Kaya',
    guideEmail: 'omar.kaya@example.com',
    guidePhone: '+90 555 789 0123',
    submittedAt: '2026-03-12T11:10:00Z',
    priority: 'medium',
    status: 'rejected',
    documents: [
      { id: 'doc11', type: 'id', url: '/docs/omar-id.jpg', filename: 'omar-id.jpg', uploadedAt: '2026-03-12T11:05:00Z', notes: 'ID document is blurry' },
      { id: 'doc12', type: 'selfie', url: '/docs/omar-selfie.jpg', filename: 'omar-selfie.jpg', uploadedAt: '2026-03-12T11:08:00Z', notes: 'Selfie does not match ID' }
    ],
    adminNotes: 'Documents are unclear. Asked to resubmit.',
    history: [
      { id: 'h6', action: 'submitted', timestamp: '2026-03-12T11:10:00Z' },
      { id: 'h7', action: 'rejected', adminName: 'Moderator', reason: 'ID document is blurry. Selfie does not match ID photo.', timestamp: '2026-03-12T14:25:00Z' }
    ]
  }
]

// ============================================================================
// STATUS BADGE (Enhanced with icons)
// ============================================================================

const StatusBadge = ({ status }: { status: VerificationStatus }) => {
  const styles = {
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
      icon: Clock,
      label: 'Pending'
    },
    approved: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      icon: CheckCircle,
      label: 'Approved'
    },
    rejected: {
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800/50',
      icon: XCircle,
      label: 'Rejected'
    },
    expired: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: AlertCircle,
      label: 'Expired'
    }
  }

  const s = styles[status]
  const Icon = s.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {s.label}
    </span>
  )
}

// ============================================================================
// PRIORITY BADGE (Enhanced with icons)
// ============================================================================

const PriorityBadge = ({ priority }: { priority: PriorityLevel }) => {
  const styles = {
    high: {
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800/50',
      icon: Flag,
      label: 'High Priority'
    },
    medium: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
      icon: AlertCircle,
      label: 'Medium Priority'
    },
    low: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/50',
      icon: Info,
      label: 'Low Priority'
    }
  }

  const s = styles[priority]
  const Icon = s.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {s.label}
    </span>
  )
}

// ============================================================================
// DOCUMENT VIEWER MODAL (Glass morphism)
// ============================================================================

const DocumentViewerModal = ({ isOpen, onClose, documents, guideName }: any) => {
  const [selectedDoc, setSelectedDoc] = useState(documents?.[0])
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    if (isOpen && documents?.length) setSelectedDoc(documents[0])
  }, [isOpen, documents])

  if (!isOpen || !selectedDoc) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    {/* max-w-6xl can make container wider  */}
      <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Documents: {guideName}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Document sidebar */}
          <div className="w-full lg:w-56 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Documents ({documents.length})
            </h4>
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selectedDoc.id === doc.id 
                      ? 'bg-white dark:bg-gray-900 shadow-md border-2 border-blue-500' 
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {doc.type === 'id' && <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    {doc.type === 'selfie' && <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                    {doc.type === 'certificate' && <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{doc.type}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doc.filename}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Document viewer */}
          <div className="flex-1 p-4 overflow-auto flex items-start justify-center bg-gray-100 dark:bg-gray-800">
            <div className="relative w-full h-full flex flex-col items-center" >
              <div className="sticky top-0 flex gap-1 z-10 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-1 mb-2">
                <button
                  onClick={() => setZoom(z => Math.max(50, z - 25))}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 py-1.5 text-xs font-medium min-w-[45px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(z => Math.min(200, z + 25))}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Image container - responsive with max width */}
    <div className="w-full flex justify-center overflow-auto">
      <div style={{ transform: `scale(${zoom / 100})` }} className="origin-top transition-transform">
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-2 inline-block max-w-full">
          <Image 
            src={selectedDoc.url} 
            alt={selectedDoc.filename} 
            width={600} 
            height={400} 
            className="max-w-full h-auto object-contain"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// VERIFICATION DETAILS MODAL (Enhanced design)
// ============================================================================

const VerificationDetailsModal = ({ isOpen, onClose, request, onApprove, onReject }: any) => {
  const [rejectReason, setRejectReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)

  if (!isOpen || !request) return null

  const handleApprove = () => {
    if (window.confirm(`Approve ${request.guideName}?`)) {
      onApprove(request.id, adminNotes)
      onClose()
    }
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    if (window.confirm(`Reject ${request.guideName}?`)) {
      onReject(request.id, rejectReason, adminNotes)
      onClose()
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">Verify Guide</h3>
                <StatusBadge status={request.status} />
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
            {/* Guide Profile */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                  {request.guideAvatar ? (
                    <Image src={request.guideAvatar} alt={request.guideName} width={64} height={64} className="object-cover" />
                  ) : (
                    <User className="w-8 h-8 m-4 text-gray-400" />
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{request.guideName}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <PriorityBadge priority={request.priority} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">ID: {request.guideId}</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Email
                </h5>
                <a href={`mailto:${request.guideEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                  {request.guideEmail}
                </a>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Phone
                </h5>
                <a href={`tel:${request.guidePhone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {request.guidePhone}
                </a>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Documents
              </h5>
              <div className="grid grid-cols-2 gap-3">
                {request.documents.map((doc: any) => (
                  <button
                    key={doc.id}
                    onClick={() => setShowDocumentViewer(true)}
                    className="group p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {doc.type === 'id' && <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />}
                      {doc.type === 'selfie' && <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />}
                      {doc.type === 'certificate' && <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />}
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{doc.type}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doc.filename}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* History Timeline */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                History
              </h5>
              <div className="space-y-3">
                {request.history.map((item: any, idx: number) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative">
                      <div className={`w-2 h-2 mt-2 rounded-full ${
                        item.action === 'approved' ? 'bg-emerald-500' :
                        item.action === 'rejected' ? 'bg-red-500' :
                        item.action === 'submitted' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      {idx < request.history.length - 1 && (
                        <div className="absolute top-4 left-1 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{item.action}</p>
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

            {/* Admin Notes */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Admin Notes
              </h5>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add your notes about this verification..."
                rows={3}
                className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            {request.status === 'pending' && (
              <div className="space-y-3">
                {showRejectForm ? (
                  <>
                    <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-800/50">
                      <h5 className="text-sm font-medium text-red-700 dark:text-red-400 mb-3">Rejection Reason</h5>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Explain why this verification is being rejected..."
                        rows={2}
                        className="w-full p-3 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleReject}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => setShowRejectForm(false)}
                          className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleApprove}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Guide
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      {showDocumentViewer && (
        <DocumentViewerModal
          isOpen={showDocumentViewer}
          onClose={() => setShowDocumentViewer(false)}
          documents={request.documents}
          guideName={request.guideName}
        />
      )}
    </>
  )
}

// ============================================================================
// MOBILE CARD (Enhanced)
// ============================================================================

const MobileCard = ({ request, onReview }: any) => (
  <div className="group p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
            {request.guideAvatar ? (
              <Image src={request.guideAvatar} alt={request.guideName} width={48} height={48} className="object-cover" />
            ) : (
              <User className="w-5 h-5 m-3.5 text-gray-400" />
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{request.guideName}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{request.guideEmail}</p>
        </div>
      </div>
      <StatusBadge status={request.status} />
    </div>

    <div className="flex items-center justify-between mb-4">
      <PriorityBadge priority={request.priority} />
      <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(request.submittedAt).toLocaleDateString()}</span>
    </div>

    <div className="flex gap-2 mb-4">
      {request.documents.slice(0, 3).map((doc: any) => (
        <span key={doc.id} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-lg">
          {doc.type}
        </span>
      ))}
      {request.documents.length > 3 && (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-lg">
          +{request.documents.length - 3}
        </span>
      )}
    </div>

    <button
      onClick={onReview}
      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
    >
      Review Documents
    </button>
  </div>
)

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminVerificationQueuePage() {
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'all'>('pending')
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const itemsPerPage = 5

  const filteredRequests = useMemo(() => {
    return MOCK_VERIFICATION_REQUESTS.filter(r => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false
      if (filterPriority !== 'all' && r.priority !== filterPriority) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return r.guideName.toLowerCase().includes(term) || r.guideEmail.toLowerCase().includes(term)
      }
      return true
    })
  }, [filterStatus, filterPriority, searchTerm])

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => setCurrentPage(1), [filterStatus, filterPriority, searchTerm])

  const handleApprove = (id: string, notes?: string) => {
    alert(`✅ Guide approved!`)
    console.log('Approve:', id, notes)
  }

  const handleReject = (id: string, reason: string, notes?: string) => {
    alert(`❌ Guide rejected!`)
    console.log('Reject:', id, reason, notes)
  }

  const resetFilters = () => {
    setFilterStatus('all')
    setFilterPriority('all')
    setSearchTerm('')
  }

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Guide Verification Queue
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review and verify guide identities manually
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            {[
              { key: 'all', label: 'Total', value: MOCK_VERIFICATION_STATS.total, color: 'blue', action: () => setFilterStatus('all') },
              { key: 'pending', label: 'Pending', value: MOCK_VERIFICATION_STATS.pending, color: 'amber', action: () => setFilterStatus('pending') },
              { key: 'approved', label: 'Approved', value: MOCK_VERIFICATION_STATS.approved, color: 'emerald', action: () => setFilterStatus('approved') },
              { key: 'rejected', label: 'Rejected', value: MOCK_VERIFICATION_STATS.rejected, color: 'red', action: () => setFilterStatus('rejected') },
              { key: 'high', label: 'High Priority', value: MOCK_VERIFICATION_STATS.highPriority, color: 'red', action: () => setFilterPriority('high') }
            ].map(stat => (
              <div
                key={stat.key}
                onClick={stat.action}
                className={`
                  group p-4 bg-white dark:bg-gray-900 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 border-2
                  ${(stat.key === 'high' && filterPriority === 'high') || (stat.key !== 'high' && filterStatus === stat.key)
                    ? `border-${stat.color}-500 ring-2 ring-${stat.color}-200 dark:ring-${stat.color}-800` 
                    : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                  }
                `}
              >
                <div className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
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
            Showing {paginatedRequests.length} of {filteredRequests.length} requests
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guide</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documents</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
                          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                            {r.guideAvatar ? (
                              <Image src={r.guideAvatar} alt={r.guideName} width={40} height={40} className="object-cover" />
                            ) : (
                              <User className="w-4 h-4 m-3 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{r.guideName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{r.guideEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {r.documents.map((d: any) => (
                          <span key={d.id} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-lg">
                            {d.type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                    <td className="px-6 py-4"><PriorityBadge priority={r.priority} /></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{new Date(r.submittedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedRequest(r); setShowDetailsModal(true); }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
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
            {paginatedRequests.map((r) => (
              <MobileCard key={r.id} request={r} onReview={() => { setSelectedRequest(r); setShowDetailsModal(true); }} />
            ))}
          </div>

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No verification requests found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or check back later.</p>
              <button onClick={resetFilters} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredRequests.length > 0 && (
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
      {selectedRequest && (
        <VerificationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => { setShowDetailsModal(false); setSelectedRequest(null); }}
          request={selectedRequest}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </PageLayout>
  )
}