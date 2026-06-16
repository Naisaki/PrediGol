// =============================================================
// app/(dashboard)/world-cup/bracket/page.tsx
// Llaves del Mundial / Fases de eliminación directa (bracket)
// =============================================================

import { getMatches } from '@/server/services/match.service';
import { BracketClient } from '@/components/world-cup/bracket-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Llaves del Mundial',
  description: 'Fases de eliminación directa y llaves del Mundial FIFA 2026.',
};

export default async function WorldCupBracketPage() {
  const allMatches = await getMatches();

  return <BracketClient initialMatches={allMatches} />;
}
