// ============================================================================
// TRAVELER DASHBOARD LAYOUT - WITH COLLAPSIBLE SIDEBAR
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Heart,
  MessageSquare,
  User,
  Settings,
  Bell,
  HelpCircle,
  FileQuestion,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut as LogOutIcon
} from 'lucide-react'

// ============================================================================
// NAVIGATION ITEMS - COMPLETE LIST
// ============================================================================

const NAV_ITEMS = [
  // Primary
  { href: '/dashboard/traveler', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/traveler/bookings', label: 'My Bookings', icon: Calendar },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/dashboard/traveler/messages', label: 'Messages', icon: MessageSquare, badge: 3 },
  
  // Divider - visual only
  { type: 'divider' as const },
  
  // Secondary
  { href: '/dashboard/traveler/profile', label: 'Profile', icon: User },
  { href: '/dashboard/traveler/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/traveler/settings', label: 'Settings', icon: Settings },
  
  // Divider
  { type: 'divider' as const },
  
  // Support
  { href: '/contact', label: 'Help & Support', icon: HelpCircle },
  { href: '/faq', label: 'FAQ', icon: FileQuestion },
]

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
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
          ? 'bg-blue-600 text-white' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
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
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
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

export default function TravelerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    
    // Load sidebar preference from localStorage
    try {
      const saved = localStorage.getItem('safaribub-traveler-sidebar')
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
    localStorage.setItem('safaribub-traveler-sidebar', JSON.stringify(newState))
  }

  if (!mounted) {
    return <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">{children}</div>
  }

  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
      
      {/* ========================================
          MOBILE HEADER
          ======================================== */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <h1 className="font-bold text-gray-900 dark:text-white">Traveler Dashboard</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex relative">
        {/* ========================================
            SIDEBAR - DESKTOP (Collapsible)
            ======================================== */}
        <aside className={`
          hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)]
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 overflow-x-hidden overflow-y-auto
          ${isCollapsed ? 'w-20' : 'w-64'}
          z-40
        `}>
          <div className="h-full flex flex-col">
            
            {/* Toggle Button */}
            <div className="flex justify-center p-3">
              <button
                onClick={toggleCollapse}
                className={`flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'mx-auto' : 'ml-auto mr-3'}`}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
              {NAV_ITEMS.map((item, index) => {
                if ('type' in item && item.type === 'divider') {
                  return (
                    <div key={`divider-${index}`} className="my-2 border-t border-gray-200 dark:border-gray-800" />
                  )
                }
                const navItem = item as NavItem
                return (
                  <NavItemComponent
                    key={navItem.href}
                    item={navItem}
                    isActive={pathname === navItem.href}
                    isCollapsed={isCollapsed}
                  />
                )
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {/* handle logout */}}
                className={`
                  flex items-center gap-3 px-3 py-2 w-full rounded-lg transition-colors
                  text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30
                  ${isCollapsed ? 'justify-center' : 'justify-start'}
                  group
                `}
              >
                <LogOutIcon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                
                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                    Logout
                  </div>
                )}
              </button>
            </div>
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
            <div className="relative w-64 bg-white dark:bg-gray-900 h-full overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-900 dark:text-white">Traveler Dashboard</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="space-y-1">
                  {NAV_ITEMS.map((item, index) => {
                    if ('type' in item && item.type === 'divider') {
                      return (
                        <div key={`mobile-divider-${index}`} className="my-2 border-t border-gray-200 dark:border-gray-800" />
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
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{navItem.label}</span>
                        </div>
                        {navItem.badge && (
                          <span className="px-1.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                            {navItem.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}

                  {/* Mobile Logout */}
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => {/* handle logout */}}
                      className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            MAIN CONTENT
            ======================================== */}
        <main className={`
          flex-1 min-w-0 transition-all duration-300
          lg:ml-${isCollapsed ? '20' : '64'}
        `}>
          {children}
        </main>
      </div>
    </div>
  )
}