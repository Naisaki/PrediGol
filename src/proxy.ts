// =============================================================
// proxy.ts (raíz del src)
// Protege rutas privadas y renueva sesión Supabase en cada request
// =============================================================
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];
const ADMIN_ROUTES = ['/admin'];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(
            ({ name, value, options }: { name: string; value: string; options?: unknown }) =>
              supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2]),
          );
        },
      },
    },
  );

  // IMPORTANTE: Refrescar sesión — no agregar lógica entre createServerClient and getUser
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Si hay sesión y va a ruta de auth → redirigir al dashboard
  if (user && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si no hay sesión y va a ruta privada → redirigir al login
  const isPublicRoute =
    PUBLIC_ROUTES.some((r) => pathname === r) ||
    pathname.startsWith('/join/') ||
    pathname.startsWith('/api/');

  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protección de rutas admin (verificación de rol se hace en la página)
  if (pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
