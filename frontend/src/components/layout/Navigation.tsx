// ============================================================================
// NAVIGATION - ROLE-BASED LAYOUT
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Menu,
  X,
  Globe,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  Heart,
  Calendar,
  MessageSquare,
  Award,
  Wallet,
  BarChart3,
  Bell,
  Shield,
  ChevronDown,
  LayoutDashboard,
  Menu as MenuIcon
} from 'lucide-react'

// Mock auth state - replace with real auth in Phase 3
const MOCK_USER = {
  isLoggedIn: false,
  role: 'null' as 'traveler' | 'guide' | 'admin' | null,
  name: 'Mehmet Yilmaz',
  avatar: '/images/guides/mehmet.jpg'
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  // Public links for everyone
  const publicLinks = [
    { href: '/tours', label: 'Tours' },
    { href: '/guides', label: 'Guides' },
    { href: '/how-it-works', label: 'How It Works' },
  ]

  // Traveler dashboard links (for dropdown)
  const travelerLinks = [
    { href: '/dashboard/traveler', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/traveler/bookings', label: 'My Bookings', icon: Calendar },
    { href: '/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/dashboard/traveler/messages', label: 'Messages', icon: MessageSquare, badge: 3 },
    { href: '/dashboard/traveler/profile', label: 'Profile', icon: User },
  ]

  // Get current role
  const isGuide = MOCK_USER.isLoggedIn && MOCK_USER.role === 'guide'
  const isAdmin = MOCK_USER.isLoggedIn && MOCK_USER.role === 'admin'
  const isTraveler = MOCK_USER.isLoggedIn && MOCK_USER.role === 'traveler'

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo - Always visible */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hidden xs:block">
              SafariHub
            </span>
          </Link>

          {/* Desktop Navigation - Different for guides/admins */}
          <div className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
            
            {/* Public Links - Hide for guides/admins (they use sidebar) */}
            {!isGuide && !isAdmin && (
              <div className="flex space-x-4 lg:space-x-6">
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm lg:text-base transition-colors ${
                      pathname === link.href
                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Theme Toggle - Always visible */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              ) : resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* User Menu - Same for everyone */}
            {MOCK_USER.isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    {MOCK_USER.avatar ? (
                      <img src={MOCK_USER.avatar} alt={MOCK_USER.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                    {MOCK_USER.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl py-2 z-50">
                    
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                      <p className="font-medium text-gray-900 dark:text-white">{MOCK_USER.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{MOCK_USER.role}</p>
                    </div>

                    {/* Dashboard Links - Different for each role */}
                    <div className="py-2">
                      {isTraveler && travelerLinks.map((link) => {
                        const Icon = link.icon
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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

                      {/* For guides/admins, just a link to dashboard (sidebar handles rest) */}
                      {(isGuide || isAdmin) && (
                        <Link
                          href={`/dashboard/${MOCK_USER.role}`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Go to Dashboard</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-2">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          // Handle logout
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
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 dark:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {!mounted ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Simplified for all roles */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 pb-3">
            <div className="pt-2 space-y-1">
              
              {/* Public Links - Show for everyone on mobile */}
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* User Info if logged in */}
              {MOCK_USER.isLoggedIn && (
                <>
                  <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800 mt-2 pt-2">
                    <p className="font-medium text-gray-900 dark:text-white">{MOCK_USER.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{MOCK_USER.role}</p>
                  </div>

                  {/* Dashboard Link */}
                  <Link
                    href={`/dashboard/${MOCK_USER.role}`}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      // Handle logout
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Logout
                  </button>
                </>
              )}

              {/* Auth Links for non-logged in */}
              {!MOCK_USER.isLoggedIn && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-2">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 rounded-lg text-base font-medium bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}