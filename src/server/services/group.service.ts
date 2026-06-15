// =============================================================
// server/services/group.service.ts
// Servicio de grupos privados de pronósticos
// =============================================================

import { createClient, createServiceClient } from '@/lib/supabase/server';
import {
  generateInviteCode,
  buildInviteUrl,
  generateQRCodeDataURL,
} from '@/lib/qr/generator';
import type { Group, GroupMember } from '@/types/app.types';

// ---- Creación y gestión de grupos --------------------------

export async function createGroup(
  name: string,
  description: string | null,
  ownerId: string,
): Promise<Group> {
  const supabase = createServiceClient();

  // Generar código único (reintentar si hay colisión)
  let inviteCode = generateInviteCode();
  let attempts = 0;

  while (attempts < 5) {
    const { data: existing } = await supabase
      .from('groups')
      .select('id')
      .eq('invite_code', inviteCode)
      .single();

    if (!existing) break;
    inviteCode = generateInviteCode();
    attempts++;
  }

  const inviteUrl = buildInviteUrl(inviteCode);
  const qrCodeUrl = await generateQRCodeDataURL(inviteUrl);

  const { data, error } = await supabase
    .from('groups')
    .insert({
      name,
      description,
      owner_id: ownerId,
      invite_code: inviteCode,
      invite_url: inviteUrl,
      qr_code_url: qrCodeUrl,
    })
    .select()
    .single();

  if (error || !data) throw new Error(`createGroup: ${error?.message}`);

  // Agregar al owner como miembro con rol 'owner'
  const { error: memberError } = await supabase.from('group_members').insert({
    group_id: data.id,
    user_id: ownerId,
    role: 'owner',
  });

  if (memberError) {
    throw new Error(`No se pudo registrar como miembro del grupo: ${memberError.message}`);
  }

  return mapGroupRow(data);
}

export async function getGroupById(groupId: string): Promise<Group | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error || !data) return null;
  return mapGroupRow(data);
}

export async function getGroupByInviteCode(
  inviteCode: string,
): Promise<Group | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return mapGroupRow(data);
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      role,
      joined_at,
      group:groups (*)
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) throw new Error(`getUserGroups: ${error.message}`);

  return (data as any[] ?? [])
    .filter((row) => row.group !== null)
    .map((row) => {
      const g = mapGroupRow(row.group);
      g.currentUserRole = row.role;
      return g;
    });
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      profile:profiles (id, user_id, username, full_name, avatar_url)
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (error) throw new Error(`getGroupMembers: ${error.message}`);
  return (data ?? []) as unknown as GroupMember[];
}

// ---- Unirse a grupo ----------------------------------------

export async function joinGroupByCode(
  inviteCode: string,
  userId: string,
): Promise<Group> {
  const group = await getGroupByInviteCode(inviteCode);
  if (!group) throw new Error('Código de invitación inválido o grupo inactivo.');

  const supabase = createServiceClient();

  // Verificar si ya es miembro
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group.id)
    .eq('user_id', userId)
    .single();

  if (existing) {
    throw new Error('Ya eres miembro de este grupo.');
  }

  const { error } = await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: userId,
    role: 'member',
  });

  if (error) throw new Error(`joinGroup: ${error.message}`);
  return group;
}

// ---- Regenerar código de invitación ------------------------

export async function regenerateInviteCode(
  groupId: string,
  requestingUserId: string,
): Promise<string> {
  const supabase = createServiceClient();

  // Verificar que sea owner
  const { data: member } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', requestingUserId)
    .single();

  if (!member || member.role !== 'owner') {
    throw new Error('Solo el owner puede regenerar el código de invitación.');
  }

  const newCode = generateInviteCode();
  const newUrl = buildInviteUrl(newCode);
  const newQr = await generateQRCodeDataURL(newUrl);

  const { error } = await supabase
    .from('groups')
    .update({
      invite_code: newCode,
      invite_url: newUrl,
      qr_code_url: newQr,
    })
    .eq('id', groupId);

  if (error) throw new Error(`regenerateInviteCode: ${error.message}`);
  return newCode;
}

// ---- Expulsar miembro --------------------------------------

export async function removeMember(
  groupId: string,
  targetUserId: string,
  requestingUserId: string,
): Promise<void> {
  const supabase = createServiceClient();

  const { data: requestingMember } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', requestingUserId)
    .single();

  if (
    !requestingMember ||
    !['owner', 'admin'].includes(requestingMember.role)
  ) {
    throw new Error('No tienes permisos para expulsar miembros.');
  }

  // No se puede expulsar al owner
  const { data: targetMember } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', targetUserId)
    .single();

  if (targetMember?.role === 'owner') {
    throw new Error('No puedes expulsar al owner del grupo.');
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', targetUserId);

  if (error) throw new Error(`removeMember: ${error.message}`);
}

// ---- Ranking del grupo -------------------------------------

export async function getGroupRanking(groupId: string) {
  const supabase = createServiceClient();

  const { data: members } = await supabase
    .from('group_members')
    .select(`
      user_id,
      joined_at,
      profile:profiles (username, full_name, avatar_url)
    `)
    .eq('group_id', groupId);

  if (!members) return [];

  const ranking = await Promise.all(
    (members as any[]).map(async (member) => {
      const { data: stats } = await supabase
        .from('predictions')
        .select(
          'points_awarded, exact_score_hit, result_hit, goal_difference_hit',
        )
        .eq('user_id', member.user_id)
        .eq('group_id', groupId);

      const predictions = (stats as any[]) ?? [];
      const totalPoints = predictions.reduce(
        (sum, p) => sum + (p.points_awarded ?? 0),
        0,
      );
      const exactScores = predictions.filter((p) => p.exact_score_hit).length;
      const correctResults = predictions.filter((p) => p.result_hit).length;
      const goalDifferenceHits = predictions.filter(
        (p) => p.goal_difference_hit && !p.exact_score_hit,
      ).length;
      const incorrectPredictions = predictions.filter(
        (p) => !p.result_hit,
      ).length;

      const profile = member.profile as {
        username: string;
        full_name: string | null;
        avatar_url: string | null;
      } | null;

      return {
        userId: member.user_id,
        username: profile?.username ?? 'Usuario',
        fullName: profile?.full_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        totalPoints,
        predictionsCount: predictions.length,
        exactScores,
        correctResults,
        goalDifferenceHits,
        incorrectPredictions,
        joinedAt: member.joined_at,
      };
    }),
  );

  // Ordenar por reglas de desempate
  return ranking.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores;
    if (b.correctResults !== a.correctResults)
      return b.correctResults - a.correctResults;
    if (b.goalDifferenceHits !== a.goalDifferenceHits)
      return b.goalDifferenceHits - a.goalDifferenceHits;
    if (b.predictionsCount !== a.predictionsCount)
      return b.predictionsCount - a.predictionsCount;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  }).map((entry, index) => ({ ...entry, position: index + 1 }));
}

// ---- Mapper ------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGroupRow(row: any): Group {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    imageUrl: row.image_url ?? null,
    ownerId: row.owner_id,
    inviteCode: row.invite_code,
    inviteUrl: row.invite_url ?? null,
    qrCodeUrl: row.qr_code_url ?? null,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
