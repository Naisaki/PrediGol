// =============================================================
// app/api/cron/sync-today-matches/route.ts
// Sincroniza partidos de hoy desde football-data.org
// Frecuencia: cada 10-15 minutos en cron-job.org
// =============================================================

import { type NextRequest } from 'next/server';
import { verifyCronSecret, cronResponse } from '@/lib/utils/cron-auth';
import { syncTodayMatchesFromFootballData } from '@/server/services/match.service';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const supabase = createServiceClient();
  const syncLogId = crypto.randomUUID();

  await supabase.from('sync_logs').insert({
    id: syncLogId,
    sync_type: 'today_matches',
    status: 'success',
    triggered_by: 'cron-job.org',
  });

  try {
    const result = await syncTodayMatchesFromFootballData();
    const hasErrors = result.errors.length > 0;

    await supabase
      .from('sync_logs')
      .update({
        status: hasErrors ? 'partial' : 'success',
        matches_synced: result.matchesSynced,
        error_message: hasErrors ? result.errors.join('; ') : null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLogId);

    return cronResponse({
      success: true,
      matchesSynced: result.matchesSynced,
      errors: result.errors,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    await supabase
      .from('sync_logs')
      .update({
        status: 'error',
        error_message: message,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLogId);

    return cronResponse({ success: false, error: message }, 500);
  }
}
