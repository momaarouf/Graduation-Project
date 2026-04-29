'use client'

// ============================================================================
// GUIDE ONBOARDING PREVIEW - SHOW VERIFICATION STEPS & BENEFITS
// ============================================================================
// LOCATION: /frontend/src/components/auth/GuideOnboardingPreview.tsx
// 
// PURPOSE: Show potential guides what they need to complete
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Manual ID verification (admin reviews ID + selfie)
// ✓ Impact score and badge system
// ✓ Tiered fees (high-ranked guides pay lower fees)
// ✓ Tour creation tools
// 
// COLOR PSYCHOLOGY:
// - Blue: Trust (ID verification)
// - Gold: Premium (Earnings potential)
// - Green: Success (Completed steps)
// - Orange: Action (Call to action)
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

import { useState } from 'react'
import {
 CheckCircle,
 Clock,
 Shield,
 Camera,
 UserCheck,
 FileText,
 DollarSign,
 TrendingUp,
 Award,
 Star,
 Users,
 Globe,
 HelpCircle,
 ChevronRight,
 AlertCircle
} from 'lucide-react'
export enum GuideOnboardingStep {
 ACCOUNT_CREATION = 'ACCOUNT_CREATION',
 PROFILE_SETUP = 'PROFILE_SETUP',
 ID_VERIFICATION = 'ID_VERIFICATION',
 TOUR_CREATION = 'TOUR_CREATION',
 COMPLETED = 'COMPLETED'
}

export const GuideOnboardingStepLabels: Record<GuideOnboardingStep, string> = {
 [GuideOnboardingStep.ACCOUNT_CREATION]: 'Create Account',
 [GuideOnboardingStep.PROFILE_SETUP]: 'Complete Profile',
 [GuideOnboardingStep.ID_VERIFICATION]: 'Verify Identity',
 [GuideOnboardingStep.TOUR_CREATION]: 'Create First Tour',
 [GuideOnboardingStep.COMPLETED]: 'Ready to Earn'
}

const MOCK_GUIDE_ONBOARDING = {
 estimatedTimeMinutes: 15,
 steps: [
 { step: GuideOnboardingStep.ACCOUNT_CREATION, label: 'Create Account', description: 'Basic details and role selection', estimatedTime: '2 min' },
 { step: GuideOnboardingStep.PROFILE_SETUP, label: 'Complete Profile', description: 'Add your bio, languages, and expertise', estimatedTime: '5 min' },
 { step: GuideOnboardingStep.ID_VERIFICATION, label: 'Verify Identity', description: 'Upload government ID and selfie', estimatedTime: '3 min' },
 { step: GuideOnboardingStep.TOUR_CREATION, label: 'Create First Tour', description: 'Design your first experience offering', estimatedTime: '5 min' }
 ],
 benefits: [
 { title: 'Earn on Your Terms', description: 'Set your own schedule and prices. Keep up to 92% of what you charge.' },
 { title: 'Global Reach', description: 'Connect with travelers seeking authentic local experiences.' },
 { title: 'Secure Platform', description: 'Guaranteed payouts, verified travelers, and 24/7 support.' },
 { title: 'Growth Tools', description: 'Access analytics, scheduling tools, and marketing support.' }
 ]
}
interface GuideOnboardingPreviewProps {
 /** Show compact version */
 compact?: boolean
 /** Additional CSS classes */
 className?: string
}

// ============================================================================
// STEP ICON MAPPING
// ============================================================================

const STEP_ICONS: Record<GuideOnboardingStep, typeof Shield> = {
 [GuideOnboardingStep.ACCOUNT_CREATION]: FileText,
 [GuideOnboardingStep.PROFILE_SETUP]: Camera,
 [GuideOnboardingStep.ID_VERIFICATION]: Shield,
 [GuideOnboardingStep.TOUR_CREATION]: Globe,
 [GuideOnboardingStep.COMPLETED]: CheckCircle
}

// ============================================================================
// BENEFIT CARD COMPONENT
// ============================================================================

interface BenefitCardProps {
 icon: React.ElementType
 title: string
 description: string
 index: number
}

function BenefitCard({ icon: Icon, title, description, index }: BenefitCardProps) {
 return (
 <div className="group relative p-5 surface-card border border-theme rounded-xl hover:shadow-lg hover:border-primary-light dark:border-primary-dark dark:hover:border-primary-light dark:border-primary-dark transition-all duration-300 hover:-translate-y-1"
 style={{
 animationDelay: `${index * 100}ms`
 }}
 >
 {/* Icon with gradient background */}
 <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
 <Icon className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
 </div>

 {/* Title */}
 <h4 className="font-bold text-theme-primary mb-1.5">
 {title}
 </h4>

 {/* Description */}
 <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
 {description}
 </p>

 {/* Decorative corner accent */}
 <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
 <div className="w-1 h-1 rounded-full bg-blue-400" />
 </div>
 </div>
 )
}

