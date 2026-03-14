// ============================================================================
// AUTH TYPES - UPDATED WITH LANGUAGE PROFICIENCY
// ============================================================================
// LOCATION: /frontend/src/types/auth.types.ts
// ============================================================================

export enum UserRole {
    TRAVELER = 'Traveler',
    GUIDE = 'Guide'
}

export const UserRoleLabels: Record<UserRole, string> = {
    [UserRole.TRAVELER]: 'Traveler',
    [UserRole.GUIDE]: 'Guide'
}

export enum SignupStep {
    ROLE_SELECTION = 'role_selection',
    ACCOUNT_DETAILS = 'account_details',
    PROFILE_SETUP = 'profile_setup',
    VERIFICATION = 'verification',
    COMPLETED = 'completed'
}

export enum LanguageProficiency {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    NATIVE = 'native'
}

export const LanguageProficiencyLabels: Record<LanguageProficiency, string> = {
    [LanguageProficiency.BEGINNER]: 'Beginner',
    [LanguageProficiency.INTERMEDIATE]: 'Intermediate',
    [LanguageProficiency.ADVANCED]: 'Advanced',
    [LanguageProficiency.NATIVE]: 'Native'
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface SignupFormData {
    // Step 1: Role Selection
    role: UserRole | null
    
    // Step 2: Account Details
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    
    // Step 3: Profile (Traveler)
    phone?: string
    nationality?: string
    dateOfBirth?: string
    
    // Step 3: Profile (Guide)
    bio?: string
    languages?: Array<{
        language: string
        proficiency: LanguageProficiency
    }>
    expertise?: string[]
    
    // Step 4: Verification (Guide only)
    idDocument?: File
    selfiePhoto?: File
    certificates?: File[]
    
    // Legal
    agreedToTerms: boolean
    agreedToPrivacy: boolean
    newsletterOptIn: boolean
    marketingOptIn: boolean
    
    // Metadata
    currentStep: SignupStep
    completedSteps: SignupStep[]
}

// ============================================================================
// ERROR TYPES - WITH INDEX SIGNATURE
// ============================================================================

export interface SignupErrors {
    email?: string
    password?: string
    confirmPassword?: string
    firstName?: string
    lastName?: string
    phone?: string
    nationality?: string
    dateOfBirth?: string
    bio?: string
    languages?: string
    expertise?: string
    agreedToTerms?: string
    agreedToPrivacy?: string
    general?: string
    [key: string]: string | undefined // Index signature for dynamic access
}
// Add this interface (around line 80-90, before the INITIAL_SIGNUP_DATA export)

export interface SignupRequest {
  role: string; // 'Traveler' or 'Guide' as expected by backend
  email: string;
  password: string;
  fullName?: string;           // optional
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  newsletterOptIn: boolean;
  marketingOptIn: boolean;
}
// ============================================================================
// INITIAL STATE
// ============================================================================

export const INITIAL_SIGNUP_DATA: SignupFormData = {
    role: null,
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    nationality: '',
    dateOfBirth: '',
    bio: '',
    languages: [],
    expertise: [],
    agreedToTerms: false,
    agreedToPrivacy: false,
    newsletterOptIn: false,
    marketingOptIn: false,
    currentStep: SignupStep.ROLE_SELECTION,
    completedSteps: []
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
    email: {
        required: true,
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: 'Please enter a valid email address'
    },
    password: {
        required: true,
        minLength: 8,
        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        message: 'Password must be at least 8 characters with at least one letter and one number'
    },
    firstName: {
        required: true,
        minLength: 2,
        maxLength: 50,
        message: 'First name must be between 2 and 50 characters'
    },
    lastName: {
        required: true,
        minLength: 2,
        maxLength: 50,
        message: 'Last name must be between 2 and 50 characters'
    },
    phone: {
        required: false,
        pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        message: 'Please enter a valid phone number'
    }
}