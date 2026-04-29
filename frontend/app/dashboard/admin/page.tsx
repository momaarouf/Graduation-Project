'use client'

import React, { useState, useEffect } from 'react'
import { 
 Users, 
 Shield, 
 Scale, 
 TrendingUp, 
 TrendingDown,
 ArrowRight, 
 ChevronRight, 
 AlertCircle,
 Clock,
 History,
 Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
 adminGetUsers, 
 adminGetPendingVerifications, 
 adminGetAuditEvents,
 AdminUserResponse,
 AdminUserListResponse,
 GuideProfileResponse,
 AuditPage,
 AuditEventResponse
} from '@/src/lib/api/admin'
import { getAdminPendingTours } from '@/src/lib/api/tours'
import { toast } from 'react-hot-toast'
import { getGreeting } from '@/src/lib/greeting'

// ==================== STAT CARD COMPONENT ====================

interface StatCardProps {
 title: string
 value: string | number
 direction?: 'up' | 'down'
 trend?: string
 icon: any
 color: 'blue' | 'amber' | 'emerald' | 'purple'
 isLoading?: boolean
}

const StatCard = ({ title, value, direction, trend, icon: Icon, color, isLoading }: StatCardProps) => {
 const colorClasses = {
 blue: 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark border-primary-light/20 dark:border-primary-dark/20',
 amber: 'bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark border-accent-light/20 dark:border-accent-dark/20',
 emerald: 'bg-success-green/10 text-success-green border-success-green/20',
 purple: 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark border-primary-light/20 dark:border-primary-dark/20'
 }

 const iconClasses = {
 blue: 'bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark',
 amber: 'bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark',
 emerald: 'bg-success-green/20 text-success-green',
 purple: 'bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark'
 }

 const iconClasses = {
 blue: 'bg-primary-light/20 dark:bg-primary-dark/20 dark:bg-primary-light-hover/30 text-primary-light dark:text-primary-dark',
 amber: 'bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-800/30 text-accent-light dark:text-accent-dark',
 emerald: 'bg-success-green/20 dark:bg-emerald-800/30 text-success-green',
 purple: 'bg-purple-100 dark:bg-purple-800/30 text-purple-600'
 }

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className={`p-5 rounded-2xl border ${colorClasses[color]} shadow-sm`}
 >
 <div className="flex items-center justify-between mb-4">
 <div className={`p-2.5 rounded-xl ${iconClasses[color]}`}>
 <Icon className="w-5 h-5" />
 </div>
 {trend && (
 <div className={`flex items-center gap-1 text-xs font-medium ${direction === 'up' ? 'text-success-green' : 'text-danger-red'}`}>
 {direction === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
 {trend}
 </div>
 )}
 </div>
 <div>
 <p className="text-sm text-theme-muted font-medium mb-1">{title}</p>
 <div className="flex items-baseline gap-2">
 {isLoading ? (
 <div className="h-8 w-16 surface-section animate-pulse rounded-md" />
 ) : (
 <h3 className="text-2xl font-bold text-theme-primary">{value}</h3>
 )}
 </div>
 </div>
 </motion.div>
 )
}

// ==================== MAIN DASHBOARD PAGE ====================

