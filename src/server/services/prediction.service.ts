// =============================================================
// server/services/prediction.service.ts
// Servicio de pronósticos
// =============================================================

import { createServiceClient } from '@/lib/supabase/server';
import {
  calculatePredictionPoints,
} from '@/lib/scoring/calculator';

const supabase = () => createServiceClient();

// ---- Bloqueo de pronósticos --------------------------------

/**
 * Bloquea todos los pronósticos cuyo partido ya debería haber empezado.
 * Basado en kickoff_time guardado en Supabase (no en estado de la API).
 * Llamar desde cron job lock-predictions (cada 2 min).
 */
export async function lockPredictionsForStartedMatches(): Promise<number> {
  const now = new Date().toISOString();

  // Obtener partidos que ya comenzaron y no están bloqueados aún
  const { data: startedMatches } = await supabase()
    .from('matches')
    .select('id')
    .lte('kickoff_time', now)
    .in('status', ['scheduled', 'timed', 'in_play', 'paused', 'finished']);

  if (!startedMatches || startedMatches.length === 0) return 0;

  const matchIds = startedMatches.map((m) => m.id);

  const { data, error } = await supabase()
    .from('predictions')
    .update({
      is_locked: true,
      locked_at: now,
    })
    .in('match_id', matchIds)
    .eq('is_locked', false)
    .select('id');

  if (error) throw new Error(`lockPredictions: ${error.message}`);
  return data?.length ?? 0;
}

// ---- Recálculo de puntos -----------------------------------

/**
 * Recalcula puntos para todos los pronósticos de un partido finalizado.
 * Llamar cuando un partido cambia a FINISHED.
 */
export async function recalculatePointsForMatch(matchId: string): Promise<number> {
  const sb = supabase();

  // Obtener el resultado del partido
  const { data: match, error: matchError } = await sb
    .from('matches')
    .select('id, home_score, away_score, status')
    .eq('id', matchId)
    .single();

  if (matchError || !match) {
    throw new Error(`Partido no encontrado: ${matchId}`);
  }

  if (match.home_score === null || match.away_score === null) {
    return 0; // Sin resultado todavía
  }

  // Obtener todos los pronósticos de este partido
  const { data: predictions, error: predError } = await sb
    .from('predictions')
    .select('id, predicted_home_score, predicted_away_score')
    .eq('match_id', matchId);

  if (predError || !predictions) return 0;

  let updated = 0;

  for (const pred of predictions) {
    const score = calculatePredictionPoints(
      pred.predicted_home_score,
      pred.predicted_away_score,
      match.home_score,
      match.away_score,
    );

    const { error } = await sb
      .from('predictions')
      .update({
        points_awarded: score.points,
        exact_score_hit: score.exactScoreHit,
        result_hit: score.resultHit,
        goal_difference_hit: score.goalDifferenceHit,
      })
      .eq('id', pred.id);

    if (!error) updated++;
  }

  return updated;
}

/**
 * Recalcula puntos de todos los partidos finalizados.
 * Llamar desde cron job recalculate-points (cada 10 min).
 */
export async function recalculateAllFinishedMatches(): Promise<{
  matchesProcessed: number;
  predictionsUpdated: number;
}> {
  const { data: finishedMatches } = await supabase()
    .from('matches')
    .select('id')
    .eq('status', 'finished')
    .not('home_score', 'is', null)
    .not('away_score', 'is', null);

  if (!finishedMatches || finishedMatches.length === 0) {
    return { matchesProcessed: 0, predictionsUpdated: 0 };
  }

  let predictionsUpdated = 0;

  for (const match of finishedMatches) {
    const count = await recalculatePointsForMatch(match.id);
    predictionsUpdated += count;
  }

  return { matchesProcessed: finishedMatches.length, predictionsUpdated };
}

// ---- Consultas de pronósticos ------------------------------

export async function getUserPredictionsForGroup(
  userId: string,
  groupId: string,
) {
  const { data, error } = await supabase()
    .from('predictions')
    .select(`
      *,
      match:matches (
        id, kickoff_time, status, stage, group_name,
        home_team_name, away_team_name, home_team_crest, away_team_crest,
        home_score, away_score, winner
      )
    `)
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getUserPredictions: ${error.message}`);
  return data ?? [];
}

export async function getGroupPredictionsForMatch(
  matchId: string,
  groupId: string,
) {
  // Solo devuelve pronósticos de partidos bloqueados (post-kickoff)
  const { data, error } = await supabase()
    .from('predictions')
    .select(`
      *,
      profile:profiles (username, full_name, avatar_url)
    `)
    .eq('match_id', matchId)
    .eq('group_id', groupId)
    .eq('is_locked', true);

  if (error) throw new Error(`getGroupPredictions: ${error.message}`);
  return data ?? [];
}

export async function upsertPrediction(
  userId: string,
  matchId: string,
  groupId: string,
  homeScore: number,
  awayScore: number,
): Promise<void> {
  const sb = supabase();

  // Verificar que el partido no haya empezado
  const { data: match } = await sb
    .from('matches')
    .select('kickoff_time')
    .eq('id', matchId)
    .single();

  if (!match) throw new Error('Partido no encontrado');

  const now = new Date();
  const kickoff = new Date(match.kickoff_time);

  if (now >= kickoff) {
    throw new Error('El partido ya comenzó. No puedes modificar tu pronóstico.');
  }

  const { error } = await sb
    .from('predictions')
    .upsert(
      {
        user_id: userId,
        match_id: matchId,
        group_id: groupId,
        predicted_home_score: homeScore,
        predicted_away_score: awayScore,
        is_locked: false,
      },
      { onConflict: 'user_id,match_id,group_id' },
    );

  if (error) throw new Error(`upsertPrediction: ${error.message}`);
}
