'use client';
// =============================================================
// components/groups/settings/danger-zone-actions.tsx
// Acciones destructivas de la zona de peligro
// =============================================================

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PowerOff, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from './confirm-dialog';
import { closeGroupAction, deleteGroupAction } from '@/server/actions/groups';

interface DangerZoneActionsProps {
  groupId: string;
  groupName: string;
  isActive: boolean;
}

export function DangerZoneActions({ groupId, groupName, isActive }: DangerZoneActionsProps) {
  const [isClosing, startCloseTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  const handleClose = () => {
    startCloseTransition(async () => {
      const result = await closeGroupAction(groupId);
      if (result.success) {
        toast.success('El grupo ha sido cerrado. Los datos se conservan.');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Error al cerrar grupo.');
      }
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteGroupAction(groupId);
      if (result.success) {
        toast.success('Grupo eliminado permanentemente.');
        router.push('/groups');
      } else {
        toast.error(result.error ?? 'Error al eliminar grupo.');
      }
    });
  };

  return (
    <div className="space-y-4 max-w-lg">
      {/* Cerrar grupo */}
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <PowerOff className="h-4 w-4 text-orange-400" />
                {isActive ? 'Cerrar grupo' : 'El grupo ya está cerrado'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isActive
                  ? 'Ningún nuevo miembro podrá unirse ni registrar pronósticos. Los datos históricos se conservan. Esta acción puede revertirse contactando soporte.'
                  : 'Este grupo está actualmente inactivo. Ningún miembro puede registrar pronósticos.'}
              </p>
            </div>
            {isActive && (
              <ConfirmDialog
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 flex-shrink-0"
                    disabled={isClosing}
                  >
                    {isClosing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PowerOff className="h-3.5 w-3.5" />}
                    <span className="ml-1.5">Cerrar</span>
                  </Button>
                }
                title="¿Cerrar el grupo?"
                description="El grupo quedará inactivo. Los miembros no podrán hacer nuevos pronósticos ni unirse otros. Los datos existentes se conservan."
                confirmLabel="Cerrar grupo"
                variant="destructive"
                onConfirm={handleClose}
                isPending={isClosing}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-border/30" />

      {/* Eliminar grupo */}
      <Card className="border-red-600/40 bg-red-950/20">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-400" />
                Eliminar grupo permanentemente
              </h3>
              <p className="text-xs text-muted-foreground">
                Elimina el grupo, todos los miembros y todos los pronósticos de forma permanente. Esta acción <strong className="text-red-400">no se puede deshacer</strong>.
              </p>
            </div>
            <ConfirmDialog
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600/40 text-red-400 hover:bg-red-600/10 hover:text-red-300 flex-shrink-0"
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  <span className="ml-1.5">Eliminar</span>
                </Button>
              }
              title="Eliminar grupo"
              description={
                <>
                  Esta acción es permanente e irreversible. Se eliminarán todos los pronósticos y miembros del grupo{' '}
                  <strong>{groupName}</strong>.
                </>
              }
              requiresTyping={groupName}
              confirmLabel="Eliminar grupo"
              variant="destructive"
              onConfirm={handleDelete}
              isPending={isDeleting}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
