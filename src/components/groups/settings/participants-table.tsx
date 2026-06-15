'use client';
// =============================================================
// components/groups/settings/participants-table.tsx
// Tabla interactiva de gestión de participantes
// =============================================================

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Shield, UserX, Loader2, Search, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from './confirm-dialog';
import { updateMemberRoleAction, removeMemberAction } from '@/server/actions/groups';
import type { GroupMember } from '@/types/app.types';

interface ParticipantsTableProps {
  groupId: string;
  members: GroupMember[];
  currentUserId: string;
}

const roleBadgeMap = {
  owner: { label: 'Owner', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  admin: { label: 'Admin', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  member: { label: 'Miembro', className: 'bg-muted/40 text-muted-foreground border-border/30' },
};

export function ParticipantsTable({ groupId, members, currentUserId }: ParticipantsTableProps) {
  const [search, setSearch] = useState('');
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.profile?.username?.toLowerCase().includes(q) ||
      m.profile?.fullName?.toLowerCase().includes(q)
    );
  });

  const handleRoleChange = (member: GroupMember, newRole: 'admin' | 'member') => {
    setPendingRole(member.userId);
    startTransition(async () => {
      const result = await updateMemberRoleAction(groupId, member.userId, newRole);
      setPendingRole(null);
      if (result.success) {
        toast.success(`Rol actualizado a ${newRole === 'admin' ? 'Admin' : 'Miembro'}.`);
      } else {
        toast.error(result.error ?? 'Error al cambiar rol.');
      }
    });
  };

  const handleRemove = (member: GroupMember) => {
    setPendingRemove(member.userId);
    startTransition(async () => {
      const result = await removeMemberAction(groupId, member.userId);
      setPendingRemove(null);
      if (result.success) {
        toast.success(`${member.profile?.username ?? 'Miembro'} fue expulsado del grupo.`);
      } else {
        toast.error(result.error ?? 'Error al expulsar miembro.');
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar miembro..."
          className="pl-9 bg-background/40 border-border/40 text-sm"
        />
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-border/40 overflow-hidden">
        <div className="divide-y divide-border/30">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No se encontraron miembros.
            </div>
          ) : (
            filtered.map((member) => {
              const isCurrentUser = member.userId === currentUserId;
              const isOwner = member.role === 'owner';
              const badge = roleBadgeMap[member.role];
              const isRolePending = pendingRole === member.userId;
              const isRemovePending = pendingRemove === member.userId;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-4 py-3.5 bg-background/20 hover:bg-muted/10 transition-colors"
                >
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 border border-border/40">
                    <AvatarImage src={member.profile?.avatarUrl ?? ''} />
                    <AvatarFallback className="text-xs bg-muted/30">
                      {member.profile?.username?.[0]?.toUpperCase() ?? '?'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{member.profile?.username ?? 'Usuario'}</p>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 border-primary/30 text-primary">Tú</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{member.profile?.fullName ?? ''}</p>
                  </div>

                  {/* Badge de rol */}
                  <Badge variant="outline" className={badge.className}>
                    {isOwner && <Crown className="h-3 w-3 mr-1" />}
                    {badge.label}
                  </Badge>

                  {/* Cambiar rol */}
                  {!isOwner && !isCurrentUser && (
                    <>
                      {isRolePending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Select
                          value={member.role}
                          onValueChange={(val) => { if (val !== null) handleRoleChange(member, val as 'admin' | 'member'); }}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs bg-background/40 border-border/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Miembro</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {/* Expulsar */}
                      <ConfirmDialog
                        trigger={
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                            disabled={isRemovePending}
                          >
                            {isRemovePending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UserX className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        }
                        title="Expulsar miembro"
                        description={
                          <>Vas a expulsar a <strong>{member.profile?.username}</strong> del grupo. Esta acción no se puede deshacer.</>
                        }
                        confirmLabel="Expulsar"
                        variant="destructive"
                        onConfirm={() => handleRemove(member)}
                      />
                    </>
                  )}
                  {isOwner && !isCurrentUser && (
                    <span title="Owner"><Shield className="h-4 w-4 text-yellow-400/60" /></span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {members.length} participante{members.length !== 1 ? 's' : ''} en total
      </p>
    </div>
  );
}
