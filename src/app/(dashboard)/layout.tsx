// =============================================================
// app/(dashboard)/layout.tsx
// Layout con sidebar desktop + bottom nav mobile
// =============================================================

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShellClient } from '@/components/layout/dashboard-shell-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Obtener perfil
  let { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  // Si no tiene perfil en la BD (ej. primer inicio de sesión social con Google), lo creamos dinámicamente
  if (!profile) {
    const user = await currentUser();
    if (user) {
      const email = user.emailAddresses[0]?.emailAddress;
      const baseUsername = user.username || email?.split('@')[0] || `user_${userId.slice(-6)}`;
      const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null;
      const sanitizedUsername = baseUsername.toLowerCase();
      const normalizedEmail = email ? email.trim().toLowerCase() : null;
      const isAppleRelay = normalizedEmail?.endsWith('@privaterelay.appleid.com');

      // Sincronizar de vuelta a Clerk para que aparezca en el panel de control de Clerk
      try {
        const client = await clerkClient();
        await client.users.updateUser(userId, {
          username: sanitizedUsername,
        });
      } catch (clerkErr) {
        console.error('Error al sincronizar el username con Clerk:', clerkErr);
      }

      const serviceClient = createServiceClient();
      
      // Buscar si existe un perfil migrado con ese mismo email o con ese mismo username para vincularlo
      const emailQuery = normalizedEmail && !isAppleRelay ? `email.eq.${normalizedEmail}` : '';
      const usernameQuery = `username.eq.${sanitizedUsername}`;
      const orQuery = [emailQuery, usernameQuery].filter(Boolean).join(',');

      const { data: existingProfile } = await serviceClient
        .from('profiles')
        .select('id')
        .or(orQuery)
        .maybeSingle();

      let syncQuery;
      if (existingProfile) {
        // Vinculamos el perfil antiguo al nuevo Clerk User ID, y actualizamos campos
        syncQuery = serviceClient
          .from('profiles')
          .update({
            clerk_user_id: userId,
            full_name: fullName,
            avatar_url: user.imageUrl || null,
          })
          .eq('id', existingProfile.id)
          .select('username, full_name, avatar_url')
          .maybeSingle();
      } else {
        // Creamos un perfil nuevo
        syncQuery = serviceClient
          .from('profiles')
          .insert({
            clerk_user_id: userId,
            user_id: userId,
            username: sanitizedUsername,
            full_name: fullName,
            avatar_url: user.imageUrl || null,
            email: normalizedEmail,
          })
          .select('username, full_name, avatar_url')
          .maybeSingle();
      }

      const { data: newProfile } = await syncQuery;

      if (newProfile) {
        profile = newProfile;
      }
    }
  }

  return (
    <DashboardShellClient
      username={profile?.username ?? 'Usuario'}
      avatarUrl={profile?.avatar_url ?? null}
    >
      {children}
    </DashboardShellClient>
  );
}
