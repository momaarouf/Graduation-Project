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
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    CheckCircle,
    AlertCircle,
    Mail,
    Shield,
    ChevronDown,
    ChevronUp,
    Heart,
    Users,
    Sparkles
} from 'lucide-react'
import { useSignup } from '@/src/lib/contexts/SignupContext'
import { UserRole } from '@/src/types/auth.types'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TermsAgreementProps {
  onSubmit: () => Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string>;
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
        <div className="bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300">
            <button
                type="button"
                onClick={onToggle}
                className="
                    w-full
                    flex items-center justify-between
                    px-5 py-4
                    hover:bg-white/40 dark:hover:bg-gray-800/40
                    transition-all duration-300
                    text-left
                "
            >
                <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isExpanded ? 'bg-blue-600 scale-125' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {section.title}
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-blue-600" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
            </button>
            
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="px-5 pb-5 pt-1">
                            <ul className="space-y-2">
                                {section.content.trim().split('\n').map((line, i) => (
                                    <li key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-start gap-2">
                                        <div className="mt-1 flex-shrink-0 w-1 h-1 rounded-full bg-blue-600/30" />
                                        {line.replace('•', '').trim()}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TermsAgreement({ 
    onSubmit, 
    onBack, 
    isSubmitting = false ,
    serverErrors = {}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-2xl mx-auto"
        >
            <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-3xl p-8 shadow-xl shadow-blue-600/5 items-center flex flex-col">
                
                {/* Icon Header */}
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Shield className="w-10 h-10" strokeWidth={1.5} />
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                        Almost There!
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Just a few legal things before you start your adventure.
                    </p>
                </div>

                {/* Role-Specific Benefits - Glassmorphism */}
                <div className="w-full mb-10 p-6 bg-blue-600/5 border border-blue-600/10 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/20 transition-colors" />
                    
                    <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                        <Sparkles size={14} />
                        Welcome, {data.firstName}!
                    </h3>
                    
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-6">
                        You're joining our community as a {isTraveler ? 'Traveler' : 'Guide'}. 
                        Here's what awaits you:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon
                            return (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3 p-3 bg-white/40 dark:bg-gray-800/40 border border-white/20 dark:border-gray-700/50 rounded-xl"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
                                        <Icon size={16} strokeWidth={2} />
                                    </div>
                                    <span className="text-xs font-black text-gray-600 dark:text-gray-400 tracking-wide">{benefit.text}</span>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-8">
                    {/* Expandable Terms Summary */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1 mb-2">
                            Summary of Terms
                        </label>
                        <div className="grid gap-3">
                            {TERMS_SECTIONS.map((section) => (
                                <TermsSection
                                    key={section.id}
                                    section={section}
                                    isExpanded={expandedSections.includes(section.id)}
                                    onToggle={() => toggleSection(section.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Checkbox Agreements */}
                    <div className="space-y-4 pt-6 border-t border-white/10">
                        {/* Terms of Service */}
                        <label className="flex items-start gap-4 p-4 bg-white/20 dark:bg-gray-800/20 border border-white/10 dark:border-gray-700/30 rounded-2xl cursor-pointer group hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={data.agreedToTerms}
                                    onChange={handleCheckboxChange('agreedToTerms')}
                                    className="peer absolute opacity-0 w-6 h-6 cursor-pointer"
                                />
                                <div className={`
                                    w-6 h-6 border-2 rounded-lg transition-all duration-300 flex items-center justify-center
                                    ${data.agreedToTerms
                                        ? 'bg-blue-600 border-blue-600 scale-110 shadow-lg shadow-blue-600/30'
                                        : 'bg-white/50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'
                                    }
                                    ${errors.agreedToTerms && touched.agreedToTerms ? 'border-red-500' : ''}
                                `}>
                                    {data.agreedToTerms && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    I agree to the Terms of Service
                                </p>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Confirming you're 18+ and accept our <Link href="/terms" className="text-blue-600 hover:underline">legal framework</Link>.
                                </p>
                            </div>
                        </label>

                        {/* Privacy Policy */}
                        <label className="flex items-start gap-4 p-4 bg-white/20 dark:bg-gray-800/20 border border-white/10 dark:border-gray-700/30 rounded-2xl cursor-pointer group hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={data.agreedToPrivacy}
                                    onChange={handleCheckboxChange('agreedToPrivacy')}
                                    className="peer absolute opacity-0 w-6 h-6 cursor-pointer"
                                />
                                <div className={`
                                    w-6 h-6 border-2 rounded-lg transition-all duration-300 flex items-center justify-center
                                    ${data.agreedToPrivacy
                                        ? 'bg-blue-600 border-blue-600 scale-110 shadow-lg shadow-blue-600/30'
                                        : 'bg-white/50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'
                                    }
                                    ${errors.agreedToPrivacy && touched.agreedToPrivacy ? 'border-red-500' : ''}
                                `}>
                                    {data.agreedToPrivacy && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    I accept the Privacy Policy
                                </p>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Consenting to how we <Link href="/privacy" className="text-blue-600 hover:underline">handle and protect</Link> your data.
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Communication Opt-ins */}
                    <div className="space-y-4 pt-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                            Preferences (Optional)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-3 bg-white/10 dark:bg-gray-800/10 border border-white/5 rounded-xl cursor-pointer hover:bg-white/20 transition-all duration-300">
                                <input
                                    type="checkbox"
                                    checked={data.newsletterOptIn}
                                    onChange={handleCheckboxChange('newsletterOptIn')}
                                    className="peer absolute opacity-0 w-4 h-4 cursor-pointer"
                                />
                                <div className={`
                                    w-5 h-5 border-2 rounded-md transition-all flex items-center justify-center
                                    ${data.newsletterOptIn ? 'bg-amber-500 border-amber-500 scale-110' : 'border-gray-300 dark:border-gray-700'}
                                `}>
                                    {data.newsletterOptIn && <Mail className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">Newsletter</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white/10 dark:bg-gray-800/10 border border-white/5 rounded-xl cursor-pointer hover:bg-white/20 transition-all duration-300">
                                <input
                                    type="checkbox"
                                    checked={data.marketingOptIn}
                                    onChange={handleCheckboxChange('marketingOptIn')}
                                    className="peer absolute opacity-0 w-4 h-4 cursor-pointer"
                                />
                                <div className={`
                                    w-5 h-5 border-2 rounded-md transition-all flex items-center justify-center
                                    ${data.marketingOptIn ? 'bg-purple-500 border-purple-500 scale-110' : 'border-gray-300 dark:border-gray-700'}
                                `}>
                                    {data.marketingOptIn && <Sparkles className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">Marketing</span>
                            </label>
                        </div>
                    </div>

                    {/* Server/Validation Errors */}
                    {(errors.agreedToTerms || errors.agreedToPrivacy || serverErrors?.general) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3"
                        >
                            <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs font-bold text-red-600 dark:text-red-400">
                                {serverErrors?.general || "Please agree to both terms and privacy policy to continue."}
                            </p>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="flex-1 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50"
                        >
                            Back
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || !data.agreedToTerms || !data.agreedToPrivacy}
                            className={`
                                flex-[1.5] py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group
                                ${data.agreedToTerms && data.agreedToPrivacy
                                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Complete Signup
                                    <CheckCircle size={14} className="group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center justify-center gap-2 opacity-50">
                        <Shield size={12} />
                        Secured by SafariHub Trust™
                    </p>
                </form>
            </div>
        </motion.div>
    )
}