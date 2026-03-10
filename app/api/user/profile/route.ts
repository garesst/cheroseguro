import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://strapi.cheroseguro.com';

export async function GET(request: NextRequest) {
  try {
    // Obtener el token de las cookies
    const cookies = request.headers.get('cookie');
    const tokenMatch = cookies?.match(/directus_token=([^;]*)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión para continuar.' },
        { status: 401 }
      );
    }

    const authHeaders = { Authorization: `Bearer ${token}` };

    // Obtener información del usuario
    const userResponse = await axios.get(`${DIRECTUS_URL}/users/me`, {
      headers: authHeaders,
      params: { fields: 'id,email,first_name,last_name,avatar' },
    });
    const userInfo = userResponse.data.data ?? userResponse.data;

    // Obtener el perfil extendido (puede no existir aún)
    let userProfile = null;
    try {
      const profileResponse = await axios.get(
        `${DIRECTUS_URL}/items/user_profiles`,
        {
          headers: authHeaders,
          params: { 'filter[user_id][_eq]': userInfo.id, limit: 1 },
        }
      );
      const profileData = profileResponse.data?.data ?? [];
      userProfile = profileData.length > 0 ? profileData[0] : null;
    } catch {
      // El perfil aún no existe
    }

    // Crear perfil si no existe
    if (!userProfile) {
      try {
        const newProfileResponse = await axios.post(
          `${DIRECTUS_URL}/items/user_profiles`,
          {
            user_id: userInfo.id,
            experience_level: 'beginner',
            learning_preferences: {},
            onboarding_completed: false,
            total_study_time_minutes: 0,
            current_streak_days: 0,
            longest_streak_days: 0,
          },
          { headers: authHeaders }
        );
        userProfile = newProfileResponse.data?.data ?? null;
      } catch {
        // No bloquear si la creación falla
      }
    }

    // Obtener actividades recientes (puede no existir aún)
    let recentActivities: any[] = [];
    try {
      const activitiesResponse = await axios.get(
        `${DIRECTUS_URL}/items/learning_activities`,
        {
          headers: authHeaders,
          params: {
            'filter[user_id][_eq]': userInfo.id,
            sort: '-started_at',
            limit: 500,
            fields: 'id,activity_type,content_id,content_title,status,score,time_spent_minutes,started_at,completed_at',
          },
        }
      );
      recentActivities = activitiesResponse.data?.data ?? [];
    } catch {
      // La colección aún no existe o no hay actividades
    }

    // Obtener progreso en prácticas (puede no existir aún)
    let practiceProgress: any[] = [];
    try {
      const practiceResponse = await axios.get(
        `${DIRECTUS_URL}/items/practice_progress`,
        {
          headers: authHeaders,
          params: {
            'filter[user_id][_eq]': userInfo.id,
            sort: '-updated_at',
            limit: 1000,
            fields: 'practice_slug,practice_title,status,completion_percentage,best_score,attempts_count,difficulty_level',
          },
        }
      );
      practiceProgress = practiceResponse.data?.data ?? [];
    } catch {
      // La colección aún no existe o no hay progreso
    }

    // Obtener todos los artículos publicados para calcular totales por dificultad
    let allArticles: Array<{ slug: string; difficulty: string }> = [];
    try {
      const articlesResponse = await axios.get(`${DIRECTUS_URL}/items/articles`, {
        headers: authHeaders,
        params: {
          'filter[status][_eq]': 'published',
          fields: 'slug,difficulty',
          limit: 1000,
        },
      });
      allArticles = articlesResponse.data?.data ?? [];
    } catch {
      // No bloquear si falla
    }

    // Obtener todas las prácticas publicadas para calcular totales por dificultad
    let allPractices: Array<{ slug: string; difficulty: string }> = [];
    try {
      const practicesResponse = await axios.get(`${DIRECTUS_URL}/items/practices`, {
        headers: authHeaders,
        params: {
          'filter[status][_eq]': 'published',
          fields: 'slug,difficulty',
          limit: 1000,
        },
      });
      allPractices = practicesResponse.data?.data ?? [];
    } catch {
      // No bloquear si falla
    }

    // Calcular estadísticas
    const completedActivities = recentActivities.filter(
      (a: any) => a.status === 'completed' && a.activity_type !== 'logout'
    );
    const totalScore = completedActivities.reduce(
      (sum: number, a: any) => sum + (a.score || 0), 0
    );
    const averageScore = completedActivities.length > 0
      ? Math.round(totalScore / completedActivities.length)
      : 0;

    // Contar artículos leídos: actividades tipo 'learn' (ArticleReadTracker escribe aquí).
    // content_id contiene el slug del artículo — usamos Set para deduplicar.
    const uniqueReadArticles = new Set(
      recentActivities
        .filter((a: any) => a.activity_type === 'learn')
        .map((a: any) => a.content_id || a.content_title)
        .filter(Boolean)
    );

    const studyActivities = completedActivities.filter(
      (a: any) => (a.time_spent_minutes || 0) > 0
    );
    const totalStudyTimeFromActivities = studyActivities.reduce(
      (sum: number, a: any) => sum + (a.time_spent_minutes || 0),
      0
    );
    const averageStudyTimeMinutes = studyActivities.length > 0
      ? Math.round(totalStudyTimeFromActivities / studyActivities.length)
      : 0;

    const certificationActivities = completedActivities.filter(
      (a: any) => a.activity_type === 'certification'
    );

    const practicesCompleted = practiceProgress.filter(
      (p: any) => p.status === 'completed' || p.status === 'mastered'
    ).length;

    // ── Desglose por dificultad ───────────────────────────────────────────────
    const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

    // Artículos: total publicados vs leídos por dificultad
    const articlesTotalByLevel: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0 };
    for (const a of allArticles) {
      const lvl = a.difficulty || 'beginner';
      if (lvl in articlesTotalByLevel) articlesTotalByLevel[lvl]++;
    }
    const articlesReadByLevel: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0 };
    for (const slug of uniqueReadArticles) {
      const article = allArticles.find(a => String(a.slug) === String(slug) || String(a.slug) === String(slug).replace('/learn/', ''));
      if (article) {
        const lvl = article.difficulty || 'beginner';
        if (lvl in articlesReadByLevel) articlesReadByLevel[lvl]++;
      }
    }

    // Prácticas: completadas (del usuario) vs total publicadas por dificultad
    const practicesByLevel: Record<string, { completed: number; total: number }> = {
      beginner: { completed: 0, total: 0 },
      intermediate: { completed: 0, total: 0 },
      advanced: { completed: 0, total: 0 },
    };
    // Total = todas las prácticas publicadas en cada nivel
    for (const p of allPractices) {
      const lvl = p.difficulty || 'beginner';
      if (lvl in practicesByLevel) practicesByLevel[lvl].total++;
    }
    // Completadas = prácticas del usuario con status completed/mastered
    for (const p of practiceProgress) {
      const lvl = p.difficulty_level || 'beginner';
      if (lvl in practicesByLevel) {
        if (p.status === 'completed' || p.status === 'mastered') {
          practicesByLevel[lvl].completed++;
        }
      }
    }

    const articlesByDifficulty: Record<string, { read: number; total: number }> = {};
    for (const lvl of LEVELS) {
      articlesByDifficulty[lvl] = { read: articlesReadByLevel[lvl] ?? 0, total: articlesTotalByLevel[lvl] ?? 0 };
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Cálculo de racha ──────────────────────────────────────────────────────
    // Recopilar fechas únicas con actividad (ignorar logout)
    const activityDatesSet = new Set<string>();
    for (const activity of recentActivities) {
      if (activity.activity_type === 'logout') continue;
      const dateStr = (activity.started_at || '').split('T')[0];
      if (dateStr) activityDatesSet.add(dateStr);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // Racha actual: días consecutivos terminando hoy o ayer
    let calculatedCurrentStreak = 0;
    if (activityDatesSet.has(todayStr) || activityDatesSet.has(yesterdayStr)) {
      const startStr = activityDatesSet.has(todayStr) ? todayStr : yesterdayStr;
      const checkDate = new Date(startStr + 'T12:00:00Z');
      for (let i = 0; i < 365; i++) {
        const s = checkDate.toISOString().split('T')[0];
        if (activityDatesSet.has(s)) {
          calculatedCurrentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Racha más larga histórica
    const sortedUniqueDates = Array.from(activityDatesSet).sort();
    let calculatedLongestStreak = calculatedCurrentStreak;
    if (sortedUniqueDates.length > 1) {
      let tempStreak = 1;
      for (let i = 1; i < sortedUniqueDates.length; i++) {
        const prev = new Date(sortedUniqueDates[i - 1] + 'T12:00:00Z');
        const curr = new Date(sortedUniqueDates[i] + 'T12:00:00Z');
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > calculatedLongestStreak) calculatedLongestStreak = tempStreak;
        } else {
          tempStreak = 1;
        }
      }
    }
    // Si ya hay un valor mayor guardado, respetarlo
    if (userProfile?.longest_streak_days && userProfile.longest_streak_days > calculatedLongestStreak) {
      calculatedLongestStreak = userProfile.longest_streak_days;
    }

    // Persistir racha en user_profiles si cambió
    if (userProfile && (
      calculatedCurrentStreak !== userProfile.current_streak_days ||
      calculatedLongestStreak > (userProfile.longest_streak_days || 0)
    )) {
      try {
        await axios.patch(
          `${DIRECTUS_URL}/items/user_profiles/${userProfile.id}`,
          {
            current_streak_days: calculatedCurrentStreak,
            longest_streak_days: calculatedLongestStreak,
            last_learning_activity: new Date().toISOString(),
          },
          { headers: authHeaders }
        );
        userProfile.current_streak_days = calculatedCurrentStreak;
        userProfile.longest_streak_days = calculatedLongestStreak;
      } catch {
        // No bloquear si el patch falla
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userInfo.id,
          first_name: userInfo.first_name,
          last_name: userInfo.last_name,
          email: userInfo.email,
          avatar: userInfo.avatar || null,
        },
        profile: userProfile,
        stats: {
          total_activities: recentActivities.length,
          completed_activities: completedActivities.length,
          average_score: averageScore,
          practices_completed: practicesCompleted,
          articles_read: uniqueReadArticles.size,
          average_study_time_minutes: averageStudyTimeMinutes,
          certifications_completed: certificationActivities.length,
          total_study_time: userProfile?.total_study_time_minutes || 0,
          current_streak: calculatedCurrentStreak,
          longest_streak: calculatedLongestStreak,
          articles_by_difficulty: articlesByDifficulty,
          practices_by_difficulty: practicesByLevel,
        },
        recent_activities: recentActivities.slice(0, 5),
        practice_progress: practiceProgress,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Profile fetch error:', error?.response?.data || error?.message);

    if (error?.response?.status === 401) {
      return NextResponse.json(
        { error: 'Sesión expirada. Por favor inicia sesión nuevamente.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor. Por favor intenta más tarde.' },
      { status: 500 }
    );
  }
}