// ============================================================================
// STEP COMPONENT
// ============================================================================

interface StepProps {
 step: GuideOnboardingStep
 label: string
 description: string
 estimatedTime: string
 icon: React.ElementType
 isActive?: boolean
 isCompleted?: boolean
 index: number
}

function Step({
 step,
 label,
 description,
 estimatedTime,
 icon: Icon,
 isActive = false,
 isCompleted = false,
 index
}: StepProps) {
 return (
 <div className="relative flex gap-4 group">
 {/* ========================================
 CONNECTOR LINE (except for last step)
 ======================================== */}
 {index < 4 && (
 <div className="absolute left-[23px] top-[45px] bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-last:hidden" />
 )}

 {/* ========================================
 STEP INDICATOR
 ======================================== */}
 <div className="relative z-10">
 <div className={`w-[46px] h-[46px] rounded-2xl flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-emerald-500 dark:bg-emerald-600 text-white' : isActive ? 'bg-primary-light dark:bg-primary-dark text-white ring-4 ring-primary-light dark:ring-primary-dark dark:ring-primary-light dark:ring-primary-dark' : 'surface-section text-theme-muted '}`}>
 {isCompleted ? (
 <CheckCircle className="w-5 h-5" />
 ) : (
 <Icon className="w-5 h-5" />
 )}
 </div>

 {/* Estimated time badge */}
 <div className="absolute -right-2 -bottom-1 px-1.5 py-0.5 surface-card border border-theme rounded-full text-[10px] font-medium text-theme-secondary whitespace-nowrap shadow-sm">
 {estimatedTime}
 </div>
 </div>

 {/* ========================================
 STEP CONTENT
 ======================================== */}
 <div className="flex-1 pt-1 pb-6">
 <div className="flex items-center gap-2 mb-1">
 <h4 className={`font-semibold ${isCompleted ? 'text-success-green dark:text-emerald-400' : isActive ? 'text-primary-light dark:text-primary-dark dark:text-primary-dark ' : 'text-theme-primary'}`}>
 {label}
 </h4>

 {/* Status badges */}
 {isCompleted && (
 <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium rounded-full">
 Complete
 </span>
 )}
 {isActive && (
 <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:text-blue-300 text-[10px] font-medium rounded-full animate-pulse">
 In Progress
 </span>
 )}
 </div>

 <p className="text-sm text-theme-muted leading-relaxed">
 {description}
 </p>
 </div>
 </div>
 )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GuideOnboardingPreview({
 compact = false,
 className = ''
}: GuideOnboardingPreviewProps) {
 const [activeStep, setActiveStep] = useState<GuideOnboardingStep>(
 GuideOnboardingStep.ACCOUNT_CREATION
 )

 const data = MOCK_GUIDE_ONBOARDING

 return (
 <div className={`surface-card border border-theme rounded-2xl overflow-hidden ${className}`}>
 {/* ========================================
 HEADER
 ======================================== */}
 <div className="p-6 sm:p-8 border-b border-theme bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
 <div className="flex items-start justify-between mb-4">
 <div>
 {/* Pre-header */}
 <span className="inline-block px-2.5 py-1 bg-primary-light dark:bg-primary-dark text-white text-xs font-bold rounded-full mb-3">
 BECOME A GUIDE
 </span>

 <h3 className="text-xl sm:text-2xl font-bold text-theme-primary mb-2">
 Start Earning in{' '}
 <span className="text-primary-light dark:text-primary-dark dark:text-primary-dark ">
 {data.estimatedTimeMinutes} Minutes
 </span>
 </h3>

 <p className="text-sm text-theme-secondary max-w-2xl">
 Complete these simple steps to become a verified guide and start
 sharing your expertise with travelers from around the world.
 </p>
 </div>

 {/* Time estimate badge */}
 <div className="hidden sm:flex items-center gap-2 px-3 py-2 surface-card rounded-lg border border-theme">
 <Clock className="w-4 h-4 text-theme-muted " />
 <span className="text-sm font-medium text-theme-secondary">
 ~{data.estimatedTimeMinutes} min
 </span>
 </div>
 </div>

 {/* Verification requirement notice */}
 <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark rounded-xl">
 <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
 <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
 <span className="font-bold">ID verification required:</span> You'll need to upload
 a government ID and take a selfie. Our team manually reviews every application
 within 24 hours.
 </p>
 </div>
 </div>

 {/* ========================================
 ONBOARDING STEPS
 ======================================== */}
 <div className="p-6 sm:p-8 border-b border-theme">
 <h4 className="font-bold text-theme-primary mb-6 flex items-center gap-2">
 <CheckCircle className="w-4 h-4 text-success-green dark:text-emerald-400" />
 Your 4-Step Journey
 </h4>

 <div className="space-y-2">
 {data.steps.map((step, index) => {
 const Icon = STEP_ICONS[step.step]
 const isActive = step.step === activeStep
 const isCompleted = index < data.steps.findIndex(s => s.step === activeStep)

 return (
 <Step
 key={step.step}
 step={step.step}
 label={step.label}
 description={step.description}
 estimatedTime={step.estimatedTime}
 icon={Icon}
 isActive={isActive}
 isCompleted={isCompleted}
 index={index}
 />
 )
 })}
 </div>

 {/* Interactive note */}
 <div className="mt-4 p-3 bg-primary-light/10 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
 <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
 <span>
 Hover over steps to see details. In Phase 3, this becomes an interactive wizard.
 </span>
 </div>
 </div>

 {/* ========================================
 KEY BENEFITS GRID
 ======================================== */}
 <div className="p-6 sm:p-8">
 <h4 className="font-bold text-theme-primary mb-6 flex items-center gap-2">
 <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
 Why Become a Guide?
 </h4>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {data.benefits.map((benefit, index) => (
 <BenefitCard
 key={index}
 icon={index === 0 ? DollarSign : index === 1 ? TrendingUp : index === 2 ? Award : Users}
 title={benefit.title}
 description={benefit.description}
 index={index}
 />
 ))}
 </div>

 {/* ========================================
 TIERED FEES PREVIEW
 ======================================== */}
 <div className="mt-6 p-5 bg-gradient-to-r surface-section border border-theme rounded-xl">
 <div className="flex items-center gap-2 mb-4">
 <TrendingUp className="w-4 h-4 text-success-green dark:text-emerald-400" />
 <h5 className="font-semibold text-theme-primary text-sm">
 Tiered Fee Structure
 </h5>
 </div>

 <div className="space-y-3">
 {/* Bronze */}
 <div className="flex items-center gap-3">
 <div className="w-16 text-xs font-medium text-theme-muted ">
 Bronze
 </div>
 <div className="flex-1 h-2 surface-section rounded-full overflow-hidden">
 <div className="h-full w-full bg-amber-700/30 dark:bg-amber-700/50" />
 </div>
 <div className="w-12 text-xs font-bold text-theme-primary">
 15%
 </div>
 </div>

 {/* Silver */}
 <div className="flex items-center gap-3">
 <div className="w-16 text-xs font-medium text-theme-muted ">
 Silver
 </div>
 <div className="flex-1 h-2 surface-section rounded-full overflow-hidden">
 <div className="h-full w-3/4 surface-section " />
 </div>
 <div className="w-12 text-xs font-bold text-theme-primary">
 12%
 </div>
 </div>

 {/* Gold */}
 <div className="flex items-center gap-3">
 <div className="w-16 text-xs font-medium text-theme-muted ">
 Gold
 </div>
 <div className="flex-1 h-2 surface-section rounded-full overflow-hidden">
 <div className="h-full w-1/2 bg-amber-500 dark:bg-amber-600" />
 </div>
 <div className="w-12 text-xs font-bold text-theme-primary">
 10%
 </div>
 </div>

 {/* Platinum */}
 <div className="flex items-center gap-3">
 <div className="w-16 text-xs font-medium text-theme-muted ">
 Platinum
 </div>
 <div className="flex-1 h-2 surface-section rounded-full overflow-hidden">
 <div className="h-full w-1/4 bg-gradient-to-r from-amber-400 to-amber-500" />
 </div>
 <div className="w-12 text-xs font-bold text-amber-600 dark:text-amber-400">
 8%
 </div>
 </div>
 </div>

 <p className="text-xs text-theme-muted mt-3">
 Higher impact score = lower platform fees. Top guides pay as low as 8%.
 </p>
 </div>
 </div>

 {/* ========================================
 FAQ LINK
 ======================================== */}
 <div className="px-6 sm:px-8 py-4 surface-section border-t border-theme flex items-center justify-between">
 <div className="flex items-center gap-2 text-sm text-theme-secondary ">
 <HelpCircle className="w-4 h-4" />
 <span>Have questions about becoming a guide?</span>
 </div>
 <a
 href="/faq/guides"
 className="inline-flex items-center gap-1 text-sm font-medium text-primary-light dark:text-primary-dark dark:text-primary-dark hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
 >
 Read FAQ
 <ChevronRight className="w-4 h-4" />
 </a>
 </div>
 </div>
 )
}

// ============================================================================
// USAGE NOTES:
// ============================================================================
//
// This component is designed to:
// 1. Educate potential guides about the process
// 2. Build trust through transparency
// 3. Showcase earning potential
// 4. Highlight the tiered fee system
//
// In Phase 3, this becomes an interactive wizard with:
// - Real-time progress tracking
// - Document upload UI
// - Live verification status
// - Tour creation forms
// ============================================================================