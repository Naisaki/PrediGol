// =============================================================
// app/join/[inviteCode]/page.tsx
// Página de unirse a un grupo por código/enlace/QR
// =============================================================

import { auth } from '@clerk/nextjs/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getGroupByInviteCode } from '@/server/services/group.service';
import { JoinGroupClient } from '@/components/groups/join-group-client';
import { Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Unirse al Grupo' };

interface PageProps {
  params: Promise<{ inviteCode: string }>;
}

export default async function JoinPage({ params }: PageProps) {
  const { inviteCode } = await params;
  const { userId } = await auth();

  // Obtener información del grupo antes de login
  const group = await getGroupByInviteCode(inviteCode.toUpperCase());

  // Si el usuario ya es miembro, redirigir directamente
  if (userId && group) {
    const serviceClient = createServiceClient();
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('user_id')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (profile) {
      const { data: membership } = await serviceClient
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', profile.user_id)
        .maybeSingle();

    if (membership) {
      // Ya es miembro — mostrar mensaje
      return (
        <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold mb-2">Ya eres miembro</h1>
            <p className="text-muted-foreground mb-6">
              Ya formas parte del grupo <strong>{group.name}</strong>
            </p>
            <Link
              href={`/groups/${group.id}`}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold hover:bg-primary/90 transition-colors"
            >
              Ir al grupo
            </Link>
          </div>
        </div>
      );
    }
   }
  }

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
        >
          <Trophy className="h-5 w-5 text-primary" />
          <span className="font-bold tracking-tight">Goleados</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <JoinGroupClient
          group={group}
          inviteCode={inviteCode.toUpperCase()}
          isAuthenticated={!!userId}
        />
      </div>
    </div>
  );
}
