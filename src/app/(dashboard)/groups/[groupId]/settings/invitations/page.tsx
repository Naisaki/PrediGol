// =============================================================
// app/(dashboard)/groups/[groupId]/settings/invitations/page.tsx
// Sección: Configuración de Invitaciones
// =============================================================

import { auth } from '@clerk/nextjs/server';
import { getGroupById } from '@/server/services/group.service';
import { SettingsSection } from '@/components/groups/settings/settings-section';
import { InvitationsForm } from '@/components/groups/settings/invitations-form';

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function InvitationsSettingsPage({ params }: PageProps) {
  const { groupId } = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const group = await getGroupById(groupId);
  if (!group) return null;

  return (
    <SettingsSection
      title="Invitaciones"
      description="Controla cómo nuevos jugadores pueden unirse a tu grupo."
    >
      <InvitationsForm
        groupId={groupId}
        initialData={{
          inviteCode: group.inviteCode,
          joinsOpen: group.joinsOpen ?? true,
          joinApproval: group.joinApproval ?? false,
          maxMembers: group.maxMembers ?? null,
          welcomeMessage: group.welcomeMessage ?? '',
        }}
      />
    </SettingsSection>
  );
}
