'use client';
// =============================================================
// components/groups/settings/settings-sidebar.tsx
// Barra lateral de navegación del panel de configuración
// =============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Settings2, Users, Link2, Trophy, BarChart2,
  Crown, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SettingsSidebarProps {
  groupId: string;
}

const sections = [
  { label: 'Información General', href: 'general', icon: Settings2 },
  { label: 'Participantes', href: 'participants', icon: Users },
  { label: 'Invitaciones', href: 'invitations', icon: Link2 },
  { label: 'Reglas del Juego', href: 'scoring', icon: Trophy },
  { label: 'Estadísticas', href: 'stats', icon: BarChart2 },
  { label: 'Transferir Propiedad', href: 'transfer', icon: Crown },
  { label: 'Zona de Peligro', href: 'danger', icon: AlertTriangle, danger: true },
];

export function SettingsSidebar({ groupId }: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {sections.map(({ label, href, icon: Icon, danger }) => {
        const fullHref = `/groups/${groupId}/settings/${href}`;
        const isActive = pathname === fullHref;
        return (
          <Link
            key={href}
            href={fullHref}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive
                ? danger
                  ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                  : 'bg-primary/15 text-primary border border-primary/20'
                : danger
                  ? 'text-muted-foreground hover:text-red-400 hover:bg-red-500/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
