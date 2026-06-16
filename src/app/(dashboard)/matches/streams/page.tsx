'use client';

import React, { useState } from 'react';
import { Tv, ShieldAlert, Play, ExternalLink, Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface ChannelOption {
  name: string;
  url: string;
  provider: string;
  description: string;
  category: 'Latinoamérica' | 'Argentina' | 'Perú' | 'México';
}

const CHANNELS: ChannelOption[] = [
  {
    name: 'ESPN',
    url: 'https://tvtvhd.com/tv/canales.php?stream=espn',
    provider: 'tvtvhd.com',
    description: 'Fútbol internacional, Champions League, ligas europeas.',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN 2',
    url: 'https://tvtvhd.com/tv/canales.php?stream=espn2',
    provider: 'tvtvhd.com',
    description: 'Tenis, ligas americanas y transmisiones secundarias.',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN 3',
    url: 'https://tvtvhd.com/tv/canales.php?stream=espn3',
    provider: 'tvtvhd.com',
    description: 'Eventos especiales, ciclismo, deportes de motor.',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN Premium',
    url: 'https://tvtvhd.com/tv/canales.php?stream=espnpremium',
    provider: 'tvtvhd.com',
    description: 'Partidos del fútbol argentino en vivo.',
    category: 'Argentina',
  },
  {
    name: 'DIRECTV Sports (DSPORTS)',
    url: 'https://tvtvhd.com/tv/canales.php?stream=dsports',
    provider: 'tvtvhd.com',
    description: 'Exclusivas de LaLiga, Copa del Rey y eventos FIFA.',
    category: 'Latinoamérica',
  },
  {
    name: 'Fox Sports',
    url: 'https://tvtvhd.com/tv/canales.php?stream=foxsports',
    provider: 'tvtvhd.com',
    description: 'Copa Libertadores, Champions League y automovilismo.',
    category: 'Argentina',
  },
  {
    name: 'Fox Sports 2',
    url: 'https://tvtvhd.com/tv/canales.php?stream=foxsports2',
    provider: 'tvtvhd.com',
    description: 'Ligas continentales, NFL y deportes extremos.',
    category: 'Argentina',
  },
  {
    name: 'Fox Sports 3',
    url: 'https://tvtvhd.com/tv/canales.php?stream=foxsports3',
    provider: 'tvtvhd.com',
    description: 'Fórmula 1 y transmisiones especiales de motor.',
    category: 'Argentina',
  },
  {
    name: 'TyC Sports',
    url: 'https://tvtvhd.com/tv/canales.php?stream=tycsports',
    provider: 'tvtvhd.com',
    description: 'Fútbol argentino, copa nacional y deportes nacionales.',
    category: 'Argentina',
  },
  {
    name: 'Liga1 MAX',
    url: 'https://tvtvhd.com/tv/canales.php?stream=liga1max',
    provider: 'tvtvhd.com',
    description: 'Partidos en vivo del fútbol profesional peruano.',
    category: 'Perú',
  },
];

export default function StreamsPage() {
  const [activeChannel, setActiveChannel] = useState<ChannelOption>(CHANNELS[0]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Radio className="h-6 w-6 text-primary animate-pulse" />
          Canales de Transmisión
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Elige una señal deportiva para ver en vivo a cualquier hora, incluso si no hay partidos programados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de canales */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Señales Disponibles
          </div>
          {CHANNELS.map((ch, idx) => {
            const isSelected = activeChannel.url === ch.url;
            return (
              <Card
                key={idx}
                onClick={() => setActiveChannel(ch)}
                className={cn(
                  'cursor-pointer border transition-all hover:bg-slate-900/45',
                  isSelected 
                    ? 'bg-primary/5 border-primary/45 shadow-md shadow-primary/5' 
                    : 'glass-card border-border/40'
                )}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="relative flex h-2 w-2 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      <h3 className={cn('font-bold text-sm truncate', isSelected ? 'text-primary' : 'text-foreground')}>
                        {ch.name}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {ch.description}
                    </p>
                    <span className="inline-block mt-2 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-muted-foreground font-semibold">
                      {ch.category}
                    </span>
                  </div>
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                    isSelected ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-muted-foreground'
                  )}>
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reproductor principal */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass-card border-border/40 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 border-b border-border/20 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-xs text-muted-foreground">Reproduciendo ahora</span>
                <h2 className="text-base font-bold text-foreground truncate">{activeChannel.name}</h2>
              </div>
              <a
                href={activeChannel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/35 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Abrir señal externa</span>
              </a>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={activeChannel.url}
                className="absolute inset-0 w-full h-full border-none"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            </div>

            {/* Footer de información / advertencia */}
            <div className="p-4 bg-slate-900/50 border-t border-border/20 flex items-start gap-3 text-xs text-muted-foreground">
              <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-0.5">Aviso sobre la transmisión</p>
                <p>
                  Esta señal es provista de forma externa por {activeChannel.provider}. Te recomendamos encarecidamente utilizar un bloqueador de anuncios (AdBlocker) en tu navegador para evitar la publicidad emergente del reproductor de origen.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
