// ============================================================================
// LOGIN FORM COMPONENT
// ============================================================================
// LOCATION: /frontend/src/components/auth/LoginForm.tsx
// 
// PURPOSE: Handles login form state, validation, and submission
// 
// FEATURES:
// - Email/password fields with validation
// - Password visibility toggle
// -"Remember me" checkbox
// - Form submission handling
// - Error display
// - Loading state
// - Social login buttons
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
 Mail,
 Lock,
 Eye,
 EyeOff,
 LogIn,
 Chrome,
 Apple,
 Github,
 AlertCircle,
 CheckCircle,
 Loader2
} from 'lucide-react';
import { useAuth } from '@/src/lib/contexts/AuthContext';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface FormData {
 email: string;
 password: string;
 rememberMe: boolean;
}

interface FormErrors {
 email?: string;
 password?: string;
 general?: string;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

const validateEmail = (email: string): boolean => {
 const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
 return re.test(email);
};

const validatePassword = (password: string): boolean => {
 return password.length >= 8;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

 export default function LoginForm() {
 const router = useRouter();
 const { login, login2FA, isLoading: authLoading, user } = useAuth();
 
 // Redirect if already logged in (check user role and redirect to appropriate dashboard)
 useEffect(() => {
 if (user && !authLoading) {
 if (user.role === 'ADMIN') router.push('/dashboard/admin');
 else if (user.role === 'GUIDE') router.push('/dashboard/guide');
 else router.push('/dashboard/traveler');
 }
 }, [user, authLoading, router]);

 // ========================================
 // STATE
 // ========================================
 const [formData, setFormData] = useState<FormData>({
 email: '',
 password: '',
 rememberMe: false
 });

 const [errors, setErrors] = useState<FormErrors>({});
 const [showPassword, setShowPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false); // local loading for button state
 const [touched, setTouched] = useState<Record<string, boolean>>({});

 // 2FA states
 const [requires2fa, setRequires2fa] = useState(false);
 const [tempToken, setTempToken] = useState('');
 const [twoFactorCode, setTwoFactorCode] = useState('');

 // ========================================
 // HANDLERS
 // ========================================

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { name, value, type, checked } = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: type === 'checkbox' ? checked : value
 }));

 // Clear error for this field when user starts typing
 if (errors[name as keyof FormErrors]) {
 setErrors(prev => ({ ...prev, [name]: undefined }));
 }
 };

 const handleBlur = (field: string) => {
 setTouched(prev => ({ ...prev, [field]: true }));
 };

 const validateForm = (): boolean => {
 const newErrors: FormErrors = {};

 if (!formData.email) {
 newErrors.email = 'Email is required';
 } else if (!validateEmail(formData.email)) {
 newErrors.email = 'Please enter a valid email address';
 }

 if (!formData.password) {
 newErrors.password = 'Password is required';
 } else if (!validatePassword(formData.password)) {
 newErrors.password = 'Password must be at least 8 characters';
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 if (requires2fa) {
 if (!twoFactorCode || twoFactorCode.length < 6) {
 setErrors({ general: 'Please enter a valid 6-digit code' });
 return;
 }
 setIsLoading(true);
 setErrors({});
 try {
 await login2FA(tempToken, twoFactorCode, formData.rememberMe);
 } catch (error: any) {
 let message = 'Invalid 2FA code. Please try again.';
 if (error.response?.data?.message) message = error.response.data.message;
 setErrors({ general: message });
 } finally {
 setIsLoading(false);
 }
 return;
 }

 if (!validateForm()) {
 return;
 }

 setIsLoading(true);
 setErrors({}); // clear general errors

 try {
 const response = await login(formData.email, formData.password, formData.rememberMe);
 if (response && response.requires2fa) {
 setRequires2fa(true);
 setTempToken(response.tempToken || '');
 }
 } catch (error: any) {
 // Try to extract error message from backend response
 let message = 'Invalid email or password. Please try again.';
 if (error.response?.data?.message) {
 message = error.response.data.message;
 } else if (error.response?.data?.error) {
 message = error.response.data.error;
 }

 setErrors({ general: message });
 } finally {
 setIsLoading(false);
 }
 };

 const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);

 const handleSocialLogin = async (provider: string) => {
 if (provider === 'Google') {
 setIsSocialLoading('Google');
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
    
    try {
      // Ping the backend to wake it up (e.g., if on Render free tier)
      // We use mode: 'no-cors' so it doesn't fail on CORS preflight, we just want to hit it.
      // The await will block until the backend responds (wakes up).
      await fetch(`${backendUrl}/api/health`, { mode: 'no-cors' });
    } catch (err) {
      // Ignore network errors, proceed to redirect anyway
    }

    window.location.href = `${backendUrl}/api/auth/oauth2/google/start?role=Traveler`;

 } else {
  toast.loading(`${provider} login coming in Phase 3`);
 }
 };

 // ========================================
 // RENDER
 // ========================================

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="w-full"
 >
 <div suppressHydrationWarning className="w-full sm:surface-card rounded-[2rem] sm:rounded-[2.5rem] sm:border border-theme sm:shadow-2xl px-0 py-4 sm:p-12">
 {/* ========================================
 GENERAL ERROR MESSAGE
 ======================================== */}
 {errors.general && (
 <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-danger-red dark:border-danger-red rounded-lg flex items-start gap-3">
 <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
 <p className="text-sm text-red-700 dark:text-red-300">
 {errors.general}
 </p>
 </div>
 )}

 {/* ========================================
 FORM
 ======================================== */}
 <form onSubmit={handleSubmit} className="space-y-5">
 {requires2fa ? (
 <div className="space-y-4">
 <div className="text-center mb-6">
 <p className="text-sm text-theme-muted mb-2">Two-Factor Authentication is enabled.</p>
 <p className="text-xs text-theme-secondary font-medium">Open your Authenticator app and enter the 6-digit code below.</p>
 </div>
 <div className="space-y-1.5">
 <label htmlFor="twoFactorCode" className="block text-sm font-medium text-theme-secondary">
 Authentication Code
 </label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type="text"
 id="twoFactorCode"
 value={twoFactorCode}
 onChange={(e) => {
 setTwoFactorCode(e.target.value);
 if (errors.general) setErrors({});
 }}
 disabled={isLoading}
 placeholder="000000"
 maxLength={6}
 className="w-full pl-9 pr-3 py-3 md:py-2.5 surface-section border border-theme-strong focus:ring-primary-light focus:border-primary-light rounded-lg text-sm text-theme-primary transition-all disabled:opacity-50 tracking-widest text-center text-lg"
 />
 </div>
 </div>
 <button
 type="submit"
 disabled={isLoading || twoFactorCode.length < 6}
 className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
 >
 {isLoading ? (
 <>
 <div className="w-4 h-4 border-2 border-theme border-t-transparent rounded-full animate-spin" />
 <span>Verifying...</span>
 </>
 ) : (
 <>
 <Shield className="w-4 h-4" />
 <span>Verify Code</span>
 </>
 )}
 </button>
 <button
 type="button"
 onClick={() => { setRequires2fa(false); setTwoFactorCode(''); }}
 className="w-full text-sm font-medium text-theme-muted hover:text-theme-secondary mt-2"
 >
 Cancel
 </button>
 </div>
 ) : (
 <>
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
 name="email"
 value={formData.email}
 onChange={handleChange}
 onBlur={() => handleBlur('email')}
 disabled={isLoading}
 placeholder="you@example.com"
 className={`
 w-full pl-9 pr-3 py-3 md:py-2.5
 surface-section
 border rounded-lg
 text-sm text-theme-primary
 placeholder-gray-500 dark:placeholder-gray-400
 focus:outline-none focus:ring-2
 transition-all
 ${errors.email && touched.email
 ? 'border-danger-red focus:ring-danger-red/20'
 : 'border-theme-strong focus:ring-primary-light dark:ring-primary-dark/20 focus:border-primary-light dark:border-primary-dark'
 }
 disabled:opacity-50 disabled:cursor-not-allowed
 `}
 />
 </div>
 {errors.email && touched.email && (
 <p className="text-xs text-red-600 dark:text-red-400 mt-1">
 {errors.email}
 </p>
 )}
 </div>

 {/* Password Field */}
 <div className="space-y-1.5">
 <div className="flex items-center justify-between">
 <label htmlFor="password" className="block text-sm font-medium text-theme-secondary">
 Password
 </label>
 <Link
 href="/auth/forgot-password"
 className="text-xs font-medium text-primary-light dark:text-primary-dark hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
 >
 Forgot password?
 </Link>
 </div>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type={showPassword ? 'text' : 'password'}
 id="password"
 name="password"
 value={formData.password}
 onChange={handleChange}
 onBlur={() => handleBlur('password')}
 disabled={isLoading}
 placeholder="••••••••"
 className={`
 w-full pl-9 pr-10 py-3 md:py-2.5
 surface-section
 border rounded-lg
 text-sm text-theme-primary
 placeholder-gray-500 dark:placeholder-gray-400
 focus:outline-none focus:ring-2
 transition-all
 ${errors.password && touched.password
 ? 'border-danger-red focus:ring-danger-red/20'
 : 'border-theme-strong focus:ring-primary-light dark:ring-primary-dark/20 focus:border-primary-light dark:border-primary-dark'
 }
 disabled:opacity-50 disabled:cursor-not-allowed
 `}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300 transition-colors"
 aria-label={showPassword ? 'Hide password' : 'Show password'}
 >
 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {errors.password && touched.password && (
 <p className="text-xs text-red-600 dark:text-red-400 mt-1">
 {errors.password}
 </p>
 )}
 </div>

 {/* Remember Me */}
 <div className="flex items-center justify-between">
 <label className="flex items-center gap-2 cursor-pointer group">
 <div className="relative flex items-center justify-center">
 <input
 type="checkbox"
 name="rememberMe"
 checked={formData.rememberMe}
 onChange={handleChange}
 className="peer absolute opacity-0 w-4 h-4 cursor-pointer"
 aria-label="Remember me"
 />
 <div className={`
 w-4 h-4 border rounded transition-all duration-200 flex items-center justify-center
 ${formData.rememberMe
 ? 'bg-primary-light border-primary-light'
 : 'surface-card border-theme-strong group-hover:border-theme-strong'
 }
 `}>
 {formData.rememberMe && (
 <CheckCircle className="w-3 h-3 text-white" />
 )}
 </div>
 </div>
 <span className="text-sm text-theme-secondary">
 Remember me
 </span>
 </label>

 <Link
 href="/help"
 className="text-sm text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300 transition-colors"
 >
 Need help?
 </Link>
 </div>

 {/* Submit Button */}
 <button
 type="submit"
 disabled={isLoading}
 className="
 w-full py-3
 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg
 "
 >
 {isLoading ? (
 <>
 <div className="w-4 h-4 border-2 border-theme border-t-transparent rounded-full animate-spin" />
 <span>Signing in...</span>
 </>
 ) : (
 <>
 <LogIn className="w-4 h-4" />
 <span>Sign In</span>
 </>
 )}
 </button>
 </>
 )}
 </form>

 {/* ========================================
 SOCIAL LOGIN DIVIDER
 ======================================== */}
 <div className="relative my-6 sm:my-8">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-t border-[#c8d8f8] dark:border-[#1a3566]" />
 </div>
 <div className="relative flex justify-center text-[10px] tracking-normal capitalize font-bold">
 <span className="px-4 surface-base sm:surface-card text-theme-muted">
 Or connect with
 </span>
 </div>
 </div>

 {/* ========================================
 SOCIAL LOGIN BUTTON - Full Width
 ======================================== */}
 {!requires2fa && (
 <div className="mt-6">
 <button
 onClick={() => handleSocialLogin('Google')}
 disabled={isLoading || isSocialLoading !== null}
 className="w-full py-3 rounded-lg surface-card border border-theme flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all shadow-sm hover:shadow-md text-sm font-semibold text-theme-primary"
 aria-label="Sign in with Google"
 >
 {isSocialLoading === 'Google' ? (
 <Loader2 className="w-5 h-5 animate-spin text-primary-light dark:text-primary-dark" />
 ) : (
 <Chrome className="w-5 h-5 text-theme-secondary " />
 )}
 <span>Continue with Google</span>
 </button>
 </div>
 )}
 </div>
 </motion.div>
 );
}
