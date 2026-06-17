'use client';
// =============================================================
// components/groups/members-list.tsx
// Lista de miembros del grupo con acciones de expulsión (owner/admin)
// =============================================================

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, UserPlus, Shield, Star, User } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { removeMemberAction } from '@/server/actions/groups';
import type { GroupMember, GroupMemberRole } from '@/types/app.types';

interface MembersListProps {
  groupId: string;
  members: GroupMember[];
  currentUserId: string;
  currentUserRole: GroupMemberRole;
}

export function MembersList({
  groupId,
  members,
  currentUserId,
  currentUserRole,
}: MembersListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isUserAdminOrOwner = ['owner', 'admin'].includes(currentUserRole);

  const handleKick = (targetUserId: string, targetName: string) => {
    if (!confirm(`¿Estás seguro de que deseas expulsar a ${targetName} del grupo?`)) {
      return;
    }

    startTransition(async () => {
      const result = await removeMemberAction(groupId, targetUserId);
      if (result.success) {
        toast.success(`¡Se expulsó a ${targetName} exitosamente!`);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Error al expulsar al miembro');
      }
    });
  };

  const getRoleBadge = (role: GroupMemberRole) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-medium">
            <Star className="h-3 w-3 fill-current" />
            Creador
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-medium">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium">
            <User className="h-3 w-3" />
            Miembro
          </span>
        );
    }
  };

  return (
    <Card className="glass-card border-border/40">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 gap-2">
        <div className="flex-1 min-w-0 pr-2">
          <CardTitle className="text-base font-semibold truncate">Miembros del Grupo</CardTitle>
          <CardDescription className="text-xs truncate">
            Lista de participantes que compiten en este grupo.
          </CardDescription>
        </div>
        <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
          {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
        </span>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border/30">
          {members.map((member) => {
            const profile = member.profile;
            const username = profile?.username ?? 'Usuario';
            const fullName = profile?.fullName ?? '';
            const avatarUrl = profile?.avatarUrl ?? '';
            const isSelf = member.userId === currentUserId;

            // Se puede expulsar si:
            // - El usuario actual es admin/owner.
            // - El objetivo NO es el owner (el owner no se auto-expulsa ni lo expulsan).
            // - El objetivo NO es uno mismo (para salir del grupo se usa otra acción si se desea, aquí es kick).
            // - Un admin no puede expulsar a otro admin o al owner, solo a miembros. El owner puede expulsar a cualquiera.
            const canKick =
              isUserAdminOrOwner &&
              !isSelf &&
              member.role !== 'owner' &&
              (currentUserRole === 'owner' || member.role === 'member');

            return (
              <div key={member.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-border/30">
                    <AvatarImage src={avatarUrl} alt={username} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold hover:text-primary transition-colors">
                        {username}
                      </span>
                      {isSelf && (
                        <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.2 rounded font-semibold">
                          Tú
                        </span>
                      )}
                    </div>
                    {fullName && (
                      <span className="text-xs text-muted-foreground">
                        {fullName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getRoleBadge(member.role)}

                  {canKick && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      onClick={() => handleKick(member.userId, username)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Expulsar del grupo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
