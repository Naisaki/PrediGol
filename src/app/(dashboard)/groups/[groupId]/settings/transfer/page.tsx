// =============================================================
// app/(dashboard)/groups/[groupId]/settings/transfer/page.tsx
// Sección: Transferir Propiedad del Grupo
// =============================================================

import { auth } from '@clerk/nextjs/server';
import { getGroupMembers } from '@/server/services/group.service';
import { SettingsSection } from '@/components/groups/settings/settings-section';
import { TransferOwnershipForm } from '@/components/groups/settings/transfer-ownership-form';

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function TransferOwnershipPage({ params }: PageProps) {
  const { groupId } = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const members = await getGroupMembers(groupId);
  // Excluir al owner actual de la lista de candidatos
  const candidates = members.filter((m) => m.userId !== userId && m.role !== 'owner');

  return (
    <SettingsSection
      title="Transferir Propiedad"
      description="Transfiere el control del grupo a otro miembro. Al hacerlo, pasarás a ser administrador."
    >
      <TransferOwnershipForm
        groupId={groupId}
        candidates={candidates}
      />
    </SettingsSection>
  );
}
