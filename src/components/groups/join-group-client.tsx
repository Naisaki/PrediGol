'use client';
// =============================================================
// components/groups/join-group-client.tsx
// Vista previa del grupo y botón de unirse
// =============================================================

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Users, Loader2, LogIn } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { joinGroupAction } from '@/server/actions/groups';
import type { Group } from '@/types/app.types';

interface JoinGroupClientProps {
  group: Group | null;
  inviteCode: string;
  isAuthenticated: boolean;
}

export function JoinGroupClient({
  group,
  inviteCode,
  isAuthenticated,
}: JoinGroupClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleJoin = () => {
    startTransition(async () => {
      const result = await joinGroupAction(inviteCode);
      if (result.success && result.data?.groupId) {
        toast.success(`¡Te uniste a ${group?.name ?? 'el grupo'}!`);
        router.push(`/groups/${result.data.groupId}`);
      } else {
        toast.error(result.error ?? 'Error al unirse al grupo');
      }
    });
  };

  if (!group) {
    return (
      <Card className="glass-card border-border/40 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-destructive/60" />
          </div>
          <h1 className="text-xl font-bold mb-2">Grupo no encontrado</h1>
          <p className="text-muted-foreground text-sm">
            El código de invitación{' '}
            <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
              {inviteCode}
            </code>{' '}
            no corresponde a ningún grupo activo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/40 max-w-md w-full">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Te invitaron a un grupo</h1>
          <p className="text-muted-foreground text-sm">
            Únete para competir en pronósticos del Mundial
          </p>
        </div>

        {/* Group info */}
        <div className="bg-muted/30 rounded-xl p-4 mb-6">
          <h2 className="font-bold text-lg mb-1">{group.name}</h2>
          {group.description && (
            <p className="text-sm text-muted-foreground">{group.description}</p>
          )}
        </div>

        {isAuthenticated ? (
          <Button
            onClick={handleJoin}
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 font-semibold py-5 text-base"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uniéndote...
              </>
            ) : (
              <>
                <Users className="mr-2 h-5 w-5" />
                Unirme al grupo
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <a
              href={`/login?redirectTo=/join/${inviteCode}`}
              className={buttonVariants({ variant: 'default', size: 'lg', className: 'w-full font-semibold py-5 text-center flex items-center justify-center' })}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Iniciar sesión para unirme
            </a>
            <a
              href={`/register?redirectTo=/join/${inviteCode}`}
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full border-border/60 text-center flex items-center justify-center' })}
            >
              Crear cuenta gratis
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
