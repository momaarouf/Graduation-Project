'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Search, CheckCircle, AlertCircle, Loader2, RefreshCw, Eye,
  MoreHorizontal, Pause, Ban, ShieldCheck, UserX, UserCheck, Clock, X,
  ChevronRight, Filter, Shield, Activity, Info, Mail, Phone, Calendar,
  History, Unlock, User, Award
} from 'lucide-react'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import {
 adminGetUsers, adminSuspendUser, adminBanUser,
 adminActivateUser, adminDeactivateUser, adminReactivateUser,
 AdminUserResponse
} from '@/src/lib/api/admin'
import toast from 'react-hot-toast'
import AdminUsersSkeleton from './skeleton'

// ─── Modal Types ─────────────────────────────────────────────────────────────
type ModalType = 'suspend' | 'ban' | 'details' | 'email' | 'broadcast' | null

interface ModalState {
 type: ModalType
 user: AdminUserResponse | null
}

type AccountStatusFilter = 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DEACTIVATED'
type RoleFilter = 'ALL' | 'TRAVELER' | 'GUIDE' | 'ADMIN'

// ─── Status / Role Helpers ────────────────────────────────────────────────────
function StatusBadge({ u }: { u: AdminUserResponse }) {
 if (u.deletedAtUtc)
  return <span className="px-2 py-0.5 surface-section text-theme-secondary text-xs rounded-full font-medium border border-theme">Deactivated</span>
 if (u.accountStatus === 'BANNED')
  return <span className="px-2 py-0.5 bg-danger-red/20 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full font-medium border border-danger-red/20">Banned</span>
 if (u.accountStatus === 'SUSPENDED')
  return (
   <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full font-medium border border-amber-200">
    Suspended{u.suspendedUntilUtc ? ` until ${new Date(u.suspendedUntilUtc).toLocaleDateString()}` : ' (indefinite)'}
   </span>
  )
 return <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-medium border border-green-200">Active</span>
}

