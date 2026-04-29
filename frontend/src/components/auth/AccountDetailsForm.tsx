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
 if (!password) return { score: 0, label: '', color: 'surface-section' };
 
 let score = 0;
 if (password.length >= 8) score++;
 if (password.length >= 12) score++;
 if (/[A-Z]/.test(password)) score++;
 if (/[0-9]/.test(password)) score++;
 if (/[^a-zA-Z0-9]/.test(password)) score++; // any non-alphanumeric

 if (score <= 2) return { score: 20, label: 'Weak', color: 'bg-red-500' };
 if (score <= 3) return { score: 50, label: 'Fair', color: 'bg-orange-500' };
 if (score <= 4) return { score: 75, label: 'Good', color: 'bg-primary-light' };
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
 delete newErrors[name] // Completely remove the error
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
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 onSubmit={handleSubmit}
 className="w-full max-w-2xl mx-auto"
 >
 <div className="surface-card  border border-theme rounded-3xl p-8 shadow-xl shadow-blue-600/5 space-y-8">
 {/* Name Fields */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 {/* First Name */}
 <div className="space-y-2">
 <label htmlFor="firstName" className="block text-[10px] font-black uppercase tracking-widest text-theme-muted ml-1">
 First Name
 </label>
 <div className="relative group">
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted group-focus-within:text-primary-light dark:text-primary-dark transition-colors">
 <User size={18} strokeWidth={1.5} />
 </div>
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
 w-full pl-12 pr-4 py-4
 surface-card
 border rounded-2xl
 text-sm font-bold text-theme-primary
 placeholder-gray-400
 focus:outline-none focus:ring-4
 transition-all duration-300
 ${(localErrors.firstName || errors.firstName) && touched.firstName
 ? 'border-danger-red/50 focus:ring-danger-red/10'
 : 'border-theme focus:ring-primary-light dark:ring-primary-dark/10 focus:border-primary-light dark:border-primary-dark'
 }
 `}
 />
 </div>
 </div>

 {/* Last Name */}
 <div className="space-y-2">
 <label htmlFor="lastName" className="block text-[10px] font-black uppercase tracking-widest text-theme-muted ml-1">
 Last Name
 </label>
 <div className="relative group">
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted group-focus-within:text-primary-light dark:text-primary-dark transition-colors">
 <User size={18} strokeWidth={1.5} />
 </div>
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
 w-full pl-12 pr-4 py-4
 surface-card
 border rounded-2xl
 text-sm font-bold text-theme-primary
 placeholder-gray-400
 focus:outline-none focus:ring-4
 transition-all duration-300
 ${(localErrors.lastName || errors.lastName) && touched.lastName
 ? 'border-danger-red/50 focus:ring-danger-red/10'
 : 'border-theme focus:ring-primary-light dark:ring-primary-dark/10 focus:border-primary-light dark:border-primary-dark'
 }
 `}
 />
 </div>
 </div>
 </div>

 {/* Email Field */}
 <div className="space-y-2">
 <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-theme-muted ml-1">
 Email Address
 </label>
 <div className="relative group">
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted group-focus-within:text-primary-light dark:text-primary-dark transition-colors">
 <Mail size={18} strokeWidth={1.5} />
 </div>
 <input
 type="email"
 id="email"
 name="email"
 value={data.email}
 onChange={handleChange}
 onBlur={() => handleBlur('email')}
 disabled={isLoading}
 placeholder="you@adventure.com"
 className={`
 w-full pl-12 pr-12 py-4
 surface-card
 border rounded-2xl
 text-sm font-bold text-theme-primary
 placeholder-gray-400
 focus:outline-none focus:ring-4
 transition-all duration-300
 ${(localErrors.email || errors.email) && touched.email
 ? 'border-danger-red/50 focus:ring-danger-red/10'
 : data.email && validateEmail(data.email) && touched.email
 ? 'border-success-green/50 focus:ring-success-green/10'
 : 'border-theme focus:ring-primary-light dark:ring-primary-dark/10 focus:border-primary-light dark:border-primary-dark'
 }
 `}
 />
 {data.email && validateEmail(data.email) && touched.email && (
 <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
 )}
 </div>
 </div>

 {/* Password Field */}
 <div className="space-y-2">
 <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-theme-muted ml-1">
 Password
 </label>
 <div className="relative group">
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted group-focus-within:text-primary-light dark:text-primary-dark transition-colors">
 <Lock size={18} strokeWidth={1.5} />
 </div>
 <input
 type={showPassword ? 'text' : 'password'}
 id="password"
 name="password"
 value={data.password}
 onChange={handleChange}
 onBlur={() => handleBlur('password')}
 disabled={isLoading}
 placeholder="Min. 8 characters"
 className={`
 w-full pl-12 pr-12 py-4
 surface-card
 border rounded-2xl
 text-sm font-bold text-theme-primary
 placeholder-gray-400
 focus:outline-none focus:ring-4
 transition-all duration-300
 ${(localErrors.password || errors.password) && touched.password
 ? 'border-danger-red/50 focus:ring-danger-red/10'
 : 'border-theme focus:ring-primary-light dark:ring-primary-dark/10 focus:border-primary-light dark:border-primary-dark'
 }
 `}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-primary-light dark:text-primary-dark transition-colors"
 >
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>

 {/* Password Strength */}
 {data.password && (
 <div className="px-1 py-1">
 <div className="flex items-center justify-between mb-1.5">
 <span className={`text-[10px] font-black uppercase tracking-widest ${passwordStrength.color.replace('bg-', 'text-')}`}>
 {passwordStrength.label} Strength
 </span>
 <span className="text-[10px] font-black text-theme-muted">{passwordStrength.score}%</span>
 </div>
 <div className="h-1 w-full surface-section rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${passwordStrength.score}%` }}
 className={`h-full ${passwordStrength.color}`}
 />
 </div>
 </div>
 )}
 </div>

 {/* Confirm Password */}
 <div className="space-y-2">
 <label htmlFor="confirmPassword" className="block text-[10px] font-black uppercase tracking-widest text-theme-muted ml-1">
 Confirm Password
 </label>
 <div className="relative group">
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted group-focus-within:text-primary-light dark:text-primary-dark transition-colors">
 <Lock size={18} strokeWidth={1.5} />
 </div>
 <input
 type={showConfirmPassword ? 'text' : 'password'}
 id="confirmPassword"
 name="confirmPassword"
 value={data.confirmPassword}
 onChange={handleChange}
 onBlur={() => handleBlur('confirmPassword')}
 disabled={isLoading}
 placeholder="Match your password"
 className={`
 w-full pl-12 pr-12 py-4
 surface-card
 border rounded-2xl
 text-sm font-bold text-theme-primary
 placeholder-gray-400
 focus:outline-none focus:ring-4
 transition-all duration-300
 ${(localErrors.confirmPassword || errors.confirmPassword) && touched.confirmPassword
 ? 'border-danger-red/50 focus:ring-danger-red/10'
 : data.confirmPassword && passwordsMatch
 ? 'border-success-green/50 focus:ring-success-green/10'
 : 'border-theme focus:ring-primary-light dark:ring-primary-dark/10 focus:border-primary-light dark:border-primary-dark'
 }
 `}
 />
 <button
 type="button"
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-primary-light dark:text-primary-dark transition-colors"
 >
 {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 </div>

 {/* Error Banner */}
 {(Object.keys(localErrors).length > 0) && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 className="p-4 bg-red-500/5 border border-danger-red/20 rounded-2xl"
 >
 <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
 <AlertCircle size={14} />
 Please fix the errors in the form above.
 </p>
 </motion.div>
 )}

 {/* Success Banner */}
 {isFormValid() && !Object.keys(localErrors).length && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 className="p-4 bg-emerald-500/5 border border-success-green/20 rounded-2xl"
 >
 <p className="text-xs font-bold text-success-green dark:text-emerald-400 flex items-center gap-2">
 <CheckCircle size={14} />
 Everything looks perfect! Ready to continue.
 </p>
 </motion.div>
 )}

 {/* Form Actions */}
 <div className="flex gap-4">
 <button
 type="button"
 onClick={onBack}
 className="flex-1 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest surface-card text-theme-secondary border border-theme hover:surface-section dark:hover:surface-section transition-all duration-300"
 >
 Back
 </button>

 <button
 type="submit"
 disabled={isLoading}
 className={`
 flex-1 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group
 ${isFormValid() 
 ? 'bg-primary-light text-white shadow-xl shadow-blue-600/20 hover:bg-primary-light-hover' 
 : 'surface-section text-theme-muted cursor-not-allowed'
 }
 `}
 >
 {isLoading ? (
 <div className="w-4 h-4 border-2 border-theme border-t-transparent rounded-full animate-spin" />
 ) : (
 <>
 Next Step
 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
 </>
 )}
 </button>
 </div>
 </div>
 </motion.form>
 )
}