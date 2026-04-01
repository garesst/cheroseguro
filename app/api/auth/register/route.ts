import { NextRequest, NextResponse } from 'next/server';
import { directus } from '@/lib/directus';
import { createItem } from '@directus/sdk';

interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
  learning_preferences?: {
    preferred_difficulty: string;
    topics_of_interest: string[];
    learning_style: string;
  };
}

function getAppBaseUrl(): string | null {
  const candidates = [process.env.APP_URL, process.env.NEXT_PUBLIC_APP_URL];

  for (const value of candidates) {
    if (!value) continue;
    const normalized = String(value).trim();
    if (!normalized || normalized === 'undefined' || normalized === 'null') continue;

    try {
      const parsed = new URL(normalized);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // Continue checking candidates.
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();

    // Validación básica
    if (!body.email || !body.password || !body.first_name || !body.last_name) {
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben completarse' },
        { status: 400 }
      );
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validación de contraseña (mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(body.password)) {
      return NextResponse.json(
        {
          error: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números'
        },
        { status: 400 }
      );
    }

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!directusUrl) {
      return NextResponse.json(
        { error: 'Falta NEXT_PUBLIC_DIRECTUS_URL' },
        { status: 500 }
      );
    }

    const appBaseUrl = getAppBaseUrl();
    if (!appBaseUrl) {
      return NextResponse.json(
        { error: 'Falta APP_URL o NEXT_PUBLIC_APP_URL con la URL pública del frontend' },
        { status: 500 }
      );
    }

    const verificationUrl = `${appBaseUrl}/verify-email`;

    // Crear usuario en Directus y mandar verificación al dominio del sitio.
    const registerResponse = await fetch(`${directusUrl}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: body.email.toLowerCase(),
        password: body.password,
        first_name: body.first_name,
        last_name: body.last_name,
        verification_url: verificationUrl,
      }),
    });

    if (!registerResponse.ok) {
      const registerErrorText = await registerResponse.text();
      console.error('Directus register error:', registerResponse.status, registerErrorText);

      if (registerResponse.status === 409) {
        return NextResponse.json(
          { error: 'Ya existe una cuenta con este email' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'No se pudo crear la cuenta en este momento' },
        { status: 502 }
      );
    }

    // Crear un registro temporal con los datos adicionales para el primer login
    const tempUserData = {
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      experience_level: body.experience_level || 'beginner',
      learning_preferences: body.learning_preferences || {
        preferred_difficulty: 'beginner',
        topics_of_interest: [],
        learning_style: 'visual'
      },
      registration_completed_at: new Date().toISOString(),
      profile_setup_pending: true
    };

    // Guardar datos temporales para completar perfil en primer login.
    await directus.request(createItem('registration_temp_data', tempUserData));

    return NextResponse.json(
      {
        message: '¡Cuenta creada! Te enviamos un correo para verificar tu email antes de iniciar sesión.',
        user: {
          email: body.email,
          first_name: body.first_name,
          last_name: body.last_name,
          needs_setup: true
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration error:', error);

    if (error?.errors && error.errors[0]) {
      const directusError = error.errors[0];
      if (directusError.extensions?.code === 'RECORD_NOT_UNIQUE') {
        return NextResponse.json(
          { error: 'Ya existe una cuenta con este email' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor. Por favor intenta más tarde.' },
      { status: 500 }
    );
  }
}