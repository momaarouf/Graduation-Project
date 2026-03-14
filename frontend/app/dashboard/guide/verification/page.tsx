'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    ChevronRight,
    RefreshCw,
    Home,
    Loader2
} from 'lucide-react'
import { guideGetVerificationStatus, GuideVerificationStatusResponse } from '@/src/lib/api/auth'
import toast from 'react-hot-toast'

// ==================== STATUS CARD COMPONENT ====================

interface StatusCardProps {
    status: 'pending' | 'approved' | 'rejected' | 'not_submitted'
    submittedAt?: string
    verifiedAt?: string
}

function StatusCard({ status, submittedAt, verifiedAt }: StatusCardProps) {
    const statusConfig = {
        pending: {
            icon: Clock,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-50 dark:bg-amber-950/30',
            borderColor: 'border-amber-200 dark:border-amber-800',
            title: 'Verification Pending',
            message: 'Your documents are being reviewed by our team.',
            action: 'Typically takes 24-48 hours'
        },
        approved: {
            icon: CheckCircle,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
            borderColor: 'border-emerald-200 dark:border-emerald-800',
            title: 'Verification Approved',
            message: 'Your identity has been verified successfully!',
            action: 'You can now create tours'
        },
        rejected: {
            icon: XCircle,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-950/30',
            borderColor: 'border-red-200 dark:border-red-800',
            title: 'Verification Failed',
            message: 'We couldn\'t verify your documents.',
            action: 'Please resubmit with clear images'
        },
        not_submitted: {
            icon: AlertCircle,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-50 dark:bg-gray-950/30',
            borderColor: 'border-gray-200 dark:border-gray-800',
            title: 'Not Submitted',
            message: 'You haven\'t submitted your identity documents yet.',
            action: 'Start verification to unlock all features'
        }
    }

    const config = statusConfig[status]
    const Icon = config.icon
    
    // Use verifiedAt if approved, else submittedAt
    const displayDate = status === 'approved' ? verifiedAt : submittedAt

    return (
        <div className={`p-6 rounded-xl border ${config.bgColor} ${config.borderColor}`}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${config.bgColor} ${config.color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h2 className={`text-xl font-bold ${config.color} mb-1`}>
                        {config.title}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {config.message}
                    </p>
                    {displayDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{status === 'approved' ? 'Verified' : 'Submitted'}: {new Date(displayDate).toLocaleDateString()}</span>
                      </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ==================== MAIN PAGE ====================

export default function GuideVerificationPage() {
    const router = useRouter()
    const [status, setStatus] = useState<GuideVerificationStatusResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchStatus = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await guideGetVerificationStatus()
            setStatus(data)
        } catch (err) {
            toast.error('Failed to load verification status')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStatus()
    }, [fetchStatus])

    if (isLoading) {
      return (
        <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading status...</p>
        </div>
      )
    }

    if (!status) return null

    return (
        <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="container-safe mx-auto max-w-4xl py-8 sm:py-10 px-4">
                
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard/guide"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4 group"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                        <span>Back to Dashboard</span>
                    </Link>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Identity Verification
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Help us verify your identity to build trust with travelers
                    </p>
                </div>

                {/* Status Card */}
                <div className="mb-8">
                    <StatusCard
                        status={status.status}
                        submittedAt={status.submittedAt}
                        verifiedAt={status.verifiedAt}
                    />
                </div>

                {/* Rejection Message */}
                {status.status === 'rejected' && status.rejectionReason && (
                    <div className="mb-8 p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                                    Rejection Reason
                                </h3>
                                <p className="text-red-700 dark:text-red-400 mb-4">
                                    {status.rejectionReason}
                                </p>
                                <Link
                                    href="/dashboard/guide/verification/submit"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Resubmit Documents
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Not Submitted Case */}
                {status.status === 'not_submitted' && (
                  <div className="mb-8 p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm text-center">
                    <Shield className="w-16 h-16 text-blue-100 dark:text-blue-900/40 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unlock Your Potential</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Verifying your identity is the first step to becoming a trusted guide on our platform. 
                      It allows you to create tours, accept bookings, and earn payouts.
                    </p>
                    <Link
                      href="/dashboard/guide/verification/submit"
                      className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                      Start Verification
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                )}

                {/* What Happens Next */}
                {status.status !== 'approved' && status.status !== 'not_submitted' && (
                  <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          What happens next?
                      </h3>
                      <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                          <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span>Our team manually reviews your documents (24-48 hours)</span>
                          </li>
                          <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span>You'll receive an email notification once verified</span>
                          </li>
                          <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span>Once verified, you can create tours and start earning</span>
                          </li>
                      </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {status.status === 'approved' ? (
                        <button
                            onClick={() => router.push('/dashboard/guide')}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Go to Dashboard
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push('/dashboard/guide')}
                            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    )}
                </div>

                {/* Privacy Note */}
                <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                        <Shield className="w-3 h-3" />
                        Your documents are encrypted and only used for verification. 
                        Never shared with travelers or third parties.
                    </p>
                </div>
            </div>
        </div>
    )
}