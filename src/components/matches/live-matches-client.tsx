'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radio, Clock, RefreshCw, Tv } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ApiDelayNotice } from '@/components/common/api-delay-notice';
import { LocalTime } from '@/components/common/local-time';
import { StreamPlayerModal } from './stream-player-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface Match {
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
}

interface LiveMatchesClientProps {
  initialMatches: Match[];
  lastSyncTime: string | null;
  dbError: any;
}

const liveTranslations: Record<string, Record<string, string>> = {
  ES: {
    title: 'Partidos En Vivo',
    subtitle: 'Resultados y estado de los partidos en tiempo real',
    viewStreams: 'Ver Canales de TV',
    updatedAt: 'Actualizado',
    noMatchesTitle: 'No hay partidos jugándose en este momento',
    noMatchesDesc: 'Cuando inicien los partidos programados para hoy, los verás listados aquí en vivo.',
    exploreStreams: 'Explorar Canales de Transmisión',
    dbErrorTitle: 'Error de Base de Datos',
    dbErrorDesc: 'No se pudo cargar la información de partidos en vivo.',
    scheduled: 'Programado',
    inPlay: '⚽ En curso',
    halfTime: '⏸ Descanso',
    finished: 'Finalizado',
    postponed: 'Postpuesto',
    suspended: 'Suspendido',
    cancelled: 'Cancelado',
    manualUpdate: '✏️ Actualizado manualmente',
    apiUpdate: '🔄 Actualizado desde API',
    group: 'Grupo',
  },
  EN: {
    title: 'Live Matches',
    subtitle: 'Real-time scores and status of the matches',
    viewStreams: 'View TV Channels',
    updatedAt: 'Updated',
    noMatchesTitle: 'No matches playing at the moment',
    noMatchesDesc: "When today's scheduled matches kickoff, they will appear here live.",
    exploreStreams: 'Explore TV Channels',
    dbErrorTitle: 'Database Error',
    dbErrorDesc: 'Could not load live matches info.',
    scheduled: 'Scheduled',
    inPlay: '⚽ In Play',
    halfTime: '⏸ Half Time',
    finished: 'Finished',
    postponed: 'Postponed',
    suspended: 'Suspended',
    cancelled: 'Cancelled',
    manualUpdate: '✏️ Manually updated',
    apiUpdate: '🔄 Updated from API',
    group: 'Group',
  },
  FR: {
    title: 'Matchs en Direct',
    subtitle: 'Résultats et état des matchs en temps réel',
    viewStreams: 'Voir les chaînes TV',
    updatedAt: 'Mis à jour',
    noMatchesTitle: "Aucun match en cours pour le moment",
    noMatchesDesc: "Dès que les matchs programmés aujourd'hui débuteront, ils apparaîtront en direct ici.",
    exploreStreams: 'Explorer les chaînes de diffusion',
    dbErrorTitle: 'Erreur de base de données',
    dbErrorDesc: 'Impossible de charger les infos des matchs en direct.',
    scheduled: 'Programmé',
    inPlay: '⚽ En cours',
    halfTime: '⏸ Mi-temps',
    finished: 'Terminé',
    postponed: 'Reporté',
    suspended: 'Suspendu',
    cancelled: 'Annulé',
    manualUpdate: '✏️ Mis à jour manuellement',
    apiUpdate: '🔄 Mis à jour depuis l’API',
    group: 'Groupe',
  },
  IT: {
    title: 'Partite dal Vivo',
    subtitle: 'Risultati e stato delle partite in tempo reale',
    viewStreams: 'Canali TV',
    updatedAt: 'Aggiornato',
    noMatchesTitle: 'Nessuna partita in corso in questo momento',
    noMatchesDesc: 'Quando inizieranno le partite in programma oggi, le vedrai qui in diretta.',
    exploreStreams: 'Esplora i canali di trasmissione',
    dbErrorTitle: 'Errore del database',
    dbErrorDesc: 'Impossibile caricare le info delle partite in diretta.',
    scheduled: 'Programmata',
    inPlay: '⚽ In corso',
    halfTime: '⏸ Intervallo',
    finished: 'Finita',
    postponed: 'Posticipata',
    suspended: 'Sospesa',
    cancelled: 'Annullata',
    manualUpdate: '✏️ Aggiornato manualmente',
    apiUpdate: '🔄 Aggiornato da API',
    group: 'Gruppo',
  },
  JA: {
    title: 'ライブ試合',
    subtitle: '試合結果 and 進行状況をリアルタイムで表示します',
    viewStreams: 'TVチャンネルを見る',
    updatedAt: '更新日時',
    noMatchesTitle: '現在進行中の試合はありません',
    noMatchesDesc: '本日予定されている試合が開始すると、ここにリアルタイムで表示されます。',
    exploreStreams: '配信チャンネルを見る',
    dbErrorTitle: 'データベースエラー',
    dbErrorDesc: 'ライブ試合情報を読み込めませんでした。',
    scheduled: '予定あり',
    inPlay: '⚽ 試合中',
    halfTime: '⏸ ハーフタイム',
    finished: '終了',
    postponed: '延기',
    suspended: '一時中断',
    cancelled: '中止',
    manualUpdate: '✏️ 手動更新',
    apiUpdate: '🔄 APIから更新',
    group: 'グループ',
  },
  KO: {
    title: '라이브 경기',
    subtitle: '실시간 경기 결과 및 진행 상태',
    viewStreams: 'TV 채널 보기',
    updatedAt: '업데이트됨',
    noMatchesTitle: '현재 진행 중인 경기가 없습니다',
    noMatchesDesc: '오늘 예정된 경기가 시작되면 여기에 실시간으로 표시됩니다.',
    exploreStreams: '실시간 중계 채널 탐색',
    dbErrorTitle: '데이터베이스 오류',
    dbErrorDesc: '라이브 경기 정보를 불러올 수 없습니다.',
    scheduled: '예정됨',
    inPlay: '⚽ 진행 중',
    halfTime: '⏸ 하프타임',
    finished: '종료됨',
    postponed: '연기됨',
    suspended: '중단됨',
    cancelled: '취소됨',
    manualUpdate: '✏️ 수동 업데이트됨',
    apiUpdate: '🔄 API에서 업데이트됨',
    group: '그룹',
  },
};

