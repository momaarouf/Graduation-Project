'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Search, CheckCircle, AlertCircle, Loader2, RefreshCw, Eye,
  MoreHorizontal, Pause, Ban, ShieldCheck, UserX, UserCheck, Clock, X
} from 'lucide-react'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import {
 adminGetUsers, adminSuspendUser, adminBanUser,
 adminActivateUser, adminDeactivateUser, adminReactivateUser,
 AdminUserResponse
} from '@/src/lib/api/admin'
import toast from 'react-hot-toast'

// ─── Modal Types ─────────────────────────────────────────────────────────────
type ModalType = 'suspend' | 'ban' | null

interface ModalState {
 type: ModalType
 user: AdminUserResponse | null
}

// ─── Status / Role Helpers ────────────────────────────────────────────────────
function StatusBadge({ u }: { u: AdminUserResponse }) {
 if (u.deletedAtUtc)
 return <span className="px-2 py-0.5 surface-section text-theme-secondary text-xs rounded-full font-medium">Deactivated</span>
 if (u.accountStatus === 'BANNED')
 return <span className="px-2 py-0.5 bg-danger-red/20 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full font-medium">Banned</span>
 if (u.accountStatus === 'SUSPENDED')
 return (
 <span className="px-2 py-0.5 bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-900/30 text-accent-light dark:text-accent-dark dark:text-amber-300 text-xs rounded-full font-medium">
 Suspended{u.suspendedUntilUtc ? ` until ${new Date(u.suspendedUntilUtc).toLocaleDateString()}` : ' (indefinite)'}
 </span>
 )
 return <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">Active</span>
}

