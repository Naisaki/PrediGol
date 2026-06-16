'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, Target, Trophy, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocalTime } from '@/components/common/local-time';

interface Match {
  id: string;
  home_team_name: string;
  away_team_name: string;
  home_team_crest: string | null;
  away_team_crest: string | null;
  kickoff_time: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
}

interface TodayMatchesSectionProps {
  groupsCount: number;
  windowMatches: Match[];
  groupsListMarkup: React.ReactNode; // Pasamos el markup de los grupos como children/prop para mantenerlo limpio
}

export function TodayMatchesSection({ groupsCount, windowMatches, groupsListMarkup }: TodayMatchesSectionProps) {
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Filtrar los partidos que ocurren en la fecha local de hoy del usuario
    const localTodayString = new Date().toDateString();
    const filtered = windowMatches.filter((match) => {
      const matchLocalDate = new Date(match.kickoff_time).toDateString();
      return matchLocalDate === localTodayString;
    });
    setTodayMatches(filtered);
  }, [windowMatches]);

  // Si no se ha montado aún en el cliente, mostramos un estado de carga o el fallback básico del servidor
  const todayCount = mounted ? todayMatches.length : 0;

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/groups">
          <Card className="glass-card border-border/40 hover:border-primary/30 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <Users className="h-5 w-5 mb-3 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold mb-0.5">{groupsCount}</div>
              <div className="text-xs text-muted-foreground">Mis grupos</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/matches">
          <Card className="glass-card border-border/40 hover:border-primary/30 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <Calendar className="h-5 w-5 mb-3 text-secondary group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold mb-0.5">{todayCount}</div>
              <div className="text-xs text-muted-foreground">Partidos hoy</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/matches">
          <Card className="glass-card border-border/40 hover:border-primary/30 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <Target className="h-5 w-5 mb-3 text-accent group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold mb-0.5">→</div>
              <div className="text-xs text-muted-foreground">Ver resultados</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/world-cup/bracket">
          <Card className="glass-card border-border/40 hover:border-primary/30 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <Trophy className="h-5 w-5 mb-3 text-yellow-400 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold mb-0.5">→</div>
              <div className="text-xs text-muted-foreground">Llaves</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Grid: Grupos + Partidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mis grupos (markup del servidor) */}
        {groupsListMarkup}

        {/* Partidos de Hoy */}
        <Card className="glass-card border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Partidos de Hoy</CardTitle>
            <Link href="/matches">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                Ver todos
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {!mounted ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-muted-foreground/60">Cargando partidos de hoy...</p>
              </div>
            ) : todayMatches.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay partidos programados para hoy
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayMatches.map((match) => {
                  const hasScore = match.home_score !== null && match.away_score !== null;
                  return (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {match.home_team_crest && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={match.home_team_crest}
                            alt={match.home_team_name}
                            className="team-flag w-6 h-4 flex-shrink-0"
                          />
                        )}
                        <span className="text-xs font-semibold truncate max-w-[80px] sm:max-w-none">
                          {match.home_team_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">vs</span>
                        {match.away_team_crest && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={match.away_team_crest}
                            alt={match.away_team_name}
                            className="team-flag w-6 h-4 flex-shrink-0"
                          />
                        )}
                        <span className="text-xs font-semibold truncate max-w-[80px] sm:max-w-none">
                          {match.away_team_name}
                        </span>
                      </div>
                      
                      <div className="text-xs font-bold text-primary ml-2 flex-shrink-0">
                        {match.status === 'in_play' || match.status === 'paused' ? (
                          <span className="text-red-500 animate-pulse">En vivo</span>
                        ) : hasScore ? (
                          <span className="text-muted-foreground">
                            {match.home_score} - {match.away_score}
                          </span>
                        ) : (
                          <LocalTime utcDate={match.kickoff_time} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