const stageTranslations: Record<string, Record<string, string>> = {
  ES: {
    GROUP_STAGE: 'Fase de Grupos',
    LAST_32: 'Dieciseisavos de Final',
    LAST_16: 'Octavos de Final',
    ROUND_OF_16: 'Octavos de Final',
    QUARTER_FINALS: 'Cuartos de Final',
    SEMI_FINALS: 'Semifinales',
    FINAL: 'Final',
    THIRD_PLACE: 'Tercer Puesto',
  },
  EN: {
    GROUP_STAGE: 'Group Stage',
    LAST_32: 'Round of 32',
    LAST_16: 'Round of 16',
    ROUND_OF_16: 'Round of 16',
    QUARTER_FINALS: 'Quarter-finals',
    SEMI_FINALS: 'Semi-finals',
    FINAL: 'Final',
    THIRD_PLACE: 'Third Place',
  },
  FR: {
    GROUP_STAGE: 'Phase de Groupes',
    LAST_32: 'Seizièmes de finale',
    LAST_16: 'Huitièmes de finale',
    ROUND_OF_16: 'Huitièmes de finale',
    QUARTER_FINALS: 'Quarts de finale',
    SEMI_FINALS: 'Demi-finales',
    FINAL: 'Finale',
    THIRD_PLACE: 'Troisième place',
  },
  IT: {
    GROUP_STAGE: 'Fase a Gironi',
    LAST_32: 'Sedicesimi di finale',
    LAST_16: 'Ottavi di finale',
    ROUND_OF_16: 'Ottavi di finale',
    QUARTER_FINALS: 'Quarti di finale',
    SEMI_FINALS: 'Semifinali',
    FINAL: 'Finale',
    THIRD_PLACE: 'Terzo posto',
  },
  JA: {
    GROUP_STAGE: 'グループステージ',
    LAST_32: 'ラウンド32',
    LAST_16: 'ラウンド16',
    ROUND_OF_16: 'ラウンド16',
    QUARTER_FINALS: '準々決勝',
    SEMI_FINALS: '準決勝',
    FINAL: '決勝',
    THIRD_PLACE: '3位決定戦',
  },
  KO: {
    GROUP_STAGE: '조별 리그',
    LAST_32: '32강',
    LAST_16: '16강',
    ROUND_OF_16: '16강',
    QUARTER_FINALS: '8강',
    SEMI_FINALS: '4강',
    FINAL: '결승',
    THIRD_PLACE: '3위 결정전',
  },
};

