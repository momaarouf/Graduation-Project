// ============================================================================
// TOUR DETAIL - ERROR BOUNDARY
// ============================================================================
// LOCATION: /frontend/src/app/tours/[id]/error.tsx
// 
// PURPOSE: Graceful error handling for tour detail page
// 
// WHY THIS FILE EXISTS:
// ---------------------
// 1. Next.js 15+ automatically catches errors in the page component
// 2. Prevents white screen of death
// 3. Provides user-friendly error messages
// 4. Gives recovery options (retry, go back)
// 
// ERROR TYPES HANDLED:
// -------------------
// 1. Network errors (API unavailable)
// 2. Tour not found (404) - handled by not-found.tsx
// 3. Authentication errors (401/403)
// 4. Rate limiting (429)
// 5. Server errors (500)
// ============================================================================

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageLayout from '@/src/components/layout/PageLayout'
import { 
  AlertCircle, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  Shield 
} from 'lucide-react'

interface ErrorProps {
  /** Error object thrown from the page */
  error: Error & { digest?: string }
  
  /** Function to reset the error boundary and retry */
  reset: () => void
}

export default function TourDetailError({ error, reset }: ErrorProps) {
  const router = useRouter()

  // ========================================
  // LOG ERROR TO MONITORING SERVICE
  // ========================================
  // In Phase 2: Send to Sentry/LogRocket
  // For Phase 1: Console error only
  // ========================================
  useEffect(() => {
    console.error('[TourDetail Error]:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack
    })
  }, [error])

  // ========================================
  // DETERMINE ERROR TYPE FROM STATUS CODE
  // ========================================
  // Check if error contains HTTP status
  const statusCode = error.message.includes('401') ? 401
    : error.message.includes('403') ? 403
    : error.message.includes('429') ? 429
    : error.message.includes('500') ? 500
    : error.message.includes('Network') ? 0
    : 500

  // ========================================
  // ERROR-SPECIFIC MESSAGES
  // ========================================
  type ErrorConfig = {
  title: string
  message: string
  icon: typeof AlertCircle
  action: string
} & (
  | { href: string; onClick?: never }      // Link variant
  | { onClick: () => void; href?: never }  // Button variant
)
  const errorConfig: Record<number, ErrorConfig> = {
    401: {
      title: 'Authentication Required',
      message: 'Please sign in to view this tour.',
      icon: Shield,
      action: 'Sign In',
      href: '/auth/login'
    },
    403: {
      title: 'Access Denied',
      message: 'You don\'t have permission to view this tour.',
      icon: Shield,
      action: 'Go Home',
      href: '/'
    },
    429: {
      title: 'Too Many Requests',
      message: 'Please wait a moment before trying again.',
      icon: AlertCircle,
      action: 'Try Again',
      onClick: reset
    },
    500: {
      title: 'Server Error',
      message: 'Something went wrong on our end. We\'re working on it.',
      icon: AlertCircle,
      action: 'Try Again',
      onClick: reset
    },
    0: {
      title: 'Network Error',
      message: 'Unable to connect. Please check your internet connection.',
      icon: AlertCircle,
      action: 'Refresh',
      onClick: () => window.location.reload()
    }
  }

  const config = errorConfig[statusCode as keyof typeof errorConfig] || errorConfig[500]

  return (
    <PageLayout>
      {/* ========================================
          PAGE OFFSET - Matches actual page
          ======================================== */}
      <div className="pt-14 sm:pt-16">
        <div className="container-safe mx-auto max-w-7xl">
          
          {/* ========================================
              CENTERED ERROR CARD
              ======================================== */}
          <div className="
            min-h-[70vh]
            flex items-center justify-center
            py-12
          ">
            <div className="
              max-w-md w-full
              text-center
              space-y-8
            ">
              {/* ========================================
                  ERROR ICON
                  ======================================== */}
              <div className="
                inline-flex items-center justify-center
                w-20 h-20
                bg-red-100 dark:bg-red-900/20
                rounded-full
                mx-auto
              ">
                <config.icon className="
                  w-10 h-10
                  text-red-600 dark:text-red-400
                " />
              </div>

              {/* ========================================
                  ERROR MESSAGE
                  ======================================== */}
              <div className="space-y-3">
                <h1 className="
                  text-2xl sm:text-3xl
                  font-bold
                  text-gray-900 dark:text-white
                ">
                  {config.title}
                </h1>
                
                <p className="
                  text-sm sm:text-base
                  text-gray-600 dark:text-gray-400
                  leading-relaxed
                ">
                  {config.message}
                </p>

                {/* Error digest (for support) */}
                {error.digest && (
                  <p className="
                    text-xs
                    font-mono
                    text-gray-500 dark:text-gray-500
                    pt-2
                  ">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>

              {/* ========================================
                  ACTION BUTTONS
                  ======================================== */}
              <div className="
                flex flex-col sm:flex-row
                gap-3
                justify-center
                pt-4
              ">
                {/* Primary action (retry/sign in) */}
                {'onClick' in config ? (
                  <button
                    onClick={config.onClick}
                    className="
                      inline-flex items-center justify-center
                      gap-2
                      px-6 py-3
                      bg-blue-600 dark:bg-blue-700
                      text-white
                      font-semibold
                      rounded-xl
                      hover:bg-blue-700 dark:hover:bg-blue-800
                      transition-colors
                      shadow-lg hover:shadow-xl
                    "
                  >
                    <RefreshCw className="w-4 h-4" />
                    {config.action}
                  </button>
                ) : (
                  <Link
                    href={config.href || '/'}
                    className="
                      inline-flex items-center justify-center
                      gap-2
                      px-6 py-3
                      bg-blue-600 dark:bg-blue-700
                      text-white
                      font-semibold
                      rounded-xl
                      hover:bg-blue-700 dark:hover:bg-blue-800
                      transition-colors
                      shadow-lg hover:shadow-xl
                    "
                  >
                    {config.action === 'Sign In' ? (
                      <Shield className="w-4 h-4" />
                    ) : (
                      <Home className="w-4 h-4" />
                    )}
                    {config.action}
                  </Link>
                )}

                {/* Secondary action (go back) */}
                <button
                  onClick={() => router.back()}
                  className="
                    inline-flex items-center justify-center
                    gap-2
                    px-6 py-3
                    bg-gray-100 dark:bg-gray-800
                    text-gray-700 dark:text-gray-300
                    font-semibold
                    rounded-xl
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    transition-colors
                  "
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </button>
              </div>

              {/* ========================================
                  SUPPORT LINK
                  ======================================== */}
              <p className="
                text-xs
                text-gray-500 dark:text-gray-500
                pt-4
              ">
                Need help?{' '}
                <Link
                  href="/contact"
                  className="
                    text-blue-600 dark:text-blue-400
                    hover:underline
                    font-medium
                  "
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

// ============================================================================
// USAGE NOTES:
// ============================================================================
// 
// 1. This file MUST be named 'error.tsx' exactly
// 2. Must be placed in the same directory as page.tsx
// 3. Must be a Client Component (hence 'use client')
// 4. Receives error and reset props automatically from Next.js
// 
// INTEGRATION WITH NOT-FOUND:
// ---------------------------
// - 404 errors should be handled by not-found.tsx
// - This file handles all other errors (500, network, auth)
// ============================================================================