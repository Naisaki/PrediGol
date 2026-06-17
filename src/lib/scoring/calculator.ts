// =============================================================
// lib/scoring/calculator.ts
// Sistema de puntuación de pronósticos
// =============================================================

export interface PredictionScore {
  points: number;
  exactScoreHit: boolean;
  resultHit: boolean;
  goalDifferenceHit: boolean;
}

export interface ScoringConfig {
  EXACT_SCORE: number;
  CORRECT_RESULT: number;
  GOAL_DIFFERENCE_BONUS: number;
}

/**
 * Configuración por defecto.
 */
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  EXACT_SCORE: 5,
  CORRECT_RESULT: 3,
  GOAL_DIFFERENCE_BONUS: 1,
} as const;

/**
 * Calcula los puntos de un pronóstico dado el resultado real.
 * 
 * @param predictedHome - Goles predichos del equipo local
 * @param predictedAway - Goles predichos del equipo visitante
 * @param realHome - Goles reales del equipo local
 * @param realAway - Goles reales del equipo visitante
 * @param config - Configuración de puntuación (usa la por defecto si no se proporciona)
 */
export function calculatePredictionPoints(
  predictedHome: number | string,
  predictedAway: number | string,
  realHome: number | string,
  realAway: number | string,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): PredictionScore {
  const pHome = Number(predictedHome);
  const pAway = Number(predictedAway);
  const rHome = Number(realHome);
  const rAway = Number(realAway);

  // --- Marcador exacto ---
  if (pHome === rHome && pAway === rAway) {
    return {
      points: config.EXACT_SCORE,
      exactScoreHit: true,
      resultHit: true,
      goalDifferenceHit: true,
    };
  }

  // --- Determinar resultado (ganador o empate) ---
  const realResult = getMatchResult(rHome, rAway);
  const predResult = getMatchResult(pHome, pAway);

  if (realResult === predResult) {
    // Acertó el resultado — calcular bonus de diferencia de goles
    const realDiff = Math.abs(rHome - rAway);
    const predDiff = Math.abs(pHome - pAway);
    const goalDifferenceHit = realDiff === predDiff;

    const points =
      config.CORRECT_RESULT +
      (goalDifferenceHit ? config.GOAL_DIFFERENCE_BONUS : 0);

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
export function formatPointsBreakdown(score: PredictionScore, config: ScoringConfig = DEFAULT_SCORING_CONFIG): string {
  if (score.exactScoreHit) return `🎯 Marcador exacto (+${config.EXACT_SCORE} pts)`;
  if (score.resultHit && score.goalDifferenceHit)
    return `✅ Resultado + diferencia (+${config.CORRECT_RESULT + config.GOAL_DIFFERENCE_BONUS} pts)`;
  if (score.resultHit) return `✅ Resultado correcto (+${config.CORRECT_RESULT} pts)`;
  return '❌ Sin puntos';
}
