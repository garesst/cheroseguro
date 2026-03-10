'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, Calendar, Trophy, Star, Target, BookOpen, 
  Gamepad2, Shield, Award, Clock, Flame, 
  RefreshCw, LogOut, Settings, Eye, EyeOff 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ActionTracker } from '@/components/tracking/action-tracker';
import { useAuth } from '@/contexts/auth-context';

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

interface UserDashboardProps {
  user: User;
  profile: UserProfile | null;
  stats: UserStats | null;
  recentActivities: any[];
  practiceProgress: any[];
  onRefresh: () => Promise<void>;
}

export default function UserDashboard({ user, profile, stats, recentActivities, practiceProgress, onRefresh }: UserDashboardProps) {
  const { logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getExperienceLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return '🌱 Principiante';
      case 'intermediate': return '🚀 Intermedio';
      case 'advanced': return '⚡ Avanzado';
      default: return '🌱 Principiante';
    }
  };

  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    const f = firstName?.charAt(0) ?? '';
    const l = lastName?.charAt(0) ?? '';
    return (f + l).toUpperCase() || '?';
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Panel de Control
          </h1>
          <p className="text-slate-600 mt-1">
            Bienvenido de vuelta, {user.first_name ?? ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <ActionTracker action="logout" category="auth">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </ActionTracker>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-slate-50 border-blue-100">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarFallback className="text-xl bg-blue-600 text-white">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {user.first_name ?? ''} {user.last_name ?? ''}
              </h2>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className={showPersonalInfo ? '' : 'blur-sm'}>
                    {user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowPersonalInfo(!showPersonalInfo)}
                  >
                    {showPersonalInfo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
                {profile && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Miembro desde {formatJoinDate(profile.created_at)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {profile && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    {getExperienceLevelLabel(profile.experience_level)}
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  <Trophy className="h-3 w-3" />
                  {stats?.completed_activities || 0} Actividades
                </Badge>
                {(stats?.current_streak ?? 0) > 0 && (
                  <Badge variant="outline" className="gap-1 bg-orange-50 border-orange-200 text-orange-700">
                    <Flame className="h-3 w-3" />
                    Racha: {stats!.current_streak} días
                  </Badge>
                )}
              </div>
            </div>

            <ActionTracker action="edit_profile" category="profile">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </ActionTracker>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Alert */}
      {profile && !profile.onboarding_completed && (
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>¡Completa tu configuración inicial!</strong> Responde algunas preguntas para personalizar tu experiencia de aprendizaje.
            <ActionTracker action="start_onboarding" category="onboarding">
              <Button size="sm" className="ml-3 bg-blue-600 hover:bg-blue-700">
                Comenzar
              </Button>
            </ActionTracker>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {stats?.articles_read || 0}
                </div>
                <div className="text-sm text-slate-600">Artículos Leídos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {stats?.practices_completed || 0}
                </div>
                <div className="text-sm text-slate-600">Prácticas Completadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatStudyTime(stats?.average_study_time_minutes || 0)}
                </div>
                <div className="text-sm text-slate-600">Tiempo Promedio de Estudio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {stats?.certifications_completed || 0}
                </div>
                <div className="text-sm text-slate-600">Certificaciones (próximamente)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="w-full">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="progress">Progreso</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
              </TabsList>
            </CardHeader>

            <div className="px-6 pb-6">
              <TabsContent value="overview" className="mt-0 space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Estadísticas Rápidas</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Flame className="h-5 w-5 text-orange-500" />
                          <span className="font-medium">Racha actual</span>
                        </div>
                        <span className="font-bold text-lg">
                          {stats?.current_streak ?? 0} días
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          <span className="font-medium">Mejor racha</span>
                        </div>
                        <span className="font-bold text-lg">
                          {stats?.longest_streak ?? 0} días
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">Tiempo promedio de estudio</span>
                        </div>
                        <span className="font-bold text-lg">
                          {formatStudyTime(stats?.average_study_time_minutes || 0)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-emerald-600" />
                          <span className="font-medium">Artículos leídos</span>
                        </div>
                        <span className="font-bold text-lg">
                          {stats?.articles_read || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Acciones Rápidas</h3>
                    
                    <div className="space-y-3">
                      <ActionTracker action="continue_learning" category="navigation">
                        <Link href="/learn" className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">Continuar Aprendiendo</div>
                              <div className="text-sm text-slate-500">Explora nuevos temas</div>
                            </div>
                          </div>
                          <Button size="sm">Ir</Button>
                        </Link>
                      </ActionTracker>

                      <ActionTracker action="practice_skills" category="navigation">
                        <Link href="/practice" className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <Target className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">Practicar Habilidades</div>
                              <div className="text-sm text-slate-500">Refuerza tu conocimiento</div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Practicar</Button>
                        </Link>
                      </ActionTracker>

                      <ActionTracker action="play_games" category="navigation">
                        <Link href="/play" className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                              <Gamepad2 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium">Juegos Didácticos</div>
                              <div className="text-sm text-slate-500">Aprende jugando</div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Jugar</Button>
                        </Link>
                      </ActionTracker>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="progress" className="mt-0 space-y-4">
                {(['beginner', 'intermediate', 'advanced'] as const).map(level => {
                  const labels: Record<string, string> = {
                    beginner: '🌱 Principiante',
                    intermediate: '🚀 Intermedio',
                    advanced: '⚡ Avanzado',
                  };
                  const articleStats = stats?.articles_by_difficulty?.[level] ?? { read: 0, total: 0 };
                  const practiceStats = stats?.practices_by_difficulty?.[level] ?? { completed: 0, total: 0 };
                  const articlePct = articleStats.total > 0 ? Math.round((articleStats.read / articleStats.total) * 100) : 0;
                  const practicePct = practiceStats.total > 0 ? Math.round((practiceStats.completed / practiceStats.total) * 100) : 0;

                  if (articleStats.total === 0 && practiceStats.total === 0) return null;

                  return (
                    <div key={level} className="rounded-lg border border-slate-100 p-4 space-y-4">
                      <h4 className="font-semibold text-slate-800">{labels[level]}</h4>

                      {articleStats.total > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-600">
                              <BookOpen className="h-4 w-4 text-emerald-500" />
                              Artículos leídos
                            </span>
                            <span className="text-slate-500 tabular-nums">{articleStats.read}/{articleStats.total}</span>
                          </div>
                          <Progress value={articlePct} className="h-2" />
                        </div>
                      )}

                      {practiceStats.total > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-600">
                              <Target className="h-4 w-4 text-blue-500" />
                              Prácticas completadas
                            </span>
                            <span className="text-slate-500 tabular-nums">{practiceStats.completed}/{practiceStats.total}</span>
                          </div>
                          <Progress value={practicePct} className="h-2" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {!stats?.articles_by_difficulty && !stats?.practices_by_difficulty && (
                  <p className="text-sm text-slate-500 py-4 text-center">Cargando progreso...</p>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Actividad Reciente
                  </h3>
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p>Aún no hay actividad registrada</p>
                      <p className="text-sm">Completa una práctica o lección para ver tu historial aquí</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentActivities.map((a: any, i: number) => {
                        const isLearn = a.activity_type === 'learn';
                        const isPractice = a.activity_type === 'practice';
                        const isCert = a.activity_type === 'certification';
                        const icon = isLearn ? (
                          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <BookOpen className="h-4 w-4 text-emerald-600" />
                          </div>
                        ) : isPractice ? (
                          <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <Target className="h-4 w-4 text-blue-600" />
                          </div>
                        ) : isCert ? (
                          <div className="h-9 w-9 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                            <Award className="h-4 w-4 text-yellow-600" />
                          </div>
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Gamepad2 className="h-4 w-4 text-slate-500" />
                          </div>
                        );
                        const typeLabel = isLearn ? 'Artículo' : isPractice ? 'Práctica' : isCert ? 'Certificación' : 'Actividad';
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            {icon}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-800 truncate">
                                {a.content_title || a.content_id || typeLabel}
                              </div>
                              <div className="text-xs text-slate-500">{typeLabel}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs text-slate-400">
                                {new Date(a.started_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                              </div>
                              {a.score != null && (
                                <div className="text-xs font-medium text-slate-600">{a.score}%</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}