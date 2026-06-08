'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { 
  Home,
  Search, 
  Compass,
  Info,
  Calendar, 
  MessageSquare, 
  User, 
  LayoutDashboard,
  HelpCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasChatId = searchParams?.get('id') != null
  const { user } = useAuth()
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

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Do not show on larger screens
  // Also, we might hide it on certain auth pages if desired, but standard is to show it or hide on auth.
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/dashboard/admin') || (pathname?.includes('/messages') && hasChatId)) {
    return null; // Keep it clean for auth and admin
  }

  // Prevent tree hydration mismatch by waiting for client-side mount
  if (!mounted) return null;

  const isGuide = user?.role === 'GUIDE'
  const isTraveler = user?.role === 'TRAVELER' || !user // Default to traveler view for guests

  const navItems = isGuide 
    ? [
        { href: '/tours', label: 'Explore', icon: Compass },
        { href: '/dashboard/guide', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/guide/tours', label: 'My Tours', icon: Calendar },
        { href: '/dashboard/guide/messages', label: 'Messages', icon: MessageSquare, badge: unreadCounts.messages },
      ]
    : isTraveler && user
    ? [
        { href: '/tours', label: 'Explore', icon: Compass },
        { href: '/dashboard/traveler', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/traveler/bookings', label: 'Bookings', icon: Calendar, badge: unreadCounts.bookings },
        { href: '/dashboard/traveler/messages', label: 'Messages', icon: MessageSquare, badge: unreadCounts.messages },
      ]
    : [
        { href: '/', label: 'Home', icon: Home },
        { href: '/tours', label: 'Explore', icon: Compass },
        { href: '/how-it-works', label: 'How It Works', icon: HelpCircle },
      ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-theme pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
          
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive 
                  ? 'text-primary-light dark:text-primary-dark' 
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-[#f0f5ff] dark:border-[#040d1e]">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
