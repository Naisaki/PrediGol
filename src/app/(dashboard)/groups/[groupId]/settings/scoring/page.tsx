// =============================================================
// app/(dashboard)/groups/[groupId]/settings/scoring/page.tsx
// Sección: Reglas del Juego (puntuación)
// =============================================================

import { getGroupById } from '@/server/services/group.service';
import { SettingsSection } from '@/components/groups/settings/settings-section';
import { ScoringForm } from '@/components/groups/settings/scoring-form';

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function ScoringSettingsPage({ params }: PageProps) {
  const { groupId } = await params;
  const group = await getGroupById(groupId);
  if (!group) return null;

  return (
    <SettingsSection
      title="Reglas del Juego"
      description="Personaliza el sistema de puntos de tu grupo. Solo afecta pronósticos futuros."
    >
      <ScoringForm
        groupId={groupId}
        initialData={{
          exactScore: group.scoringExactScore ?? 5,
          correctResult: group.scoringCorrectResult ?? 3,
          goalDiff: group.scoringGoalDiff ?? 1,
        }}
      />
    </SettingsSection>
  );
}
