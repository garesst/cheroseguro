import { NextRequest, NextResponse } from 'next/server';
import { directus } from '@/lib/directus';
import { readUsers, registerUser, createItem } from '@directus/sdk';

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

    // Validación de contraseña (mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(body.password)) {
      return NextResponse.json(
        { 
          error: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números' 
        },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe - DESHABILITADO TEMPORALMENTE
    /*
    try {
      const existingUsers = await directus.request(
        readUsers({
          filter: {
            email: { _eq: body.email }
          }
        })
      );

      if (existingUsers.length > 0) {
        return NextResponse.json(
          { error: 'Ya existe una cuenta con este email' },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error('Error checking existing user:', error);
    }
    */

    // Crear el usuario en Directus usando registerUser
    const registrationResult = await directus.request(
      registerUser(body.email, body.password)
    );

    // Crear un registro temporal con los datos adicionales para el primer login
    // Esto se procesará cuando el usuario se autentique por primera vez
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

    // Guradamos los datos temporales en una collection que el usuario público puede escribir
    // Estos datos se usarán en el primer login para completar el perfil
    await directus.request(
      createItem('registration_temp_data', tempUserData)
    );

    // NOTA: El perfil completo del usuario se creará en el primer login
    // cuando el usuario tenga los permisos adecuados

    return NextResponse.json(
      {
        success: true,
        message: '¡Cuenta creada exitosamente! Por favor inicia sesión para completar tu perfil.',
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
    
    // Manejo de errores específicos de Directus
    if (error.errors && error.errors[0]) {
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