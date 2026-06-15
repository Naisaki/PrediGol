// =============================================================
// app/(dashboard)/matches/page.tsx
// Calendario de partidos completo agrupado por día
// =============================================================

import { getMatches } from '@/server/services/match.service';
import { Calendar } from 'lucide-react';
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Partidos del Mundial
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Calendario completo de encuentros por fecha del Mundial FIFA 2026
        </p>
      </div>

      {dbError ? (
        <div className="p-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg space-y-2">
          <h2 className="font-bold text-lg">Error de Base de Datos</h2>
          <p className="text-sm">No se pudo cargar el calendario de partidos.</p>
          <pre className="text-xs font-mono bg-background/50 p-3 rounded overflow-auto">
            {dbError}
          </pre>
        </div>
      ) : (
        <MatchesCalendar initialMatches={matches as any} />
      )}
    </div>
  );
}
