'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userOrEmail: User | string, passwordOrToken?: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  googleLogin: (googleData: { googleId: string; email: string; fullName: string; avatar?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authApi.me();
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userOrEmail: User | string, passwordOrToken?: string) => {
    // If userOrEmail is an object (User), it means we're being called from verify-email page
    if (typeof userOrEmail === 'object') {
      setUser(userOrEmail);
      return;
    }

    // Otherwise, it's a normal login with email and password
    const response = await authApi.login({ email: userOrEmail, password: passwordOrToken! });
    if (response.success && response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      setUser(response.data.user);
      router.push('/home');
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    const response = await authApi.register({ email, password, fullName });
    if (response.success && response.data) {
      // Check if email verification is required
      if (response.data.requiresVerification) {
        // Don't set user or redirect, just show success message
        return;
      }
      // Old flow (in case verification is disabled)
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        setUser(response.data.user);
        router.push('/home');
      }
    }
  };

  const googleLogin = async (googleData: { googleId: string; email: string; fullName: string; avatar?: string }) => {
    try {
      const response = await authApi.googleAuth(googleData);
      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        setUser(response.data.user);
        router.push('/home');
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        googleLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
