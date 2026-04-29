// ============================================================================
// SIGNUP PAGE - COMPLETE API-READY VERSION
// ============================================================================
// LOCATION: /frontend/src/app/auth/signup/page.tsx
// 
// PURPOSE: Multi-step signup flow with complete validation
// 
// FEATURES:
// ✓ Role selection (Traveler/Guide)
// ✓ Account creation with validation
// ✓ Profile setup (role-specific)
// ✓ Guide verification upload
// ✓ Terms agreement
// ✓ Newsletter opt-in
// ✓ API-ready structure
// ============================================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ChevronLeft, Shield, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import { SignupProvider, useSignup } from '@/src/lib/contexts/SignupContext';
import { SignupStep } from '@/src/types/auth.types';
import { useAuth } from '@/src/lib/contexts/AuthContext';
import AuthLayout from '@/app/auth/layout';
import SignupStepIndicator from '@/src/components/auth/SignupStepIndicator';
import SignupPathSelector from '@/src/components/auth/SignupPathSelector';
import AccountDetailsForm from '@/src/components/auth/AccountDetailsForm';
import TermsAgreement from '@/src/components/auth/TermsAgreement';

// ============================================================================
// MAIN SIGNUP CONTENT (uses context)
// ============================================================================

function SignupContent() {
 const {
 data,
 errors,
 isLoading,
 currentStep,
 completedSteps,
 setRole,
 nextStep,
 prevStep,
 reset
 } = useSignup();

 const [isSubmitting, setIsSubmitting] = useState(false);
 const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

 // Pull register from AuthContext — it handles token, /me, user hydration, and redirect
 const { register: authRegister } = useAuth();

 // ========================================
 // HANDLE FINAL SUBMISSION
 // ========================================

 const handleSubmit = async () => {
 setIsSubmitting(true);
 setServerErrors({});

 try {
 // Build fullName from first + last
 const fullName = data.firstName && data.lastName
 ? `${data.firstName} ${data.lastName}`.trim()
 : data.firstName || data.lastName || '';

 // AuthContext.register() handles everything:
 // 1. POST /api/auth/register
 // 2. Store token (setAccessToken)
 // 3. GET /api/auth/me → hydrate user state
 // 4. Role-based redirect to correct dashboard
 await authRegister(
 data.email,
 data.password,
 data.role!,
 fullName,
 data.agreedToTerms,
 data.agreedToPrivacy,
 data.newsletterOptIn,
 data.marketingOptIn
 );

 toast.success('Account created successfully!');
 reset(); // Clear form

 } catch (error: any) {
 console.error('Signup error:', error);

 // Capture and display backend validation errors
 if (error.response?.data?.errors) {
 // Backend returned field-specific errors (from validation)
 setServerErrors(error.response.data.errors);
 } else if (error.response?.data?.message) {
 // General error message
 setServerErrors({ general: error.response.data.message });
 } else {
 setServerErrors({ general: 'Failed to create account. Please try again.' });
 }
 } finally {
 setIsSubmitting(false);
 }
 };

 // ========================================
 // RENDER CURRENT STEP
 // ========================================

 const renderStep = () => {
 switch (currentStep) {
 case SignupStep.ROLE_SELECTION:
 return (
 <SignupPathSelector
 selectedRole={data.role}
 onSelect={setRole}
 />
 );

 case SignupStep.ACCOUNT_DETAILS:
 return (
 <AccountDetailsForm
 onNext={nextStep}
 onBack={prevStep}
 />
 );

 case SignupStep.COMPLETED:
 return (
 <TermsAgreement
 onSubmit={handleSubmit}
 onBack={prevStep}
 isSubmitting={isSubmitting}
 serverErrors={serverErrors}
 />
 );

 default:
 return null;
 }
 };

 return (
 <div className="min-h-screen relative flex flex-col items-center justify-center py-12 px-4 overflow-hidden">
 {/* Background Decorative Elements */}
 <div className="fixed inset-0 pointer-events-none overflow-hidden">
 <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-light/10 rounded-full blur-[120px]" />
 <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]" />
 </div>

 <div className="w-full max-w-4xl relative z-10">
 {/* BACK BUTTON */}
 <div className="mb-8">
 <Link
 href="/"
 className="inline-flex items-center gap-2 text-sm font-bold text-theme-muted hover:text-primary-light dark:text-primary-dark transition-colors group"
 >
 <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
 Back to Home
 </Link>
 </div>
 
 {/* Header */}
 <div className="text-center mb-10">
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
 >
 <Sparkles className="w-3 h-3" />
 Join our community
 </motion.div>

 <h1 className="text-4xl font-black text-theme-primary tracking-tight mb-3">
 Create Your <span className="text-primary-light dark:text-primary-dark">Account</span>
 </h1>

 <p className="text-theme-muted font-medium max-w-lg mx-auto">
 Secure your spot in the marketplace and discover authentic halal-friendly experiences.
 </p>
 </div>

 {/* Step Indicator */}
 {data.role && (
 <div className="mb-10 max-w-2xl mx-auto">
 <SignupStepIndicator
 currentStep={currentStep}
 completedSteps={completedSteps}
 role={data.role}
 />
 </div>
 )}

 {/* Step Content with Animation */}
 <div className="relative min-h-[400px]">
 <AnimatePresence mode="wait">
 <motion.div
 key={currentStep}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3 }}
 >
 {renderStep()}
 </motion.div>
 </AnimatePresence>
 </div>

 {/* Minimal Footer Footer */}
 <p className="mt-12 text-center text-sm text-theme-muted font-medium">
 Already have an account?{' '}
 <Link 
 href="/auth/login" 
 className="text-primary-light dark:text-primary-dark font-black hover:underline"
 >
 Sign in
 </Link>
 </p>

 <div className="mt-8 flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-theme-muted">
 <span className="flex items-center gap-1.5">
 <Shield className="w-3 h-3" />
 Secure SSL
 </span>
 <Link href="/terms" className="hover:text-theme-secondary dark:hover:text-gray-200 transition-colors">Terms</Link>
 <Link href="/privacy" className="hover:text-theme-secondary dark:hover:text-gray-200 transition-colors">Privacy</Link>
 </div>
 </div>
 </div>
 );
}

// ============================================================================
// MAIN PAGE (wrapped in provider)
// ============================================================================

export default function SignupPage() {
 return (
 <AuthLayout hideBackButton={false}>
 <SignupProvider>
 <SignupContent />
 </SignupProvider>
 </AuthLayout>
 );
}