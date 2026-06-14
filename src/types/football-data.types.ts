// =============================================================
// football-data.types.ts
// Tipos que refleja la estructura de la API de football-data.org
// Se usan SOLO en el servidor (normalizers, services, cron jobs)
// =============================================================

export interface FDCompetition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

export interface FDSeason {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number | null;
  winner: FDTeam | null;
}

export interface FDTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address?: string;
  website?: string;
  founded?: number;
  clubColors?: string;
  venue?: string;
  runningCompetitions?: FDCompetition[];
}

export interface FDScore {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT';
  fullTime: {
    home: number | null;
    away: number | null;
  };
  halfTime: {
    home: number | null;
    away: number | null;
  };
}

export interface FDReferee {
  id: number;
  name: string;
  type: string;
  nationality: string;
}

export interface FDMatch {
  id: number;
  utcDate: string;
  status:
    | 'SCHEDULED'
    | 'TIMED'
    | 'IN_PLAY'
    | 'PAUSED'
    | 'FINISHED'
    | 'POSTPONED'
    | 'SUSPENDED'
    | 'CANCELLED';
  matchday: number | null;
  stage:
    | 'GROUP_STAGE'
    | 'ROUND_OF_16'
    | 'QUARTER_FINALS'
    | 'SEMI_FINALS'
    | 'THIRD_PLACE'
    | 'FINAL';
  group: string | null;
  lastUpdated: string;
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: FDScore;
  referees: FDReferee[];
  competition: FDCompetition;
  season: FDSeason;
  odds?: {
    msg: string;
  };
}

export interface FDMatchesResponse {
  filters: {
    season?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string[];
    stage?: string;
    group?: string;
    competitions?: string;
  };
  resultSet: {
    count: number;
    competitions: string;
    first: string;
    last: string;
    played: number;
  };
  competition: FDCompetition;
  matches: FDMatch[];
}

export interface FDStandingEntry {
  position: number;
  team: FDTeam;
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface FDStandingTable {
  stage: string;
  type: 'TOTAL' | 'HOME' | 'AWAY';
  group: string | null;
  table: FDStandingEntry[];
}

export interface FDStandingsResponse {
  filters: {
    season: string;
  };
  competition: FDCompetition;
  season: FDSeason;
  standings: FDStandingTable[];
}

export interface FDTeamsResponse {
  count: number;
  filters: Record<string, string>;
  competition: FDCompetition;
  season: FDSeason;
  teams: FDTeam[];
}

export interface FDApiError {
  message: string;
  errorCode: number;
}
