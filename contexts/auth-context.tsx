'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string | null;
}

interface UserProfile {
  id: string;
  user_id: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  learning_preferences: any;
  onboarding_completed: boolean;
  total_study_time_minutes: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_learning_activity: string | null;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total_activities: number;
  completed_activities: number;
  average_score: number;
  practices_completed: number;
  total_study_time: number;
  current_streak: number;
  longest_streak: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  stats: UserStats | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    experience_level: string;
    learning_preferences: any;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Función para obtener el perfil del usuario actual
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfile(data.profile);
        setStats(data.stats);
        return true;
      } else {
        // Si no está autenticado, limpiar el estado
        setUser(null);
        setProfile(null);
        setStats(null);
        return false;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      setProfile(null);
      setStats(null);
      return false;
    }
  };

  // Función de login
  const login = async (
    email: string, 
    password: string, 
    remember: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          remember_me: remember,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setProfile(data.profile);
        setStats(data.stats || null);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Error al iniciar sesión' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Error de conexión. Por favor intenta más tarde.' 
      };
    }
  };

  // Función de registro
  const register = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    experience_level: string;
    learning_preferences: any;
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          message: data.message || '¡Cuenta creada exitosamente!' 
        };
      } else {
        return { 
          success: false, 
          error: data.error || 'Error al crear la cuenta' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Error de conexión. Por favor intenta más tarde.' 
      };
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar estado local independientemente del resultado de la API
      setUser(null);
      setProfile(null);
      setStats(null);
      router.push('/login');
    }
  };

  // Función para refrescar el perfil
  const refreshProfile = async () => {
    if (isAuthenticated) {
      await fetchUserProfile();
    }
  };

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      await fetchUserProfile();
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Auto-refresh del perfil cada 5 minutos si está autenticado
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshProfile();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    profile,
    stats,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook para proteger rutas
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      const currentPath = window.location.pathname;
      const returnUrl = encodeURIComponent(currentPath);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  return auth;
}