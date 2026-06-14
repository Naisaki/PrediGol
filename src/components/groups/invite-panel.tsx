'use client';
// =============================================================
// components/groups/invite-panel.tsx
// Panel de invitación con código, enlace y QR descargable
// =============================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { regenerateInviteCodeAction } from '@/server/actions/groups';

interface InvitePanelProps {
  groupId: string;
  inviteCode: string;
  inviteUrl: string;
  qrCodeUrl: string | null;
  isAdminOrOwner: boolean;
}

export function InvitePanel({
  groupId,
  inviteCode,
  inviteUrl,
  qrCodeUrl,
  isAdminOrOwner,
}: InvitePanelProps) {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      toast.success('¡Código copiado al portapapeles!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error('No se pudo copiar el código');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      toast.success('¡Enlace de invitación copiado!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    try {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `invitacion-grupo-${inviteCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Código QR descargado');
    } catch {
      toast.error('Error al descargar el código QR');
    }
  };

  const handleRegenerate = () => {
    if (!confirm('¿Estás seguro de que deseas cambiar el código de invitación? El enlace actual dejará de funcionar.')) {
      return;
    }

    startTransition(async () => {
      const result = await regenerateInviteCodeAction(groupId);
      if (result.success) {
        toast.success('¡Código de invitación regenerado exitosamente!');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Error al regenerar código');
      }
    });
  };

  return (
    <Card className="glass-card border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Invitar Amigos</CardTitle>
        <CardDescription className="text-xs">
          Comparte el código, enlace o código QR para que otros se unan a tu grupo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code Display */}
        <div className="bg-muted/30 border border-border/40 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
          <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Código de grupo
          </div>
          <div className="text-3xl font-bold tracking-widest font-mono text-primary">
            {inviteCode}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyCode}
            className="text-xs text-muted-foreground hover:text-foreground h-8"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copiar código
              </>
            )}
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex-1 border-border/60 hover:bg-muted/40 text-xs"
          >
            {copiedLink ? (
              <Check className="h-3.5 w-3.5 mr-1.5 text-primary" />
            ) : (
              <Copy className="h-3.5 w-3.5 mr-1.5" />
            )}
            Copiar enlace
          </Button>

          {qrCodeUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadQR}
              className="flex-1 border-border/60 hover:bg-muted/40 text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Descargar QR
            </Button>
          )}
        </div>

        {/* QR Code image centered */}
        {qrCodeUrl && (
          <div className="flex flex-col items-center justify-center p-4 bg-[#12121a] rounded-xl border border-border/20">
            {/* Displaying on a dark surface to see the white QR code */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="Código QR de invitación"
              className="w-44 h-44 object-contain"
            />
            <span className="text-[10px] text-muted-foreground mt-2">
              Escanea para unirte directamente
            </span>
          </div>
        )}

        {/* Owner Regenerate Action */}
        {isAdminOrOwner && (
          <div className="pt-2 border-t border-border/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              disabled={isPending}
              className="w-full text-xs text-destructive/80 hover:text-destructive hover:bg-destructive/10"
            >
              {isPending ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              )}
              Regenerar código de invitación
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
