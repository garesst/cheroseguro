'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const PROFILE_CACHE_KEY = 'cheroseguro_profile_cache';

function saveProfileCache(user: User, profile: UserProfile | null, stats: UserStats | null, recentActivities: any[], practiceProgress: any[]) {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ user, profile, stats, recentActivities, practiceProgress, cachedAt: Date.now() }));
  } catch { /* ignorar errores de localStorage */ }
}

function loadProfileCache(): { user: User; profile: UserProfile | null; stats: UserStats | null; recentActivities: any[]; practiceProgress: any[] } | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Caché válido por 24 horas
    if (Date.now() - (parsed.cachedAt || 0) > 24 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearProfileCache() {
  try { localStorage.removeItem(PROFILE_CACHE_KEY); } catch { /* ignorar */ }
}

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
  articles_read: number;
  average_study_time_minutes: number;
  certifications_completed: number;
  total_study_time: number;
  current_streak: number;
  longest_streak: number;
  articles_by_difficulty: Record<string, { read: number; total: number }>;
  practices_by_difficulty: Record<string, { completed: number; total: number }>;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  stats: UserStats | null;
  recentActivities: any[];
  practiceProgress: any[];
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
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [practiceProgress, setPracticeProgress] = useState<any[]>([]);
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
        setRecentActivities(data.recent_activities || []);
        setPracticeProgress(data.practice_progress || []);
        saveProfileCache(data.user, data.profile, data.stats, data.recent_activities || [], data.practice_progress || []);
        return true;
      } else if (response.status === 401 || response.status === 403) {
        // Solo limpiar sesión en errores de autenticación
        clearProfileCache();
        setUser(null);
        setProfile(null);
        setStats(null);
        setRecentActivities([]);
        setPracticeProgress([]);
        return false;
      } else {
        // En errores 5xx u otros, no cerrar sesión — mantener estado actual
        console.error('Error fetching profile (non-auth):', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Error de red: no cerrar sesión
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
        // Fetch full profile with stats (login route only returns user)
        fetchUserProfile();
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
      clearProfileCache();
      setUser(null);
      setProfile(null);
      setStats(null);
      setRecentActivities([]);
      setPracticeProgress([]);
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

      // Mostrar datos en caché al instante (stale-while-revalidate)
      const cached = loadProfileCache();
      if (cached) {
        setUser(cached.user);
        setProfile(cached.profile);
        setStats(cached.stats);
        setRecentActivities(cached.recentActivities || []);
        setPracticeProgress(cached.practiceProgress || []);
        setIsLoading(false); // Mostrar UI de inmediato con datos cacheados
      }

      // Verificar token y obtener datos frescos en segundo plano
      const ok = await fetchUserProfile();
      if (!ok && !cached) {
        setIsLoading(false);
      }
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
    recentActivities,
    practiceProgress,
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