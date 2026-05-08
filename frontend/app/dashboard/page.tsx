// ============================================================================
// DASHBOARD REDIRECT HUB
// ============================================================================
// PURPOSE: Role-based redirect. If a user hits /dashboard directly,
// they get sent to the correct role-specific dashboard.
// Unauthenticated users are sent to /auth/login.
// ============================================================================

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/src/lib/contexts/AuthContext'

export default function DashboardRedirectPage() {
 const router = useRouter()
 const { user, isLoading } = useAuth()

 useEffect(() => {
 if (isLoading) return // wait for auth to settle

 if (!user) {
 router.replace('/auth/login')
 return
 }

 // Redirect to role-specific dashboard
 switch (user.role) {
 case 'ADMIN':
 router.replace('/dashboard/admin')
 break
 case 'GUIDE':
 router.replace('/dashboard/guide')
 break
 case 'TRAVELER':
 router.replace('/dashboard/traveler')
 break
 default:
 router.replace('/auth/login')
 }
 }, [user, isLoading, router])

 // Show spinner while redirecting
 return (
 <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
 <div className="text-center space-y-3">
 <Loader2 className="w-8 h-8 animate-spin text-primary-light dark:text-primary-dark mx-auto" />
 <p className="text-sm text-theme-muted ">Redirecting to your dashboard…</p>
 </div>
 </div>
 )
}
