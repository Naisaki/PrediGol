// =============================================================
// app/(dashboard)/groups/page.tsx
// Lista de grupos del usuario
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { getUserGroups } from '@/server/services/group.service';
import type { Metadata } from 'next';
import { GroupsListClient } from '@/components/groups/groups-list-client';

export const metadata: Metadata = { title: 'Mis Grupos' };

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const groups = await getUserGroups(user.id);

  return (
    <GroupsListClient initialGroups={groups as any} />
  );
}
