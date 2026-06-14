'use client';
// =============================================================
// app/(auth)/register/page.tsx
// =============================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { registerAction } from '@/server/actions/auth';

const schema = z.object({
  email: z.string().email('Email inválido'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _'),
  fullName: z.string().min(2, 'Ingresa tu nombre').optional().or(z.literal('')),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const result = await registerAction(
      data.email,
      data.password,
      data.username,
      data.fullName || undefined,
    );

    if (!result.success) {
      toast.error(result.error ?? 'Error al crear cuenta');
      return;
    }

    toast.success('¡Cuenta creada! Bienvenido al Mundial Predictor.');
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <Card className="glass-card border-border/40 shadow-2xl animate-scale-in">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
        <CardDescription>
          Únete a la beta privada del Mundial Predictor
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              className="bg-input border-border/60"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="mi_usuario"
                autoComplete="username"
                className="bg-input border-border/60"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-destructive text-xs">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">
                Nombre{' '}
                <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Tu nombre"
                autoComplete="name"
                className="bg-input border-border/60"
                {...register('fullName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                className="bg-input border-border/60 pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 font-semibold py-5"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta gratis'
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
