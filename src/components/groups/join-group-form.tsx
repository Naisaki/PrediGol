'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Hash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { joinGroupAction } from '@/server/actions/groups';

const formTranslations: Record<string, Record<string, string>> = {
  ES: {
    placeholder: 'Ingresa un código de invitación...',
    button: 'Unirme',
    errCodeRequired: 'Por favor ingresa un código.',
    errCodeShort: 'El código debe tener al menos 6 caracteres.',
    successJoin: '¡Te has unido al grupo con éxito!',
    errJoin: 'No se pudo unir al grupo.',
  },
  EN: {
    placeholder: 'Enter invitation code...',
    button: 'Join',
    errCodeRequired: 'Please enter a code.',
    errCodeShort: 'Code must be at least 6 characters.',
    successJoin: 'Successfully joined the group!',
    errJoin: 'Could not join group.',
  },
  FR: {
    placeholder: "Entrez un code d'invitation...",
    button: 'Rejoindre',
    errCodeRequired: 'Veuillez saisir un code.',
    errCodeShort: 'Le code doit comporter au moins 6 caractères.',
    successJoin: 'Vous avez rejoint le groupe avec succès !',
    errJoin: 'Impossible de rejoindre le groupe.',
  },
  IT: {
    placeholder: 'Inserisci un codice di invito...',
    button: 'Unisciti',
    errCodeRequired: 'Inserisci un codice.',
    errCodeShort: 'Il codice deve contenere almeno 6 caratteri.',
    successJoin: 'Ti sei unito al gruppo con successo !',
    errJoin: 'Impossibile unirsi al gruppo.',
  },
  JA: {
    placeholder: '招待コードを入力...',
    button: '参加する',
    errCodeRequired: 'コードを入力してください。',
    errCodeShort: 'コードは6文字以上である必要があります。',
    successJoin: 'グループに参加しました！',
    errJoin: 'グループに参加できませんでした。',
  },
  KO: {
    placeholder: '초대 코드 입력...',
    button: '가입하기',
    errCodeRequired: '코드를 입력해 주세요.',
    errCodeShort: '코드는 최소 6자 이상이어야 합니다.',
    successJoin: '그룹에 가입되었습니다!',
    errJoin: '그룹에 가입하지 못했습니다.',
  },
};

export function JoinGroupForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isPending, startTransition] = useTransition();
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
    return formTranslations[lang]?.[key] || formTranslations['ES']?.[key] || key;
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      toast.error(t('errCodeRequired'));
      return;
    }

    if (cleanCode.length < 6) {
      toast.error(t('errCodeShort'));
      return;
    }

    startTransition(async () => {
      const result = await joinGroupAction(cleanCode);
      if (result.success && result.data?.groupId) {
        toast.success(t('successJoin'));
        router.push(`/groups/${result.data.groupId}`);
      } else {
        toast.error(result.error ?? t('errJoin'));
      }
    });
  };

  return (
    <form onSubmit={handleJoin} className="flex gap-3 w-full">
      <div className="relative flex-1">
        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <Input
          placeholder={t('placeholder')}
          className="pl-9 bg-input border-border/60 text-[var(--text)] placeholder:text-[var(--text-muted)]"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isPending}
        />
      </div>
      <Button
        type="submit"
        variant="outline"
        className="border-border/60 shrink-0 min-w-[100px] cursor-pointer text-[var(--text)] hover:bg-[var(--surface-hover)]"
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin text-[var(--text)]" /> : t('button')}
      </Button>
    </form>
  );
}
