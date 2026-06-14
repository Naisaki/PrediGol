'use client';
// =============================================================
// components/layout/mobile-nav.tsx
// Navegación inferior para móvil
// =============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, Globe, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const mobileNavItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/groups', label: 'Grupos', icon: Users },
  { href: '/matches', label: 'Partidos', icon: Calendar },
  { href: '/world-cup/groups', label: 'Mundial', icon: Globe },
  { href: '/profile', label: 'Perfil', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 mobile-nav-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-0',
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
      </div>
    </nav>
  );
}
