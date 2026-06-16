'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState('ES');
  
  // Drag and drop logic
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingActive, setIsDraggingActive] = useState(false);
  const [hoveredGripIndex, setHoveredGripIndex] = useState<number | null>(null);

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
    const savedLocale = localStorage.getItem('locale') || 'ES';
    setLang(savedLocale);

    const handleLocaleChange = () => {
      setLang(localStorage.getItem('locale') || 'ES');
    };
    window.addEventListener('locale-changed', handleLocaleChange);

    // Cargar orden de tarjetas
    const savedOrder = localStorage.getItem('dashboard-card-order');
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        if (Array.isArray(parsed) && parsed.length === 4) {
          setCardOrder(parsed);
          return () => window.removeEventListener('locale-changed', handleLocaleChange);
        }
      } catch (e) {}
    }
    setCardOrder(['groups', 'matches', 'results', 'bracket']);

    return () => window.removeEventListener('locale-changed', handleLocaleChange);
  }, [windowMatches]);

  const t = (key: string) => {
    return dashboardTranslations[lang]?.[key] || dashboardTranslations['ES']?.[key] || key;
  };

  const todayCount = mounted ? todayMatches.length : 0;

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (hoveredGripIndex !== index) {
      e.preventDefault();
      return;
    }
    setIsDraggingActive(true);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...cardOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    
    setCardOrder(newOrder);
    localStorage.setItem('dashboard-card-order', JSON.stringify(newOrder));
    setDraggedIndex(null);
    setHoveredGripIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setHoveredGripIndex(null);
    setTimeout(() => {
      setIsDraggingActive(false);
    }, 100);
  };

  const handleCardClick = (href: string) => {
    if (isDraggingActive) return;
    router.push(href);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cardOrder.map((cardKey, index) => {
            const isHovered = hoveredGripIndex === index;
            
            // Find card configuration
            let cardContent = null;
            if (cardKey === 'groups') {
              cardContent = {
                title: t('myGroupsStat'),
                value: groups.length,
                href: '/groups',
                icon: <Users className="w-5 h-5 text-primary" />,
                trend: { text: '+1', isUp: true }
              };
            } else if (cardKey === 'matches') {
              cardContent = {
                title: t('matchesToday'),
                value: todayCount,
                href: '/matches',
                icon: <Calendar className="w-5 h-5 text-secondary" />,
                trend: { text: '+4', isUp: true }
              };
            } else if (cardKey === 'bracket') {
              cardContent = {
                title: t('bracket'),
                value: '→',
                href: '/world-cup/bracket',
                icon: <Trophy className="w-5 h-5 text-yellow-500" />,
                trend: { text: '+12%', isUp: true }
              };
            } else if (cardKey === 'results') {
              cardContent = {
                title: t('viewResults'),
                value: '→',
                href: '/matches',
                icon: <Target className="w-5 h-5 text-emerald-500" />,
                trend: { text: '→ 0%', isUp: false }
              };
            }

            if (!cardContent) return null;

            return (
              <div
                key={cardKey}
                draggable={hoveredGripIndex === index}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => handleCardClick(cardContent.href)}
                className={`bg-[var(--surface)] py-4 px-4 rounded-2xl border border-transparent dark:border-[var(--border-subtle)] h-full select-none min-h-[110px] w-full flex flex-col justify-between relative overflow-hidden cursor-pointer ${
                  isDraggingActive ? 'transition-none' : 'transition-all duration-300'
                } ${
                  isHovered ? 'scale-[1.02] shadow-lg shadow-primary/5 border-primary/30' : ''
                } ${
                  draggedIndex === index ? 'opacity-40 border-primary/40' : ''
                }`}
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

                {/* Header */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="text-[var(--text-muted)] bg-[var(--surface-hover)] p-1.5 rounded-md flex items-center justify-center">
                      {cardContent.icon}
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-muted)] leading-tight">
                      {cardContent.title}
                    </span>
                  </div>

                  {/* Grip Icon for Drag & Hover Activation */}
                  <div
                    onMouseEnter={() => setHoveredGripIndex(index)}
                    onMouseLeave={() => {
                      if (draggedIndex === null) {
                        setHoveredGripIndex(null);
                      }
                    }}
                    className="opacity-30 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 -m-1 z-30 select-none flex items-center justify-center text-[var(--text)]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M5 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                      <path d="M5 15m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                      <path d="M12 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                      <path d="M12 15m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                      <path d="M19 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                      <path d="M19 15m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                    </svg>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-baseline justify-between relative z-10 mt-4">
                  <div className="text-lg xs:text-xl font-bold text-[var(--text)] leading-tight">
                    {cardContent.value}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${
                    cardContent.trend.isUp ? 'text-emerald-500 dark:text-emerald-400' : 'text-zinc-500'
                  }`}>
                    {cardContent.trend.isUp ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3"
                      >
                        <path d="m3 17 6-6 4 4 8-8" />
                        <path d="M14 7h7v7" />
                      </svg>
                    ) : null}
                    <span>{cardContent.trend.text}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