export function LiveMatchesClient({ initialMatches, lastSyncTime, dbError }: LiveMatchesClientProps) {
  const [lang, setLang] = useState('ES');

  useEffect(() => {
    const saved = localStorage.getItem('locale') || 'ES';
    setLang(saved);

    const handleLocaleChange = () => {
      setLang(localStorage.getItem('locale') || 'ES');
    };
    window.addEventListener('locale-changed', handleLocaleChange);
    return () => window.removeEventListener('locale-changed', handleLocaleChange);
  }, []);

  const t = (key: string) => {
    return liveTranslations[lang]?.[key] || liveTranslations['ES']?.[key] || key;
  };

  const getStageLabel = (stage: string | null) => {
    if (!stage) return 'Mundial';
    const key = stage.toUpperCase().replace(/[-\s]/g, '_');
    return stageTranslations[lang]?.[key] || stageTranslations['ES']?.[key] || stage.replace('_', ' ');
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    scheduled: { label: t('scheduled'), className: 'badge-scheduled' },
    timed: { label: t('scheduled'), className: 'badge-scheduled' },
    in_play: { label: t('inPlay'), className: 'badge-live' },
    paused: { label: t('halfTime'), className: 'badge-live' },
    finished: { label: t('finished'), className: 'badge-finished' },
    postponed: { label: t('postponed'), className: 'badge-postponed' },
    suspended: { label: t('suspended'), className: 'badge-postponed' },
    cancelled: { label: t('cancelled'), className: 'badge-postponed' },
  };

  if (dbError) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg space-y-2">
        <h2 className="font-bold text-lg">{t('dbErrorTitle')}</h2>
        <p className="text-sm">{t('dbErrorDesc')}</p>
        <pre className="text-xs font-mono bg-background/50 p-3 rounded overflow-auto">
          {JSON.stringify(dbError, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text)]">
            <span className="relative flex h-3 w-3 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            {t('title')}
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/matches/streams">
            <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary cursor-pointer text-[var(--text)]">
              <Tv className="h-4 w-4" />
              <span>{t('viewStreams')}</span>
            </Button>
          </Link>
          {lastSyncTime && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <RefreshCw className="h-3 w-3 animate-spin-slow" />
              {t('updatedAt')} {lastSyncTime}
            </div>
          )}
        </div>
      </div>

      <ApiDelayNotice />

      {/* Matches */}
      {!initialMatches || initialMatches.length === 0 ? (
        <Card className="glass-card border-border/40">
          <CardContent className="text-center py-16">
            <Radio className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-[var(--text-muted)] font-medium mb-1">
              {t('noMatchesTitle')}
            </p>
            <p className="text-xs text-[var(--text-muted)]/60 mb-6">
              {t('noMatchesDesc')}
            </p>
            <Link href="/matches/streams">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 cursor-pointer">
                <Tv className="h-4 w-4" />
                {t('exploreStreams')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {initialMatches.map((match) => {
            const config = statusConfig[match.status] ?? statusConfig.scheduled;
            const hasScore = match.home_score !== null && match.away_score !== null;

            return (
              <Card
                key={match.id}
                className={cn(
                  'glass-card border-transparent dark:border-[var(--border-subtle)] hover:border-primary/20 transition-all duration-300 relative overflow-hidden shadow-lg shadow-primary/5',
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

                <CardContent className="p-5 relative z-10">
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <Clock className="h-3 w-3" />
                      <span>
                        <LocalTime utcDate={match.kickoff_time} />
                      </span>
                      <span>· {getStageLabel(match.stage)}</span>
                      {match.group_name && (
                        <span>· {t('group')} {match.group_name.replace('GROUP_', '')}</span>
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
                      <span className={cn('font-semibold text-sm text-[var(--text)]', match.winner === 'home' && 'text-primary')}>
                        {match.home_team_name ?? 'Por definir'}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center min-w-[80px]">
                      {hasScore ? (
                        <div className="flex items-center gap-2 text-3xl font-black text-[var(--text)]">
                          <span className={match.winner === 'home' ? 'text-primary' : ''}>
                            {match.home_score}
                          </span>
                          <span className="text-[var(--text-muted)] text-lg">-</span>
                          <span className={match.winner === 'away' ? 'text-primary' : ''}>
                            {match.away_score}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xl font-bold text-[var(--text-muted)]">
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
                      <span className={cn('font-semibold text-sm text-[var(--text)]', match.winner === 'away' && 'text-primary')}>
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
                    <div className="mt-3 text-xs text-[var(--text-muted)]/60 text-right">
                      {match.manually_updated ? t('manualUpdate') : t('apiUpdate')}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
