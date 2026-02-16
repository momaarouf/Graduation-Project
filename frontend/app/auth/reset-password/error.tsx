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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Reset Failed
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        We couldn't reset your password. The link may have expired.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Link
                        href="/auth/forgot-password"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Request New Link
                    </Link>
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}