import { NextRequest, NextResponse } from 'next/server';

interface ResetPasswordRequest {
  token: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();

    if (!body.token || !body.password) {
      return NextResponse.json({ error: 'token y password son requeridos' }, { status: 400 });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(body.password)) {
      return NextResponse.json(
        {
          error:
            'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números',
        },
        { status: 400 }
      );
    }

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!directusUrl) {
      return NextResponse.json({ error: 'Falta NEXT_PUBLIC_DIRECTUS_URL' }, { status: 500 });
    }

    const directusResponse = await fetch(`${directusUrl}/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: body.token,
        password: body.password,
      }),
    });

    if (!directusResponse.ok) {
      const detail = await directusResponse.text();
      console.error('Directus reset-password error:', directusResponse.status, detail);

      return NextResponse.json(
        { error: 'Token inválido o expirado. Solicita un nuevo correo de recuperación.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
