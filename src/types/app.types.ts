// =============================================================
// app.types.ts
// Tipos de dominio de la aplicación (independientes de la DB)
// =============================================================

// ---- Autenticación & Perfil --------------------------------

export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GlobalRole = 'user' | 'platform_admin';

// ---- Grupos ------------------------------------------------

export type GroupMemberRole = 'owner' | 'admin' | 'member';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  ownerId: string;
  inviteCode: string;
  inviteUrl: string | null;
  qrCodeUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Configuración del grupo
  welcomeMessage?: string | null;
  joinApproval?: boolean;
  joinsOpen?: boolean;
  maxMembers?: number | null;
  scoringExactScore?: number;
  scoringCorrectResult?: number;
  scoringGoalDiff?: number;
  // Relaciones opcionales (joined)
  memberCount?: number;
  currentUserRole?: GroupMemberRole;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  joinedAt: string;
  // Relaciones opcionales
  profile?: UserProfile;
}

// ---- Partidos ----------------------------------------------

export type MatchStatus =
  | 'scheduled'
  | 'timed'
  | 'in_play'
  | 'paused'
  | 'finished'
  | 'postponed'
  | 'suspended'
  | 'cancelled';

export type MatchStage =
  | 'GROUP_STAGE'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL';

export interface Team {
  id: string;
  externalApiId: number;
  name: string;
  shortName: string | null;
  tla: string | null;
  crestUrl: string | null;
  country: string | null;
}

export interface Match {
  id: string;
  externalApiId: number;
  competitionCode: string;
  competitionName: string | null;
  seasonYear: number | null;
  utcDate: string;
  kickoffTime: string;
  status: MatchStatus;
  matchday: number | null;
  stage: MatchStage | null;
  groupName: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeamName: string | null;
  awayTeamName: string | null;
  homeTeamCrest: string | null;
  awayTeamCrest: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
  duration: string | null;
  lastUpdatedFromApi: string | null;
  manuallyUpdated: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Pronósticos -------------------------------------------

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  groupId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsAwarded: number;
  exactScoreHit: boolean;
  resultHit: boolean;
  goalDifferenceHit: boolean;
  isLocked: boolean;
  lockedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales
  match?: Match;
  profile?: UserProfile;
}

// ---- Ranking -----------------------------------------------

export interface RankingEntry {
  position: number;
  userId: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  totalPoints: number;
  predictionsCount: number;
  exactScores: number;
  correctResults: number;
  goalDifferenceHits: number;
  incorrectPredictions: number;
  joinedAt: string;
}

// ---- Grupos del Mundial ------------------------------------

export interface WorldCupStanding {
  id: string;
  groupName: string;
  teamId: string | null;
  teamName: string;
  teamCrest: string | null;
  position: number;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  lastUpdatedFromApi: string | null;
}

// ---- Brackets ----------------------------------------------

export interface BracketMatch {
  id: string;
  stage: MatchStage;
  homeTeamName: string | null;
  awayTeamName: string | null;
  homeTeamCrest: string | null;
  awayTeamCrest: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  kickoffTime: string;
  winner: string | null;
}

export type BracketRound = {
  name: string;
  stage: MatchStage;
  matches: BracketMatch[];
};

// ---- Sincronización ----------------------------------------

export type SyncType =
  | 'fixtures'
  | 'today_matches'
  | 'standings'
  | 'lock_predictions'
  | 'recalculate_points';

export type SyncStatus = 'success' | 'error' | 'partial';

export interface SyncLog {
  id: string;
  syncType: SyncType;
  status: SyncStatus;
  matchesSynced: number;
  teamsSynced: number;
  standingsSynced: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  triggeredBy: string;
}

export interface ApiRequestLog {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
  requestedAt: string;
}

// ---- Scoring -----------------------------------------------

export interface PredictionScore {
  points: number;
  exactScoreHit: boolean;
  resultHit: boolean;
  goalDifferenceHit: boolean;
}

// ---- Estadísticas del Grupo --------------------------------

export interface GroupMemberStat {
  userId: string;
  username: string;
  avatarUrl: string | null;
  predictionsCount: number;
  participationPct: number;
}

export interface GroupTopMatch {
  matchId: string;
  homeTeamName: string | null;
  awayTeamName: string | null;
  predictionsCount: number;
}

export interface GroupStats {
  totalPredictions: number;
  totalMatches: number;
  participationRate: number;
  memberStats: GroupMemberStat[];
  topMatches: GroupTopMatch[];
  daysActive: number;
  createdAt: string;
}

// ---- UI Helpers --------------------------------------------

export type MatchStatusBadgeVariant =
  | 'scheduled'
  | 'live'
  | 'finished'
  | 'postponed'
  | 'cancelled';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
