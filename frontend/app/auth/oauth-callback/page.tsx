'use client'

// ============================================================================
// OAUTH CALLBACK PAGE
// ============================================================================
// Backend redirects here after Google OAuth:
// /auth/oauth-callback?token=JWT&role=Guide&new=1
//
// useSearchParams() requires a Suspense boundary in Next.js 15+.
// OAuthCallbackContent owns all the logic; OAuthCallbackPage wraps it.
// ============================================================================

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle, Shield, FileText, CheckCircle } from 'lucide-react'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { authAcceptTerms } from '@/src/lib/api/auth'
import toast from 'react-hot-toast'
import Link from 'next/link'

type Phase = 'loading' | 'terms' | 'error'

// ── Inner component (owns useSearchParams) ────────────────────────────────────
function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithToken, user } = useAuth()

  const [phase, setPhase] = useState<Phase>('loading')
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)

  const loadingMessages = [
    'Connecting to Google...',
    'Securing your session...',
    'Fetching your profile...',
    'Almost there...',
  ]

  // Step 1: Read URL params and call loginWithToken
  useEffect(() => {
    const run = async () => {
      const errorParam = searchParams.get('error')
      const token = searchParams.get('token')
      const isNew = searchParams.get('new') === '1'

      if (errorParam) {
        const msgParam = searchParams.get('msg')
        const messages: Record<string, string> = {
          role_mismatch: 'An account with this email already exists under a different role. Please log in instead.',
          missing_role: 'Role selection was lost. Please try signing up again.',
          server_error: 'Server error during sign-in. ' + (msgParam ? `Details: ${msgParam}` : ''),
        }
        setError(messages[errorParam] || (msgParam ? `Error: ${msgParam}` : errorParam) || 'Google sign-in failed. Please try again.')
        setPhase('error')
        return
      }

      if (!token) {
        setError('No authentication token received. Please try again.')
        setPhase('error')
        return
      }

      try {
        await loginWithToken(token)
        if (isNew) sessionStorage.setItem('oauth_new', '1')
      } catch (err: any) {
        console.error('OAuth callback error:', err)
        setError('Failed to complete sign-in. Please try again.')
        setPhase('error')
      }
    }
    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Step 2: Once user is hydrated, decide where to go
  useEffect(() => {
    if (!user) return
    const isNew = sessionStorage.getItem('oauth_new') === '1'
    if (isNew && !user.agreedToTerms) {
      setPhase('terms')
    } else {
      sessionStorage.removeItem('oauth_new')
      redirectByRole(user.role)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Loading step ticker
  useEffect(() => {
    if (phase !== 'loading') return
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev))
    }, 800)
    return () => clearInterval(interval)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const redirectByRole = (role: string) => {
    if (role === 'ADMIN') router.push('/dashboard/admin')
    else if (role === 'GUIDE') router.push('/dashboard/guide')
    else if (role === 'TRAVELER') router.push('/dashboard/traveler')
    else router.replace('/')
  }

  const handleAcceptTerms = async () => {
    if (!agreedToTerms || !agreedToPrivacy) return
    setIsSubmitting(true)
    try {
      await authAcceptTerms()
      sessionStorage.removeItem('oauth_new')
      toast.success('Welcome to SafariHub! 🎉', { duration: 4000 })
      if (user) redirectByRole(user.role)
    } catch {
      toast.error('Failed to save agreement. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center surface-section px-4">
        <div className="max-w-md w-full surface-card rounded-2xl border border-red-200 dark:border-red-800 shadow-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-theme-primary">Sign-in failed</h2>
          <p className="text-sm text-theme-secondary">{error}</p>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => router.push('/auth/signup')}
              className="px-4 py-2 bg-primary-light hover:bg-primary-light-hover text-white text-sm font-medium rounded-lg transition">
              Try again
            </button>
            <button onClick={() => router.push('/auth/login')}
              className="px-4 py-2 border border-theme-strong text-theme-secondary text-sm font-medium rounded-lg hover:surface-section transition">
              Log in
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Terms ──────────────────────────────────────────────────────────────────
  if (phase === 'terms') {
    const canSubmit = agreedToTerms && agreedToPrivacy
    return (
      <div className="min-h-screen flex items-center justify-center surface-section px-4 py-12">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7 text-primary-light dark:text-primary-dark" />
            </div>
            <h1 className="text-2xl font-bold text-theme-primary">One last step</h1>
            <p className="text-sm text-theme-muted">
              Your Google account is connected. Please agree to our terms to continue.
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-3 p-4 bg-primary-light/10 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(user.fullName ?? user.email).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                {user.fullName && <p className="text-sm font-semibold text-theme-primary truncate">{user.fullName}</p>}
                <p className="text-xs text-theme-muted truncate">{user.email}</p>
                <p className="text-xs text-primary-light dark:text-primary-dark capitalize">{user.role.toLowerCase()} account</p>
              </div>
            </div>
          )}

          <div className="surface-card border border-theme rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-theme-muted" />
              <span className="text-sm font-semibold text-theme-secondary">Legal agreements</span>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${agreedToTerms ? 'bg-primary-light border-blue-600' : 'border-theme-strong group-hover:border-primary-light'}`}
                onClick={() => setAgreedToTerms(!agreedToTerms)}
              >
                {agreedToTerms && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-theme-secondary leading-relaxed">
                I agree to the{' '}
                <Link href="/legal/terms" target="_blank" className="text-primary-light dark:text-primary-dark hover:underline font-medium">
                  Terms of Service
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${agreedToPrivacy ? 'bg-primary-light border-blue-600' : 'border-theme-strong group-hover:border-primary-light'}`}
                onClick={() => setAgreedToPrivacy(!agreedToPrivacy)}
              >
                {agreedToPrivacy && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-theme-secondary leading-relaxed">
                I agree to the{' '}
                <Link href="/legal/privacy" target="_blank" className="text-primary-light dark:text-primary-dark hover:underline font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <button
            onClick={handleAcceptTerms}
            disabled={!canSubmit || isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to SafariHub →'}
          </button>

          <p className="text-center text-xs text-theme-muted">
            You can always review these documents from your account settings.
          </p>
        </div>
      </div>
    )
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="surface-card border border-theme rounded-3xl shadow-2xl p-10 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 scale-150 opacity-20">
              <div className="w-full h-full border-4 border-blue-600 border-t-transparent rounded-full animate-[spin_3s_linear_infinite]" />
            </div>
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <Loader2 className="w-10 h-10 animate-spin text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-theme-primary mb-2">Authenticating</h2>
          <div className="space-y-4">
            <p className="text-sm text-primary-light dark:text-primary-dark font-medium animate-pulse">
              {loadingMessages[loadingStep]}
            </p>
            <div className="flex justify-center gap-1.5">
              {loadingMessages.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${i === loadingStep ? 'w-6 bg-primary-light' : 'w-1.5 surface-section'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Default export: wraps in Suspense (required for useSearchParams in Next 15+)
export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  )
}
