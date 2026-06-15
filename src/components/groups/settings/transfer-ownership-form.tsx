'use client';
// =============================================================
// components/groups/settings/transfer-ownership-form.tsx
// Formulario de transferencia de propiedad con confirmación por texto
// =============================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Crown, Loader2, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from './confirm-dialog';
import { transferOwnershipAction } from '@/server/actions/groups';
import type { GroupMember } from '@/types/app.types';

interface TransferOwnershipFormProps {
  groupId: string;
  candidates: GroupMember[];
}

export function TransferOwnershipForm({ groupId, candidates }: TransferOwnershipFormProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const selectedMember = candidates.find((c) => c.userId === selectedUserId);

  const handleTransfer = () => {
    if (!selectedUserId) return;
    startTransition(async () => {
      const result = await transferOwnershipAction(groupId, selectedUserId);
      if (result.success) {
        toast.success('Propiedad transferida exitosamente.');
        router.push(`/groups/${groupId}`);
      } else {
        toast.error(result.error ?? 'Error al transferir propiedad.');
      }
    });
  };

  if (candidates.length === 0) {
    return (
      <Card className="glass-card border-border/40 max-w-lg">
        <CardContent className="p-6 text-center space-y-2">
          <Crown className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No hay candidatos disponibles</p>
          <p className="text-xs text-muted-foreground">
            Necesitas al menos otro miembro en el grupo para transferir la propiedad.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Advertencia */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 flex gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/80 space-y-1">
            <p className="font-semibold text-amber-300">Acción irreversible</p>
            <p>Al transferir la propiedad perderás el rol de owner y pasarás a ser administrador. El nuevo owner tendrá control total del grupo.</p>
          </div>
        </CardContent>
      </Card>

      {/* Selector de nuevo owner */}
      <div className="space-y-2">
        <Label>Nuevo owner del grupo</Label>
        <Select value={selectedUserId} onValueChange={(val) => { if (val !== null) setSelectedUserId(val); }}>
          <SelectTrigger className="bg-background/40 border-border/40 h-11">
            <SelectValue placeholder="Selecciona un miembro..." />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((c) => (
              <SelectItem key={c.userId} value={c.userId}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={c.profile?.avatarUrl ?? ''} />
                    <AvatarFallback className="text-xs">{c.profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{c.profile?.username ?? c.userId}</span>
                  {c.role === 'admin' && <span className="text-xs text-blue-400">(Admin)</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Preview del miembro seleccionado */}
      {selectedMember && (
        <Card className="glass-card border-border/40">
          <CardContent className="p-4 flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border/40">
              <AvatarImage src={selectedMember.profile?.avatarUrl ?? ''} />
              <AvatarFallback className="bg-muted/30">
                {selectedMember.profile?.username?.[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{selectedMember.profile?.username}</p>
              <p className="text-xs text-muted-foreground">{selectedMember.profile?.fullName ?? 'Miembro del grupo'}</p>
            </div>
            <Crown className="h-5 w-5 text-yellow-400 ml-auto" />
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        trigger={
          <Button
            disabled={!selectedUserId || isPending}
            variant="destructive"
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
            Transferir propiedad
          </Button>
        }
        title="¿Confirmas la transferencia?"
        description={
          <>
            Estás a punto de transferir la propiedad a{' '}
            <strong>{selectedMember?.profile?.username ?? 'este miembro'}</strong>.
            Pasarás a ser administrador del grupo.
          </>
        }
        requiresTyping="TRANSFERIR"
        confirmLabel="Sí, transferir"
        variant="destructive"
        onConfirm={handleTransfer}
        isPending={isPending}
      />
    </div>
  );
}
