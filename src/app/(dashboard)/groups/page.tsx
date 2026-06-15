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
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mis Grupos' };

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: memberships } = await supabase
    .from('group_members')
    .select(`
      role,
      joined_at,
      group:groups (
        id, name, description, owner_id, invite_code, is_active, created_at
      )
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });

  const groups = (memberships as any[] ?? []).filter((m) => m.group !== null);

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
          {(groups as any[]).map((membership) => {
            const g = membership.group as {
              id: string;
              name: string;
              description: string | null;
              owner_id: string;
              invite_code: string;
              is_active: boolean;
            };
            return (
              <Link key={g.id} href={`/groups/${g.id}`}>
                <Card className="glass-card border-border/40 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted/60 text-muted-foreground capitalize">
                        {membership.role}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base mb-1 line-clamp-1">
                      {g.name}
                    </h3>

                    {g.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {g.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                      <Hash className="h-3 w-3" />
                      <span className="font-mono tracking-widest">{g.invite_code}</span>
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


