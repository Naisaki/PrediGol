// =============================================================
// lib/supabase/server.ts
// Cliente Supabase para uso en Server Components, Server Actions
// y Route Handlers (solo servidor)
// =============================================================
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';
import type { FixedDatabase } from '@/types/database.types';
import { cache } from 'react';

export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }: { name: string; value: string; options?: unknown }) =>
                cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]),
            );
          } catch {
            // Server Component – ignorar errores de cookies (read-only)
          }
        },
      },
    },
  ) as unknown as SupabaseClient<FixedDatabase, 'public', 'public', FixedDatabase['public']>;
});

// Cliente con service_role para operaciones admin (cron jobs, server actions privilegiadas)
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  ) as unknown as SupabaseClient<FixedDatabase, 'public', 'public', FixedDatabase['public']>;
}
