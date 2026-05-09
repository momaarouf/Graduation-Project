// ============================================================================
// PAGE LAYOUT COMPONENT - FIXED DOUBLE FOOTER ISSUE
// ============================================================================
// LOCATION: /frontend/src/components/layout/PageLayout.tsx
// 
// NOTE (2026-02-16):
// To avoid duplicate footers across nested layouts, the footer
// has been centralized in the root layout. `PageLayout` no longer
// renders a footer; it focuses on navigation and page structure.
// ============================================================================

'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

interface PageLayoutProps {
 children: ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  const pathname = usePathname()
  const isAuthOrAdmin = pathname?.startsWith('/auth') || pathname?.startsWith('/dashboard/admin')

  return (
    <div className="min-h-screen w-full flex flex-col surface-base">
      {/* Navigation - fixed position, always visible */}
      <Navigation />

      {/* Main content area - Added pt-14/16 to clear sticky nav on all screen sizes */}
      {/* Added pb-24 conditionally to make room for MobileBottomNav on mobile */}
      <main className={`flex-1 w-full pt-14 sm:pt-16 ${!isAuthOrAdmin ? 'pb-24 md:pb-0' : ''}`}>
        {children}
      </main>

      {/* Footer is rendered globally by the root layout to avoid duplicates */}
    </div>
  )
}

// ============================================================================
// USAGE GUIDE:
// ============================================================================
//
// ✅ NORMAL PAGE (with footer):
// <PageLayout>
// <YourPageContent />
// </PageLayout>
// → Footer appears (hideFooter defaults to false)
//
// ✅ AUTH PAGE (no footer):
// <PageLayout hideFooter={true}>
// <AuthContent />
// </PageLayout>
// → No footer
//
// ✅ PAGE WITH HERO (no footer needed):
// <PageLayout hideFooter={true}>
// <HeroSection />
// </PageLayout>
// → Clean hero with no footer distraction
// ============================================================================
