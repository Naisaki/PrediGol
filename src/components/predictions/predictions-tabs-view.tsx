'use client';
// =============================================================
// components/predictions/predictions-tabs-view.tsx
// Vista con pestañas interactivas para filtrar pronósticos
// =============================================================

import { useState, useMemo } from 'react';
import { PredictionCard } from './prediction-card';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Trophy, Play, CheckCircle2, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PredictionsTabsViewProps {
  matches: any[];
  predictions: any[];
  groupId: string;
}

type TabType = 'pending' | 'live' | 'results' | 'predicted';

export function PredictionsTabsView({
  matches,
  predictions,
  groupId,
}: PredictionsTabsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  const predictionsMap = useMemo(() => {
    return new Map(predictions.map((p) => [p.match_id, p]));
  }, [predictions]);

  // Filtrar y clasificar partidos en base al estado del juego y hora actual
  const categorizedMatches = useMemo(() => {
    const now = new Date();
    const pendingList: any[] = [];
    const liveList: any[] = [];
    const resultsList: any[] = [];
    const predictedList: any[] = [];

    for (const match of matches) {
      const kickoff = new Date(match.kickoff_time);
      const hasPrediction = predictionsMap.has(match.id);

      // Si tiene predicción guardada por el usuario
      if (hasPrediction) {
        predictedList.push(match);
      }

      if (match.status === 'finished') {
        resultsList.push(match);
      } else if (match.status === 'in_play' || match.status === 'paused' || now >= kickoff) {
        liveList.push(match);
      } else {
        pendingList.push(match);
      }
    }

    return {
      pending: pendingList,
      live: liveList,
      results: resultsList,
      predicted: predictedList,
    };
  }, [matches, predictionsMap]);

  const activeMatches = categorizedMatches[activeTab];

  // Agrupar los partidos activos por fecha para una mejor lectura
  const groupedMatches = useMemo(() => {
    const grouped = new Map<string, any[]>();

    for (const match of activeMatches) {
      const date = match.kickoff_time.split('T')[0];
      if (!grouped.has(date)) grouped.set(date, []);
      grouped.get(date)!.push(match);
    }

    return Array.from(grouped.entries()).map(([date, dateMatches]) => ({
      date,
      matches: dateMatches,
    }));
  }, [activeMatches]);

  const tabsConfig = [
    {
      id: 'pending' as TabType,
      label: 'Pendientes',
      icon: Target,
      count: categorizedMatches.pending.length,
      colorClass: 'text-primary bg-primary/10 border-primary/20',
      activeClass: 'bg-primary/20 text-primary border-primary/40',
      emptyText: 'No hay partidos pendientes para pronosticar.',
    },
    {
      id: 'live' as TabType,
      label: 'En Vivo',
      icon: Play,
      count: categorizedMatches.live.length,
      colorClass: 'text-red-500 bg-red-500/10 border-red-500/20',
      activeClass: 'bg-red-500/20 text-red-500 border-red-500/40',
      emptyText: 'No hay partidos jugándose en este momento.',
    },
    {
      id: 'results' as TabType,
      label: 'Resultados',
      icon: CheckCircle2,
      count: categorizedMatches.results.length,
      colorClass: 'text-secondary bg-secondary/10 border-secondary/20',
      activeClass: 'bg-secondary/20 text-secondary border-secondary/40',
      emptyText: 'Aún no hay resultados registrados.',
    },
    {
      id: 'predicted' as TabType,
      label: 'Guardados',
      icon: BookmarkCheck,
      count: categorizedMatches.predicted.length,
      colorClass: 'text-accent bg-accent/10 border-accent/20',
      activeClass: 'bg-accent/20 text-accent border-accent/40',
      emptyText: 'Aún no has guardado ningún pronóstico en este grupo.',
    },
  ];

  const currentTabConfig = tabsConfig.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-6">
      {/* Selector de Pestañas Moderno */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center justify-between p-3.5 rounded-xl border transition-all text-left duration-200 outline-none cursor-pointer',
                isActive
                  ? tab.activeClass + ' shadow-md shadow-black/10 scale-[1.01]'
                  : 'glass-card border-border/40 hover:border-border/80 hover:bg-muted/10 text-muted-foreground'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn('h-4.5 w-4.5', isActive ? 'animate-pulse' : '')} />
                <span className="font-semibold text-sm">{tab.label}</span>
              </div>
              <span
                className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-full',
                  isActive ? 'bg-background/40' : tab.colorClass
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista de Partidos */}
      {groupedMatches.length === 0 ? (
        <Card className="glass-card border-border/40">
          <CardContent className="text-center py-20">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm font-medium">{currentTabConfig.emptyText}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedMatches.map(({ date, matches: dayMatches }) => (
            <div key={date} className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">
                {formatGroupDate(date)}
              </h3>
              <div className="space-y-3">
                {dayMatches.map((match: any) => {
                  const prediction = predictionsMap.get(match.id) ?? null;
                  const now = new Date();
                  const isLocked = Boolean(
                    match.is_locked || now >= new Date(match.kickoff_time)
                  );

                  return (
                    <PredictionCard
                      key={match.id}
                      match={match}
                      prediction={prediction as any}
                      groupId={groupId}
                      isLocked={isLocked}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Helpers de formato de fecha ---------------------------

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (dateStr === today.toISOString().split('T')[0]) return 'Hoy';
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Mañana';

  return date.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
