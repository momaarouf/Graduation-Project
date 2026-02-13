// ============================================================================
// AUTH LAYOUT - Centered, Clean, No Footer
// ============================================================================
// LOCATION: /frontend/src/app/auth/layout.tsx
// 
// PURPOSE: Consistent layout for all authentication pages
// 
// WHY THIS FILE EXISTS:
// ---------------------
// 1. All auth pages (login, signup, forgot-password) need:
//    - Centered content
//    - No footer (cleaner focus)
//    - Consistent padding
//    - Same background treatment
// 
// 2. Reuses PageLayout but overrides footer behavior
// 
// PAGES USING THIS LAYOUT:
// - /auth/signup
// - /auth/login (Phase 3)
// - /auth/forgot-password (Phase 3)
// - /auth/reset-password (Phase 3)
// ============================================================================

'use client'

import { ReactNode } from 'react'
import PageLayout from '@/src/components/layout/PageLayout'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface AuthLayoutProps {
    children: ReactNode
    /** Optional: Hide back button on certain pages */
    hideBackButton?: boolean
}

export default function AuthLayout({ children, hideBackButton = false }: AuthLayoutProps) {
    const pathname = usePathname()

    // Determine page title based on path
    const getPageTitle = () => {
        if (pathname.includes('/signup')) return 'Create your account'
        if (pathname.includes('/login')) return 'Welcome back'
        if (pathname.includes('/forgot-password')) return 'Reset password'
        return 'Authentication'
    }

    return (
        <PageLayout hideFooter>
            {/* 
        ========================================
        PAGE OFFSET - Single source of truth
        ========================================
        pt-14/sm:pt-16: Offsets fixed navbar
        This matches the Tours page pattern
      */}
            <div className="pt-14 sm:pt-16 min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex flex-col">

                {/* ========================================
            BACK BUTTON (Optional)
            ========================================
            Only shown on desktop, helps navigation
        */}
                {!hideBackButton && (
                    <div className="container-safe mx-auto max-w-7xl pt-4 sm:pt-6">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span>Back to Home</span>
                        </Link>
                    </div>
                )}

                {/* ========================================
            MAIN CONTENT - Centered
            ========================================
            flex-1: Pushes footer down
            flex-col: Stack children vertically
            justify-center: Center vertically
        */}
                <div className="flex-1 flex flex-col justify-center py-8 sm:py-12">

                    {/* ========================================
              PAGE TITLE (Screen reader only)
              ========================================
              Hidden visually but available for accessibility
          */}
                    <h1 className="sr-only">{getPageTitle()}</h1>

                    {/* ========================================
              CHILDREN - The actual auth page content
              ========================================
              Each page (signup, login) provides its own
              container and max-width constraints
          */}
                    {children}
                </div>

                {/* ========================================
            BRANDING FOOTER - Minimal
            ========================================
            Not the main site footer - just a small brand reminder
        */}
                <div className="py-4 text-center border-t border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} SafariHub Travel Marketplace
                    </p>
                </div>
            </div>
        </PageLayout>
    )
}

// ============================================================================
// USAGE NOTES:
// ============================================================================
//
// ✅ CORRECT USAGE:
// export default function SignupPage() {
//   return (
//     <AuthLayout>
//       <SignupForm />
//     </AuthLayout>
//   )
// }
//
// WHY THIS APPROACH:
// 1. Consistent spacing across all auth pages
// 2. No footer distraction during signup/login
// 3. Easy to add common elements (back button, logo)
// 4. Maintains navbar for navigation
//
// ============================================================================