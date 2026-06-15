// =============================================================
// app/(dashboard)/groups/[groupId]/settings/danger/page.tsx
// Sección: Zona de Peligro
// =============================================================

import { getGroupById } from '@/server/services/group.service';
import { SettingsSection } from '@/components/groups/settings/settings-section';
import { DangerZoneActions } from '@/components/groups/settings/danger-zone-actions';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function DangerZonePage({ params }: PageProps) {
  const { groupId } = await params;
  const group = await getGroupById(groupId);
  if (!group) notFound();

  return (
    <SettingsSection
      title="Zona de Peligro"
      description="Acciones irreversibles sobre el grupo. Procede con cautela."
    >
      <DangerZoneActions
        groupId={groupId}
        groupName={group.name}
        isActive={group.isActive}
      />
    </SettingsSection>
  );
}
