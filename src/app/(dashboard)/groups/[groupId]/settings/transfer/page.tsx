// =============================================================
// app/(dashboard)/groups/[groupId]/settings/transfer/page.tsx
// Sección: Transferir Propiedad del Grupo
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { getGroupMembers } from '@/server/services/group.service';
import { SettingsSection } from '@/components/groups/settings/settings-section';
import { TransferOwnershipForm } from '@/components/groups/settings/transfer-ownership-form';

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function TransferOwnershipPage({ params }: PageProps) {
  const { groupId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const members = await getGroupMembers(groupId);
  // Excluir al owner actual de la lista de candidatos
  const candidates = members.filter((m) => m.userId !== user.id && m.role !== 'owner');

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
