// =============================================================
// server/services/match.service.ts
// Servicio de partidos — Lee/escribe en Supabase
// =============================================================

import { createServiceClient } from '@/lib/supabase/server';
import {
  getCompetitionMatches,
  getTodayMatches as fetchTodayMatchesFromApi,
  getCompetitionStandings,
  getCompetitionTeams,
} from '@/lib/football-data/client';
import {
  normalizeFootballDataMatch,
  normalizeTeam,
  normalizeStanding,
} from '@/lib/football-data/normalizers';
import type { Match, WorldCupStanding } from '@/types/app.types';

const supabase = () => createServiceClient();

// ---- Lecturas desde Supabase --------------------------------

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase()
    .from('matches')
    .select('*')
    .order('kickoff_time', { ascending: true });

  if (error) throw new Error(`getMatches: ${error.message}`);
  return (data ?? []) as unknown as Match[];
}

export async function getTodayMatches(): Promise<Match[]> {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase()
    .from('matches')
    .select('*')
    .gte('kickoff_time', startOfDay.toISOString())
    .lte('kickoff_time', endOfDay.toISOString())
    .order('kickoff_time', { ascending: true });

  if (error) throw new Error(`getTodayMatches: ${error.message}`);
  return (data ?? []) as unknown as Match[];
}

export async function getMatchesByStage(stage: string): Promise<Match[]> {
  const { data, error } = await supabase()
    .from('matches')
    .select('*')
    .eq('stage', stage)
    .order('kickoff_time', { ascending: true });

  if (error) throw new Error(`getMatchesByStage: ${error.message}`);
  return (data ?? []) as unknown as Match[];
}

export async function getMatchesByGroup(groupName: string): Promise<Match[]> {
  const { data, error } = await supabase()
    .from('matches')
    .select('*')
    .eq('group_name', groupName)
    .order('kickoff_time', { ascending: true });

  if (error) throw new Error(`getMatchesByGroup: ${error.message}`);
  return (data ?? []) as unknown as Match[];
}

export async function getFinishedMatches(): Promise<Match[]> {
  const { data, error } = await supabase()
    .from('matches')
    .select('*')
    .eq('status', 'finished')
    .order('kickoff_time', { ascending: false });

  if (error) throw new Error(`getFinishedMatches: ${error.message}`);
  return (data ?? []) as unknown as Match[];
}

export async function getMatchById(id: string): Promise<Match | null> {
  const { data, error } = await supabase()
    .from('matches')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as unknown as Match;
}

// ---- Sincronización desde football-data.org ----------------

export interface SyncResult {
  matchesSynced: number;
  teamsSynced: number;
  errors: string[];
}

/**
 * Sincroniza el fixture completo del Mundial desde football-data.org.
 * Llama 1 vez al día (cron job sync-fixtures).
 */
