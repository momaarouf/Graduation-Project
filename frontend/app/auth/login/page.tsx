'use client'

// ============================================================================
// LOGIN PAGE - COMPLETE (WITH BACK BUTTON)
// ============================================================================
// LOCATION: /frontend/src/app/auth/login/page.tsx
// 
// PURPOSE: User authentication with email/password
// 
// FEATURES:
// ✓ Email/password login with validation
// ✓"Remember me" functionality
// ✓ Links to signup & password reset
// ✓ Social login placeholders
// ✓ Form validation with real-time feedback
// ✓ Error handling
// ✓ Loading states
// ✓ Back button (now in page, not layout)
// ✓ Dual theme support
// ============================================================================

import Link from 'next/link'
import { Suspense } from 'react'
import { 
 Mail, 
 Lock, 
 Shield, 
 Chrome, 
 ChevronLeft,
 Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'
import LoginForm from '@/src/components/auth/LoginForm'
import AuthLayout from '@/app/auth/layout'
import LoginLoading from './loading'

// ========================================
// MAIN LOGIN PAGE
// ========================================

export default function LoginPage() {
 return (
 <>
 {/* Background Decorative Elements */}
 <div className="fixed inset-0 pointer-events-none overflow-hidden">
 <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-light/10 rounded-full blur-[120px]" />
 <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]" />
 </div>

 <div className="container-safe mx-auto max-w-xl relative z-10 flex flex-col justify-center pt-2 pb-8 sm:py-12 px-4 md:px-0">
 
 {/* Back Button */}
 <div className="mb-6 sm:mb-8">
 <Link
 href="/"
 className="inline-flex items-center gap-2 text-sm font-bold text-theme-muted hover:text-primary-light dark:text-primary-dark transition-colors group"
 >
 <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
 Back to Home
 </Link>
 </div>

 {/* Minimal Header */}
 <div className="text-center mb-8 sm:mb-10">
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light/10 text-primary-light dark:text-primary-dark rounded-full text-[10px] font-bold capitalize tracking-normal mb-4"
 >
 <Sparkles className="w-3 h-3" />
 Welcome back
 </motion.div>
 <h1 className="text-3xl sm:text-4xl font-bold text-theme-primary tracking-tight mb-2 sm:mb-3">
 Sign In to <span className="text-primary-light dark:text-primary-dark">SafariHub</span>
 </h1>
 <p className="text-sm sm:text-base text-theme-muted font-medium">
 Enter your details to access your travel dashboard
 </p>
 </div>

 {/* Login Form with Suspense */}
 <Suspense fallback={<LoginLoading />}>
 <LoginForm />
 </Suspense>

 {/* Minimal Footer */}
 <p className="mt-8 text-center text-sm text-theme-muted font-medium">
 Don't have an account?{' '}
 <Link 
 href="/auth/signup" 
 className="text-primary-light dark:text-primary-dark font-bold hover:underline"
 >
 Create one now
 </Link>
 </p>

 <div className="mt-10 sm:mt-12 flex justify-center gap-6 text-[10px] font-bold capitalize tracking-normal text-theme-muted">
 <Link href="/terms" className="hover:text-theme-secondary dark:hover:text-gray-200 transition-colors">Terms</Link>
 <Link href="/privacy" className="hover:text-theme-secondary dark:hover:text-gray-200 transition-colors">Privacy</Link>
 <Link href="/contact" className="hover:text-theme-secondary dark:hover:text-gray-200 transition-colors">Support</Link>
 </div>
 </div>

 {/* ========================================
 SCHEMA MARKUP - SEO
 ======================================== */}
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html: JSON.stringify({
 '@context': 'https://schema.org',
 '@type': 'WebPage',
 'name': 'Login',
 'description': 'Sign in to SafariHub travel marketplace',
 'publisher': {
 '@type': 'Organization',
 'name': 'SafariHub'
 },
 'potentialAction': {
 '@type': 'LoginAction',
 'target': 'https://safaribub.com/auth/login'
 }
 })
 }}
 />
 </>
 )
}
