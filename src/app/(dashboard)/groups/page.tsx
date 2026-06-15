// =============================================================
// app/(dashboard)/groups/page.tsx
// Lista de grupos del usuario
// =============================================================

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Users, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JoinGroupForm } from '@/components/groups/join-group-form';
import { getUserGroups } from '@/server/services/group.service';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mis Grupos' };

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const groups = await getUserGroups(user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Grupos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestiona tus grupos de pronósticos
          </p>
        </div>
        <Link href="/groups/create">
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Crear grupo</span>
          </Button>
        </Link>
      </div>

      {/* Join by code */}
      <Card className="glass-card border-border/40">
        <CardContent className="p-4">
          <JoinGroupForm />
        </CardContent>
      </Card>

      {/* Groups list */}
      {groups.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-semibold mb-2">
            Aún no tienes grupos
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Crea tu primer grupo o únete a uno con un código de invitación
          </p>
          <Link href="/groups/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Crear mi primer grupo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => {
            // Generar iniciales del nombre del grupo
            const initials = g.name
              .split(' ')
              .map((word) => word[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            // Estilos específicos para la insignia del rol
            const roleBadgeStyles = {
              owner: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
              admin: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
              member: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
            }[g.currentUserRole || 'member'];

            return (
              <Link key={g.id} href={`/groups/${g.id}`}>
                <Card className="glass-card border-border/40 hover:border-primary/30 hover:-translate-y-1 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full group flex flex-col justify-between">
                  <CardContent className="p-5 flex flex-col h-full">
                    {/* Header: Avatar / Image & Role */}
                    <div className="flex items-start justify-between mb-4">
                      {g.imageUrl ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border/60">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={g.imageUrl}
                            alt={g.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-violet-500/30 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary tracking-wider">
                          {initials}
                        </div>
                      )}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${roleBadgeStyles}`}>
                        {g.currentUserRole === 'owner' ? 'Owner' : g.currentUserRole === 'admin' ? 'Admin' : 'Miembro'}
                      </span>
                    </div>

                    {/* Body: Title and description */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {g.name}
                      </h3>

                      {g.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {g.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground/50 italic mb-4">
                          Sin descripción
                        </p>
                      )}
                    </div>

                    {/* Footer: Stats, Code, Admission Lock status */}
                    <div className="pt-3 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground mt-auto gap-2">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground/75" />
                        <span>
                          {g.memberCount ?? 1}
                          {g.maxMembers ? ` / ${g.maxMembers}` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {g.joinsOpen === false ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                            🔒 Cerrado
                          </span>
                        ) : g.joinApproval ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            ⏳ Con Aprobación
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            <span className="font-mono tracking-wider font-semibold">{g.inviteCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}


