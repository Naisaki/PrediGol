// =============================================================
// proxy.ts (raíz del src)
// Protege rutas privadas y redirige a los usuarios con Clerk Auth
// =============================================================
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/forgot-password(.*)',
  '/sso-callback(.*)',
  '/api/cron/(.*)', // Permitir cron jobs sin autenticación de usuario
  '/join/(.*)', // Enlaces de invitación
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
