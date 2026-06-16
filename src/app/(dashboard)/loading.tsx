import React from 'react';
import { Trophy } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Anillo de carga exterior brillante (Verde fútbol) */}
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        
        {/* Icono central de trofeo que pulsa */}
        <div className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-border/40">
          <Trophy className="h-5 w-5 text-primary animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-foreground tracking-wide">
          Cargando datos deportivos...
        </p>
        <p className="text-xs text-muted-foreground/60">
          Obteniendo información en tiempo real
        </p>
      </div>
    </div>
  );
}
