import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://strapi.cheroseguro.com';

// GET — obtener el progreso de prácticas del usuario para restaurar en cliente
export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie');
    const tokenMatch = cookies?.match(/directus_token=([^;]*)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const authHeaders = { Authorization: `Bearer ${token}` };

    const userResponse = await axios.get(`${DIRECTUS_URL}/users/me`, { headers: authHeaders });
    const userInfo = userResponse.data.data ?? userResponse.data;

    const progressResponse = await axios.get(`${DIRECTUS_URL}/items/practice_progress`, {
      headers: authHeaders,
      params: {
        'filter[user_id][_eq]': userInfo.id,
        sort: '-updated_at',
        limit: 1000,
        fields: 'practice_slug,practice_title,status,completion_percentage,best_score,attempts_count,last_attempt_at,first_completed_at',
      },
    });

    return NextResponse.json({
      success: true,
      practice_progress: progressResponse.data?.data ?? [],
    });
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return NextResponse.json({ error: 'Token inv\u00e1lido' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obtener el token de las cookies
    const cookies = request.headers.get('cookie');
    const tokenMatch = cookies?.match(/directus_token=([^;]*)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const authHeaders = { Authorization: `Bearer ${token}` };

    // Obtener información del usuario autenticado
    const userResponse = await axios.get(`${DIRECTUS_URL}/users/me`, {
      headers: authHeaders,
    });
    const userInfo = userResponse.data.data ?? userResponse.data;

    // Obtener datos del request
    const body = await request.json();

    // Validar campos requeridos
    if (!body.practice_slug || !body.practice_title) {
      return NextResponse.json(
        { error: 'practice_slug y practice_title son requeridos' },
        { status: 400 }
      );
    }

    // Buscar progreso existente
    const existingResponse = await axios.get(`${DIRECTUS_URL}/items/practice_progress`, {
      headers: authHeaders,
      params: {
        'filter[user_id][_eq]': userInfo.id,
        'filter[practice_slug][_eq]': body.practice_slug,
        limit: 1,
      },
    });
    const existingProgress = existingResponse.data.data;

    const currentTime = new Date().toISOString();

    if (existingProgress.length > 0) {
      const existing = existingProgress[0];
      const updateData: any = {
        updated_at: currentTime,
        last_attempt_at: currentTime,
      };

      if (body.status !== undefined) updateData.status = body.status;
      if (body.completion_percentage !== undefined) {
        updateData.completion_percentage = Math.max(existing.completion_percentage || 0, body.completion_percentage);
      }
      if (body.score !== undefined) {
        updateData.best_score = Math.max(existing.best_score || 0, body.score);
      }
      if (body.time_spent_minutes !== undefined) {
        updateData.total_time_spent_minutes = (existing.total_time_spent_minutes || 0) + body.time_spent_minutes;
      }
      updateData.attempts_count = (existing.attempts_count || 0) + 1;
      if (body.status === 'completed' && !existing.first_completed_at) {
        updateData.first_completed_at = currentTime;
      }

      const updatedResponse = await axios.patch(
        `${DIRECTUS_URL}/items/practice_progress/${existing.id}`,
        updateData,
        { headers: authHeaders }
      );

      const updated = updatedResponse.data.data ?? updatedResponse.data;
      return NextResponse.json(
        { success: true, practice_progress_id: updated.id, action: 'updated' },
        { status: 200 }
      );

    } else {
      const progressData = {
        user_id: userInfo.id,
        practice_slug: body.practice_slug,
        practice_title: body.practice_title,
        category: body.category || null,
        difficulty_level: body.difficulty_level || 'beginner',
        status: body.status || 'not_started',
        completion_percentage: body.completion_percentage || 0,
        best_score: body.score || null,
        attempts_count: 1,
        total_time_spent_minutes: body.time_spent_minutes || 0,
        first_completed_at: body.status === 'completed' ? currentTime : null,
        last_attempt_at: currentTime,
        created_at: currentTime,
        updated_at: currentTime,
      };

      const newResponse = await axios.post(
        `${DIRECTUS_URL}/items/practice_progress`,
        progressData,
        { headers: authHeaders }
      );

      const created = newResponse.data.data ?? newResponse.data;
      return NextResponse.json(
        { success: true, practice_progress_id: created.id, action: 'created' },
        { status: 201 }
      );
    }

  } catch (error: any) {
    console.error('Error tracking practice progress:', error?.response?.data || error?.message);

    if (error?.response?.status === 401) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}