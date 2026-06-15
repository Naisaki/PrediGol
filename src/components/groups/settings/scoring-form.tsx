'use client';
// =============================================================
// components/groups/settings/scoring-form.tsx
// Formulario de reglas de puntuación con preview en vivo
// =============================================================

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Save, Loader2, Target, CheckCircle2, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { updateScoringRulesAction } from '@/server/actions/groups';

interface ScoringFormProps {
  groupId: string;
  initialData: {
    exactScore: number;
    correctResult: number;
    goalDiff: number;
  };
}

export function ScoringForm({ groupId, initialData }: ScoringFormProps) {
  const [exactScore, setExactScore] = useState(initialData.exactScore);
  const [correctResult, setCorrectResult] = useState(initialData.correctResult);
  const [goalDiff, setGoalDiff] = useState(initialData.goalDiff);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateScoringRulesAction(groupId, exactScore, correctResult, goalDiff);
      if (result.success) {
        toast.success('Reglas de puntuación actualizadas.');
      } else {
        toast.error(result.error ?? 'Error al guardar reglas.');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* Slider: Marcador exacto */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-400" />
            Marcador exacto
          </Label>
          <span className="text-2xl font-black text-emerald-400">{exactScore} pts</span>
        </div>
        <Slider
          min={1} max={10} step={1}
          value={[exactScore]}
          onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setExactScore(arr[0] ?? exactScore); }}
          className="[&>span:first-child]:bg-emerald-500/30 [&_[role=slider]]:bg-emerald-400"
        />
        <p className="text-xs text-muted-foreground">Predijo 2-1 y el resultado fue 2-1 exacto.</p>
      </div>

      <Separator className="bg-border/30" />

      {/* Slider: Resultado correcto */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
            Resultado correcto
          </Label>
          <span className="text-2xl font-black text-blue-400">{correctResult} pts</span>
        </div>
        <Slider
          min={1} max={8} step={1}
          value={[correctResult]}
          onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setCorrectResult(arr[0] ?? correctResult); }}
          className="[&>span:first-child]:bg-blue-500/30 [&_[role=slider]]:bg-blue-400"
        />
        <p className="text-xs text-muted-foreground">Predijo 1-0, resultado fue 2-0. Acertó el ganador.</p>
      </div>

      <Separator className="bg-border/30" />

      {/* Slider: Diferencia de goles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-purple-400" />
            Bonus diferencia de goles
          </Label>
          <span className="text-2xl font-black text-purple-400">{goalDiff} pts</span>
        </div>
        <Slider
          min={0} max={3} step={1}
          value={[goalDiff]}
          onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setGoalDiff(arr[0] ?? goalDiff); }}
          className="[&>span:first-child]:bg-purple-500/30 [&_[role=slider]]:bg-purple-400"
        />
        <p className="text-xs text-muted-foreground">Bonus adicional si acertó la diferencia de goles.</p>
      </div>

      {/* Preview en vivo */}
      <Card className="bg-muted/10 border-border/40">
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Vista previa de puntuación</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-emerald-400" /> Marcador exacto</span>
            <span className="font-bold text-emerald-400">{exactScore} pts</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400" /> Resultado + diferencia</span>
            <span className="font-bold text-blue-400">{correctResult + goalDiff} pts</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-sky-400" /> Solo resultado correcto</span>
            <span className="font-bold text-sky-400">{correctResult} pts</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">❌ Pronóstico incorrecto</span>
            <span className="font-bold text-muted-foreground">0 pts</span>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        ⚠️ Cambiar las reglas no recalcula los puntos ya otorgados. Solo afecta partidos futuros.
      </p>

      <Button onClick={handleSave} disabled={isPending} className="gap-2">
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4" /> Guardar reglas</>}
      </Button>
    </div>
  );
}
