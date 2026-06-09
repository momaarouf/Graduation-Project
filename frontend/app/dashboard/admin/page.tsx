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
  CheckCircle,
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
import { getGreeting } from '@/src/lib/greeting'
import AdminDashboardSkeleton from './skeleton'
import { useAuth } from '@/src/lib/contexts/AuthContext'

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
    blue: 'border-primary-light/30 text-primary-light dark:text-primary-dark',
    amber: 'border-accent-light/30 text-accent-light dark:text-accent-dark',
    emerald: 'border-success-green/30 text-success-green dark:text-emerald-400',
    purple: 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
  }

  const iconClasses = {
    blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark',
    amber: 'bg-accent-light/10 text-accent-light dark:text-accent-dark',
    emerald: 'bg-success-green/10 text-success-green dark:text-emerald-400',
    purple: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 sm:p-5 rounded-2xl border surface-card shadow-sm group hover:shadow-md transition-all ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${iconClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${direction === 'up' ? 'text-success-green' : 'text-danger-red'}`}>
            {direction === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] capitalize tracking-normal text-theme-muted font-bold mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-16 surface-section animate-pulse rounded-md" />
          ) : (
            <h3 className="text-2xl font-bold text-theme-primary tracking-tight">{value}</h3>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ==================== MAIN DASHBOARD PAGE ====================

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
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
    // Guard: don't fire during the auth bootstrap window when user is still null
    if (!user) {
      if (!authLoading) setIsLoading(false) // auth done, no user = layout handles redirect
      return;
    }
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [usersResponse, verifs, audits, tours] = await Promise.all([
          adminGetUsers().catch(() => ({ users: [] })),
          adminGetPendingVerifications().catch(() => []),
          adminGetAuditEvents(0, 5).catch(() => ({ content: [], totalElements: 0, totalPages: 0 })),
          getAdminPendingTours().catch(() => [])
        ])

        setStats(prev => ({
          ...prev,
          totalUsers: (usersResponse as any).users?.length ?? 0,
          pendingVerifications: (verifs as any).length ?? 0,
          pendingTours: (tours as any).length ?? 0
        }))

        setRecentAudits((audits as any).content || [])
        setPendingVerifs((verifs as any).slice(0, 5))
      } catch (err) {
        console.error('Failed to fetch admin stats:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.userId])

  if (authLoading || isLoading) {
    return <AdminDashboardSkeleton />
  }

  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar">
      <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary-light/10 text-primary-light dark:text-primary-dark rounded-lg text-[10px] font-bold capitalize tracking-normal">
              <Sparkles className="w-3 h-3" />
              {getGreeting()}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary tracking-tight">Platform Hub</h1>
            <p className="text-theme-muted text-xs sm:text-sm font-medium">
              Administrative monitoring and oversight
            </p>
          </div>
          <div suppressHydrationWarning className="flex items-center gap-2 text-[10px] font-bold capitalize tracking-normal text-theme-muted surface-card px-3 py-1.5 rounded-xl border border-theme shadow-sm w-fit">
            <Clock className="w-3.5 h-3.5 text-primary-light" />
            Live: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <StatCard 
            title="Total Users" 
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
            title="Tour Approvals" 
            value={stats.pendingTours} 
            icon={TrendingUp} 
            color="purple" 
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="surface-card rounded-2xl border border-theme overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-[#c8d8f8] dark:border-[#1a3566] flex items-center justify-between bg-surface-section/30">
                <h2 className="font-bold text-sm sm:text-base text-theme-primary flex items-center gap-2">
                  <History className="w-4 h-4 text-theme-muted" />
                  System Audit Trail
                </h2>
                <Link href="/dashboard/admin/audit" className="text-xs text-primary-light dark:text-primary-dark hover:underline flex items-center font-bold capitalize tracking-normal">
                  History <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
              
              <div className="divide-y divide-theme">
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
                    <div key={event.id} className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4 hover:surface-section transition-colors">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${
                        event.action.includes('BAN') || event.action.includes('SUSPEND') 
                        ? 'bg-danger-red/10 text-danger-red dark:text-red-400' 
                        : 'surface-section text-theme-secondary'
                      }`}>
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-bold text-theme-primary truncate capitalize tracking-tight">
                            {event.action.replace(/_/g, ' ')}
                          </span>
                          <span suppressHydrationWarning className="text-[10px] text-theme-muted font-bold whitespace-nowrap ml-2">
                            {new Date(event.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-theme-secondary line-clamp-1 mb-1 font-medium">
                          {event.summary}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-theme-muted capitalize tracking-normal bg-surface-section px-1.5 py-0.5 rounded border border-theme">
                            By {event.adminEmail?.split('@')[0] || 'System'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-theme-muted text-sm font-medium">
                    No recent system activity.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="space-y-4">
            <div className="surface-card rounded-2xl border border-theme overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-[#c8d8f8] dark:border-[#1a3566] flex items-center justify-between bg-surface-section/30">
                <h2 className="font-bold text-sm sm:text-base text-theme-primary flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent-light" />
                  Guide Reviews
                </h2>
                {stats.pendingVerifications > 0 && (
                  <span className="bg-accent-light text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    {stats.pendingVerifications}
                  </span>
                )}
              </div>
              
              <div className="p-4 space-y-3">
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
                    <div key={verif.id} className="p-4 flex items-center justify-between hover:surface-section transition-colors group border-b border-[#c8d8f8] dark:border-[#1a3566] last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary-light/10 text-primary-light dark:text-primary-dark flex items-center justify-center font-bold text-xs shrink-0 border border-primary-light/10">
                          {verif.user.fullName?.[0] || 'G'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-theme-primary truncate">
                            {verif.user.fullName}
                          </p>
                          <p className="text-[10px] font-bold text-theme-muted capitalize tracking-normal truncate">
                            {verif.idDocumentType}
                          </p>
                        </div>
                      </div>
                      <Link 
                        href="/dashboard/admin/verifications" 
                        className="p-1.5 rounded-lg text-theme-muted hover:text-primary-light transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center bg-surface-section/20 rounded-xl border border-dashed border-theme">
                    <CheckCircle className="w-8 h-8 text-success-green/20 mx-auto mb-2" />
                    <p className="text-xs text-theme-muted font-bold capitalize tracking-normal">Clear Queue</p>
                  </div>
                )}
                
                <Link 
                  href="/dashboard/admin/verifications"
                  className="block w-full text-center py-3 mt-2 bg-surface-section hover:bg-surface-section/80 text-theme-primary text-[10px] font-bold capitalize tracking-[0.2em] rounded-xl transition-all border border-theme shadow-sm active:scale-[0.98]"
                >
                  Manage All Requests
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
