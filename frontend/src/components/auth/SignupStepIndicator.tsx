// ============================================================================
// SIGNUP STEP INDICATOR
// ============================================================================
// LOCATION: /frontend/src/components/auth/SignupStepIndicator.tsx
// 
// PURPOSE: Visual progress indicator for multi-step signup
// 
// FEATURES:
// - Shows current step
// - Shows completed steps
// - Different flows for traveler vs guide
// - Clickable completed steps
// - Responsive design
// ============================================================================

'use client'

import { Check } from 'lucide-react'
import { SignupStep, UserRole } from '@/src/types/auth.types'

interface SignupStepIndicatorProps {
 currentStep: SignupStep
 completedSteps: SignupStep[]
 role: UserRole | null
 onStepClick?: (step: SignupStep) => void
}

const getStepsForRole = (role: UserRole | null): Array<{
 step: SignupStep
 label: string
 description: string
}> => {
 if (role === UserRole.GUIDE) {
 return [
 {
 step: SignupStep.ROLE_SELECTION,
 label: 'Choose Role',
 description: 'Select your path'
 },
 {
 step: SignupStep.ACCOUNT_DETAILS,
 label: 'Account',
 description: 'Create account'
 },
 // {
 // step: SignupStep.PROFILE_SETUP,
 // label: 'Profile',
 // description: 'Tell us about yourself'
 // },
 // {
 // step: SignupStep.VERIFICATION,
 // label: 'Verification',
 // description: 'Verify identity'
 // },
 {
 step: SignupStep.COMPLETED,
 label: 'Complete',
 description: 'Start guiding'
 }
 ]
 }

 // Traveler flow
 return [
 {
 step: SignupStep.ROLE_SELECTION,
 label: 'Choose Role',
 description: 'Select your path'
 },
 {
 step: SignupStep.ACCOUNT_DETAILS,
 label: 'Account',
 description: 'Create account'
 },
 // {
 // step: SignupStep.PROFILE_SETUP,
 // label: 'Preferences',
 // description: 'Set preferences'
 // },
 {
 step: SignupStep.COMPLETED,
 label: 'Complete',
 description: 'Start exploring'
 }
 ]
}

export default function SignupStepIndicator({
 currentStep,
 completedSteps,
 role,
 onStepClick
}: SignupStepIndicatorProps) {
 const steps = getStepsForRole(role)

 return (
 <div className="w-full">
 {/* Desktop Steps */}
 <div className="hidden sm:block">
 <div className="relative">
 {/* Progress Line */}
 <div className="absolute top-4 left-0 w-full h-[1px] surface-section">
 <div
 className="absolute h-full bg-primary-light dark:bg-primary-light transition-all duration-500"
 style={{
 width: `${
 (steps.findIndex(s => s.step === currentStep) /
 (steps.length - 1)) *
 100
 }%`
 }}
 />
 </div>

 {/* Steps */}
 <div className="relative flex justify-between">
 {steps.map((step, index) => {
 const isCompleted = completedSteps.includes(step.step)
 const isCurrent = currentStep === step.step
 const isClickable = isCompleted && onStepClick

 return (
 <button
 key={step.step}
 onClick={() => isClickable && onStepClick(step.step)}
 className={`
 flex flex-col items-center
 ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
 transition-opacity
 `}
 disabled={!isClickable}
 >
 {/* Step Circle */}
 <div
 className={`
 w-8 h-8 rounded-full flex items-center justify-center
 border transition-all duration-300
 ${isCompleted || isCurrent
 ? 'border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark shadow-sm'
 : 'border-theme'
 }
 ${isCompleted
 ? 'bg-primary-light dark:bg-primary-light'
 : isCurrent
 ? 'bg-primary-light/10 '
 : 'surface-card'
 }
 `}
 >
 {isCompleted ? (
 <Check className="w-4 h-4 text-white" />
 ) : (
 <span
 className={`
 text-[10px] font-black
 ${isCurrent
 ? 'text-primary-light dark:text-primary-dark dark:text-primary-dark '
 : 'text-theme-muted '
 }
 `}
 >
 {index + 1}
 </span>
 )}
 </div>

 {/* Step Label */}
 <div className="mt-3 text-center">
 <p
 className={`
 text-[10px] font-black uppercase tracking-widest
 ${isCurrent
 ? 'text-primary-light dark:text-primary-dark dark:text-primary-dark '
 : isCompleted
 ? 'text-theme-primary'
 : 'text-theme-muted '
 }
 `}
 >
 {step.label}
 </p>
 </div>
 </button>
 )
 })}
 </div>
 </div>
 </div>

 {/* Mobile Steps - Simplified */}
 <div className="sm:hidden">
 <div className="flex items-center justify-between mb-2">
 <p className="text-sm text-theme-secondary ">
 Step {steps.findIndex(s => s.step === currentStep) + 1} of {steps.length}
 </p>
 <p className="text-sm font-medium text-primary-light dark:text-primary-dark dark:text-primary-dark ">
 {steps.find(s => s.step === currentStep)?.label}
 </p>
 </div>
 <div className="w-full h-1 surface-section rounded-full overflow-hidden">
 <div
 className="h-full bg-primary-light dark:bg-primary-light transition-all duration-500"
 style={{
 width: `${
 ((steps.findIndex(s => s.step === currentStep) + 1) /
 steps.length) *
 100
 }%`
 }}
 />
 </div>
 </div>
 </div>
 )
}