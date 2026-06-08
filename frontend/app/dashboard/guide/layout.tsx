// ============================================================================
// GUIDE DASHBOARD LAYOUT - WITH COLLAPSIBLE SIDEBAR
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
 Globe,
 LayoutDashboard,
 Calendar,
 Heart,
 Users,
 MessageSquare,
 Wallet,
 DollarSign,
 BarChart3,
 Award,
 Sparkles,
 Shield,
 User,
 HelpCircle,
 LogOut,
 Menu,
 X,
 ChevronLeft,
 ChevronRight,
 PlusCircle,
 LogOut as LogOutIcon,
 Settings,
 Scale
} from 'lucide-react'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import Navigation from '@/src/components/layout/Navigation'
import ThemeToggle from '@/src/components/layout/ThemeToggle'
import { BookingStatus } from '@/src/lib/types/tour.types'

// ============================================================================
// NAVIGATION ITEMS - COMPLETE LIST
// ============================================================================

const NAV_ITEMS = [
 // Primary
 { href: '/dashboard/guide', label: 'Dashboard', icon: LayoutDashboard },
 { href: '/dashboard/guide/tours', label: 'My Tours', icon: Calendar },
 { href: '/dashboard/guide/wishlist', label: 'Inspiration', icon: Heart },
 
 // Divider
 { type: 'divider' as const },
 
 // Bookings & Messages
 { href: '/dashboard/guide/bookings', label: 'Bookings', icon: Users, badgeKey: 'guide-bookings' as const },
 { href: '/dashboard/guide/on-tour', label: 'Tour Toolkit', icon: Sparkles },
 { href: '/dashboard/guide/messages', label: 'Messages', icon: MessageSquare, badgeKey: 'guide-messages' as const },
 { href: '/dashboard/guide/disputes', label: 'Disputes', icon: Scale },
 
 // Earnings
 { href: '/dashboard/guide/wallet', label: 'Wallet', icon: Wallet },
 
 // Divider
 { type: 'divider' as const },
 
 // Profile & Settings
 { href: '/dashboard/guide/profile', label: 'Profile', icon: User },
 { href: '/dashboard/guide/verification', label: 'Verification', icon: Shield },
 { href: '/dashboard/guide/settings', label: 'Settings', icon: Settings },
]

const MARKETPLACE_LINK = { href: '/tours', label: 'Explore Marketplace', icon: Globe }

type NavItem = {
 href: string
 label: string
 icon: React.ElementType
 badgeKey?: 'guide-bookings' | 'guide-messages'
 badge?: number
}

type NavDivider = {
 type: 'divider'
}

type NavItemType = NavItem | NavDivider

// ============================================================================
// NAVIGATION ITEM COMPONENT
// ============================================================================

interface NavItemProps {
 item: NavItem
 isActive: boolean
 isCollapsed: boolean
 onClick?: () => void
}

const NavItemComponent = ({ item, isActive, isCollapsed, onClick }: NavItemProps) => {
 const Icon = item.icon
 
 return (
 <Link
 href={item.href}
 onClick={onClick}
 className={`
 relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
 ${isActive 
 ? 'bg-primary-light text-white' 
 : 'text-theme-secondary hover:surface-section dark:hover:surface-card hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark '
 }
 ${isCollapsed ? 'justify-center' : 'justify-start'}
 group
 `}
 >
 <Icon className="w-5 h-5 flex-shrink-0" />
 
 {!isCollapsed && (
 <>
 <span className="text-sm font-medium flex-1">{item.label}</span>
 {item.badge && (
 <span className="px-1.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
 {item.badge}
 </span>
 )}
 </>
 )}

 {isCollapsed && item.badge && (
 <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
 {item.badge}
 </span>
 )}

 {/* Tooltip for collapsed mode */}
 {isCollapsed && (
 <div className="absolute left-full ml-2 px-2 py-1 surface-base text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
 {item.label}
 {item.badge && ` (${item.badge})`}
 </div>
 )}
 </Link>
 )
}

// ============================================================================
// MAIN LAYOUT
// ============================================================================

