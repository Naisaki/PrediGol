'use server';
// =============================================================
// server/actions/groups.ts
// Server Actions para gestión de grupos
// =============================================================

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import {
  createGroup,
  joinGroupByCode,
  regenerateInviteCode,
  removeMember,
  updateGroupInfo,
  updateGroupSettings,
  updateScoringRules,
  updateMemberRole,
  transferOwnership,
  closeGroup,
  deleteGroup,
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

  const { userId } = await auth();

  if (!userId) return { success: false, error: 'Debes iniciar sesión.' };

  try {
    const group = await createGroup(name, description ?? null, userId);
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

  const { userId } = await auth();

  if (!userId) return { success: false, error: 'Debes iniciar sesión.' };

  try {
    const group = await joinGroupByCode(inviteCode.toUpperCase(), userId);
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
  const { userId } = await auth();

  if (!userId) return { success: false, error: 'No autenticado' };

  try {
    const newCode = await regenerateInviteCode(groupId, userId);
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
  const { userId } = await auth();

  if (!userId) return { success: false, error: 'No autenticado' };

  try {
    await removeMember(groupId, targetUserId, userId);
    revalidatePath(`/groups/${groupId}`);
    revalidatePath(`/groups/${groupId}/settings/participants`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al expulsar miembro',
    };
  }
}

// ---- Settings: Información General -------------------------

export async function updateGroupInfoAction(
  groupId: string,
  name: string,
  description: string | null,
  imageUrl: string | null,
): Promise<GroupActionResult> {
  const validation = z.object({
    name: z.string().min(2).max(50),
    description: z.string().max(200).nullable().optional(),
  }).safeParse({ name, description });
  if (!validation.success) return { success: false, error: validation.error.errors[0].message };

  const { userId } = await auth();
  if (!userId) return { success: false, error: 'No autenticado' };

  try {
    await updateGroupInfo(groupId, userId, { name, description, imageUrl });
    revalidatePath(`/groups/${groupId}`);
    revalidatePath(`/groups/${groupId}/settings/general`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al actualizar grupo' };
  }
}

// ---- Settings: Configuración de Invitaciones ---------------

export async function updateGroupSettingsAction(
  groupId: string,
  settings: { welcomeMessage: string | null; joinsOpen: boolean; joinApproval: boolean; maxMembers: number | null },
): Promise<GroupActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'No autenticado' };

  try {
    await updateGroupSettings(groupId, userId, settings);
    revalidatePath(`/groups/${groupId}/settings/invitations`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al actualizar configuración' };
  }
}

// ---- Settings: Reglas de Puntuación -------------------------

export async function updateScoringRulesAction(
  groupId: string,
  exactScore: number,
  correctResult: number,
  goalDiff: number,
): Promise<GroupActionResult> {
  const validation = z.object({
    exactScore: z.number().int().min(1).max(10),
    correctResult: z.number().int().min(1).max(8),
    goalDiff: z.number().int().min(0).max(3),
  }).safeParse({ exactScore, correctResult, goalDiff });
  if (!validation.success) return { success: false, error: validation.error.errors[0].message };

  const { userId } = await auth();
  if (!userId) return { success: false, error: 'No autenticado' };

  try {
    await updateScoringRules(groupId, userId, { exactScore, correctResult, goalDiff });
    revalidatePath(`/groups/${groupId}/settings/scoring`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al actualizar reglas' };
  }
}

// ---- Settings: Cambiar rol de miembro ----------------------

export async function updateMemberRoleAction(
  groupId: string,
  targetUserId: string,
  newRole: 'admin' | 'member',
): Promise<GroupActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'No autenticado' };

  try {
    await updateMemberRole(groupId, userId, targetUserId, newRole);
    revalidatePath(`/groups/${groupId}/settings/participants`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al cambiar rol' };
  }
}

// ---- Settings: Transferir propiedad ------------------------

export async function transferOwnershipAction(
  groupId: string,
  newOwnerId: string,
): Promise<GroupActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'No autenticado' };

  try {
    await transferOwnership(groupId, userId, newOwnerId);
    revalidatePath(`/groups/${groupId}`);
    revalidatePath(`/groups/${groupId}/settings`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al transferir propiedad' };
  }
}

// ---- Settings: Cerrar grupo --------------------------------

export async function closeGroupAction(
  groupId: string,
): Promise<GroupActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'No autenticado' };

  try {
    await closeGroup(groupId, userId);
    revalidatePath(`/groups`);
    revalidatePath(`/groups/${groupId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al cerrar grupo' };
  }
}

// ---- Settings: Eliminar grupo ------------------------------

export async function deleteGroupAction(
  groupId: string,
): Promise<GroupActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'No autenticado' };

  try {
    await deleteGroup(groupId, userId);
    revalidatePath(`/groups`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al eliminar grupo' };
  }
}
