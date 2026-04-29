// ============================================================================
// RESET PASSWORD PAGE
// ============================================================================
// LOCATION: /frontend/src/app/auth/reset-password/page.tsx
// 
// PURPOSE: Allow users to set a new password using reset token
// 
// FLOW:
// 1. Token from URL is validated
// 2. User enters new password and confirmation
// 3. Password strength indicator
// 4. Submit new password
// 5. Redirect to login on success
// 
// API READY:
// - Replace mock API call with real endpoint in Phase 3
// - Token validation will come from backend
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ChevronLeft, Shield, KeyRound } from 'lucide-react'
import AuthLayout from '@/app/auth/layout'
import ResetPasswordForm from '@/src/components/auth/ResetPasswordForm'
import ResetPasswordLoading from './loading'

export const metadata: Metadata = {
 title: 'Reset Password | SafariHub',
 description: 'Create a new password for your SafariHub account.',
 robots: {
 index: false,
 follow: false,
 }
}

// ============================================================================
// STATISTICS - Social Proof (minimal)
// ============================================================================

const STATISTICS = [
 { label: 'Happy Travelers', value: '15K+' },
 { label: 'Verified Guides', value: '1,200+' },
 { label: 'Secure Payments', value: '48h freeze' },
]

// ============================================================================
// MAIN PAGE
// ============================================================================

interface ResetPasswordPageProps {
 searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
 const { token } = await searchParams

 return (
 <AuthLayout hideBackButton={false}>
 <div className="container-safe mx-auto max-w-6xl pt-20 sm:pt-24 pb-8 sm:pb-12">
 
 {/* Back to Login */}
 <div className="mb-6">
 <Link
 href="/auth/login"
 className="inline-flex items-center gap-1.5 text-sm text-theme-secondary hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors group"
 >
 <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
 <span>Return to SafariHub</span>
 </Link>
 </div>

 {/* Two Column Layout */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
 
 {/* Left Column - Info (Desktop) */}
 <div className="hidden lg:block space-y-8 sticky top-24">
 
 {/* Header */}
 <div className="space-y-4">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-light/10 border border-blue-200 dark:border-blue-800 rounded-full">
 <KeyRound className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
 Create New Password
 </span>
 </div>
 
 <h1 className="text-3xl xl:text-4xl font-bold text-theme-primary">
 Set a new{' '}
 <span className="text-primary-light dark:text-primary-dark dark:text-primary-dark ">
 password
 </span>
 </h1>
 
 <p className="text-lg text-theme-secondary ">
 Choose a strong password that you haven't used before.
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
 <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
 <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
 <p className="text-sm text-amber-800 dark:text-amber-300">
 Reset codes expire in 15 minutes for security.
 </p>
 </div>
 </div>

 {/* Right Column - Form */}
 <div className="w-full max-w-lg mx-auto lg:mx-0">
 
 {/* Mobile Header */}
 <div className="lg:hidden text-center mb-8">
 <h1 className="text-2xl font-bold text-theme-primary mb-2">
 Reset Password
 </h1>
 <p className="text-sm text-theme-secondary ">
 Enter your new password below
 </p>
 </div>

 {/* Form with Suspense */}
 <Suspense fallback={<ResetPasswordLoading />}>
 <ResetPasswordForm token={token} />
 </Suspense>
 </div>
 </div>
 </div>
 </AuthLayout>
 )
}