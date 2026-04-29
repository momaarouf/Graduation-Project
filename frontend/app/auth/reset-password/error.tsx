'use client'

// ============================================================================
// RESET PASSWORD - ERROR BOUNDARY
// ============================================================================

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'

interface ErrorProps {
 error: Error & { digest?: string }
 reset: () => void
}

export default function ResetPasswordError({ error, reset }: ErrorProps) {
 useEffect(() => {
 console.error('[ResetPassword Error]:', error)
 }, [error])

 return (
 <div className="container-safe mx-auto max-w-lg py-16 sm:py-24">
 <div className="text-center space-y-8">
 
 {/* Icon */}
 <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto">
 <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
 </div>

 {/* Message */}
 <div className="space-y-3">
 <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">
 Reset Failed
 </h1>
 <p className="text-sm sm:text-base text-theme-secondary ">
 We couldn't reset your password. The link may have expired.
 </p>
 </div>

 {/* Actions */}
 <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
 <Link
 href="/auth/forgot-password"
 className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-light text-white font-semibold rounded-xl hover:bg-primary-light-hover transition-colors"
 >
 <RefreshCw className="w-4 h-4" />
 Request New Link
 </Link>
 <Link
 href="/auth/login"
 className="inline-flex items-center justify-center gap-2 px-6 py-3 surface-section text-theme-secondary font-semibold rounded-xl hover:surface-section dark:hover:surface-section transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 Back to Login
 </Link>
 </div>
 </div>
 </div>
 )
}