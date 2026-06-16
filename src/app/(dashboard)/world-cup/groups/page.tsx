// =============================================================
// app/(dashboard)/world-cup/groups/page.tsx
// Grupos del Mundial / Tabla de posiciones de la FIFA
// =============================================================

import { getWorldCupStandings } from '@/server/services/match.service';
import type { Metadata } from 'next';
import { GroupsClient } from '@/components/world-cup/groups-client';

export const metadata: Metadata = {
  title: 'Grupos del Mundial',
  description: 'Tabla de posiciones y grupos del Mundial FIFA 2026.',
};

export default async function WorldCupGroupsPage() {
  const standings = await getWorldCupStandings();

  return (
    <GroupsClient initialStandings={standings as any} />
  );
}
