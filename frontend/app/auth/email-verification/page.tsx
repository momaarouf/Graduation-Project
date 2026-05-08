// ============================================================================
// EMAIL VERIFICATION PAGE
// ============================================================================
// LOCATION: /frontend/app/auth/email-verification/page.tsx
//
// PURPOSE: Allow users to verify their email address after signup
//
// FLOW:
// 1. User enters email
// 2. System sends verification code
// 3. User enters code received in email
// 4. Email verified - user can proceed
// ============================================================================

import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ChevronLeft, CheckCircle, Mail } from 'lucide-react';
import EmailVerificationForm from '@/src/components/auth/EmailVerificationForm';
import EmailVerificationLoading from './loading';

export const metadata: Metadata = {
 title: 'Verify Email | SafariHub',
 description: 'Verify your email address to activate your SafariHub account.',
 robots: {
 index: false, // Don't index auth pages
 follow: false,
 },
};

// ============================================================================
// STATISTICS - Social Proof
// ============================================================================

const STATISTICS = [
 { label: 'Happy Travelers', value: '15K+' },
 { label: 'Verified Guides', value: '1,200+' },
 { label: 'Cities', value: '24+' },
];

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function EmailVerificationPage() {
 return (
 <div className="container-safe mx-auto max-w-6xl pt-4 pb-8 sm:py-12">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
 {/* Left Column - Form */}
 <div className="space-y-6">
 {/* Back Button */}
 <Link
 href="/auth/login"
 className="inline-flex items-center space-x-2 text-theme-secondary hover:text-theme-primary dark:hover:text-white transition"
 >
 <ChevronLeft className="w-4 h-4" />
 <span>Back to Login</span>
 </Link>

 {/* Form */}
 <Suspense fallback={<EmailVerificationLoading />}>
 <EmailVerificationForm />
 </Suspense>
 </div>

 {/* Right Column - Info & Social Proof (Desktop Only) */}
 <div className="hidden lg:block space-y-12">
 {/* Info Box */}
 <div className="bg-primary-light/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 space-y-4">
 <div className="flex items-start space-x-3">
 <CheckCircle className="w-6 h-6 text-primary-light dark:text-primary-dark dark:text-primary-dark flex-shrink-0 mt-0.5" />
 <div>
 <h3 className="font-semibold text-blue-900 dark:text-blue-100">Why verify?</h3>
 <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
 Email verification helps us keep your account secure and ensures important notifications reach you.
 </p>
 </div>
 </div>
 </div>

 {/* Security Features */}
 <div className="space-y-4">
 <h3 className="font-semibold text-theme-primary">Security Features</h3>
 <ul className="space-y-3">
 <li className="flex items-start space-x-3">
 <div className="w-5 h-5 rounded-full bg-primary-light dark:bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
 </svg>
 </div>
 <span className="text-theme-secondary">One-time verification code</span>
 </li>
 <li className="flex items-start space-x-3">
 <div className="w-5 h-5 rounded-full bg-primary-light dark:bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
 </svg>
 </div>
 <span className="text-theme-secondary">Encrypted communication</span>
 </li>
 <li className="flex items-start space-x-3">
 <div className="w-5 h-5 rounded-full bg-primary-light dark:bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
 </svg>
 </div>
 <span className="text-theme-secondary">Automatic code expiration</span>
 </li>
 </ul>
 </div>

 {/* Statistics */}
 <div className="grid grid-cols-2 gap-4">
 {STATISTICS.map((stat) => (
 <div key={stat.label} className="text-center">
 <div className="text-2xl font-bold text-theme-primary">{stat.value}</div>
 <div className="text-xs text-theme-secondary ">{stat.label}</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}
