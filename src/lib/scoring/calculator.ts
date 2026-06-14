// =============================================================
// lib/scoring/calculator.ts
// Sistema de puntuación de pronósticos
// Modifica SCORING_CONFIG para ajustar los puntos sin tocar la lógica
// =============================================================

export interface PredictionScore {
  points: number;
  exactScoreHit: boolean;
  resultHit: boolean;
  goalDifferenceHit: boolean;
}

/**
 * Configuración centralizada del sistema de puntuación.
 * Edita estos valores para cambiar las reglas del juego.
 */
export const SCORING_CONFIG = {
  /** Puntos por marcador exacto (ej: predice 2-1, resultado 2-1) */
  EXACT_SCORE: 5,
  /** Puntos por acertar el resultado sin marcador exacto (ej: predice 1-0, resultado 2-1) */
  CORRECT_RESULT: 3,
  /** Puntos extra por acertar la diferencia de goles (bonus opcional) */
  GOAL_DIFFERENCE_BONUS: 1,
} as const;

/**
 * Calcula los puntos de un pronóstico dado el resultado real.
 *
 * Reglas:
 * 1. Marcador exacto → EXACT_SCORE (5 pts) — incluye resultado y diferencia
 * 2. Resultado correcto (mismo ganador o empate) → CORRECT_RESULT (3 pts)
 *    + bonus si diferencia de goles coincide → GOAL_DIFFERENCE_BONUS (1 pt)
 * 3. Pronóstico incorrecto → 0 pts
 *
 * @param predictedHome - Goles predichos del equipo local
 * @param predictedAway - Goles predichos del equipo visitante
 * @param realHome - Goles reales del equipo local
 * @param realAway - Goles reales del equipo visitante
 */
export function calculatePredictionPoints(
  predictedHome: number,
  predictedAway: number,
  realHome: number,
  realAway: number,
): PredictionScore {
  // --- Marcador exacto ---
  if (predictedHome === realHome && predictedAway === realAway) {
    return {
      points: SCORING_CONFIG.EXACT_SCORE,
      exactScoreHit: true,
      resultHit: true,
      goalDifferenceHit: true,
    };
  }

  // --- Determinar resultado (ganador o empate) ---
  const realResult = getMatchResult(realHome, realAway);
  const predResult = getMatchResult(predictedHome, predictedAway);

  if (realResult === predResult) {
    // Acertó el resultado — calcular bonus de diferencia de goles
    const realDiff = Math.abs(realHome - realAway);
    const predDiff = Math.abs(predictedHome - predictedAway);
    const goalDifferenceHit = realDiff === predDiff;

    const points =
      SCORING_CONFIG.CORRECT_RESULT +
      (goalDifferenceHit ? SCORING_CONFIG.GOAL_DIFFERENCE_BONUS : 0);

    return {
      points,
      exactScoreHit: false,
      resultHit: true,
      goalDifferenceHit,
    };
  }

  // --- Pronóstico incorrecto ---
  return {
    points: 0,
    exactScoreHit: false,
    resultHit: false,
    goalDifferenceHit: false,
  };
}

type MatchResult = 'home' | 'away' | 'draw';

function getMatchResult(home: number, away: number): MatchResult {
  if (home > away) return 'home';
  if (away > home) return 'away';
  return 'draw';
}

/**
 * Formatea el desglose de puntos de un pronóstico para mostrar en UI.
 */
export function formatPointsBreakdown(score: PredictionScore): string {
  if (score.exactScoreHit) return '🎯 Marcador exacto (+5 pts)';
  if (score.resultHit && score.goalDifferenceHit)
    return '✅ Resultado + diferencia (+4 pts)';
  if (score.resultHit) return '✅ Resultado correcto (+3 pts)';
  return '❌ Sin puntos';
}
