// =============================================================
// app/(dashboard)/world-cup/bracket/page.tsx
// Llaves del Mundial / Fases de eliminación directa (bracket)
// =============================================================

import { Trophy, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ApiDelayNotice } from '@/components/common/api-delay-notice';
import { getMatches } from '@/server/services/match.service';
import { InteractiveBracketWrapper } from '@/components/world-cup/interactive-bracket-wrapper';
import type { Match, MatchStage } from '@/types/app.types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Llaves del Mundial',
  description: 'Fases de eliminación directa y llaves del Mundial FIFA 2026.',
};

export default async function WorldCupBracketPage() {
  const allMatches = await getMatches();

  const stagesOrder: MatchStage[] = [
    'ROUND_OF_16',
    'QUARTER_FINALS',
    'SEMI_FINALS',
    'THIRD_PLACE',
    'FINAL',
  ];

  // Agrupar y ordenar partidos por fase
  const matchesByStage = allMatches.reduce((acc, match) => {
    // Normalizar a ROUND_OF_16 si la DB tiene LAST_16
    const normalizedStage = (match.stage as any) === 'LAST_16' ? 'ROUND_OF_16' : match.stage;
    if (normalizedStage && stagesOrder.includes(normalizedStage as MatchStage)) {
      const stageKey = normalizedStage as MatchStage;
      if (!acc[stageKey]) acc[stageKey] = [];
      acc[stageKey].push(match);
    }
    return acc;
  }, {} as Record<MatchStage, Match[]>);

  // Ordenar los partidos dentro de cada fase por kickoff_time
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

  const getStageTitle = (stage: MatchStage) => {
    switch (stage) {
      case 'ROUND_OF_16':
        return 'Octavos';
      case 'QUARTER_FINALS':
        return 'Cuartos';
      case 'SEMI_FINALS':
        return 'Semifinales';
      case 'THIRD_PLACE':
        return 'Tercer Puesto';
      case 'FINAL':
        return 'Final';
      default:
        return stage;
    }
  };

  const getStageLongTitle = (stage: MatchStage) => {
    switch (stage) {
      case 'ROUND_OF_16':
        return 'Octavos de Final';
      case 'QUARTER_FINALS':
        return 'Cuartos de Final';
      case 'SEMI_FINALS':
        return 'Semifinales';
      case 'THIRD_PLACE':
        return 'Tercer Puesto';
      case 'FINAL':
        return 'Gran Final';
      default:
        return stage;
    }
  };

  const hasKnockoutMatches = stagesOrder.some((stage) => matchesByStage[stage].length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-400" />
          Fase de Eliminación Directa
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Llaves y brackets del Mundial desde Octavos hasta la Gran Final
        </p>
      </div>

      <ApiDelayNotice />

      {!hasKnockoutMatches ? (
        <Card className="glass-card border-border/40">
          <CardContent className="text-center py-16">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Las llaves se generarán automáticamente conforme finalice la fase de grupos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile view (Vertical list by round selector) */}
          <div className="block lg:hidden">
            <Tabs defaultValue="ROUND_OF_16" className="w-full">
              <TabsList className="grid grid-cols-5 bg-muted/20 border border-border/45 p-1 rounded-lg">
                {stagesOrder.map((stage) => (
                  <TabsTrigger
                    key={stage}
                    value={stage}
                    className="text-[10px] sm:text-xs font-semibold py-1.5"
                  >
                    {getStageTitle(stage)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {stagesOrder.map((stage) => (
                <TabsContent key={stage} value={stage} className="mt-4 space-y-3">
                  <h3 className="text-sm font-bold text-foreground mb-3 px-1">
                    {getStageLongTitle(stage)}
                  </h3>
                  {matchesByStage[stage].length === 0 ? (
                    <div className="text-center py-10 bg-muted/10 border border-border/30 rounded-lg text-xs text-muted-foreground">
                      Partidos por definir
                    </div>
                  ) : (
                    matchesByStage[stage].map((match) => (
                      <BracketMatchCard key={match.id} match={match} />
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Desktop view (Horizontal bracket layout with zoom and drag) */}
          <div className="hidden lg:block">
            <InteractiveBracketWrapper>
              <div className="min-w-[1400px] flex gap-8 px-4 py-8">
                {stagesOrder.map((stage) => {
                  const matches = matchesByStage[stage];
                  return (
                    <div key={stage} className="w-[260px] flex flex-col space-y-4">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center border-b border-border/30 pb-2">
                        {getStageLongTitle(stage)}
                      </h3>

                      <div className="flex-1 flex flex-col justify-around py-4 space-y-6 min-h-[500px]">
                        {matches.length === 0 ? (
                          <div className="p-4 bg-muted/5 border border-dashed border-border/30 rounded-xl text-center text-xs text-muted-foreground py-10">
                            Por definir
                          </div>
                        ) : (
                          matches.map((match) => (
                            <div key={match.id} className="relative group w-full">
                              <BracketMatchCard match={match} />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </InteractiveBracketWrapper>
          </div>
        </>
      )}
    </div>
  );
}

// Sub-component for Bracket Match Card
function BracketMatchCard({ match }: { match: Match }) {
  const matchTimeStr = match.kickoffTime || (match as any).kickoff_time || match.utcDate;
  
  const formattedTime = matchTimeStr
    ? new Date(matchTimeStr).toLocaleTimeString('es', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Por definir';

  const formattedDate = matchTimeStr
    ? new Date(matchTimeStr).toLocaleDateString('es', {
        day: 'numeric',
        month: 'short',
      })
    : 'Por definir';

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
              En Vivo
            </Badge>
          ) : isFinished ? (
            <Badge className="bg-muted/80 hover:bg-muted/80 text-muted-foreground text-[9px] px-1.5 py-0 border-none">
              Finalizado
            </Badge>
          ) : (
            <Badge className="bg-primary/10 hover:bg-primary/10 text-primary text-[9px] px-1.5 py-0 border-none">
              Programado
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
                  alt={match.homeTeamName ?? 'TBD'}
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
                {match.homeTeamName ?? 'Por definir'}
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
                  alt={match.awayTeamName ?? 'TBD'}
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
                {match.awayTeamName ?? 'Por definir'}
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
