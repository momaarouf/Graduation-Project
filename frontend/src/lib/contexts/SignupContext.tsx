// ============================================================================
// SIGNUP CONTEXT - FULLY FIXED VERSION
// ============================================================================
// LOCATION: /frontend/src/lib/contexts/SignupContext.tsx
// 
// FIXES:
// 1. Added proper index signature for SignupErrors
// 2. Fixed language proficiency type issues
// 3. Proper error object handling
// 4. Added LanguageProficiency enum
// ============================================================================

'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import {
 SignupFormData,
 SignupStep,
 SignupErrors,
 UserRole,
 LanguageProficiency,
 INITIAL_SIGNUP_DATA,
 VALIDATION_RULES
} from '@/src/types/auth.types'

// ============================================================================
// ACTION TYPES
// ============================================================================

type SignupAction =
 | { type: 'SET_ROLE'; payload: UserRole }
 | { type: 'UPDATE_FIELD'; payload: { field: keyof SignupFormData; value: any } }
 | { type: 'UPDATE_MULTIPLE_FIELDS'; payload: Partial<SignupFormData> }
 | { type: 'SET_STEP'; payload: SignupStep }
 | { type: 'NEXT_STEP' }
 | { type: 'PREV_STEP' }
 | { type: 'SET_ERRORS'; payload: SignupErrors }
 | { type: 'CLEAR_ERROR'; payload: { field: keyof SignupErrors } }
 | { type: 'SET_LOADING'; payload: boolean }
 | { type: 'RESET' }
 | { type: 'ADD_LANGUAGE'; payload: { language: string; proficiency: LanguageProficiency } }
 | { type: 'REMOVE_LANGUAGE'; payload: number }
 | { type: 'ADD_EXPERTISE'; payload: string }
 | { type: 'REMOVE_EXPERTISE'; payload: number }

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface SignupContextState {
 data: SignupFormData
 errors: SignupErrors
 isLoading: boolean
 currentStep: SignupStep
 completedSteps: SignupStep[]
}

// Define the steps for each role
const getStepsForRole = (role: UserRole | null) => {
 // Both roles: role → account → terms. Profile/verification done from dashboard.
 return [
 { step: SignupStep.ROLE_SELECTION },
 { step: SignupStep.ACCOUNT_DETAILS },
 { step: SignupStep.COMPLETED }
 ]
}
// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

const validateEmail = (email: string): boolean => {
 return VALIDATION_RULES.email.pattern.test(email)
}

const validatePassword = (password: string): boolean => {
 return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password)
}

const validateStep = (data: SignupFormData, step: SignupStep): SignupErrors => {
 const errors: SignupErrors = {}

 switch (step) {
 case SignupStep.ROLE_SELECTION:
 if (!data.role) {
 errors.general = 'Please select a role to continue'
 }
 break

 case SignupStep.ACCOUNT_DETAILS:
 if (!data.email) {
 errors.email = 'Email is required'
 } else if (!validateEmail(data.email)) {
 errors.email = VALIDATION_RULES.email.message
 }

 if (!data.password) {
 errors.password = 'Password is required'
 } else if (!validatePassword(data.password)) {
 errors.password = VALIDATION_RULES.password.message
 }

 if (data.password !== data.confirmPassword) {
 errors.confirmPassword = 'Passwords do not match'
 }

 if (!data.firstName) {
 errors.firstName = 'First name is required'
 } else if (data.firstName.length < VALIDATION_RULES.firstName.minLength) {
 errors.firstName = VALIDATION_RULES.firstName.message
 }

 if (!data.lastName) {
 errors.lastName = 'Last name is required'
 } else if (data.lastName.length < VALIDATION_RULES.lastName.minLength) {
 errors.lastName = VALIDATION_RULES.lastName.message
 }
 break

 // case SignupStep.PROFILE_SETUP:
 // if (data.role === UserRole.TRAVELER) {
 // if (data.phone && !VALIDATION_RULES.phone.pattern?.test(data.phone)) {
 // errors.phone = VALIDATION_RULES.phone.message
 // }
 // } else {
 // if (!data.bio || data.bio.length < 50) {
 // errors.bio = 'Please write a bio of at least 50 characters'
 // }
 // if (!data.languages || data.languages.length === 0) {
 // errors.languages = 'Please add at least one language'
 // }
 // if (!data.expertise || data.expertise.length === 0) {
 // errors.expertise = 'Please add at least one area of expertise'
 // }
 // }
 // break

 case SignupStep.COMPLETED:
 if (!data.agreedToTerms) {
 errors.agreedToTerms = 'You must agree to the Terms of Service'
 }
 if (!data.agreedToPrivacy) {
 errors.agreedToPrivacy = 'You must agree to the Privacy Policy'
 }
 break
 }

 return errors
}

// ============================================================================
// REDUCER
// ============================================================================

