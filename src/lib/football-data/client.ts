// =============================================================
// lib/football-data/client.ts
// Cliente HTTP para football-data.org — SOLO SERVIDOR
// Nunca importar en componentes cliente ni en hooks de React
// =============================================================

import type {
  FDMatch,
  FDMatchesResponse,
  FDStandingsResponse,
  FDTeamsResponse,
  FDApiError,
} from '@/types/football-data.types';
import { createServiceClient } from '@/lib/supabase/server';

const BASE_URL =
  process.env.FOOTBALL_DATA_BASE_URL ?? 'https://api.football-data.org/v4';
const COMPETITION_CODE = process.env.FOOTBALL_DATA_COMPETITION_CODE ?? 'WC';
const API_TOKEN = process.env.FOOTBALL_DATA_API_TOKEN ?? '';

// Rate limit: el plan gratuito permite ~10 req/min
// Este delay simple evita ráfagas, no es un rate limiter de producción
const REQUEST_DELAY_MS = 6500;

let lastRequestTime = 0;

async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < REQUEST_DELAY_MS) {
    await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

export interface FootballDataRequestOptions {
  params?: Record<string, string>;
  /** Endpoint relativo, ej: '/competitions/WC/matches' */
  endpoint: string;
}

/**
 * Realiza una llamada a football-data.org y registra el intento en Supabase.
 * Solo se ejecuta en el servidor.
 */
export async function requestFootballData<T>(
  options: FootballDataRequestOptions,
): Promise<T> {
  if (!API_TOKEN) {
    throw new Error(
      'FOOTBALL_DATA_API_TOKEN no está configurado. Agrega el token en .env.local',
    );
  }

  await throttle();

  const url = new URL(`${BASE_URL}${options.endpoint}`);
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) =>
      url.searchParams.set(k, v),
    );
  }

  const startTime = Date.now();
  let statusCode: number | null = null;
  let errorMessage: string | null = null;

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-Auth-Token': API_TOKEN,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }, // Sin caché de Next.js — gestionamos caché en Supabase
    });

    statusCode = response.status;
    const responseTimeMs = Date.now() - startTime;

    // Registrar en logs (sin await para no bloquear)
    logApiRequest(options.endpoint, statusCode, responseTimeMs, null).catch(
      console.error,
    );

    if (response.status === 429) {
      throw new Error(
        'Rate limit alcanzado en football-data.org. Reintentando en el próximo ciclo.',
      );
    }

    if (response.status === 403) {
      throw new Error(
        'Acceso denegado a football-data.org. Verifica tu API token y el plan.',
      );
    }

    if (!response.ok) {
      const errBody = (await response.json().catch(() => ({}))) as FDApiError;
      throw new Error(
        errBody.message ?? `HTTP ${response.status} desde football-data.org`,
      );
    }

    return response.json() as Promise<T>;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err);
    const responseTimeMs = Date.now() - startTime;
    logApiRequest(options.endpoint, statusCode, responseTimeMs, errorMessage).catch(
      console.error,
    );
    throw err;
  }
}

// --- Helpers de logging ---

async function logApiRequest(
  endpoint: string,
  statusCode: number | null,
  responseTimeMs: number,
  errorMessage: string | null,
) {
  try {
    const supabase = createServiceClient();
    await supabase.from('api_request_logs').insert({
      endpoint,
      method: 'GET',
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      error_message: errorMessage,
    });
  } catch {
    // Log silencioso — no propagar errores de logging
  }
}

// --- Endpoints disponibles en el plan gratuito ---

/** Obtiene todos los partidos de la competición (fixture completo) */
export async function getCompetitionMatches(
  params?: Record<string, string>,
): Promise<FDMatchesResponse> {
  return requestFootballData<FDMatchesResponse>({
    endpoint: `/competitions/${COMPETITION_CODE}/matches`,
    params,
  });
}

/** Obtiene partidos de hoy de la competición */
export async function getTodayMatches(): Promise<FDMatchesResponse> {
  const today = new Date().toISOString().split('T')[0];
  return requestFootballData<FDMatchesResponse>({
    endpoint: `/competitions/${COMPETITION_CODE}/matches`,
    params: { dateFrom: today, dateTo: today },
  });
}

/** Obtiene tabla de posiciones de grupos */
export async function getCompetitionStandings(): Promise<FDStandingsResponse> {
  return requestFootballData<FDStandingsResponse>({
    endpoint: `/competitions/${COMPETITION_CODE}/standings`,
  });
}

/** Obtiene equipos de la competición */
export async function getCompetitionTeams(): Promise<FDTeamsResponse> {
  return requestFootballData<FDTeamsResponse>({
    endpoint: `/competitions/${COMPETITION_CODE}/teams`,
  });
}

/** Obtiene un partido específico por ID externo */
export async function getMatchById(externalId: number): Promise<FDMatch> {
  const res = await requestFootballData<{ match: FDMatch }>({
    endpoint: `/matches/${externalId}`,
  });
  return res.match;
}
