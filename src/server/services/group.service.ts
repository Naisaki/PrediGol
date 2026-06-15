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
  const supabase = createServiceClient();
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
      group:groups (
        *,
        members:group_members(count)
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) throw new Error(`getUserGroups: ${error.message}`);

  return (data as any[] ?? [])
    .filter((row) => row.group !== null)
    .map((row) => {
      const g = mapGroupRow(row.group);
      g.currentUserRole = row.role;
      // Extraemos el conteo de la respuesta agregada de Supabase
      const countData = row.group.members;
      g.memberCount = Array.isArray(countData) && countData[0] ? countData[0].count : 0;
      return g;
    });
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const supabase = createServiceClient();
  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (membersError) throw new Error(`getGroupMembers: ${membersError.message}`);
  if (!members || members.length === 0) return [];

  const userIds = members.map((m) => m.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, user_id, username, full_name, avatar_url')
    .in('user_id', userIds);

  if (profilesError) throw new Error(`getGroupMembers profiles: ${profilesError.message}`);

  const profilesMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

  return members.map((m) => {
    const profile = profilesMap.get(m.user_id);
    return mapGroupMemberRow({
      ...m,
      profile,
    });
  });
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

  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('user_id, joined_at')
    .eq('group_id', groupId);

  if (membersError) throw new Error(`getGroupRanking members: ${membersError.message}`);
  if (!members || members.length === 0) return [];

  const userIds = members.map((m) => m.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, username, full_name, avatar_url')
    .in('user_id', userIds);

  if (profilesError) throw new Error(`getGroupRanking profiles: ${profilesError.message}`);

  const profilesMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

  const ranking = await Promise.all(
    members.map(async (member) => {
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

      const profile = profilesMap.get(member.user_id);

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
    welcomeMessage: row.welcome_message ?? null,
    joinApproval: row.join_approval ?? false,
    joinsOpen: row.joins_open ?? true,
    maxMembers: row.max_members ?? null,
    scoringExactScore: row.scoring_exact_score ?? 5,
    scoringCorrectResult: row.scoring_correct_result ?? 3,
    scoringGoalDiff: row.scoring_goal_diff ?? 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGroupMemberRow(row: any): GroupMember {
  return {
    id: row.id,
    groupId: row.group_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
    profile: row.profile ? {
      id: row.profile.id,
      userId: row.profile.user_id,
      username: row.profile.username,
      fullName: row.profile.full_name ?? null,
      avatarUrl: row.profile.avatar_url ?? null,
      createdAt: row.profile.created_at || new Date().toISOString(),
      updatedAt: row.profile.updated_at || new Date().toISOString(),
    } : undefined,
  };
}

// ---- Configuración del grupo (solo owner) ------------------

export async function updateGroupInfo(
  groupId: string,
  requestingUserId: string,
  data: { name: string; description: string | null; imageUrl: string | null },
): Promise<void> {
  const supabase = createServiceClient();
  await assertOwner(supabase, groupId, requestingUserId);
  const { error } = await supabase
    .from('groups')
    .update({ name: data.name, description: data.description, image_url: data.imageUrl, updated_at: new Date().toISOString() })
    .eq('id', groupId);
  if (error) throw new Error(`updateGroupInfo: ${error.message}`);
}

export async function updateGroupSettings(
  groupId: string,
  requestingUserId: string,
  data: { welcomeMessage: string | null; joinsOpen: boolean; joinApproval: boolean; maxMembers: number | null },
): Promise<void> {
  const supabase = createServiceClient();
  await assertOwner(supabase, groupId, requestingUserId);
  const { error } = await supabase
    .from('groups')
    .update({
      welcome_message: data.welcomeMessage,
      joins_open: data.joinsOpen,
      join_approval: data.joinApproval,
      max_members: data.maxMembers,
      updated_at: new Date().toISOString(),
    })
    .eq('id', groupId);
  if (error) throw new Error(`updateGroupSettings: ${error.message}`);
}

export async function updateScoringRules(
  groupId: string,
  requestingUserId: string,
  data: { exactScore: number; correctResult: number; goalDiff: number },
): Promise<void> {
  const supabase = createServiceClient();
  await assertOwner(supabase, groupId, requestingUserId);
  const { error } = await supabase
    .from('groups')
    .update({
      scoring_exact_score: data.exactScore,
      scoring_correct_result: data.correctResult,
      scoring_goal_diff: data.goalDiff,
      updated_at: new Date().toISOString(),
    })
    .eq('id', groupId);
  if (error) throw new Error(`updateScoringRules: ${error.message}`);
}

export async function updateMemberRole(
  groupId: string,
  requestingUserId: string,
  targetUserId: string,
  newRole: 'admin' | 'member',
): Promise<void> {
  const supabase = createServiceClient();
  await assertOwner(supabase, groupId, requestingUserId);
  if (targetUserId === requestingUserId) throw new Error('No puedes cambiar tu propio rol.');
  const { error } = await supabase
    .from('group_members')
    .update({ role: newRole })
    .eq('group_id', groupId)
    .eq('user_id', targetUserId)
    .neq('role', 'owner');
  if (error) throw new Error(`updateMemberRole: ${error.message}`);
}

export async function transferOwnership(
  groupId: string,
  currentOwnerId: string,
  newOwnerId: string,
): Promise<void> {
  const supabase = createServiceClient();
  await assertOwner(supabase, groupId, currentOwnerId);
  if (newOwnerId === currentOwnerId) throw new Error('Ya eres el owner del grupo.');

  // Verificar que el nuevo owner es miembro
  const { data: targetMember } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', newOwnerId)
    .single();
  if (!targetMember) throw new Error('El nuevo owner debe ser miembro del grupo.');

  // Transferencia atómica: nuevo owner + degradar anterior a admin
  const [r1, r2, r3] = await Promise.all([
    supabase.from('group_members').update({ role: 'owner' }).eq('group_id', groupId).eq('user_id', newOwnerId),
    supabase.from('group_members').update({ role: 'admin' }).eq('group_id', groupId).eq('user_id', currentOwnerId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from('groups').update({ owner_id: newOwnerId, updated_at: new Date().toISOString() } as any).eq('id', groupId),
  ]);
  if (r1.error) throw new Error(`transferOwnership (new): ${r1.error.message}`);
  if (r2.error) throw new Error(`transferOwnership (old): ${r2.error.message}`);
  if (r3.error) throw new Error(`transferOwnership (groups): ${r3.error.message}`);
}

export async function closeGroup(
  groupId: string,
  requestingUserId: string,
): Promise<void> {
  const supabase = createServiceClient();
  await assertOwner(supabase, groupId, requestingUserId);
  const { error } = await supabase
    .from('groups')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', groupId);
  if (error) throw new Error(`closeGroup: ${error.message}`);
}

export async function deleteGroup(
  groupId: string,
  requestingUserId: string,
): Promise<void> {
  const supabase = createServiceClient();
  await assertOwner(supabase, groupId, requestingUserId);
  const { error } = await supabase.from('groups').delete().eq('id', groupId);
  if (error) throw new Error(`deleteGroup: ${error.message}`);
}

export async function getGroupStats(groupId: string): Promise<import('@/types/app.types').GroupStats> {
  const supabase = createServiceClient();

  const [{ data: members }, { data: predictions }, { data: matches }, { data: group }] = await Promise.all([
    supabase.from('group_members').select('user_id, joined_at').eq('group_id', groupId),
    supabase.from('predictions').select('user_id, match_id').eq('group_id', groupId),
    supabase.from('matches').select('id, home_team_name, away_team_name').in('status', ['scheduled','timed','in_play','paused','finished']),
    supabase.from('groups').select('created_at').eq('id', groupId).single(),
  ]);

  const membersList = members ?? [];
  const predsList = predictions ?? [];
  const matchesList = matches ?? [];
  const totalMatches = matchesList.length;
  const totalPredictions = predsList.length;

  // Perfiles en lote
  const userIds = membersList.map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, username, avatar_url')
    .in('user_id', userIds);
  const profilesMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

  // Stats por miembro
  const memberStats = membersList.map((m) => {
    const count = predsList.filter((p) => p.user_id === m.user_id).length;
    const profile = profilesMap.get(m.user_id);
    return {
      userId: m.user_id,
      username: profile?.username ?? 'Usuario',
      avatarUrl: profile?.avatar_url ?? null,
      predictionsCount: count,
      participationPct: totalMatches > 0 ? Math.round((count / totalMatches) * 100) : 0,
    };
  }).sort((a, b) => b.predictionsCount - a.predictionsCount);

  // Top matches con más predicciones
  const matchCountMap = new Map<string, number>();
  for (const p of predsList) {
    matchCountMap.set(p.match_id, (matchCountMap.get(p.match_id) ?? 0) + 1);
  }
  const topMatches = matchesList
    .map((m) => ({ matchId: m.id, homeTeamName: m.home_team_name, awayTeamName: m.away_team_name, predictionsCount: matchCountMap.get(m.id) ?? 0 }))
    .filter((m) => m.predictionsCount > 0)
    .sort((a, b) => b.predictionsCount - a.predictionsCount)
    .slice(0, 3);

  const createdAt = group?.created_at ?? new Date().toISOString();
  const daysActive = Math.max(1, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000));
  const participationRate = totalMatches > 0 && membersList.length > 0
    ? Math.round((totalPredictions / (totalMatches * membersList.length)) * 100)
    : 0;

  return { totalPredictions, totalMatches, participationRate, memberStats, topMatches, daysActive, createdAt };
}

// ---- Helper interno: verificar que el usuario es owner -----

async function assertOwner(supabase: ReturnType<typeof createServiceClient>, groupId: string, userId: string) {
  const { data: member } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();
  if (!member || member.role !== 'owner') {
    throw new Error('Solo el owner del grupo puede realizar esta acción.');
  }
}