export default function GuideDashboardLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const pathname = usePathname()
 const { user, logout, isLoading } = useAuth()
 const router = useRouter()
 const [isCollapsed, setIsCollapsed] = useState(true)
 const [isSidebarOpen, setIsSidebarOpen] = useState(false)
 const [mounted, setMounted] = useState(false)
 const [badges, setBadges] = useState<Record<string, number>>({
 'guide-bookings': 0,
 'guide-messages': 0
 })

 // Fetch initial notification counts on mount
 const fetchCounts = async () => {
 // Note: NotificationBell already fetches unread count and broadcasts 'notification-sync'.
 // We only need to fetch domain-specific counts if necessary.
 // For now, let's keep it empty or minimal to let Notifications drive the UI.
 }

 useEffect(() => {
 if (mounted) fetchCounts()
 


 // Listen for refresh events (re-fetch from server)
 const handleRefresh = () => fetchCounts()

 // Listen for notification sync events (from NotificationBell)
 const handleNotificationSync = (e: any) => {
 const { categories } = e.detail
 setBadges(prev => ({
 ...prev,
 'guide-messages': categories.messages,
 'guide-bookings': categories.bookings
 }))
 }

 const handleToggleSidebar = () => setIsSidebarOpen(prev => !prev)

 window.addEventListener('badge-refresh', handleRefresh)
 window.addEventListener('notification-sync', handleNotificationSync)
 window.addEventListener('toggle-sidebar', handleToggleSidebar)
 
 return () => {
 window.removeEventListener('badge-refresh', handleRefresh)
 window.removeEventListener('notification-sync', handleNotificationSync)
 window.removeEventListener('toggle-sidebar', handleToggleSidebar)
 }
 }, [mounted])

 // Role guard
 useEffect(() => {
 if (!isLoading && (!user || user.role !== 'GUIDE')) {
 router.push('/dashboard')
 }
 }, [user, isLoading, router])

 // Prevent hydration mismatch
 useEffect(() => {
 setMounted(true)
 
 // Load sidebar preference from localStorage
 try {
 const saved = localStorage.getItem('safaribub-guide-sidebar')
 if (saved !== null) {
 setIsCollapsed(JSON.parse(saved))
 }
 } catch (error) {
 console.warn('Failed to load sidebar state:', error)
 }
 }, [])

 // Save sidebar preference
 const toggleCollapse = () => {
 const newState = !isCollapsed
 setIsCollapsed(newState)
 localStorage.setItem('safaribub-guide-sidebar', JSON.stringify(newState))
 }

 if (!mounted) {
 return <div className="min-h-screen surface-base">{children}</div>
 }

 return (
 <div className="h-dvh surface-base flex flex-col overflow-hidden">
      <div className="hidden lg:block flex-none">
        <Navigation />
      </div>
 <div className="flex-1 flex min-h-0 relative lg:pt-16">
 {/* ========================================
 MOBILE HEADER
 ======================================== */}
  <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 surface-card/80 backdrop-blur-md shadow-sm">
  <div className="flex items-center gap-3">
  <div className="w-8 h-8 bg-primary-light/10 rounded-lg flex items-center justify-center">
  <LayoutDashboard className="w-4 h-4 text-primary-light dark:text-primary-dark" />
  </div>
  <h1 className="font-bold text-[10px] capitalize tracking-[0.2em] text-theme-primary">Guide Hub</h1>
  </div>
  <div className="flex items-center gap-2">
  <ThemeToggle />
  <button
  onClick={() => setIsSidebarOpen(true)}
  className="p-2 rounded-xl hover:surface-section dark:hover:surface-card transition-all active:scale-90"
  aria-label="Open menu"
  >
  <Menu className="w-6 h-6 text-theme-primary" />
  </button>
  </div>
  </div>

 {/* ========================================
 SIDEBAR - DESKTOP (Collapsible)
 ======================================== */}
 <aside className={`
 hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)]
 surface-base
 transition-all duration-300 overflow-x-hidden overflow-y-auto z-30
 `} style={{ width: isCollapsed ? '5rem' : '16rem' }}>
 <div className="h-full flex flex-col">
 
 {/* Toggle Button */}
  <div className="flex items-center justify-between px-4 py-3 bg-transparent mb-2">
 <button
 onClick={toggleCollapse}
 className={`flex items-center justify-center w-8 h-8 rounded-lg hover:surface-section dark:hover:surface-card transition-colors ${isCollapsed ? 'mx-auto' : 'ml-auto mr-3'}`}
 aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
 >
 {isCollapsed ? (
 <ChevronRight className="w-4 h-4 text-theme-muted" />
 ) : (
 <ChevronLeft className="w-4 h-4 text-theme-muted" />
 )}
 </button>
 </div>

 {/* Navigation */}
 <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
 {NAV_ITEMS.map((item, index) => {
 if ('type' in item && item.type === 'divider') {
 return (
 <div key={`divider-${index}`} className="my-2" />
 )
 }
 const navItem = item as NavItem
 return (
 <NavItemComponent
 key={navItem.href}
 item={{
 ...navItem,
 badge: navItem.badgeKey ? badges[navItem.badgeKey] : undefined
 }}
 isActive={pathname === navItem.href}
 isCollapsed={isCollapsed}
 />
 )
 })}
 </nav>




 </div>
 </aside>

 {/* ========================================
 MOBILE SIDEBAR - DRAWER
 ======================================== */}
  <AnimatePresence>
  {isSidebarOpen && (
 <div className="lg:hidden fixed inset-0 z-[100] flex">
  {/* Backdrop */}
  <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
  onClick={() => setIsSidebarOpen(false)}
  />
 
  {/* Drawer */}
  <motion.div 
  initial={{ x: '-100%' }}
  animate={{ x: 0 }}
  exit={{ x: '-100%' }}
  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
  className="relative w-[280px] surface-card h-full overflow-y-auto shadow-2xl flex flex-col"
  >
  <div className="p-5 surface-section flex items-center justify-between">
  <div className="flex items-center gap-3">
  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-light/20">
  <LayoutDashboard className="w-5 h-5" />
  </div>
  <div>
  <h2 className="font-bold text-xs capitalize tracking-normal text-theme-primary">Guide</h2>
  <p className="text-[9px] font-bold text-theme-muted capitalize tracking-tighter">Control Center</p>
  </div>
  </div>
  <button
  onClick={() => setIsSidebarOpen(false)}
  className="p-2.5 rounded-xl surface-base hover:surface-section dark:hover:surface-card transition-all active:scale-90"
  >
  <X className="w-5 h-5" />
  </button>
  </div>

  <div className="flex-1 p-4 overflow-y-auto">
  {/* Marketplace Link - Mobile only (for easy exit) */}
  <div className="mb-5 lg:hidden">
  <Link
  href={MARKETPLACE_LINK.href}
  onClick={() => setIsSidebarOpen(false)}
  className="flex items-center gap-4 px-4 py-2.5 rounded-2xl transition-all active:scale-[0.98] text-primary-light dark:text-primary-dark bg-primary-light/5 font-bold text-[11px] capitalize tracking-normal border border-primary-light/10"
  >
  <Globe className="w-4 h-4" />
  <span>{MARKETPLACE_LINK.label}</span>
  </Link>
  </div>

  <nav className="space-y-1.5">
  {NAV_ITEMS.map((item, index) => {
  if ('type' in item && item.type === 'divider') {
  return (
  <div key={`mobile-divider-${index}`} className="my-3 opacity-50" />
  )
  }
  const navItem = item as NavItem
  const Icon = navItem.icon
  const isActive = pathname === navItem.href

  return (
  <Link
  key={navItem.href}
  href={navItem.href}
  onClick={() => setIsSidebarOpen(false)}
  className={`
  flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all active:scale-[0.98]
  ${isActive
  ? 'bg-primary-light text-white shadow-lg shadow-primary-light/20'
  : 'text-theme-secondary hover:surface-section dark:hover:surface-card'
  }
  `}
  >
  <div className="flex items-center gap-4">
  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-theme-muted'}`} />
  <span className={`text-[13px] font-bold ${isActive ? 'text-white' : 'text-theme-primary'}`}>{navItem.label}</span>
  </div>
  {navItem.badgeKey && badges[navItem.badgeKey] > 0 && (
  <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full shadow-sm">
  {badges[navItem.badgeKey]}
  </span>
  )}
  </Link>
  )
  })}
  </nav>
  </div>

  <div className="p-4 surface-section pb-[calc(1rem+env(safe-area-inset-bottom))]">
  <button 
  onClick={() => logout()}
  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-danger-red hover:bg-danger-red/10 transition-all font-bold text-sm"
  >
  <LogOutIcon className="w-5 h-5" />
  Sign Out
  </button>
  </div>
  </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ========================================
 MAIN CONTENT
 ======================================== */}
    <main 
      className={`flex-1 min-w-0 transition-all duration-300 w-full pt-14 lg:pt-0 pb-[calc(4rem+1px+env(safe-area-inset-bottom))] lg:pb-0 flex flex-col min-h-0 ${pathname.includes('/messages') ? 'overflow-hidden' : 'overflow-y-auto chat-scrollbar'}`} 
      style={{ 
        marginLeft: mounted && typeof window !== 'undefined' && window.innerWidth >= 1024 
          ? (isCollapsed ? '5rem' : '16rem') 
          : '0' 
      }}
    >
   {children}
 </main>
 </div>
 </div>
 )
}
