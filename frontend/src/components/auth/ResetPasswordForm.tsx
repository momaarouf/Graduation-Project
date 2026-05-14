'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Loader2, Shield, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import OtpInput from '@/src/components/ui/OtpInput'

const getPasswordStrength = (p: string) => {
 if (!p) return { score: 0, label: '', color: 'surface-section', message: '' }
 const checks = [p.length >= 8, p.length >= 12, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)]
 const s = checks.filter(Boolean).length
 if (s <= 1) return { score: 20, label: 'Weak', color: 'bg-red-500', message: 'Add capitalize, numbers & symbols' }
 if (s <= 2) return { score: 40, label: 'Fair', color: 'bg-orange-500', message: 'Make it longer' }
 if (s <= 3) return { score: 60, label: 'Good', color: 'bg-amber-500', message: 'Getting stronger' }
 if (s <= 4) return { score: 80, label: 'Strong', color: 'bg-primary-light', message: 'Almost perfect' }
 return { score: 100, label: 'Very Strong', color: 'bg-emerald-500', message: 'Excellent' }
}

interface Props { token?: string }

export default function ResetPasswordForm({ token: propToken }: Props) {
 const router = useRouter()
 const searchParams = useSearchParams()
 const { user, resetPassword } = useAuth()

 const backPath = user
 ? (user.role === 'ADMIN' ? '/dashboard/admin/settings' : user.role === 'GUIDE' ? '/dashboard/guide/settings' : '/dashboard/traveler/settings')
 : '/auth/login'

 const backLabel = user ? 'Back to Settings' : 'Back to login'
 const emailFromUrl = searchParams.get('email') || ''

 // Guard: if accessed directly without email param, redirect
 useEffect(() => {
 if (!emailFromUrl && !propToken) {
 router.replace('/auth/forgot-password')
 }
 }, [emailFromUrl, propToken, router])

 // Step state: visual steps, but technical one-form
 const [step, setStep] = useState<'code' | 'password'>(propToken ? 'password' : 'code')
 const [direction, setDirection] = useState(1) // 1 for next, -1 for back
 
 const [digits, setDigits] = useState<string[]>(Array(8).fill(''))
 const [password, setPassword] = useState('')
 const [confirm, setConfirm] = useState('')
 const [showPw, setShowPw] = useState(false)
 const [showCf, setShowCf] = useState(false)
 const [isLoading, setIsLoading] = useState(false)
 
 const [errors, setErrors] = useState<Record<string, string>>({})
 const [touched, setTouched] = useState<Record<string, boolean>>({})

 const code = propToken || digits.join('')
 const codeComplete = code.length === 8 && /^\d{8}$/.test(code)
 const strength = getPasswordStrength(password)
 const passwordsMatch = password === confirm
 const isFormValid = codeComplete && password.length >= 8 && passwordsMatch && confirm.length > 0

 const handleNextStep = () => {
 if (!codeComplete) { toast.error('Enter all 8 digits'); return }
 setDirection(1)
 setStep('password')
 }

 const handlePrevStep = () => {
 setDirection(-1)
 setStep('code')
 }

 const handleReset = async () => {
 setTouched({ password: true, confirm: true })
 const errs: Record<string, string> = {}
 if (!codeComplete) {
 errs.code = 'Verification code is required'
 setStep('code')
 setDirection(-1)
 setErrors(errs)
 return
 }
 if (password.length < 8) errs.password = 'At least 8 characters'
 if (!passwordsMatch) errs.confirm = 'Passwords do not match'
 
 if (Object.keys(errs).length) { setErrors(errs); return }

 setIsLoading(true)
 try {
 await resetPassword(code, password)
 toast.success('Password reset! Please log in.', { icon: '🔐', duration: 4000 })
 router.push('/auth/login')
 } catch (err: any) {
 const msg = err?.response?.data?.message || 'Failed to reset. Code may be expired or invalid.'
 toast.error(msg)
 
 // If code is wrong, go back to step 1 and show error
 if (err?.response?.status === 400 || err?.response?.status === 401 || err?.response?.status === 404) {
 setDirection(-1)
 setStep('code')
 setDigits(Array(8).fill(''))
 setErrors({ general: 'The code you entered is invalid or expired. Please check your email and try again.' })
 } else {
 setErrors({ general: msg })
 }
 } finally {
 setIsLoading(false)
 }
 }

 // Animation variants
 const variants = {
 enter: (direction: number) => ({
 x: direction > 0 ? 50 : -50,
 opacity: 0
 }),
 center: {
 x: 0,
 opacity: 1
 },
 exit: (direction: number) => ({
 x: direction < 0 ? 50 : -50,
 opacity: 0
 })
 }

 return (
 <div className="surface-card rounded-2xl border border-theme shadow-xl overflow-hidden min-h-[480px] flex flex-col">
 <AnimatePresence mode="wait" custom={direction}>
 {step === 'code' ? (
 <motion.div
 key="code-step"
 custom={direction}
 variants={variants}
 initial="enter"
 animate="center"
 exit="exit"
 transition={{ duration: 0.3, ease: 'easeInOut' }}
 className="p-6 sm:p-8 space-y-8 flex-1 flex flex-col justify-center"
 >
 <div className="text-center space-y-2">
 <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
 <Shield className="w-7 h-7 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 </div>
 <h2 className="text-2xl font-bold text-theme-primary">Enter reset code</h2>
 {emailFromUrl && (
 <p className="text-sm text-theme-muted ">
 Check your inbox at <span className="font-medium text-theme-secondary">{emailFromUrl}</span>
 </p>
 )}
 </div>

 {errors.general && (
 <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-danger-red dark:border-danger-red rounded-lg flex items-start gap-2">
 <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
 <p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p>
 </div>
 )}

 <div className="space-y-4">
 <OtpInput length={8} value={digits} onChange={setDigits} autoFocus />
 <p className="text-center text-xs text-theme-muted">
 8-digit code from your email · Expires in 15 min
 </p>
 </div>

 <button
 onClick={handleNextStep}
 disabled={!codeComplete}
 className="w-full px-4 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transition-all shadow-lg hover:shadow-blue-500/25"
 >
 <span>Continue</span>
 <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
 </button>

 <div className="text-center space-y-3 pt-2">
 <Link href="/auth/forgot-password" onClick={() => setDigits(Array(8).fill(''))} className="text-sm text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline font-medium">
 Resend code
 </Link>
 <p className="text-sm text-theme-muted ">
 <Link href={backPath} className="hover:underline">{backLabel}</Link>
 </p>
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="password-step"
 custom={direction}
 variants={variants}
 initial="enter"
 animate="center"
 exit="exit"
 transition={{ duration: 0.3, ease: 'easeInOut' }}
 className="p-6 sm:p-8 space-y-6 flex-1"
 >
 <div className="space-y-1">
 {!propToken && (
 <button onClick={handlePrevStep} className="flex items-center gap-1 text-sm text-theme-muted hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark mb-4 transition group">
 <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to code
 </button>
 )}
 <h2 className="text-2xl font-bold text-theme-primary">Set new password</h2>
 <p className="text-sm text-theme-muted ">Choose a strong, unique password.</p>
 </div>

 {/* Note about verification */}
 <div className="px-3 py-2 bg-primary-light/50 dark:bg-primary-dark/14 border border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark/30 rounded-lg">
 <p className="text-[11px] text-primary-light dark:text-primary-dark dark:text-primary-dark flex items-center gap-1.5 leading-tight">
 <Shield className="w-3 h-3 flex-shrink-0" />
 Note: Verification happens when you click"Reset Password".
 </p>
 </div>

 {/* New password */}
 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-theme-secondary">New Password</label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type={showPw ? 'text' : 'password'}
 value={password}
 onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})) }}
 onBlur={() => setTouched(p => ({...p, password: true}))}
 disabled={isLoading}
 placeholder="Min. 8 characters"
 className={`w-full pl-9 pr-10 py-3 surface-section border rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 transition-all ${
 errors.password && touched.password ? 'border-danger-red focus:ring-danger-red/20'
 : password.length >= 8 ? 'border-success-green focus:ring-success-green/20'
 : 'border-theme-strong focus:ring-primary-light dark:ring-primary-dark/20 focus:border-primary-light dark:border-primary-dark'
 }`}
 />
 <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300">
 {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {password && (
 <div className="space-y-1.5 pt-1">
 <div className="flex items-center gap-2">
 <div className="flex-1 h-1.5 surface-section rounded-full overflow-hidden">
 <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
 </div>
 {strength.label && <span className="text-[10px] capitalize tracking-normal font-bold text-theme-muted w-20 text-right">{strength.label}</span>}
 </div>
 </div>
 )}
 </div>

 {/* Confirm password */}
 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-theme-secondary">Confirm Password</label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type={showCf ? 'text' : 'password'}
 value={confirm}
 onChange={e => { setConfirm(e.target.value); setErrors(p => ({...p, confirm: ''})) }}
 onBlur={() => setTouched(p => ({...p, confirm: true}))}
 disabled={isLoading}
 placeholder="Repeat new password"
 className={`w-full pl-9 pr-10 py-3 surface-section border rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 transition-all ${
 errors.confirm && touched.confirm ? 'border-danger-red focus:ring-danger-red/20'
 : confirm && passwordsMatch ? 'border-success-green focus:ring-success-green/20'
 : 'border-theme-strong focus:ring-primary-light dark:ring-primary-dark/20 focus:border-primary-light dark:border-primary-dark'
 }`}
 />
 <button type="button" onClick={() => setShowCf(!showCf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300">
 {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {confirm && passwordsMatch && touched.confirm && (
 <p className="text-[11px] text-success-green flex items-center gap-1 font-medium"><CheckCircle className="w-3 h-3" /> Passwords match</p>
 )}
 {errors.confirm && touched.confirm && (
 <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {errors.confirm}</p>
 )}
 </div>

 <button
 onClick={handleReset}
 disabled={isLoading || !isFormValid}
 className="w-full px-4 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transition-all shadow-lg hover:shadow-blue-500/25"
 >
 {isLoading ? (
 <><Loader2 className="w-5 h-5 animate-spin" /><span>Resetting Password…</span></>
 ) : (
 <><span>Reset Password</span><CheckCircle className="w-5 h-5" /></>
 )}
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}
