import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://strapi.cheroseguro.com';
const ANONYMOUS_DIRECTUS_USER_ID =
  process.env.DIRECTUS_ANONYMOUS_USER_ID || process.env.NEXT_PUBLIC_DIRECTUS_ANONYMOUS_USER_ID;
const DIRECTUS_SERVICE_TOKEN = process.env.DIRECTUS_SERVICE_TOKEN || process.env.DIRECTUS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    // Obtener el token de las cookies
    const cookies = request.headers.get('cookie');
    const tokenMatch = cookies?.match(/directus_token=([^;]*)/);
    const token = tokenMatch?.[1];
    const authHeaders = token
      ? { Authorization: `Bearer ${token}` }
      : DIRECTUS_SERVICE_TOKEN
        ? { Authorization: `Bearer ${DIRECTUS_SERVICE_TOKEN}` }
        : undefined;
    let userId: string | null = null;

    if (token) {
      // Obtener información del usuario autenticado
      const userResponse = await axios.get(`${DIRECTUS_URL}/users/me`, {
        headers: authHeaders,
      });
      const userInfo = userResponse.data.data ?? userResponse.data;
      userId = userInfo.id;
    } else if (DIRECTUS_SERVICE_TOKEN && ANONYMOUS_DIRECTUS_USER_ID) {
      // En modo anónimo con token de servicio, sí podemos asignar user_id fijo.
      userId = ANONYMOUS_DIRECTUS_USER_ID;
    }

    // Obtener datos del request
    const body = await request.json();

    // Validar campos requeridos
    if (!body.activity_type) {
      return NextResponse.json(
        { error: 'activity_type es requerido' },
        { status: 400 }
      );
    }

    const resolvedStatus = body.status || 'completed';

    // Crear la actividad de aprendizaje
    const activityData = {
      ...(userId ? { user_id: userId } : {}),
      activity_type: body.activity_type,
      content_id: body.content_id || null,
      content_title: body.content_title || null,
      status: resolvedStatus,
      score: body.score || null,
      time_spent_minutes: body.time_spent_minutes || 0,
      session_data: {
        ...body.session_data,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date().toISOString(),
      },
      started_at: body.started_at || new Date().toISOString(),
      completed_at: resolvedStatus === 'completed' ? new Date().toISOString() : null,
    };

    const requestConfig = authHeaders ? { headers: authHeaders } : undefined;

    const activityResponse = await axios.post(
      `${DIRECTUS_URL}/items/learning_activities`,
      activityData,
      requestConfig
    );

    const created = activityResponse.data.data ?? activityResponse.data;

    return NextResponse.json(
      {
        success: true,
        activity_id: created.id,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error tracking learning activity:', error?.response?.data || error?.message);

    if (error?.response?.status === 401) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error?.response?.data || error?.message,
      },
      { status: 500 }
    );
  }
}