function RoleBadge({ role }: { role: string }) {
 const normalized = role.toUpperCase()
 const cls =
  normalized === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
  : normalized === 'GUIDE' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
 return <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${cls}`}>{normalized}</span>
}

// ─── Action Menu ──────────────────────────────────────────────────────────────
function ActionMenu({
 u, onSuspend, onBan, onActivate, onDeactivate, onReactivate, onEmail, loading
}: {
 u: AdminUserResponse
 onSuspend: () => void
 onBan: () => void
 onActivate: () => void
 onDeactivate: () => void
 onReactivate: () => void
 onEmail: () => void
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
    className="p-2 hover:surface-section dark:hover:surface-card rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center"
    disabled={loading}
   >
    <MoreHorizontal className="w-4 h-4" />
   </button>

   {open && (
    <div className="absolute right-0 mt-1 w-52 surface-card border border-theme rounded-xl shadow-xl z-20 py-1 overflow-hidden">
     {isActive && (
       <>
        <button onClick={() => act(onEmail)}
         className="w-full text-left px-4 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2.5 transition">
         <Mail className="w-4 h-4" /> Send Email
        </button>
        <button onClick={() => act(onSuspend)}
         className="w-full text-left px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2.5 transition">
         <Pause className="w-4 h-4" /> Suspend
        </button>
       </>
     )}
     {isSuspended && (
      <button onClick={() => act(onActivate)}
       className="w-full text-left px-4 py-2.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2.5 transition">
       <ShieldCheck className="w-4 h-4" /> Activate (lift suspension)
      </button>
     )}
     {!isDeactivated && !isBanned && (
      <button onClick={() => act(onDeactivate)}
       className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition">
       <UserX className="w-4 h-4" /> Deactivate (soft delete)
      </button>
     )}
     {isDeactivated && (
      <button onClick={() => act(onReactivate)}
       className="w-full text-left px-4 py-2.5 text-sm text-primary-light dark:text-blue-400 hover:bg-primary-light/10 dark:hover:surface-base flex items-center gap-2.5 transition">
       <UserCheck className="w-4 h-4" /> Reactivate account
      </button>
     )}
     {!isBanned && (
      <button onClick={() => act(onBan)}
       className="w-full text-left px-4 py-2.5 text-sm text-danger-red dark:text-red-400 hover:bg-danger-red/10 dark:hover:bg-red-900/20 flex items-center gap-2.5 transition border-t border-[#c8d8f8] dark:border-[#1a3566] mt-1 pt-2.5">
       <Ban className="w-4 h-4" /> Permanent Ban
      </button>
     )}
    </div>
   )}
  </div>
 )
}

// ─── Mobile User Card ─────────────────────────────────────────────────────────
function UserCard({
 u, loading, onSuspend, onBan, onActivate, onDeactivate, onReactivate, onDetails, onEmail
}: {
 u: AdminUserResponse
 loading: boolean
 onSuspend: () => void
 onBan: () => void
 onActivate: () => void
 onDeactivate: () => void
 onReactivate: () => void
 onDetails: () => void
 onEmail: () => void
}) {
 return (
  <div onClick={onDetails} className="surface-card rounded-2xl border border-theme p-4 space-y-4 shadow-sm cursor-pointer hover:border-primary-light transition-colors group">
   {/* Top row: avatar initial + name + action menu */}
   <div className="flex items-start justify-between gap-3">
    <div className="flex items-center gap-3 min-w-0">
     <div className="w-11 h-11 rounded-xl bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark flex items-center justify-center font-bold text-base flex-shrink-0 border border-primary-light/20">
      {(u.fullName || u.email || '?').charAt(0).toUpperCase()}
     </div>
     <div className="min-w-0">
      <p className="text-sm font-bold text-theme-primary truncate leading-tight">{u.fullName || '—'}</p>
      <p className="text-[11px] text-theme-muted truncate mt-0.5">{u.email}</p>
     </div>
    </div>
    <div onClick={e => e.stopPropagation()}>
      <ActionMenu
       u={u} loading={loading}
       onSuspend={onSuspend} onBan={onBan} onActivate={onActivate}
       onDeactivate={onDeactivate} onReactivate={onReactivate}
       onEmail={onEmail}
      />
    </div>
   </div>

   {/* Badges row */}
   <div className="flex flex-wrap items-center gap-2">
    <RoleBadge role={u.role} />
    <StatusBadge u={u} />
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-section border border-theme">
      {u.isEmailVerified
       ? <CheckCircle className="w-3 h-3 text-green-500" />
       : <AlertCircle className="w-3 h-3 text-amber-500" />
      }
      <span className="text-[10px] font-bold capitalize tracking-normal text-theme-secondary">
        {u.isEmailVerified ? 'Verified' : 'Unverified'}
      </span>
    </div>
   </div>

   {/* Profile Status */}
   <div className="flex items-center justify-between text-[11px] border-t border-[#c8d8f8] dark:border-[#1a3566] pt-3 mt-1">
    <span className="text-theme-muted flex items-center gap-1.5">
      <Clock className="w-3 h-3" />
      Joined {new Date(u.createdAtUtc).toLocaleDateString()}
    </span>
    {u.profileCompleted
     ? <span className="text-green-600 dark:text-green-400 font-bold capitalize tracking-tight">Profile Complete</span>
     : <span className="text-theme-muted capitalize tracking-tight">Profile Incomplete</span>
    }
   </div>

   {/* Status reason if exists */}
   {u.statusReason && (
    <div className="p-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
      <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed italic">
       ↳ {u.statusReason}
      </p>
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
 
 // Filters
 const [filterStatus, setFilterStatus] = useState<AccountStatusFilter>('ALL')
 const [filterRole, setFilterRole] = useState<RoleFilter>('ALL')

 // Modals
 const [modal, setModal] = useState<ModalState>({ type: null, user: null })
 const [suspendReason, setSuspendReason] = useState('')
 const [suspendUntil, setSuspendUntil] = useState('')
 const [banReason, setBanReason] = useState('')
 const [emailSubject, setEmailSubject] = useState('')
 const [emailBody, setEmailBody] = useState('')

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

 // Stats Calculation
 const stats = useMemo(() => {
  return {
   total: users.length,
   active: users.filter(u => u.accountStatus === 'ACTIVE' && !u.deletedAtUtc).length,
   banned: users.filter(u => u.accountStatus === 'BANNED').length,
   suspended: users.filter(u => u.accountStatus === 'SUSPENDED').length,
   deactivated: users.filter(u => !!u.deletedAtUtc).length,
   guides: users.filter(u => u.role.toUpperCase() === 'GUIDE').length,
  }
 }, [users])

 // Apply Filters
 const filteredUsers = useMemo(() => {
  return users.filter(u => {
   // Status Filter
   if (filterStatus === 'ACTIVE' && (u.accountStatus !== 'ACTIVE' || !!u.deletedAtUtc)) return false
   if (filterStatus === 'BANNED' && u.accountStatus !== 'BANNED') return false
   if (filterStatus === 'SUSPENDED' && u.accountStatus !== 'SUSPENDED') return false
   if (filterStatus === 'DEACTIVATED' && !u.deletedAtUtc) return false

   // Role Filter
   if (filterRole !== 'ALL' && u.role.toUpperCase() !== filterRole) return false

   return true
  })
 }, [users, filterStatus, filterRole])

 const closeModal = () => {
  setModal({ type: null, user: null })
  setSuspendReason(''); setSuspendUntil(''); setBanReason('')
  setEmailSubject(''); setEmailBody('')
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

 const handleSendEmail = async () => {
  if (!emailSubject.trim() || !emailBody.trim()) { toast.error('Subject and Body are required'); return }
  setActionLoading(true)
  try {
   const { sendAdminEmailBroadcast, sendAdminEmailToUser } = await import('@/src/lib/api/admin')
   if (modal.type === 'broadcast') {
    await sendAdminEmailBroadcast(emailSubject.trim(), emailBody.trim())
    toast.success('Broadcast email sent successfully')
   } else if (modal.type === 'email' && modal.user) {
    await sendAdminEmailToUser(modal.user.id, emailSubject.trim(), emailBody.trim())
    toast.success(`Email sent to ${modal.user.email}`)
   }
   closeModal()
  } catch (e: any) {
   toast.error(e.response?.data?.message || 'Failed to send email')
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
    return <AdminUsersSkeleton />
  }

 return (
  <div className="space-y-6 pb-20">
   {/* ── Stats Grid ────────────────────────────────────────────────── */}
   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
     {[
       { label: 'Active', value: stats.active, color: 'emerald', icon: UserCheck, filter: () => setFilterStatus('ACTIVE') },
       { label: 'Banned', value: stats.banned, color: 'red', icon: Ban, filter: () => setFilterStatus('BANNED') },
       { label: 'Suspended', value: stats.suspended, color: 'amber', icon: Clock, filter: () => setFilterStatus('SUSPENDED') },
       { label: 'Guides', value: stats.guides, color: 'blue', icon: Award, filter: () => setFilterRole('GUIDE') }
     ].map(s => (
       <button
         key={s.label}
         onClick={s.filter}
         className="p-4 surface-card border border-theme rounded-2xl text-left hover:shadow-lg transition-all group active:scale-95"
       >
         <div className="flex items-center justify-between mb-2">
           <div className={`p-2 rounded-xl bg-${s.color}-500/10 text-${s.color}-600 dark:text-${s.color}-400 group-hover:scale-110 transition-transform`}>
             <s.icon className="w-4 h-4" />
           </div>
           <ChevronRight className="w-4 h-4 text-theme-muted opacity-0 group-hover:opacity-100 transition-opacity" />
         </div>
         <p className="text-2xl font-black text-theme-primary leading-none">{s.value}</p>
         <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mt-1">{s.label}</p>
       </button>
     ))}
   </div>

   {/* ── Header & Search ───────────────────────────────────────────── */}
   <div className="surface-card p-5 rounded-2xl border border-theme shadow-sm space-y-4">
     <div className="flex items-center justify-between">
       <h1 className="text-xl font-black text-theme-primary capitalize tracking-tight flex items-center gap-2">
         <Users className="w-6 h-6 text-primary-light" />
         Registry Management
       </h1>
       <div className="flex items-center gap-2">
         <button onClick={() => setModal({ type: 'broadcast', user: null })} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm">
           <Mail className="w-4 h-4" /> Broadcast
         </button>
         <button onClick={loadUsers} disabled={isLoading} className="p-2 hover:surface-section rounded-lg transition group">
           <RefreshCw className={`w-5 h-5 text-theme-muted group-hover:text-primary-light ${isLoading ? 'animate-spin' : ''}`} />
         </button>
       </div>
     </div>

     <div className="flex flex-col lg:flex-row gap-3">
       {/* Search */}
       <div className="flex-1 relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
         <input
           type="text"
           placeholder="Search by exact email or name..."
           value={searchEmail}
           onChange={e => setSearchEmail(e.target.value)}
           onKeyDown={e => e.key === 'Enter' && loadUsers()}
           className="w-full pl-11 pr-4 py-3 surface-section border border-theme rounded-xl text-sm focus:ring-2 focus:ring-primary-light transition-all outline-none shadow-sm"
         />
       </div>

       {/* Filters */}
       <div className="flex gap-2">
         <select
           value={filterStatus}
           onChange={e => setFilterStatus(e.target.value as any)}
           className="px-4 py-3 surface-section border border-theme rounded-xl text-xs font-bold capitalize tracking-normal text-theme-secondary outline-none cursor-pointer hover:border-primary-light transition-colors"
         >
           <option value="ALL">All Status</option>
           <option value="ACTIVE">Active Only</option>
           <option value="BANNED">Banned Only</option>
           <option value="SUSPENDED">Suspended Only</option>
           <option value="DEACTIVATED">Deactivated</option>
         </select>

         <select
           value={filterRole}
           onChange={e => setFilterRole(e.target.value as any)}
           className="px-4 py-3 surface-section border border-theme rounded-xl text-xs font-bold capitalize tracking-normal text-theme-secondary outline-none cursor-pointer hover:border-primary-light transition-colors"
         >
           <option value="ALL">All Roles</option>
           <option value="TRAVELER">Travelers</option>
           <option value="GUIDE">Guides</option>
           <option value="ADMIN">Admins</option>
         </select>

         <button
           onClick={() => { setFilterStatus('ALL'); setFilterRole('ALL'); setSearchEmail(''); }}
           className="p-3 surface-section border border-theme rounded-xl hover:bg-danger-red/10 group transition-colors"
           title="Reset Filters"
         >
           <X className="w-4 h-4 text-theme-muted group-hover:text-danger-red" />
         </button>
       </div>
     </div>
   </div>

   {/* ── Empty State ───────────────────────────────────────────────── */}
   {filteredUsers.length === 0 && (
    <div className="surface-card rounded-2xl border-2 border-dashed border-theme flex flex-col items-center justify-center py-20 text-theme-muted">
     <div className="w-16 h-16 rounded-full bg-surface-section flex items-center justify-center mb-4">
       <UserX className="w-8 h-8 opacity-20" />
     </div>
     <p className="text-sm font-bold capitalize tracking-normal">No matching records found</p>
     <p className="text-xs mt-1">Try adjusting your filters or search term</p>
    </div>
   )}

   {/* ── Mobile: Card list (< md) ──────────────────────────────────── */}
   {filteredUsers.length > 0 && (
    <>
     <div className="md:hidden space-y-4">
      {filteredUsers.map(u => (
       <UserCard
        key={u.id}
        u={u}
        loading={actionLoading}
        onSuspend={() => setModal({ type: 'suspend', user: u })}
        onBan={() => setModal({ type: 'ban', user: u })}
        onActivate={() => handleActivate(u)}
        onDeactivate={() => handleDeactivate(u)}
        onReactivate={() => handleReactivate(u)}
        onDetails={() => setModal({ type: 'details', user: u })}
        onEmail={() => setModal({ type: 'email', user: u })}
       />
      ))}
     </div>

     {/* ── Desktop: Table (md+) ──────────────────────────────────────── */}
     <div className="hidden md:block surface-card rounded-xl border border-theme overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
       <table className="w-full border-collapse">
        <thead className="surface-section border-b border-[#c8d8f8] dark:border-[#1a3566]">
         <tr>
          {['User', 'Role', 'Status', 'Email', 'Profile', 'Joined', 'Actions'].map(h => (
           <th key={h} className="px-4 py-4 text-left text-[10px] font-black text-theme-muted capitalize tracking-normal">{h}</th>
          ))}
         </tr>
        </thead>
        <tbody className="divide-y divide-theme">
         {filteredUsers.map(u => (
          <tr 
            key={u.id} 
            onClick={() => setModal({ type: 'details', user: u })}
            className="hover:surface-section dark:hover:surface-card transition cursor-pointer group"
          >
           <td className="px-4 py-4">
            <div>
             <p className="text-sm font-bold text-theme-primary">{u.fullName || '—'}</p>
             <p className="text-[11px] text-theme-muted truncate max-w-[180px]">{u.email}</p>
             {u.statusReason && (
              <p className="text-[11px] text-accent-light dark:text-amber-400 mt-1 truncate max-w-xs" title={u.statusReason}>
               ↳ {u.statusReason}
              </p>
             )}
            </div>
           </td>
           <td className="px-4 py-4"><RoleBadge role={u.role} /></td>
           <td className="px-4 py-4"><StatusBadge u={u} /></td>
           <td className="px-4 py-4">
            {u.isEmailVerified
             ? <CheckCircle className="w-4 h-4 text-green-500" />
             : <AlertCircle className="w-4 h-4 text-accent-light dark:text-accent-dark" />}
           </td>
           <td className="px-4 py-4">
            {u.profileCompleted
             ? <span className="text-[10px] font-black capitalize text-green-600 dark:text-green-400">Complete</span>
             : <span className="text-[10px] font-black capitalize text-theme-muted">Incomplete</span>}
           </td>
           <td className="px-4 py-4 text-[11px] text-theme-muted whitespace-nowrap">
            {new Date(u.createdAtUtc).toLocaleDateString()}
           </td>
           <td className="px-4 py-4">
            <div onClick={e => e.stopPropagation()}>
              <ActionMenu
               u={u}
               loading={actionLoading}
               onSuspend={() => setModal({ type: 'suspend', user: u })}
               onBan={() => setModal({ type: 'ban', user: u })}
               onActivate={() => handleActivate(u)}
               onDeactivate={() => handleDeactivate(u)}
               onReactivate={() => handleReactivate(u)}
               onEmail={() => setModal({ type: 'email', user: u })}
              />
            </div>
           </td>
          </tr>
         ))}
        </tbody>
       </table>
      </div>
     </div>
    </>
   )}

   {/* ── Email / Broadcast Modal ─────────────────────────────────────── */}
   {(modal.type === 'email' || modal.type === 'broadcast') && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
     <div className="surface-card rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl border border-theme">
      <div className="flex items-center justify-between mb-4">
       <div className="flex items-center gap-2">
        <Mail className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-bold text-theme-primary capitalize tracking-tight">
          {modal.type === 'broadcast' ? 'Broadcast Email' : 'Send Email'}
        </h3>
       </div>
       <button onClick={closeModal} className="p-2 hover:surface-section rounded-lg transition"><X className="w-4 h-4" /></button>
      </div>

      <p className="text-sm text-theme-secondary mb-5">
       {modal.type === 'broadcast' 
         ? 'Send an email to all active users.' 
         : <>Sending to <strong className="text-theme-primary">{modal.user?.email}</strong></>
       }
      </p>

      <div className="space-y-4">
       <div>
        <label className="block text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1.5">
         Subject <span className="text-danger-red">*</span>
        </label>
        <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
         placeholder="Email Subject"
         className="w-full px-3 py-2.5 border border-theme rounded-xl surface-section text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
       </div>

       <div>
        <label className="block text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1.5">
         Message Body (HTML supported) <span className="text-danger-red">*</span>
        </label>
        <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)}
         placeholder="<p>Hello...</p>"
         rows={5}
         className="w-full px-3 py-2.5 border border-theme rounded-xl surface-section text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
        />
       </div>

       <div className="flex gap-2 pt-2">
        <button onClick={closeModal} className="flex-1 py-3 surface-section hover:brightness-95 border border-theme rounded-xl text-sm font-bold transition-all">Cancel</button>
        <button onClick={handleSendEmail} disabled={actionLoading || !emailSubject.trim() || !emailBody.trim()} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
         {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Email'}
        </button>
       </div>
      </div>
     </div>
    </div>
   )}

   {/* ── Suspend Modal ─────────────────────────────────────────────── */}
   {modal.type === 'suspend' && modal.user && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
     <div className="surface-card rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl border border-theme">
      <div className="flex items-center justify-between mb-4">
       <div className="flex items-center gap-2">
        <Pause className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-bold text-theme-primary capitalize tracking-tight">Suspend Account</h3>
       </div>
       <button onClick={closeModal} className="p-2 hover:surface-section rounded-lg transition"><X className="w-4 h-4" /></button>
      </div>

      <p className="text-sm text-theme-secondary mb-5">
       Suspending <strong className="text-theme-primary">{modal.user.fullName}</strong>
       <span className="block text-xs text-theme-muted truncate">{modal.user.email}</span>
      </p>

      <div className="space-y-4">
       <div>
        <label className="block text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1.5">
         Reason <span className="text-danger-red">*</span>
        </label>
        <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
         placeholder="Why is this user being suspended?"
         rows={3}
         className="w-full px-3 py-2.5 border border-theme rounded-xl surface-section text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />
       </div>

       <div>
        <label className="block text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1.5 flex items-center gap-1.5">
         <Clock className="w-3.5 h-3.5" />
         Expiry (leave blank for indefinite)
        </label>
        <input type="datetime-local"
         value={suspendUntil}
         min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
         onChange={e => setSuspendUntil(e.target.value)}
         className="w-full px-3 py-2.5 border border-theme rounded-xl surface-section text-sm outline-none focus:ring-2 focus:ring-amber-500"
        />
       </div>
      </div>

      <div className="flex gap-2 justify-end mt-6">
       <button onClick={closeModal}
        className="px-4 py-2.5 text-xs font-bold capitalize tracking-normal text-theme-secondary hover:surface-section rounded-xl transition">
        Cancel
       </button>
       <button onClick={handleSuspend}
        disabled={actionLoading || !suspendReason.trim()}
        className="px-5 py-2.5 text-xs font-black capitalize tracking-normal bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl flex items-center gap-2 transition shadow-lg shadow-amber-500/20">
        {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        Confirm Suspension
       </button>
      </div>
     </div>
    </div>
   )}

   {/* ── Ban Modal ──────────────────────────────────────────────────── */}
   {modal.type === 'ban' && modal.user && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
     <div className="surface-card rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl border border-theme">
      <div className="flex items-center justify-between mb-4">
       <div className="flex items-center gap-2">
        <Ban className="w-5 h-5 text-danger-red" />
        <h3 className="text-lg font-bold text-theme-primary capitalize tracking-tight">Permanent Ban</h3>
       </div>
       <button onClick={closeModal} className="p-2 hover:surface-section rounded-lg transition"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-3 bg-danger-red/10 border border-danger-red/20 rounded-xl mb-5">
       <p className="text-xs text-danger-red font-bold">⚠ CRITICAL: This action is permanent and prevents all logins.</p>
      </div>

      <p className="text-sm text-theme-secondary mb-4">
       Banning <strong className="text-theme-primary">{modal.user.fullName}</strong>
       <span className="block text-xs text-theme-muted truncate">{modal.user.email}</span>
      </p>

      <div>
       <label className="block text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1.5">
        Reason <span className="text-danger-red">*</span>
       </label>
       <textarea value={banReason} onChange={e => setBanReason(e.target.value)}
        placeholder="Provide a permanent ban justification..."
        rows={3}
        className="w-full px-3 py-2.5 border border-danger-red/30 rounded-xl surface-section text-sm outline-none focus:ring-2 focus:ring-danger-red resize-none"
       />
      </div>

      <div className="flex gap-2 justify-end mt-6">
       <button onClick={closeModal}
        className="px-4 py-2.5 text-xs font-bold capitalize tracking-normal text-theme-secondary hover:surface-section rounded-xl transition">
        Cancel
       </button>
       <button onClick={handleBan}
        disabled={actionLoading || !banReason.trim()}
        className="px-5 py-2.5 text-xs font-black capitalize tracking-normal bg-danger-red hover:bg-red-700 disabled:opacity-50 text-white rounded-xl flex items-center gap-2 transition shadow-lg shadow-danger-red/20">
        {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        Execute Ban
       </button>
      </div>
     </div>
    </div>
   )}

    {/* ── Details / Enforcement Modal ────────────────────────────────── */}
    {modal.type === 'details' && modal.user && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="surface-card rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-theme flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-light to-primary-light-hover p-6 text-white flex-shrink-0">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl border border-white/30">
                  {modal.user.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black capitalize tracking-tight">{modal.user.fullName}</h3>
                  <p className="text-white/80 text-sm font-medium">{modal.user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <RoleBadge role={modal.user.role} />
                    <StatusBadge u={modal.user} />
                  </div>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 surface-section rounded-2xl border border-theme">
                <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Registration Date
                </p>
                <p className="text-sm font-bold text-theme-primary">{new Date(modal.user.createdAtUtc).toLocaleString()}</p>
              </div>
              <div className="p-4 surface-section rounded-2xl border border-theme">
                <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  ID Verification
                </p>
                <p className={`text-sm font-bold ${modal.user.profileCompleted ? 'text-green-600' : 'text-theme-muted'}`}>
                  {modal.user.profileCompleted ? 'Verified Professional' : 'Verification Pending'}
                </p>
              </div>
            </div>

            {/* Enforcement Section (If Banned/Suspended) */}
            {(modal.user.accountStatus === 'BANNED' || modal.user.accountStatus === 'SUSPENDED') && (
              <div className="p-5 bg-danger-red/5 border-2 border-danger-red/10 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-danger-red capitalize tracking-normal flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Enforcement Record
                </h4>
                <div>
                  <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1">Primary Reason</p>
                  <p className="text-sm text-theme-primary leading-relaxed surface-card p-3 rounded-xl border border-theme">
                    {modal.user.statusReason || 'Violation of community guidelines.'}
                  </p>
                </div>
                {modal.user.suspendedUntilUtc && (
                  <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-[10px] font-black text-amber-600 capitalize tracking-normal">Suspension Expiry</p>
                      <p className="text-xs font-bold text-theme-primary">{new Date(modal.user.suspendedUntilUtc).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t border-danger-red/10">
                   <h5 className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-3 flex items-center gap-2">
                    <History className="w-3 h-3" />
                    Audit Logs
                  </h5>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-danger-red mt-1" />
                      <div>
                        <p className="text-xs font-bold text-theme-primary capitalize">Manual Account Lock</p>
                        <p className="text-[10px] text-theme-muted">{new Date(modal.user.createdAtUtc).toLocaleDateString()} • System Admin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions for this user */}
            <div className="space-y-3 pt-4">
              <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal">Available Operations</p>
              <div className="grid grid-cols-2 gap-2">
                {modal.user.accountStatus !== 'ACTIVE' && (
                  <button 
                    onClick={() => { handleActivate(modal.user!); closeModal(); }}
                    className="p-3 surface-section border border-theme rounded-xl text-xs font-bold text-green-600 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Lift Restrictions
                  </button>
                )}
                {modal.user.accountStatus === 'ACTIVE' && (
                  <>
                    <button 
                      onClick={() => setModal({ type: 'suspend', user: modal.user })}
                      className="p-3 surface-section border border-theme rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Pause className="w-4 h-4" /> Suspend Account
                    </button>
                    <button 
                      onClick={() => setModal({ type: 'ban', user: modal.user })}
                      className="p-3 surface-section border border-theme rounded-xl text-xs font-bold text-danger-red hover:bg-danger-red hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Ban className="w-4 h-4" /> Permanent Ban
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
 )
}
