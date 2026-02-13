'use client'

// ============================================================================
// AUTH FORM FOOTER - Login Link & Terms Agreement
// ============================================================================
// LOCATION: /frontend/src/components/auth/AuthFormFooter.tsx
// 
// PURPOSE: Consistent footer for all auth forms
// 
// FEATURES:
// 1. "Already have an account?" login link
// 2. Terms of service and privacy policy agreement
// 3. Newsletter opt-in (optional)
// 4. Dual theme support
// 
// USED IN:
// - Signup page
// - Login page (Phase 3)
// - Forgot password page (Phase 3)
// ============================================================================

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'

interface AuthFormFooterProps {
  /** Current page type (signup/login) */
  type: 'signup' | 'login' | 'forgot-password'
  
  /** Callback for terms agreement (for signup forms) */
  onTermsAgreed?: (agreed: boolean) => void
  
  /** Show newsletter opt-in (only for signup) */
  showNewsletter?: boolean
  
  /** Additional CSS classes */
  className?: string
}

export default function AuthFormFooter({
  type,
  onTermsAgreed,
  showNewsletter = true,
  className = ''
}: AuthFormFooterProps) {
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [newsletterOptIn, setNewsletterOptIn] = useState(false)

  // ========================================
  // HANDLERS
  // ========================================

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const agreed = e.target.checked
    setTermsAgreed(agreed)
    onTermsAgreed?.(agreed)
  }

  // ========================================
  // RENDER BASED ON TYPE
  // ========================================

  const renderLoginLink = () => {
    if (type === 'login') {
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1 group"
          >
            Sign up
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
      )
    }

    if (type === 'signup') {
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1 group"
          >
            Sign in
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
      )
    }

    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* ========================================
          TERMS AND CONDITIONS
          ======================================== */}
      <div className="space-y-3">
        {/* Terms agreement checkbox */}
        <label className="flex items-start gap-2 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={handleTermsChange}
              className="peer absolute opacity-0 w-4 h-4 cursor-pointer"
              aria-label="I agree to the terms and conditions"
            />
            <div className={`
              w-4 h-4
              border rounded
              transition-all duration-200
              flex items-center justify-center
              ${termsAgreed
                ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
                : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-600'
              }
            `}>
              {termsAgreed && (
                <CheckCircle className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            I agree to the{' '}
            <Link
              href="/terms"
              className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </Link>
          </span>
        </label>

        {/* Newsletter opt-in (only for signup) */}
        {type === 'signup' && showNewsletter && (
          <label className="flex items-start gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={newsletterOptIn}
                onChange={(e) => setNewsletterOptIn(e.target.checked)}
                className="peer absolute opacity-0 w-4 h-4 cursor-pointer"
                aria-label="Subscribe to newsletter"
              />
              <div className={`
                w-4 h-4
                border rounded
                transition-all duration-200
                flex items-center justify-center
                ${newsletterOptIn
                  ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
                  : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-600'
                }
              `}>
                {newsletterOptIn && (
                  <Mail className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Send me travel tips, exclusive offers, and updates (you can unsubscribe anytime)
            </span>
          </label>
        )}
      </div>

      {/* ========================================
          DIVIDER
          ======================================== */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            or
          </span>
        </div>
      </div>

      {/* ========================================
          LOGIN/SIGNUP LINK
          ======================================== */}
      <div className="text-center">
        {renderLoginLink()}
      </div>

      {/* ========================================
          TRUST BADGES (Small)
          ======================================== */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          SSL Secured
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-blue-500" />
          GDPR Compliant
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-amber-500" />
          256-bit Encryption
        </span>
      </div>

      {/* ========================================
          SCHEMA MARKUP (Hidden)
          ======================================== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': type === 'signup' ? 'Sign Up' : 'Log In',
            'description': type === 'signup' 
              ? 'Create your SafariHub account' 
              : 'Log in to your SafariHub account',
            'publisher': {
              '@type': 'Organization',
              'name': 'SafariHub'
            }
          })
        }}
      />
    </div>
  )
}

// ============================================================================
// USAGE EXAMPLES:
// ============================================================================
// 
// ✅ On Signup Page:
// <AuthFormFooter 
//   type="signup" 
//   onTermsAgreed={(agreed) => setFormValid(agreed)}
//   showNewsletter={true}
// />
// 
// ✅ On Login Page:
// <AuthFormFooter type="login" />
// 
// ✅ On Forgot Password:
// <AuthFormFooter type="forgot-password" />
// ============================================================================