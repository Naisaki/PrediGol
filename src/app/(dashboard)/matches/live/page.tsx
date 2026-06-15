// =============================================================
// app/(dashboard)/matches/live/page.tsx
// Partidos En Vivo (Estado in_play o paused)
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { Radio, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ApiDelayNotice } from '@/components/common/api-delay-notice';
import { LocalTime } from '@/components/common/local-time';
import { StreamPlayerModal } from '@/components/matches/stream-player-modal';
import { cn } from '@/lib/utils/cn';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Partidos En Vivo' };
export const revalidate = 10; // Revalidar cada 10 segundos en vivo

export default async function LiveMatchesPage() {
  const supabase = await createClient();

  // Obtener solo partidos en juego (in_play) o descanso (paused)
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('id, home_team_name, away_team_name, home_team_crest, away_team_crest, kickoff_time, status, home_score, away_score, winner, group_name, stage, last_updated_from_api, manually_updated, stream_url')
    .in('status', ['in_play', 'paused'])
    .order('kickoff_time', { ascending: true });

  // Obtener última sincronización
  const { data: syncLogs, error: syncError } = await supabase
    .from('sync_logs')
    .select('completed_at')
    .eq('sync_type', 'today_matches')
    .eq('status', 'success')
    .order('completed_at', { ascending: false })
    .limit(1);

  if (matchesError || syncError) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg space-y-2">
        <h2 className="font-bold text-lg">Error de Base de Datos</h2>
        <p className="text-sm">No se pudo cargar la información de partidos en vivo.</p>
        <pre className="text-xs font-mono bg-background/50 p-3 rounded overflow-auto">
          {JSON.stringify({ matchesError, syncError }, null, 2)}
        </pre>
      </div>
    );
  }

  const lastSync = syncLogs && syncLogs.length > 0 ? syncLogs[0] : null;

  const lastSyncTime = lastSync?.completed_at
    ? new Date(lastSync.completed_at).toLocaleTimeString('es', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="relative flex h-3 w-3 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Partidos En Vivo
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Resultados y estado de los partidos en tiempo real
          </p>
        </div>
        {lastSyncTime && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3 animate-spin-slow" />
            Actualizado {lastSyncTime}
          </div>
        )}
      </div>

      <ApiDelayNotice />

      {/* Matches */}
      {!matches || matches.length === 0 ? (
        <Card className="glass-card border-border/40">
          <CardContent className="text-center py-16">
            <Radio className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium mb-1">
              No hay partidos jugándose en este momento
            </p>
            <p className="text-xs text-muted-foreground/60">
              Cuando inicien los partidos programados para hoy, los verás listados aquí en vivo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchStatusCard key={match.id} match={match as any} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- MatchStatusCard ----------------------------------------

interface MatchStatusCardProps {
  match: {
    id: string;
    home_team_name: string | null;
    away_team_name: string | null;
    home_team_crest: string | null;
    away_team_crest: string | null;
    kickoff_time: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
    winner: string | null;
    group_name: string | null;
    stage: string | null;
    last_updated_from_api: string | null;
    manually_updated: boolean;
    stream_url: string | null;
  };
}

function MatchStatusCard({ match }: MatchStatusCardProps) {
  const isLive = match.status === 'in_play' || match.status === 'paused';
  const isFinished = match.status === 'finished';
  const hasScore = match.home_score !== null && match.away_score !== null;

  const statusConfig: Record<string, { label: string; className: string }> = {
    scheduled: { label: 'Programado', className: 'badge-scheduled' },
    timed: { label: 'Programado', className: 'badge-scheduled' },
    in_play: { label: '⚽ En curso', className: 'badge-live' },
    paused: { label: '⏸ Descanso', className: 'badge-live' },
    finished: { label: 'Finalizado', className: 'badge-finished' },
    postponed: { label: 'Postpuesto', className: 'badge-postponed' },
    suspended: { label: 'Suspendido', className: 'badge-postponed' },
    cancelled: { label: 'Cancelado', className: 'badge-postponed' },
  };

  const config = statusConfig[match.status] ?? statusConfig.scheduled;

  return (
    <Card
      className={cn(
        'glass-card border-border/40 transition-all border-primary/30 shadow-lg shadow-primary/5',
      )}
    >
      <CardContent className="p-5">
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              <LocalTime utcDate={match.kickoff_time} />
            </span>
            {match.group_name && (
              <span>· Grupo {match.group_name.replace('GROUP_', '')}</span>
            )}
          </div>
          <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium animate-pulse', config.className)}>
            {config.label}
          </span>
        </div>

        {/* Teams and score */}
        <div className="flex items-center gap-4">
          {/* Home team */}
          <div className="flex-1 flex flex-col items-center gap-2 text-center">
            {match.home_team_crest && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={match.home_team_crest}
                alt={match.home_team_name ?? ''}
                className="team-flag w-8 h-6"
              />
            )}
            <span
              className={cn(
                'font-semibold text-sm',
                match.winner === 'home' && 'text-primary',
              )}
            >
              {match.home_team_name ?? 'Por definir'}
            </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center min-w-[80px]">
            {hasScore ? (
              <div className="flex items-center gap-2 text-3xl font-black">
                <span className={match.winner === 'home' ? 'text-primary' : ''}>
                  {match.home_score}
                </span>
                <span className="text-muted-foreground text-lg">-</span>
                <span className={match.winner === 'away' ? 'text-primary' : ''}>
                  {match.away_score}
                </span>
              </div>
            ) : (
              <div className="text-xl font-bold text-muted-foreground">
                <LocalTime utcDate={match.kickoff_time} />
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex flex-col items-center gap-2 text-center">
            {match.away_team_crest && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={match.away_team_crest}
                alt={match.away_team_name ?? ''}
                className="team-flag w-8 h-6"
              />
            )}
            <span
              className={cn(
                'font-semibold text-sm',
                match.winner === 'away' && 'text-primary',
              )}
            >
              {match.away_team_name ?? 'Por definir'}
            </span>
          </div>
        </div>

        {/* Stream player premium trigger */}
        <StreamPlayerModal
          streamUrl={match.stream_url}
          homeTeam={match.home_team_name ?? 'Por definir'}
          awayTeam={match.away_team_name ?? 'Por definir'}
        />

        {/* Footer */}
        {(match.last_updated_from_api || match.manually_updated) && (
          <div className="mt-3 text-xs text-muted-foreground/60 text-right">
            {match.manually_updated ? '✏️ Actualizado manualmente' : '🔄 Actualizado desde API'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
