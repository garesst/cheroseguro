import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://strapi.cheroseguro.com';

interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie');
    const tokenMatch = cookies?.match(/directus_token=([^;]*)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: ChangePasswordRequest = await request.json();

    if (!body.current_password || !body.new_password) {
      return NextResponse.json({ error: 'current_password y new_password son requeridos' }, { status: 400 });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(body.new_password)) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números' },
        { status: 400 }
      );
    }

    const authHeaders = { Authorization: `Bearer ${token}` };

    const meResponse = await axios.get(`${DIRECTUS_URL}/users/me`, {
      headers: authHeaders,
      params: { fields: 'email' },
    });
    const userInfo = meResponse.data.data ?? meResponse.data;
    const email = String(userInfo.email || '').toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'No se pudo validar el usuario actual' }, { status: 400 });
    }

    try {
      await axios.post(`${DIRECTUS_URL}/auth/login`, {
        email,
        password: body.current_password,
      });
    } catch {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 401 });
    }

    await axios.patch(
      `${DIRECTUS_URL}/users/me`,
      { password: body.new_password },
      { headers: authHeaders }
    );

    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Change password error:', error?.response?.data || error?.message);

    if (error?.response?.status === 401) {
      return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
