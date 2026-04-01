'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
  remember_me: boolean;
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth(); // 🔥 Usar AuthContext
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    remember_me: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validación de email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    // Validación de contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError('');

    try {
      // 🔥 Usar AuthContext.login() en lugar de fetch manual
      const result = await login(
        formData.email,
        formData.password,
        formData.remember_me
      );

      if (result.success) {
        // ✅ El estado global ya se actualizó automáticamente
        // Redirigir al perfil o página anterior
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        router.push(returnUrl || '/profile');
      } else {
        setSubmitError(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      setSubmitError('Error de conexión. Por favor intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo al modificarlo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Limpiar error de submit
    if (submitError) {
      setSubmitError('');
    }
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
          <CardTitle className="text-2xl font-bold text-center text-slate-800">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-center text-slate-600">
            Accede a tu panel de entrenamiento en ciberseguridad
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {submitError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {submitError}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`${errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
                placeholder="tu.email@empresa.com"
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Contraseña
                </Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-blue-600 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pr-10 ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
                  placeholder="Tu contraseña"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember_me"
                checked={formData.remember_me}
                onCheckedChange={(checked) => handleInputChange('remember_me', checked)}
                disabled={isLoading}
              />
              <Label
                htmlFor="remember_me"
                className="text-sm text-slate-600 cursor-pointer"
              >
                Mantener sesión activa
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                ¿No tienes cuenta?{' '}
                <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            </div>

            <div className="text-center pt-2 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Al iniciar sesión, aceptas nuestros{' '}
                <Link href="/terminos" className="text-blue-600 hover:underline">
                  términos de servicio
                </Link>{' '}
                y la{' '}
                <Link href="/privacidad" className="text-blue-600 hover:underline">
                  política de privacidad
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}