// ============================================================================
// GUIDE DASHBOARD LAYOUT - WITH COLLAPSIBLE SIDEBAR
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
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
 <div className="min-h-screen surface-base flex flex-col">
      <Navigation />
 <div className="flex-1 flex relative pt-16">
 {/* ========================================
 MOBILE HEADER
 ======================================== */}
 <div className="lg:hidden flex items-center justify-between px-4 py-3 surface-card border-b border-theme">
 <h1 className="font-bold text-theme-primary">Guide Dashboard</h1>
 <button
 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
 className="p-2 rounded-lg hover:surface-section dark:hover:surface-card transition-colors"
 aria-label="Toggle menu"
 >
 {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
 </button>
 </div>

 {/* ========================================
 SIDEBAR - DESKTOP (Collapsible)
 ======================================== */}
 <aside className={`
 hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)]
 surface-base border-r border-theme
 transition-all duration-300 overflow-x-hidden overflow-y-auto z-30
 `} style={{ width: isCollapsed ? '5rem' : '16rem' }}>
 <div className="h-full flex flex-col">
 
 {/* Toggle Button */}
  <div className="flex items-center justify-between px-4 py-3 bg-transparent border-b border-theme mb-2">
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
 <div key={`divider-${index}`} className="my-2 border-t border-theme" />
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
 {isSidebarOpen && (
 <div className="lg:hidden fixed inset-0 z-50 flex">
 {/* Backdrop */}
 <div
 className="fixed inset-0 bg-black/50"
 onClick={() => setIsSidebarOpen(false)}
 />
 
 {/* Drawer */}
 <div className="relative w-64 surface-card h-full overflow-y-auto">
 <div className="p-4">
 <div className="flex items-center justify-between mb-6">
 <h2 className="font-bold text-theme-primary">Guide Dashboard</h2>
 <button
 onClick={() => setIsSidebarOpen(false)}
 className="p-1 rounded-lg hover:surface-section dark:hover:surface-card"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Mobile Navigation */}
 <nav className="space-y-1">
 {NAV_ITEMS.map((item, index) => {
 if ('type' in item && item.type === 'divider') {
 return (
 <div key={`mobile-divider-${index}`} className="my-2 border-t border-theme" />
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
 flex items-center justify-between px-3 py-2 rounded-lg transition-colors
 ${isActive
 ? 'bg-primary-light text-white'
 : 'text-theme-secondary hover:surface-section dark:hover:surface-card'
 }
 `}
 >
 <div className="flex items-center gap-3">
 <Icon className="w-4 h-4" />
 <span className="text-sm">{navItem.label}</span>
 </div>
 {navItem.badgeKey && badges[navItem.badgeKey] > 0 && (
 <span className="px-1.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
 {badges[navItem.badgeKey]}
 </span>
 )}
 </Link>
 )
 })}


 </nav>
 </div>
 </div>
 </div>
 )}

 {/* ========================================
 MAIN CONTENT
 ======================================== */}
 <main className="flex-1 min-w-0 transition-all duration-300 w-full" style={{ marginLeft: mounted && !isSidebarOpen ? (isCollapsed ? '5rem' : '16rem') : '0' }}>
 {/* Mobile Header in Main Content */}
 <div className="lg:hidden flex items-center justify-between px-4 py-3 surface-card border-b border-theme mb-4">
 <h1 className="font-bold text-theme-primary">Guide Dashboard</h1>
 <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:surface-section dark:hover:surface-card transition-colors">
 <Menu className="w-5 h-5" />
 </button>
 </div>
 {children}
 </main>
 </div>
 </div>
 )
}