function signupReducer(
 state: SignupContextState,
 action: SignupAction
): SignupContextState {
 switch (action.type) {
 case 'SET_ROLE':
 return {
 ...state,
 data: { ...state.data, role: action.payload },
 currentStep: SignupStep.ACCOUNT_DETAILS,
 completedSteps: [...state.completedSteps, SignupStep.ROLE_SELECTION]
 }

 case 'UPDATE_FIELD': {
 const { field, value } = action.payload
 return {
 ...state,
 data: { ...state.data, [field]: value },
 errors: { ...state.errors, [field]: undefined }
 }
 }

 case 'UPDATE_MULTIPLE_FIELDS':
 return {
 ...state,
 data: { ...state.data, ...action.payload }
 }

 case 'SET_STEP':
 return {
 ...state,
 currentStep: action.payload
 }

 case 'NEXT_STEP': {
 // Forms validate themselves before calling nextStep().
 // We do NOT re-validate here to avoid silent failures where the
 // context rejects but the form shows no error to the user.
 const steps = getStepsForRole(state.data.role)
 const currentIndex = steps.findIndex(s => s.step === state.currentStep)
 const nextStep = steps[currentIndex + 1]?.step

 if (!nextStep) return state

 return {
 ...state,
 currentStep: nextStep,
 completedSteps: [...state.completedSteps, state.currentStep],
 errors: {}
 }
 }

 case 'PREV_STEP': {
 const steps = getStepsForRole(state.data.role).map(s => s.step)
 const currentIndex = steps.indexOf(state.currentStep)
 const prevStep = steps[currentIndex - 1]
 
 if (!prevStep) return state

 return {
 ...state,
 currentStep: prevStep,
 errors: {}
 }
 }

 case 'SET_ERRORS':
 return {
 ...state,
 errors: action.payload
 }

 case 'CLEAR_ERROR': {
 const { [action.payload.field]: _, ...rest } = state.errors
 return {
 ...state,
 errors: rest
 }
 }

 case 'SET_LOADING':
 return {
 ...state,
 isLoading: action.payload
 }

 case 'ADD_LANGUAGE':
 return {
 ...state,
 data: {
 ...state.data,
 languages: [
 ...(state.data.languages || []),
 action.payload
 ]
 }
 }

 case 'REMOVE_LANGUAGE':
 return {
 ...state,
 data: {
 ...state.data,
 languages: state.data.languages?.filter((_, i) => i !== action.payload)
 }
 }

 case 'ADD_EXPERTISE':
 return {
 ...state,
 data: {
 ...state.data,
 expertise: [
 ...(state.data.expertise || []),
 action.payload
 ]
 }
 }

 case 'REMOVE_EXPERTISE':
 return {
 ...state,
 data: {
 ...state.data,
 expertise: state.data.expertise?.filter((_, i) => i !== action.payload)
 }
 }

 case 'RESET':
 return {
 data: INITIAL_SIGNUP_DATA,
 errors: {},
 isLoading: false,
 currentStep: SignupStep.ROLE_SELECTION,
 completedSteps: []
 }

 default:
 return state
 }
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

interface SignupContextValue extends SignupContextState {
 dispatch: React.Dispatch<SignupAction>
 setRole: (role: UserRole) => void
 updateField: <K extends keyof SignupFormData>(field: K, value: SignupFormData[K]) => void
 updateMultipleFields: (fields: Partial<SignupFormData>) => void
 nextStep: () => void
 prevStep: () => void
 addLanguage: (language: string, proficiency: LanguageProficiency) => void
 removeLanguage: (index: number) => void
 addExpertise: (expertise: string) => void
 removeExpertise: (index: number) => void
 reset: () => void
}

const SignupContext = createContext<SignupContextValue | undefined>(undefined)

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface SignupProviderProps {
 children: ReactNode
 initialData?: Partial<SignupFormData>
}

export function SignupProvider({ children, initialData }: SignupProviderProps) {
 const [state, dispatch] = useReducer(signupReducer, {
 data: { ...INITIAL_SIGNUP_DATA, ...initialData },
 errors: {},
 isLoading: false,
 currentStep: SignupStep.ROLE_SELECTION,
 completedSteps: []
 })

 const setRole = (role: UserRole) => 
 dispatch({ type: 'SET_ROLE', payload: role })
 
 const updateField = <K extends keyof SignupFormData>(field: K, value: SignupFormData[K]) =>
 dispatch({ type: 'UPDATE_FIELD', payload: { field, value } })
 
 const updateMultipleFields = (fields: Partial<SignupFormData>) =>
 dispatch({ type: 'UPDATE_MULTIPLE_FIELDS', payload: fields })
 
 const nextStep = () => dispatch({ type: 'NEXT_STEP' })
 const prevStep = () => dispatch({ type: 'PREV_STEP' })
 
 const addLanguage = (language: string, proficiency: LanguageProficiency) =>
 dispatch({ type: 'ADD_LANGUAGE', payload: { language, proficiency } })
 
 const removeLanguage = (index: number) =>
 dispatch({ type: 'REMOVE_LANGUAGE', payload: index })
 
 const addExpertise = (expertise: string) =>
 dispatch({ type: 'ADD_EXPERTISE', payload: expertise })
 
 const removeExpertise = (index: number) =>
 dispatch({ type: 'REMOVE_EXPERTISE', payload: index })
 
 const reset = () => dispatch({ type: 'RESET' })

 return (
 <SignupContext.Provider value={{
 ...state,
 dispatch,
 setRole,
 updateField,
 updateMultipleFields,
 nextStep,
 prevStep,
 addLanguage,
 removeLanguage,
 addExpertise,
 removeExpertise,
 reset
 }}>
 {children}
 </SignupContext.Provider>
 )
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

export function useSignup() {
 const context = useContext(SignupContext)
 if (context === undefined) {
 throw new Error('useSignup must be used within a SignupProvider')
 }
 return context
}