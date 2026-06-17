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
    <div className="flex flex-col gap-3 min-h-screen lg:h-dvh w-full max-w-full overflow-x-hidden lg:overflow-hidden p-3 bg-[var(--background)]">
      {/* Top Navbar (Fijo arriba en el contenedor flex) */}
      <DashboardNavbar
        username={username}
        avatarUrl={avatarUrl}
        collapsed={collapsed}
        setCollapsed={handleSetCollapsed}
      />

      {/* Main Wrapper (Toma la altura restante en desktop, permite expandirse en móvil) */}
      <div className="relative flex flex-row flex-1 min-h-0 gap-3 overflow-visible lg:overflow-hidden">
        {/* Sidebar (Fijo a la izquierda) */}
        <SidebarNav
          username={username}
          avatarUrl={avatarUrl}
          collapsed={collapsed}
          setCollapsed={handleSetCollapsed}
        />

        {/* Content Area (Scroll a nivel de página en móvil, local en desktop) */}
        <main className="flex flex-col flex-grow shrink basis-0 w-full overflow-visible lg:overflow-y-auto no-scrollbar p-4 lg:p-6 pb-24 lg:pb-6 transition-all duration-300 min-h-0 lg:h-full">
          <BreadcrumbNav />
          <DashboardTransitionWrapper>{children}</DashboardTransitionWrapper>
        </main>
      </div>

      {/* Bottom Nav Mobile */}
      <MobileNav />
    </div>
  );
}
