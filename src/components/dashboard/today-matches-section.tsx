'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, Target, Trophy, ChevronRight, Plus } from 'lucide-react';
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

interface Group {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface TodayMatchesSectionProps {
  groups: Group[];
  windowMatches: Match[];
}

const dashboardTranslations: Record<string, Record<string, string>> = {
  ES: {
    myGroups: 'Mis Grupos',
    myGroupsStat: 'Mis grupos',
    matchesToday: 'Partidos hoy',
    viewResults: 'Ver resultados',
    bracket: 'Llaves',
    todayMatches: 'Partidos de Hoy',
    viewAll: 'Ver todos',
    loadingMatches: 'Cargando partidos de hoy...',
    noMatches: 'No hay partidos programados para hoy',
    noGroups: 'Aún no tienes grupos',
    createGroup: 'Crear grupo',
    createNewGroup: 'Crear nuevo grupo',
    live: 'En vivo',
  },
  EN: {
    myGroups: 'My Groups',
    myGroupsStat: 'My groups',
    matchesToday: 'Matches today',
    viewResults: 'View results',
    bracket: 'Bracket',
    todayMatches: "Today's Matches",
    viewAll: 'View all',
    loadingMatches: "Loading today's matches...",
    noMatches: 'No matches scheduled for today',
    noGroups: "You don't have any groups yet",
    createGroup: 'Create group',
    createNewGroup: 'Create new group',
    live: 'Live',
  },
  FR: {
    myGroups: 'Mes Groupes',
    myGroupsStat: 'Mes groupes',
    matchesToday: "Matchs aujourd'hui",
    viewResults: 'Voir les résultats',
    bracket: 'Tableau du Tournoi',
    todayMatches: "Matchs d'aujourd'hui",
    viewAll: 'Voir tout',
    loadingMatches: 'Chargement des matchs...',
    noMatches: "Aucun match prévu aujourd'hui",
    noGroups: "Vous n'avez pas encore de groupes",
    createGroup: 'Créer un groupe',
    createNewGroup: 'Créer un nouveau groupe',
    live: 'En direct',
  },
  IT: {
    myGroups: 'I Miei Gruppi',
    myGroupsStat: 'I miei gruppi',
    matchesToday: 'Partite oggi',
    viewResults: 'Vedi i risultati',
    bracket: 'Tabellone del Torneo',
    todayMatches: 'Partite di Oggi',
    viewAll: 'Vedi tutti',
    loadingMatches: 'Caricamento partite...',
    noMatches: 'Nessuna partita in programma oggi',
    noGroups: 'Non hai ancora nessun gruppo',
    createGroup: 'Crea gruppo',
    createNewGroup: 'Crea nuovo gruppo',
    live: 'Dal vivo',
  },
  JA: {
    myGroups: 'マイグループ',
    myGroupsStat: 'マイグループ',
    matchesToday: '今日の試合',
    viewResults: '結果を見る',
    bracket: 'トーナメント表',
    todayMatches: '今日の試合',
    viewAll: 'すべて見る',
    loadingMatches: '今日の試合を読み込み中...',
    noMatches: '今日の試合予定はありません',
    noGroups: 'グループはまだありません',
    createGroup: 'グループを作成',
    createNewGroup: '新規グループ作成',
    live: 'ライブ',
  },
  KO: {
    myGroups: '내 그룹',
    myGroupsStat: '내 그룹',
    matchesToday: '오늘의 경기',
    viewResults: '결과 보기',
    bracket: '토너먼트 대진표',
    todayMatches: '오늘의 경기',
    viewAll: '모두 보기',
    loadingMatches: '오늘의 경기 불러오는 중...',
    noMatches: '오늘 예정된 경기가 없습니다',
    noGroups: '아직 그룹이 없습니다',
    createGroup: '그룹 만들기',
    createNewGroup: '새 그룹 만들기',
    live: '라이브',
  },
};

export function TodayMatchesSection({ groups, windowMatches }: TodayMatchesSectionProps) {
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState('ES');

  useEffect(() => {
    setMounted(true);
    // Filtrar los partidos que ocurren en la fecha local de hoy del usuario
    const localTodayString = new Date().toDateString();
    const filtered = windowMatches.filter((match) => {
      const matchLocalDate = new Date(match.kickoff_time).toDateString();
      return matchLocalDate === localTodayString;
    });
    setTodayMatches(filtered);

    // Cargar idioma
    const saved = localStorage.getItem('locale') || 'ES';
    setLang(saved);

    const handleLocaleChange = () => {
      setLang(localStorage.getItem('locale') || 'ES');
    };
    window.addEventListener('locale-changed', handleLocaleChange);
    return () => window.removeEventListener('locale-changed', handleLocaleChange);
  }, [windowMatches]);

  const t = (key: string) => {
    return dashboardTranslations[lang]?.[key] || dashboardTranslations['ES']?.[key] || key;
  };

  const todayCount = mounted ? todayMatches.length : 0;

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/groups">
          <Card className="glass-card border-border/40 hover:border-primary/30 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <Users className="h-5 w-5 mb-3 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold mb-0.5">{groups.length}</div>
              <div className="text-xs text-muted-foreground">{t('myGroupsStat')}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/matches">
          <Card className="glass-card border-border/40 hover:border-primary/30 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <Calendar className="h-5 w-5 mb-3 text-secondary group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold mb-0.5">{todayCount}</div>
              <div className="text-xs text-muted-foreground">{t('matchesToday')}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/matches">
          <Card className="glass-card border-border/40 hover:border-primary/30 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <Target className="h-5 w-5 mb-3 text-accent group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold mb-0.5">→</div>
              <div className="text-xs text-muted-foreground">{t('viewResults')}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/world-cup/bracket">
          <Card className="glass-card border-border/40 hover:border-primary/30 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <Trophy className="h-5 w-5 mb-3 text-yellow-400 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold mb-0.5">→</div>
              <div className="text-xs text-muted-foreground">{t('bracket')}</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Grid: Grupos + Partidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mis grupos (Client Rendered) */}
        <Card className="glass-card border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-[var(--text)]">{t('myGroups')}</CardTitle>
            <Link href="/groups">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                {t('viewAll')}
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {groups.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  {t('noGroups')}
                </p>
                <Link href="/groups/create">
                  <Button size="sm" className="bg-primary/90 hover:bg-primary">
                    <Plus className="mr-1 h-4 w-4" />
                    {t('createGroup')}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {groups.slice(0, 3).map((g) => {
                  const initials = g.name
                    .split(' ')
                    .map((word) => word[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <Link key={g.id} href={`/groups/${g.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {g.imageUrl ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-border/60 flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={g.imageUrl}
                                alt={g.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary tracking-wider flex-shrink-0">
                              {initials}
                            </div>
                          )}
                          <span className="text-sm font-medium text-[var(--text)]">{g.name}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  );
                })}
                <Link href="/groups/create">
                  <Button variant="outline" size="sm" className="w-full mt-2 border-dashed border-border/60 text-muted-foreground hover:text-foreground">
                    <Plus className="mr-1 h-4 w-4" />
                    {t('createNewGroup')}
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Partidos de Hoy */}
        <Card className="glass-card border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-[var(--text)]">{t('todayMatches')}</CardTitle>
            <Link href="/matches">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                {t('viewAll')}
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {!mounted ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-muted-foreground/60">{t('loadingMatches')}</p>
              </div>
            ) : todayMatches.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t('noMatches')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayMatches.map((match) => {
                  const hasScore = match.home_score !== null && match.away_score !== null;
                  return (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-3.5 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors border border-border/10"
                    >
                      <div className="flex items-center gap-3 text-sm">
                        {/* Home Team Flag */}
                        <div className="flex items-center gap-1.5">
                          {match.home_team_crest ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={match.home_team_crest}
                              alt={match.home_team_name ?? 'TBD'}
                              className="w-4 h-4 object-contain"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[7px] font-bold">
                              H
                            </div>
                          )}
                          <span className="font-medium text-foreground">{match.home_team_name ?? 'TBD'}</span>
                        </div>

                        <span className="text-muted-foreground font-semibold text-xs">vs</span>

                        {/* Away Team Flag */}
                        <div className="flex items-center gap-1.5">
                          {match.away_team_crest ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={match.away_team_crest}
                              alt={match.away_team_name ?? 'TBD'}
                              className="w-4 h-4 object-contain"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[7px] font-bold">
                              A
                            </div>
                          )}
                          <span className="font-medium text-foreground">{match.away_team_name ?? 'TBD'}</span>
                        </div>
                      </div>
                      
                      <div className="text-xs font-semibold text-primary">
                        {match.status === 'in_play' || match.status === 'paused' ? (
                          <span className="text-red-500 animate-pulse font-bold">{t('live')}</span>
                        ) : hasScore ? (
                          <span className="text-foreground font-bold">{match.home_score} - {match.away_score}</span>
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
