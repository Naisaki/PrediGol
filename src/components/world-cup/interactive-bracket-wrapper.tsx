'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveBracketWrapperProps {
  children: React.ReactNode;
}

export function InteractiveBracketWrapper({ children }: InteractiveBracketWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Resetear al centro/escala inicial
  const resetZoom = () => {
    setScale(0.85);
    setPosition({ x: 0, y: 0 });
  };

  // Cargar escala inicial recomendada al montar
  useEffect(() => {
    resetZoom();
  }, []);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.4));
  };

  // Eventos de Mouse/Arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    // Evitar que arrastre si hace click en un botón o link de las tarjetas
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Prevenir que se quede trabado si el mouse sale del área
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Eventos Táctiles (Móviles / Tablets)
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full border border-border/30 rounded-2xl bg-slate-950/20 overflow-hidden min-h-[620px] select-none">
      {/* Panel de Controles Flotante */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1 bg-background/80 backdrop-blur border border-border/40 p-1.5 rounded-lg shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleZoomIn}
          title="Acercar"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleZoomOut}
          title="Alejar"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={resetZoom}
          title="Restablecer vista"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <div className="h-4 w-[1px] bg-border/40 mx-1" />
        <div className="flex items-center gap-1 px-1 text-[10px] text-muted-foreground font-medium">
          <Move className="h-3.5 w-3.5" />
          <span>Arrastrar para mover</span>
        </div>
      </div>

      {/* Área del Lienzo arrastrable */}
      <div
        ref={containerRef}
        className={`w-full h-full min-h-[620px] flex items-center justify-center cursor-grab ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={contentRef}
          className="transition-transform duration-75 ease-out origin-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
