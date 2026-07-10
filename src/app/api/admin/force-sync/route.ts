// =============================================================
// app/api/admin/force-sync/route.ts
// Fuerza sincronización desde el panel admin
// Solo accesible para platform_admin autenticado
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  syncFixturesFromFootballData,
  syncTodayMatchesFromFootballData,
  syncStandingsFromFootballData,
} from '@/server/services/match.service';

type SyncMode = 'fixtures' | 'today' | 'standings' | 'all';

async function isPlatformAdmin(userId: string): Promise<boolean> {
  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('user_id')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (!profile) return false;

  const { data } = await serviceClient
    .from('user_roles')
    .select('role')
    .eq('user_id', profile.user_id)
    .single();
  return data?.role === 'platform_admin';
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  if (!(await isPlatformAdmin(userId))) {
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
