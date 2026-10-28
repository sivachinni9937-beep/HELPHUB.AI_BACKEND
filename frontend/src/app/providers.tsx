import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_PROFILES } from '../lib/demo-data';
import { SupportedLanguage } from '../lib/i18n';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  switchRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => Promise<void>;
  signup: (email: string, displayName: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isDemoMode: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to citizen demo profile for frictionless evaluation
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('helphub_active_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEMO_PROFILES.citizen;
  });

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('helphub_lang');
      if (saved === 'en' || saved === 'hi' || saved === 'or') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const [isLoading, setIsLoading] = useState(false);
  const isDemoMode = !isSupabaseConfigured || import.meta.env.VITE_DEMO_MODE === 'true';

  useEffect(() => {
    if (user) {
      localStorage.setItem('helphub_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('helphub_active_user');
    }
  }, [user]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('helphub_lang', lang);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'guest') {
      setUser(null);
      return;
    }
    const profile = DEMO_PROFILES[newRole] || {
      id: `usr-${Date.now()}`,
      display_name: `Demo ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`,
      role: newRole,
      preferred_language: language,
    };
    setUser(profile);
  };

  const login = async (email: string, selectedRole: UserRole = 'citizen') => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        // Live Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: 'Password123!', // Demo standard
        });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            display_name: data.user.user_metadata?.display_name || email.split('@')[0],
            role: (data.user.user_metadata?.role as UserRole) || 'citizen',
            preferred_language: language,
          });
          return;
        }
      }

      // Demo login
      switchRole(selectedRole);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, displayName: string, selectedRole: UserRole) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: 'Password123!',
          options: {
            data: {
              display_name: displayName,
              role: selectedRole,
              preferred_language: language,
            },
          },
        });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            display_name: displayName,
            role: selectedRole,
            preferred_language: language,
          });
          return;
        }
      }

      // Demo signup
      const newProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        display_name: displayName,
        role: selectedRole,
        preferred_language: language,
      };
      setUser(newProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'guest',
        language,
        setLanguage,
        switchRole,
        login,
        signup,
        logout,
        isDemoMode,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

