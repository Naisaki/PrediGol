'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApiDelayNotice } from '@/components/common/api-delay-notice';
import { InteractiveBracketWrapper } from './interactive-bracket-wrapper';
import type { Match, MatchStage } from '@/types/app.types';

interface BracketClientProps {
  initialMatches: Match[];
}

const bracketTranslations: Record<string, Record<string, string>> = {
  ES: {
    headerTitle: 'Fase de Eliminación Directa',
    headerDesc: 'Llaves y brackets del Mundial desde Octavos hasta la Gran Final',
    noMatches: 'Las llaves se generarán automáticamente conforme finalice la fase de grupos.',
    tbd: 'Por definir',
    live: 'En Vivo',
    finished: 'Finalizado',
    scheduled: 'Programado',
    dragToMove: 'Arrastrar para mover',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    reset: 'Restablecer vista',
    ROUND_OF_16: 'Octavos de Final',
    QUARTER_FINALS: 'Cuartos de Final',
    SEMI_FINALS: 'Semifinales',
    THIRD_PLACE: 'Tercer Puesto',
    FINAL: 'Gran Final',
  },
  EN: {
    headerTitle: 'Knockout Stage',
    headerDesc: 'World Cup brackets and matches from Round of 16 to the Grand Final',
    noMatches: 'Brackets will be generated automatically as the group stage concludes.',
    tbd: 'TBD',
    live: 'Live',
    finished: 'Finished',
    scheduled: 'Scheduled',
    dragToMove: 'Drag to move',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    reset: 'Reset view',
    ROUND_OF_16: 'Round of 16',
    QUARTER_FINALS: 'Quarter-finals',
    SEMI_FINALS: 'Semi-finals',
    THIRD_PLACE: 'Third Place Playoff',
    FINAL: 'Grand Final',
  },
  FR: {
    headerTitle: "Phase d'élimination directe",
    headerDesc: 'Tableau et matchs de la Coupe du Monde des huitièmes à la grande finale',
    noMatches: 'Les tableaux seront générés automatiquement à la fin de la phase de groupes.',
    tbd: 'À déterminer',
    live: 'En Direct',
    finished: 'Terminé',
    scheduled: 'Programmé',
    dragToMove: 'Faites glisser pour déplacer',
    zoomIn: 'Zoomer',
    zoomOut: 'Dézoomer',
    reset: 'Réinitialiser',
    ROUND_OF_16: 'Huitièmes de finale',
    QUARTER_FINALS: 'Quarts de finale',
    SEMI_FINALS: 'Demi-finales',
    THIRD_PLACE: 'Match pour la 3e place',
    FINAL: 'Grande Finale',
  },
  IT: {
    headerTitle: 'Fase a eliminazione diretta',
    headerDesc: 'Tabellone e partite del Mondiale dagli ottavi alla finalissima',
    noMatches: 'I tabelloni verranno generati automaticamente al termine della fase a gironi.',
    tbd: 'Da definire',
    live: 'Dal Vivo',
    finished: 'Terminato',
    scheduled: 'Programmato',
    dragToMove: 'Trascina per spostare',
    zoomIn: 'Ingrandisci',
    zoomOut: 'Rimpicciolisci',
    reset: 'Ripristina vista',
    ROUND_OF_16: 'Ottavi di finale',
    QUARTER_FINALS: 'Quarti di finale',
    SEMI_FINALS: 'Semifinali',
    THIRD_PLACE: 'Finale 3° posto',
    FINAL: 'Finalissima',
  },
  JA: {
    headerTitle: 'ノックアウトステージ',
    headerDesc: 'ラウンド16から決勝までのワールドカップトーナメント表',
    noMatches: 'グループステージ終了後、トーナメント表が自動的に生成されます。',
    tbd: '未定',
    live: 'ライブ',
    finished: '終了',
    scheduled: '予定',
    dragToMove: 'ドラッグして移動',
    zoomIn: '拡大',
    zoomOut: '縮小',
    reset: 'リセット',
    ROUND_OF_16: 'ラウンド16',
    QUARTER_FINALS: '準々決勝',
    SEMI_FINALS: '準決勝',
    THIRD_PLACE: '3位決定戦',
    FINAL: '決勝戦',
  },
  KO: {
    headerTitle: '결선 토너먼트',
    headerDesc: '16강부터 결승전까지의 월드컵 토너먼트 대진표',
    noMatches: '조별 리그가 종료되면 대진표가 자동으로 생성됩니다.',
    tbd: '미정',
    live: '라이브',
    finished: '종료됨',
    scheduled: '예정됨',
    dragToMove: '드래그하여 이동',
    zoomIn: '확대',
    zoomOut: '축소',
    reset: '초기화',
    ROUND_OF_16: '16강전',
    QUARTER_FINALS: '8강전',
    SEMI_FINALS: '준결승전',
    THIRD_PLACE: '3위 결정전',
    FINAL: '결승전',
  },
};

