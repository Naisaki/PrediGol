'use client';

import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiDelayNotice } from '@/components/common/api-delay-notice';
import { cn } from '@/lib/utils/cn';

interface WorldCupStanding {
  id: string;
  position: number;
  teamName: string;
  teamCrest: string | null;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  groupName: string;
}

interface GroupsClientProps {
  initialStandings: WorldCupStanding[];
}

const groupsTranslations: Record<string, Record<string, string>> = {
  ES: {
    title: 'Grupos del Mundial',
    subtitle: 'Posiciones actualizadas del torneo de la FIFA',
    groupLabel: 'Grupo',
    pos: 'Pos',
    team: 'Equipo',
    played: 'PJ',
    won: 'G',
    draw: 'E',
    lost: 'P',
    goals: 'Goles',
    gd: 'DG',
    pts: 'Pts',
    emptyState: 'Las tablas de posiciones se cargarán cuando empiece el torneo.',
    tooltipPJ: 'Partidos Jugados',
    tooltipG: 'Ganados',
    tooltipE: 'Empatados',
    tooltipP: 'Perdidos',
    tooltipGoles: 'Goles a Favor : Goles en Contra',
    tooltipDG: 'Diferencia de Goles',
  },
  EN: {
    title: 'World Cup Groups',
    subtitle: 'Updated standings of the FIFA tournament',
    groupLabel: 'Group',
    pos: 'Pos',
    team: 'Team',
    played: 'GP',
    won: 'W',
    draw: 'D',
    lost: 'L',
    goals: 'Goals',
    gd: 'GD',
    pts: 'Pts',
    emptyState: 'Standings will be loaded when the tournament begins.',
    tooltipPJ: 'Games Played',
    tooltipG: 'Won',
    tooltipE: 'Drawn',
    tooltipP: 'Lost',
    tooltipGoles: 'Goals For : Goals Against',
    tooltipDG: 'Goal Difference',
  },
  FR: {
    title: 'Groupes de la Coupe du Monde',
    subtitle: 'Classements mis à jour du tournoi de la FIFA',
    groupLabel: 'Groupe',
    pos: 'Pos',
    team: 'Équipe',
    played: 'MJ',
    won: 'G',
    draw: 'N',
    lost: 'P',
    goals: 'Buts',
    gd: 'DB',
    pts: 'Pts',
    emptyState: 'Les classements seront chargés au début du tournoi.',
    tooltipPJ: 'Matchs Joués',
    tooltipG: 'Gagnés',
    tooltipE: 'Nuls',
    tooltipP: 'Perdus',
    tooltipGoles: 'Buts Pour : Buts Contre',
    tooltipDG: 'Différence de Buts',
  },
  IT: {
    title: 'Gruppi della Coppa del Monde',
    subtitle: 'Classifiche aggiornate del torneo FIFA',
    groupLabel: 'Gruppo',
    pos: 'Pos',
    team: 'Squadra',
    played: 'G',
    won: 'V',
    draw: 'N',
    lost: 'P',
    goals: 'Reti',
    gd: 'DR',
    pts: 'Pt',
    emptyState: 'Le classifiche verranno caricate all’inizio del torneo.',
    tooltipPJ: 'Giocate',
    tooltipG: 'Vinte',
    tooltipE: 'Nulle',
    tooltipP: 'Perse',
    tooltipGoles: 'Gol Fatti : Gol Subiti',
    tooltipDG: 'Differenza Reti',
  },
  JA: {
    title: 'ワールドカップグループ順位',
    subtitle: 'FIFAトーナメントの最新順位表',
    groupLabel: 'グループ',
    pos: '順位',
    team: 'チーム',
    played: '試',
    won: '勝',
    draw: '分',
    lost: '敗',
    goals: '得失点',
    gd: '差',
    pts: '点',
    emptyState: '順位表は大会開始後に表示されます。',
    tooltipPJ: '試合数',
    tooltipG: '勝利数',
    tooltipE: '引き分け数',
    tooltipP: '敗戦数',
    tooltipGoles: '得点 : 失점',
    tooltipDG: '得失点差',
  },
  KO: {
    title: '월드컵 조별 순위',
    subtitle: 'FIFA 토너먼트 실시간 조별 순위',
    groupLabel: '조',
    pos: '순위',
    team: '팀',
    played: '경기',
    won: '승',
    draw: '무',
    lost: '패',
    goals: '득실',
    gd: '득실차',
    pts: '승점',
    emptyState: '토너먼트가 시작되면 순위표가 표시됩니다.',
    tooltipPJ: '경기 수',
    tooltipG: '승리',
    tooltipE: '무승부',
    tooltipP: '패배',
    tooltipGoles: '득점 : 실점',
    tooltipDG: '골 득실차',
  },
};

