'use server';
// =============================================================
// server/actions/groups.ts
// Server Actions para gestión de grupos
// =============================================================

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  createGroup,
  joinGroupByCode,
  regenerateInviteCode,
  removeMember,
} from '@/server/services/group.service';
import { z } from 'zod';

const createGroupSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar 50 caracteres'),
  description: z.string().max(200, 'La descripción no puede superar 200 caracteres').optional(),
});

export type GroupActionResult = {
  success: boolean;
  error?: string;
  data?: { groupId?: string; inviteCode?: string };
};

// ---- Crear grupo -------------------------------------------

export async function createGroupAction(
  name: string,
  description?: string,
): Promise<GroupActionResult> {
  const validation = createGroupSchema.safeParse({ name, description });
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Debes iniciar sesión.' };

  try {
    const group = await createGroup(name, description ?? null, user.id);
    revalidatePath('/groups');
    return { success: true, data: { groupId: group.id } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al crear grupo',
    };
  }
}

// ---- Unirse a grupo ----------------------------------------

export async function joinGroupAction(
  inviteCode: string,
): Promise<GroupActionResult> {
  if (!inviteCode || inviteCode.length < 6) {
    return { success: false, error: 'Código de invitación inválido' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Debes iniciar sesión.' };

  try {
    const group = await joinGroupByCode(inviteCode.toUpperCase(), user.id);
    revalidatePath('/groups');
    return { success: true, data: { groupId: group.id } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al unirse al grupo',
    };
  }
}

// ---- Regenerar código de invitación ------------------------

export async function regenerateInviteCodeAction(
  groupId: string,
): Promise<GroupActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'No autenticado' };

  try {
    const newCode = await regenerateInviteCode(groupId, user.id);
    revalidatePath(`/groups/${groupId}`);
    return { success: true, data: { inviteCode: newCode } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al regenerar código',
    };
  }
}

// ---- Expulsar miembro --------------------------------------

export async function removeMemberAction(
  groupId: string,
  targetUserId: string,
): Promise<GroupActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'No autenticado' };

  try {
    await removeMember(groupId, targetUserId, user.id);
    revalidatePath(`/groups/${groupId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al expulsar miembro',
    };
  }
}
