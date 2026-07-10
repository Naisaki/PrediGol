// =============================================================
// app/(dashboard)/groups/[groupId]/settings/participants/page.tsx
// Sección: Gestionar Participantes
// =============================================================

import { auth } from '@clerk/nextjs/server';
import { getGroupMembers } from '@/server/services/group.service';
import { SettingsSection } from '@/components/groups/settings/settings-section';
import { ParticipantsTable } from '@/components/groups/settings/participants-table';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Participantes — Configuración' };

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function ParticipantsSettingsPage({ params }: PageProps) {
  const { groupId } = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const members = await getGroupMembers(groupId);

  return (
    <SettingsSection
      title="Gestionar Participantes"
      description="Administra los miembros del grupo, cambia roles y expulsa participantes."
    >
      <ParticipantsTable
        groupId={groupId}
        members={members}
        currentUserId={userId}
      />
    </SettingsSection>
  );
}
