// =============================================================
// app/(dashboard)/groups/[groupId]/page.tsx
// Panel principal del grupo (overview, acciones, invite panel, miembros)
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Target, Trophy, Settings, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { InvitePanel } from '@/components/groups/invite-panel';
import { MembersList } from '@/components/groups/members-list';
import { getGroupById, getGroupMembers } from '@/server/services/group.service';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Detalle de Grupo' };

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupDetailPage({ params }: PageProps) {
  const { groupId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Obtener grupo
  const group = await getGroupById(groupId);
  if (!group || !group.isActive) {
    notFound();
  }

  // Obtener miembros
  const members = await getGroupMembers(groupId);
  const currentMember = members.find((m) => m.userId === user.id);

  // Si el usuario no es miembro, redirigir a unirse por link
  if (!currentMember) {
    redirect(`/join/${group.inviteCode}`);
  }

  const currentUserRole = currentMember.role;
  const isAdminOrOwner = ['owner', 'admin'].includes(currentUserRole);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Mis Grupos
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-muted-foreground text-sm mt-1">{group.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (Actions & Members) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href={`/groups/${groupId}/predictions`}>
              <Card className="glass-card border-border/40 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Mis Pronósticos</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pronostica los marcadores y suma puntos
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </CardContent>
              </Card>
            </Link>

            <Link href={`/groups/${groupId}/ranking`}>
              <Card className="glass-card border-border/40 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Trophy className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Ver Tabla de Posiciones</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Mira quién va ganando en tu grupo
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Members List */}
          <MembersList
            groupId={groupId}
            members={members}
            currentUserId={user.id}
            currentUserRole={currentUserRole}
          />
        </div>

        {/* Right column (Invitation Panel) */}
        <div>
          <InvitePanel
            groupId={groupId}
            inviteCode={group.inviteCode}
            inviteUrl={group.inviteUrl ?? ''}
            qrCodeUrl={group.qrCodeUrl}
            isAdminOrOwner={isAdminOrOwner}
          />
        </div>
      </div>
    </div>
  );
}
