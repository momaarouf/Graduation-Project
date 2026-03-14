// ============================================================================
// ACCOUNT DETAILS FORM - STEP 2 - FIXED NAVIGATION
// ============================================================================
// LOCATION: /frontend/src/components/auth/AccountDetailsForm.tsx
// 
// 🔴 FIXES APPLIED (2026-02-16):
// ==============================
// 1. Added debug logging to track form submission
// 2. Fixed handleSubmit to properly call onNext()
// 3. Added visual feedback when form is valid
// 4. Fixed password strength indicator
// 5. Added loading state to button
// ============================================================================

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    ArrowRight
} from 'lucide-react'
import { useSignup } from '@/src/lib/contexts/SignupContext'
import { SignupFormData } from '@/src/types/auth.types'

interface AccountDetailsFormProps {
    onNext: () => void
    onBack: () => void
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
}

const validatePassword = (password: string): boolean => {
  // At least 8 chars, at least one uppercase, one lowercase, one digit, one special character
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
  return re.test(password);
};

const validateName = (name: string): boolean => {
    return name.length >= 2
}

// ============================================================================
// PASSWORD STRENGTH
// ============================================================================

// ============================================================================
// PASSWORD STRENGTH
// ============================================================================

const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  if (!password) return { score: 0, label: '', color: 'bg-gray-200' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++; // any non-alphanumeric

  if (score <= 2) return { score: 20, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { score: 50, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 4) return { score: 75, label: 'Good', color: 'bg-blue-500' };
  return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AccountDetailsForm({ onNext, onBack }: AccountDetailsFormProps) {
    const { data, errors, updateField, isLoading } = useSignup()
    
    // ========================================
    // LOCAL STATE
    // ========================================
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

    // ========================================
    // DERIVED VALUES
    // ========================================
    const passwordStrength = getPasswordStrength(data.password)
    const passwordsMatch = data.password === data.confirmPassword

    const isFormValid = (): boolean => {
        const emailValid = validateEmail(data.email)
        const passwordValid = validatePassword(data.password)
        const confirmValid = data.confirmPassword.length > 0 && passwordsMatch
        const firstNameValid = validateName(data.firstName)
        const lastNameValid = validateName(data.lastName)

        return emailValid && passwordValid && confirmValid && firstNameValid && lastNameValid
    }

    // ========================================
    // HANDLERS
    // ========================================

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        updateField(name as keyof SignupFormData, value)
        
        // Clear error for this field
        setLocalErrors(prev => {
    const newErrors = { ...prev }
    delete newErrors[name]  // Completely remove the error
    return newErrors
})
    }

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        console.log('🔵 Form submitted') // Debug log
        
        // Mark all fields as touched
        setTouched({
            email: true,
            password: true,
            confirmPassword: true,
            firstName: true,
            lastName: true
        })

        // Validate all fields
        const newErrors: Record<string, string> = {}
        
        if (!data.email) {
            newErrors.email = 'Email is required'
        } else if (!validateEmail(data.email)) {
            newErrors.email = 'Please enter a valid email address'
        }
        
        if (!data.password) {
            newErrors.password = 'Password is required'
        } else if (!validatePassword(data.password)) {
            newErrors.password = 'Password must be at least 8 characters with at least one uppercase, one lowercase, one number, and one special character'
        }
        
        if (!data.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (!passwordsMatch) {
            newErrors.confirmPassword = 'Passwords do not match'
        }
        
        if (!data.firstName) {
            newErrors.firstName = 'First name is required'
        } else if (!validateName(data.firstName)) {
            newErrors.firstName = 'First name must be at least 2 characters'
        }
        
        if (!data.lastName) {
            newErrors.lastName = 'Last name is required'
        } else if (!validateName(data.lastName)) {
            newErrors.lastName = 'Last name must be at least 2 characters'
        }

        setLocalErrors(newErrors)

        // 🔴 CRITICAL: If no errors, proceed to next step
        if (Object.keys(newErrors).length === 0) {
            console.log('✅ Form is valid, calling onNext()') // Debug log
            onNext() // This should advance to the next step
        } else {
            console.log('❌ Form has errors:', newErrors) // Debug log
        }
    }

    // ========================================
    // RENDER
    // ========================================

    return (
        <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl mx-auto space-y-6"
        >
            {/* Email Field */}
            <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                        disabled={isLoading}
                        placeholder="you@example.com"
                        className={`
                            w-full pl-9 pr-10 py-3
                            bg-gray-50 dark:bg-gray-800
                            border rounded-lg
                            text-sm text-gray-900 dark:text-white
                            placeholder-gray-500 dark:placeholder-gray-400
                            focus:outline-none focus:ring-2
                            transition-all
                            ${(localErrors.email || errors.email) && touched.email
                                ? 'border-red-500 focus:ring-red-500/20'
                                : data.email && validateEmail(data.email) && touched.email
                                    ? 'border-emerald-500 focus:ring-emerald-500/20'
                                    : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    />
                    {data.email && validateEmail(data.email) && touched.email && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    )}
                </div>
                {(localErrors.email || errors.email) && touched.email && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {localErrors.email || errors.email}
                    </p>
                )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={data.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        disabled={isLoading}
                        placeholder="Create a password"
                        className={`
                            w-full pl-9 pr-10 py-3
                            bg-gray-50 dark:bg-gray-800
                            border rounded-lg
                            text-sm text-gray-900 dark:text-white
                            placeholder-gray-500 dark:placeholder-gray-400
                            focus:outline-none focus:ring-2
                            transition-all
                            ${(localErrors.password || errors.password) && touched.password
                                ? 'border-red-500 focus:ring-red-500/20'
                                : data.password && validatePassword(data.password)
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
                {data.password && (
                    <div className="mt-2">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                    style={{ width: `${passwordStrength.score}%` }}
                                />
                            </div>
                            {passwordStrength.label && (
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {passwordStrength.label}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {(localErrors.password || errors.password) && touched.password && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {localErrors.password || errors.password}
                    </p>
                )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={data.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        disabled={isLoading}
                        placeholder="Confirm your password"
                        className={`
                            w-full pl-9 pr-10 py-3
                            bg-gray-50 dark:bg-gray-800
                            border rounded-lg
                            text-sm text-gray-900 dark:text-white
                            placeholder-gray-500 dark:placeholder-gray-400
                            focus:outline-none focus:ring-2
                            transition-all
                            ${(localErrors.confirmPassword || errors.confirmPassword) && touched.confirmPassword
                                ? 'border-red-500 focus:ring-red-500/20'
                                : data.confirmPassword && passwordsMatch
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
                {(localErrors.confirmPassword || errors.confirmPassword) && touched.confirmPassword && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {localErrors.confirmPassword || errors.confirmPassword}
                    </p>
                )}
                {data.confirmPassword && passwordsMatch && touched.confirmPassword && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Passwords match
                    </p>
                )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1.5">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={data.firstName}
                            onChange={handleChange}
                            onBlur={() => handleBlur('firstName')}
                            disabled={isLoading}
                            placeholder="John"
                            className={`
                                w-full pl-9 pr-3 py-3
                                bg-gray-50 dark:bg-gray-800
                                border rounded-lg
                                text-sm text-gray-900 dark:text-white
                                placeholder-gray-500 dark:placeholder-gray-400
                                focus:outline-none focus:ring-2
                                transition-all
                                ${(localErrors.firstName || errors.firstName) && touched.firstName
                                    ? 'border-red-500 focus:ring-red-500/20'
                                    : data.firstName && validateName(data.firstName)
                                        ? 'border-emerald-500 focus:ring-emerald-500/20'
                                        : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        />
                    </div>
                    {(localErrors.firstName || errors.firstName) && touched.firstName && (
                        <p className="text-xs text-red-600 dark:text-red-400">{localErrors.firstName || errors.firstName}</p>
                    )}
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={data.lastName}
                            onChange={handleChange}
                            onBlur={() => handleBlur('lastName')}
                            disabled={isLoading}
                            placeholder="Doe"
                            className={`
                                w-full pl-9 pr-3 py-3
                                bg-gray-50 dark:bg-gray-800
                                border rounded-lg
                                text-sm text-gray-900 dark:text-white
                                placeholder-gray-500 dark:placeholder-gray-400
                                focus:outline-none focus:ring-2
                                transition-all
                                ${(localErrors.lastName || errors.lastName) && touched.lastName
                                    ? 'border-red-500 focus:ring-red-500/20'
                                    : data.lastName && validateName(data.lastName)
                                        ? 'border-emerald-500 focus:ring-emerald-500/20'
                                        : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        />
                    </div>
                    {(localErrors.lastName || errors.lastName) && touched.lastName && (
                        <p className="text-xs text-red-600 dark:text-red-400">{localErrors.lastName || errors.lastName}</p>
                    )}
                </div>
            </div>

            {/* Success Message - Shows when form is valid */}
            {isFormValid() && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        All fields are valid! Click Continue to proceed.
                    </p>
                </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="
                        flex-1
                        px-4 py-3
                        bg-gray-100 dark:bg-gray-800
                        text-gray-700 dark:text-gray-300
                        font-medium
                        rounded-lg
                        hover:bg-gray-200 dark:hover:bg-gray-700
                        transition-colors
                    "
                >
                    Back
                </button>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="
                        flex-1
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
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            Continue
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </motion.form>
    )
}