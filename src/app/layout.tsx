import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Mundial Predictor — Pronósticos del Mundial FIFA 2026',
    template: '%s | Mundial Predictor',
  },
  description:
    'Crea tu grupo, invita a tus amigos, pronostica los partidos del Mundial FIFA 2026 y compite en una tabla de posiciones. Plataforma social y recreativa — sin apuestas.',
  keywords: ['mundial', 'pronósticos', 'fútbol', 'FIFA 2026', 'predictor'],
  openGraph: {
    title: 'Mundial Predictor',
    description: 'Compite con tus amigos pronosticando el Mundial FIFA 2026',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'hsl(222 40% 10%)',
              border: '1px solid hsl(217 33% 20%)',
              color: 'hsl(210 40% 96%)',
            },
          }}
        />
      </body>
    </html>
  );
}