export default function AdminDashboardPage() {
 const [stats, setStats] = useState({
 totalUsers: 0,
 pendingVerifications: 0,
 auditEventsCount: 0,
 pendingTours: 0
 })
 const [recentAudits, setRecentAudits] = useState<AuditEventResponse[]>([])
 const [pendingVerifs, setPendingVerifs] = useState<GuideProfileResponse[]>([])
 const [isLoading, setIsLoading] = useState(true)

 useEffect(() => {
 const fetchData = async () => {
 try {
 setIsLoading(true)
 const [usersResponse, verifs, audits, tours] = await Promise.all([
 adminGetUsers(),
 adminGetPendingVerifications(),
 adminGetAuditEvents(0, 5),
 getAdminPendingTours()
 ])

 setStats(prev => ({
 ...prev,
 totalUsers: usersResponse.users.length,
 pendingVerifications: verifs.length,
 pendingTours: tours.length
 }))

 setRecentAudits(audits.content || [])
 setPendingVerifs(verifs.slice(0, 5)) // Show top 5
 } catch (err) {
 console.error('Failed to fetch admin stats:', err)
 toast.error('Failed to load dashboard data')
 } finally {
 setIsLoading(false)
 }
 }

 fetchData()
 }, [])

 return (
 <div className="p-4 sm:p-6 lg:p-8 space-y-8">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
 <div>
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark rounded-full text-xs font-bold uppercase tracking-widest mb-4">
 <Sparkles className="w-3 h-3" />
 {getGreeting()}
 </div>
 <h1 className="text-2xl font-bold text-theme-primary">Platform Overview</h1>
 <p className="text-theme-muted text-sm mt-1">
 Real-time monitoring and administrative controls
 </p>
 </div>
 <div className="flex items-center gap-2 text-xs font-medium text-theme-muted surface-card px-3 py-1.5 rounded-full border border-theme shadow-sm">
 <Clock className="w-3.5 h-3.5" />
 Last updated: {new Date().toLocaleTimeString()}
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 <StatCard 
 title="Total Platform Users" 
 value={stats.totalUsers} 
 icon={Users} 
 color="blue" 
 isLoading={isLoading}
 />
 <StatCard 
 title="Pending Verifications" 
 value={stats.pendingVerifications} 
 icon={Shield} 
 color="amber" 
 isLoading={isLoading}
 />
 <StatCard 
 title="Tour Reviews Required" 
 value={stats.pendingTours} 
 icon={TrendingUp} 
 color="purple" 
 isLoading={isLoading}
 />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Left Column - Recent Activity */}
 <div className="lg:col-span-2 space-y-6">
 <div className="surface-card rounded-2xl border border-theme overflow-hidden shadow-sm">
 <div className="p-5 border-b border-theme flex items-center justify-between">
 <h2 className="font-bold text-theme-primary flex items-center gap-2">
 <History className="w-4 h-4 text-theme-muted" />
 Recent System Activity
 </h2>
 <Link href="/dashboard/admin/audit" className="text-xs text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline flex items-center font-medium">
 View All <ArrowRight className="w-3 h-3 ml-1" />
 </Link>
 </div>
 
 <div className="divide-y divide-gray-100 dark:divide-gray-800">
 {isLoading ? (
 Array(5).fill(0).map((_, i) => (
 <div key={i} className="p-4 flex gap-4">
 <div className="w-10 h-10 rounded-full surface-section animate-pulse" />
 <div className="flex-1 space-y-2">
 <div className="h-4 w-1/3 surface-section animate-pulse rounded" />
 <div className="h-3 w-1/2 surface-section animate-pulse rounded" />
 </div>
 </div>
 ))
 ) : recentAudits.length > 0 ? (
 recentAudits.map((event) => (
 <div key={event.id} className="p-4 flex items-start gap-4 hover:surface-section dark:hover:surface-card transition-colors">
 <div className={`p-2 rounded-xl flex-shrink-0 ${
 event.action.includes('BAN') || event.action.includes('SUSPEND') 
 ? 'bg-danger-red/10 text-danger-red dark:bg-red-900/10' 
 : 'surface-section text-theme-secondary'
 }`}>
 <AlertCircle className="w-5 h-5" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-0.5">
 <span className="text-sm font-semibold text-theme-primary truncate">
 {event.action.replace(/_/g, ' ')}
 </span>
 <span className="text-[11px] text-theme-muted font-medium">
 {new Date(event.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 <p className="text-xs text-theme-muted line-clamp-1 italic">
 {event.summary}
 </p>
 <p className="text-[10px] text-theme-muted">
 By {event.adminEmail}
 </p>
 {event.details && (
 <p className="text-[11px] text-theme-muted mt-1 truncate max-w-sm">
 {typeof event.details === 'string' ? event.details : JSON.stringify(event.details)}
 </p>
 )}
 </div>
 </div>
 ))
 ) : (
 <div className="p-8 text-center text-theme-muted text-sm">
 No recent activity found.
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Right Column - Secondary Actions & Status */}
 <div className="space-y-6">
 {/* Verification Requests Preview */}
 <div className="surface-card rounded-2xl border border-theme overflow-hidden shadow-sm">
 <div className="p-5 border-b border-theme flex items-center justify-between">
 <h2 className="font-bold text-theme-primary flex items-center gap-2">
 <Shield className="w-4 h-4 text-accent-light dark:text-accent-dark" />
 Pending Review
 </h2>
 {stats.pendingVerifications > 0 && (
 <span className="bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-900/30 text-accent-light dark:text-accent-dark dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
 {stats.pendingVerifications}
 </span>
 )}
 </div>
 
 <div className="p-4 space-y-4">
 {isLoading ? (
 Array(3).fill(0).map((_, i) => (
 <div key={i} className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full surface-section animate-pulse" />
 <div className="flex-1 space-y-1.5">
 <div className="h-3 w-2/3 surface-section animate-pulse rounded" />
 <div className="h-2 w-1/3 surface-section animate-pulse rounded" />
 </div>
 </div>
 ))
 ) : pendingVerifs.length > 0 ? (
 pendingVerifs.map((verif) => (
 <div key={verif.id} className="flex items-center justify-between group">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark dark:text-primary-dark flex items-center justify-center font-bold text-xs">
 {verif.user.fullName?.[0] || 'G'}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-semibold text-theme-primary truncate">
 {verif.user.fullName}
 </p>
 <p className="text-[11px] text-theme-muted truncate">
 Type: {verif.idDocumentType}
 </p>
 </div>
 </div>
 <Link 
 href="/dashboard/admin/verifications" 
 className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:surface-section dark:hover:surface-card text-theme-muted hover:text-primary-light dark:text-primary-dark"
 >
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 ))
 ) : (
 <div className="py-4 text-center">
 <p className="text-xs text-theme-muted italic">Queue is clear! 🎉</p>
 </div>
 )}
 
 <Link 
 href="/dashboard/admin/verifications"
 className="block w-full text-center py-2.5 mt-2 surface-section hover:surface-section dark:hover:surface-card rounded-xl text-xs font-semibold text-theme-secondary transition-colors border border-theme"
 >
 Open Verification Queue
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}