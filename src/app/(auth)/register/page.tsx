'use client';
// =============================================================
// app/(auth)/register/page.tsx
// =============================================================

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock, User, UserPlus, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSignUp, useClerk } from '@clerk/nextjs';
import { syncClerkUserWithSupabase } from '@/server/actions/auth';

const schema = z.object({
  email: z.string().email('Email inválido'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _'),
  fullName: z.string().min(2, 'Ingresa tu nombre').optional().or(z.literal('')),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

const registerTranslations: Record<string, Record<string, string>> = {
  ES: {
    title: 'Crear cuenta',
    subtitle: 'Únete a la beta privada de Goleados',
    emailLabel: 'Dirección de Email',
    usernameLabel: 'Nombre de usuario',
    fullNameLabel: 'Nombre completo',
    optional: '(opcional)',
    passwordLabel: 'Contraseña',
    btnCreate: 'Crear cuenta gratis',
    creating: 'Creando cuenta...',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    signIn: 'Iniciar sesión',
    btnGoogle: 'Google',
    btnApple: 'Apple',
    dividerText: 'O continuar con',
    verifyTitle: 'Verifica tu Email',
    verifySubtitle: 'Ingresa el código enviado a tu correo',
    verifyBtn: 'Verificar código',
    verifying: 'Verificando...',
  },
  EN: {
    title: 'Create Account',
    subtitle: 'Join the private beta of Goleados',
    emailLabel: 'Email Address',
    usernameLabel: 'Username',
    fullNameLabel: 'Full Name',
    optional: '(optional)',
    passwordLabel: 'Password',
    btnCreate: 'Create account for free',
    creating: 'Creating account...',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
    btnGoogle: 'Google',
    btnApple: 'Apple',
    dividerText: 'Or continue with',
    verifyTitle: 'Verify your Email',
    verifySubtitle: 'Enter the code sent to your email',
    verifyBtn: 'Verify code',
    verifying: 'Verifying...',
  },
  FR: {
    title: 'Créer un compte',
    subtitle: 'Rejoignez la bêta privée de Goleados',
    emailLabel: 'Adresse E-mail',
    usernameLabel: "Nom d'utilisateur",
    fullNameLabel: 'Nom complet',
    optional: '(optionnel)',
    passwordLabel: 'Mot de passe',
    btnCreate: 'Créer un compte gratuit',
    creating: 'Création du compte...',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    signIn: 'Se connecter',
    btnGoogle: 'Google',
    btnApple: 'Apple',
    dividerText: 'Ou continuer avec',
    verifyTitle: 'Vérifiez votre Email',
    verifySubtitle: 'Entrez le code envoyé à votre e-mail',
    verifyBtn: 'Vérifier le code',
    verifying: 'Vérification...',
  },
  IT: {
    title: 'Crea un account',
    subtitle: 'Partecipa alla beta privata di Goleados',
    emailLabel: 'Indirizzo E-mail',
    usernameLabel: 'Nome utente',
    fullNameLabel: 'Nome completo',
    optional: '(facoltativo)',
    passwordLabel: 'Password',
    btnCreate: 'Crea account gratuito',
    creating: 'Creazione account...',
    alreadyHaveAccount: 'Hai già un account?',
    signIn: 'Accedi',
    btnGoogle: 'Google',
    btnApple: 'Apple',
    dividerText: 'O continua con',
    verifyTitle: 'Verifica la tua Email',
    verifySubtitle: 'Inserisci il codice inviato alla tua e-mail',
    verifyBtn: 'Verifica codice',
    verifying: 'Verifica...',
  },
  JA: {
    title: 'アカウント作成',
    subtitle: 'Goleadosのプライベートベータに参加',
    emailLabel: 'メールアドレス',
    usernameLabel: 'ユーザー名',
    fullNameLabel: 'フル네ーム',
    optional: '(任意)',
    passwordLabel: 'パスワード',
    btnCreate: '無料でアカウント作成',
    creating: 'アカウント作成中...',
    alreadyHaveAccount: '既にアカウントをお持ちですか？',
    signIn: 'サイン인',
    btnGoogle: 'Google',
    btnApple: 'Apple',
    dividerText: 'または以下で続行',
    verifyTitle: 'メールの確認',
    verifySubtitle: 'メールに送信されたコードを入力してください',
    verifyBtn: 'コードを確認',
    verifying: '確認中...',
  },
  KO: {
    title: '회원가입',
    subtitle: 'Goleados 프라이빗 베타 참여',
    emailLabel: '이메일 주소',
    usernameLabel: '사용자 이름',
    fullNameLabel: '이름',
    optional: '(선택)',
    passwordLabel: '비밀번호',
    btnCreate: '무료 회원가입',
    creating: '계정 생성 중...',
    alreadyHaveAccount: '이미 계정이 있으신가요?',
    signIn: '로그인',
    btnGoogle: 'Google',
    btnApple: 'Apple',
    dividerText: '또는 다음으로 계속',
    verifyTitle: '이메일 인증',
    verifySubtitle: '이메일로 전송된 코드를 입력하세요',
    verifyBtn: '코드 인증',
    verifying: '인증 중...',
  },
};

function RegisterPageContent() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [lang, setLang] = useState('ES');
  const { signUp, errors: clerkErrors, fetchStatus } = useSignUp();
  const clerk = useClerk();
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [registeredData, setRegisteredData] = useState<FormData | null>(null);

  useEffect(() => {
    const saved = (localStorage.getItem('locale') || 'ES').toUpperCase();
    setLang(saved);

    const handleLocaleChange = () => {
      const newLang = (localStorage.getItem('locale') || 'ES').toUpperCase();
      setLang(newLang);
    };
    window.addEventListener('locale-changed', handleLocaleChange);
    return () => window.removeEventListener('locale-changed', handleLocaleChange);
  }, []);

  const t = (key: string) => {
    return registerTranslations[lang]?.[key] || registerTranslations['ES']?.[key] || key;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!signUp) return;

    try {
      // Registrar en Clerk
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
        username: data.username,
      });

      // Enviar el código de verificación
      await signUp.verifications.sendEmailCode();
      setRegisteredData(data);
      setVerifying(true);
      toast.success('Código de verificación enviado a tu correo');
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar el registro');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || !registeredData) return;

    setIsVerifyingCode(true);
    try {
      const result = await signUp.verifications.verifyEmailCode({
        code: verificationCode,
      });

      if (signUp.status === 'complete') {
        // Sincronizar el perfil con Supabase
        const syncResult = await syncClerkUserWithSupabase(
          signUp.createdUserId!,
          registeredData.username,
          registeredData.fullName || undefined
        );

        if (!syncResult.success) {
          toast.error(syncResult.error ?? 'Error al crear perfil en base de datos');
          setIsVerifyingCode(false);
          return;
        }

        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            const url = decorateUrl('/dashboard');
            if (url.startsWith('http')) {
              window.location.href = url;
            } else {
              router.push(url);
              router.refresh();
            }
          },
        });
        toast.success('¡Cuenta creada! Bienvenido a Goleados.');
      } else {
        toast.error('Código inválido o proceso incompleto');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al verificar el código');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSocialLogin = async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!signUp) return;
    try {
      const { error } = await signUp.sso({
        strategy,
        redirectUrl: '/dashboard',
        redirectCallbackUrl: '/sso-callback',
      });
      if (error) {
        toast.error('Error con inicio de sesión social: ' + error.message);
      }
    } catch (err: any) {
      toast.error('Error con inicio de sesión social: ' + (err.message || String(err)));
    }
  };

  if (verifying) {
    return (
      <Card className="glass-card border-border/40 shadow-2xl animate-scale-in p-6 sm:p-8 pb-10 sm:pb-12 rounded-[24px] overflow-hidden">
        <CardHeader className="space-y-1 pb-6 pt-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary shadow-sm shadow-primary/5">
            <KeyRound className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground text-center tracking-tight">
            {t('verifyTitle')}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground text-center mt-1">
            {t('verifySubtitle')}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleVerify}>
          <CardContent className="space-y-4 px-0">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-xs font-semibold text-foreground/80">
                Código de Verificación
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="bg-[var(--control-bg)] border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl h-12 text-sm text-[var(--text)] transition-all text-center tracking-widest text-lg font-bold"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-6 px-0 pb-6 sm:pb-8 border-none bg-transparent shadow-none">
            <Button
              type="submit"
              className="w-full bg-[var(--text)] text-[var(--background)] hover:bg-[var(--text)]/90 font-bold h-12 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-md"
              disabled={isVerifyingCode}
            >
              {isVerifyingCode ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('verifying')}</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>{t('verifyBtn')}</span>
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={() => signUp?.verifications.sendEmailCode()}
              className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
            >
              Reenviar código de verificación
            </button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/40 shadow-2xl animate-scale-in p-5 sm:p-6 pb-6 sm:pb-8 rounded-[20px]">
      <CardHeader className="space-y-1 pb-4 pt-1">
        {/* Floating UserPlus Design Container */}
        <div className="mx-auto h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 text-primary shadow-sm shadow-primary/5">
          <UserPlus className="h-4.5 w-4.5" />
        </div>
        <CardTitle className="text-lg font-bold text-foreground text-center tracking-tight">{t('title')}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground text-center mt-1">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-3 px-0">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">{t('emailLabel')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                className="pl-9.5 bg-[var(--control-bg)] border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl h-11 text-xs sm:text-sm text-[var(--text)] transition-all"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold text-foreground/80">{t('usernameLabel')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="mi_usuario"
                  autoComplete="username"
                  className="pl-9.5 bg-[var(--control-bg)] border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl h-11 text-xs sm:text-sm text-[var(--text)] transition-all"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-destructive text-xs">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold text-foreground/80">
                {t('fullNameLabel')}{' '}
                <span className="text-muted-foreground text-[9px] font-normal">{t('optional')}</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Tu nombre"
                  autoComplete="name"
                  className="pl-9.5 bg-[var(--control-bg)] border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl h-11 text-xs sm:text-sm text-[var(--text)] transition-all"
                  {...register('fullName')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground/80">{t('passwordLabel')}</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                className="pl-9.5 pr-10 bg-[var(--control-bg)] border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl h-11 text-sm text-[var(--text)] transition-all"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showPass ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>

        <div className="flex flex-col gap-3 pt-4 px-0 pb-2">
          <Button
            type="submit"
            className="w-full bg-[var(--text)] text-[var(--background)] hover:bg-[var(--text)]/90 font-bold h-11 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs sm:text-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('creating')}</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>{t('btnCreate')}</span>
              </>
            )}
          </Button>

          {/* Social Logins Divider */}
          <div className="relative flex items-center justify-center w-full my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]"></div>
            </div>
            <span className="relative px-3 bg-[var(--surface)] text-[9px] text-muted-foreground uppercase font-bold tracking-wider select-none">
              {t('dividerText')}
            </span>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('oauth_google')}
              disabled={!signUp || fetchStatus === 'fetching'}
              className="rounded-xl border border-border/30 hover:bg-[var(--surface-hover)] bg-[var(--control-bg)] hover:text-[var(--text)] font-bold text-xs py-4 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{t('btnGoogle')}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('oauth_apple')}
              disabled={!signUp || fetchStatus === 'fetching'}
              className="rounded-xl border border-border/30 hover:bg-[var(--surface-hover)] bg-[var(--control-bg)] hover:text-[var(--text)] font-bold text-xs py-4 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4 fill-current text-[var(--text)]" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.75.79 0 1.9-.81 3.54-.64 1.7.17 2.97.88 3.69 2.04-3.37 2.02-2.52 6.55.77 7.89-.68 1.76-1.57 3.5-3.08 2.93zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.5-2.06 4.46-3.74 4.25z"/>
              </svg>
              <span>{t('btnApple')}</span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            {t('alreadyHaveAccount')}{' '}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-bold transition-colors"
            >
              {t('signIn')}
            </Link>
          </p>
          
          {/* Contenedor Captcha invisible para requerimientos de Clerk */}
          <div id="clerk-captcha" className="hidden" />
        </div>
      </form>
    </Card>
  );
}

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}

