'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
    } catch (error) {
      console.error('Login error:', error);
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
      const { data } = await axios.post(
        `${API_URL}/api/v1/auth/register`,
        {
          fullName,
          email,
          username,
          password,
          leetcodeUsername,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      // Auto-login after successful registration
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
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
    } catch (error) {
      console.error('Logout error:', error);
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
    } catch (error) {
      console.error('Update error:', error);
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
    } catch (error) {
      console.error('ELO update error:', error);
      throw error;
    }
  };

  const getDetailedProfile = async (): Promise<DetailedUser> => {
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
    } catch (error) {
      console.error('Detailed profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    detailedUser,
    loading,
    login,
    register,
    logout,
    updateUser,
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
