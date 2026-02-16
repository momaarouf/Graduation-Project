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
            {
                step: SignupStep.PROFILE_SETUP,
                label: 'Profile',
                description: 'Tell us about yourself'
            },
            {
                step: SignupStep.VERIFICATION,
                label: 'Verification',
                description: 'Verify identity'
            },
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
        {
            step: SignupStep.PROFILE_SETUP,
            label: 'Preferences',
            description: 'Set preferences'
        },
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
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800">
                        <div
                            className="absolute h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
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
                                        ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                                    `}
                                    disabled={!isClickable}
                                >
                                    {/* Step Circle */}
                                    <div
                                        className={`
                                            w-10 h-10 rounded-full flex items-center justify-center
                                            border-2 transition-all duration-300
                                            ${isCompleted || isCurrent
                                                ? 'border-blue-600 dark:border-blue-500'
                                                : 'border-gray-300 dark:border-gray-700'
                                            }
                                            ${isCompleted
                                                ? 'bg-blue-600 dark:bg-blue-500'
                                                : isCurrent
                                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                                    : 'bg-white dark:bg-gray-900'
                                            }
                                        `}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-5 h-5 text-white" />
                                        ) : (
                                            <span
                                                className={`
                                                    text-sm font-semibold
                                                    ${isCurrent
                                                        ? 'text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-500 dark:text-gray-400'
                                                    }
                                                `}
                                            >
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Step Label */}
                                    <div className="mt-2 text-center">
                                        <p
                                            className={`
                                                text-xs font-semibold
                                                ${isCurrent
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : isCompleted
                                                        ? 'text-gray-900 dark:text-white'
                                                        : 'text-gray-500 dark:text-gray-400'
                                                }
                                            `}
                                        >
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 hidden md:block">
                                            {step.description}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Step {steps.findIndex(s => s.step === currentStep) + 1} of {steps.length}
                    </p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {steps.find(s => s.step === currentStep)?.label}
                    </p>
                </div>
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
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