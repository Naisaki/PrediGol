'use client';
// =============================================================
// components/layout/breadcrumb-nav.tsx
// =============================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  items.push({ label: 'Dashboard', href: '/dashboard' });

  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Mapear segmentos dinámicos o estáticos a etiquetas amigables
    if (segment === 'groups') {
      items.push({ label: 'Mis Grupos', href: '/groups' });
    } else if (segment === 'matches') {
      items.push({ label: 'Partidos', href: '/matches' });
    } else if (segment === 'live') {
      items.push({ label: 'En Vivo', href: '/matches/live' });
    } else if (segment === 'world-cup') {
      // Ignorar el segmento intermedio 'world-cup' para no duplicar niveles
      continue;
    } else if (segment === 'bracket') {
      items.push({ label: 'Llaves', href: '/world-cup/bracket' });
    } else if (segment === 'profile') {
      items.push({ label: 'Mi Perfil', href: '/profile' });
    } else if (segment === 'predictions') {
      items.push({ label: 'Mis Pronósticos' });
    } else if (segment === 'ranking') {
      items.push({ label: 'Ranking' });
    } else if (segment === 'settings') {
      items.push({ label: 'Configuración' });
    } else if (segment === 'general') {
      items.push({ label: 'General' });
    } else if (segment === 'participants') {
      items.push({ label: 'Participantes' });
    } else if (segment === 'invitations') {
      items.push({ label: 'Invitaciones' });
    } else if (segment === 'scoring') {
      items.push({ label: 'Reglas del juego' });
    } else if (segment === 'stats') {
      items.push({ label: 'Estadísticas' });
    } else if (segment === 'transfer') {
      items.push({ label: 'Transferencia' });
    } else if (segment === 'danger') {
      items.push({ label: 'Zona de peligro' });
    } else if (segment === 'create') {
      items.push({ label: 'Nuevo grupo' });
    } else if (segments[i - 1] === 'groups') {
      // Es un ID de grupo, ej: /groups/[id]
      items.push({ label: 'Detalle del grupo', href: `/groups/${segment}` });
    } else {
      // Fallback
      const capitalized = segment.charAt(0).toUpperCase() + segment.slice(1);
      items.push({ label: capitalized });
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-x-2 text-sm mb-5 select-none">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <li className="flex items-center w-4 h-4 text-[var(--text-muted)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="block w-full h-full rtl:rotate-180"
                  >
                    <path d="M9 6l6 6l-6 6"></path>
                  </svg>
                </li>
              )}

              <li className="flex items-center">
                {index === 0 ? (
                  <Link
                    href={item.href || '/dashboard'}
                    className="flex items-center w-4 h-4 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="block w-full h-full"
                    >
                      <path d="M5 12l-2 0l9 -9l9 9l-2 0"></path>
                      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"></path>
                      <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"></path>
                    </svg>
                    <span className="sr-only">Home</span>
                  </Link>
                ) : isLast ? (
                  <div className="flex items-center gap-1.5 text-[var(--text)]">
                    <span aria-current="page" className="text-sm leading-[100%] font-semibold">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