export async function syncFixturesFromFootballData(): Promise<SyncResult> {
  const errors: string[] = [];
  let matchesSynced = 0;
  let teamsSynced = 0;

  try {
    // 1. Obtener y sincronizar equipos
    const teamsResponse = await getCompetitionTeams();
    for (const apiTeam of teamsResponse.teams) {
      const normalized = normalizeTeam(apiTeam);
      const { error } = await supabase()
        .from('teams')
        .upsert(
          {
            external_api_id: normalized.externalApiId,
            name: normalized.name,
            short_name: normalized.shortName,
            tla: normalized.tla,
            crest_url: normalized.crestUrl,
            country: normalized.country,
          },
          { onConflict: 'external_api_id' },
        );

      if (error) {
        errors.push(`Team ${apiTeam.name}: ${error.message}`);
      } else {
        teamsSynced++;
      }
    }

    // 2. Obtener y sincronizar partidos
    const matchesResponse = await getCompetitionMatches();
    for (const apiMatch of matchesResponse.matches) {
      const normalized = normalizeFootballDataMatch(apiMatch);

      // Resolver IDs de equipos en la DB
      let homeTeamId: string | null = null;
      let awayTeamId: string | null = null;

      if (normalized.homeTeamExternalId) {
        const { data } = await supabase()
          .from('teams')
          .select('id')
          .eq('external_api_id', normalized.homeTeamExternalId)
          .single();
        homeTeamId = data?.id ?? null;
      }

      if (normalized.awayTeamExternalId) {
        const { data } = await supabase()
          .from('teams')
          .select('id')
          .eq('external_api_id', normalized.awayTeamExternalId)
          .single();
        awayTeamId = data?.id ?? null;
      }

      const { error } = await supabase()
        .from('matches')
        .upsert(
          {
            external_api_id: normalized.externalApiId,
            competition_id: normalized.competitionId,
            competition_code: normalized.competitionCode,
            competition_name: normalized.competitionName,
            season_id: normalized.seasonId,
            season_year: normalized.seasonYear,
            utc_date: normalized.utcDate,
            kickoff_time: normalized.kickoffTime,
            status: normalized.status,
            matchday: normalized.matchday,
            stage: normalized.stage,
            group_name: normalized.groupName,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            home_team_name: normalized.homeTeamName,
            away_team_name: normalized.awayTeamName,
            home_team_crest: normalized.homeTeamCrest,
            away_team_crest: normalized.awayTeamCrest,
            home_score: normalized.homeScore,
            away_score: normalized.awayScore,
            winner: normalized.winner,
            duration: normalized.duration,
            last_updated_from_api: new Date().toISOString(),
            raw_api_payload: normalized.rawApiPayload as any,
          },
          { onConflict: 'external_api_id' },
        );

      if (error) {
        errors.push(`Match ${apiMatch.id}: ${error.message}`);
      } else {
        matchesSynced++;
      }
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return { matchesSynced, teamsSynced, errors };
}

/**
 * Sincroniza solo los partidos de hoy.
 * Llama cada 10-15 minutos (cron job sync-today-matches).
 */
export async function syncTodayMatchesFromFootballData(): Promise<SyncResult> {
  const errors: string[] = [];
  let matchesSynced = 0;

  try {
    const matchesResponse = await fetchTodayMatchesFromApi();

    for (const apiMatch of matchesResponse.matches) {
      const normalized = normalizeFootballDataMatch(apiMatch);

      const { error } = await supabase()
        .from('matches')
        .update({
          status: normalized.status,
          home_score: normalized.homeScore,
          away_score: normalized.awayScore,
          winner: normalized.winner,
          duration: normalized.duration,
          last_updated_from_api: new Date().toISOString(),
          raw_api_payload: normalized.rawApiPayload as any,
        })
        .eq('external_api_id', normalized.externalApiId);

      if (error) {
        errors.push(`Match ${apiMatch.id}: ${error.message}`);
      } else {
        matchesSynced++;
      }
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return { matchesSynced, teamsSynced: 0, errors };
}

/**
 * Sincroniza las tablas de posiciones de grupos del Mundial.
 */
export async function syncStandingsFromFootballData(): Promise<SyncResult> {
  const errors: string[] = [];
  let standingsSynced = 0;

  try {
    const response = await getCompetitionStandings();
    const seasonYear = response.season
      ? new Date(response.season.startDate).getFullYear()
      : new Date().getFullYear();

    for (const standingTable of response.standings) {
      if (standingTable.type !== 'TOTAL') continue; // Solo tabla general

      for (const entry of standingTable.table) {
        const normalized = normalizeStanding(entry, standingTable.group);

        // Buscar team_id si existe
        const { data: teamData } = await supabase()
          .from('teams')
          .select('id')
          .eq('external_api_id', normalized.externalTeamId)
          .single();

        const { error } = await supabase()
          .from('standings')
          .upsert(
            {
              competition_code: 'WC',
              season_year: seasonYear,
              group_name: normalized.groupName,
              team_id: teamData?.id ?? null,
              team_name: normalized.teamName,
              team_crest: normalized.teamCrest,
              position: normalized.position,
              played_games: normalized.playedGames,
              won: normalized.won,
              draw: normalized.draw,
              lost: normalized.lost,
              goals_for: normalized.goalsFor,
              goals_against: normalized.goalsAgainst,
              goal_difference: normalized.goalDifference,
              points: normalized.points,
              last_updated_from_api: new Date().toISOString(),
            },
            { onConflict: 'competition_code,season_year,group_name,team_name' },
          );

        if (error) {
          errors.push(`Standing ${entry.team.name}: ${error.message}`);
        } else {
          standingsSynced++;
        }
      }
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return { matchesSynced: 0, teamsSynced: 0, errors };
}

/**
 * Actualiza un resultado de partido manualmente (admin).
 */
export async function updateMatchManually(
  matchId: string,
  homeScore: number,
  awayScore: number,
  status: string,
  adminUserId: string,
  reason?: string,
): Promise<void> {
  const sb = supabase();

  // Obtener estado anterior
  const { data: prev } = await sb
    .from('matches')
    .select('home_score, away_score, status')
    .eq('id', matchId)
    .single();

  // Calcular winner
  let winner: string | null = null;
  if (status === 'finished') {
    if (homeScore > awayScore) winner = 'home';
    else if (awayScore > homeScore) winner = 'away';
    else winner = 'draw';
  }

  // Actualizar partido
  const { error } = await sb
    .from('matches')
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status: status as Match['status'],
      winner,
      manually_updated: true,
      manually_updated_by: adminUserId,
      manually_updated_at: new Date().toISOString(),
    })
    .eq('id', matchId);

  if (error) throw new Error(`updateMatchManually: ${error.message}`);

  // Registrar cambio en auditoría
  await sb.from('manual_match_updates').insert({
    match_id: matchId,
    updated_by: adminUserId,
    previous_home_score: prev?.home_score ?? null,
    previous_away_score: prev?.away_score ?? null,
    previous_status: (prev?.status as Match['status']) ?? null,
    new_home_score: homeScore,
    new_away_score: awayScore,
    new_status: status as Match['status'],
    reason: reason ?? null,
  });
}

/**
 * Obtiene la tabla de posiciones de grupos del Mundial.
 */
export async function getWorldCupStandings(): Promise<WorldCupStanding[]> {
  const { data, error } = await supabase()
    .from('standings')
    .select('*')
    .order('group_name', { ascending: true })
    .order('position', { ascending: true });

  if (error) throw new Error(`getWorldCupStandings: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    groupName: row.group_name ?? '',
    teamId: row.team_id,
    teamName: row.team_name,
    teamCrest: row.team_crest,
    position: row.position,
    playedGames: row.played_games,
    won: row.won,
    draw: row.draw,
    lost: row.lost,
    goalsFor: row.goals_for,
    goalsAgainst: row.goals_against,
    goalDifference: row.goal_difference,
    points: row.points,
    lastUpdatedFromApi: row.last_updated_from_api,
  }));
}
