// =============================================================
// app/(dashboard)/groups/[groupId]/predictions/page.tsx
// Pronósticos del grupo para el usuario actual
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ApiDelayNotice } from '@/components/common/api-delay-notice';
import { Target, Lock, ArrowLeft } from 'lucide-react';
import { getGroupById, getGroupMembers } from '@/server/services/group.service';
import { getUserPredictionsForGroup } from '@/server/services/prediction.service';
import { PredictionsTabsView } from '@/components/predictions/predictions-tabs-view';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mis Pronósticos' };

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
  const predictions = (await getUserPredictionsForGroup(user.id, groupId)) as any[];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          href={`/groups/${groupId}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a {group.name}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Mis Pronósticos
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

      <PredictionsTabsView
        matches={matches || []}
        predictions={predictions}
        groupId={groupId}
      />
    </div>
  );
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
