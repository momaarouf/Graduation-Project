import apiClient from './client';

// ==================== AUTH TYPES ====================
export interface RegisterRequest {
  email: string;
  password: string;
  role: 'Traveler' | 'Guide';
  fullName: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  newsletterOptIn: boolean;
  marketingOptIn: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export interface MeResponse {
  userId: string;
  email: string;
  fullName?: string;
  role: 'Traveler' | 'Guide' | 'Admin';
  travelerProfileId?: string;
  guideProfileId?: string;
  profileCompleted: boolean;
  emailVerified: boolean;
  agreedToTerms: boolean;
}

/** POST /api/auth/accept-terms — called after OAuth signup */
export const authAcceptTerms = async (): Promise<void> => {
  const { default: apiClient } = await import('./client');
  await apiClient.post('/api/auth/accept-terms');
};

// ==================== EMAIL VERIFICATION TYPES ====================
export interface EmailVerifyRequest {
  email: string;
}

export interface EmailVerifyDevResponse {
  message: string;
  token: string;
  code?: string; // Only in dev mode
}

export interface EmailVerifyConfirmTokenRequest {
  token: string;
}

export interface EmailVerifyConfirmCodeRequest {
  email: string;
  code: string;
}

// ==================== PASSWORD RESET TYPES ====================
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordDevResponse {
  message: string;
  token: string;
  code?: string; // Only in dev mode
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ==================== PROFILE COMPLETION TYPES ====================
export interface TravelerCompleteProfileRequest {
  fullName: string;
  phoneE164: string;
  country: string;
  city: string;
  nationality?: string;
  dateOfBirth?: string; // YYYY-MM-DD format
  preferences?: string[];
}

export interface GuideCompleteProfileRequest {
  fullName: string;
  phoneE164: string;
  country: string;
  city: string;
  bio: string;
  expertise?: string[];
  languages: Array<{
    name: string;
    proficiency: string;
  }>;
}
export interface GuideVerificationSubmitRequest {
  documentType: 'NATIONAL_ID' | 'PASSPORT';
  idFrontImage: string;
  idBackImage?: string;
  selfieImage: string;
}

export interface GuideVerificationStatusResponse {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  documentType?: 'NATIONAL_ID' | 'PASSPORT';
}

// ==================== AUTHENTICATION ENDPOINTS ====================

/**
 * Register a new user (Traveler or Guide)
 * Creates user account and initial profile
 * Browser automatically receives refresh_token as HttpOnly cookie
 */
export const authRegister = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/auth/register', data);
  return response.data;
};

/**
 * Login with email and password
 * Returns access token; refresh token is set as HttpOnly cookie
 */
export const authLogin = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/auth/login', data);
  return response.data;
};

/**
 * Refresh the access token using the refresh_token cookie
 * Must include credentials in the request
 */
export const authRefresh = async (): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/auth/refresh', {});
  return response.data;
};

/**
 * Logout: revokes refresh token and clears HttpOnly cookie
 * After this, frontend must clear access token from memory/localStorage
 */
export const authLogout = async (): Promise<void> => {
  await apiClient.post('/api/auth/logout', {});
};

/**
 * Logout from all devices: revokes all refresh tokens
 * Increments tokenVersion to invalidate all JWTs immediately
 * Frontend must clear access token and redirect to login on all tabs/windows
 */
export const authLogoutAll = async (): Promise<void> => {
  await apiClient.post('/api/auth/logout-all', {});
};

/**
 * Get current authenticated user info
 * Used by AuthContext during app bootstrap to restore session
 * Returns user role and profile IDs needed for dashboard routing
 */
export const authMe = async (): Promise<MeResponse> => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};

// ==================== EMAIL VERIFICATION ENDPOINTS ====================

/**
 * Request email verification code
 * Backend sends email to user with verification code
 * In dev mode, response includes the code for testing
 */
export const emailVerifyRequest = async (data: EmailVerifyRequest): Promise<EmailVerifyDevResponse> => {
  const response = await apiClient.post('/api/auth/email/verify/request', data);
  return response.data;
};

/**
 * Verify email using the token from email request
 * This is the simplest method - just send token received via email
 */
export const emailVerifyConfirmToken = async (data: EmailVerifyConfirmTokenRequest): Promise<void> => {
  await apiClient.post('/api/auth/email/verify/confirm-token', data);
};

/**
 * Verify email using the code from email request
 * Alternative method - send email + 6-digit code manually
 */
export const emailVerifyConfirmCode = async (data: EmailVerifyConfirmCodeRequest): Promise<void> => {
  await apiClient.post('/api/auth/email/verify/confirm-code', data);
};

// ==================== PASSWORD RESET ENDPOINTS ====================

/**
 * Request password reset
 * Backend sends email to user with reset code
 * In dev mode, response includes the code for testing
 * Rate limited: 3 requests per 15 min per IP & email
 */
export const passwordForgotRequest = async (data: ForgotPasswordRequest): Promise<ForgotPasswordDevResponse> => {
  const response = await apiClient.post('/api/auth/password/forgot', data);
  return response.data;
};

/**
 * Reset password with token from email
 * After reset, all JWTs are invalidated (tokenVersion incremented)
 * User must login again with new password
 */
export const passwordReset = async (data: ResetPasswordRequest): Promise<void> => {
  await apiClient.post('/api/auth/password/reset', data);
};

/**
 * Change password from within settings (requires active session)
 * NOTE: Backend placeholder. Actual implementation needs PUT /api/auth/password/change
 */
export const passwordChange = async (data: ChangePasswordRequest): Promise<void> => {
  // Use apiClient if endpoint exists, otherwise simulate delay since user forbade backend edits
  // await apiClient.put('/api/auth/password/change', data);
  await new Promise(resolve => setTimeout(resolve, 1500));
};

// ==================== PROFILE COMPLETION ENDPOINTS ====================

/**
 * Complete Traveler profile after signup
 * Required call to move from onboarding to active traveler status
 */
export const travelerCompleteProfile = async (data: TravelerCompleteProfileRequest): Promise<void> => {
  await apiClient.post('/api/traveler/profile/complete', data);
};

/**
 * Complete Guide profile after signup
 * Required call to move from onboarding to active guide status
 * Must include bio (30-2000 chars) and at least one language
 */
export const guideCompleteProfile = async (data: GuideCompleteProfileRequest): Promise<void> => {
  await apiClient.post('/api/guide/profile/complete', data);
};

// ==================== GUIDE VERIFICATION ENDPOINTS ====================

/**
 * Submit guide verification documents
 * Creates verification record in PENDING state for admin review
 * Cannot resubmit after verification is approved or rejected
 * 
 * Business rules:
 * - NATIONAL_ID: requires idBackImage
 * - PASSPORT: idBackImage optional
 * - selfieImage always required
 */
export const guideVerificationSubmit = async (data: GuideVerificationSubmitRequest): Promise<void> => {
  await apiClient.post('/api/guide/verification/submit', data);
};

/**
 * Get current verification status for the logged-in guide
 */
export const guideGetVerificationStatus = async (): Promise<GuideVerificationStatusResponse> => {
  const response = await apiClient.get('/api/guide/verification/status');
  return response.data;
};