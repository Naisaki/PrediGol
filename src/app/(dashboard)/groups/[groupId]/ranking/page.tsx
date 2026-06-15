// =============================================================
// app/(dashboard)/groups/[groupId]/ranking/page.tsx
// Tabla de posiciones del grupo
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getGroupRanking, getGroupById, getGroupMembers } from '@/server/services/group.service';
import { Trophy, Medal, Target, Hash, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ranking del Grupo' };

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupRankingPage({ params }: PageProps) {
  const { groupId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Obtener grupo
  const group = await getGroupById(groupId);
  if (!group || !group.isActive) {
    notFound();
  }

  // Verificar membresía
  const members = await getGroupMembers(groupId);
  const currentMember = members.find((m) => m.userId === user.id);
  if (!currentMember) {
    notFound();
  }

  const ranking = await getGroupRanking(groupId);

  const podiumColors = [
    { border: 'border-yellow-400/50', bg: 'bg-yellow-400/10', text: 'text-yellow-400', icon: '🥇' },
    { border: 'border-slate-400/50', bg: 'bg-slate-400/10', text: 'text-slate-400', icon: '🥈' },
    { border: 'border-orange-400/50', bg: 'bg-orange-400/10', text: 'text-orange-400', icon: '🥉' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-secondary" />
          Ranking
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{group?.name}</p>
      </div>

      {ranking.length === 0 ? (
        <Card className="glass-card border-border/40">
          <CardContent className="text-center py-16">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Aún no hay pronósticos en este grupo
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium */}
          {ranking.length >= 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ranking.slice(0, 3).map((entry, idx) => {
                const colors = podiumColors[idx];
                const isCurrentUser = entry.userId === user.id;
                return (
                  <Card
                    key={entry.userId}
                    className={cn(
                      'glass-card border transition-all',
                      colors.border,
                      isCurrentUser && 'ring-1 ring-primary/40',
                    )}
                  >
                    <CardContent className="p-5 text-center">
                      <div className="text-3xl mb-3">{colors.icon}</div>
                      <Avatar className="h-12 w-12 mx-auto mb-2 border-2 border-border/60">
                        <AvatarImage src={entry.avatarUrl ?? ''} />
                        <AvatarFallback className={`${colors.bg} ${colors.text} font-bold text-sm`}>
                          {entry.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-sm truncate">
                        @{entry.username}
                        {isCurrentUser && (
                          <span className="ml-1 text-primary text-xs">(tú)</span>
                        )}
                      </p>
                      <div className={`text-3xl font-black mt-2 ${colors.text}`}>
                        {entry.totalPoints}
                      </div>
                      <p className="text-xs text-muted-foreground">puntos</p>
                      <div className="flex justify-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span>🎯 {entry.exactScores}</span>
                        <span>✅ {entry.correctResults}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Full ranking table */}
          <Card className="glass-card border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tabla completa</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground w-10">#</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Jugador</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Pts</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">🎯</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">✅</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">J</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((entry) => {
                      const isCurrentUser = entry.userId === user.id;
                      return (
                        <tr
                          key={entry.userId}
                          className={cn(
                            'border-b border-border/20 transition-colors hover:bg-muted/20',
                            isCurrentUser && 'bg-primary/5',
                            entry.position === 1 && 'ranking-row-1',
                            entry.position === 2 && 'ranking-row-2',
                            entry.position === 3 && 'ranking-row-3',
                          )}
                        >
                          <td className="p-3 text-muted-foreground font-mono text-xs">
                            {entry.position}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={entry.avatarUrl ?? ''} />
                                <AvatarFallback className="text-xs bg-muted">
                                  {entry.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                @{entry.username}
                                {isCurrentUser && (
                                  <span className="ml-1 text-primary text-xs">★</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-right font-bold text-primary">
                            {entry.totalPoints}
                          </td>
                          <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">
                            {entry.exactScores}
                          </td>
                          <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">
                            {entry.correctResults}
                          </td>
                          <td className="p-3 text-right text-muted-foreground hidden md:table-cell">
                            {entry.predictionsCount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="p-4 border-t border-border/20 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>🎯 Marcadores exactos</span>
                <span>✅ Resultados correctos</span>
                <span>J = Pronósticos realizados</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