export function BracketClient({ initialMatches }: BracketClientProps) {
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
    return bracketTranslations[lang]?.[key] || bracketTranslations['ES']?.[key] || key;
  };

  const stagesOrder: MatchStage[] = [
    'ROUND_OF_16',
    'QUARTER_FINALS',
    'SEMI_FINALS',
    'THIRD_PLACE',
    'FINAL',
  ];

  // Agrupar y ordenar partidos por fase
  const matchesByStage = initialMatches.reduce((acc, match) => {
    const normalizedStage = (match.stage as any) === 'LAST_16' ? 'ROUND_OF_16' : match.stage;
    if (normalizedStage && stagesOrder.includes(normalizedStage as MatchStage)) {
      const stageKey = normalizedStage as MatchStage;
      if (!acc[stageKey]) acc[stageKey] = [];
      acc[stageKey].push(match);
    }
    return acc;
  }, {} as Record<MatchStage, Match[]>);

  // Ordenar los partidos dentro de cada fase por kickoffTime
  stagesOrder.forEach((stage) => {
    if (matchesByStage[stage]) {
      matchesByStage[stage].sort((a, b) => {
        const aTime = a.kickoffTime || (a as any).kickoff_time || a.utcDate;
        const bTime = b.kickoffTime || (b as any).kickoff_time || b.utcDate;
        return new Date(aTime).getTime() - new Date(bTime).getTime();
      });
    } else {
      matchesByStage[stage] = [];
    }
  });

  const hasKnockoutMatches = stagesOrder.some((stage) => matchesByStage[stage].length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text)]">
          <Trophy className="h-6 w-6 text-yellow-400" />
          {t('headerTitle')}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {t('headerDesc')}
        </p>
      </div>

      <ApiDelayNotice />

      {!hasKnockoutMatches ? (
        <Card className="glass-card border-border/40">
          <CardContent className="text-center py-16">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {t('noMatches')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <InteractiveBracketWrapper
          translations={{
            zoomIn: t('zoomIn'),
            zoomOut: t('zoomOut'),
            reset: t('reset'),
            dragToMove: t('dragToMove'),
          }}
        >
          <div className="min-w-[1400px] flex gap-8 px-4 py-8">
            {stagesOrder.map((stage) => {
              const matches = matchesByStage[stage];
              return (
                <div key={stage} className="w-[260px] flex flex-col space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center border-b border-border/30 pb-2">
                    {t(stage)}
                  </h3>

                  <div className="flex-1 flex flex-col justify-around py-4 space-y-6 min-h-[500px]">
                    {matches.length === 0 ? (
                      <div className="p-4 bg-muted/5 border border-dashed border-border/30 rounded-xl text-center text-xs text-muted-foreground py-10">
                        {t('tbd')}
                      </div>
                    ) : (
                      matches.map((match) => (
                        <div key={match.id} className="relative group w-full">
                          <BracketMatchCard match={match} t={t} lang={lang} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </InteractiveBracketWrapper>
      )}
    </div>
  );
}

interface BracketMatchCardProps {
  match: Match;
  t: (key: string) => string;
  lang: string;
}

function BracketMatchCard({ match, t, lang }: BracketMatchCardProps) {
  const matchTimeStr = match.kickoffTime || (match as any).kickoff_time || match.utcDate;
  const lowercaseLang = lang.toLowerCase();

  const formattedTime = matchTimeStr
    ? new Date(matchTimeStr).toLocaleTimeString(lowercaseLang, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : t('tbd');

  const formattedDate = matchTimeStr
    ? new Date(matchTimeStr).toLocaleDateString(lowercaseLang, {
        day: 'numeric',
        month: 'short',
      })
    : t('tbd');

  const isLive = ['in_play', 'paused'].includes(match.status);
  const isFinished = match.status === 'finished';

  const homeWinner = isFinished && match.winner === 'home';
  const awayWinner = isFinished && match.winner === 'away';

  return (
    <Card className="glass-card border-border/40 hover:border-primary/30 transition-all hover:shadow-md hover:shadow-primary/5">
      <CardContent className="p-3.5 space-y-3">
        {/* Match Header */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {formattedDate} - {formattedTime}
            </span>
          </div>
          {isLive ? (
            <Badge className="bg-red-500/10 hover:bg-red-500/10 text-red-500 border-red-500/20 text-[9px] px-1.5 py-0">
              {t('live')}
            </Badge>
          ) : isFinished ? (
            <Badge className="bg-muted/80 hover:bg-muted/80 text-muted-foreground text-[9px] px-1.5 py-0 border-none">
              {t('finished')}
            </Badge>
          ) : (
            <Badge className="bg-primary/10 hover:bg-primary/10 text-primary text-[9px] px-1.5 py-0 border-none">
              {t('scheduled')}
            </Badge>
          )}
        </div>

        {/* Teams and Scores */}
        <div className="space-y-2">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {match.homeTeamCrest ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={match.homeTeamCrest}
                  alt={match.homeTeamName ?? t('tbd')}
                  className="w-4 h-4 object-contain"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[7px] font-bold">
                  H
                </div>
              )}
              <span
                className={`text-xs ${
                  homeWinner ? 'font-bold text-foreground' : 'text-muted-foreground'
                }`}
              >
                {match.homeTeamName ?? t('tbd')}
              </span>
            </div>
            {match.homeScore !== null && (
              <span
                className={`text-xs font-mono font-bold ${
                  homeWinner ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {match.homeScore}
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {match.awayTeamCrest ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={match.awayTeamCrest}
                  alt={match.awayTeamName ?? t('tbd')}
                  className="w-4 h-4 object-contain"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[7px] font-bold">
                  A
                </div>
              )}
              <span
                className={`text-xs ${
                  awayWinner ? 'font-bold text-foreground' : 'text-muted-foreground'
                }`}
              >
                {match.awayTeamName ?? t('tbd')}
              </span>
            </div>
            {match.awayScore !== null && (
              <span
                className={`text-xs font-mono font-bold ${
                  awayWinner ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {match.awayScore}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
