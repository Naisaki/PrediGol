'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Trophy } from 'lucide-react';

export function DashboardTransitionWrapper({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Escuchar cuando la ruta cambia completamente para apagar el indicador de carga
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Interceptar todos los clics en enlaces internos para encender el indicador de carga al instante
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (
        anchor && 
        anchor.href && 
        anchor.target !== '_blank' && 
        !anchor.hasAttribute('download')
      ) {
        try {
          const targetUrl = new URL(anchor.href);
          const currentUrl = new URL(window.location.href);

          // Solo activar si navega dentro de la misma web y a una ruta o parámetros distintos
          if (
            targetUrl.origin === currentUrl.origin && 
            (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)
          ) {
            setIsNavigating(true);
          }
        } catch (err) {
          // Ignorar URLs inválidas
        }
      }
    };

    window.addEventListener('click', handleAnchorClick);
    return () => window.removeEventListener('click', handleAnchorClick);
  }, []);

  if (isNavigating) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="relative flex items-center justify-center">
          {/* Anillo de carga exterior brillante (Verde fútbol) */}
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          
          {/* Icono central de trofeo que pulsa */}
          <div className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-border/40">
            <Trophy className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground tracking-wide">
            Cargando datos deportivos...
          </p>
          <p className="text-xs text-muted-foreground/60">
            Obteniendo información en tiempo real
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
