const fs = require('fs');
const content = `// ============================================================================
// NAVIGATION - ROLE-BASED LAYOUT
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { NotificationBell } from '@/src/components/NotificationBell'
import MobileTestQR from '@/src/components/dev/MobileTestQR'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Globe,
  Moon,
  Sun,
  User,
  LogOut,
  Calendar,
  MessageSquare,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react'

export default function Navigation() {
  const { user, isLoading, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false)
  }, [user?.userId])

  // Public links for everyone
  const publicLinks = [
    { href: '/tours', label: 'Tours' },
    { href: '/how-it-works', label: 'How It Works' },
  ]

  // User role checking
  const isGuide = user?.role === 'GUIDE'
  const isAdmin = user?.role === 'ADMIN'
  const isTraveler = user?.role === 'TRAVELER'

  // Notification states
  const [unreadCounts, setUnreadCounts] = useState({ messages: 0, bookings: 0, total: 0 })

  useEffect(() => {
    const handleSync = (e: any) => {
      const { unreadCount, categories } = e.detail
      setUnreadCounts({
        messages: categories?.messages || 0,
        bookings: categories?.bookings || 0,
        total: unreadCount || 0
      })
    }

    window.addEventListener('notification-sync', handleSync)
    return () => window.removeEventListener('notification-sync', handleSync)
  }, [])

  // Traveler dashboard links
  const travelerLinks = [
    { href: '/dashboard/traveler', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/traveler/bookings', label: 'My Bookings', icon: Calendar, badge: unreadCounts.bookings > 0 ? unreadCounts.bookings : undefined },
    { href: '/dashboard/traveler/messages', label: 'Messages', icon: MessageSquare, badge: unreadCounts.messages > 0 ? unreadCounts.messages : undefined },
    { href: '/dashboard/traveler/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 glass-theme border-b border-theme">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo - Always visible */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-light dark:bg-primary-dark rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-theme-primary">
              SafariHub
            </span>
          </Link>

          {/* Right Side Nav */}
          <div className="flex items-center space-x-2 md:space-x-4 lg:space-x-6">
            
            {/* Public Links - Hidden on mobile (moved to bottom nav) */}
            <div className="hidden md:flex space-x-4 lg:space-x-6">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={\`text-sm lg:text-base transition-colors \${
                    pathname === link.href
                      ? 'text-primary-light dark:text-primary-dark font-semibold'
                      : 'text-theme-secondary hover:text-primary-light dark:hover:text-primary-dark'
                  }\`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="hidden md:block">
              <MobileTestQR />
            </div>

            {/* Theme Toggle - Always visible */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:surface-section transition-colors"
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-theme-muted" />
              ) : resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-theme-muted" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-theme-muted" />
              )}
            </button>

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {/* User Menu - Visible everywhere */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-1 sm:px-3 py-1.5 rounded-lg hover:surface-section transition-colors"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 relative">
                    {unreadCounts.total > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full z-50 shadow-sm" />
                    )}
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                      {user.avatarUrl && !imageError ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.email} 
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        (user.email || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-theme-secondary hidden md:block max-w-[120px] xl:max-w-[180px] truncate">
                    {user.email}
                  </span>
                  <ChevronDown className="w-4 h-4 text-theme-muted hidden md:block" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 sm:w-64 surface-card border border-theme rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-theme overflow-hidden">
                      <p className="font-medium text-theme-primary truncate" title={user.email}>{user.email}</p>
                      <p className="text-xs text-theme-secondary capitalize">{user.role}</p>
                    </div>

                    <div className="py-2">
                      {isTraveler && travelerLinks.map((link) => {
                        const Icon = link.icon
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-2 text-sm text-theme-secondary hover:surface-section"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4" />
                              <span>{link.label}</span>
                            </div>
                            {link.badge && (
                              <span className="px-1.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                                {link.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}

                      {(isGuide || isAdmin) && (
                        <Link
                          href={\`/dashboard/\${user.role.toLowerCase()}\`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-theme-secondary hover:surface-section"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Go to Dashboard</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-theme pt-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-sm text-theme-secondary hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary px-3 py-1.5 sm:px-4 sm:py-2 text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
            
            {/* Mobile login link for guests */}
            {!user && (
              <div className="md:hidden flex items-center space-x-2">
                <Link href="/auth/login" className="text-sm font-medium text-theme-primary">
                  Login
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  )
}
`;
fs.writeFileSync('c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/src/components/layout/Navigation.tsx', content);
