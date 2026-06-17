'use client';

import React, { useState, useEffect } from 'react';
import { Tv, ShieldAlert, Play, ExternalLink, Radio, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface ChannelOption {
  name: string;
  url: string;
  provider: string;
  descKey: string;
  category: string;
}

// Canales preconfigurados mapeados a la18hd.com
const ALL_CHANNELS: ChannelOption[] = [
  {
    name: 'ESPN',
    url: 'https://la18hd.com/vivo/canales.php?stream=espn',
    provider: 'la18hd.com',
    descKey: 'descESPN',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN 2',
    url: 'https://la18hd.com/vivo/canales.php?stream=espn2',
    provider: 'la18hd.com',
    descKey: 'descESPN2',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN 3',
    url: 'https://la18hd.com/vivo/canales.php?stream=espn3',
    provider: 'la18hd.com',
    descKey: 'descESPN3',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN 4',
    url: 'https://la18hd.com/vivo/canales.php?stream=espn4',
    provider: 'la18hd.com',
    descKey: 'descESPN4',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN 5',
    url: 'https://la18hd.com/vivo/canales.php?stream=espn5',
    provider: 'la18hd.com',
    descKey: 'descESPN5',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN 6',
    url: 'https://la18hd.com/vivo/canales.php?stream=espn6',
    provider: 'la18hd.com',
    descKey: 'descESPN6',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN 7',
    url: 'https://la18hd.com/vivo/canales.php?stream=espn7',
    provider: 'la18hd.com',
    descKey: 'descESPN7',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN Premium',
    url: 'https://la18hd.com/vivo/canales.php?stream=espnpremium',
    provider: 'la18hd.com',
    descKey: 'descESPNPremium',
    category: 'Argentina',
  },
  {
    name: 'DIRECTV Sports (DSPORTS)',
    url: 'https://la18hd.com/vivo/canales.php?stream=dsports',
    provider: 'la18hd.com',
    descKey: 'descDsports',
    category: 'Latinoamérica',
  },
  {
    name: 'DSports 2',
    url: 'https://la18hd.com/vivo/canales.php?stream=dsports2',
    provider: 'la18hd.com',
    descKey: 'descDsports2',
    category: 'Latinoamérica',
  },
  {
    name: 'DSports Plus',
    url: 'https://la18hd.com/vivo/canales.php?stream=dsportsplus',
    provider: 'la18hd.com',
    descKey: 'descDsportsPlus',
    category: 'Latinoamérica',
  },
  {
    name: 'Fox Sports',
    url: 'https://la18hd.com/vivo/canales.php?stream=foxsports',
    provider: 'la18hd.com',
    descKey: 'descFoxSports',
    category: 'Argentina',
  },
  {
    name: 'Fox Sports 2',
    url: 'https://la18hd.com/vivo/canales.php?stream=foxsports2',
    provider: 'la18hd.com',
    descKey: 'descFoxSports2',
    category: 'Argentina',
  },
  {
    name: 'Fox Sports 3',
    url: 'https://la18hd.com/vivo/canales.php?stream=foxsports3',
    provider: 'la18hd.com',
    descKey: 'descFoxSports3',
    category: 'Argentina',
  },
  {
    name: 'TyC Sports',
    url: 'https://la18hd.com/vivo/canales.php?stream=tycsports',
    provider: 'la18hd.com',
    descKey: 'descTycSports',
    category: 'Argentina',
  },
  {
    name: 'Liga1 MAX',
    url: 'https://la18hd.com/vivo/canales.php?stream=liga1max',
    provider: 'la18hd.com',
    descKey: 'descLiga1Max',
    category: 'Perú',
  },
  {
    name: 'Caracol TV',
    url: 'https://la18hd.com/vivo/canales.php?stream=caracol',
    provider: 'la18hd.com',
    descKey: 'descCaracol',
    category: 'Colombia',
  },
  {
    name: 'VTV Plus',
    url: 'https://la18hd.com/vivo/canales.php?stream=vtvplus',
    provider: 'la18hd.com',
    descKey: 'descVtvPlus',
    category: 'Uruguay',
  },
  {
    name: 'Win Sports',
    url: 'https://la18hd.com/vivo/canales.php?stream=winsports',
    provider: 'la18hd.com',
    descKey: 'descWinSports',
    category: 'Colombia',
  },
];

const streamsTranslations: Record<string, Record<string, string>> = {
  ES: {
    title: 'Canales de Transmisión',
    subtitle: 'Elige una señal deportiva para ver en vivo a cualquier hora, incluso si no hay partidos programados.',
    availableSignals: 'Señales Disponibles',
    playingNow: 'Reproduciendo ahora',
    openExternal: 'Abrir señal externa',
    streamNoticeTitle: 'Aviso sobre la transmisión',
    streamNoticeDesc: 'Esta señal es provista de forma externa por {provider}. Te recomendamos encarecidamente utilizar un bloqueador de anuncios (AdBlocker) en tu navegador para evitar la publicidad emergente del reproductor de origen.',
    descESPN: 'Fútbol internacional, Champions League, ligas europeas.',
    descESPN2: 'Tenis, ligas americanas y transmisiones secundarias.',
    descESPN3: 'Eventos especiales, ciclismo, deportes de motor.',
    descESPN4: 'Transmisión en vivo de eventos deportivos internacionales.',
    descESPN5: 'Transmisión en vivo de eventos deportivos internacionales.',
    descESPN6: 'Transmisión en vivo de eventos deportivos internacionales.',
    descESPN7: 'Transmisión en vivo de eventos deportivos internacionales.',
    descESPNPremium: 'Partidos del fútbol argentino en vivo.',
    descDsports: 'Exclusivas de LaLiga, Copa del Rey y eventos FIFA.',
    descDsports2: 'Cobertura secundaria de torneos continentales y eventos FIFA.',
    descDsportsPlus: 'Cobertura especial de torneos continentales y eventos FIFA.',
    descFoxSports: 'Copa Libertadores, Champions League y automovilismo.',
    descFoxSports2: 'Ligas continentales, NFL y deportes extremos.',
    descFoxSports3: 'Fórmula 1 y transmisiones especiales de motor.',
    descTycSports: 'Fútbol argentino, copa nacional y deportes nacionales.',
    descLiga1Max: 'Partidos en vivo del fútbol profesional peruano.',
    descCaracol: 'Fútbol y deportes colombianos en vivo.',
    descVtvPlus: 'Fútbol y deportes uruguayos en vivo.',
    descWinSports: 'Fútbol y deportes colombianos en vivo.',
  },
  EN: {
    title: 'Streaming Channels',
    subtitle: 'Choose a sports signal to watch live at any time, even if no matches are scheduled.',
    availableSignals: 'Available Signals',
    playingNow: 'Playing now',
    openExternal: 'Open external stream',
    streamNoticeTitle: 'Broadcast Notice',
    streamNoticeDesc: 'This signal is externally provided by {provider}. We highly recommend using an AdBlocker in your browser to avoid popup ads from the source player.',
    descESPN: 'International football, Champions League, European leagues.',
    descESPN2: 'Tennis, American leagues, and secondary broadcasts.',
    descESPN3: 'Special events, cycling, motor sports.',
    descESPN4: 'Live streaming of international sports events.',
    descESPN5: 'Live streaming of international sports events.',
    descESPN6: 'Live streaming of international sports events.',
    descESPN7: 'Live streaming of international sports events.',
    descESPNPremium: 'Live Argentine football matches.',
    descDsports: 'LaLiga exclusives, Copa del Rey, and FIFA events.',
    descDsports2: 'Secondary coverage of continental tournaments and FIFA events.',
    descDsportsPlus: 'Special coverage of continental tournaments and FIFA events.',
    descFoxSports: 'Copa Libertadores, Champions League, and motorsports.',
    descFoxSports2: 'Continental leagues, NFL, and extreme sports.',
    descFoxSports3: 'Formula 1 and special motorsport broadcasts.',
    descTycSports: 'Argentine football, national cup, and national sports.',
    descLiga1Max: 'Live matches of Peruvian professional football.',
    descCaracol: 'Live Colombian football and sports.',
    descVtvPlus: 'Live Uruguayan football and sports.',
    descWinSports: 'Live Colombian football and sports.',
  },
};

export default function StreamsPage() {
  const [channels, setChannels] = useState<ChannelOption[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChannelOption | null>(null);
  const [lang, setLang] = useState('ES');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('locale') || 'ES';
    setLang(saved);

    const handleLocaleChange = () => {
      setLang(localStorage.getItem('locale') || 'ES');
    };
    window.addEventListener('locale-changed', handleLocaleChange);
    return () => window.removeEventListener('locale-changed', handleLocaleChange);
  }, []);

  useEffect(() => {
    const fetchStatuses = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/stream-status');
        if (res.ok) {
          const statusData = await res.json();
          
          // Crear un set de links activos en status.json
          const activeLinks = new Set<string>();
          Object.keys(statusData).forEach(category => {
            statusData[category].forEach((item: any) => {
              if (item.Estado === 'Activo' && item.Link) {
                // Normalizar URL (quitar barras inclinadas de escape si existen)
                const normalizedLink = item.Link.replace(/\\/g, '');
                activeLinks.add(normalizedLink.toLowerCase().trim());
              }
            });
          });

          // Filtrar ALL_CHANNELS para quedarnos solo con los activos
          const activeChannels = ALL_CHANNELS.filter(ch => {
            const normalizedUrl = ch.url.toLowerCase().trim();
            return activeLinks.has(normalizedUrl);
          });

          setChannels(activeChannels);
          if (activeChannels.length > 0) {
            setActiveChannel(activeChannels[0]);
          } else {
            // Fallback si por alguna razón todo está inactivo en la API, mostramos todo
            setChannels(ALL_CHANNELS);
            setActiveChannel(ALL_CHANNELS[0]);
          }
        } else {
          // Fallback a todos los canales si falla el fetch
          setChannels(ALL_CHANNELS);
          setActiveChannel(ALL_CHANNELS[0]);
        }
      } catch (err) {
        console.error('Error fetching channel statuses:', err);
        setChannels(ALL_CHANNELS);
        setActiveChannel(ALL_CHANNELS[0]);
      }
      setLoading(false);
    };

    fetchStatuses();
  }, []);

  const t = (key: string) => {
    return streamsTranslations[lang]?.[key] || streamsTranslations['ES']?.[key] || key;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text)]">
          <Radio className="h-6 w-6 text-primary animate-pulse" />
          {t('title')}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {t('subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <span className="text-sm text-[var(--text-muted)] font-medium">Actualizando estado de los canales en vivo...</span>
        </div>
      ) : channels.length === 0 ? (
        <Card className="glass-card border-border/40">
          <CardContent className="text-center py-16 space-y-2">
            <Tv className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-[var(--text)] font-semibold">No hay canales de transmisión activos</p>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">Vuelve a consultar más tarde cuando haya partidos de fútbol en juego.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de canales */}
          <div className="lg:col-span-1 space-y-3 lg:max-h-[600px] lg:overflow-y-auto overflow-x-auto flex flex-row lg:flex-col gap-3 lg:gap-0 pb-3 lg:pb-0 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent overscroll-behavior-x-contain -webkit-overflow-scrolling-touch">
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-1 mb-2 hidden lg:block">
              {t('availableSignals')}
            </div>
            {channels.map((ch, idx) => {
              const isSelected = activeChannel?.url === ch.url;
              return (
                <Card
                  key={idx}
                  onClick={() => setActiveChannel(ch)}
                  className={cn(
                    'cursor-pointer border transition-all hover:bg-[var(--surface-hover)] flex-shrink-0 w-[260px] lg:w-full lg:mb-3',
                    isSelected 
                      ? 'bg-primary/5 border-primary/45 shadow-md shadow-primary/5' 
                      : 'glass-card border-border/40'
                  )}
                >
                  <CardContent className="p-4 flex items-center justify-between gap-4 h-full">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2 w-2 flex-shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <h3 className={cn('font-bold text-sm truncate', isSelected ? 'text-primary' : 'text-[var(--text)]')}>
                          {ch.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                        {t(ch.descKey)}
                      </p>
                      <span className="inline-block mt-2 text-[9px] px-1.5 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold">
                        {ch.category}
                      </span>
                    </div>
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                      isSelected ? 'bg-primary/20 text-primary' : 'bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
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
            {activeChannel ? (
              <Card className="glass-card border-border/40 overflow-hidden shadow-2xl">
                <div className="p-4 bg-[var(--surface-hover)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-xs text-[var(--text-muted)]">{t('playingNow')}</span>
                    <h2 className="text-base font-bold text-[var(--text)] truncate">{activeChannel.name}</h2>
                  </div>
                  <a
                    href={activeChannel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/35 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>{t('openExternal')}</span>
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
                <div className="p-4 bg-[var(--surface-hover)]/50 border-t border-[var(--border-subtle)] flex items-start gap-3 text-xs text-[var(--text-muted)]">
                  <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[var(--text)] mb-0.5">{t('streamNoticeTitle')}</p>
                    <p>
                      {t('streamNoticeDesc').replace('{provider}', activeChannel.provider)}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="glass-card border-border/40 overflow-hidden shadow-2xl">
                <div className="flex flex-col items-center justify-center p-20 gap-2">
                  <Info className="h-10 w-10 text-muted-foreground" />
                  <span className="text-sm font-semibold text-[var(--text)]">Selecciona un canal para comenzar</span>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
