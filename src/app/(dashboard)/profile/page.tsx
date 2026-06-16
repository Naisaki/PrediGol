'use client';
// =============================================================
// app/(dashboard)/profile/page.tsx
// Gestión del perfil del usuario
// =============================================================

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Loader2, Save, Mail, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { updateProfileAction } from '@/server/actions/auth';

const profileTranslations: Record<string, Record<string, string>> = {
  ES: {
    title: 'Mi Perfil',
    subtitle: 'Actualiza tu información personal y de cuenta',
    cardTitle: 'Editar Perfil',
    cardDesc: 'Modifica tu nombre de usuario y datos personales.',
    emailLabel: 'Correo Electrónico (No modificable)',
    usernameLabel: 'Nombre de Usuario (Username)',
    usernameDesc: 'Mínimo 3 caracteres. Solo letras, números y guiones bajos (_).',
    fullNameLabel: 'Nombre Completo',
    avatarLabel: 'URL de Avatar / Imagen',
    saveButton: 'Guardar Cambios',
    saving: 'Guardando cambios...',
    errUsernameRequired: 'El username es obligatorio',
    errUsernameShort: 'El username debe tener al menos 3 caracteres',
    errUsernameChars: 'El username solo puede contener letras, números y guiones bajos',
    successUpdate: '¡Perfil actualizado exitosamente!',
    errUpdate: 'Error al actualizar el perfil',
    errLoading: 'Error al cargar el perfil',
  },
  EN: {
    title: 'My Profile',
    subtitle: 'Update your personal and account information',
    cardTitle: 'Edit Profile',
    cardDesc: 'Modify your username and personal details.',
    emailLabel: 'Email Address (Read-only)',
    usernameLabel: 'Username',
    usernameDesc: 'Min 3 characters. Only letters, numbers and underscores (_).',
    fullNameLabel: 'Full Name',
    avatarLabel: 'Avatar / Image URL',
    saveButton: 'Save Changes',
    saving: 'Saving changes...',
    errUsernameRequired: 'Username is required',
    errUsernameShort: 'Username must be at least 3 characters',
    errUsernameChars: 'Username can only contain letters, numbers and underscores',
    successUpdate: 'Profile updated successfully!',
    errUpdate: 'Error updating profile',
    errLoading: 'Error loading profile',
  },
  FR: {
    title: 'Mon Profil',
    subtitle: 'Mettez à jour vos informations personnelles et de compte',
    cardTitle: 'Modifier le profil',
    cardDesc: 'Modifiez votre nom d’utilisateur et vos informations personnelles.',
    emailLabel: 'Adresse E-mail (Lecture seule)',
    usernameLabel: 'Nom d’utilisateur (Username)',
    usernameDesc: 'Min 3 caractères. Uniquement des lettres, chiffres et traits de soulignement (_).',
    fullNameLabel: 'Nom complet',
    avatarLabel: 'URL de l’avatar / image',
    saveButton: 'Sauvegarder les modifications',
    saving: 'Sauvegarde des modifications...',
    errUsernameRequired: 'Le nom d’utilisateur est obligatoire',
    errUsernameShort: 'Le nom d’utilisateur doit comporter au moins 3 caractères',
    errUsernameChars: 'Le nom d’utilisateur ne peut contenir que des lettres, des chiffres et des traits de soulignement',
    successUpdate: 'Profil mis à jour avec succès!',
    errUpdate: 'Erreur lors de la mise à jour du profil',
    errLoading: 'Erreur lors du chargement du profil',
  },
  IT: {
    title: 'Il Mio Profilo',
    subtitle: 'Aggiorna le tue informazioni personali e dell’account',
    cardTitle: 'Modifica Profilo',
    cardDesc: 'Modifica il tuo nome utente e i tuoi dati personali.',
    emailLabel: 'Indirizzo E-mail (Sola lettura)',
    usernameLabel: 'Nome Utente (Username)',
    usernameDesc: 'Minimo 3 caratteri. Solo lettere, numeri e trattini bassi (_).',
    fullNameLabel: 'Nome Completo',
    avatarLabel: 'URL dell’avatar / immagine',
    saveButton: 'Salva le Modifiche',
    saving: 'Salvataggio modifiche...',
    errUsernameRequired: 'Lo username è obbligatorio',
    errUsernameShort: 'Lo username deve contenere almeno 3 caratteri',
    errUsernameChars: 'Lo username può contenere solo lettere, numeri e trattini bassi',
    successUpdate: 'Profilo aggiornato con successo!',
    errUpdate: 'Errore durante l’aggiornamento del profilo',
    errLoading: 'Errore durante il caricamento del profilo',
  },
  JA: {
    title: 'マイプロフィール',
    subtitle: '個人情報およびアカウント情報を更新します',
    cardTitle: 'プロフィール編集',
    cardDesc: 'ユーザー名と個人情報を変更します。',
    emailLabel: 'メールアドレス（変更不可）',
    usernameLabel: 'ユーザー名 (Username)',
    usernameDesc: '最小3文字。半角英数字とアンダースコア（_）のみ使用可能。',
    fullNameLabel: '氏名',
    avatarLabel: 'アバター/画像のURL',
    saveButton: '変更を保存',
    saving: '変更を保存中...',
    errUsernameRequired: 'ユーザー名は必須です',
    errUsernameShort: 'ユーザー名は3文字以上である必要があります',
    errUsernameChars: 'ユーザー名には英数字とアンダースコアのみ使用できます',
    successUpdate: 'プロフィールが正常に更新されました！',
    errUpdate: 'プロフィールの更新中にエラーが発生しました',
    errLoading: 'プロフィールの読み込み中にエラーが発生しました',
  },
  KO: {
    title: '내 프로필',
    subtitle: '개인 정보 및 계정 정보를 업데이트합니다',
    cardTitle: '프로필 수정',
    cardDesc: '사용자 이름과 개인 정보를 수정합니다.',
    emailLabel: '이메일 주소 (수정 불가)',
    usernameLabel: '사용자 이름 (Username)',
    usernameDesc: '최소 3자. 영문자, 숫자, 밑줄(_)만 가능합니다.',
    fullNameLabel: '전체 이름',
    avatarLabel: '아바타 / 이미지 URL',
    saveButton: '변경 사항 저장',
    saving: '변경 사항 저장 중...',
    errUsernameRequired: '사용자 이름은 필수입니다',
    errUsernameShort: '사용자 이름은 최소 3자 이상이어야 합니다',
    errUsernameChars: '사용자 이름은 영문자, 숫자, 밑줄만 포함할 수 있습니다',
    successUpdate: '프로필이 성공적으로 업데이트되었습니다!',
    errUpdate: '프로필 업데이트 중 오류가 발생했습니다',
    errLoading: '프로필을 불러오는 중 오류가 발생했습니다',
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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
    return profileTranslations[lang]?.[key] || profileTranslations['ES']?.[key] || key;
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setEmail(user.email ?? '');

        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setUsername(profile.username);
          setFullName(profile.full_name ?? '');
          setAvatarUrl(profile.avatar_url ?? '');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        toast.error(t('errLoading'));
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router, supabase, lang]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error(t('errUsernameRequired'));
      return;
    }

    if (username.length < 3) {
      toast.error(t('errUsernameShort'));
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error(t('errUsernameChars'));
      return;
    }

    startTransition(async () => {
      const result = await updateProfileAction(username, fullName || undefined, avatarUrl || undefined);
      if (result.success) {
        toast.success(t('successUpdate'));
        router.refresh();
      } else {
        toast.error(result.error ?? t('errUpdate'));
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text)]">
          <User className="h-6 w-6 text-primary" />
          {t('title')}
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          {t('subtitle')}
        </p>
      </div>

      {/* Profile Card */}
      <Card className="glass-card border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[var(--text)]">{t('cardTitle')}</CardTitle>
          <CardDescription className="text-xs text-[var(--text-muted)]">
            {t('cardDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-email" className="text-sm font-medium text-[var(--text-muted)]">
                {t('emailLabel')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="pl-9 bg-muted/30 border-border/40 text-[var(--text-muted)] cursor-not-allowed"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-username" className="text-sm font-medium text-[var(--text)]">
                {t('usernameLabel')} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <Input
                  id="profile-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isPending}
                  placeholder="ej. futbol_fan"
                  className="pl-9 bg-input border-border/60 text-[var(--text)] placeholder:text-[var(--text-muted)]"
                  maxLength={20}
                  required
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">
                {t('usernameDesc')}
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-fullname" className="text-sm font-medium text-[var(--text)]">
                {t('fullNameLabel')}
              </Label>
              <Input
                id="profile-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isPending}
                placeholder="ej. Juan Pérez"
                className="bg-input border-border/60 text-[var(--text)] placeholder:text-[var(--text-muted)]"
                maxLength={50}
              />
            </div>

            {/* Avatar URL */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-avatar" className="text-sm font-medium text-[var(--text)]">
                {t('avatarLabel')}
              </Label>
              <Input
                id="profile-avatar"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                disabled={isPending}
                placeholder="ej. https://ejemplo.com/avatar.jpg"
                className="bg-input border-border/60 text-[var(--text)] placeholder:text-[var(--text-muted)]"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 font-semibold cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('saveButton')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
