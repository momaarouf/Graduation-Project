// ============================================================================
// ADMIN LAYOUT - WITH SIDEBAR NAVIGATION
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/admin/layout.tsx
// 
// PURPOSE: Provide consistent navigation between all admin pages
// 
// FEATURES:
// - Collapsible sidebar
// - Navigation links to all admin sections
// - Active page highlighting
// - Mobile responsive (hamburger menu)
// - User info and logout
// ============================================================================

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
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import toast from 'react-hot-toast'

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
    color: 'blue'
  },
  {
    name: 'Verifications',
    href: '/dashboard/admin/verifications',
    icon: Shield,
    color: 'amber',
    badge: 12 // Mock pending count
  },
  {
    name: 'Disputes',
    href: '/dashboard/admin/disputes',
    icon: Scale,
    color: 'red',
    badge: 5
  },
  {
    name: 'Blacklist',
    href: '/dashboard/admin/blacklist',
    icon: Ban,
    color: 'purple'
  },
  {
    name: 'Payouts',
    href: '/dashboard/admin/payouts',
    icon: DollarSign,
    color: 'emerald'
  },
  {
    name: 'Tours',
    href: '/dashboard/admin/tours',
    icon: Globe,
    color: 'indigo'
  },
  {
    name: 'Audit',
    href: '/dashboard/admin/audit',
    icon: History,
    color: 'gray'
  },
  {
    name: 'Settings',
    href: '/dashboard/admin/settings',
    icon: Settings,
    color: 'gray'
},
]

// ============================================================================
// NAVIGATION ITEM COMPONENT
// ============================================================================

interface NavItemProps {
  item: typeof NAV_ITEMS[0]
  isActive: boolean
  isCollapsed: boolean
  onClick?: () => void
}

const NavItem = ({ item, isActive, isCollapsed, onClick }: NavItemProps) => {
  const Icon = item.icon
  
  const colorClasses = {
    blue: isActive 
      ? 'bg-blue-600 text-white' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400',
    amber: isActive 
      ? 'bg-amber-600 text-white' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400',
    red: isActive 
      ? 'bg-red-600 text-white' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400',
    purple: isActive 
      ? 'bg-purple-600 text-white' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400',
    emerald: isActive 
      ? 'bg-emerald-600 text-white' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400',
    indigo: isActive 
      ? 'bg-indigo-600 text-white' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400',
    gray: isActive 
      ? 'bg-gray-600 text-white' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
        ${colorClasses[item.color as keyof typeof colorClasses]}
        ${isCollapsed ? 'justify-center' : 'justify-start'}
        group
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      
      {!isCollapsed && (
        <>
          <span className="text-sm font-medium flex-1">{item.name}</span>
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
          {item.name}
          {item.badge && ` (${item.badge})`}
        </div>
      )}
    </Link>
  )
}

// ============================================================================
// MAIN LAYOUT
// ============================================================================

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock admin user
  const adminUser = {
    name: 'Admin User',
    email: 'admin@safaribub.com',
    avatar: '/images/admin/avatar.jpg'
  }

  const handleLogout = () => {
    toast.success('Logged out successfully')
    router.push('/auth/login')
  }

  if (!mounted) {
    return <PageLayout>{children}</PageLayout>
  }

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        
        

        <div className="flex">
          {/* Sidebar - Desktop */}
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
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'mx-auto' : 'ml-auto mr-3'}`}
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
                {NAV_ITEMS.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </nav>

              {/* User Info */}
              <div className={`
                p-3 border-t border-gray-200 dark:border-gray-800
                ${isCollapsed ? 'text-center' : ''}
              `}>
                <div className={`
                  flex items-center gap-3
                  ${isCollapsed ? 'justify-center' : ''}
                `}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    A
                  </div>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {adminUser.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {adminUser.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                {isCollapsed && (
                  <button
                    onClick={handleLogout}
                    className="mt-3 p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar - Drawer */}
          {isMobileOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setIsMobileOpen(false)}
              />
              <div className="relative w-64 bg-white dark:bg-gray-900 h-full overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-gray-900 dark:text-white">Admin Panel</h2>
                    <button
                      onClick={() => setIsMobileOpen(false)}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {adminUser.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {adminUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="space-y-1">
                    {NAV_ITEMS.map((item) => (
                      <NavItem
                        key={item.href}
                        item={item}
                        isActive={pathname === item.href}
                        isCollapsed={false}
                        onClick={() => setIsMobileOpen(false)}
                      />
                    ))}
                  </nav>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full mt-4 flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </PageLayout>
  )
}