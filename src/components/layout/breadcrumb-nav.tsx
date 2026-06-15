'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function BreadcrumbNav() {
  const pathname = usePathname();

  // No renderizar en el dashboard/inicio para evitar redundancia
  if (pathname === '/dashboard') {
    return null;
  }

  // Segmentar la ruta
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Agregar siempre el botón de inicio/dashboard al inicio si procede
  items.push({ label: 'INICIO', href: '/dashboard' });

  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Mapear segmentos dinámicos o estáticos a etiquetas amigables
    if (segment === 'groups') {
      items.push({ label: 'MIS GRUPOS', href: '/groups' });
    } else if (segment === 'matches') {
      items.push({ label: 'PARTIDOS', href: '/matches' });
    } else if (segment === 'live') {
      items.push({ label: 'EN VIVO', href: '/matches/live' });
    } else if (segment === 'world-cup') {
      // Ignorar el segmento intermedio 'world-cup' para no duplicar niveles
      continue;
    } else if (segment === 'bracket') {
      items.push({ label: 'LLAVES', href: '/world-cup/bracket' });
    } else if (segment === 'profile') {
      items.push({ label: 'MI PERFIL', href: '/profile' });
    } else if (segment === 'predictions') {
      items.push({ label: 'MIS PRONÓSTICOS' });
    } else if (segment === 'ranking') {
      items.push({ label: 'RANKING' });
    } else if (segment === 'settings') {
      items.push({ label: 'CONFIGURACIÓN' });
    } else if (segment === 'general') {
      items.push({ label: 'GENERAL' });
    } else if (segment === 'participants') {
      items.push({ label: 'PARTICIPANTES' });
    } else if (segment === 'invitations') {
      items.push({ label: 'INVITACIONES' });
    } else if (segment === 'scoring') {
      items.push({ label: 'REGLAS DEL JUEGO' });
    } else if (segment === 'stats') {
      items.push({ label: 'ESTADÍSTICAS' });
    } else if (segment === 'transfer') {
      items.push({ label: 'TRANSFERENCIA' });
    } else if (segment === 'danger') {
      items.push({ label: 'ZONA DE PELIGRO' });
    } else if (segment === 'create') {
      items.push({ label: 'NUEVO GRUPO' });
    } else if (segments[i - 1] === 'groups') {
      // Es un ID de grupo, ej: /groups/[id]
      items.push({ label: 'DETALLE DEL GRUPO', href: `/groups/${segment}` });
    } else {
      // Fallback
      items.push({ label: segment.toUpperCase() });
    }
  }

  // Si no hay items suficientes más allá del dashboard, no renderizar
  if (items.length <= 1) {
    return null;
  }

  // Determinar link de retorno (el penúltimo elemento)
  const backItem = items[items.length - 2];

  return (
    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground mb-4 select-none">
      {backItem?.href && (
        <Link
          href={backItem.href}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors group mr-1 text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>VOLVER</span>
        </Link>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-border/60 mx-1">/</span>}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-foreground text-muted-foreground/85 transition-colors uppercase font-bold"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground/90 uppercase font-bold">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
