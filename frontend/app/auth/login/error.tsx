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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Login Failed
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        We couldn't load the login page. Please try again or come back later.
                    </p>
                    
                    {error.digest && (
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-500 pt-2">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                </div>

                {/* Support Link */}
                <p className="text-xs text-gray-500 dark:text-gray-500 pt-4">
                    If this problem persists,{' '}
                    <Link
                        href="/contact"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                        contact support
                    </Link>
                </p>
            </div>
        </div>
    )
}