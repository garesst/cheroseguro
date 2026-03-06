import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://strapi.cheroseguro.com';

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
    if (!body.activity_type) {
      return NextResponse.json(
        { error: 'activity_type es requerido' },
        { status: 400 }
      );
    }

    // Crear la actividad de aprendizaje
    const activityData = {
      user_id: userInfo.id,
      activity_type: body.activity_type,
      content_id: body.content_id || null,
      content_title: body.content_title || null,
      status: body.status || 'completed',
      score: body.score || null,
      time_spent_minutes: body.time_spent_minutes || 0,
      session_data: {
        ...body.session_data,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date().toISOString(),
      },
      started_at: body.started_at || new Date().toISOString(),
      completed_at: body.status === 'completed' ? new Date().toISOString() : null,
    };

    const activityResponse = await axios.post(
      `${DIRECTUS_URL}/items/learning_activities`,
      activityData,
      { headers: authHeaders }
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
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

    // Validar campos requeridos
    if (!body.activity_type) {
      return NextResponse.json(
        { error: 'activity_type es requerido' },
        { status: 400 }
      );
    }

    // Crear la actividad de aprendizaje
    const activityData = {
      user_id: userInfo.id,
      activity_type: body.activity_type,
      content_id: body.content_id || null,
      content_title: body.content_title || null,
      status: body.status || 'completed',
      score: body.score || null,
      time_spent_minutes: body.time_spent_minutes || 0,
      session_data: {
        ...body.session_data,
        ip_address: request.ip || 'unknown',
        timestamp: new Date().toISOString(),
      },
      started_at: body.started_at || new Date().toISOString(),
      completed_at: body.status === 'completed' ? new Date().toISOString() : null,
    };

    const activity = await directus.request(
      createItem('learning_activities', activityData)
    );

    // Actualizar estadísticas del perfil del usuario si es necesario
    if (body.time_spent_minutes > 0) {
      try {
        // Esta lógica se puede mover a un webhook o función serverless
        // por ahora la mantenemos simple
        await fetch(`${process.env.DIRECTUS_URL}/flows/trigger/update-user-stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: userInfo.id,
            activity_type: body.activity_type,
            time_spent: body.time_spent_minutes,
          }),
        });
      } catch (error) {
        console.error('Error updating user stats:', error);
        // No fallar la request principal por este error
      }
    }

    return NextResponse.json(
      {
        success: true,
        activity_id: activity.id,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error tracking learning activity:', error);
    
    if (error.errors && error.errors[0]?.extensions?.code === 'INVALID_TOKEN') {
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