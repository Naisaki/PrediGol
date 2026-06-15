// =============================================================
// components/groups/settings/settings-section.tsx
// Wrapper reutilizable para secciones del panel de configuración
// =============================================================

import { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
  return (
    <div className={className}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <Separator className="mb-6 bg-border/40" />
      {children}
    </div>
  );
}
