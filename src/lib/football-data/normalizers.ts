// =============================================================
// lib/football-data/normalizers.ts
// Funciones para convertir datos de football-data.org al formato
// interno de la app antes de guardar en Supabase.
// =============================================================

import type {
  FDMatch,
  FDTeam,
  FDStandingEntry,
} from '@/types/football-data.types';
import type { MatchStatus } from '@/types/app.types';

// ---- Match -------------------------------------------------

export interface NormalizedMatch {
  externalApiId: number;
  competitionId: number | null;
  competitionCode: string;
  competitionName: string | null;
  seasonId: number | null;
  seasonYear: number | null;
  utcDate: string;
  kickoffTime: string;
  status: MatchStatus;
  matchday: number | null;
  stage: string | null;
  groupName: string | null;
  homeTeamExternalId: number | null;
  awayTeamExternalId: number | null;
  homeTeamName: string | null;
  awayTeamName: string | null;
  homeTeamCrest: string | null;
  awayTeamCrest: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
  duration: string | null;
  rawApiPayload: FDMatch;
}

/**
 * Convierte un partido de football-data.org al formato interno de la app.
 * Llama esta función antes de hacer upsert en la tabla `matches`.
 */
export function normalizeFootballDataMatch(apiMatch: FDMatch): NormalizedMatch {
  return {
    externalApiId: apiMatch.id,
    competitionId: apiMatch.competition?.id ?? null,
    competitionCode: apiMatch.competition?.code ?? 'WC',
    competitionName: apiMatch.competition?.name ?? null,
    seasonId: apiMatch.season?.id ?? null,
    seasonYear: apiMatch.season
      ? new Date(apiMatch.season.startDate).getFullYear()
      : null,
    utcDate: apiMatch.utcDate,
    kickoffTime: apiMatch.utcDate, // football-data devuelve UTC, se guarda como kickoff_time
    status: normalizeMatchStatus(apiMatch.status),
    matchday: apiMatch.matchday ?? null,
    stage: apiMatch.stage ?? null,
    groupName: apiMatch.group ?? null,
    homeTeamExternalId: apiMatch.homeTeam?.id ?? null,
    awayTeamExternalId: apiMatch.awayTeam?.id ?? null,
    homeTeamName: apiMatch.homeTeam?.name ?? null,
    awayTeamName: apiMatch.awayTeam?.name ?? null,
    homeTeamCrest: apiMatch.homeTeam?.crest ?? null,
    awayTeamCrest: apiMatch.awayTeam?.crest ?? null,
    homeScore: apiMatch.score?.fullTime?.home ?? null,
    awayScore: apiMatch.score?.fullTime?.away ?? null,
    winner: normalizeWinner(apiMatch.score?.winner ?? null),
    duration: apiMatch.score?.duration ?? null,
    rawApiPayload: apiMatch,
  };
}

// ---- Team --------------------------------------------------

export interface NormalizedTeam {
  externalApiId: number;
  name: string;
  shortName: string | null;
  tla: string | null;
  crestUrl: string | null;
  country: string | null;
}

/**
 * Convierte un equipo de football-data.org al formato interno.
 */
export function normalizeTeam(apiTeam: FDTeam): NormalizedTeam {
  return {
    externalApiId: apiTeam.id,
    name: apiTeam.name,
    shortName: apiTeam.shortName ?? null,
    tla: apiTeam.tla ?? null,
    crestUrl: apiTeam.crest ?? null,
    country: null, // No siempre disponible en free tier
  };
}

// ---- Standing ----------------------------------------------

export interface NormalizedStanding {
  externalTeamId: number;
  teamName: string;
  teamCrest: string | null;
  groupName: string | null;
  position: number;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

/**
 * Convierte una entrada de tabla de posiciones de football-data.org.
 */
export function normalizeStanding(
  entry: FDStandingEntry,
  groupName: string | null,
): NormalizedStanding {
  return {
    externalTeamId: entry.team.id,
    teamName: entry.team.name,
    teamCrest: entry.team.crest ?? null,
    groupName,
    position: entry.position,
    playedGames: entry.playedGames,
    won: entry.won,
    draw: entry.draw,
    lost: entry.lost,
    goalsFor: entry.goalsFor,
    goalsAgainst: entry.goalsAgainst,
    goalDifference: entry.goalDifference,
    points: entry.points,
  };
}

// ---- Status Normalization ----------------------------------

const STATUS_MAP: Record<string, MatchStatus> = {
  SCHEDULED: 'scheduled',
  TIMED: 'timed',
  IN_PLAY: 'in_play',
  PAUSED: 'paused',
  FINISHED: 'finished',
  POSTPONED: 'postponed',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
};

export function normalizeMatchStatus(apiStatus: string): MatchStatus {
  return STATUS_MAP[apiStatus.toUpperCase()] ?? 'scheduled';
}

const WINNER_MAP: Record<string, string> = {
  HOME_TEAM: 'home',
  AWAY_TEAM: 'away',
  DRAW: 'draw',
};

export function normalizeWinner(apiWinner: string | null): string | null {
  if (!apiWinner) return null;
  return WINNER_MAP[apiWinner] ?? apiWinner.toLowerCase();
}

// ---- Display Helpers ----------------------------------------

export function getMatchStatusLabel(status: MatchStatus): string {
  const labels: Record<MatchStatus, string> = {
    scheduled: 'Programado',
    timed: 'Programado',
    in_play: 'En curso',
    paused: 'Descanso',
    finished: 'Finalizado',
    postponed: 'Postpuesto',
    suspended: 'Suspendido',
    cancelled: 'Cancelado',
  };
  return labels[status] ?? status;
}

export function getStageLabel(stage: string | null): string {
  if (!stage) return '';
  const labels: Record<string, string> = {
    GROUP_STAGE: 'Fase de Grupos',
    ROUND_OF_16: 'Octavos de Final',
    QUARTER_FINALS: 'Cuartos de Final',
    SEMI_FINALS: 'Semifinales',
    THIRD_PLACE: 'Tercer Lugar',
    FINAL: 'Final',
  };
  return labels[stage] ?? stage;
}
