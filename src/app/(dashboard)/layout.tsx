// =============================================================
// app/(dashboard)/layout.tsx
// Layout con sidebar desktop + bottom nav mobile
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { MobileNav } from '@/components/layout/mobile-nav';
import { DashboardHeader } from '@/components/layout/dashboard-header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header móvil */}
      <DashboardHeader
        username={profile?.username ?? 'Usuario'}
        avatarUrl={profile?.avatar_url ?? null}
      />

      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border/40 bg-card/30 min-h-screen sticky top-0 h-screen">
          <SidebarNav
            username={profile?.username ?? 'Usuario'}
            avatarUrl={profile?.avatar_url ?? null}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 max-w-5xl w-full">
          {children}
        </main>
      </div>

      {/* Bottom nav móvil */}
      <MobileNav />
    </div>
  );
}
