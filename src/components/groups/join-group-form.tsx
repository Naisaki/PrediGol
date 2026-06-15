'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Hash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { joinGroupAction } from '@/server/actions/groups';

export function JoinGroupForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      toast.error('Por favor ingresa un código.');
      return;
    }

    if (cleanCode.length < 6) {
      toast.error('El código debe tener al menos 6 caracteres.');
      return;
    }

    startTransition(async () => {
      const result = await joinGroupAction(cleanCode);
      if (result.success && result.data?.groupId) {
        toast.success('¡Te has unido al grupo con éxito!');
        router.push(`/groups/${result.data.groupId}`);
      } else {
        toast.error(result.error ?? 'No se pudo unir al grupo.');
      }
    });
  };

  return (
    <form onSubmit={handleJoin} className="flex gap-3 w-full">
      <div className="relative flex-1">
        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Ingresa un código de invitación..."
          className="pl-9 bg-input border-border/60"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isPending}
        />
      </div>
      <Button
        type="submit"
        variant="outline"
        className="border-border/60 shrink-0 min-w-[100px]"
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unirme'}
      </Button>
    </form>
  );
}
