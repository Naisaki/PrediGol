'use client';
// =============================================================
// components/groups/settings/invitations-form.tsx
// Formulario de configuración de invitaciones
// =============================================================

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Copy, Save, Loader2, Users, Lock, Unlock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from './confirm-dialog';
import { updateGroupSettingsAction, regenerateInviteCodeAction } from '@/server/actions/groups';

interface InvitationsFormProps {
  groupId: string;
  initialData: {
    inviteCode: string;
    joinsOpen: boolean;
    joinApproval: boolean;
    maxMembers: number | null;
    welcomeMessage: string;
  };
}

export function InvitationsForm({ groupId, initialData }: InvitationsFormProps) {
  const [joinsOpen, setJoinsOpen] = useState(initialData.joinsOpen);
  const [joinApproval, setJoinApproval] = useState(initialData.joinApproval);
  const [maxMembers, setMaxMembers] = useState(initialData.maxMembers?.toString() ?? 'unlimited');
  const [welcomeMessage, setWelcomeMessage] = useState(initialData.welcomeMessage);
  const [inviteCode, setInviteCode] = useState(initialData.inviteCode);
  const [isSaving, startSaveTransition] = useTransition();
  const [isRegenerating, startRegenTransition] = useTransition();

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success('Código copiado al portapapeles.');
  };

  const handleRegenerate = () => {
    startRegenTransition(async () => {
      const result = await regenerateInviteCodeAction(groupId);
      if (result.success && result.data?.inviteCode) {
        setInviteCode(result.data.inviteCode);
        toast.success('Código de invitación regenerado.');
      } else {
        toast.error(result.error ?? 'Error al regenerar código.');
      }
    });
  };

  const handleSave = () => {
    startSaveTransition(async () => {
      const result = await updateGroupSettingsAction(groupId, {
        joinsOpen,
        joinApproval,
        maxMembers: maxMembers === 'unlimited' ? null : parseInt(maxMembers, 10),
        welcomeMessage: welcomeMessage.trim() || null,
      });
      if (result.success) {
        toast.success('Configuración guardada.');
      } else {
        toast.error(result.error ?? 'Error al guardar.');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* Código de invitación */}
      <div className="space-y-2">
        <Label>Código de invitación</Label>
        <div className="flex gap-2">
          <Input
            readOnly
            value={inviteCode}
            className="bg-background/40 border-border/40 font-mono text-sm"
          />
          <Button size="icon" variant="outline" onClick={handleCopy} className="border-border/40">
            <Copy className="h-4 w-4" />
          </Button>
          <ConfirmDialog
            trigger={
              <Button size="icon" variant="outline" className="border-border/40" disabled={isRegenerating}>
                {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            }
            title="Regenerar código de invitación"
            description="El código actual dejará de funcionar. Los miembros existentes no se verán afectados."
            confirmLabel="Regenerar"
            variant="destructive"
            onConfirm={handleRegenerate}
          />
        </div>
        <p className="text-xs text-muted-foreground">Comparte este código para que nuevos jugadores se unan.</p>
      </div>

      <Separator className="bg-border/30" />

      {/* Controles de acceso */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {joinsOpen ? <Unlock className="h-4 w-4 text-green-400" /> : <Lock className="h-4 w-4 text-red-400" />}
            <div>
              <Label className="font-medium">Aceptar nuevos miembros</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {joinsOpen ? 'El grupo está abierto para nuevas uniones.' : 'El grupo no acepta nuevos miembros.'}
              </p>
            </div>
          </div>
          <Switch checked={joinsOpen} onCheckedChange={setJoinsOpen} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="font-medium">Límite de participantes</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Máximo de miembros permitidos en el grupo.</p>
            </div>
          </div>
          <Select value={maxMembers} onValueChange={(val) => { if (val !== null) setMaxMembers(val); }}>
            <SelectTrigger className="w-32 bg-background/40 border-border/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unlimited">Ilimitado</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Mensaje de bienvenida */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <Label>Mensaje de bienvenida <span className="text-muted-foreground">(opcional)</span></Label>
        </div>
        <Textarea
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          placeholder="¡Bienvenido al grupo! Recuerda registrar tus pronósticos antes del partido 🎯"
          maxLength={300}
          rows={3}
          className="bg-background/40 border-border/40 resize-none text-sm"
        />
        <p className="text-xs text-muted-foreground">{welcomeMessage.length}/300 · Se mostrará cuando alguien se una al grupo.</p>
      </div>

      <Card className="bg-muted/10 border-border/30">
        <CardContent className="p-3 text-xs text-muted-foreground">
          💡 Los miembros actuales no son afectados al cambiar estos ajustes.
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
        {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4" /> Guardar configuración</>}
      </Button>
    </div>
  );
}
