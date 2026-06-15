'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { LocalTime } from '@/components/common/local-time';
import { cn } from '@/lib/utils/cn';

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface DbMatch {
  id: string;
  external_api_id: number;
  competition_code: string;
  competition_name: string | null;
  season_year: number | null;
  utc_date: string;
  kickoff_time: string;
  status: string;
  matchday: number | null;
  stage: string | null;
  group_name: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  home_team_name: string | null;
  away_team_name: string | null;
  home_team_crest: string | null;
  away_team_crest: string | null;
  home_score: number | null;
  away_score: number | null;
  winner: string | null;
  duration: string | null;
  last_updated_from_api: string | null;
  manually_updated: boolean;
  created_at: string;
  updated_at: string;
}

interface MatchesCalendarProps {
  initialMatches: DbMatch[];
}

export function MatchesCalendar({ initialMatches }: MatchesCalendarProps) {
  // 1. Agrupar partidos por fecha (YYYY-MM-DD en zona horaria local)
  const matchesByDate = useMemo(() => {
    const groups: Record<string, DbMatch[]> = {};
    initialMatches.forEach((match) => {
      if (!match.kickoff_time) return;
      const dateStr = getLocalDateString(new Date(match.kickoff_time));
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(match);
    });
    return groups;
  }, [initialMatches]);

  // 2. Obtener lista ordenada de fechas únicas
  const dates = useMemo(() => {
    return Object.keys(matchesByDate).sort();
  }, [matchesByDate]);

  // 3. Determinar fecha seleccionada por defecto (hoy local, o la primera fecha disponible si hoy no tiene partidos)
  const defaultDate = useMemo(() => {
    const todayStr = getLocalDateString(new Date());
    if (matchesByDate[todayStr]) {
      return todayStr;
    }
    // Si hoy no hay partidos, seleccionar la fecha más cercana al día de hoy, o la primera fecha
    const todayMs = new Date().getTime();
    let closestDate = dates[0] || todayStr;
    let minDiff = Infinity;

    dates.forEach((dateStr) => {
      const diff = Math.abs(new Date(dateStr).getTime() - todayMs);
      if (diff < minDiff) {
        minDiff = diff;
        closestDate = dateStr;
      }
    });

    return closestDate;
  }, [dates, matchesByDate]);

  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);

  // 4. Obtener partidos de la fecha seleccionada
  const activeMatches = useMemo(() => {
    return matchesByDate[selectedDate] ?? [];
  }, [matchesByDate, selectedDate]);

  // Formatear fecha para el botón selector
  const formatBtnDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00'); // Evitar problemas de desfase UTC
    const weekday = date.toLocaleDateString('es', { weekday: 'short' });
    const dayNum = date.toLocaleDateString('es', { day: 'numeric' });
    const month = date.toLocaleDateString('es', { month: 'short' });
    return { weekday, dayNum, month };
  };

  // Formatear título principal de la fecha seleccionada
  const formatHeaderDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Configuración de insignias de estado
  const statusConfig: Record<string, { label: string; className: string }> = {
    scheduled: { label: 'Programado', className: 'badge-scheduled' },
    timed: { label: 'Programado', className: 'badge-scheduled' },
    in_play: { label: '⚽ En vivo', className: 'badge-live' },
    paused: { label: '⏸ Descanso', className: 'badge-live' },
    finished: { label: 'Finalizado', className: 'badge-finished' },
    postponed: { label: 'Postpuesto', className: 'badge-postponed' },
    suspended: { label: 'Suspendido', className: 'badge-postponed' },
    cancelled: { label: 'Cancelado', className: 'badge-postponed' },
  };

  return (
    <div className="space-y-6">
      {/* Selector de Fechas (Carrusel Horizontal) */}
      <div className="relative border-b border-border/40 pb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Calendario del Mundial
          </span>
          <span className="text-xs text-muted-foreground">
            {dates.length} días con partidos
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 -mx-4 sm:mx-0">
          {dates.map((dateStr) => {
            const isSelected = selectedDate === dateStr;
            const { weekday, dayNum, month } = formatBtnDate(dateStr);
            const isTodayDate = getLocalDateString(new Date()) === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                  'flex flex-col items-center p-3 min-w-[72px] rounded-xl border transition-all cursor-pointer select-none',
                  isSelected
                    ? 'bg-primary/15 border-primary text-primary shadow-md shadow-primary/5 scale-105'
                    : 'bg-card/40 border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/30',
                  isTodayDate && !isSelected && 'border-primary/30',
                )}
              >
                <span className="text-[10px] uppercase font-bold tracking-tight mb-1">
                  {isTodayDate ? 'Hoy' : weekday}
                </span>
                <span className="text-lg font-black leading-none mb-1">
                  {dayNum}
                </span>
                <span className="text-[9px] uppercase font-medium">
                  {month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Título del Día Seleccionado */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold capitalize">
          {formatHeaderDate(selectedDate)}
        </h2>
        <span className="text-sm text-muted-foreground">
          {activeMatches.length} {activeMatches.length === 1 ? 'partido' : 'partidos'}
        </span>
      </div>

      {/* Listado de Partidos */}
      {activeMatches.length === 0 ? (
        <Card className="glass-card border-border/40">
          <CardContent className="text-center py-12">
            <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              No hay partidos programados para este día
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeMatches.map((match) => {
            const config = statusConfig[match.status] ?? statusConfig.scheduled;
            const hasScore = match.home_score !== null && match.away_score !== null;

            return (
              <Card
                key={match.id}
                className={cn(
                  'glass-card border-border/40 hover:border-primary/20 transition-all shadow-sm',
                  (match.status === 'in_play' || match.status === 'paused') &&
                    'border-primary/30 shadow-lg shadow-primary/5',
                )}
              >
                <CardContent className="p-4">
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                    <span className="capitalize">
                      {match.stage?.replace('_', ' ').toLowerCase() || 'Mundial'}
                    </span>
                    <span className={cn('px-2 py-0.5 rounded-full border text-[10px] font-semibold', config.className)}>
                      {config.label}
                    </span>
                  </div>

                  {/* Teams & Score */}
                  <div className="flex items-center justify-between gap-4 py-2">
                    {/* Home Team */}
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      {match.home_team_crest && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={match.home_team_crest}
                          alt={match.home_team_name ?? ''}
                          className="team-flag w-7 h-5 flex-shrink-0"
                        />
                      )}
                      <span className={cn('font-semibold text-sm truncate', match.winner === 'home' && 'text-primary')}>
                        {match.home_team_name ?? 'Por definir'}
                      </span>
                    </div>

                    {/* Score or time */}
                    <div className="flex items-center justify-center min-w-[70px] bg-muted/20 px-2 py-1.5 rounded-lg border border-border/20">
                      {hasScore ? (
                        <div className="flex items-center gap-1.5 text-base font-black">
                          <span className={match.winner === 'home' ? 'text-primary' : ''}>
                            {match.home_score}
                          </span>
                          <span className="text-muted-foreground/60 text-xs">-</span>
                          <span className={match.winner === 'away' ? 'text-primary' : ''}>
                            {match.away_score}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-muted-foreground">
                          <LocalTime utcDate={match.kickoff_time} />
                        </div>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 flex items-center justify-end gap-3 min-w-0 text-right">
                      <span className={cn('font-semibold text-sm truncate', match.winner === 'away' && 'text-primary')}>
                        {match.away_team_name ?? 'Por definir'}
                      </span>
                      {match.away_team_crest && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={match.away_team_crest}
                          alt={match.away_team_name ?? ''}
                          className="team-flag w-7 h-5 flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
