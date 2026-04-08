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
      userId = ANONYMOUS_DIRECTUS_USER_ID;
    }

    // Obtener datos del request
    const body = await request.json();

    // Validar campos requeridos
    if (!body.content_type || !body.interaction_type) {
      return NextResponse.json(
        { error: 'content_type e interaction_type son requeridos' },
        { status: 400 }
      );
    }

    // Crear la interacción
    const interactionData = {
      ...(userId ? { user_id: userId } : {}),
      content_type: body.content_type,
      content_id: body.content_id || 'unknown',
      interaction_type: body.interaction_type,
      session_id: body.session_id || `session_${Date.now()}`,
      interaction_data: {
        ...body.interaction_data,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        timestamp: new Date().toISOString(),
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    };

    const interactionResponse = await axios.post(
      `${DIRECTUS_URL}/items/content_interactions`,
      interactionData,
      { headers: authHeaders }
    );

    const created = interactionResponse.data.data ?? interactionResponse.data;

    return NextResponse.json(
      {
        success: true,
        interaction_id: created.id,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error tracking interaction:', error?.response?.data || error?.message);

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