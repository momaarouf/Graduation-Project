'use client'

// ============================================================================
// OAUTH CALLBACK PAGE
// ============================================================================
// LOCATION: /frontend/app/auth/oauth-callback/page.tsx
//
// Backend redirects here after Google OAuth:
//   /auth/oauth-callback?token=JWT&role=Guide&new=1
//
// Flow:
//   1. Read ?token from URL, call loginWithToken() → hydrates AuthContext
//   2. If ?new=1 and user hasn't agreed to terms → show inline Terms step
//   3. Once terms accepted (POST /api/auth/accept-terms) → go to dashboard
//   4. Existing users → go to dashboard immediately
// ============================================================================

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle, Shield, FileText, CheckCircle } from 'lucide-react'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { authAcceptTerms } from '@/src/lib/api/auth'
import toast from 'react-hot-toast'
import Link from 'next/link'

type Phase = 'loading' | 'terms' | 'error'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithToken, user } = useAuth()

  const [phase, setPhase] = useState<Phase>('loading')
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        // Store JWT and hydrate AuthContext with /me
        await loginWithToken(token)
        // After loginWithToken, the user state in context is set.
        // We read it in the next useEffect via the `user` dep.
        // Store isNew in sessionStorage so the next effect can use it.
        if (isNew) sessionStorage.setItem('oauth_new', '1')
      } catch (err: any) {
        console.error('OAuth callback error:', err)
        setError('Failed to complete sign-in. Please try again.')
        setPhase('error')
      }
    }

    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Once user is hydrated in context, decide what to show
  useEffect(() => {
    if (!user) return // still loading

    const isNew = sessionStorage.getItem('oauth_new') === '1'

    if (isNew && !user.agreedToTerms) {
      // New OAuth user — must accept terms before using the app
      setPhase('terms')
    } else {
      // Existing user or terms already accepted
      sessionStorage.removeItem('oauth_new')
      redirect(user.role)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const redirect = (role: string) => {
    if (role === 'Guide') router.replace('/dashboard/guide')
    else if (role === 'Traveler') router.replace('/dashboard/traveler')
    else if (role === 'Admin') router.replace('/dashboard/admin')
    else router.replace('/')
  }

  const handleAcceptTerms = async () => {
    if (!agreedToTerms || !agreedToPrivacy) return

    setIsSubmitting(true)
    try {
      await authAcceptTerms()
      sessionStorage.removeItem('oauth_new')
      toast.success('Welcome to SafariHub! 🎉', { duration: 4000 })
      if (user) redirect(user.role)
    } catch (err: any) {
      toast.error('Failed to save agreement. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-800 shadow-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign-in failed</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => router.push('/auth/signup')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
              Try again
            </button>
            <button onClick={() => router.push('/auth/login')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Log in
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Terms step for new OAuth users ───────────────────────────────────────
  if (phase === 'terms') {
    const canSubmit = agreedToTerms && agreedToPrivacy

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
        <div className="max-w-lg w-full space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">One last step</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your Google account is connected. Please agree to our terms to continue.
            </p>
          </div>

          {/* Account summary */}
          {user && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(user.fullName ?? user.email).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                {user.fullName && <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.fullName}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">{user.role.toLowerCase()} account</p>
              </div>
            </div>
          )}

          {/* Agreement card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Legal agreements</span>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
                agreedToTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
              }`} onClick={() => setAgreedToTerms(!agreedToTerms)}>
                {agreedToTerms && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                I agree to the{' '}
                <Link href="/legal/terms" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Terms of Service
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
                agreedToPrivacy ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
              }`} onClick={() => setAgreedToPrivacy(!agreedToPrivacy)}>
                {agreedToPrivacy && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                I agree to the{' '}
                <Link href="/legal/privacy" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            onClick={handleAcceptTerms}
            disabled={!canSubmit || isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Continue to SafariHub →'
            )}
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            You can always review these documents from your account settings.
          </p>
        </div>
      </div>
    )
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Completing sign-in…</p>
      </div>
    </div>
  )
}