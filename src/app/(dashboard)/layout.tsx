// =============================================================
// app/(dashboard)/layout.tsx
// Layout con sidebar desktop + bottom nav mobile
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShellClient } from '@/components/layout/dashboard-shell-client';

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
    <DashboardShellClient
      username={profile?.username ?? 'Usuario'}
      avatarUrl={profile?.avatar_url ?? null}
    >
      {children}
    </DashboardShellClient>
  );
}
