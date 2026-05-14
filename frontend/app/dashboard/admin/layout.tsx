// ============================================================================
// ADMIN LAYOUT - WITH SIDEBAR NAVIGATION
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/admin/layout.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Shield,
  Ban,
  Scale,
  DollarSign,
  Globe,
  History,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Settings,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navigation from '@/src/components/layout/Navigation'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { adminGetPendingVerifications } from '@/src/lib/api/admin'
import { getAdminPendingTours } from '@/src/lib/api/tours'

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard, color: 'blue' },
  { name: 'Verifications', href: '/dashboard/admin/verifications', icon: Shield, color: 'amber', badgeKey: 'admin-verifications' },
  { name: 'Users', href: '/dashboard/admin/users', icon: Users, color: 'blue' },
  { name: 'Disputes', href: '/dashboard/admin/disputes', icon: Scale, color: 'red' },
  { name: 'Support', href: '/dashboard/admin/support', icon: MessageSquare, color: 'blue' },
  { name: 'Payouts', href: '/dashboard/admin/payouts', icon: DollarSign, color: 'emerald' },
  { name: 'Tours', href: '/dashboard/admin/tours', icon: Globe, color: 'indigo', badgeKey: 'admin-tours' },
  { name: 'Audit', href: '/dashboard/admin/audit', icon: History, color: 'gray' },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings, color: 'gray' },
]

// ============================================================================
// NAVIGATION ITEM COMPONENT
// ============================================================================

interface NavItemProps {
  item: typeof NAV_ITEMS[0] & { badge?: number }
  isActive: boolean
  isCollapsed: boolean
  onClick?: () => void
}

const NavItem = ({ item, isActive, isCollapsed, onClick }: NavItemProps) => {
  const Icon = item.icon
  const colorClasses = {
    blue: isActive ? 'bg-primary-light text-white shadow-lg shadow-blue-500/20' : 'text-theme-secondary hover:bg-primary-light/10 hover:text-primary-light',
    amber: isActive ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-theme-secondary hover:bg-amber-50 hover:text-amber-600',
    red: isActive ? 'bg-danger-red text-white shadow-lg shadow-red-500/20' : 'text-theme-secondary hover:bg-red-50 hover:text-danger-red',
    purple: isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-theme-secondary hover:bg-purple-50 hover:text-purple-600',
    emerald: isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-theme-secondary hover:bg-emerald-50 hover:text-emerald-600',
    indigo: isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-theme-secondary hover:bg-indigo-50 hover:text-indigo-600',
    gray: isActive ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-lg' : 'text-theme-secondary hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-theme-primary'
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-95 ${colorClasses[item.color as keyof typeof colorClasses]} ${isCollapsed ? 'justify-center' : 'justify-start'} group`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="text-sm font-medium flex-1">{item.name}</span>
          {item.badge && item.badge > 0 && (
            <span className="px-1.5 py-0.5 bg-danger-red text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">{item.badge}</span>
          )}
        </>
      )}
      {isCollapsed && item.badge && item.badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger-red text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-theme">{item.badge}</span>
      )}
    </Link>
  )
}

// ============================================================================
// MAIN LAYOUT
// ============================================================================

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [badges, setBadges] = useState<Record<string, number>>({})

  const fetchBadges = async () => {
    try {
      const [verificationsRes, toursRes] = await Promise.all([adminGetPendingVerifications(), getAdminPendingTours()])
      setBadges({
        'admin-verifications': verificationsRes.length,
        'admin-tours': toursRes.filter(t => t.status === 'PENDING_REVIEW').length
      })
    } catch (err) { console.error('Failed to fetch admin badges:', err) }
  }

  useEffect(() => {
    if (mounted) fetchBadges()
    const handleRefresh = () => fetchBadges()
    window.addEventListener('badge-refresh', handleRefresh)
    return () => window.removeEventListener('badge-refresh', handleRefresh)
  }, [mounted])

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('safaribub-admin-sidebar')
      if (saved !== null) setIsCollapsed(JSON.parse(saved))
    } catch (error) { console.warn('Failed to load admin sidebar state:', error) }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('safaribub-admin-sidebar', JSON.stringify(newState))
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/auth/login')
    } catch (err) { toast.error('Logout failed') }
  }

  if (!mounted) return <div className="min-h-screen surface-base">{children}</div>
  if (user && user.role !== 'ADMIN') { router.replace('/dashboard'); return null }

  return (
    <div className="min-h-screen surface-base flex flex-col">
      <Navigation />
      <div className="flex flex-1 relative lg:pt-16">
        {/* Sidebar - Desktop */}
        <aside className={`hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] surface-base border-r border-theme transition-all duration-300 overflow-x-hidden overflow-y-auto ${isCollapsed ? 'w-20' : 'w-64'} z-40`}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-theme mb-2">
              <button onClick={toggleCollapse} className={`flex items-center justify-center w-8 h-8 rounded-lg hover:surface-section transition-colors ${isCollapsed ? 'mx-auto' : 'ml-auto mr-3'}`}>
                {isCollapsed ? <ChevronRight className="w-4 h-4 text-theme-muted" /> : <ChevronLeft className="w-4 h-4 text-theme-muted" />}
              </button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.href} item={{ ...item, badge: (item as any).badgeKey ? badges[(item as any).badgeKey] : undefined }} isActive={pathname === item.href} isCollapsed={isCollapsed} />
              ))}
            </nav>
            <div className={`p-3 border-t border-theme ${isCollapsed ? 'text-center' : ''}`}>
              <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-theme-primary truncate">{user?.fullName || 'Admin'}</p>
                    <button onClick={handleLogout} className="text-[11px] text-danger-red hover:underline">Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
            <div className="relative w-64 surface-card h-full overflow-y-auto shadow-2xl p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-theme-primary flex items-center gap-2"><Shield className="w-5 h-5 text-primary-light" />Admin Panel</h2>
                <button onClick={() => setIsMobileOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <NavItem key={item.href} item={{ ...item, badge: (item as any).badgeKey ? badges[(item as any).badgeKey] : undefined }} isActive={pathname === item.href} isCollapsed={false} onClick={() => setIsMobileOpen(false)} />
                ))}
              </nav>
              <button onClick={handleLogout} className="w-full mt-8 flex items-center gap-2 px-4 py-3 text-danger-red font-medium"><LogOut className="w-5 h-5" /><span>Logout</span></button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 min-w-0 relative lg:ml-20 ${!isCollapsed ? 'lg:ml-64' : ''}`}>
          <div className="lg:hidden h-14 glass-theme border-b border-theme flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
            <button onClick={() => setIsMobileOpen(true)} className="p-2 -ml-2"><Menu className="w-5 h-5" /></button>
            <span className="text-xs font-black capitalize tracking-normal text-theme-primary">Admin Control</span>
            <div className="w-8" />
          </div>
          <div className="p-3 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
