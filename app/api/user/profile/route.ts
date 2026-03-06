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
            limit: 10,
            fields: 'id,activity_type,content_title,status,score,time_spent_minutes,started_at,completed_at',
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
            limit: 5,
            fields: 'practice_slug,practice_title,status,completion_percentage,best_score,attempts_count',
          },
        }
      );
      practiceProgress = practiceResponse.data?.data ?? [];
    } catch {
      // La colección aún no existe o no hay progreso
    }

    // Calcular estadísticas
    const completedActivities = recentActivities.filter(
      (a: any) => a.status === 'completed'
    );
    const totalScore = completedActivities.reduce(
      (sum: number, a: any) => sum + (a.score || 0), 0
    );
    const averageScore = completedActivities.length > 0
      ? Math.round(totalScore / completedActivities.length)
      : 0;
    const practicesCompleted = practiceProgress.filter(
      (p: any) => p.status === 'completed'
    ).length;

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
          total_study_time: userProfile?.total_study_time_minutes || 0,
          current_streak: userProfile?.current_streak_days || 0,
          longest_streak: userProfile?.longest_streak_days || 0,
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
