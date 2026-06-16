'use client';
// =============================================================
// components/layout/dashboard-shell-client.tsx
// =============================================================

import React, { useState, useEffect } from 'react';
import { DashboardNavbar } from './dashboard-navbar';
import { SidebarNav } from './sidebar-nav';
import { MobileNav } from './mobile-nav';
import { BreadcrumbNav } from './breadcrumb-nav';
import { DashboardTransitionWrapper } from './dashboard-transition-wrapper';

interface DashboardShellClientProps {
  children: React.ReactNode;
  username: string;
  avatarUrl: string | null;
}

export function DashboardShellClient({
  children,
  username,
  avatarUrl,
}: DashboardShellClientProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      setCollapsed(true);
    }
  }, []);

  const handleSetCollapsed = (val: boolean) => {
    setCollapsed(val);
    localStorage.setItem('sidebar-collapsed', String(val));
  };

  return (
    <div className="flex flex-col gap-3 h-dvh w-screen overflow-hidden p-3 bg-[var(--background)]">
      {/* Top Navbar (Fijo arriba en el contenedor flex) */}
      <DashboardNavbar
        username={username}
        avatarUrl={avatarUrl}
        collapsed={collapsed}
        setCollapsed={handleSetCollapsed}
      />

      {/* Main Wrapper (Toma la altura restante, previene desbordamiento) */}
      <div className="relative flex flex-row flex-1 min-h-0 gap-3 overflow-hidden">
        {/* Sidebar (Fijo a la izquierda) */}
        <SidebarNav
          username={username}
          avatarUrl={avatarUrl}
          collapsed={collapsed}
          setCollapsed={handleSetCollapsed}
        />

        {/* Content Area (Único contenedor con scroll vertical de la página, sin bordes ni fondo, y sin scrollbar visible) */}
        <main className="flex flex-col flex-grow shrink basis-0 w-full overflow-y-auto no-scrollbar p-4 lg:p-6 pb-24 lg:pb-6 transition-all duration-300 h-full">
          <BreadcrumbNav />
          <DashboardTransitionWrapper>{children}</DashboardTransitionWrapper>
        </main>
      </div>

      {/* Bottom Nav Mobile */}
      <MobileNav />
    </div>
  );
}
