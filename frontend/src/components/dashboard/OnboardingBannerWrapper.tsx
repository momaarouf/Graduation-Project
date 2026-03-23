'use client'

import { useAuth } from '@/src/lib/contexts/AuthContext'
import OnboardingBanner from './OnboardingBanner'

/**
 * Client wrapper — reads user from AuthContext and renders the
 * OnboardingBanner. Drop this inside any server-component dashboard
 * without converting the whole page to 'use client'.
 *
 * For guide dashboards pass idVerified from the guide profile API.
 * For traveler dashboards omit idVerified.
 */
export default function OnboardingBannerWrapper({ verificationStatus }: { verificationStatus?: 'not_submitted' | 'pending' | 'approved' | 'rejected' }) {
  const { user } = useAuth()
  if (!user) return null

  return (
    <OnboardingBanner
      profileCompleted={user.profileCompleted}
      emailVerified={user.emailVerified}
      verificationStatus={verificationStatus}
      role={user.role as 'TRAVELER' | 'GUIDE' | 'ADMIN'}
      userEmail={user.email}
    />
  )
}