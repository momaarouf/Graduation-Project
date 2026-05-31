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

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { adminGetUsers, AdminUserResponse, adminBanUser, adminSuspendUser, adminActivateUser } from '@/src/lib/api/admin'
import { toast } from 'react-hot-toast'
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
  History,
  UserX
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
// BAN REASON BADGE
// ============================================================================

const BanReasonBadge = ({ reason }: { reason: BanReason }) => {
 const styles = {
 fraud: 'bg-danger-red/10 dark:bg-danger-red/10 text-red-700 dark:text-red-400 border-danger-red dark:border-danger-red/50',
 harassment: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50',
 no_show: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark dark:text-amber-400 border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/50',
 false_advertising: 'bg-primary-light/10 dark:bg-primary-light/10 text-blue-700 dark:text-primary-dark border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark/50',
 safety_violation: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
 payment_dispute: 'bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800/50',
 other: 'surface-section text-theme-secondary border-theme'
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
 bg: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-accent-light/10 dark:bg-accent-dark/10',
 text: 'text-accent-light dark:text-accent-dark dark:text-amber-400',
 border: 'border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/50',
 icon: Clock,
 label: 'Temporary'
 },
 under_review: {
 bg: 'bg-primary-light/10 dark:bg-primary-light/10',
 text: 'text-blue-700 dark:text-primary-dark ',
 border: 'border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark/50',
 icon: Eye,
 label: 'Under Review'
 }
 }

 const s = styles[duration]
 const Icon = s.icon

 if (status === 'expired') {
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border surface-section text-theme-secondary border-theme">
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
 active: 'bg-danger-red/10 dark:bg-danger-red/10 text-red-700 dark:text-red-400 border-danger-red dark:border-danger-red/50',
 expired: 'surface-section text-theme-secondary border-theme',
 appealed: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark dark:text-amber-400 border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/50',
 overturned: 'bg-success-green/10 dark:bg-success-green/10 text-emerald-700 dark:text-emerald-400 border-success-green dark:border-success-green/50',
 under_review: 'bg-primary-light/10 dark:bg-primary-light/10 text-blue-700 dark:text-primary-dark border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark/50' 
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
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ">
 <div className="w-full max-w-lg surface-card rounded-2xl shadow-2xl border border-theme">
 {/* Header */}
 <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-6 py-4 rounded-t-2xl">
 <div className="flex justify-between items-center">
 <h3 className="text-lg font-bold text-white flex items-center gap-2">
 <Ban className="w-5 h-5" />
 Add to Blacklist
 </h3>
 <button onClick={onClose} className="p-2 hover:surface-card rounded-lg transition-colors">
 <X className="w-5 h-5 text-white" />
 </button>
 </div>
 </div>

 {/* Form */}
 <div className="p-6 space-y-4">
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Guide ID <span className="text-danger-red">*</span>
 </label>
 <input
 type="text"
 value={formData.guideId}
 onChange={(e) => setFormData({ ...formData, guideId: e.target.value })}
 placeholder="e.g., g123"
 className="w-full px-4 py-2 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-danger-red"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Reason
 </label>
 <select
 value={formData.reason}
 onChange={(e) => setFormData({ ...formData, reason: e.target.value as BanReason })}
 className="w-full px-4 py-2 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-danger-red"
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
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Duration
 </label>
 <select
 value={formData.duration}
 onChange={(e) => setFormData({ ...formData, duration: e.target.value as BanDuration })}
 className="w-full px-4 py-2 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-danger-red"
 >
 <option value="permanent">Permanent</option>
 <option value="temporary">Temporary (90 days)</option>
 <option value="under_review">Under Review</option>
 </select>
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Description <span className="text-danger-red">*</span>
 </label>
 <textarea
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 rows={3}
 placeholder="Describe the reason for banning..."
 className="w-full px-4 py-2 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-danger-red resize-none"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Evidence (optional)
 </label>
 <textarea
 value={formData.evidence}
 onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
 rows={2}
 placeholder="Reference numbers, complaint IDs, etc."
 className="w-full px-4 py-2 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-danger-red resize-none"
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
 className="flex-1 px-4 py-3 surface-section hover:surface-section dark:hover:surface-section text-theme-secondary font-medium rounded-xl transition-all"
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
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    description: entry?.description || '',
    banDuration: entry?.banDuration || 'permanent',
    expiresAt: entry?.expiresAt || ''
  })

  if (!isOpen || !entry) return null

  const handleSave = () => {
    onUpdate(entry.id, editData)
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl surface-card rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden border border-theme flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Ban className="w-5 h-5" />
              Blacklist Details
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Guide Profile */}
          <div className="flex items-center gap-4 p-4 surface-section rounded-xl border border-theme">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 p-0.5">
              <div className="w-full h-full rounded-full surface-card overflow-hidden flex items-center justify-center">
                {entry.guideAvatar ? (
                  <Image src={entry.guideAvatar} alt={entry.guideName} width={64} height={64} className="object-cover" />
                ) : (
                  <UserX className="w-8 h-8 text-danger-red" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-theme-primary">{entry.guideName}</h4>
              <p className="text-sm text-theme-muted ">ID: {entry.guideId}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={entry.status} />
              <BanDurationBadge duration={entry.banDuration} status={entry.status} />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 surface-section rounded-xl border border-theme">
              <h5 className="text-sm font-medium text-theme-secondary mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-danger-red" />
                Email
              </h5>
              <a href={`mailto:${entry.guideEmail}`} className="text-danger-red hover:underline break-all text-sm">
                {entry.guideEmail}
              </a>
            </div>
            <div className="p-4 surface-section rounded-xl border border-theme">
              <h5 className="text-sm font-medium text-theme-secondary mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-danger-red" />
                Phone
              </h5>
              <a href={`tel:${entry.guidePhone}`} className="text-danger-red hover:underline text-sm">
                {entry.guidePhone}
              </a>
            </div>
          </div>

          {/* Ban Details / Edit Form */}
          <div className="p-5 surface-section rounded-2xl border-2 border-danger-red/10 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-black text-theme-secondary capitalize tracking-normal flex items-center gap-2">
                <Shield className="w-4 h-4 text-danger-red" />
                Enforcement Record
              </h5>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-primary-light hover:underline font-bold capitalize tracking-normal"
                >
                  Edit Record
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1.5">
                    Ban Reason & Details
                  </label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full p-3 surface-card border border-theme rounded-xl text-sm focus:ring-2 focus:ring-danger-red outline-none min-h-[100px] resize-none"
                    placeholder="Provide detailed reason for enforcement..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1.5">
                      Duration Type
                    </label>
                    <select
                      value={editData.banDuration}
                      onChange={(e) => setEditData({ ...editData, banDuration: e.target.value as any })}
                      className="w-full p-2.5 surface-card border border-theme rounded-xl text-sm focus:ring-2 focus:ring-danger-red outline-none"
                    >
                      <option value="permanent">Permanent</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>
                  {editData.banDuration === 'temporary' && (
                    <div>
                      <label className="block text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1.5">
                        Expires At
                      </label>
                      <input
                        type="datetime-local"
                        value={editData.expiresAt ? new Date(editData.expiresAt).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditData({ ...editData, expiresAt: e.target.value })}
                        className="w-full p-2 surface-card border border-theme rounded-xl text-sm focus:ring-2 focus:ring-danger-red outline-none"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-danger-red text-white text-[11px] font-black capitalize tracking-normal rounded-xl shadow-lg shadow-danger-red/20 active:scale-95 transition-all"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 surface-card text-theme-secondary text-[11px] font-black capitalize tracking-normal rounded-xl border border-theme"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1">Status</p>
                    <p className="text-sm font-bold text-theme-primary">{entry.status.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1">Banned At</p>
                    <p className="text-sm font-bold text-theme-primary">{new Date(entry.bannedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1">Primary Reason</p>
                  <p className="text-sm text-theme-secondary leading-relaxed">{entry.description}</p>
                </div>
                {entry.expiresAt && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 capitalize tracking-normal mb-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Timed Enforcement
                    </p>
                    <p className="text-xs font-bold text-theme-primary">Expires: {new Date(entry.expiresAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History Timeline */}
          <div className="p-4 surface-section rounded-xl border border-theme">
            <h5 className="text-[10px] font-black text-theme-secondary capitalize tracking-normal mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-danger-red" />
              Audit History
            </h5>
            <div className="space-y-4">
              {entry.history.map((item: any, idx: number) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                      item.action === 'banned' ? 'bg-danger-red' : 'bg-primary-light'
                    }`} />
                    {idx < entry.history.length - 1 && (
                      <div className="w-px flex-1 bg-theme-border my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4 border-b border-[#c8d8f8] dark:border-[#1a3566] last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-bold text-theme-primary capitalize">{item.action}</p>
                      <span className="text-[10px] text-theme-muted">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-theme-muted">by {item.adminName || 'System'}</p>
                    {item.reason && <p className="text-xs text-theme-secondary mt-2 italic">"{item.reason}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 surface-section border-t border-[#c8d8f8] dark:border-[#1a3566] flex-shrink-0">
          {!isEditing && (
            <div className="flex gap-3">
              <button
                onClick={() => onRemove(entry.id)}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-[11px] font-black capitalize tracking-normal rounded-xl shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                Revoke Enforcement
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

  const [realUsers, setRealUsers] = useState<BlacklistedGuide[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBlacklistedUsers = async () => {
    setLoading(true)
    try {
      const res = await adminGetUsers()
      // Filter for BANNED or SUSPENDED users
      const bannedUsers = res.users.filter(u => u.accountStatus === 'BANNED' || u.accountStatus === 'SUSPENDED')
      
      const mapped: BlacklistedGuide[] = bannedUsers.map(u => ({
        id: u.id.toString(),
        guideId: `USR-${u.id}`,
        guideName: u.fullName,
        guideEmail: u.email,
        guidePhone: u.phoneE164 || 'Not provided',
        guideAvatar: undefined, 
        banReason: (u.statusReason?.toLowerCase().includes('fraud') ? 'fraud' : 
                   u.statusReason?.toLowerCase().includes('harass') ? 'harassment' :
                   u.statusReason?.toLowerCase().includes('show') ? 'no_show' : 'other') as BanReason,
        banDuration: u.accountStatus === 'BANNED' ? 'permanent' : 'temporary',
        status: u.accountStatus === 'BANNED' ? 'active' : 'under_review',
        bannedAt: u.createdAtUtc, 
        bannedBy: 'admin',
        bannedByAdmin: 'System Admin',
        expiresAt: u.suspendedUntilUtc || undefined,
        description: u.statusReason || 'No reason provided',
        history: [
          {
            id: 'h1',
            action: u.accountStatus === 'BANNED' ? 'banned' : 'appealed',
            adminName: 'System Admin',
            reason: u.statusReason || 'Account status updated',
            timestamp: u.createdAtUtc
          }
        ]
      }))
      setRealUsers(mapped)
    } catch (error) {
      console.error('Failed to fetch blacklisted users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlacklistedUsers()
  }, [])

  // Stats calculation from real data
  const stats = useMemo(() => {
    return {
      total: realUsers.length,
      active: realUsers.filter(u => u.status === 'active').length,
      permanent: realUsers.filter(u => u.banDuration === 'permanent').length,
      temporary: realUsers.filter(u => u.banDuration === 'temporary').length,
      appealed: realUsers.filter(u => u.status === 'appealed').length,
    }
  }, [realUsers])

  // Filter entries
  const filteredEntries = useMemo(() => {
    return realUsers.filter(entry => {
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
  }, [filterReason, filterDuration, filterStatus, searchTerm, realUsers])

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const resetFilters = () => {
    setFilterReason('all')
    setFilterDuration('all')
    setFilterStatus('active')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleAddToBlacklist = async (data: any) => {
    try {
      const userId = parseInt(data.guideId.replace('USR-', ''))
      if (isNaN(userId)) throw new Error('Invalid User ID format')

      if (data.duration === 'permanent') {
        await adminBanUser(userId, { reason: data.description })
      } else {
        // Default to 90 days if not specified
        const until = new Date()
        until.setDate(until.getDate() + 90)
        await adminSuspendUser(userId, { 
          reason: data.description,
          untilUtc: until.toISOString()
        })
      }
      
      toast.success(`✅ User ${userId} blacklisted successfully`)
      fetchBlacklistedUsers()
      setShowAddModal(false)
    } catch (error: any) {
      console.error('Failed to blacklist user:', error)
      toast.error(error.response?.data?.message || 'Failed to blacklist user')
    }
  }

  const handleRemoveFromBlacklist = async (id: string) => {
    try {
      const userId = parseInt(id)
      await adminActivateUser(userId)
      toast.success(`✅ User ${userId} removed from blacklist`)
      fetchBlacklistedUsers()
    } catch (error: any) {
      console.error('Failed to remove from blacklist:', error)
      toast.error(error.response?.data?.message || 'Failed to remove from blacklist')
    }
  }

  const handleUpdateEntry = async (id: string, data: any) => {
    // For now, update just calls ban/suspend again to overwrite reason/status
    try {
      const userId = parseInt(id)
      if (data.banDuration === 'permanent') {
        await adminBanUser(userId, { reason: data.description })
      } else {
        await adminSuspendUser(userId, { 
          reason: data.description,
          untilUtc: data.expiresAt 
        })
      }
      toast.success(`✅ Blacklist entry updated`)
      fetchBlacklistedUsers()
    } catch (error: any) {
      console.error('Failed to update entry:', error)
      toast.error(error.response?.data?.message || 'Failed to update entry')
    }
  }

  return (
    <>
      <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)]">
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-1">
                Blacklist Management
              </h1>
              <p className="text-sm text-theme-secondary ">
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
            {[
              { key: 'total', label: 'Total', value: stats.total, color: 'blue', action: () => setFilterStatus('all') },
              { key: 'active', label: 'Banned', value: stats.active, color: 'red', action: () => setFilterStatus('active') },
              { key: 'permanent', label: 'Permanent', value: stats.permanent, color: 'purple', action: () => setFilterDuration('permanent') },
              { key: 'temporary', label: 'Timed', value: stats.temporary, color: 'amber', action: () => setFilterDuration('temporary') },
              { key: 'appealed', label: 'Appeals', value: stats.appealed, color: 'indigo', action: () => setFilterStatus('appealed') }
            ].map(stat => {
              const isActive = (stat.key === 'permanent' && filterDuration === 'permanent') ||
                              (stat.key === 'temporary' && filterDuration === 'temporary') ||
                              (stat.key === 'active' && filterStatus === 'active') ||
                              (stat.key === 'appealed' && filterStatus === 'appealed') ||
                              (stat.key === 'total' && filterStatus === 'all');
              
              const colorClass = stat.color === 'blue' ? 'blue' : 
                                stat.color === 'red' ? 'red' : 
                                stat.color === 'purple' ? 'purple' : 
                                stat.color === 'amber' ? 'amber' : 'indigo';

              return (
                <div
                  key={stat.key}
                  onClick={stat.action}
                  className={`group p-4 surface-card rounded-2xl cursor-pointer transition-all hover:shadow-xl border-2 relative overflow-hidden ${
                    isActive 
                    ? `border-${colorClass}-500/50 shadow-lg shadow-${colorClass}-500/10` 
                    : 'border-theme'
                  }`}
                >
                  <div className={`text-2xl sm:text-3xl font-bold text-${colorClass}-600 dark:text-${colorClass}-400 mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-black text-theme-muted capitalize tracking-normal leading-tight">{stat.label}</div>
                  <div className={`absolute bottom-0 left-0 w-full h-1 bg-${colorClass}-500/20 opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value as BanReason | 'all')}
              className="px-4 py-2 surface-card border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-danger-red shadow-sm"
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
              className="px-4 py-2 surface-card border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-danger-red shadow-sm"
            >
              <option value="all">All Durations</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
              <option value="under_review">Under Review</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as BanStatus | 'all')}
              className="px-4 py-2 surface-card border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-danger-red shadow-sm"
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or guide ID..."
              className="w-full pl-11 pr-11 py-3 surface-card border border-theme rounded-xl text-sm text-theme-primary placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-danger-red shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-theme-secondary ">
            Showing {paginatedEntries.length} of {filteredEntries.length} blacklisted guides
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block surface-card border border-theme rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="surface-section border-b border-[#c8d8f8] dark:border-[#1a3566]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted capitalize tracking-normal">Guide</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted capitalize tracking-normal">Reason</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted capitalize tracking-normal">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted capitalize tracking-normal">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted capitalize tracking-normal">Banned At</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-theme-muted capitalize tracking-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {loading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-8 bg-theme-muted/10 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : (
                  paginatedEntries.map((entry) => (
                    <tr key={entry.id} className="hover:surface-section dark:hover:surface-card transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 p-0.5">
                            <div className="w-full h-full rounded-full surface-card overflow-hidden flex items-center justify-center">
                              {entry.guideAvatar ? (
                                <Image src={entry.guideAvatar} alt={entry.guideName} width={32} height={32} className="object-cover" />
                              ) : (
                                <UserX className="w-4 h-4 text-danger-red" />
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-theme-primary">{entry.guideName}</div>
                            <div className="text-xs text-theme-muted ">ID: {entry.guideId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><BanReasonBadge reason={entry.banReason} /></td>
                      <td className="px-6 py-4"><BanDurationBadge duration={entry.banDuration} status={entry.status} /></td>
                      <td className="px-6 py-4"><StatusBadge status={entry.status} /></td>
                      <td className="px-6 py-4 text-sm text-theme-secondary ">{new Date(entry.bannedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => { setSelectedEntry(entry); setShowDetailsModal(true); }}
                          className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="p-4 surface-card border border-theme rounded-2xl animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-theme-muted/20" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-theme-muted/20 rounded w-1/2" />
                      <div className="h-3 bg-theme-muted/10 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-10 bg-theme-muted/10 rounded-xl" />
                </div>
              ))
            ) : (
              paginatedEntries.map((entry) => (
                <div key={entry.id} className="p-5 surface-card border border-theme rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 p-0.5 flex-shrink-0">
                        <div className="w-full h-full rounded-full surface-card flex items-center justify-center overflow-hidden">
                          {entry.guideAvatar ? (
                            <Image src={entry.guideAvatar} alt={entry.guideName} width={48} height={48} className="object-cover" />
                          ) : (
                            <UserX className="w-6 h-6 text-danger-red" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-theme-primary truncate leading-tight">{entry.guideName}</h3>
                        <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mt-1">{entry.guideId}</p>
                      </div>
                    </div>
                    <StatusBadge status={entry.status} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <BanReasonBadge reason={entry.banReason} />
                    <BanDurationBadge duration={entry.banDuration} status={entry.status} />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => { setSelectedEntry(entry); setShowDetailsModal(true); }}
                      className="w-full py-3.5 bg-danger-red/10 text-danger-red hover:bg-danger-red hover:text-white text-[11px] font-black capitalize tracking-[0.2em] rounded-xl transition-all border border-danger-red/20 active:scale-95 shadow-sm"
                    >
                      Review Enforcement
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Empty State */}
          {(filteredEntries.length === 0 && !loading) && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-900/30 rounded-full flex items-center justify-center">
                <Ban className="w-8 h-8 text-danger-red dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-theme-primary mb-2">No blacklisted guides found</h3>
              <p className="text-sm text-theme-muted mb-4">Try adjusting your filters or add a new entry.</p>
              <button onClick={resetFilters} className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredEntries.length > 0 && (
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
