'use client';
// =============================================================
// app/(dashboard)/profile/page.tsx
// Gestión del perfil del usuario
// =============================================================

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Loader2, Save, Mail, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { updateProfileAction } from '@/server/actions/auth';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setEmail(user.email ?? '');

        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setUsername(profile.username);
          setFullName(profile.full_name ?? '');
          setAvatarUrl(profile.avatar_url ?? '');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        toast.error('Error al cargar el perfil');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router, supabase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('El username es obligatorio');
      return;
    }

    if (username.length < 3) {
      toast.error('El username debe tener al menos 3 caracteres');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('El username solo puede contener letras, números y guiones bajos');
      return;
    }

    startTransition(async () => {
      const result = await updateProfileAction(username, fullName || undefined, avatarUrl || undefined);
      if (result.success) {
        toast.success('¡Perfil actualizado exitosamente!');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Error al actualizar el perfil');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Mi Perfil
        </h1>
        <p className="text-muted-foreground text-sm">
          Actualiza tu información personal y de cuenta
        </p>
      </div>

      {/* Profile Card */}
      <Card className="glass-card border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Editar Perfil</CardTitle>
          <CardDescription className="text-xs">
            Modifica tu nombre de usuario y datos personales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-email" className="text-sm font-medium text-muted-foreground">
                Correo Electrónico (No modificable)
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="pl-9 bg-muted/30 border-border/40 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-username" className="text-sm font-medium">
                Nombre de Usuario (Username) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isPending}
                  placeholder="ej. futbol_fan"
                  className="pl-9 bg-input border-border/60"
                  maxLength={20}
                  required
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Mínimo 3 caracteres. Solo letras, números y guiones bajos (_).
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-fullname" className="text-sm font-medium">
                Nombre Completo
              </Label>
              <Input
                id="profile-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isPending}
                placeholder="ej. Juan Pérez"
                className="bg-input border-border/60"
                maxLength={50}
              />
            </div>

            {/* Avatar URL */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-avatar" className="text-sm font-medium">
                URL de Avatar / Imagen
              </Label>
              <Input
                id="profile-avatar"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                disabled={isPending}
                placeholder="ej. https://ejemplo.com/avatar.jpg"
                className="bg-input border-border/60"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 font-semibold"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando cambios...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
