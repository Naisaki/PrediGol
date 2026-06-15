'use client';

import React, { useState } from 'react';
import { Play, Tv, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface StreamPlayerModalProps {
  streamUrl: string | null;
  homeTeam: string;
  awayTeam: string;
}

export function StreamPlayerModal({ streamUrl, homeTeam, awayTeam }: StreamPlayerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!streamUrl) return null;

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
        <DialogContent className="max-w-4xl bg-slate-950 border-border/40 p-0 overflow-hidden shadow-2xl rounded-2xl">
          <DialogHeader className="p-4 bg-slate-900 border-b border-border/20 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                {homeTeam} vs {awayTeam}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Señal de transmisión en vivo optimizada
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {/* Reproductor / Iframe */}
          <div className="relative aspect-video w-full bg-black flex flex-col items-center justify-center p-4">
            <iframe
              src={streamUrl}
              className="absolute inset-0 w-full h-full border-none"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            />
            
            {/* Aviso flotante de seguridad */}
            <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur border border-white/10 rounded-lg p-2 flex items-center gap-2 text-[10px] text-muted-foreground z-10">
              <ShieldAlert className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span>
                Nota: Esta señal proviene de un servidor externo ({new URL(streamUrl).hostname}). Se recomienda usar un bloqueador de publicidad activo para una mejor experiencia.
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
