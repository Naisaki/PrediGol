'use server';
// =============================================================
// server/actions/predictions.ts
// Server Actions para pronósticos
// =============================================================

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getGroupMembers } from '@/server/services/group.service';
import { upsertPrediction } from '@/server/services/prediction.service';
import { z } from 'zod';

const predictionSchema = z.object({
  matchId: z.string().uuid('ID de partido inválido'),
  groupId: z.string().uuid('ID de grupo inválido'),
  homeScore: z
    .number()
    .int('Debe ser número entero')
    .min(0, 'Mínimo 0')
    .max(20, 'Máximo 20'),
  awayScore: z
    .number()
    .int('Debe ser número entero')
    .min(0, 'Mínimo 0')
    .max(20, 'Máximo 20'),
});

export type PredictionActionResult = {
  success: boolean;
  error?: string;
};

// ---- Guardar/actualizar pronóstico -------------------------

export async function savePredictionAction(
  matchId: string,
  groupId: string,
  homeScore: number,
  awayScore: number,
): Promise<PredictionActionResult> {
  const validation = predictionSchema.safeParse({
    matchId,
    groupId,
    homeScore,
    awayScore,
  });

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Debes iniciar sesión.' };

  // Verificar que el usuario sea miembro del grupo
  const members = await getGroupMembers(groupId);
  const currentMember = members.find((m) => m.userId === user.id);

  if (!currentMember) {
    return {
      success: false,
      error: 'No eres miembro de este grupo.',
    };
  }

  try {
    await upsertPrediction(user.id, matchId, groupId, homeScore, awayScore);
    revalidatePath(`/groups/${groupId}/predictions`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al guardar pronóstico',
    };
  }
}
