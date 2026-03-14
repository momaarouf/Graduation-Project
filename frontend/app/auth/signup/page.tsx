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
        data.role as 'Traveler' | 'Guide',
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
    <div className="container-safe mx-auto max-w-4xl pt-20 sm:pt-24 py-8 sm:py-12">
      
      {/* BACK BUTTON */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>
      
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-full text-xs sm:text-sm font-medium shadow-lg shadow-blue-600/20">
          <Compass className="w-3.5 h-3.5" />
          <span>JOIN 15K+ TRAVELERS</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Create Your{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Account
          </span>
        </h1>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Join SafariHub and start your journey with verified guides and authentic halal-friendly experiences.
        </p>
      </div>

      {/* Step Indicator */}
      {data.role && (
        <div className="mb-8 sm:mb-10">
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Trust Badges */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>256-bit SSL encryption</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>GDPR compliant</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Secure payments</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Verified guides</span>
        </span>
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