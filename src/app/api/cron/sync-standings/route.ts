// =============================================================
// app/api/cron/sync-standings/route.ts
// Sincroniza tablas de posiciones de grupos del Mundial
// Frecuencia: cada 30 minutos en días con partidos
// =============================================================

import { type NextRequest } from 'next/server';
import { verifyCronSecret, cronResponse } from '@/lib/utils/cron-auth';
import { syncStandingsFromFootballData } from '@/server/services/match.service';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const supabase = createServiceClient();
  const syncLogId = crypto.randomUUID();

  await supabase.from('sync_logs').insert({
    id: syncLogId,
    sync_type: 'standings',
    status: 'success',
    triggered_by: 'cron-job.org',
  });

  try {
    const result = await syncStandingsFromFootballData();
    const hasErrors = result.errors.length > 0;

    await supabase
      .from('sync_logs')
      .update({
        status: hasErrors ? 'partial' : 'success',
        standings_synced: result.matchesSynced, // reuse field
        error_message: hasErrors ? result.errors.join('; ') : null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLogId);

    return cronResponse({ success: true, errors: result.errors });
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
