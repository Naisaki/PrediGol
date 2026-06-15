// =============================================================
// app/(dashboard)/groups/[groupId]/settings/stats/page.tsx
// Sección: Estadísticas del Grupo (solo lectura)
// =============================================================

import { getGroupStats } from '@/server/services/group.service';
import { SettingsSection } from '@/components/groups/settings/settings-section';
import { StatsCard } from '@/components/groups/settings/stats-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart2, Calendar, Target, Users, Zap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Estadísticas — Configuración' };

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function StatsSettingsPage({ params }: PageProps) {
  const { groupId } = await params;
  const stats = await getGroupStats(groupId);

  const createdDate = new Date(stats.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SettingsSection
      title="Estadísticas del Grupo"
      description="Métricas de actividad y participación de tu grupo."
    >
      <div className="space-y-6">
        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <StatsCard
            icon={<Target className="h-4 w-4" />}
            label="Pronósticos registrados"
            value={stats.totalPredictions}
            colorClass="text-emerald-400"
          />
          <StatsCard
            icon={<BarChart2 className="h-4 w-4" />}
            label="Participación global"
            value={`${stats.participationRate}%`}
            sub="de partidos pronosticados"
            colorClass="text-blue-400"
          />
          <StatsCard
            icon={<Zap className="h-4 w-4" />}
            label="Partidos disponibles"
            value={stats.totalMatches}
            colorClass="text-yellow-400"
          />
          <StatsCard
            icon={<Calendar className="h-4 w-4" />}
            label="Días activo"
            value={stats.daysActive}
            sub={`Creado el ${createdDate}`}
            colorClass="text-purple-400"
          />
        </div>

        {/* Participación por miembro */}
        <Card className="glass-card border-border/40">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Participación por miembro</h3>
            </div>
            {stats.memberStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin datos aún.</p>
            ) : (
              <div className="space-y-3">
                {stats.memberStats.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3">
                    <Avatar className="h-7 w-7 border border-border/40 flex-shrink-0">
                      <AvatarImage src={member.avatarUrl ?? ''} />
                      <AvatarFallback className="text-xs bg-muted/30">
                        {member.username[0]?.toUpperCase() ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium truncate">{member.username}</span>
                        <span className="text-muted-foreground ml-2 flex-shrink-0">{member.predictionsCount} pronósticos</span>
                      </div>
                      <Progress value={member.participationPct} className="h-1.5" />
                    </div>
                    <span className="text-xs font-bold text-primary w-9 text-right">{member.participationPct}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top partidos */}
        {stats.topMatches.length > 0 && (
          <Card className="glass-card border-border/40">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Partidos más pronosticados</h3>
              </div>
              <div className="space-y-2">
                {stats.topMatches.map((match, idx) => (
                  <div key={match.matchId} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                    <span className="text-xs font-black text-muted-foreground w-5">#{idx + 1}</span>
                    <span className="text-sm flex-1 truncate">
                      {match.homeTeamName ?? '?'} vs {match.awayTeamName ?? '?'}
                    </span>
                    <span className="text-xs text-primary font-semibold">{match.predictionsCount} prons.</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SettingsSection>
  );
}
