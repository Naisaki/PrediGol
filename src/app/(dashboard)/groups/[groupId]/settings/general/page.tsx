// =============================================================
// app/(dashboard)/groups/[groupId]/settings/general/page.tsx
// Sección: Información General del Grupo
// =============================================================

import { getGroupById } from '@/server/services/group.service';
import { SettingsSection } from '@/components/groups/settings/settings-section';
import { GeneralInfoForm } from '@/components/groups/settings/general-info-form';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GeneralSettingsPage({ params }: PageProps) {
  const { groupId } = await params;
  const group = await getGroupById(groupId);
  if (!group) notFound();

  return (
    <SettingsSection
      title="Información General"
      description="Edita el nombre, descripción e imagen del grupo."
    >
      <GeneralInfoForm
        groupId={groupId}
        initialData={{
          name: group.name,
          description: group.description ?? '',
          imageUrl: group.imageUrl ?? '',
        }}
      />
    </SettingsSection>
  );
}
