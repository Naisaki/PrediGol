'use client';

import { useState, useMemo, useEffect } from 'react';
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
  dbError?: string | null;
}

const calendarTranslations: Record<string, Record<string, string>> = {
  ES: {
    headerTitle: 'Partidos del Mundial',
    headerDesc: 'Calendario completo de encuentros por fecha del Mundial FIFA 2026',
    title: 'Calendario del Mundial',
    daysWithMatches: 'días con partidos',
    match: 'partido',
    matches: 'partidos',
    noMatches: 'No hay partidos programados para este día',
    scheduled: 'Programado',
    live: '⚽ En vivo',
    halfTime: '⏸ Descanso',
    finished: 'Finalizado',
    postponed: 'Postpuesto',
    suspended: 'Suspendido',
    cancelled: 'Cancelado',
    today: 'Hoy',
    dbErrorTitle: 'Error de Base de Datos',
    dbErrorDesc: 'No se pudo cargar el calendario de partidos.',
  },
  EN: {
    headerTitle: 'World Cup Matches',
    headerDesc: 'Complete schedule of matches by date for the FIFA World Cup 2026',
    title: 'World Cup Calendar',
    daysWithMatches: 'days with matches',
    match: 'match',
    matches: 'matches',
    noMatches: 'No matches scheduled for this day',
    scheduled: 'Scheduled',
    live: '⚽ Live',
    halfTime: '⏸ Half Time',
    finished: 'Finished',
    postponed: 'Postponed',
    suspended: 'Suspended',
    cancelled: 'Cancelled',
    today: 'Today',
    dbErrorTitle: 'Database Error',
    dbErrorDesc: 'Could not load matches calendar.',
  },
  FR: {
    headerTitle: 'Matchs de la Coupe du Monde',
    headerDesc: 'Calendrier complet des rencontres par date pour la Coupe du Monde de la FIFA 2026',
    title: 'Calendrier de la Coupe du Monde',
    daysWithMatches: 'jours avec matchs',
    match: 'match',
    matches: 'matchs',
    noMatches: 'Aucun match prévu pour ce jour',
    scheduled: 'Programmé',
    live: '⚽ En direct',
    halfTime: '⏸ Mi-temps',
    finished: 'Terminé',
    postponed: 'Reporté',
    suspended: 'Suspendu',
    cancelled: 'Annulé',
    today: "Aujourd'hui",
    dbErrorTitle: 'Erreur de base de données',
    dbErrorDesc: 'Impossible de charger le calendrier des matchs.',
  },
  IT: {
    headerTitle: 'Partite del Mondiale',
    headerDesc: 'Calendario completo delle partite per data della Coppa del Mondo FIFA 2026',
    title: 'Calendario della Coppa del Mondo',
    daysWithMatches: 'giorni con partite',
    match: 'partita',
    matches: 'partite',
    noMatches: 'Nessuna partita in programma per questo giorno',
    scheduled: 'Programmata',
    live: '⚽ In diretta',
    halfTime: '⏸ Intervallo',
    finished: 'Finita',
    postponed: 'Posticipata',
    suspended: 'Sospesa',
    cancelled: 'Annullata',
    today: 'Oggi',
    dbErrorTitle: 'Errore del database',
    dbErrorDesc: 'Impossibile caricare il calendario delle partite.',
  },
  JA: {
    headerTitle: 'ワールドカップ試合一覧',
    headerDesc: 'FIFAワールドカップ2026の日程・結果一覧',
    title: 'ワールドカップ日程',
    daysWithMatches: '試合日',
    match: '試合',
    matches: '試合',
    noMatches: 'この日の試合予定はありません',
    scheduled: '予定あり',
    live: '⚽ ライブ',
    halfTime: '⏸ ハーフタイム',
    finished: '終了',
    postponed: '延期',
    suspended: '一時中断',
    cancelled: '中止',
    today: '今日',
    dbErrorTitle: 'データベースエラー',
    dbErrorDesc: '試合日程を読み込めませんでした。',
  },
  KO: {
    headerTitle: '월드컵 경기 일정',
    headerDesc: 'FIFA 월드컵 2026 날짜별 전체 경기 일정',
    title: '월드컵 일정',
    daysWithMatches: '경기가 있는 날',
    match: '경기',
    matches: '경기',
    noMatches: '이 날짜에 예정된 경기가 없습니다',
    scheduled: '예정됨',
    live: '⚽ 라이브',
    halfTime: '⏸ 하프타임',
    finished: '종료됨',
    postponed: '연기됨',
    suspended: '중단됨',
    cancelled: '취소됨',
    today: '오늘',
    dbErrorTitle: '데이터베이스 오류',
    dbErrorDesc: '경기 일정을 불러올 수 없습니다.',
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

export function MatchesCalendar({ initialMatches, dbError }: MatchesCalendarProps) {
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
    return calendarTranslations[lang]?.[key] || calendarTranslations['ES']?.[key] || key;
  };

  const getStageLabel = (stage: string | null) => {
    if (!stage) return 'Mundial';
    const key = stage.toUpperCase().replace(/[-\s]/g, '_');
    return stageTranslations[lang]?.[key] || stageTranslations['ES']?.[key] || stage.replace('_', ' ');
  };

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
    const weekday = date.toLocaleDateString(lang.toLowerCase(), { weekday: 'short' });
    const dayNum = date.toLocaleDateString(lang.toLowerCase(), { day: 'numeric' });
    const month = date.toLocaleDateString(lang.toLowerCase(), { month: 'short' });
    return { weekday, dayNum, month };
  };

  // Formatear título principal de la fecha seleccionada
  const formatHeaderDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(lang.toLowerCase(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Configuración de insignias de estado
  const statusConfig: Record<string, { label: string; className: string }> = {
    scheduled: { label: t('scheduled'), className: 'badge-scheduled' },
    timed: { label: t('scheduled'), className: 'badge-scheduled' },
    in_play: { label: t('live'), className: 'badge-live' },
    paused: { label: t('halfTime'), className: 'badge-live' },
    finished: { label: t('finished'), className: 'badge-finished' },
    postponed: { label: t('postponed'), className: 'badge-postponed' },
    suspended: { label: t('suspended'), className: 'badge-postponed' },
    cancelled: { label: t('cancelled'), className: 'badge-postponed' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text)]">
          <Calendar className="h-6 w-6 text-primary" />
          {t('headerTitle')}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {t('headerDesc')}
        </p>
      </div>

      {dbError ? (
        <div className="p-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg space-y-2">
          <h2 className="font-bold text-lg">{t('dbErrorTitle')}</h2>
          <p className="text-sm">{t('dbErrorDesc')}</p>
          <pre className="text-xs font-mono bg-background/50 p-3 rounded overflow-auto">
            {dbError}
          </pre>
        </div>
      ) : (
        <>
          {/* Selector de Fechas (Carrusel Horizontal) */}
          <div className="relative border-b border-border/40 pb-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('title')}
              </span>
              <span className="text-xs text-muted-foreground">
                {dates.length} {t('daysWithMatches')}
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
                      {isTodayDate ? t('today') : weekday}
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
            <h2 className="text-lg font-bold capitalize text-[var(--text)]">
              {formatHeaderDate(selectedDate)}
            </h2>
            <span className="text-sm text-muted-foreground">
              {activeMatches.length} {activeMatches.length === 1 ? t('match') : t('matches')}
            </span>
          </div>

          {/* Listado de Partidos */}
          {activeMatches.length === 0 ? (
            <Card className="glass-card border-border/40">
              <CardContent className="text-center py-12">
                <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">
                  {t('noMatches')}
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
                      'glass-card border-transparent dark:border-[var(--border-subtle)] hover:border-primary/20 transition-all duration-300 relative overflow-hidden shadow-sm',
                      (match.status === 'in_play' || match.status === 'paused') &&
                        'border-primary/30 shadow-lg shadow-primary/5',
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
                      {/* Top row */}
                      <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                        <span className="capitalize text-[var(--text-muted)]">
                          {getStageLabel(match.stage)}
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
                          <span className={cn('font-semibold text-sm truncate text-[var(--text)]', match.winner === 'home' && 'text-primary')}>
                            {match.home_team_name ?? 'Por definir'}
                          </span>
                        </div>

                        {/* Score or time */}
                        <div className="flex items-center justify-center min-w-[70px] bg-muted/20 px-2 py-1.5 rounded-lg border border-border/20">
                          {hasScore ? (
                            <div className="flex items-center gap-1.5 text-base font-black text-[var(--text)]">
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
                          <span className={cn('font-semibold text-sm truncate text-[var(--text)]', match.winner === 'away' && 'text-primary')}>
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
        </>
      )}
    </div>
  );
}
