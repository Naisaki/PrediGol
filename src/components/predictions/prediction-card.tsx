'use client';
// =============================================================
// components/predictions/prediction-card.tsx
// Card de partido con inputs de pronóstico
// =============================================================

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Lock, Check, Loader2, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { savePredictionAction } from '@/server/actions/predictions';
import { formatMatchDateTime } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';
import type { MatchForCard, PredictionData } from '@/app/(dashboard)/groups/[groupId]/predictions/page';

interface PredictionCardProps {
  match: MatchForCard;
  prediction: PredictionData | null;
  groupId: string;
  isLocked: boolean;
}

export function PredictionCard({
  match,
  prediction,
  groupId,
  isLocked,
}: PredictionCardProps) {
  const [homeScore, setHomeScore] = useState<string>(
    prediction?.predicted_home_score?.toString() ?? '',
  );
  const [awayScore, setAwayScore] = useState<string>(
    prediction?.predicted_away_score?.toString() ?? '',
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const isFinished = match.status === 'finished';
  const hasResult = match.home_score !== null && match.away_score !== null;

  const handleSave = () => {
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away)) {
      toast.error('Ingresa ambos marcadores para guardar tu pronóstico');
      return;
    }

    if (home < 0 || home > 20 || away < 0 || away > 20) {
      toast.error('Los valores deben estar entre 0 y 20');
      return;
    }

    startTransition(async () => {
      const result = await savePredictionAction(match.id, groupId, home, away);
      if (result.success) {
        toast.success('Pronóstico guardado');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(result.error ?? 'Error al guardar');
      }
    });
  };

  const getStatusBadge = () => {
    switch (match.status) {
      case 'in_play':
      case 'paused':
        return <Badge className="badge-live text-xs">En curso</Badge>;
      case 'finished':
        return <Badge className="badge-finished text-xs">Finalizado</Badge>;
      case 'postponed':
        return <Badge className="badge-postponed text-xs">Postpuesto</Badge>;
      default:
        return null;
    }
  };

  const getPointsBadge = () => {
    if (!prediction || !isFinished) return null;
    const pts = prediction.points_awarded;
    return (
      <div
        className={cn(
          'text-xs font-bold px-2 py-1 rounded-full',
          pts >= 5
            ? 'bg-primary/20 text-primary'
            : pts >= 3
              ? 'bg-secondary/20 text-secondary'
              : pts > 0
                ? 'bg-accent/20 text-accent'
                : 'bg-muted/40 text-muted-foreground',
        )}
      >
        {pts > 0 ? `+${pts} pts` : '0 pts'}
        {prediction.exact_score_hit && ' 🎯'}
        {!prediction.exact_score_hit && prediction.result_hit && ' ✅'}
      </div>
    );
  };

  return (
    <Card
      className={cn(
        'glass-card border-transparent dark:border-[var(--border-subtle)] relative overflow-hidden transition-all duration-300',
        isLocked && 'opacity-90',
        prediction && !isLocked && 'border-primary/25',
      )}
    >
      {/* Dots background pattern */}
      <div 
        className="absolute -inset-[400px] pointer-events-none dots-pattern" 
        style={{
          opacity: 0.8,
          transform: 'rotate(40deg)',
          backgroundSize: '5px 5px',
          '--dot-size': '3px',
          '--light-dot-color': 'rgba(255, 255, 255, 0.25)',
          '--dark-dot-color': 'rgba(0, 0, 0, 0.4)'
        } as React.CSSProperties}
      />
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          zIndex: 20, 
          background: 'radial-gradient(1200px 600px at 0% 0%, rgba(205, 205, 205, 0.09) 0%, rgba(205, 205, 205, 0) 30%, transparent 70%)' 
        }} 
      />

      <CardContent className="p-4 relative z-10">
        {/* Header: fecha, estado, etapa */}
        <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{formatMatchDateTime(match.kickoff_time)}</span>
            {match.group_name && (
              <span className="hidden sm:inline">· Grupo {match.group_name.replace('GROUP_', '')}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {getPointsBadge()}
          </div>
        </div>

        {/* Equipos y marcadores */}
        <div className="flex items-center gap-3">
          {/* Equipo local */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {match.home_team_crest && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={match.home_team_crest}
                alt={match.home_team_name ?? ''}
                className="team-flag"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span className="text-sm font-semibold text-center line-clamp-2 leading-tight">
              {match.home_team_name ?? 'Por definir'}
            </span>
          </div>

          {/* Score central */}
          <div className="flex flex-col items-center gap-3 mx-2">
            {/* Resultado real (si finalizado) */}
            {hasResult && (
              <div className="flex items-center gap-2 text-2xl font-black">
                <span
                  className={cn(
                    match.winner === 'home' ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {match.home_score}
                </span>
                <span className="text-muted-foreground text-sm">—</span>
                <span
                  className={cn(
                    match.winner === 'away' ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {match.away_score}
                </span>
              </div>
            )}

            {/* Inputs de pronóstico */}
            {!isLocked ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="score-input"
                  placeholder="0"
                  disabled={isLocked}
                  id={`home-${match.id}`}
                />
                <span className="text-muted-foreground font-bold text-sm">:</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="score-input"
                  placeholder="0"
                  disabled={isLocked}
                  id={`away-${match.id}`}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xl font-bold bg-[var(--control-bg)] px-3 py-1 rounded-lg border border-[var(--border-subtle)]">
                {prediction ? (
                  <>
                    <span className="font-extrabold text-primary">{prediction.predicted_home_score}</span>
                    <span className="text-muted-foreground font-light">:</span>
                    <span className="font-extrabold text-primary">{prediction.predicted_away_score}</span>
                    <Lock className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5" /> Sin pronóstico
                  </span>
                )}
              </div>
            )}

            {/* VS si no hay resultado */}
            {!hasResult && !isLocked && (
              <span className="text-xs text-muted-foreground/60 -mt-1">vs</span>
            )}
          </div>

          {/* Equipo visitante */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {match.away_team_crest && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={match.away_team_crest}
                alt={match.away_team_name ?? ''}
                className="team-flag"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span className="text-sm font-semibold text-center line-clamp-2 leading-tight">
              {match.away_team_name ?? 'Por definir'}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-4 flex justify-end">
          {isLocked ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              {isFinished ? 'Partido finalizado' : 'Pronóstico bloqueado'}
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending || saved}
              className={cn(
                'gap-2 transition-all',
                saved
                  ? 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/20'
                  : 'bg-primary hover:bg-primary/90',
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : saved ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Guardado
                </>
              ) : (
                <>
                  <Trophy className="h-3.5 w-3.5" />
                  {prediction ? 'Actualizar' : 'Guardar'} pronóstico
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
