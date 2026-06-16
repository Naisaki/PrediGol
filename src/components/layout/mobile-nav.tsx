'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Globe, 
  Menu, 
  X, 
  Tv, 
  Radio, 
  GitBranch, 
  User, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { logoutAction } from '@/server/actions/auth';

const primaryNavItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/groups', label: 'Grupos', icon: Users },
  { href: '/matches', label: 'Partidos', icon: Calendar },
  { href: '/world-cup/groups', label: 'Mundial', icon: Globe },
];

const secondaryNavItems = [
  { href: '/matches/live', label: 'Partidos En Vivo', icon: Radio, desc: 'Marcadores y señales en directo' },
  { href: '/matches/streams', label: 'Canales de TV', icon: Tv, desc: 'Explorar señales deportivas' },
  { href: '/world-cup/bracket', label: 'Llaves / Eliminatorias', icon: GitBranch, desc: 'Fase final y eliminaciones' },
  { href: '/profile', label: 'Mi Perfil', icon: User, desc: 'Configurar cuenta' },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar el menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Evitar scroll en el fondo cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isSecondaryActive = secondaryNavItems.some(item => pathname.startsWith(item.href));

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5 mobile-nav-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href) && !isSecondaryActive);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-0 relative',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <item.icon
                  className={cn('h-5 w-5 transition-all', isActive && 'scale-110')}
                />
                <span className="text-[10px] font-medium truncate">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* Botón de Menú "Más" */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-0 relative',
              isOpen || isSecondaryActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Menu
              className={cn('h-5 w-5 transition-all', (isOpen || isSecondaryActive) && 'scale-110')}
            />
            <span className="text-[10px] font-medium truncate">Más</span>
            {isSecondaryActive && !isOpen && (
              <div className="absolute bottom-0 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </nav>

      {/* Menú Desplegable (Bottom Sheet) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-slate-950 border-t border-border/40 rounded-t-2xl p-6 shadow-2xl animate-slide-up pb-10 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-border/20 pb-4">
              <div>
                <h3 className="font-bold text-base text-foreground">Más Opciones</h3>
                <p className="text-xs text-muted-foreground">Explora todas las secciones de la app</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-900 border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Grid de opciones */}
            <div className="grid grid-cols-1 gap-3">
              {secondaryNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all",
                      isActive 
                        ? "bg-primary/10 border-primary/30 text-primary" 
                        : "bg-slate-900/60 border-border/20 text-muted-foreground hover:text-foreground hover:bg-slate-900"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      isActive ? "bg-primary/20 text-primary" : "bg-slate-800 text-muted-foreground"
                    )}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground/80 truncate">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Logout button */}
            <div className="border-t border-border/20 pt-5 mt-5">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors text-sm font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
