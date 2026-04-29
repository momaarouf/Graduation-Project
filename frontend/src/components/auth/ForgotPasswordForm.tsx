'use client'

// ============================================================================
// FORGOT PASSWORD FORM
// ============================================================================
// LOCATION: /frontend/src/components/auth/ForgotPasswordForm.tsx
//
// PURPOSE: Handle email submission for password reset
//
// FEATURES:
// - Email validation
// - Success state with instructions
// - Loading states
// - Error handling
// - Integration with backend password reset flow
// ============================================================================

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/src/lib/contexts/AuthContext'

export default function ForgotPasswordForm() {
 // ========================================
 // STATE
 // ========================================
 const { requestPasswordReset } = useAuth()
 const router = useRouter()
 const [email, setEmail] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const [isSubmitted, setIsSubmitted] = useState(false)
 const [error, setError] = useState('')
 const [touched, setTouched] = useState(false)

 // ========================================
 // VALIDATION
 // ========================================
 const validateEmail = (email: string): boolean => {
 const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
 return re.test(email)
 }

 const isValid = validateEmail(email)
 const showError = touched && !isValid && email.length > 0

 const [isRedirecting, setIsRedirecting] = useState(false)

 // ========================================
 // HANDLERS
 // ========================================
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()

 if (!isValid) {
 setTouched(true)
 return
 }

 setIsLoading(true)
 setError('')

 try {
 // Call backend to request password reset
 const response = await requestPasswordReset(email)

 if (response.code || response.token) {
 console.log('Dev mode - Reset Code:', response.code, 'Token:', response.token)
 }

 toast.success('Reset code sent! Check your email.', {
 duration: 5000,
 icon: '📧'
 })

 // Set redirecting state to keep the loading spinner visible
 setIsRedirecting(true)
 
 // Auto-redirect to the reset-password page where they enter the code
 router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)
 
 // Note: We don't set setIsLoading(false) here on success 
 // to keep the button in"loading" mode during navigation.
 } catch (err: any) {
 const errorMessage = err?.response?.data?.message || 'Failed to send reset code. Please try again.'
 setError(errorMessage)
 toast.error(errorMessage)
 setIsLoading(false)
 }
 }

 // ========================================
 // RENDER SUCCESS STATE (Fallback if redirect takes a moment)
 // ========================================
 if (isSubmitted) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="surface-card rounded-2xl border border-theme shadow-xl p-6 sm:p-8"
 >
 <div className="text-center space-y-6">
 {/* Success Icon */}
 <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mx-auto">
 <CheckCircle className="w-8 h-8 text-success-green dark:text-emerald-400" />
 </div>

 {/* Message */}
 <div className="space-y-2">
 <h2 className="text-xl font-bold text-theme-primary">
 Check your email
 </h2>
 <p className="text-sm text-theme-secondary ">
 We've sent an 8-digit reset code to:<br />
 <span className="font-medium text-theme-primary">
 {email}
 </span>
 </p>
 </div>

 {/* Instructions */}
 <div className="p-4 bg-primary-light/10 rounded-lg text-left">
 <p className="text-xs text-blue-800 dark:text-blue-300">
 <span className="font-bold">Next steps:</span>
 <br />
 1. Check your email for the 8-digit code (check spam folder)
 <br />
 2. Enter the code on the next page to set a new password
 </p>
 </div>

 {/* Actions */}
 <div className="space-y-3 pt-4">
 <Link
 href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
 className="block w-full px-4 py-3 bg-primary-light text-white font-medium rounded-lg hover:bg-primary-light-hover transition-colors text-center"
 >
 Enter Reset Code
 </Link>
 <button
 onClick={() => {
 setIsSubmitted(false)
 setEmail('')
 setTouched(false)
 }}
 className="text-sm text-theme-muted hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors"
 >
 Try a different email
 </button>
 </div>
 </div>
 </motion.div>
 )
 }

 // ========================================
 // RENDER FORM
 // ========================================
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="surface-card rounded-2xl border border-theme shadow-xl p-6 sm:p-8"
 >
 <form onSubmit={handleSubmit} className="space-y-6">
 
 {/* Email Field */}
 <div className="space-y-1.5">
 <label htmlFor="email" className="block text-sm font-medium text-theme-secondary">
 Email Address
 </label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type="email"
 id="email"
 value={email}
 onChange={(e) => {
 setEmail(e.target.value)
 setError('')
 if (touched) setTouched(false)
 }}
 onBlur={() => setTouched(true)}
 disabled={isLoading}
 placeholder="you@example.com"
 className={`
 w-full pl-9 pr-3 py-3
 surface-section
 border rounded-lg
 text-sm text-theme-primary
 placeholder-gray-500 dark:placeholder-gray-400
 focus:outline-none focus:ring-2
 transition-all
 ${showError || error
 ? 'border-danger-red focus:ring-danger-red/20'
 : isValid && touched
 ? 'border-success-green focus:ring-success-green/20'
 : 'border-theme-strong focus:ring-primary-light dark:ring-primary-dark/20 focus:border-primary-light dark:border-primary-dark'
 }
 disabled:opacity-50 disabled:cursor-not-allowed
 `}
 />
 </div>
 {showError && (
 <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
 <AlertCircle className="w-3 h-3" />
 Please enter a valid email address
 </p>
 )}
 {error && (
 <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
 <AlertCircle className="w-3 h-3" />
 {error}
 </p>
 )}
 </div>

 {/* Submit Button */}
 <button
 type="submit"
 disabled={isLoading || !email}
 className="
 w-full
 px-4 py-3
 bg-gradient-to-r from-blue-600 to-indigo-600
 dark:from-blue-700 dark:to-indigo-700
 text-white font-medium
 rounded-lg
 hover:from-blue-700 hover:to-indigo-700
 dark:hover:from-blue-800 dark:hover:to-indigo-800
 transition-all
 disabled:opacity-50 disabled:cursor-not-allowed
 flex items-center justify-center gap-2
 group
"
 >
 {isLoading || isRedirecting ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 <span>{isRedirecting ? 'Redirecting...' : 'Sending code...'}</span>
 </>
 ) : (
 <>
 <span>Request Reset Code</span>
 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
 </>
 )}
 </button>

 {/* Back to Login Link */}
 <p className="text-center text-sm text-theme-secondary ">
 Remember your password?{' '}
 <Link
 href="/auth/login"
 className="font-semibold text-primary-light dark:text-primary-dark dark:text-primary-dark hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
 >
 Sign in
 </Link>
 </p>
 </form>
 </motion.div>
 )
}