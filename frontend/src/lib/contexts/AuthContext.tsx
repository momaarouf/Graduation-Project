'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { setAccessToken, clearAccessToken, getAccessToken } from '@/src/lib/api/client';
import {
 authRegister,
 authLogin as apiAuthLogin,
 authLogout as apiAuthLogout,
 authLogoutAll as apiAuthLogoutAll,
 authMe as apiAuthMe,
 emailVerifyRequest as apiEmailVerifyRequest,
 emailVerifyConfirmToken as apiEmailVerifyConfirmToken,
 emailVerifyConfirmCode as apiEmailVerifyConfirmCode,
 passwordForgotRequest as apiPasswordForgotRequest,
 passwordReset as apiPasswordReset,
 passwordChange as apiPasswordChange,
 MeResponse,
 authMe,
} from '@/src/lib/api/auth';
import LoadingOverlay from '@/src/components/ui/LoadingOverlay';

interface User {
 userId: string;
 email: string;
 fullName?: string;
 role: 'ADMIN' | 'GUIDE' | 'TRAVELER'; // Normalized to capitalize
 travelerProfileId?: string;
 guideProfileId?: string;
 profileCompleted: boolean;
 emailVerified: boolean;
 agreedToTerms: boolean;
 avatarUrl?: string;
 emailNotificationsEnabled: boolean;
 pushNotificationsEnabled: boolean;
}

