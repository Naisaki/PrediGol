// =============================================================
// app/api/cron/sync-fixtures/route.ts
// Sincroniza el fixture completo del Mundial desde football-data.org
// Frecuencia recomendada: 1 vez al día (02:00 UTC)
// Configurar en cron-job.org: GET /api/cron/sync-fixtures
//   Header: Authorization: Bearer {CRON_SECRET}
// =============================================================

import { type NextRequest } from 'next/server';
import { verifyCronSecret, cronResponse } from '@/lib/utils/cron-auth';
import { syncFixturesFromFootballData } from '@/server/services/match.service';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const supabase = createServiceClient();
  const syncLogId = crypto.randomUUID();

  // Crear registro de sync
  await supabase.from('sync_logs').insert({
    id: syncLogId,
    sync_type: 'fixtures',
    status: 'success', // Se actualizará al final
    triggered_by: 'cron-job.org',
  });

  try {
    const result = await syncFixturesFromFootballData();
    const hasErrors = result.errors.length > 0;

    // Actualizar log
    await supabase
      .from('sync_logs')
      .update({
        status: hasErrors ? 'partial' : 'success',
        matches_synced: result.matchesSynced,
        teams_synced: result.teamsSynced,
        error_message: hasErrors ? result.errors.join('; ') : null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLogId);

    return cronResponse({
      success: true,
      matchesSynced: result.matchesSynced,
      teamsSynced: result.teamsSynced,
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
