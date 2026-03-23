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
  CheckCircle2,
  MoreVertical,
  Search,
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
    blue: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
    amber: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30'
  }

  const iconClasses = {
    blue: 'bg-blue-100 dark:bg-blue-800/30 text-blue-600',
    amber: 'bg-amber-100 dark:bg-amber-800/30 text-amber-600',
    emerald: 'bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600',
    purple: 'bg-purple-100 dark:bg-purple-800/30 text-purple-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border bg-white dark:bg-gray-900 ${colorClasses[color]} shadow-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${iconClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {direction === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md" />
          ) : (
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
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
    pendingTours: 0,
    revenue: 4250 // Still mock until Financials milestone
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
          auditEventsCount: audits.totalElements || 0,
          pendingTours: tours.data.length
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            {getGreeting()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Real-time monitoring and administrative controls
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm">
          <Clock className="w-3.5 h-3.5" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Total Platform Users" 
          value={stats.totalUsers} 
          icon={Users} 
          color="blue" 
          isLoading={isLoading}
          trend="+4.2%"
          direction="up"
        />
        <StatCard 
          title="Pending Verifications" 
          value={stats.pendingVerifications} 
          icon={Shield} 
          color="amber" 
          isLoading={isLoading}
        />
        <StatCard 
          title="Tour Reviews" 
          value={stats.pendingTours} 
          icon={TrendingUp} 
          color="purple" 
          isLoading={isLoading}
          trend={stats.pendingTours > 5 ? "Action Required" : "Stable"}
          direction={stats.pendingTours > 5 ? "up" : "down"}
        />
        <StatCard 
          title="Gross Revenue" 
          value={`$${stats.revenue.toLocaleString()}`} 
          icon={CheckCircle2} 
          color="emerald" 
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-gray-400" />
                Recent System Activity
              </h2>
              <Link href="/dashboard/admin/audit" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center font-medium">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
                    </div>
                  </div>
                ))
              ) : recentAudits.length > 0 ? (
                recentAudits.map((event) => (
                  <div key={event.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${
                      event.action.includes('BAN') || event.action.includes('SUSPEND') 
                        ? 'bg-red-50 text-red-600 dark:bg-red-900/10' 
                        : 'bg-gray-50 text-gray-600 dark:bg-gray-800'
                    }`}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                         <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                           {event.action.replace(/_/g, ' ')}
                         </span>
                         <span className="text-[11px] text-gray-400 font-medium">
                           {new Date(event.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 italic">
                        {event.summary}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        By {event.adminEmail}
                      </p>
                      {event.detailsJson && (
                        <p className="text-[11px] text-gray-400 mt-1 truncate max-w-sm">
                          {event.detailsJson}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No recent activity found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Secondary Actions & Status */}
        <div className="space-y-6">
          {/* Verification Requests Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                Pending Review
              </h2>
              {stats.pendingVerifications > 0 && (
                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pendingVerifications}
                </span>
              )}
            </div>
            
            <div className="p-4 space-y-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
                      <div className="h-2 w-1/3 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
                    </div>
                  </div>
                ))
              ) : pendingVerifs.length > 0 ? (
                pendingVerifs.map((verif) => (
                  <div key={verif.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        {verif.user.fullName?.[0] || 'G'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {verif.user.fullName}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          Type: {verif.idDocumentType}
                        </p>
                      </div>
                    </div>
                    <Link 
                      href="/dashboard/admin/verifications" 
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                   <p className="text-xs text-gray-500 italic">Queue is clear! 🎉</p>
                </div>
              )}
              
              <Link 
                href="/dashboard/admin/verifications"
                className="block w-full text-center py-2.5 mt-2 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors border border-gray-100 dark:border-gray-800"
              >
                Open Verification Queue
              </Link>
            </div>
          </div>

          {/* Quick Support / Contact Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-indigo-700 dark:to-blue-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <Scale className="w-32 h-32 rotate-12" />
            </div>
            <h3 className="font-bold mb-2">Platform Controls</h3>
            <p className="text-xs text-blue-100 leading-relaxed opacity-90 mb-4">
              Need to perform a global system action? Access advanced modules below.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/admin/disputes" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-[11px] font-medium text-center transition-colors border border-white/10">
                Disputes
              </Link>
              <Link href="/dashboard/admin/payouts" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-[11px] font-medium text-center transition-colors border border-white/10">
                Payouts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}