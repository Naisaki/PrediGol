// =============================================================
// app/(dashboard)/groups/[groupId]/settings/participants/page.tsx
// Sección: Gestionar Participantes
// =============================================================

import { createClient } from '@/lib/supabase/server';
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const members = await getGroupMembers(groupId);

  return (
    <SettingsSection
      title="Gestionar Participantes"
      description="Administra los miembros del grupo, cambia roles y expulsa participantes."
    >
      <ParticipantsTable
        groupId={groupId}
        members={members}
        currentUserId={user.id}
      />
    </SettingsSection>
  );
}
