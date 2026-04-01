import { NextRequest, NextResponse } from 'next/server';

interface VerifyEmailRequest {
  token: string;
}

type VerifyAttempt = {
  url: string;
  method: 'GET' | 'POST';
  body?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: VerifyEmailRequest = await request.json();

    if (!body.token) {
      return NextResponse.json({ error: 'token es requerido' }, { status: 400 });
    }

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!directusUrl) {
      return NextResponse.json({ error: 'Falta NEXT_PUBLIC_DIRECTUS_URL' }, { status: 500 });
    }

    const encodedToken = encodeURIComponent(body.token);
    const attempts: VerifyAttempt[] = [
      {
        // Directus route documented in newer docs
        url: `${directusUrl}/users/register/verify-email/${encodedToken}`,
        method: 'GET',
      },
      {
        // Some setups expose token as query param
        url: `${directusUrl}/users/register/verify-email?token=${encodedToken}`,
        method: 'GET',
      },
      {
        // Some versions/extensions expect POST with JSON body
        url: `${directusUrl}/users/register/verify-email`,
        method: 'POST',
        body: JSON.stringify({ token: body.token }),
      },
    ];

    let verifyResponse: Response | null = null;
    let lastErrorDetail = '';

    for (const attempt of attempts) {
      const response = await fetch(attempt.url, {
        method: attempt.method,
        headers: attempt.method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: attempt.body,
      });

      if (response.ok) {
        verifyResponse = response;
        break;
      }

      lastErrorDetail = await response.text();

      // If endpoint doesn't exist, try the next known variant.
      if (response.status === 404) {
        continue;
      }

      // For non-404 errors, stop and return meaningful response.
      console.error('Directus verify-email error:', response.status, lastErrorDetail);
      return NextResponse.json(
        { error: 'Token inválido o expirado. Solicita un nuevo correo de verificación.' },
        { status: 400 }
      );
    }

    if (!verifyResponse) {
      console.error('Directus verify-email route not found in all attempts:', lastErrorDetail);
      return NextResponse.json(
        { error: 'No se encontró una ruta de verificación compatible en Directus.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Correo verificado correctamente. Ya puedes iniciar sesión.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
