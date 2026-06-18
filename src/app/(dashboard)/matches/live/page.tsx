// =============================================================
// app/(dashboard)/matches/live/page.tsx
// Partidos En Vivo (Estado in_play o paused)
// =============================================================

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { LiveMatchesClient } from '@/components/matches/live-matches-client';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Partidos En Vivo' };
export const revalidate = 10; // Revalidar cada 10 segundos en vivo

export default async function LiveMatchesPage() {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient();

  // Obtener solo partidos en juego (in_play) o descanso (paused)
  const [matchesResult, syncLogsResult] = await Promise.all([
    supabase
      .from('matches')
      .select('id, home_team_name, away_team_name, home_team_crest, away_team_crest, kickoff_time, status, home_score, away_score, winner, group_name, stage, last_updated_from_api, manually_updated, stream_url')
      .in('status', ['in_play', 'paused'])
      .order('kickoff_time', { ascending: true }),
    serviceSupabase
      .from('sync_logs')
      .select('completed_at')
      .eq('sync_type', 'today_matches')
      .eq('status', 'success')
      .order('completed_at', { ascending: false })
      .limit(1)
  ]);

  const matches = matchesResult.data;
  const matchesError = matchesResult.error;
  const syncLogs = syncLogsResult.data;
  const syncError = syncLogsResult.error;

  const dbError = matchesError || syncError ? { matchesError, syncError } : null;

  const lastSync = syncLogs && syncLogs.length > 0 ? syncLogs[0] : null;

  const lastSyncTime = lastSync?.completed_at
    ? new Date(lastSync.completed_at).toLocaleTimeString('es', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <LiveMatchesClient 
      initialMatches={(matches as any) ?? []} 
      lastSyncTime={lastSyncTime} 
      dbError={dbError} 
    />
  );
}
