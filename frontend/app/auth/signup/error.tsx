'use client'

// ============================================================================
// SIGNUP PAGE - ERROR BOUNDARY
// ============================================================================
// LOCATION: /frontend/src/app/auth/signup/error.tsx
// 
// PURPOSE: Graceful error handling for signup page
// 
// WHY THIS FILE EXISTS:
// ---------------------
// 1. Next.js 15+ automatically catches errors in the page component
// 2. Prevents white screen of death
// 3. Provides user-friendly error messages
// 4. Gives recovery options (retry, go back)
// 
// PHASE 1: Basic error handling
// PHASE 3: More sophisticated error handling with auth-specific messages
// ============================================================================

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

interface ErrorProps {
 /** Error object thrown from the page */
 error: Error & { digest?: string }

 /** Function to reset the error boundary and retry */
 reset: () => void
}

export default function SignupError({ error, reset }: ErrorProps) {
 const router = useRouter()

 // ========================================
 // LOG ERROR TO MONITORING SERVICE
 // ========================================
 // In Phase 3: Send to Sentry/LogRocket with auth context
 // For Phase 1: Console error only
 // ========================================
 useEffect(() => {
 console.error('[Signup Error]:', {
 message: error.message,
 digest: error.digest,
 stack: error.stack,
 page: 'signup'
 })
 }, [error])

 return (
 <div className="container-safe mx-auto max-w-lg py-16 sm:py-24">
 <div className="text-center space-y-8">

 {/* ========================================
 ERROR ICON
 ======================================== */}
 <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto">
 <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
 </div>

 {/* ========================================
 ERROR MESSAGE
 ======================================== */}
 <div className="space-y-3">
 <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">
 Something went wrong
 </h1>

 <p className="text-sm sm:text-base text-theme-secondary max-w-md mx-auto">
 We couldn't load the signup page. Please try again or come back later.
 </p>

 {/* Error digest (for support) */}
 {error.digest && (
 <p className="text-xs font-mono text-theme-muted pt-2">
 Error ID: {error.digest}
 </p>
 )}
 </div>

 {/* ========================================
 ACTION BUTTONS
 ======================================== */}
 <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
 {/* Retry button */}
 <button
 onClick={reset}
 className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-xl hover:bg-primary-light-hover dark:hover:bg-primary-light-hover transition-colors shadow-lg hover:shadow-xl"
 >
 <RefreshCw className="w-4 h-4" />
 Try Again
 </button>

 {/* Go back */}
 <button
 onClick={() => router.back()}
 className="inline-flex items-center justify-center gap-2 px-6 py-3 surface-section text-theme-secondary font-semibold rounded-xl hover:surface-section dark:hover:surface-section transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 Go Back
 </button>

 {/* Home */}
 <Link
 href="/"
 className="inline-flex items-center justify-center gap-2 px-6 py-3 surface-card border border-theme text-theme-secondary font-semibold rounded-xl hover:surface-section dark:hover:surface-card transition-colors"
 >
 <Home className="w-4 h-4" />
 Home
 </Link>
 </div>

 {/* ========================================
 SUPPORT LINK
 ======================================== */}
 <p className="text-xs text-theme-muted pt-4">
 If this problem persists,{' '}
 <Link
 href="/contact"
 className="text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline font-medium"
 >
 contact support
 </Link>
 </p>
 </div>
 </div>
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
// - 404 errors will be handled by not-found.tsx (if we create one)
// - This file handles all other errors (500, network, etc.)
// ============================================================================