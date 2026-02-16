// ============================================================================
// TERMS AGREEMENT FORM - STEP 5 (FINAL STEP)
// ============================================================================
// LOCATION: /frontend/src/components/auth/TermsAgreement.tsx
// 
// PURPOSE: Final step where users agree to legal terms and complete signup
// 
// BUSINESS REQUIREMENTS:
// ✓ Terms of Service agreement (required)
// ✓ Privacy Policy agreement (required)
// ✓ Newsletter opt-in (optional)
// ✓ Marketing communications opt-in (optional)
// ✓ Age verification
// ✓ Consent for data processing
// 
// FEATURES:
// - Checkbox agreements with links to full documents
// - Expandable terms summary
// - Consent management
// - Loading state for submission
// - Success/error feedback
// - Dual theme support
// - Mobile responsive
// ============================================================================

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    CheckCircle,
    AlertCircle,
    FileText,
    Mail,
    Shield,
    Users,
    ChevronDown,
    ChevronUp,
    Loader2,
    Heart,
    Sparkles
} from 'lucide-react'
import { useSignup } from '@/src/lib/contexts/SignupContext'
import { UserRole } from '@/src/types/auth.types'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TermsAgreementProps {
    /** Callback when form is successfully submitted */
    onSubmit: () => Promise<void>
    /** Callback to go back to previous step */
    onBack: () => void
    /** Is the form currently submitting */
    isSubmitting?: boolean
}

// ============================================================================
// CONSTANTS - Terms Sections
// ============================================================================

const TERMS_SECTIONS = [
    {
        id: 'account',
        title: 'Account Terms',
        content: `
            • You must be at least 18 years old to create an account
            • You are responsible for maintaining account security
            • You must provide accurate and complete information
            • One person per account - sharing is not permitted
            • You are responsible for all activity under your account
        `
    },
    {
        id: 'bookings',
        title: 'Booking & Payments',
        content: `
            • All payments are processed securely through our platform
            • Cancellation policies apply as shown on each tour
            • Refunds are processed according to our cancellation policy
            • Platform fees are non-refundable
            • Disputes are handled through our resolution center
        `
    },
    {
        id: 'conduct',
        title: 'User Conduct',
        content: `
            • Treat all users with respect and courtesy
            • No harassment, discrimination, or inappropriate behavior
            • Follow local laws and customs during tours
            • Report any concerns to our support team
            • We reserve the right to suspend accounts violating terms
        `
    },
    {
        id: 'privacy',
        title: 'Privacy & Data',
        content: `
            • Your data is encrypted and securely stored
            • We never sell your personal information
            • You can request data deletion at any time
            • Cookies are used to improve your experience
            • Read our Privacy Policy for full details
        `
    }
] as const

// ============================================================================
// BENEFITS FOR EACH ROLE
// ============================================================================

const TRAVELER_BENEFITS = [
    { icon: Shield, text: 'Verified guides for your safety' },
    { icon: Heart, text: 'Halal-friendly tour options' },
    { icon: Users, text: 'Group discounts available' },
    { icon: Sparkles, text: 'Loyalty rewards program' }
]

const GUIDE_BENEFITS = [
    { icon: Shield, text: 'ID verification builds trust' },
    { icon: Heart, text: 'Reach Muslim travelers globally' },
    { icon: Users, text: 'Community of expert guides' },
    { icon: Sparkles, text: 'Tiered fee structure' }
]

// ============================================================================
// TERMS SECTION COMPONENT
// ============================================================================

interface TermsSectionProps {
    section: typeof TERMS_SECTIONS[number]
    isExpanded: boolean
    onToggle: () => void
}

