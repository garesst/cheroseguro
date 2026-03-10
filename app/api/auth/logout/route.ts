import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://strapi.cheroseguro.com';

export async function POST(request: NextRequest) {
  try {
    // Obtener el token de las cookies
    const cookies = request.headers.get('cookie');
    const tokenMatch = cookies?.match(/directus_token=([^;]*)/);
    const token = tokenMatch?.[1];

    if (token) {
      try {
        // Validar token contra Directus para evitar intentos con tokens inválidos.
        await axios.get(`${DIRECTUS_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { fields: 'id' },
        });
      } catch (error) {
        console.error('Error during logout process:', error);
        // Continúa con el logout local incluso si hay error en Directus.
      }
    }

    // Crear respuesta de logout exitoso
    const response = NextResponse.json(
      {
        success: true,
        message: 'Sesión cerrada exitosamente'
      },
      { status: 200 }
    );

    // Eliminar la cookie del token
    response.headers.set(
      'Set-Cookie', 
      'directus_token=; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=0'
    );

    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    
    // Incluso si hay error, eliminar la cookie local
    const response = NextResponse.json(
      {
        success: true,
        message: 'Sesión cerrada exitosamente'
      },
      { status: 200 }
    );

    response.headers.set(
      'Set-Cookie', 
      'directus_token=; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=0'
    );

    return response;
  }
}