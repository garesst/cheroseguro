import { NextRequest, NextResponse } from 'next/server';

interface ForgotPasswordRequest {
  email: string;
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
    const body: ForgotPasswordRequest = await request.json();

    if (!body.email) {
      return NextResponse.json({ error: 'El email es requerido' }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 });
    }

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!directusUrl) {
      return NextResponse.json({ error: 'Falta NEXT_PUBLIC_DIRECTUS_URL' }, { status: 500 });
    }

    const appBaseUrl = getAppBaseUrl();
    if (!appBaseUrl) {
      return NextResponse.json(
        { error: 'Falta APP_URL o NEXT_PUBLIC_APP_URL con la URL pública del frontend' },
        { status: 500 }
      );
    }

    const resetUrl = `${appBaseUrl}/reset-password`;

    const directusResponse = await fetch(`${directusUrl}/auth/password/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        reset_url: resetUrl,
      }),
    });

    if (!directusResponse.ok) {
      const detail = await directusResponse.text();
      console.error('Directus forgot-password error:', directusResponse.status, detail);
      return NextResponse.json(
        { error: 'No se pudo procesar la recuperación en este momento' },
        { status: 502 }
      );
    }

    // Respuesta genérica para evitar enumeración de cuentas.
    return NextResponse.json(
      {
        success: true,
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
