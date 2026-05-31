'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Loader2, Shield, Mail, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import OtpInput from '@/src/components/ui/OtpInput'

const getPasswordStrength = (p: string) => {
  if (!p) return { score: 0, label: '', color: 'surface-section' }
  const checks = [p.length >= 8, p.length >= 12, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)]
  const s = checks.filter(Boolean).length
  if (s <= 1) return { score: 20, label: 'Weak', color: 'bg-red-500' }
  if (s <= 2) return { score: 40, label: 'Fair', color: 'bg-orange-500' }
  if (s <= 3) return { score: 60, label: 'Good', color: 'bg-amber-500' }
  if (s <= 4) return { score: 80, label: 'Strong', color: 'bg-primary-light' }
  return { score: 100, label: 'Very Strong', color: 'bg-emerald-500' }
}

interface Props {
  /** Called after the password has been successfully set (before the forced logout) */
  onSuccess?: () => void
}

export default function SetPasswordForm({ onSuccess }: Props) {
  const { requestPasswordSetup, confirmPasswordSetup, user } = useAuth()

  const [step, setStep] = useState<'intro' | 'code' | 'password'>('intro')
  const [direction, setDirection] = useState(1)
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const hasSent = useRef(false)

  const code = digits.join('')
  const codeComplete = digits.join('').length === 6 && /^\d{6}$/.test(digits.join(''))
  const strength = getPasswordStrength(password)
  const passwordsMatch = password === confirm
  const isFormValid = codeComplete && password.length >= 8 && passwordsMatch && confirm.length > 0

  const handleSendCode = async () => {
    if (hasSent.current) return
    setIsLoading(true)
    try {
      hasSent.current = true
      await requestPasswordSetup()
      toast.success(`Code sent to ${user?.email}`, { icon: '📧' })
      setDirection(1)
      setStep('code')
    } catch (err: any) {
      hasSent.current = false
      const msg = err?.response?.data?.message || 'Failed to send code. Try again.'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextStep = () => {
    if (!codeComplete) { toast.error('Enter all 6 digits'); return }
    setDirection(1)
    setStep('password')
  }

  const handlePrevStep = () => {
    setDirection(-1)
    setStep('code')
  }

  const handleConfirm = async () => {
    setTouched({ password: true, confirm: true })
    const errs: Record<string, string> = {}
    if (!codeComplete) { errs.code = 'Code required'; setDirection(-1); setStep('code') }
    if (password.length < 8) errs.password = 'At least 8 characters'
    if (!passwordsMatch) errs.confirm = 'Passwords do not match'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setIsLoading(true)
    try {
      await confirmPasswordSetup(code, password)
      toast.success('Password set! Please log in again to continue.', { icon: '🔐', duration: 5000 })
      if (onSuccess) onSuccess()
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid or expired code. Please try again.'
      toast.error(msg)
      setErrors({ general: msg })
      setDirection(-1)
      setStep('code')
      setDigits(Array(6).fill(''))
    } finally {
      setIsLoading(false)
    }
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 50 : -50, opacity: 0 }),
  }

  return (
    <div className="surface-card rounded-2xl border border-theme shadow-xl overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>

        {/* Step 0: Intro */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Google account — no password yet</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  You signed up with Google. Setting a password lets you also log in with your email, and adds an extra layer of security.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-theme-secondary">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-light/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-light dark:text-primary-dark">1</span>
                </div>
                <span>We send a secure 6-digit code to <strong>{user?.email}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-light/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-light dark:text-primary-dark">2</span>
                </div>
                <span>You enter the code to prove it's you</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-light/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-light dark:text-primary-dark">3</span>
                </div>
                <span>You set your new password — then log in again</span>
              </div>
            </div>

            <button
              onClick={handleSendCode}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 flex items-center justify-center gap-2 group transition-all shadow-md"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending code…</span></> : <><Mail className="w-4 h-4" /><span>Send verification code</span><ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
            </button>
          </motion.div>
        )}

        {/* Step 1: Enter code */}
        {step === 'code' && (
          <motion.div
            key="code"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="p-6 sm:p-8 space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-7 h-7 text-primary-light dark:text-primary-dark" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary">Enter your code</h3>
              <p className="text-sm text-theme-muted">We sent a 6-digit code to <span className="font-medium text-theme-secondary">{user?.email}</span></p>
            </div>

            {errors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-danger-red rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p>
              </div>
            )}

            <div className="space-y-3">
              <OtpInput length={6} value={digits} onChange={(v) => { setDigits(v); setErrors({}) }} autoFocus />
              <p className="text-center text-xs text-theme-muted">6-digit code · Expires in 15 min</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleNextStep}
                disabled={!codeComplete}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 flex items-center justify-center gap-2 group transition-all"
              >
                <span>Continue</span><ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => { hasSent.current = false; handleSendCode() }}
                disabled={isLoading}
                className="w-full text-sm text-primary-light dark:text-primary-dark hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Set password */}
        {step === 'password' && (
          <motion.div
            key="password"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="p-6 sm:p-8 space-y-5"
          >
            <button onClick={handlePrevStep} className="flex items-center gap-1 text-sm text-theme-muted hover:text-primary-light dark:hover:text-primary-dark transition group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to code
            </button>

            <div>
              <h3 className="text-xl font-bold text-theme-primary">Set your password</h3>
              <p className="text-sm text-theme-muted mt-1">Choose a strong, unique password.</p>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-theme-secondary">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                  onBlur={() => setTouched(p => ({ ...p, password: true }))}
                  disabled={isLoading}
                  placeholder="Min. 8 characters"
                  className={`w-full pl-9 pr-10 py-3 surface-section border rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 transition-all ${
                    errors.password && touched.password ? 'border-danger-red focus:ring-danger-red/20'
                    : password.length >= 8 ? 'border-success-green focus:ring-success-green/20'
                    : 'border-theme-strong focus:ring-primary-light/20 focus:border-primary-light dark:focus:border-primary-dark'
                  }`}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-1.5 surface-section rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
                  </div>
                  {strength.label && <span className="text-[10px] font-bold text-theme-muted w-20 text-right">{strength.label}</span>}
                </div>
              )}
              {errors.password && touched.password && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-theme-secondary">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                <input
                  type={showCf ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })) }}
                  onBlur={() => setTouched(p => ({ ...p, confirm: true }))}
                  disabled={isLoading}
                  placeholder="Repeat new password"
                  className={`w-full pl-9 pr-10 py-3 surface-section border rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 transition-all ${
                    errors.confirm && touched.confirm ? 'border-danger-red focus:ring-danger-red/20'
                    : confirm && passwordsMatch ? 'border-success-green focus:ring-success-green/20'
                    : 'border-theme-strong focus:ring-primary-light/20 focus:border-primary-light dark:focus:border-primary-dark'
                  }`}
                />
                <button type="button" onClick={() => setShowCf(!showCf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary">
                  {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm && passwordsMatch && touched.confirm && <p className="text-xs text-success-green flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match</p>}
              {errors.confirm && touched.confirm && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.confirm}</p>}
            </div>

            <button
              onClick={handleConfirm}
              disabled={isLoading || !isFormValid}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 flex items-center justify-center gap-2 group transition-all shadow-md"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Setting password…</span></> : <><CheckCircle className="w-4 h-4" /><span>Set Password</span></>}
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