function TermsSection({ section, isExpanded, onToggle }: TermsSectionProps) {
    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
                className="
                    w-full
                    flex items-center justify-between
                    px-4 py-3
                    bg-gray-50 dark:bg-gray-800/50
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    transition-colors
                    text-left
                "
            >
                <span className="font-medium text-gray-900 dark:text-white">
                    {section.title}
                </span>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
            </button>
            
            {isExpanded && (
                <div className="p-4 bg-white dark:bg-gray-900">
                    <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-sans">
                        {section.content}
                    </pre>
                </div>
            )}
        </div>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TermsAgreement({ 
    onSubmit, 
    onBack, 
    isSubmitting = false 
}: TermsAgreementProps) {
    const { data, updateField, errors } = useSignup()
    
    // ========================================
    // STATE
    // ========================================
    const [expandedSections, setExpandedSections] = useState<string[]>([])
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // ========================================
    // DERIVED VALUES
    // ========================================
    const isTraveler = data.role === UserRole.TRAVELER
    const benefits = isTraveler ? TRAVELER_BENEFITS : GUIDE_BENEFITS

    // ========================================
    // HANDLERS
    // ========================================

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        )
    }

    const handleCheckboxChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        updateField(field as keyof typeof data, e.target.checked)
        setTouched(prev => ({ ...prev, [field]: true }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Mark all checkboxes as touched
        setTouched({
            agreedToTerms: true,
            agreedToPrivacy: true
        })

        // Check if required agreements are checked
        if (!data.agreedToTerms || !data.agreedToPrivacy) {
            return
        }

        await onSubmit()
    }

    // ========================================
    // RENDER
    // ========================================

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-2xl mx-auto"
        >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-6 sm:p-8">
                
                {/* ========================================
                    FORM HEADER
                    ======================================== */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Almost There!
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Just a few legal things before you start your journey
                    </p>
                </div>

                {/* ========================================
                    WELCOME CARD (Role-specific)
                    ======================================== */}
                <div className="
                    mb-6 p-4
                    bg-gradient-to-br from-blue-50 to-indigo-50
                    dark:from-blue-950/30 dark:to-indigo-950/30
                    border border-blue-200 dark:border-blue-800
                    rounded-xl
                ">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                        Welcome, {data.firstName}! 🎉
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        You're about to join our community of {isTraveler ? 'travelers' : 'guides'}. 
                        Here's what you can expect:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon
                            return (
                                <div key={index} className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                                    <Icon className="w-3 h-3" />
                                    <span>{benefit.text}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* ========================================
                        TERMS SECTIONS (Expandable)
                        ======================================== */}
                    <div className="space-y-3">
                        {TERMS_SECTIONS.map((section) => (
                            <TermsSection
                                key={section.id}
                                section={section}
                                isExpanded={expandedSections.includes(section.id)}
                                onToggle={() => toggleSection(section.id)}
                            />
                        ))}
                    </div>

                    {/* ========================================
                        REQUIRED AGREEMENTS
                        ======================================== */}
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        
                        {/* Terms of Service */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={data.agreedToTerms}
                                    onChange={handleCheckboxChange('agreedToTerms')}
                                    className="peer absolute opacity-0 w-4 h-4 cursor-pointer"
                                    aria-label="I agree to the Terms of Service"
                                />
                                <div className={`
                                    w-4 h-4 border rounded transition-all duration-200 flex items-center justify-center
                                    ${data.agreedToTerms
                                        ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
                                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-600'
                                    }
                                    ${errors.agreedToTerms && touched.agreedToTerms ? 'border-red-500' : ''}
                                `}>
                                    {data.agreedToTerms && (
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                </div>
                            </div>
                            <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                                I agree to the{' '}
                                <Link
                                    href="/terms"
                                    target="_blank"
                                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    Terms of Service
                                </Link>{' '}
                                and confirm that I am at least 18 years old.
                            </span>
                        </label>

                        {/* Privacy Policy */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={data.agreedToPrivacy}
                                    onChange={handleCheckboxChange('agreedToPrivacy')}
                                    className="peer absolute opacity-0 w-4 h-4 cursor-pointer"
                                    aria-label="I agree to the Privacy Policy"
                                />
                                <div className={`
                                    w-4 h-4 border rounded transition-all duration-200 flex items-center justify-center
                                    ${data.agreedToPrivacy
                                        ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
                                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-600'
                                    }
                                    ${errors.agreedToPrivacy && touched.agreedToPrivacy ? 'border-red-500' : ''}
                                `}>
                                    {data.agreedToPrivacy && (
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                </div>
                            </div>
                            <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                                I agree to the{' '}
                                <Link
                                    href="/privacy"
                                    target="_blank"
                                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    Privacy Policy
                                </Link>{' '}
                                and consent to the processing of my data.
                            </span>
                        </label>
                    </div>

                    {/* ========================================
                        OPTIONAL AGREEMENTS
                        ======================================== */}
                    <div className="space-y-3 pt-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Communication Preferences (Optional)
                        </p>

                        {/* Newsletter */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={data.newsletterOptIn}
                                    onChange={handleCheckboxChange('newsletterOptIn')}
                                    className="peer absolute opacity-0 w-4 h-4 cursor-pointer"
                                    aria-label="Subscribe to newsletter"
                                />
                                <div className={`
                                    w-4 h-4 border rounded transition-all duration-200 flex items-center justify-center
                                    ${data.newsletterOptIn
                                        ? 'bg-amber-600 dark:bg-amber-500 border-amber-600 dark:border-amber-500'
                                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-600'
                                    }
                                `}>
                                    {data.newsletterOptIn && (
                                        <Mail className="w-3 h-3 text-white" />
                                    )}
                                </div>
                            </div>
                            <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                                Send me travel tips, exclusive offers, and updates
                                <span className="block text-xs text-gray-500 dark:text-gray-500">
                                    You can unsubscribe anytime
                                </span>
                            </span>
                        </label>

                        {/* Marketing Communications */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={data.marketingOptIn}
                                    onChange={handleCheckboxChange('marketingOptIn')}
                                    className="peer absolute opacity-0 w-4 h-4 cursor-pointer"
                                    aria-label="Receive marketing communications"
                                />
                                <div className={`
                                    w-4 h-4 border rounded transition-all duration-200 flex items-center justify-center
                                    ${data.marketingOptIn
                                        ? 'bg-purple-600 dark:bg-purple-500 border-purple-600 dark:border-purple-500'
                                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-600'
                                    }
                                `}>
                                    {data.marketingOptIn && (
                                        <Sparkles className="w-3 h-3 text-white" />
                                    )}
                                </div>
                            </div>
                            <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                                Receive partner offers and promotions
                                <span className="block text-xs text-gray-500 dark:text-gray-500">
                                    From selected partners (never spam)
                                </span>
                            </span>
                        </label>
                    </div>

                    {/* ========================================
                        ERROR MESSAGE
                        ======================================== */}
                    {(errors.agreedToTerms || errors.agreedToPrivacy) && 
                     (touched.agreedToTerms || touched.agreedToPrivacy) && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700 dark:text-red-300">
                                Please agree to both the Terms of Service and Privacy Policy to continue.
                            </p>
                        </div>
                    )}

                    {/* ========================================
                        FORM ACTIONS
                        ======================================== */}
                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="
                                flex-1
                                px-4 py-2.5
                                bg-gray-100 dark:bg-gray-800
                                text-gray-700 dark:text-gray-300
                                font-medium
                                rounded-lg
                                hover:bg-gray-200 dark:hover:bg-gray-700
                                transition-colors
                                disabled:opacity-50 disabled:cursor-not-allowed
                                focus:outline-none focus:ring-2 focus:ring-gray-500/20
                            "
                        >
                            Back
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || !data.agreedToTerms || !data.agreedToPrivacy}
                            className="
                                flex-1
                                px-4 py-2.5
                                bg-gradient-to-r from-emerald-600 to-green-600
                                dark:from-emerald-700 dark:to-green-700
                                text-white font-medium
                                rounded-lg
                                hover:from-emerald-700 hover:to-green-700
                                dark:hover:from-emerald-800 dark:hover:to-green-800
                                transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed
                                focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                                flex items-center justify-center gap-2
                            "
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Complete Signup</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* ========================================
                        GDPR NOTE
                        ======================================== */}
                    <p className="text-xs text-center text-gray-500 dark:text-gray-500 pt-4">
                        <Shield className="inline w-3 h-3 mr-1" />
                        Your data is protected under GDPR. You can request deletion anytime.
                    </p>
                </form>
            </div>
        </motion.div>
    )
}