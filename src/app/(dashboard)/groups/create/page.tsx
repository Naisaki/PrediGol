'use client';
// =============================================================
// app/(dashboard)/groups/create/page.tsx
// Creación de un nuevo grupo privado de pronósticos
// =============================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Users, Loader2, Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createGroupAction } from '@/server/actions/groups';

export default function CreateGroupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre del grupo es obligatorio');
      return;
    }

    startTransition(async () => {
      const result = await createGroupAction(name, description);
      if (result.success && result.data?.groupId) {
        toast.success('¡Grupo creado exitosamente!');
        router.push(`/groups/${result.data.groupId}`);
      } else {
        toast.error(result.error ?? 'Error al crear el grupo');
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Mis Grupos
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-accent" />
          Crear Nuevo Grupo
        </h1>
        <p className="text-muted-foreground text-sm">
          Crea un grupo privado para competir con tus amigos y familiares
        </p>
      </div>

      {/* Form Card */}
      <Card className="glass-card border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Detalles del Grupo</CardTitle>
          <CardDescription className="text-xs">
            Ingresa un nombre y descripción para tu grupo de pronósticos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="group-name" className="text-sm font-medium">
                Nombre del Grupo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="group-name"
                placeholder="Ej. Los Reyes del Pronóstico, Oficina Qatar 2026..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                className="bg-input border-border/60"
                maxLength={50}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="group-description" className="text-sm font-medium">
                Descripción (Opcional)
              </Label>
              <Textarea
                id="group-description"
                placeholder="Describe las reglas, premios o el propósito del grupo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                className="bg-input border-border/60 min-h-[100px] resize-none"
                maxLength={200}
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Link
                href="/groups"
                className={buttonVariants({ variant: 'outline', className: 'flex-1 border-border/60' })}
              >
                Cancelar
              </Link>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-primary hover:bg-primary/90 font-semibold"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando grupo...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Crear Grupo
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
