// =============================================================
// app/api/cron/lock-predictions/route.ts
// Bloquea pronósticos de partidos que ya comenzaron
// Frecuencia: cada 2 minutos en cron-job.org
// =============================================================

import { type NextRequest } from 'next/server';
import { verifyCronSecret, cronResponse } from '@/lib/utils/cron-auth';
import { lockPredictionsForStartedMatches } from '@/server/services/prediction.service';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const supabase = createServiceClient();
  const syncLogId = crypto.randomUUID();

  await supabase.from('sync_logs').insert({
    id: syncLogId,
    sync_type: 'lock_predictions',
    status: 'success',
    triggered_by: 'cron-job.org',
  });

  try {
    const locked = await lockPredictionsForStartedMatches();

    await supabase
      .from('sync_logs')
      .update({
        matches_synced: locked,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLogId);

    return cronResponse({ success: true, predictionsLocked: locked });
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
