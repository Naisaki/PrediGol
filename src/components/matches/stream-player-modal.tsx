'use client';

import React, { useState } from 'react';
import { Tv, X, ShieldAlert, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface StreamPlayerModalProps {
  streamUrl?: string | null; // URL manual opcional de Supabase
  homeTeam: string;
  awayTeam: string;
}

interface ChannelOption {
  name: string;
  url: string;
  provider: string;
}

// Canales preconfigurados extraídos dinámicamente de tvtvhd.com
const DEFAULT_CHANNELS: ChannelOption[] = [
  { name: 'ESPN', url: 'https://tvtvhd.com/vivo/canales.php?stream=espn', provider: 'tvtvhd.com' },
  { name: 'ESPN 2', url: 'https://tvtvhd.com/vivo/canales.php?stream=espn2', provider: 'tvtvhd.com' },
  { name: 'ESPN 3', url: 'https://tvtvhd.com/vivo/canales.php?stream=espn3', provider: 'tvtvhd.com' },
  { name: 'ESPN Premium', url: 'https://tvtvhd.com/vivo/canales.php?stream=espnpremium', provider: 'tvtvhd.com' },
  { name: 'DIRECTV Sports (DSPORTS)', url: 'https://tvtvhd.com/vivo/canales.php?stream=dsports', provider: 'tvtvhd.com' },
  { name: 'Fox Sports', url: 'https://tvtvhd.com/vivo/canales.php?stream=foxsports', provider: 'tvtvhd.com' },
  { name: 'Fox Sports 2', url: 'https://tvtvhd.com/vivo/canales.php?stream=foxsports2', provider: 'tvtvhd.com' },
  { name: 'Fox Sports 3', url: 'https://tvtvhd.com/vivo/canales.php?stream=foxsports3', provider: 'tvtvhd.com' },
  { name: 'TyC Sports', url: 'https://tvtvhd.com/vivo/canales.php?stream=tycsports', provider: 'tvtvhd.com' },
  { name: 'Liga1 MAX', url: 'https://tvtvhd.com/vivo/canales.php?stream=liga1max', provider: 'tvtvhd.com' },
];

export function StreamPlayerModal({ streamUrl, homeTeam, awayTeam }: StreamPlayerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Si hay una URL manual en base de datos la priorizamos como primera opción
  const channelsList = streamUrl 
    ? [{ name: 'Señal Personalizada (Grupo)', url: streamUrl, provider: 'Personalizado' }, ...DEFAULT_CHANNELS]
    : DEFAULT_CHANNELS;

  const [activeChannel, setActiveChannel] = useState<ChannelOption>(channelsList[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          // Inicializar canal activo
          setActiveChannel(channelsList[0]);
          setIsOpen(true);
        }}
        className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold shadow-md shadow-primary/10 transition-all hover:scale-[1.01]"
      >
        <Tv className="h-4 w-4" />
        Ver Transmisión en Vivo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl bg-slate-950 border-border/40 p-0 overflow-hidden shadow-2xl rounded-2xl">
          {/* Header */}
          <DialogHeader className="p-4 bg-slate-900 border-b border-border/20 flex flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="truncate">{homeTeam} vs {awayTeam}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span>Reproduciendo:</span>
                <span className="text-primary font-semibold">{activeChannel.name}</span>
              </DialogDescription>
            </div>

            {/* Controles y Selector */}
            <div className="flex items-center gap-2 z-50">
              {/* Selector de Canales Estilizado */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-border/30 text-xs font-semibold text-foreground hover:bg-slate-750 transition-colors"
                >
                  <span>Cambiar de canal</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-slate-900 border border-border/40 shadow-xl overflow-hidden py-1">
                    <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase border-b border-border/20 mb-1">
                      Señales Disponibles
                    </div>
                    {channelsList.map((ch, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveChannel(ch);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col ${
                          activeChannel.url === ch.url 
                            ? 'bg-primary/10 text-primary font-semibold' 
                            : 'text-muted-foreground hover:bg-slate-800 hover:text-foreground'
                        }`}
                      >
                        <span>{ch.name}</span>
                        <span className="text-[9px] text-muted-foreground/50 font-normal">vía {ch.provider}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón Externo de Respaldo */}
              <a
                href={activeChannel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/35 transition-colors"
              >
                <Tv className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ver señal externa</span>
              </a>
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

          {/* Reproductor / Iframe */}
          <div className="relative aspect-video w-full bg-black flex flex-col items-center justify-center p-4">
            <iframe
              src={activeChannel.url}
              className="absolute inset-0 w-full h-full border-none"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
            
            {/* Aviso flotante de seguridad */}
            <div className="absolute bottom-2 left-2 right-2 bg-black/85 backdrop-blur border border-white/10 rounded-lg p-2 flex items-center gap-2 text-[10px] text-muted-foreground z-10">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
              <span>
                Aviso: Señal provista por {activeChannel.provider}. Utiliza un adblocker si experimentas exceso de anuncios emergentes del reproductor de origen.
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
