'use client';
// =============================================================
// components/layout/dashboard-header.tsx
// Header móvil del dashboard
// =============================================================

import { Trophy } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/common/theme-toggle';

interface DashboardHeaderProps {
  username: string;
  avatarUrl: string | null;
}

export function DashboardHeader({ username, avatarUrl }: DashboardHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-40 glass border-b border-white/5 h-14 flex items-center justify-between px-4">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <span className="font-bold tracking-tight text-sm">Mundial Predictor</span>
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/profile">
          <Avatar className="h-8 w-8 border border-border/60">
            <AvatarImage src={avatarUrl ?? ''} alt={username} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}

