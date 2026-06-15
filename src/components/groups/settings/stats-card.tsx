// =============================================================
// components/groups/settings/stats-card.tsx
// Tarjeta de métrica premium para la sección de estadísticas
// =============================================================

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  colorClass?: string;
}

export function StatsCard({ icon, label, value, sub, colorClass = 'text-primary' }: StatsCardProps) {
  return (
    <Card className="glass-card border-border/40">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn('p-2 rounded-lg bg-current/10 border border-current/20', colorClass)}>
            <div className={colorClass}>{icon}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className={cn('text-3xl font-black', colorClass)}>{value}</div>
          <p className="text-sm font-medium mt-1">{label}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
