// ============================================================================
// LOGIN PAGE - ERROR BOUNDARY
// ============================================================================
// LOCATION: /frontend/src/app/auth/login/error.tsx
// 
// PURPOSE: Graceful error handling for login page
// ============================================================================

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

interface ErrorProps {
 error: Error & { digest?: string }
 reset: () => void
}

export default function LoginError({ error, reset }: ErrorProps) {
 const router = useRouter()

 useEffect(() => {
 console.error('[Login Error]:', {
 message: error.message,
 digest: error.digest,
 stack: error.stack
 })
 }, [error])

 return (
 <div className="container-safe mx-auto max-w-lg py-16 sm:py-24">
 <div className="text-center space-y-8">
 
 {/* Error Icon */}
 <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto">
 <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
 </div>

 {/* Error Message */}
 <div className="space-y-3">
 <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">
 Login Failed
 </h1>
 <p className="text-sm sm:text-base text-theme-secondary max-w-md mx-auto">
 We couldn't load the login page. Please try again or come back later.
 </p>
 
 {error.digest && (
 <p className="text-xs font-mono text-theme-muted pt-2">
 Error ID: {error.digest}
 </p>
 )}
 </div>

 {/* Action Buttons */}
 <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
 <button
 onClick={reset}
 className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-xl hover:bg-primary-light-hover dark:hover:bg-primary-light-hover transition-colors shadow-lg hover:shadow-xl"
 >
 <RefreshCw className="w-4 h-4" />
 Try Again
 </button>

 <button
 onClick={() => router.back()}
 className="inline-flex items-center justify-center gap-2 px-6 py-3 surface-section text-theme-secondary font-semibold rounded-xl hover:surface-section dark:hover:surface-section transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 Go Back
 </button>

 <Link
 href="/"
 className="inline-flex items-center justify-center gap-2 px-6 py-3 surface-card border border-theme text-theme-secondary font-semibold rounded-xl hover:surface-section dark:hover:surface-card transition-colors"
 >
 <Home className="w-4 h-4" />
 Home
 </Link>
 </div>

 {/* Support Link */}
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