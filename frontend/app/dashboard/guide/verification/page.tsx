// ============================================================================
// GUIDE VERIFICATION PAGE - SHOW VERIFICATION STATUS
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/verification/page.tsx
// 
// PURPOSE: Display verification status and documents after guide signup
// 
// FEATURES:
// - Shows current verification status (pending/approved/rejected)
// - Displays uploaded documents
// - Explains the 24-48 hour review process
// - Allows resubmission if rejected
// - Links to guide dashboard
// ============================================================================

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Camera,
    FileText,
    Award,
    ChevronRight,
    Download,
    Eye,
    RefreshCw,
    Home
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type VerificationStatus = 'pending' | 'approved' | 'rejected'

interface VerificationDocument {
    id: string
    type: 'id' | 'selfie' | 'certificate'
    name: string
    url: string
    uploadedAt: string
}

// ============================================================================
// MOCK DATA - Phase 1
// In Phase 2, this will come from API
// ============================================================================

const MOCK_VERIFICATION_DATA = {
    status: 'pending' as VerificationStatus,
    submittedAt: '2026-02-16T10:30:00Z',
    estimatedCompletion: '2026-02-18T10:30:00Z',
    documents: [
        {
            id: 'doc1',
            type: 'id' as const,
            name: 'Passport - Front.pdf',
            url: '/docs/passport-front.jpg',
            uploadedAt: '2026-02-16T10:25:00Z'
        },
        {
            id: 'doc2',
            type: 'id' as const,
            name: 'Passport - Back.pdf',
            url: '/docs/passport-back.jpg',
            uploadedAt: '2026-02-16T10:25:00Z'
        },
        {
            id: 'doc3',
            type: 'selfie' as const,
            name: 'Selfie with ID.jpg',
            url: '/docs/selfie.jpg',
            uploadedAt: '2026-02-16T10:28:00Z'
        }
    ],
    reviewerNotes: '',
    rejectionReason: ''
}

// ============================================================================
// STATUS CARD COMPONENT
// ============================================================================

interface StatusCardProps {
    status: VerificationStatus
    submittedAt: string
    estimatedCompletion?: string
}

function StatusCard({ status, submittedAt, estimatedCompletion }: StatusCardProps) {
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
        }
    }

    const config = statusConfig[status]
    const Icon = config.icon
    const submittedDate = new Date(submittedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })

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
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Submitted: {submittedDate}</span>
                    </div>
                    {estimatedCompletion && status === 'pending' && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Estimated completion:{' '}
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(estimatedCompletion).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// DOCUMENT CARD COMPONENT
// ============================================================================

interface DocumentCardProps {
    document: VerificationDocument
}

function DocumentCard({ document }: DocumentCardProps) {
    const getIcon = () => {
        switch (document.type) {
            case 'id':
                return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            case 'selfie':
                return <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            case 'certificate':
                return <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        }
    }

    const getTypeLabel = () => {
        switch (document.type) {
            case 'id':
                return 'ID Document'
            case 'selfie':
                return 'Selfie with ID'
            case 'certificate':
                return 'Certificate'
        }
    }

    return (
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {getIcon()}
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                            {getTypeLabel()}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {document.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => window.open(document.url, '_blank')}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Preview"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {/* Download logic in Phase 2 */}}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// REJECTION MESSAGE COMPONENT
// ============================================================================

interface RejectionMessageProps {
    reason: string
}

function RejectionMessage({ reason }: RejectionMessageProps) {
    return (
        <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                        Rejection Reason
                    </h3>
                    <p className="text-red-700 dark:text-red-400 mb-4">
                        {reason}
                    </p>
                    <Link
                        href="/dashboard/guide/verification/resubmit"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Resubmit Documents
                    </Link>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideVerificationPage() {
    const router = useRouter()
    const [verification] = useState(MOCK_VERIFICATION_DATA)

    // In Phase 2: Fetch real data from API
    // useEffect(() => {
    //     fetchVerificationStatus().then(setVerification)
    // }, [])

    const handleContactSupport = () => {
        // In Phase 2: Open support chat or email
        router.push('/contact')
    }

    const handleGoToDashboard = () => {
        router.push('/dashboard/guide')
    }

    return (
        <PageLayout>
            {/* Page offset */}
            <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
                
                <div className="container-safe mx-auto max-w-4xl py-8 sm:py-10">
                    
                    {/* ========================================
                        HEADER
                        ======================================== */}
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

                    {/* ========================================
                        STATUS CARD
                        ======================================== */}
                    <div className="mb-8">
                        <StatusCard
                            status={verification.status}
                            submittedAt={verification.submittedAt}
                            estimatedCompletion={verification.estimatedCompletion}
                        />
                    </div>

                    {/* ========================================
                        REJECTION MESSAGE (if rejected)
                        ======================================== */}
                    {verification.status === 'rejected' && verification.rejectionReason && (
                        <div className="mb-8">
                            <RejectionMessage reason={verification.rejectionReason} />
                        </div>
                    )}

                    {/* ========================================
                        DOCUMENTS SECTION
                        ======================================== */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Submitted Documents
                        </h2>
                        <div className="space-y-3">
                            {verification.documents.map((doc) => (
                                <DocumentCard key={doc.id} document={doc} />
                            ))}
                        </div>
                    </div>

                    {/* ========================================
                        WHAT HAPPENS NEXT
                        ======================================== */}
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

                    {/* ========================================
                        ACTION BUTTONS
                        ======================================== */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {verification.status === 'approved' ? (
                            <button
                                onClick={handleGoToDashboard}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Go to Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleContactSupport}
                                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Contact Support
                                </button>
                                <Link
                                    href="/dashboard/guide"
                                    className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-center"
                                >
                                    Back to Dashboard
                                </Link>
                            </>
                        )}
                    </div>

                    {/* ========================================
                        PRIVACY NOTE
                        ======================================== */}
                    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            <Shield className="inline w-3 h-3 mr-1" />
                            Your documents are encrypted and only used for verification. 
                            Never shared with travelers or third parties.
                        </p>
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}