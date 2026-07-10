// =============================================================
// app/(dashboard)/groups/page.tsx
// Lista de grupos del usuario
// =============================================================

import { auth } from '@clerk/nextjs/server';
import { getUserGroups } from '@/server/services/group.service';
import type { Metadata } from 'next';
import { GroupsListClient } from '@/components/groups/groups-list-client';

export const metadata: Metadata = { title: 'Mis Grupos' };

export default async function GroupsPage() {
  const { userId } = await auth();

  if (!userId) return null;

  const groups = await getUserGroups(userId);

  return (
    <GroupsListClient initialGroups={groups as any} />
  );
}
