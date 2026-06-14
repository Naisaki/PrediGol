// =============================================================
// app/(dashboard)/world-cup/groups/page.tsx
// Grupos del Mundial / Tabla de posiciones de la FIFA
// =============================================================

import { Trophy, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiDelayNotice } from '@/components/common/api-delay-notice';
import { getWorldCupStandings } from '@/server/services/match.service';
import type { WorldCupStanding } from '@/types/app.types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grupos del Mundial',
  description: 'Tabla de posiciones y grupos del Mundial FIFA 2026.',
};

export default async function WorldCupGroupsPage() {
  const standings = await getWorldCupStandings();

  // Agrupar por nombre de grupo (Group A, Group B, etc.)
  const groupedStandings = standings.reduce((acc, curr) => {
    const group = curr.groupName;
    if (!acc[group]) acc[group] = [];
    acc[group].push(curr);
    return acc;
  }, {} as Record<string, WorldCupStanding[]>);

  const groupKeys = Object.keys(groupedStandings).sort();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-accent" />
          Grupos del Mundial
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Posiciones actualizadas del torneo de la FIFA
        </p>
      </div>

      <ApiDelayNotice />

      {standings.length === 0 ? (
        <Card className="glass-card border-border/40">
          <CardContent className="text-center py-16">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Las tablas de posiciones se cargarán cuando empiece el torneo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {groupKeys.map((groupName) => {
            const table = groupedStandings[groupName];
            // Format Group Name (e.g., "GROUP_A" -> "Grupo A")
            const formattedGroupName = groupName
              .replace('GROUP_', 'Grupo ')
              .replace('Group ', 'Grupo ');

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
                        <TableHead className="w-12 text-center text-xs font-semibold">Pos</TableHead>
                        <TableHead className="text-xs font-semibold">Equipo</TableHead>
                        <TableHead className="w-10 text-center text-xs font-semibold" title="Partidos Jugados">PJ</TableHead>
                        <TableHead className="w-10 text-center text-xs font-semibold" title="Ganados">G</TableHead>
                        <TableHead className="w-10 text-center text-xs font-semibold" title="Empatados">E</TableHead>
                        <TableHead className="w-10 text-center text-xs font-semibold" title="Perdidos">P</TableHead>
                        <TableHead className="w-12 text-center text-xs font-semibold" title="Goles a Favor : Goles en Contra">Goles</TableHead>
                        <TableHead className="w-10 text-center text-xs font-semibold" title="Diferencia de Goles">DG</TableHead>
                        <TableHead className="w-12 text-center text-xs font-bold text-foreground">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.map((row) => (
                        <TableRow
                          key={row.id}
                          className="border-border/20 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="text-center font-bold text-xs py-3">
                            <span
                              className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                                row.position <= 2
                                  ? 'bg-primary/15 text-primary text-[11px]'
                                  : 'text-muted-foreground'
                              }`}
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
                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold">
                                  {row.teamName.substring(0, 3).toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium text-sm text-foreground truncate max-w-[120px] sm:max-w-none">
                                {row.teamName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground py-3">{row.playedGames}</TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground py-3">{row.won}</TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground py-3">{row.draw}</TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground py-3">{row.lost}</TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground py-3">
                            {row.goalsFor}:{row.goalsAgainst}
                          </TableCell>
                          <TableCell
                            className={`text-center text-xs font-semibold py-3 ${
                              row.goalDifference > 0
                                ? 'text-primary'
                                : row.goalDifference < 0
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm text-foreground py-3">{row.points}</TableCell>
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