interface AuthContextType {
 user: User | null;
 isLoading: boolean;
 isProcessing: boolean;
 processingMessage: string;
 // Authentication methods
 register: (email: string, password: string, role: 'Traveler' | 'Guide', fullName: string, agreedToTerms: boolean, agreedToPrivacy: boolean, newsletterOptIn: boolean, marketingOptIn: boolean) => Promise<void>;
 login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
 logout: () => Promise<void>;
 logoutAll: () => Promise<void>;
 refresh: () => Promise<void>;
 // Email verification methods
 requestEmailVerification: (email: string) => Promise<{ message: string; token: string; code?: string }>;
 confirmEmailWithToken: (token: string) => Promise<void>;
 confirmEmailWithCode: (email: string, code: string) => Promise<void>;
 // Password reset methods
 requestPasswordReset: (email: string) => Promise<{ message: string; token: string; code?: string }>;
 forgotPassword: (email: string) => Promise<{ message: string; token: string; code?: string }>;
 resetPassword: (token: string, newPassword: string) => Promise<void>;
 changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
 /** Used by OAuth callback to authenticate from a JWT without a form login */
 loginWithToken: (token: string) => Promise<void>;
 /** Re-fetch user data from /api/auth/me to refresh client state */
 refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend returns Pascal case: Traveler, Guide, Admin.
// We normalize to capitalize for consistency in the frontend.
const normalizeUser = (raw: MeResponse, avatarUrl?: string): User => ({
 ...raw,
 userId: raw.userId?.toString(),
 travelerProfileId: raw.travelerProfileId?.toString(),
 guideProfileId: raw.guideProfileId?.toString(),
 role: raw.role.toUpperCase() as User['role'],
 avatarUrl: avatarUrl || undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const [user, setUser] = useState<User | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [isProcessing, setIsProcessing] = useState(false);
 const [processingMessage, setProcessingMessage] = useState('Loading...');
 const router = useRouter();

 // Bootstrap on app mount: restore session from refresh token + access token if available
 useEffect(() => {
 const bootstrap = async () => {
 try {
 let token: string | null = getAccessToken();

 // If we don't have an access token in memory/localStorage, try refresh with the cookie
 if (!token) {
 try {
 const refreshRes = await apiClient.post(
 '/api/auth/refresh',
 {},
 { withCredentials: true }
 );
 const newToken = refreshRes.data.token;
 if (typeof newToken === 'string' && newToken) {
 token = newToken;
 setAccessToken(newToken);
 } else {
 // Invalid token response – treat as no session
 setUser(null);
 setIsLoading(false);
 return;
 }
 } catch {
 setUser(null);
 setIsLoading(false);
 return;
 }
 }

 // Normalize role to capitalize before storing (backend returns Pascal case)
 const userRes = await apiAuthMe();
 
 // Fetch profile avatar based on role
 let avatarUrl: string | undefined;
 try {
 if (userRes.role === 'Traveler') {
 const profile = await apiClient.get('/api/traveler/profile');
 avatarUrl = profile.data.avatarUrl;
 } else if (userRes.role === 'Guide') {
 const profile = await apiClient.get('/api/guide/profile');
 avatarUrl = profile.data.avatarUrl;
 }
 } catch (avatarError) {
 console.debug('Failed to fetch profile avatar during bootstrap', avatarError);
 }

 setUser(normalizeUser(userRes, avatarUrl));
 } catch (error) {
 console.debug('Bootstrap: no active session');
 clearAccessToken();
 setUser(null);
 } finally {
 setIsLoading(false);
 }
 };

 bootstrap();
 }, []);

 // Register a new user (Traveler or Guide)
 const register = async (
 email: string,
 password: string,
 role: 'Traveler' | 'Guide',
 fullName: string,
 agreedToTerms: boolean,
 agreedToPrivacy: boolean,
 newsletterOptIn: boolean,
 marketingOptIn: boolean
 ) => {
 try {
 const response = await authRegister({
 email,
 password,
 role,
 fullName,
 agreedToTerms,
 agreedToPrivacy,
 newsletterOptIn,
 marketingOptIn,
 });
 
 // Only show full-screen overlay AFTER the registration is accepted by the server
 setProcessingMessage('Creating your adventure...');
 setIsProcessing(true);

 setAccessToken(response.token);
 // Fetch full user info after signup; normalize role from Pascal to capitalize
 const userRes = await apiAuthMe();
 const normalized = normalizeUser(userRes);
 setUser(normalized);
 // After signup, send to complete-profile so new users can fill in their details.
 // profileCompleted is false for brand new users. If somehow already complete, go to dashboard.
 if (normalized.role === 'ADMIN') {
 router.push('/dashboard/admin');
 } else if (normalized.role === 'GUIDE') {
 router.push(normalized.profileCompleted ? '/dashboard/guide' : '/dashboard/guide/complete-profile');
 } else {
 router.push(normalized.profileCompleted ? '/dashboard/traveler' : '/dashboard/traveler/complete-profile');
 }
 } finally {
 // Don't set isProcessing(false) immediately because redirect might not be instant
 // We'll let the next page mount handle the UI
 setTimeout(() => setIsProcessing(false), 2000);
 }
 };

 // Login with email and password
 const login = async (email: string, password: string, rememberMe = false) => {
 try {
 const response = await apiAuthLogin({ email, password, rememberMe });
 
 // Only show full-screen overlay AFTER the login is accepted by the server
 setProcessingMessage('Securing your session...');
 setIsProcessing(true);

 setAccessToken(response.token);
 // Fetch full user info after login; normalize role from Pascal to capitalize
 const userRes = await apiAuthMe();
 
 let avatarUrl: string | undefined;
 try {
 if (userRes.role === 'Traveler') {
 const profile = await apiClient.get('/api/traveler/profile');
 avatarUrl = profile.data.avatarUrl;
 } else if (userRes.role === 'Guide') {
 const profile = await apiClient.get('/api/guide/profile');
 avatarUrl = profile.data.avatarUrl;
 }
 } catch (e) {}

 const normalized = normalizeUser(userRes, avatarUrl);
 setUser(normalized);
 // Redirect based on role
 if (normalized.role === 'ADMIN') router.push('/dashboard/admin');
 else if (normalized.role === 'GUIDE') router.push('/dashboard/guide');
 else router.push('/dashboard/traveler');
 } finally {
 setTimeout(() => setIsProcessing(false), 2000);
 }
 };

 // Logout from current device - revokes refresh token
 const logout = async () => {
 setProcessingMessage('Logging out...');
 setIsProcessing(true);
 try {
 await apiAuthLogout();
 } catch (error) {
 console.error('Logout error', error);
 } finally {
 clearAccessToken();
 setUser(null);
 router.push('/auth/login');
 setTimeout(() => setIsProcessing(false), 1500);
 }
 };

 // Logout from all devices - invalidates all JWTs across all sessions
 const logoutAll = async () => {
 try {
 await apiAuthLogoutAll();
 } catch (error) {
 console.error('Logout-all error', error);
 } finally {
 clearAccessToken();
 setUser(null);
 router.push('/auth/login');
 }
 };

 // Manually refresh access token (used when needed, normally handled by interceptor)
 const refresh = async () => {
 try {
 const res = await apiClient.post(
 '/api/auth/refresh',
 {},
 { withCredentials: true }
 );
 setAccessToken(res.data.token);
 } catch (error) {
 throw error;
 }
 };

 // Request email verification code (backend sends email)
 const requestEmailVerification = async (email: string) => {
 return await apiEmailVerifyRequest({ email });
 };

 // Confirm email using token from email
 const confirmEmailWithToken = async (token: string) => {
 await apiEmailVerifyConfirmToken({ token });
 };

 // Confirm email using code entered manually
 const confirmEmailWithCode = async (email: string, code: string) => {
 await apiEmailVerifyConfirmCode({ email, code });
 };

 // Request password reset code (backend sends email)
 const requestPasswordReset = async (email: string) => {
 return await apiPasswordForgotRequest({ email });
 };

 // Reset password with token from email
 const resetPassword = async (token: string, newPassword: string) => {
 setProcessingMessage('Resetting your password...');
 setIsProcessing(true);
 try {
 await apiPasswordReset({ token, newPassword });
 // User must login again with new password
 clearAccessToken();
 setUser(null);
 router.push('/auth/login');
 } finally {
 setTimeout(() => setIsProcessing(false), 2000);
 }
 };

 // Change password while logged in
 const changePassword = async (currentPassword: string, newPassword: string) => {
 await apiPasswordChange({ currentPassword, newPassword });
 };

 /**
 * loginWithToken — used by the OAuth callback page.
 * Receives the short-lived JWT from the backend redirect, stores it,
 * then fetches /me to fully hydrate the user in context.
 */
 const loginWithToken = async (token: string): Promise<void> => {
 setProcessingMessage('Authenticating...');
 setIsProcessing(true);
 try {
 setAccessToken(token);
 const userRes = await authMe();
 const normalized = normalizeUser(userRes);
 setUser(normalized);
 } finally {
 setTimeout(() => setIsProcessing(false), 2000);
 }
 };

 /** Re-fetch user data from /api/auth/me to refresh client state */
 const refetchUser = async (): Promise<void> => {
 const userRes = await authMe();
 
 let avatarUrl: string | undefined;
 try {
 if (userRes.role === 'Traveler') {
 const profile = await apiClient.get('/api/traveler/profile');
 avatarUrl = profile.data.avatarUrl;
 } else if (userRes.role === 'Guide') {
 const profile = await apiClient.get('/api/guide/profile');
 avatarUrl = profile.data.avatarUrl;
 }
 } catch (e) {}

 setUser(normalizeUser(userRes, avatarUrl));
 };

 return (
 <AuthContext.Provider
 value={{
 user,
 isLoading,
 register,
 login,
 logout,
 logoutAll,
 refresh,
 requestEmailVerification,
 confirmEmailWithToken,
 confirmEmailWithCode,
 requestPasswordReset,
 forgotPassword: requestPasswordReset,
 resetPassword,
 changePassword,
 loginWithToken,
 refetchUser,
 isProcessing,
 processingMessage,
 }}
 >
 <LoadingOverlay isVisible={isProcessing} message={processingMessage} />
 {children}
 </AuthContext.Provider>
 );
}

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) throw new Error('useAuth must be used within AuthProvider');
 return context;
};
