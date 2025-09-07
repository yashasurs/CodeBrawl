'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { notify } from '@/utils/notifications';
import axios from 'axios';

// Types
export interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  avatar?: string;
  leetcodeUsername?: string;
  eloRating: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winStreak: number;
  longestWinStreak: number;
  practiceProblemsSolved: number;
  country: string;
  tier: string;
  globalRank?: number;
  isOnline: boolean;
  lastActive: Date;
  achievements: Achievement[];
  languageStats: LanguageStat[];
  practiceStats: PracticeStats;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
  // Virtual fields
  winRate: number;
  favoriteLanguage: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface LanguageStat {
  language: string;
  problemsSolved: number;
  timeSpent: number;
}

export interface PracticeStats {
  easy: {
    solved: number;
    total: number;
    percentage?: number;
  };
  medium: {
    solved: number;
    total: number;
    percentage?: number;
  };
  hard: {
    solved: number;
    total: number;
    percentage?: number;
  };
}

export interface Match {
  id: string;
  opponent: string;
  result: 'Win' | 'Loss';
  eloChange: number;
  date: Date;
  problem: string;
  duration: number;
}

export interface DetailedUser extends User {
  recentMatches: Match[];
  practiceStatsWithPercentages: PracticeStats;
}

export interface AuthContextType {
  user: User | null;
  detailedUser: DetailedUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, username: string, password: string, leetcodeUsername?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateAvatar: (file: File) => Promise<User>;
  refreshUser: () => Promise<void>;
  updateEloRating: () => Promise<void>;
  getDetailedProfile: () => Promise<DetailedUser>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [detailedUser, setDetailedUser] = useState<DetailedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/v1/auth/current-user`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setUser(data.data);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/v1/auth/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setUser(data.data.user);
      notify.auth.loginSuccess(data.data.user.fullName);
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      notify.auth.authError(errorMessage);
      throw error;
    }
  };

  const register = async (
    fullName: string,
    email: string,
    username: string,
    password: string,
    leetcodeUsername?: string
  ) => {
    try {
      console.log('Attempting registration with:', { fullName, email, username, password: '***', leetcodeUsername });
      
      const response = await axios.post(
        `${API_URL}/api/v1/auth/register`,
        {
          fullName,
          email,
          username,
          password,
          leetcodeUsername: leetcodeUsername || undefined,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Registration successful:', response.data);
      
      notify.auth.registrationSuccess();
      
      // Auto-login after successful registration
      await login(email, password);
    } catch (error: any) {
      console.error('Registration error details:', error);
      console.error('Error response:', error.response);
      
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      notify.auth.authError(errorMessage);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/v1/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setUser(null);
      setDetailedUser(null);
      notify.auth.logoutSuccess();
    } catch (error: any) {
      console.error('Logout error:', error);
      const errorMessage = error.response?.data?.message || 'Logout failed. Please try again.';
      notify.auth.authError(errorMessage);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/api/v1/auth/update-account`,
        userData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setUser(data.data);
      notify.profile.updated();
    } catch (error: any) {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile.';
      notify.error('Update Failed', errorMessage);
      throw error;
    }
  };

  const updateAvatar = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const { data } = await axios.patch(
        `${API_URL}/api/v1/auth/avatar`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUser(data.data);
      notify.success('Avatar Updated', 'Your profile picture has been updated successfully!');
      return data.data;
    } catch (error: any) {
      console.error('Avatar update error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update avatar.';
      notify.error('Avatar Update Failed', errorMessage);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/v1/auth/current-user`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setUser(data.data);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const updateEloRating = async () => {
    try {
      await axios.patch(
        `${API_URL}/api/v1/auth/update-elo`,
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      // Refresh user data after ELO update
      await refreshUser();
      notify.success('ELO Rating Updated', 'Your ELO rating has been synced with your LeetCode profile.');
    } catch (error: any) {
      console.error('ELO update error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update ELO rating.';
      notify.error('ELO Update Failed', errorMessage);
      throw error;
    }
  };

  const getDetailedProfile = useCallback(async (): Promise<DetailedUser> => {
    try {
      const { data } = await axios.get(`${API_URL}/api/v1/auth/detailed-profile`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const detailedProfile = data.data;
      setDetailedUser(detailedProfile);
      return detailedProfile;
    } catch (error: any) {
      console.error('Detailed profile error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load profile data.';
      notify.error('Profile Load Failed', errorMessage);
      throw error;
    }
  }, [API_URL]);

  const value: AuthContextType = {
    user,
    detailedUser,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateAvatar,
    refreshUser,
    updateEloRating,
    getDetailedProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
