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
import Navigation from './Navigation'

interface PageLayoutProps {
    children: ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
    return (
        <div className="min-h-screen w-full flex flex-col bg-bg-light-primary dark:bg-bg-dark-primary">
            {/* Navigation - fixed position, always visible */}
            <Navigation />

            {/* Main content area - pages add their own padding */}
            <main className="flex-1 w-full">
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
//   <YourPageContent />
// </PageLayout>
// → Footer appears (hideFooter defaults to false)
//
// ✅ AUTH PAGE (no footer):
// <PageLayout hideFooter={true}>
//   <AuthContent />
// </PageLayout>
// → No footer
//
// ✅ PAGE WITH HERO (no footer needed):
// <PageLayout hideFooter={true}>
//   <HeroSection />
// </PageLayout>
// → Clean hero with no footer distraction
// ============================================================================