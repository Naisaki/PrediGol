// =============================================================
// app/(dashboard)/groups/[groupId]/predictions/page.tsx
// Pronósticos del grupo para el usuario actual
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PredictionCard } from '@/components/predictions/prediction-card';
import { ApiDelayNotice } from '@/components/common/api-delay-notice';
import { Target, Lock } from 'lucide-react';
import { getGroupById, getGroupMembers } from '@/server/services/group.service';
import { Card, CardContent } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pronósticos' };

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function PredictionsPage({ params }: PageProps) {
  const { groupId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Obtener grupo
  const group = await getGroupById(groupId);
  if (!group || !group.isActive) {
    notFound();
  }

  // Verificar membresía
  const members = await getGroupMembers(groupId);
  const currentMember = members.find((m) => m.userId === user.id);
  if (!currentMember) {
    notFound();
  }

  // Obtener partidos disponibles para pronosticar
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .in('status', ['scheduled', 'timed', 'in_play', 'paused', 'finished'])
    .order('kickoff_time', { ascending: true });

  // Obtener pronósticos existentes del usuario en este grupo
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .eq('group_id', groupId);

  const predictionsMap = new Map(
    (predictions ?? []).map((p) => [p.match_id, p]),
  );

  const now = new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Pronósticos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{group?.name}</p>
      </div>

      <ApiDelayNotice />

      {/* Info sobre bloqueo */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/20 border border-border/30 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        <span>
          Los pronósticos se bloquean automáticamente cuando comienza el partido.
          Los pronósticos de otros jugadores se revelan una vez iniciado el partido.
        </span>
      </div>

      {!matches || matches.length === 0 ? (
        <Card className="glass-card border-border/40">
          <CardContent className="text-center py-16">
            <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No hay partidos disponibles todavía.
              <br />
              El fixture se cargará cuando comience el torneo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Agrupar por fecha */}
          {groupMatchesByDate(matches).map(({ date, matches: dayMatches }) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                {formatGroupDate(date)}
              </h3>
              <div className="space-y-3">
                {dayMatches.map((match: any) => {
                  const prediction = predictionsMap.get(match.id) ?? null;
                  const isLocked = Boolean(
                    match.is_locked || now >= new Date(match.kickoff_time),
                  );

                  return (
                    <PredictionCard
                      key={match.id}
                      match={match}
                      prediction={prediction as any}
                      groupId={groupId}
                      isLocked={isLocked}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Helpers -----------------------------------------------

function groupMatchesByDate(matches: any[]) {
  const grouped = new Map<string, any[]>();

  for (const match of matches) {
    const date = match.kickoff_time.split('T')[0];
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(match);
  }

  return Array.from(grouped.entries()).map(([date, matches]) => ({
    date,
    matches,
  }));
}

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (dateStr === today.toISOString().split('T')[0]) return 'Hoy';
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Mañana';

  return date.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// Type helpers for PredictionCard
export interface MatchForCard {
  id: string;
  kickoff_time: string;
  status: string;
  stage: string | null;
  group_name: string | null;
  home_team_name: string | null;
  away_team_name: string | null;
  home_team_crest: string | null;
  away_team_crest: string | null;
  home_score: number | null;
  away_score: number | null;
  winner: string | null;
}

export interface PredictionData {
  id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points_awarded: number;
  is_locked: boolean;
  exact_score_hit: boolean;
  result_hit: boolean;
}
