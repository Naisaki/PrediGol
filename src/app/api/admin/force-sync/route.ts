// =============================================================
// app/api/admin/force-sync/route.ts
// Fuerza sincronización desde el panel admin
// Solo accesible para platform_admin autenticado
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  syncFixturesFromFootballData,
  syncTodayMatchesFromFootballData,
  syncStandingsFromFootballData,
} from '@/server/services/match.service';

type SyncMode = 'fixtures' | 'today' | 'standings' | 'all';

async function isPlatformAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  return data?.role === 'platform_admin';
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  if (!(await isPlatformAdmin(user.id))) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  const body = (await request.json()) as { mode?: SyncMode };
  const mode: SyncMode = body.mode ?? 'all';

  try {
    const results: Record<string, unknown> = {};

    if (mode === 'fixtures' || mode === 'all') {
      results.fixtures = await syncFixturesFromFootballData();
    }
    if (mode === 'today' || mode === 'all') {
      results.today = await syncTodayMatchesFromFootballData();
    }
    if (mode === 'standings' || mode === 'all') {
      results.standings = await syncStandingsFromFootballData();
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
