'use client';
// =============================================================
// components/layout/sidebar-nav.tsx
// =============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Trophy,
  LayoutDashboard,
  Users,
  Calendar,
  Radio,
  Globe,
  GitBranch,
  User,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/server/actions/auth';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/groups', label: 'Mis Grupos', icon: Users },
  { href: '/matches', label: 'Partidos', icon: Calendar },
  { href: '/matches/live', label: 'En Vivo', icon: Radio },
  { href: '/world-cup/groups', label: 'Grupos del Mundial', icon: Globe },
  { href: '/world-cup/bracket', label: 'Llaves', icon: GitBranch },
  { href: '/profile', label: 'Mi Perfil', icon: User },
];

interface SidebarNavProps {
  username: string;
  avatarUrl: string | null;
}

export function SidebarNav({ username, avatarUrl }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 mb-8 px-2">
        <Trophy className="h-6 w-6 text-primary" />
        <span className="font-bold text-base tracking-tight">
          Mundial Predictor
        </span>
      </Link>

      {/* Nav items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' &&
              item.href !== '/matches' &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border/40 pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl ?? ''} alt={username} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">@{username}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <Button
            variant="ghost"
            type="submit"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 px-3"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
