'use client';

import React, { useState, useEffect } from 'react';
import { Tv, X, ShieldAlert, ChevronDown, Radio, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface StreamPlayerModalProps {
  streamUrl?: string | null;
  homeTeam: string;
  awayTeam: string;
}

interface ChannelOption {
  name: string;
  url: string;
  provider: string;
  isRecommended?: boolean;
}

// Canales preconfigurados extraídos de la18hd.com
const DEFAULT_CHANNELS: ChannelOption[] = [
  { name: 'ESPN', url: 'https://la18hd.com/vivo/canales.php?stream=espn', provider: 'la18hd.com' },
  { name: 'ESPN 2', url: 'https://la18hd.com/vivo/canales.php?stream=espn2', provider: 'la18hd.com' },
  { name: 'ESPN 3', url: 'https://la18hd.com/vivo/canales.php?stream=espn3', provider: 'la18hd.com' },
  { name: 'ESPN Premium', url: 'https://la18hd.com/vivo/canales.php?stream=espnpremium', provider: 'la18hd.com' },
  { name: 'DIRECTV Sports (DSPORTS)', url: 'https://la18hd.com/vivo/canales.php?stream=dsports', provider: 'la18hd.com' },
  { name: 'DSports Plus', url: 'https://la18hd.com/vivo/canales.php?stream=dsportsplus', provider: 'la18hd.com' },
  { name: 'Fox Sports', url: 'https://la18hd.com/vivo/canales.php?stream=foxsports', provider: 'la18hd.com' },
  { name: 'Fox Sports 2', url: 'https://la18hd.com/vivo/canales.php?stream=foxsports2', provider: 'la18hd.com' },
  { name: 'Fox Sports 3', url: 'https://la18hd.com/vivo/canales.php?stream=foxsports3', provider: 'la18hd.com' },
  { name: 'TyC Sports', url: 'https://la18hd.com/vivo/canales.php?stream=tycsports', provider: 'la18hd.com' },
  { name: 'Liga1 MAX', url: 'https://la18hd.com/vivo/canales.php?stream=liga1max', provider: 'la18hd.com' },
  { name: 'Caracol TV', url: 'https://la18hd.com/vivo/canales.php?stream=caracol', provider: 'la18hd.com' },
  { name: 'VTV Plus', url: 'https://la18hd.com/vivo/canales.php?stream=vtvplus', provider: 'la18hd.com' },
  { name: 'Win Sports', url: 'https://la18hd.com/vivo/canales.php?stream=winsports', provider: 'la18hd.com' },
];

export function StreamPlayerModal({ streamUrl, homeTeam, awayTeam }: StreamPlayerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [channelsList, setChannelsList] = useState<ChannelOption[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChannelOption>({ name: '', url: '', provider: '' });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Normalizar nombres de equipos para comparar
  const cleanTeamName = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\b(fc|sd|cd|club|real|deportivo|atletico|rd)\b/g, '')
      .trim();
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchAgenda = async () => {
      setLoadingSchedule(true);
      
      let list: ChannelOption[] = [];
      if (streamUrl) {
        list.push({ 
          name: 'Señal Personalizada (Recomendada)', 
          url: streamUrl, 
          provider: 'Admin',
          isRecommended: true
        });
      }

      try {
        const res = await fetch('/api/stream-status?type=agenda');
        if (res.ok) {
          const agenda = await res.json();
          
          const homeClean = cleanTeamName(homeTeam);
          const awayClean = cleanTeamName(awayTeam);

          const matchedEvents = agenda.filter((event: any) => {
            const titleClean = cleanTeamName(event.title || '');
            return titleClean.includes(homeClean) || titleClean.includes(awayClean);
          });

          if (matchedEvents.length > 0) {
            matchedEvents.forEach((event: any, idx: number) => {
              if (event.link) {
                let cName = '';
                if (event.link.includes('stream=')) {
                  const streamParam = new URL(event.link).searchParams.get('stream');
                  const matchedDefault = DEFAULT_CHANNELS.find(c => c.url.includes(`stream=${streamParam}`));
                  cName = matchedDefault ? matchedDefault.name : `Señal ${streamParam?.toUpperCase()}`;
                } else if (event.link.includes('drm')) {
                  cName = `Señal Alternativa DRM ${idx + 1}`;
                } else {
                  cName = `Señal Directa ${idx + 1}`;
                }

                if (event.language) {
                  cName += ` (${event.language})`;
                }

                let provider = 'la18hd.com';
                try {
                  const urlObj = new URL(event.link);
                  provider = urlObj.hostname;
                } catch (_) {}

                list.push({
                  name: cName,
                  url: event.link,
                  provider: provider,
                  isRecommended: true
                });
              }
            });
          }
        }
      } catch (err) {
        console.error('Error fetching la18hd agenda:', err);
      }

      const hasRecommended = list.some(c => c.isRecommended);
      list = [...list, ...DEFAULT_CHANNELS];

      const uniqueList = list.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

      setChannelsList(uniqueList);
      setActiveChannel(uniqueList[0]);
      setLoadingSchedule(false);
    };

    fetchAgenda();
  }, [isOpen, streamUrl, homeTeam, awayTeam]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold shadow-md shadow-primary/10 transition-all hover:scale-[1.01]"
      >
        <Tv className="h-4 w-4" />
        Ver Transmisión en Vivo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-4xl w-full bg-[var(--surface)] border-border/40 p-0 overflow-hidden shadow-2xl rounded-2xl">
          <DialogHeader className="p-4 bg-[var(--surface-hover)] border-b border-[var(--border-subtle)] flex flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="truncate">{homeTeam} vs {awayTeam}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span>Canal activo:</span>
                <span className="text-primary font-semibold truncate max-w-[180px] sm:max-w-xs">{activeChannel.name || 'Cargando...'}</span>
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 z-50">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={loadingSchedule}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--control-bg)] border border-[var(--border-subtle)] text-xs font-semibold text-foreground hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
                >
                  <span>Cambiar señal</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-[var(--surface)] border border-border/40 shadow-xl overflow-y-auto max-h-[300px] py-1 z-50">
                    {channelsList.some(c => c.isRecommended) && (
                      <>
                        <div className="px-3 py-1 text-[10px] font-bold text-primary uppercase border-b border-border/20 mb-1 flex items-center gap-1">
                          <Radio className="h-3 w-3 animate-pulse text-primary" />
                          Señales en vivo para este partido
                        </div>
                        {channelsList.filter(c => c.isRecommended).map((ch, idx) => (
                          <button
                            key={`rec-${idx}`}
                            onClick={() => {
                              setActiveChannel(ch);
                              setShowDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col ${
                              activeChannel.url === ch.url 
                                ? 'bg-primary/15 text-primary font-bold' 
                                : 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                            }`}
                          >
                            <span className="truncate">{ch.name}</span>
                            <span className="text-[9px] text-[var(--text-muted)] font-normal">vía {ch.provider}</span>
                          </button>
                        ))}
                        <div className="h-[1px] bg-[var(--border-subtle)] my-2" />
                      </>
                    )}

                    <div className="px-3 py-1 text-[10px] font-bold text-[var(--text-muted)] uppercase border-b border-border/20 mb-1">
                      Todas las señales deportivas
                    </div>
                    {channelsList.filter(c => !c.isRecommended).map((ch, idx) => (
                      <button
                        key={`gen-${idx}`}
                        onClick={() => {
                          setActiveChannel(ch);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col ${
                          activeChannel.url === ch.url 
                            ? 'bg-primary/15 text-primary font-bold' 
                            : 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        <span className="truncate">{ch.name}</span>
                        <span className="text-[9px] text-[var(--text-muted)] font-normal">vía {ch.provider}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {activeChannel.url && (
                <a
                  href={activeChannel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/35 transition-colors"
                >
                  <Tv className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Pantalla Completa</span>
                </a>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-full flex-shrink-0"
              onClick={() => {
                setIsOpen(false);
                setShowDropdown(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="relative aspect-video w-full bg-black">
            {loadingSchedule ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-xs text-[var(--text-muted)] font-medium">Buscando señales oficiales para el partido...</span>
              </div>
            ) : activeChannel.url ? (
              <iframe
                src={activeChannel.url}
                className="absolute inset-0 w-full h-full border-none"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-2 p-4 text-center">
                <Info className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-semibold text-[var(--text)]">Canal no disponible</span>
                <span className="text-xs text-[var(--text-muted)] max-w-xs">No se encontraron señales de transmisión activas en la agenda.</span>
              </div>
            )}
          </div>
          
          <div className="bg-[var(--surface-hover)] border-t border-[var(--border-subtle)] px-4 py-2.5 flex items-center gap-2.5 text-[10px] text-muted-foreground">
            <ShieldAlert className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span className="truncate">
              Aviso: Señales obtenidas de la agenda de {activeChannel.provider || 'la18hd.com'}. Recomendamos AdBlocker para evitar anuncios emergentes.
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
