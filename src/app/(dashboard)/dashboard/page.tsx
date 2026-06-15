// =============================================================
// app/(dashboard)/dashboard/page.tsx
// Dashboard principal
// =============================================================

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Trophy,
  Users,
  Target,
  Calendar,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiDelayNotice } from '@/components/common/api-delay-notice';
import { LocalTime } from '@/components/common/local-time';
import { getGroupRanking } from '@/server/services/group.service';
import type { Metadata } from 'next';

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

  // Grupos del usuario
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group:groups (id, name)')
    .eq('user_id', user.id)
    .limit(5);

  // Partidos de hoy
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data: todayMatches } = await supabase
    .from('matches')
    .select('id, home_team_name, away_team_name, kickoff_time, status')
    .gte('kickoff_time', startOfDay)
    .lte('kickoff_time', endOfDay)
    .order('kickoff_time')
    .limit(5);

  const groups = (memberships as any[])?.map((m) => m.group).filter(Boolean) ?? [];

  const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? 'Jugador';

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

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Mis grupos',
            value: groups.length,
            icon: Users,
            href: '/groups',
            color: 'text-primary',
          },
          {
            label: 'Partidos hoy',
            value: todayMatches?.length ?? 0,
            icon: Calendar,
            href: '/matches/today',
            color: 'text-secondary',
          },
          {
            label: 'Ver resultados',
            value: '→',
            icon: Target,
            href: '/results',
            color: 'text-accent',
          },
          {
            label: 'Llaves',
            value: '→',
            icon: Trophy,
            href: '/world-cup/bracket',
            color: 'text-yellow-400',
          },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="glass-card border-border/40 hover:border-primary/30 transition-colors cursor-pointer group">
              <CardContent className="p-4">
                <stat.icon
                  className={`h-5 w-5 mb-3 ${stat.color} group-hover:scale-110 transition-transform`}
                />
                <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mis grupos */}
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
                {groups.slice(0, 3).map((group: unknown) => {
                  const g = group as { id: string; name: string };
                  return (
                    <Link key={g.id} href={`/groups/${g.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
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

        {/* Partidos de hoy */}
        <Card className="glass-card border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              Partidos de Hoy
            </CardTitle>
            <Link href="/matches/today">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                Ver todos
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {!todayMatches || todayMatches.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay partidos programados para hoy
                </p>
              </div>
            ) : (
              todayMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                >
                  <div className="text-sm">
                    <span className="font-medium">{match.home_team_name ?? 'TBD'}</span>
                    <span className="text-muted-foreground mx-2">vs</span>
                    <span className="font-medium">{match.away_team_name ?? 'TBD'}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <LocalTime utcDate={match.kickoff_time} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
