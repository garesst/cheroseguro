import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;

    if (!DIRECTUS_URL) {
      console.error('DIRECTUS_URL no está definida');
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // 🔐 Autenticar directamente contra la API REST de Directus
    const authResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: body.email.toLowerCase(),
        password: body.password,
      }),
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();
    const accessToken: string | undefined = authData.data?.access_token.trim().replace(/[^\x20-\x7E]/g, '');
    console.info('Login token:', accessToken);

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // 👤 Obtener datos del usuario con el token obtenido
    const userResponse = await axios.get(`${DIRECTUS_URL}/users/me`, {
      params: {
        fields: 'id,email,first_name,last_name,role,avatar'
      },
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    console.log("STATUS /users/me:", userResponse.status);

    const rawText = await userResponse.data;
    console.log("RAW RESPONSE:", rawText);

    if (!userResponse.status) {
      return NextResponse.json(
        { error: 'Error al obtener datos del usuario' },
        { status: 500 }
      );
    }

    const userData = await userResponse;
    const user = userData.data;

    // 🔄 Procesar datos del registro temporal (primer login)
    let finalFirstName = user.first_name || '';
    let finalLastName = user.last_name || '';

    try {
      const tempDataResponse = await axios.get(`${DIRECTUS_URL}/items/registration_temp_data`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          'filter[email][_eq]': body.email.toLowerCase(),
          'filter[profile_setup_pending][_eq]': true,
          limit: 1,
        },
      });

      const tempRecords = tempDataResponse.data?.data ?? [];

      if (tempRecords.length > 0) {
        const tempData = tempRecords[0];
        finalFirstName = tempData.first_name || finalFirstName;
        finalLastName = tempData.last_name || finalLastName;

        // Actualizar first_name y last_name en el usuario de Directus
        await axios.patch(
          `${DIRECTUS_URL}/users/me`,
          { first_name: finalFirstName, last_name: finalLastName },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        // Crear user_profiles si no existe
        try {
          await axios.post(
            `${DIRECTUS_URL}/items/user_profiles`,
            {
              user_id: user.id,
              experience_level: tempData.experience_level || 'beginner',
              learning_preferences: tempData.learning_preferences || {},
              onboarding_completed: true,
              total_study_time_minutes: 0,
              current_streak_days: 0,
              longest_streak_days: 0,
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
        } catch (profileError: any) {
          // Si ya existe el perfil, no fallar
          if (profileError?.response?.status !== 400) {
            console.error('Error creating user_profile:', profileError?.response?.data);
          }
        }

        // Marcar el temp data como procesado
        await axios.patch(
          `${DIRECTUS_URL}/items/registration_temp_data/${tempData.id}`,
          { profile_setup_pending: false },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        console.info('Primer login: perfil completado para', body.email);
      }
    } catch (tempError: any) {
      // No bloquear el login si falla el procesamiento del temp data
      console.error('Error procesando registration_temp_data:', tempError?.response?.data || tempError?.message);
    }

    // 🍪 Guardar token en cookie httpOnly
    const maxAge = body.remember_me
      ? 30 * 24 * 60 * 60 // 30 días
      : 60 * 60; // 1 hora

    const response = NextResponse.json(
      {
        success: true,
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          email: user.email,
          first_name: finalFirstName,
          last_name: finalLastName,
          avatar: user.avatar || null,
        },
      },
      { status: 200 }
    );

    response.cookies.set('directus_token', accessToken, {
      maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}