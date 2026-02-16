'use client'

// ============================================================================
// RESET PASSWORD FORM
// ============================================================================
// LOCATION: /frontend/src/components/auth/ResetPasswordForm.tsx
// 
// PURPOSE: Handle new password submission with token validation
// 
// FEATURES:
// - Password strength indicator
// - Confirm password matching
// - Show/hide password toggles
// - Token validation (mock in Phase 1)
// - Success redirect to login
// 
// API READY:
// - Replace mock API with real endpoint in Phase 3
// - Token will be validated by backend
// ============================================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
    Lock, 
    Eye, 
    EyeOff, 
    CheckCircle, 
    AlertCircle, 
    ArrowRight,
    Loader2,
    Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================================================
// PROPS
// ============================================================================

interface ResetPasswordFormProps {
    /** Reset token from URL */
    token?: string
}

// ============================================================================
// PASSWORD STRENGTH
// ============================================================================

const getPasswordStrength = (password: string): {
    score: number
    label: string
    color: string
    message: string
} => {
    if (!password) return { 
        score: 0, 
        label: '', 
        color: 'bg-gray-200',
        message: 'Enter a password'
    }
    
    let score = 0
    const checks = [
        password.length >= 8,
        password.length >= 12,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password)
    ]
    
    score = checks.filter(Boolean).length

    if (score <= 1) return { 
        score: 20, 
        label: 'Weak', 
        color: 'bg-red-500',
        message: 'Add numbers and symbols'
    }
    if (score <= 2) return { 
        score: 40, 
        label: 'Fair', 
        color: 'bg-orange-500',
        message: 'Make it longer'
    }
    if (score <= 3) return { 
        score: 60, 
        label: 'Good', 
        color: 'bg-amber-500',
        message: 'Getting stronger'
    }
    if (score <= 4) return { 
        score: 80, 
        label: 'Strong', 
        color: 'bg-blue-500',
        message: 'Very secure'
    }
    return { 
        score: 100, 
        label: 'Very Strong', 
        color: 'bg-emerald-500',
        message: 'Excellent password'
    }
}

// ============================================================================
// MAIN FORM
// ============================================================================

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const router = useRouter()

    // ========================================
    // STATE
    // ========================================
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    // ========================================
    // DERIVED VALUES
    // ========================================
    const passwordStrength = getPasswordStrength(password)
    const passwordsMatch = password === confirmPassword
    const isTokenValid = !!token // In Phase 3, this will validate with backend

    const isFormValid = (): boolean => {
        return password.length >= 8 && 
               passwordsMatch && 
               confirmPassword.length > 0 &&
               isTokenValid
    }

    // ========================================
    // HANDLERS
    // ========================================

    const validateField = (field: string, value: string): string => {
        if (field === 'password') {
            if (!value) return 'Password is required'
            if (value.length < 8) return 'Password must be at least 8 characters'
            return ''
        }
        if (field === 'confirmPassword') {
            if (!value) return 'Please confirm your password'
            if (value !== password) return 'Passwords do not match'
            return ''
        }
        return ''
    }

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        
        const value = field === 'password' ? password : confirmPassword
        const error = validateField(field, value)
        
        setErrors(prev => ({
            ...prev,
            [field]: error
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Mark all fields as touched
        setTouched({ password: true, confirmPassword: true })

        // Validate all fields
        const passwordError = validateField('password', password)
        const confirmError = validateField('confirmPassword', confirmPassword)

        if (passwordError || confirmError) {
            setErrors({
                password: passwordError,
                confirmPassword: confirmError
            })
            return
        }

        if (!isTokenValid) {
            toast.error('Invalid reset link. Please request a new one.')
            return
        }

        setIsLoading(true)

        try {
            // ========================================
            // PHASE 3: Replace with actual API call
            // ========================================
            // const response = await fetch('/api/auth/reset-password', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ token, password })
            // })
            
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            // Mock success
            console.log('Password reset for token:', token)
            
            toast.success('Password reset successfully!', {
                duration: 5000,
                icon: '🔐'
            })

            // Redirect to login
            router.push('/auth/login?reset=success')

        } catch (error) {
            console.error('Reset password error:', error)
            toast.error('Failed to reset password. Please try again.')
            setErrors({ general: 'Something went wrong. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    // ========================================
    // RENDER
    // ========================================

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-6 sm:p-8"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Token Status */}
                {!isTokenValid && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 dark:text-red-300">
                            Invalid or expired reset link. Please request a new one.
                        </p>
                    </div>
                )}

                {/* New Password */}
                <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setErrors(prev => ({ ...prev, password: '' }))
                            }}
                            onBlur={() => handleBlur('password')}
                            disabled={isLoading || !isTokenValid}
                            placeholder="Enter new password"
                            className={`
                                w-full pl-9 pr-10 py-3
                                bg-gray-50 dark:bg-gray-800
                                border rounded-lg
                                text-sm text-gray-900 dark:text-white
                                placeholder-gray-500 dark:placeholder-gray-400
                                focus:outline-none focus:ring-2
                                transition-all
                                ${errors.password && touched.password
                                    ? 'border-red-500 focus:ring-red-500/20'
                                    : password && password.length >= 8
                                        ? 'border-emerald-500 focus:ring-emerald-500/20'
                                        : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Password Strength */}
                    {password && (
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                        style={{ width: `${passwordStrength.score}%` }}
                                    />
                                </div>
                                {passwordStrength.label && (
                                    <span className="text-xs font-medium ml-2 text-gray-600 dark:text-gray-400">
                                        {passwordStrength.label}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {passwordStrength.message}
                            </p>
                        </div>
                    )}

                    {errors.password && touched.password && (
                        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                setErrors(prev => ({ ...prev, confirmPassword: '' }))
                            }}
                            onBlur={() => handleBlur('confirmPassword')}
                            disabled={isLoading || !isTokenValid}
                            placeholder="Confirm new password"
                            className={`
                                w-full pl-9 pr-10 py-3
                                bg-gray-50 dark:bg-gray-800
                                border rounded-lg
                                text-sm text-gray-900 dark:text-white
                                placeholder-gray-500 dark:placeholder-gray-400
                                focus:outline-none focus:ring-2
                                transition-all
                                ${errors.confirmPassword && touched.confirmPassword
                                    ? 'border-red-500 focus:ring-red-500/20'
                                    : confirmPassword && passwordsMatch
                                        ? 'border-emerald-500 focus:ring-emerald-500/20'
                                        : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.confirmPassword}
                        </p>
                    )}
                    {confirmPassword && passwordsMatch && touched.confirmPassword && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Passwords match
                        </p>
                    )}
                </div>

                {/* General Error */}
                {errors.general && (
                    <p className="text-xs text-red-600 dark:text-red-400 text-center">
                        {errors.general}
                    </p>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || !isFormValid() || !isTokenValid}
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
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Resetting...</span>
                        </>
                    ) : (
                        <>
                            <span>Reset Password</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>

                {/* Back to Login */}
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Remember your password?{' '}
                    <Link
                        href="/auth/login"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        Sign in
                    </Link>
                </p>

                {/* Security Note */}
                <p className="text-xs text-center text-gray-500 dark:text-gray-500 pt-2">
                    <Shield className="inline w-3 h-3 mr-1" />
                    Password reset links expire after 1 hour
                </p>
            </form>
        </motion.div>
    )
}