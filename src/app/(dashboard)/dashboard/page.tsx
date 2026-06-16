// =============================================================
// app/(dashboard)/dashboard/page.tsx
// Dashboard principal
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { ApiDelayNotice } from '@/components/common/api-delay-notice';
import { getUserGroups } from '@/server/services/group.service';
import type { Metadata } from 'next';
import { TodayMatchesSection } from '@/components/dashboard/today-matches-section';
import { WelcomeHeader } from '@/components/dashboard/welcome-header';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Obtener ventana de partidos (ayer, hoy, mañana) para filtrar en el cliente según su zona horaria
  const today = new Date();
  const startWindow = new Date(today);
  startWindow.setDate(startWindow.getDate() - 1);
  startWindow.setHours(0, 0, 0, 0);
  
  const endWindow = new Date(today);
  endWindow.setDate(endWindow.getDate() + 1);
  endWindow.setHours(23, 59, 59, 999);

  // Ejecutamos las consultas en paralelo para acelerar el tiempo de carga del servidor
  const [profileResult, groups, windowMatchesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('username, full_name')
      .eq('user_id', user.id)
      .maybeSingle(),
    getUserGroups(user.id),
    supabase
      .from('matches')
      .select('id, home_team_name, away_team_name, home_team_crest, away_team_crest, kickoff_time, status, home_score, away_score')
      .gte('kickoff_time', startWindow.toISOString())
      .lte('kickoff_time', endWindow.toISOString())
      .order('kickoff_time')
  ]);

  const profile = profileResult.data;
  const windowMatches = windowMatchesResult.data;

  const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? 'Jugador';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <WelcomeHeader name={firstName} />

      <ApiDelayNotice />

      <TodayMatchesSection 
        groups={(groups as any) ?? []} 
        windowMatches={(windowMatches as any) ?? []} 
      />
    </div>
  );
}
