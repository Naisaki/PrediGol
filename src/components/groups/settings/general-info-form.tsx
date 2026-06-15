'use client';
// =============================================================
// components/groups/settings/general-info-form.tsx
// Formulario de información general del grupo
// =============================================================

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { updateGroupInfoAction } from '@/server/actions/groups';

interface GeneralInfoFormProps {
  groupId: string;
  initialData: {
    name: string;
    description: string;
    imageUrl: string;
  };
}

export function GeneralInfoForm({ groupId, initialData }: GeneralInfoFormProps) {
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description);
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl);
  const [isPending, startTransition] = useTransition();
  const [imgError, setImgError] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('El nombre del grupo es obligatorio.');
      return;
    }
    startTransition(async () => {
      const result = await updateGroupInfoAction(
        groupId,
        name.trim(),
        description.trim() || null,
        imageUrl.trim() || null,
      );
      if (result.success) {
        toast.success('Información actualizada correctamente.');
      } else {
        toast.error(result.error ?? 'Error al guardar cambios.');
      }
    });
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="group-name">Nombre del grupo</Label>
        <Input
          id="group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Los Campeones del Barrio"
          maxLength={50}
          className="bg-background/40 border-border/40"
        />
        <p className="text-xs text-muted-foreground">{name.length}/50 caracteres</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="group-description">
          Descripción <span className="text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="group-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe de qué trata tu grupo..."
          maxLength={200}
          rows={3}
          className="bg-background/40 border-border/40 resize-none"
        />
        <p className="text-xs text-muted-foreground">{description.length}/200 caracteres</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="group-image">
          URL de imagen del grupo <span className="text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="group-image"
          value={imageUrl}
          onChange={(e) => { setImageUrl(e.target.value); setImgError(false); }}
          placeholder="https://..."
          className="bg-background/40 border-border/40"
        />
        {imageUrl && !imgError && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Preview"
              className="w-12 h-12 rounded-xl object-cover border border-border/40"
              onError={() => setImgError(true)}
            />
            <span className="text-xs text-muted-foreground">Vista previa</span>
          </div>
        )}
      </div>

      <Card className="bg-muted/10 border-border/30">
        <CardContent className="p-3 text-xs text-muted-foreground">
          💡 Los cambios se reflejan inmediatamente en la página del grupo.
        </CardContent>
      </Card>

      <Button
        id="save-general-info"
        onClick={handleSave}
        disabled={isPending || !name.trim()}
        className="gap-2"
      >
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
        ) : (
          <><Save className="h-4 w-4" /> Guardar cambios</>
        )}
      </Button>
    </div>
  );
}
