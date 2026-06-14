// =============================================================
// app/api/cron/recalculate-points/route.ts
// Recalcula puntos de todos los partidos finalizados
// Frecuencia: cada 10 minutos en cron-job.org
// =============================================================

import { type NextRequest } from 'next/server';
import { verifyCronSecret, cronResponse } from '@/lib/utils/cron-auth';
import { recalculateAllFinishedMatches } from '@/server/services/prediction.service';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const supabase = createServiceClient();
  const syncLogId = crypto.randomUUID();

  await supabase.from('sync_logs').insert({
    id: syncLogId,
    sync_type: 'recalculate_points',
    status: 'success',
    triggered_by: 'cron-job.org',
  });

  try {
    const result = await recalculateAllFinishedMatches();

    await supabase
      .from('sync_logs')
      .update({
        matches_synced: result.matchesProcessed,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLogId);

    return cronResponse({
      success: true,
      matchesProcessed: result.matchesProcessed,
      predictionsUpdated: result.predictionsUpdated,
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
