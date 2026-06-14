// =============================================================
// lib/supabase/client.ts
// Cliente Supabase para uso en componentes de React (browser)
// =============================================================
import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import type { FixedDatabase } from '@/types/database.types';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ) as unknown as SupabaseClient<FixedDatabase, 'public', 'public', FixedDatabase['public']>;
}
