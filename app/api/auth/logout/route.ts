import { NextRequest, NextResponse } from 'next/server';
import { directus } from '@/lib/directus';
import { authentication, logout, readMe, createItem } from '@directus/sdk';

export async function POST(request: NextRequest) {
  try {
    // Obtener el token de las cookies
    const cookies = request.headers.get('cookie');
    const tokenMatch = cookies?.match(/directus_token=([^;]*)/);
    const token = tokenMatch?.[1];

    if (token) {
      // Configurar el token para obtener info del usuario antes del logout
      directus.setToken(token);
      
      try {
        // Obtener información del usuario para registrar la actividad
        const userInfo = await directus.request(readMe());
        
        // Registrar la actividad de logout
        await directus.request(
          createItem('learning_activities', {
            user_id: userInfo.id,
            activity_type: 'logout',
            content_id: 'auth',
            content_title: 'Cierre de sesión',
            status: 'completed',
            score: null,
            time_spent_minutes: 0,
            session_data: {
              platform: 'web',
              user_agent: request.headers.get('user-agent') || 'unknown',
              ip_address: request.ip || 'unknown',
              logout_time: new Date().toISOString()
            },
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          })
        );

        // Hacer logout en Directus
        await directus.request(logout());
      } catch (error) {
        console.error('Error during logout process:', error);
        // Continúa con el logout local incluso si hay error en Directus
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