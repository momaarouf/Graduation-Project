'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, CheckCircle, AlertCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import OtpInput from '@/src/components/ui/OtpInput'

interface Props {
 /** If provided, skip email entry and show code input directly */
 emailPrefill?: string
 /** Called after successful verification */
 onSuccess?: () => void
}

export default function EmailVerificationForm({ emailPrefill, onSuccess }: Props) {
 const router = useRouter()
 const searchParams = useSearchParams()
 const { requestEmailVerification, confirmEmailWithCode } = useAuth()

 const emailFromUrl = emailPrefill || searchParams.get('email') || ''

 // If email is provided (from dashboard or URL), jump straight to code step
 const [step, setStep] = useState<'email' | 'code'>(emailFromUrl ? 'code' : 'email')
 const [email, setEmail] = useState(emailFromUrl)
 const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
 const [isLoading, setIsLoading] = useState(false)
 const [isVerified, setIsVerified] = useState(false)
 const [error, setError] = useState('')
 const [touched, setTouched] = useState(false)
 const [resendCooldown, setResendCooldown] = useState(0)

 const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
 const code = digits.join('')
 const codeComplete = code.length === 6

 // Auto-send code if email was prefilled
 useEffect(() => {
 if (emailFromUrl && step === 'code') {
 sendCode(emailFromUrl)
 }
 }, [])

 // Resend cooldown timer
 useEffect(() => {
 if (resendCooldown > 0) {
 const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
 return () => clearTimeout(t)
 }
 }, [resendCooldown])

 const sendCode = async (emailToSend: string) => {
 setIsLoading(true)
 setError('')
 try {
 await requestEmailVerification(emailToSend)
 toast.success('Verification code sent!', { icon: '📧' })
 setStep('code')
 setResendCooldown(60)
 } catch (err: any) {
 const msg = err?.response?.data?.message || 'Failed to send code. Try again.'
 setError(msg)
 toast.error(msg)
 } finally {
 setIsLoading(false)
 }
 }

 const handleRequestCode = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!isEmailValid) { setTouched(true); return }
 await sendCode(email)
 }

 const handleVerify = async () => {
 if (!codeComplete) { toast.error('Enter all 6 digits'); return }
 setIsLoading(true)
 setError('')
 try {
 await confirmEmailWithCode(email, code)
 setIsVerified(true)
 toast.success('Email verified successfully!', { icon: '✅', duration: 4000 })
 if (onSuccess) { onSuccess() }
 else { setTimeout(() => router.push('/dashboard'), 1500) }
 } catch (err: any) {
 const msg = err?.response?.data?.message || 'Invalid code. Please try again.'
 setError(msg)
 toast.error(msg)
 setDigits(Array(6).fill(''))
 } finally {
 setIsLoading(false)
 }
 }

 // Success state
 if (isVerified) {
 return (
 <div className="surface-card rounded-2xl border border-theme shadow-xl p-8 text-center space-y-4">
 <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
 <CheckCircle className="w-8 h-8 text-success-green dark:text-emerald-400" />
 </div>
 <h2 className="text-2xl font-bold text-theme-primary">Email verified!</h2>
 <p className="text-theme-muted ">Your email address has been confirmed.</p>
 </div>
 )
 }

 // Step 1: enter email
 if (step === 'email') {
 return (
 <div className="surface-card rounded-2xl border border-theme shadow-xl p-6 sm:p-8 space-y-6">
 <div className="text-center space-y-2">
 <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
 <Mail className="w-7 h-7 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 </div>
 <h2 className="text-2xl font-bold text-theme-primary">Verify your email</h2>
 <p className="text-sm text-theme-muted ">We'll send a 6-digit code to your email address.</p>
 </div>

 <form onSubmit={handleRequestCode} className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-sm font-medium text-theme-secondary">Email Address</label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type="email"
 value={email}
 onChange={e => { setEmail(e.target.value); setError(''); setTouched(false) }}
 onBlur={() => setTouched(true)}
 disabled={isLoading}
 placeholder="you@example.com"
 className={`w-full pl-9 pr-3 py-3 surface-section border rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 transition-all ${
 touched && !isEmailValid ? 'border-danger-red focus:ring-danger-red/20'
 : isEmailValid && touched ? 'border-success-green focus:ring-success-green/20'
 : 'border-theme-strong focus:ring-primary-light dark:ring-primary-dark/20 focus:border-primary-light dark:border-primary-dark'
 }`}
 />
 </div>
 {touched && !isEmailValid && email && (
 <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Enter a valid email</p>
 )}
 {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
 </div>

 <button
 type="submit"
 disabled={isLoading || !email}
 className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transition-all"
 >
 {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending…</span></>
 : <><span>Send Code</span><ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
 </button>
 </form>

 <p className="text-center text-sm text-theme-muted">
 <Link href="/auth/login" className="text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline">Back to login</Link>
 </p>
 </div>
 )
 }

 // Step 2: enter 6-digit code
 return (
 <div className="surface-card rounded-2xl border border-theme shadow-xl p-6 sm:p-8 space-y-8">
 <div className="text-center space-y-2">
 <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto">
 <Mail className="w-7 h-7 text-success-green dark:text-emerald-400" />
 </div>
 <h2 className="text-2xl font-bold text-theme-primary">Check your email</h2>
 <p className="text-sm text-theme-muted ">
 We sent a 6-digit code to <span className="font-medium text-theme-secondary">{email}</span>
 </p>
 </div>

 {/* 6-box OTP */}
 <div className="space-y-4">
 <OtpInput length={6} value={digits} onChange={setDigits} autoFocus disabled={isLoading} />
 {error && (
 <p className="text-center text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
 <AlertCircle className="w-4 h-4" />{error}
 </p>
 )}
 </div>

 <div className="space-y-3">
 <button
 onClick={handleVerify}
 disabled={!codeComplete || isLoading}
 className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transition-all"
 >
 {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Verifying…</span></>
 : <><span>Verify Email</span><CheckCircle className="w-4 h-4" /></>}
 </button>

 <div className="flex items-center justify-between text-sm">
 <button
 onClick={() => { setStep('email'); setDigits(Array(6).fill('')) }}
 className="text-theme-muted hover:text-theme-primary dark:hover:text-gray-200 transition"
 >
 ← Change email
 </button>
 <button
 onClick={() => sendCode(email)}
 disabled={isLoading || resendCooldown > 0}
 className="flex items-center gap-1 text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
 {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
 </button>
 </div>
 </div>
 </div>
 )
}