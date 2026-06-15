// =============================================================
// app/(dashboard)/groups/[groupId]/settings/layout.tsx
// Layout protegido del panel de configuración (solo owner)
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getGroupById, getGroupMembers } from '@/server/services/group.service';
import { SettingsSidebar } from '@/components/groups/settings/settings-sidebar';
import Link from 'next/link';
import { ArrowLeft, Settings2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface LayoutProps {
  params: Promise<{ groupId: string }>;
  children: ReactNode;
}

export default async function GroupSettingsLayout({ params, children }: LayoutProps) {
  const { groupId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const group = await getGroupById(groupId);
  if (!group) redirect('/groups');

  // Solo el owner puede acceder a settings
  const members = await getGroupMembers(groupId);
  const currentMember = members.find((m) => m.userId === user.id);
  if (!currentMember || currentMember.role !== 'owner') {
    redirect(`/groups/${groupId}`);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-center">
            <Settings2 className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Configuración</h1>
            <p className="text-xs text-muted-foreground">{group.name}</p>
          </div>
        </div>
      </div>

      {/* Layout: sidebar + contenido */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="md:sticky md:top-6 md:self-start">
          <SettingsSidebar groupId={groupId} />
        </aside>

        {/* Contenido */}
        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
