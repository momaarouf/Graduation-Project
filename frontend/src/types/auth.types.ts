// ============================================================================
// AUTH TYPES - CARD 9: PUBLIC SIGNUP & PATH SELECTION
// ============================================================================
// LOCATION: /frontend/src/types/auth.types.ts
// 
// PURPOSE: Type definitions for authentication system
// 
// PHASE 1: UI-only types for signup path selection
// PHASE 3: Full auth types with JWT, user roles, etc.
// 
// WHY THIS FILE EXISTS:
// ---------------------
// 1. Single source of truth for auth-related types
// 2. Prepared for Phase 3 authentication implementation
// 3. Ensures type safety across all auth components
// ============================================================================

// ============================================================================
// ENUMS - User roles and paths
// ============================================================================

/**
 * User role selection during signup
 * Used for:
 * - Conditional UI rendering
 * - API request payload in Phase 3
 * - Route protection
 */
export enum UserRole {
  TRAVELER = 'traveler',
  GUIDE = 'guide'
}

/**
 * Display names for user roles (used in UI)
 */
export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.TRAVELER]: 'Traveler',
  [UserRole.GUIDE]: 'Guide'
}

/**
 * Onboarding steps for guides
 * Maps to ERD: GuideProfile verification flow
 */
export enum GuideOnboardingStep {
  ACCOUNT_CREATION = 'account_creation',
  PROFILE_SETUP = 'profile_setup',
  ID_VERIFICATION = 'id_verification',
  TOUR_CREATION = 'tour_creation',
  COMPLETED = 'completed'
}

export const GuideOnboardingStepLabels: Record<GuideOnboardingStep, string> = {
  [GuideOnboardingStep.ACCOUNT_CREATION]: 'Create Account',
  [GuideOnboardingStep.PROFILE_SETUP]: 'Set Up Profile',
  [GuideOnboardingStep.ID_VERIFICATION]: 'Verify Identity',
  [GuideOnboardingStep.TOUR_CREATION]: 'Create Your Tours',
  [GuideOnboardingStep.COMPLETED]: 'Start Guiding!'
}

// ============================================================================
// INTERFACES - Auth data structures
// ============================================================================

/**
 * Signup form data (Phase 3)
 * For now, we only need role selection
 */
export interface SignupFormData {
  /** User role selection (Traveler or Guide) */
  role: UserRole | null
  
  /** Email address (Phase 3) */
  email?: string
  
  /** Password (Phase 3) */
  password?: string
  
  /** Full name (Phase 3) */
  fullName?: string
  
  /** Agreement to terms */
  agreedToTerms: boolean
  
  /** Newsletter opt-in */
  newsletterOptIn?: boolean
}

/**
 * Guide onboarding preview data
 * Shows what guides need to complete
 */
export interface GuideOnboardingPreview {
  /** Verification required? (Yes - always true) */
  requiresVerification: true
  
  /** Estimated time to complete */
  estimatedTimeMinutes: number
  
  /** Steps in the process */
  steps: Array<{
    step: GuideOnboardingStep
    label: string
    description: string
    estimatedTime: string
    icon?: string
  }>
  
  /** Key benefits of becoming a guide */
  benefits: Array<{
    title: string
    description: string
    icon: string
  }>
}

/**
 * Traveler benefits preview
 * Shows what travelers get when they join
 */
export interface TravelerBenefitsPreview {
  /** Key features for travelers */
  features: Array<{
    title: string
    description: string
    icon: string
  }>
  
  /** Loyalty tiers preview */
  loyaltyTiers: Array<{
    name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
    discount: number
    requirements: string
  }>
}

// ============================================================================
// MOCK DATA - PHASE 1 UI PREVIEW
// ============================================================================
// 
// These simulate what we'll show users to encourage signup
// In Phase 3, these will come from the backend
// ============================================================================

