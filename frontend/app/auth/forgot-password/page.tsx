// ============================================================================
// FORGOT PASSWORD PAGE
// ============================================================================
// LOCATION: /frontend/src/app/auth/forgot-password/page.tsx
// 
// PURPOSE: Allow users to request password reset email
// 
// FLOW:
// 1. User enters email
// 2. System sends reset link (mocked in Phase 1)
// 3. Show success message with instructions
// 4. Link to return to login
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ChevronLeft, Shield, Mail } from 'lucide-react'
import AuthLayout from '@/app/auth/layout'
import ForgotPasswordForm from '@/src/components/auth/ForgotPasswordForm'
import ForgotPasswordLoading from './loading'

export const metadata: Metadata = {
 title: 'Forgot Password | SafariHub',
 description: 'Reset your SafariHub account password.',
 robots: {
 index: false, // Don't index auth pages
 follow: false,
 }
}

// ============================================================================
// STATISTICS - Social Proof (minimal version)
// ============================================================================

const STATISTICS = [
 { label: 'Happy Travelers', value: '15K+' },
 { label: 'Verified Guides', value: '1,200+' },
 { label: 'Cities', value: '24+' },
]

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ForgotPasswordPage() {
 return (
 <>
 <div className="container-safe mx-auto max-w-6xl pt-4 pb-8 sm:py-12">
 
 {/* Back to Login */}
 <div className="mb-6">
 <Link
 href="/auth/login"
 className="inline-flex items-center gap-1.5 text-sm text-theme-secondary hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors group"
 >
 <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
 <span>Back to Login</span>
 </Link>
 </div>

 {/* Two Column Layout */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
 
 {/* Left Column - Info (Desktop) */}
 <div className="hidden lg:block space-y-8 sticky top-24">
 
 {/* Header */}
 <div className="space-y-4">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-light/10 border border-blue-200 dark:border-blue-800 rounded-full">
 <Shield className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
 Account Recovery
 </span>
 </div>
 
 <h1 className="text-3xl xl:text-4xl font-bold text-theme-primary">
 Forgot your{' '}
 <span className="text-primary-light dark:text-primary-dark dark:text-primary-dark ">
 password?
 </span>
 </h1>
 
 <p className="text-lg text-theme-secondary ">
 No worries! Enter your email and we'll send you reset instructions.
 </p>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-3 gap-4">
 {STATISTICS.map((stat, index) => (
 <div key={index} className="p-4 surface-card border border-theme rounded-xl">
 <div className="text-xl font-bold text-theme-primary">
 {stat.value}
 </div>
 <div className="text-sm text-theme-muted ">
 {stat.label}
 </div>
 </div>
 ))}
 </div>

 {/* Security Note */}
 <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-3">
 <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
 <p className="text-sm text-emerald-800 dark:text-emerald-300">
 Check your spam folder if you don't see the email within 5 minutes.
 </p>
 </div>
 </div>

 {/* Right Column - Form */}
 <div className="w-full max-w-md mx-auto lg:mx-0">
 
 {/* Mobile Header */}
 <div className="lg:hidden text-center mb-6 sm:mb-8">
 <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-2">
 Forgot Password
 </h1>
 <p className="text-sm text-theme-muted font-medium">
 Enter your email to reset your password
 </p>
 </div>

 {/* Form with Suspense */}
 <Suspense fallback={<ForgotPasswordLoading />}>
 <ForgotPasswordForm />
 </Suspense>
 </div>
 </div>
 </div>
 </>
 )
}
