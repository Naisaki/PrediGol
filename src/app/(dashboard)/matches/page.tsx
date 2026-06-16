// =============================================================
// app/(dashboard)/matches/page.tsx
// Calendario de partidos completo agrupado por día
// =============================================================

import { getMatches } from '@/server/services/match.service';
import { MatchesCalendar } from '@/components/matches/matches-calendar';
import type { Metadata } from 'next';
import type { Match } from '@/types/app.types';

export const metadata: Metadata = { title: 'Calendario de Partidos' };
export const revalidate = 60; // Revalidar cada minuto

export default async function MatchesPage() {
  let matches: Match[] = [];
  let dbError = null;

  try {
    matches = await getMatches();
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <MatchesCalendar initialMatches={matches as any} dbError={dbError} />
    </div>
  );
}