export const MOCK_GUIDE_ONBOARDING: GuideOnboardingPreview = {
  requiresVerification: true,
  estimatedTimeMinutes: 15,
  
  steps: [
    {
      step: GuideOnboardingStep.ACCOUNT_CREATION,
      label: 'Create Your Account',
      description: 'Sign up with email and create your profile',
      estimatedTime: '2 min',
      icon: '📝'
    },
    {
      step: GuideOnboardingStep.PROFILE_SETUP,
      label: 'Build Your Guide Profile',
      description: 'Add photos, bio, languages, and expertise',
      estimatedTime: '5 min',
      icon: '👤'
    },
    {
      step: GuideOnboardingStep.ID_VERIFICATION,
      label: 'Verify Your Identity',
      description: 'Upload ID and selfie - manually reviewed by our team',
      estimatedTime: '3 min',
      icon: '✅'
    },
    {
      step: GuideOnboardingStep.TOUR_CREATION,
      label: 'Create Your First Tour',
      description: 'Set up tours, pricing, and availability',
      estimatedTime: '5 min',
      icon: '🗺️'
    }
  ],
  
  benefits: [
    {
      title: 'Earn on Your Terms',
      description: 'Set your own schedule, pricing, and tour types',
      icon: '💰'
    },
    {
      title: 'Build Your Reputation',
      description: 'Earn impact score and badges with every booking',
      icon: '⭐'
    },
    {
      title: 'Lower Fees Over Time',
      description: 'High-ranked guides pay reduced platform fees',
      icon: '📉'
    },
    {
      title: 'Free Marketing',
      description: 'We promote your tours to thousands of travelers',
      icon: '📢'
    }
  ]
}

export const MOCK_TRAVELER_BENEFITS: TravelerBenefitsPreview = {
  features: [
    {
      title: 'Verified Guides',
      description: 'Every guide is manually ID-verified for your safety',
      icon: '🛡️'
    },
    {
      title: 'Halal-Friendly Tours',
      description: 'Filter tours with prayer spaces and halal food',
      icon: '🌙'
    },
    {
      title: 'Secure Payments',
      description: 'Funds held safely until 48h after your tour',
      icon: '🔒'
    },
    {
      title: '24/7 Support',
      description: 'Our team is always here to help',
      icon: '💬'
    }
  ],
  
  loyaltyTiers: [
    {
      name: 'Bronze',
      discount: 0,
      requirements: 'First booking'
    },
    {
      name: 'Silver',
      discount: 3,
      requirements: '3 completed trips'
    },
    {
      name: 'Gold',
      discount: 5,
      requirements: '10 completed trips'
    },
    {
      name: 'Platinum',
      discount: 8,
      requirements: '25+ completed trips'
    }
  ]
}

// ============================================================================
// PROPS FOR COMPONENTS
// ============================================================================

export interface SignupPathSelectorProps {
  /** Currently selected role */
  selectedRole: UserRole | null
  
  /** Callback when role is selected */
  onRoleSelect: (role: UserRole) => void
  
  /** Additional CSS classes */
  className?: string
}

export interface GuideOnboardingPreviewProps {
  /** Show compact version (for signup page) */
  compact?: boolean
  
  /** Additional CSS classes */
  className?: string
}

export interface TravelerBenefitsPreviewProps {
  /** Show compact version */
  compact?: boolean
  
  /** Additional CSS classes */
  className?: string
}

export interface AuthFormFooterProps {
  /** Current page type (signup/login) */
  type: 'signup' | 'login'
  
  /** Callback for terms agreement */
  onTermsAgreed?: (agreed: boolean) => void
  
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// API RESPONSE TYPES (Phase 3)
// ============================================================================

export interface SignupResponse {
  success: boolean
  message: string
  userId?: string
  requiresVerification?: boolean
  error?: string
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    email: string
    role: UserRole
    isVerified: boolean
  }
  error?: string
}

// ============================================================================
// USAGE INSTRUCTIONS:
// ============================================================================
// 
// PHASE 1 (Current):
// - Use UserRole enum for path selection
// - Use MOCK_GUIDE_ONBOARDING for UI preview
// - Use MOCK_TRAVELER_BENEFITS for UI preview
// 
// PHASE 3 (Future):
// - Replace mock data with API responses
// - Add full authentication flows
// - Implement JWT handling
// ============================================================================