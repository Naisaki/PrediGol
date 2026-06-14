// =============================================================
// app/api/admin/manual-match-update/route.ts
// Actualiza resultado de partido manualmente (solo admin)
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateMatchManually } from '@/server/services/match.service';
import { recalculatePointsForMatch } from '@/server/services/prediction.service';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleData?.role !== 'platform_admin') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  const body = await request.json() as {
    matchId: string;
    homeScore: number;
    awayScore: number;
    status: string;
    reason?: string;
  };

  const { matchId, homeScore, awayScore, status, reason } = body;

  if (!matchId || homeScore === undefined || awayScore === undefined || !status) {
    return NextResponse.json({ error: 'Parámetros incompletos' }, { status: 400 });
  }

  try {
    await updateMatchManually(matchId, homeScore, awayScore, status, user.id, reason);

    // Si el partido está finalizado, recalcular puntos
    let predictionsUpdated = 0;
    if (status === 'finished') {
      predictionsUpdated = await recalculatePointsForMatch(matchId);
    }

    return NextResponse.json({
      success: true,
      predictionsUpdated,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
