'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('El enlace no contiene un token válido. Solicita un nuevo correo de recuperación.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Completa ambos campos de contraseña.');
      return;
    }

    if (password !== confirmPassword) {
      setError('La contraseña y la confirmación no coinciden.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'No se pudo restablecer la contraseña.');
        return;
      }

      setSuccess(data.message || 'Contraseña actualizada correctamente.');
      setPassword('');
      setConfirmPassword('');
    } catch {
      setError('Error de conexión. Por favor intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-slate-800">Nueva contraseña</CardTitle>
          <CardDescription className="text-center text-slate-600">
            Ingresa tu nueva contraseña para completar la recuperación.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Nueva contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Confirmar contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Restablecer contraseña'
              )}
            </Button>

            <p className="text-sm text-slate-600 text-center">
              Volver a{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                iniciar sesión
              </Link>
            </p>

            <Button type="button" variant="ghost" onClick={handleGoBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la página anterior
            </Button>

            <p className="text-xs text-slate-500 text-center border-t border-slate-200 pt-2">
              Al continuar, aceptas nuestros{' '}
              <Link href="/terminos" className="text-blue-600 hover:underline">
                términos y condiciones
              </Link>{' '}
              y la{' '}
              <Link href="/privacidad" className="text-blue-600 hover:underline">
                política de privacidad
              </Link>
              .
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
