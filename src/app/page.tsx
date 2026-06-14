// =============================================================
// Landing page — app/page.tsx
// =============================================================

import Link from 'next/link';
import {
  Trophy,
  Users,
  Target,
  Star,
  ChevronRight,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">
              Mundial Predictor
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Crear cuenta
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Star className="h-3.5 w-3.5" />
            Beta privada · Mundial FIFA 2026
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-none">
            Pronostica el
            <span className="block bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Mundial
            </span>
            con tus amigos
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Crea tu grupo privado, pronostica los marcadores y compite en una
            tabla de posiciones. Sin apuestas, sin dinero — solo pura emoción
            deportiva entre amigos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-105"
              >
                Crear mi grupo
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-border/60 hover:border-primary/50 px-8 py-6 text-lg font-medium"
              >
                <Hash className="mr-2 h-5 w-5" />
                Unirme con código
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Cómo funciona</h2>
            <p className="text-muted-foreground text-lg">
              En cuatro pasos tienes tu grupo listo para el Mundial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: Users,
                title: 'Crea tu grupo',
                description:
                  'Elige un nombre, personaliza tu grupo y obtén tu código de invitación único.',
              },
              {
                step: '02',
                icon: Hash,
                title: 'Invita a tus amigos',
                description:
                  'Comparte el enlace, el código o el QR — tus amigos se unen en segundos.',
              },
              {
                step: '03',
                icon: Target,
                title: 'Pronostica partidos',
                description:
                  'Ingresa el marcador exacto que crees que tendrá cada partido del Mundial.',
              },
              {
                step: '04',
                icon: Trophy,
                title: 'Gana el ranking',
                description:
                  'Suma puntos por cada acierto y sube en la tabla de posiciones del grupo.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="glass-card rounded-2xl p-6 animate-scale-in group hover:border-primary/20 transition-colors"
              >
                <div className="text-xs font-mono text-primary/60 mb-4 font-bold tracking-widest">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoring system */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Sistema de puntuación</h2>
          <p className="text-muted-foreground mb-12">
            Simple, transparente y fácil de entender
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                points: '5 pts',
                label: 'Marcador exacto',
                example: 'Predices 2-1 · Resultado 2-1',
                color: 'text-primary',
                bg: 'bg-primary/10 border-primary/20',
              },
              {
                points: '3 pts',
                label: 'Resultado correcto',
                example: 'Predices 1-0 · Resultado 2-1',
                color: 'text-secondary',
                bg: 'bg-secondary/10 border-secondary/20',
              },
              {
                points: '+1 pt',
                label: 'Diferencia exacta',
                example: 'Bonus si la diferencia de goles coincide',
                color: 'text-accent',
                bg: 'bg-accent/10 border-accent/20',
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl p-6 border ${item.bg}`}
              >
                <div className={`text-4xl font-black mb-2 ${item.color}`}>
                  {item.points}
                </div>
                <div className="font-semibold mb-1">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.example}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="font-medium">Mundial Predictor</span>
            <span className="text-xs">· Beta privada FIFA 2026</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Plataforma social y recreativa · Sin apuestas ni dinero real
          </p>
        </div>
      </footer>
    </div>
  );
}
