// =============================================================
// components/common/api-delay-notice.tsx
// Aviso discreto sobre posible retraso de la API gratuita
// =============================================================

import { Clock } from 'lucide-react';

interface ApiDelayNoticeProps {
  className?: string;
}

export function ApiDelayNotice({ className }: ApiDelayNoticeProps) {
  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/30 text-xs text-muted-foreground ${className ?? ''}`}
    >
      <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground/60" />
      <span>
        Los resultados pueden actualizarse con algunos minutos de retraso según
        la disponibilidad de football-data.org.
      </span>
    </div>
  );
}