export function GroupsClient({ initialStandings }: GroupsClientProps) {
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
    return groupsTranslations[lang]?.[key] || groupsTranslations['ES']?.[key] || key;
  };

  // Agrupar por nombre de grupo (Group A, Group B, etc.)
  const groupedStandings = initialStandings.reduce((acc, curr) => {
    const group = curr.groupName;
    if (!acc[group]) acc[group] = [];
    acc[group].push(curr);
    return acc;
  }, {} as Record<string, WorldCupStanding[]>);

  const groupKeys = Object.keys(groupedStandings)
    .filter((key) => key.toLowerCase().includes('group') || key.toLowerCase().includes('grupo'))
    .sort();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text)]">
          <Trophy className="h-6 w-6 text-accent" />
          {t('title')}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {t('subtitle')}
        </p>
      </div>

      <ApiDelayNotice />

      {initialStandings.length === 0 ? (
        <Card className="glass-card border-border/40">
          <CardContent className="text-center py-16">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-[var(--text-muted)]">
              {t('emptyState')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {groupKeys.map((groupName) => {
            const table = groupedStandings[groupName];
            // Format Group Name (e.g., "GROUP_A" -> "Group A" -> "Grupo A" translated)
            const groupLetter = groupName.replace('GROUP_', '').replace('Group ', '').replace('Grupo ', '');
            const formattedGroupName = `${t('groupLabel')} ${groupLetter}`;

            return (
              <Card key={groupName} className="glass-card border-border/40 overflow-hidden">
                <CardHeader className="bg-muted/10 border-b border-border/20 py-4">
                  <CardTitle className="text-base font-bold text-primary">
                    {formattedGroupName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/5">
                      <TableRow className="border-border/30 hover:bg-transparent">
                        <TableHead className="w-12 text-center text-xs font-semibold text-[var(--text-muted)]">{t('pos')}</TableHead>
                        <TableHead className="text-xs font-semibold text-[var(--text-muted)]">{t('team')}</TableHead>
                        <TableHead className="w-10 text-center text-xs font-semibold text-[var(--text-muted)]" title={t('tooltipPJ')}>{t('played')}</TableHead>
                        <TableHead className="w-10 text-center text-xs font-semibold text-[var(--text-muted)]" title={t('tooltipG')}>{t('won')}</TableHead>
                        <TableHead className="w-10 text-center text-xs font-semibold text-[var(--text-muted)]" title={t('tooltipE')}>{t('draw')}</TableHead>
                        <TableHead className="w-10 text-center text-xs font-semibold text-[var(--text-muted)]" title={t('tooltipP')}>{t('lost')}</TableHead>
                        <TableHead className="w-12 text-center text-xs font-semibold text-[var(--text-muted)]" title={t('tooltipGoles')}>{t('goals')}</TableHead>
                        <TableHead className="w-10 text-center text-xs font-semibold text-[var(--text-muted)]" title={t('tooltipDG')}>{t('gd')}</TableHead>
                        <TableHead className="w-12 text-center text-xs font-bold text-[var(--text)]">{t('pts')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.map((row) => (
                        <TableRow
                          key={row.id}
                          className="border-border/20 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="text-center font-bold text-xs py-3 text-[var(--text-muted)]">
                            <span
                              className={cn(
                                'inline-flex items-center justify-center w-5 h-5 rounded-full',
                                row.position <= 2
                                  ? 'bg-primary/15 text-primary text-[11px]'
                                  : 'text-[var(--text-muted)]'
                              )}
                            >
                              {row.position}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              {row.teamCrest ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={row.teamCrest}
                                  alt={row.teamName}
                                  className="w-5 h-5 object-contain"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-[var(--text)]">
                                  {row.teamName.substring(0, 3).toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium text-sm text-[var(--text)] truncate max-w-[120px] sm:max-w-none">
                                {row.teamName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs text-[var(--text-muted)] py-3">{row.playedGames}</TableCell>
                          <TableCell className="text-center text-xs text-[var(--text-muted)] py-3">{row.won}</TableCell>
                          <TableCell className="text-center text-xs text-[var(--text-muted)] py-3">{row.draw}</TableCell>
                          <TableCell className="text-center text-xs text-[var(--text-muted)] py-3">{row.lost}</TableCell>
                          <TableCell className="text-center text-xs text-[var(--text-muted)] py-3">
                            {row.goalsFor}:{row.goalsAgainst}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'text-center text-xs font-semibold py-3',
                              row.goalDifference > 0
                                ? 'text-primary'
                                : row.goalDifference < 0
                                ? 'text-destructive'
                                : 'text-[var(--text-muted)]'
                            )}
                          >
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm text-[var(--text)] py-3">{row.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
