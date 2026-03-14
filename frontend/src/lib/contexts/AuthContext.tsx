'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { setAccessToken, clearAccessToken, getAccessToken } from '@/src/lib/api/client';
import axios from 'axios';
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

interface User {
  userId: string;
  email: string;
  fullName?: string;
  role: 'Admin' | 'Guide' | 'Traveler'; // Backend returns uppercase
  travelerProfileId?: string;
  guideProfileId?: string;
  profileCompleted: boolean;
  emailVerified: boolean;
  agreedToTerms: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
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

// Backend enum is Traveler, Guide, Admin — Jackson serializes as Pascal case.
// Keep it as-is; no transformation needed.
const normalizeUser = (raw: MeResponse): User => ({
  ...raw,
  role: raw.role as User['role'],
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Bootstrap on app mount: restore session from refresh token + access token if available
  useEffect(() => {
    const bootstrap = async () => {
      try {
        let token: string | null = getAccessToken();

        // If we don't have an access token in memory/localStorage, try refresh with the cookie
        if (!token) {
          try {
            const refreshRes = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
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

        // Normalize role to uppercase before storing (backend returns Pascal case)
        const userRes = await apiAuthMe();
        setUser(normalizeUser(userRes));
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
    setAccessToken(response.token);
    // Fetch full user info after signup; normalize role from Pascal to uppercase
    const userRes = await apiAuthMe();
    const normalized = normalizeUser(userRes);
    setUser(normalized);
    // After signup, send to complete-profile so new users can fill in their details.
    // profileCompleted is false for brand new users. If somehow already complete, go to dashboard.
    if (normalized.role === 'Admin') {
      router.push('/dashboard/admin');
    } else if (normalized.role === 'Guide') {
      router.push(normalized.profileCompleted ? '/dashboard/guide' : '/dashboard/guide/complete-profile');
    } else {
      router.push(normalized.profileCompleted ? '/dashboard/traveler' : '/dashboard/traveler/complete-profile');
    }
  };

  // Login with email and password
  const login = async (email: string, password: string, rememberMe = false) => {
    const response = await apiAuthLogin({ email, password, rememberMe });
    setAccessToken(response.token);
    // Fetch full user info after login; normalize role from Pascal to uppercase
    const userRes = await apiAuthMe();
    const normalized = normalizeUser(userRes);
    setUser(normalized);
    // Redirect based on role
    if (normalized.role === 'Admin') router.push('/dashboard/admin');
    else if (normalized.role === 'Guide') router.push('/dashboard/guide');
    else router.push('/dashboard/traveler');
  };

  // Logout from current device - revokes refresh token
  const logout = async () => {
    try {
      await apiAuthLogout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      clearAccessToken();
      setUser(null);
      router.push('/auth/login');
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
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
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
    await apiPasswordReset({ token, newPassword });
    // User must login again with new password
    clearAccessToken();
    setUser(null);
    router.push('/auth/login');
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
    setAccessToken(token);
    const userRes = await authMe();
    const normalized = normalizeUser(userRes);
    setUser(normalized);
  };

  /** Re-fetch user data from /api/auth/me to refresh client state */
  const refetchUser = async (): Promise<void> => {
    const userRes = await authMe();
    setUser(normalizeUser(userRes));
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};