function RoleBadge({ role }: { role: string }) {
 const normalized = role.toUpperCase()
  const cls =
    normalized === 'ADMIN' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    : normalized === 'GUIDE' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
  return <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${cls}`}>{normalized}</span>
}

// ─── Action Menu ──────────────────────────────────────────────────────────────
function ActionMenu({
 u, onSuspend, onBan, onActivate, onDeactivate, onReactivate, loading
}: {
 u: AdminUserResponse
 onSuspend: () => void
 onBan: () => void
 onActivate: () => void
 onDeactivate: () => void
 onReactivate: () => void
 loading: boolean
}) {
 const [open, setOpen] = useState(false)
 const ref = useRef<HTMLDivElement>(null)
 const isAdmin = u.role.toUpperCase() === 'ADMIN'

 useEffect(() => {
 const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
 document.addEventListener('mousedown', handler)
 return () => document.removeEventListener('mousedown', handler)
 }, [])

 if (isAdmin) return <span className="text-xs text-theme-muted">—</span>

 const act = (fn: () => void) => { fn(); setOpen(false) }
 const isDeactivated = !!u.deletedAtUtc
 const isSuspended = u.accountStatus === 'SUSPENDED'
 const isBanned = u.accountStatus === 'BANNED'
 const isActive = u.accountStatus === 'ACTIVE' && !isDeactivated

 return (
 <div ref={ref} className="relative inline-block">
 <button
 onClick={() => setOpen(v => !v)}
 className="p-1.5 hover:surface-section dark:hover:surface-card rounded-lg transition"
 disabled={loading}
 >
 <MoreHorizontal className="w-4 h-4" />
 </button>

 {open && (
 <div className="absolute right-0 mt-1 w-52 surface-card border border-theme rounded-xl shadow-xl z-20 py-1 overflow-hidden">
 {/* Suspend / Activate */}
 {isActive && (
 <button onClick={() => act(onSuspend)}
 className="w-full text-left px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2.5 transition">
 <Pause className="w-4 h-4" /> Suspend
 </button>
 )}
 {isSuspended && (
 <button onClick={() => act(onActivate)}
 className="w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2.5 transition">
 <ShieldCheck className="w-4 h-4" /> Activate (lift suspension)
 </button>
 )}

 {/* Deactivate / Reactivate */}
 {!isDeactivated && !isBanned && (
 <button onClick={() => act(onDeactivate)}
 className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition">
 <UserX className="w-4 h-4" /> Deactivate (soft delete)
 </button>
 )}
  {isDeactivated && (
    <button onClick={() => act(onReactivate)}
    className="w-full text-left px-4 py-2 text-sm text-primary-light dark:text-blue-400 hover:bg-primary-light/10 dark:hover:surface-base flex items-center gap-2.5 transition">
    <UserCheck className="w-4 h-4" /> Reactivate account
    </button>
  )}

 {/* Ban — always available if not already banned */}
 {!isBanned && (
 <button onClick={() => act(onBan)}
 className="w-full text-left px-4 py-2 text-sm text-danger-red dark:text-red-400 hover:bg-danger-red/10 dark:hover:bg-red-900/20 flex items-center gap-2.5 transition border-t border-theme mt-1 pt-2">
 <Ban className="w-4 h-4" /> Permanent Ban
 </button>
 )}
 </div>
 )}
 </div>
 )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
 const router = useRouter()
 const { user, isLoading: authLoading } = useAuth()

 const [users, setUsers] = useState<AdminUserResponse[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [actionLoading, setActionLoading] = useState(false)
 const [searchEmail, setSearchEmail] = useState('')

 // Modals
 const [modal, setModal] = useState<ModalState>({ type: null, user: null })
 const [suspendReason, setSuspendReason] = useState('')
 const [suspendUntil, setSuspendUntil] = useState('') // datetime-local string
 const [banReason, setBanReason] = useState('')

 useEffect(() => {
 if (!authLoading && (!user || user.role !== 'ADMIN')) router.push('/dashboard')
 }, [user, authLoading, router])

 useEffect(() => { loadUsers() }, [])

 const loadUsers = async () => {
 setIsLoading(true)
 try {
 const res = await adminGetUsers(searchEmail.trim() || undefined)
 setUsers(res.users || [])
 } catch {
 toast.error('Failed to load users')
 } finally {
 setIsLoading(false)
 }
 }

 const closeModal = () => {
 setModal({ type: null, user: null })
 setSuspendReason(''); setSuspendUntil(''); setBanReason('')
 }

 // ── Actions ────────────────────────────────────────────────────────────────
 const handleSuspend = async () => {
 if (!modal.user || !suspendReason.trim()) { toast.error('Reason is required'); return }
 setActionLoading(true)
 try {
 const untilUtc = suspendUntil ? new Date(suspendUntil).toISOString() : null
 await adminSuspendUser(modal.user.id, { reason: suspendReason.trim(), untilUtc })
 toast.success(untilUtc ? `Suspended until ${new Date(untilUtc).toLocaleDateString()}` : 'Suspended indefinitely')
 closeModal(); loadUsers()
 } catch (e: any) {
 toast.error(e.response?.data?.message || 'Failed to suspend user')
 } finally { setActionLoading(false) }
 }

 const handleBan = async () => {
 if (!modal.user || !banReason.trim()) { toast.error('Reason is required'); return }
 setActionLoading(true)
 try {
 await adminBanUser(modal.user.id, { reason: banReason.trim() })
 toast.success('User permanently banned')
 closeModal(); loadUsers()
 } catch (e: any) {
 toast.error(e.response?.data?.message || 'Failed to ban user')
 } finally { setActionLoading(false) }
 }

 const handleActivate = async (u: AdminUserResponse) => {
 setActionLoading(true)
 try {
 await adminActivateUser(u.id)
 toast.success(`${u.fullName} activated`)
 loadUsers()
 } catch (e: any) {
 toast.error(e.response?.data?.message || 'Failed to activate')
 } finally { setActionLoading(false) }
 }

 const handleDeactivate = async (u: AdminUserResponse) => {
 setActionLoading(true)
 try {
 await adminDeactivateUser(u.id)
 toast.success(`${u.fullName} deactivated`)
 loadUsers()
 } catch (e: any) {
 toast.error(e.response?.data?.message || 'Failed to deactivate')
 } finally { setActionLoading(false) }
 }

 const handleReactivate = async (u: AdminUserResponse) => {
 setActionLoading(true)
 try {
 await adminReactivateUser(u.id)
 toast.success(`${u.fullName} reactivated`)
 loadUsers()
 } catch (e: any) {
 toast.error(e.response?.data?.message || 'Failed to reactivate')
 } finally { setActionLoading(false) }
 }

 if (authLoading || isLoading) {
 return (
  <div className="w-20 h-20 surface-card rounded-full flex items-center justify-center shadow-lg border border-theme mb-4">
  <Eye className="w-10 h-10 text-primary-light" />
  </div>
 )
 }

 return (
 <div className="min-h-[calc(100vh-4rem)] surface-section">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-theme-primary">Users</h1>
 <p className="text-sm text-theme-muted ">{users.length} total users</p>
 </div>
 <button onClick={loadUsers} disabled={isLoading}
 className="p-2 hover:surface-section dark:hover:surface-card rounded-lg transition">
 <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
 </button>
 </div>

 {/* Search */}
 <div className="flex gap-2">
 <div className="flex-1 relative">
 <Search className="absolute left-3 top-2.5 w-4 h-4 text-theme-muted" />
 <input type="text" placeholder="Search by email..."
 value={searchEmail}
 onChange={e => setSearchEmail(e.target.value)}
 onKeyDown={e => e.key === 'Enter' && loadUsers()}
 className="w-full pl-9 pr-4 py-2 border border-theme-strong rounded-lg surface-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 />
 </div>
 <button onClick={loadUsers}
 className="px-4 py-2 bg-primary-light hover:bg-primary-light-hover text-white rounded-lg text-sm font-medium transition">
 Search
 </button>
 </div>

 {/* Table */}
 <div className="surface-card rounded-xl border border-theme overflow-hidden">
 {users.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16 text-theme-muted">
 <Users className="w-10 h-10 mb-3" />
 <p className="text-sm">No users found</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="surface-section border-b border-theme">
 <tr>
 {['User', 'Role', 'Status', 'Email', 'Profile', 'Joined', 'Actions'].map(h => (
 <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-theme-muted uppercase tracking-wide">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
 {users.map(u => (
 <tr key={u.id} className="hover:surface-section dark:hover:surface-card transition">
 <td className="px-4 py-3">
 <div>
 <p className="text-sm font-medium text-theme-primary">{u.fullName || '—'}</p>
 <p className="text-xs text-theme-muted ">{u.email}</p>
 {u.statusReason && (
 <p className="text-xs text-accent-light dark:text-accent-dark dark:text-amber-400 mt-0.5 italic truncate max-w-xs" title={u.statusReason}>
 ↳ {u.statusReason}
 </p>
 )}
 </div>
 </td>
 <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
 <td className="px-4 py-3"><StatusBadge u={u} /></td>
 <td className="px-4 py-3">
 {u.isEmailVerified
 ? <CheckCircle className="w-4 h-4 text-green-500" />
 : <AlertCircle className="w-4 h-4 text-accent-light dark:text-accent-dark" />}
 </td>
 <td className="px-4 py-3">
 {u.profileCompleted
 ? <span className="text-xs text-green-600 dark:text-green-400 font-medium">Complete</span>
 : <span className="text-xs text-theme-muted">Incomplete</span>}
 </td>
 <td className="px-4 py-3 text-xs text-theme-muted whitespace-nowrap">
 {new Date(u.createdAtUtc).toLocaleDateString()}
 </td>
 <td className="px-4 py-3">
 <ActionMenu
 u={u}
 loading={actionLoading}
 onSuspend={() => setModal({ type: 'suspend', user: u })}
 onBan={() => setModal({ type: 'ban', user: u })}
 onActivate={() => handleActivate(u)}
 onDeactivate={() => handleDeactivate(u)}
 onReactivate={() => handleReactivate(u)}
 />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>

 {/* ── Suspend Modal ─────────────────────────────────────────────────── */}
 {modal.type === 'suspend' && modal.user && (
 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
 <div className="surface-card rounded-2xl p-6 w-full max-w-md shadow-2xl">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2">
 <Pause className="w-5 h-5 text-accent-light dark:text-accent-dark" />
 <h3 className="text-lg font-bold text-theme-primary">Suspend User</h3>
 </div>
 <button onClick={closeModal} className="p-1 hover:surface-section dark:hover:surface-card rounded-lg"><X className="w-4 h-4" /></button>
 </div>

 <p className="text-sm text-theme-secondary mb-5">
 Suspending <strong className="text-theme-primary">{modal.user.fullName}</strong> ({modal.user.email})
 </p>

 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1.5">
 Reason <span className="text-danger-red">*</span>
 </label>
 <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
 placeholder="Why is this user being suspended?"
 rows={3}
 className="w-full px-3 py-2 border border-theme-strong rounded-lg surface-card text-sm focus:outline-none focus:ring-2 focus:ring-accent-light dark:ring-accent-dark resize-none"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1.5 flex items-center gap-1.5">
 <Clock className="w-3.5 h-3.5" />
 Suspend until (optional — leave blank for indefinite)
 </label>
 <input type="datetime-local"
 value={suspendUntil}
 min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
 onChange={e => setSuspendUntil(e.target.value)}
 className="w-full px-3 py-2 border border-theme-strong rounded-lg surface-card text-sm focus:outline-none focus:ring-2 focus:ring-accent-light dark:ring-accent-dark"
 />
 {suspendUntil && (
 <p className="text-xs text-accent-light dark:text-accent-dark dark:text-amber-400 mt-1">
 Will auto-expire: {new Date(suspendUntil).toLocaleString()}
 </p>
 )}
 {!suspendUntil && (
 <p className="text-xs text-theme-muted mt-1">Indefinite — must be manually lifted using Activate.</p>
 )}
 </div>
 </div>

 <div className="flex gap-2 justify-end mt-6">
 <button onClick={closeModal}
 className="px-4 py-2 text-sm text-theme-secondary hover:surface-section dark:hover:surface-card rounded-lg transition">
 Cancel
 </button>
 <button onClick={handleSuspend}
 disabled={actionLoading || !suspendReason.trim()}
 className="px-5 py-2 text-sm font-medium bg-accent-light/10 dark:bg-accent-dark hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition">
 {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
 Confirm Suspend
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ── Ban Modal ─────────────────────────────────────────────────────── */}
 {modal.type === 'ban' && modal.user && (
 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
 <div className="surface-card rounded-2xl p-6 w-full max-w-md shadow-2xl">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2">
 <Ban className="w-5 h-5 text-danger-red" />
 <h3 className="text-lg font-bold text-theme-primary">Permanent Ban</h3>
 </div>
 <button onClick={closeModal} className="p-1 hover:surface-section dark:hover:surface-card rounded-lg"><X className="w-4 h-4" /></button>
 </div>

 <div className="p-3 bg-danger-red/10 dark:bg-red-900/20 border border-danger-red dark:border-danger-red rounded-lg mb-5">
 <p className="text-sm text-red-700 dark:text-red-300 font-medium">⚠ This action is permanent and cannot be undone from the UI.</p>
 </div>

 <p className="text-sm text-theme-secondary mb-4">
 Banning <strong className="text-theme-primary">{modal.user.fullName}</strong> ({modal.user.email})
 </p>

 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1.5">
 Reason <span className="text-danger-red">*</span>
 </label>
 <textarea value={banReason} onChange={e => setBanReason(e.target.value)}
 placeholder="Why is this user being permanently banned?"
 rows={3}
 className="w-full px-3 py-2 border border-danger-red dark:border-danger-red rounded-lg surface-card text-sm focus:outline-none focus:ring-2 focus:ring-danger-red resize-none"
 />
 </div>

 <div className="flex gap-2 justify-end mt-6">
 <button onClick={closeModal}
 className="px-4 py-2 text-sm text-theme-secondary hover:surface-section dark:hover:surface-card rounded-lg transition">
 Cancel
 </button>
 <button onClick={handleBan}
 disabled={actionLoading || !banReason.trim()}
 className="px-5 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition">
 {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
 Permanently Ban
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 )
}