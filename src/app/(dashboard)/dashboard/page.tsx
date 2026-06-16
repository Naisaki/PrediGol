// =============================================================
// app/(dashboard)/dashboard/page.tsx
// Dashboard principal
// =============================================================

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Users,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiDelayNotice } from '@/components/common/api-delay-notice';
import { getUserGroups } from '@/server/services/group.service';
import type { Metadata } from 'next';
import { TodayMatchesSection } from '@/components/dashboard/today-matches-section';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Datos del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  // Grupos del usuario obtenidos con el servicio para asegurar datos frescos
  const groups = await getUserGroups(user.id);

  // Obtener ventana de partidos (ayer, hoy, mañana) para filtrar en el cliente según su zona horaria
  const today = new Date();
  const startWindow = new Date(today);
  startWindow.setDate(startWindow.getDate() - 1);
  startWindow.setHours(0, 0, 0, 0);
  
  const endWindow = new Date(today);
  endWindow.setDate(endWindow.getDate() + 1);
  endWindow.setHours(23, 59, 59, 999);

  const { data: windowMatches } = await supabase
    .from('matches')
    .select('id, home_team_name, away_team_name, home_team_crest, away_team_crest, kickoff_time, status, home_score, away_score')
    .gte('kickoff_time', startWindow.toISOString())
    .lte('kickoff_time', endWindow.toISOString())
    .order('kickoff_time');

  const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? 'Jugador';

  // Renderizamos el marcado de la lista de grupos en el servidor para conservar la renderización estática rápida
  const groupsListMarkup = (
    <Card className="glass-card border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Mis Grupos</CardTitle>
        <Link href="/groups">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
            Ver todos
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {groups.length === 0 ? (
          <div className="text-center py-6">
            <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Aún no tienes grupos
            </p>
            <Link href="/groups/create">
              <Button size="sm" className="bg-primary/90 hover:bg-primary">
                <Plus className="mr-1 h-4 w-4" />
                Crear grupo
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {groups.slice(0, 3).map((g) => {
              const initials = g.name
                .split(' ')
                .map((word) => word[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();

              return (
                <Link key={g.id} href={`/groups/${g.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {g.imageUrl ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border/60 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={g.imageUrl}
                            alt={g.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary tracking-wider flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <span className="text-sm font-medium">{g.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
            <Link href="/groups/create">
              <Button variant="outline" size="sm" className="w-full mt-2 border-dashed border-border/60 text-muted-foreground hover:text-foreground">
                <Plus className="mr-1 h-4 w-4" />
                Crear nuevo grupo
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          ¡Hola, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido al Mundial Predictor FIFA 2026
        </p>
      </div>

      <ApiDelayNotice />

      <TodayMatchesSection 
        groupsCount={groups.length} 
        windowMatches={(windowMatches as any) ?? []} 
        groupsListMarkup={groupsListMarkup}
      />
    </div>
  );
}
