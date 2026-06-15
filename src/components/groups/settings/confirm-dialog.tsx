'use client';
// =============================================================
// components/groups/settings/confirm-dialog.tsx
// AlertDialog reutilizable con confirmación opcional por texto
// Compatible con @base-ui/react/alert-dialog
// =============================================================

import { useState, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Si se pasa, el usuario debe escribir este texto exacto para habilitar el botón de confirmación */
  requiresTyping?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  requiresTyping,
  variant = 'default',
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState('');
  const [open, setOpen] = useState(false);

  const canConfirm = !requiresTyping || typedValue === requiresTyping;

  const handleConfirm = async () => {
    if (!canConfirm || isPending) return;
    await onConfirm();
    setOpen(false);
    setTypedValue('');
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) setTypedValue('');
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger render={<span className="contents" />}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="glass-card border-border/40">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-3">
              <div>{description}</div>
              {requiresTyping && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-muted-foreground">
                    Escribe{' '}
                    <span className="font-mono font-bold text-foreground">
                      {requiresTyping}
                    </span>{' '}
                    para confirmar:
                  </p>
                  <Input
                    value={typedValue}
                    onChange={(e) => setTypedValue(e.target.value)}
                    placeholder={requiresTyping}
                    className="bg-background/40 border-border/40 font-mono text-sm"
                    autoComplete="off"
                  />
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm || isPending}
            className={cn(
              'transition-all',
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-900/40 disabled:text-red-300'
                : '',
              !canConfirm && 'cursor-not-allowed',
            )}
          >
            {isPending ? 'Procesando...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
