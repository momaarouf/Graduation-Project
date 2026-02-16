// ============================================================================
// AUTH LAYOUT - FIXED BACKGROUND
// ============================================================================

'use client'

import { ReactNode } from 'react'
import PageLayout from '@/src/components/layout/PageLayout'
import { usePathname } from 'next/navigation'

interface AuthLayoutProps {
    children: ReactNode
    /** Pages can choose to hide the back button */
    hideBackButton?: boolean
}

export default function AuthLayout({ 
    children, 
    hideBackButton = false 
}: AuthLayoutProps) {
    const pathname = usePathname()

    const getPageTitle = () => {
        if (pathname.includes('/signup')) return 'Create your account'
        if (pathname.includes('/login')) return 'Welcome back'
        if (pathname.includes('/forgot-password')) return 'Reset password'
        if (pathname.includes('/reset-password')) return 'Set new password'
        return 'Authentication'
    }

    return (
        <PageLayout>
            {/* 
                ========================================
                FIXED: min-h-screen on the gradient container
                This ensures gradient stretches full height
                while maintaining flex structure
                ========================================
            */}
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
                
                {/* Screen Reader Title */}
                <h1 className="sr-only">{getPageTitle()}</h1>

                {/* 
                    ========================================
                    Main Content Area
                    Pages add their own padding (pt-14)
                    ========================================
                */}
                <div className="flex-1 flex flex-col">
                    {children}
                </div>
            </div>
        </PageLayout>
    )
}