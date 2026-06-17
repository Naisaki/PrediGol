'use client';
// =============================================================
// app/(auth)/login/page.tsx
// =============================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock, LogIn } from 'lucide-react';
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
import { loginAction } from '@/server/actions/auth';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type FormData = z.infer<typeof schema>;

const loginTranslations: Record<string, Record<string, string>> = {
  ES: {
    title: '¡Bienvenido de vuelta!',
    subtitle: 'Por favor inicia sesión para continuar',
    emailLabel: 'Dirección de Email',
    passwordLabel: 'Contraseña',
    rememberMe: 'Recordarme',
    forgotPassword: '¿Olvidaste tu contraseña?',
    btnSignIn: 'Iniciar sesión',
    btnGoogle: 'Google',
    btnApple: 'Apple',
    dividerText: 'O continuar con',
    noAccount: '¿No tienes cuenta?',
    createAccount: 'Crear cuenta gratis',
    signingIn: 'Ingresando...',
  },
  EN: {
    title: 'Welcome Back',
    subtitle: 'Please sign in to continue',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot your password?',
    btnSignIn: 'Sign In',
    btnGoogle: 'Google',
    btnApple: 'Apple',
    dividerText: 'Or continue with',
    noAccount: "Don't have an account?",
    createAccount: 'Create account for free',
    signingIn: 'Signing in...',
  },
  FR: {
    title: 'Bon retour',
    subtitle: 'Veuillez vous connecter pour continuer',
    emailLabel: 'Adresse E-mail',
    passwordLabel: 'Mot de passe',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?',
    btnSignIn: 'Se connecter',
    btnGoogle: 'Google',
    btnApple: 'Apple',
    dividerText: 'Ou continuer avec',
    noAccount: "Vous n'avez pas de compte ?",
    createAccount: 'Créer un compte gratuit',
    signingIn: 'Connexion...',
  },
  IT: {
    title: 'Bentornato',
    subtitle: 'Si prega di accedere per continuare',
    emailLabel: 'Indirizzo E-mail',
    passwordLabel: 'Password',
    rememberMe: 'Ricordami',
    forgotPassword: 'Password dimenticata?',
    btnSignIn: 'Accedi',
    btnGoogle: 'Google',
    btnApple: 'Apple',
    dividerText: 'O continua con',
    noAccount: 'Non hai un account?',
    createAccount: 'Crea un account gratuito',
    signingIn: 'Accesso in corso...',
  },
  JA: {
    title: 'おかえりなさい',
    subtitle: '続行するにはサインインしてください',
    emailLabel: 'メールアドレス',
    passwordLabel: 'パスワード',
    rememberMe: 'ログイン状態を保持する',
    forgotPassword: 'パスワードをお忘れですか？',
    btnSignIn: 'サインイン',
    btnGoogle: 'Google',
    btnApple: 'Apple',
    dividerText: 'または以下で続行',
    noAccount: 'アカンウトをお持ちではありませんか？',
    createAccount: '無料でアカウントを作成',
    signingIn: 'サインイン中...',
  },
  KO: {
    title: '다시 오신 것을 환영합니다',
    subtitle: '계속하려면 로그인해 주세요',
    emailLabel: '이메일 주소',
    passwordLabel: '비밀번호',
    rememberMe: '자동 로그인',
    forgotPassword: '비밀번호를 잊으셨나요?',
    btnSignIn: '로그인',
    btnGoogle: 'Google',
    btnApple: 'Apple',
    dividerText: '또는 다음으로 계속',
    noAccount: '계정이 없으신가요?',
    createAccount: '무료 회원가입',
    signingIn: '로그인 중...',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [lang, setLang] = useState('ES');

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
    return loginTranslations[lang]?.[key] || loginTranslations['ES']?.[key] || key;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const result = await loginAction(data.email, data.password);

    if (!result.success) {
      toast.error(result.error ?? 'Error al iniciar sesión');
      return;
    }

    toast.success('¡Bienvenido de vuelta!');
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <Card className="glass-card border-border/40 shadow-2xl animate-scale-in p-6 sm:p-8 pb-10 sm:pb-12 rounded-[24px] overflow-hidden">
      <CardHeader className="space-y-1 pb-6 pt-2">
        {/* Floating Door/Lock 3D design container */}
        <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary shadow-sm shadow-primary/5">
          <LogIn className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl font-bold text-foreground text-center tracking-tight">{t('title')}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground text-center mt-1">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 px-0">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">{t('emailLabel')}</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                className="pl-10 bg-[var(--control-bg)] border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl h-12 text-sm text-[var(--text)] transition-all"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground/80">{t('passwordLabel')}</Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-10 pr-10 bg-[var(--control-bg)] border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl h-12 text-sm text-[var(--text)] transition-all"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Row of checkbox + forgot password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="rounded border-border/60 bg-[var(--control-bg)] text-primary focus:ring-primary/30 h-3.5 w-3.5 cursor-pointer accent-primary" 
              />
              <span>{t('rememberMe')}</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {t('forgotPassword')}
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-6 px-0 pb-6 sm:pb-8 border-none bg-transparent shadow-none">
          <Button
            type="submit"
            className="w-full bg-[var(--text)] text-[var(--background)] hover:bg-[var(--text)]/90 font-bold h-12 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('signingIn')}</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>{t('btnSignIn')}</span>
              </>
            )}
          </Button>

          {/* Social Logins Divider */}
          <div className="relative flex items-center justify-center w-full my-2">
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
              className="rounded-xl border border-border/30 hover:bg-[var(--surface-hover)] bg-[var(--control-bg)] hover:text-[var(--text)] font-bold text-xs py-5 flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
              className="rounded-xl border border-border/30 hover:bg-[var(--surface-hover)] bg-[var(--control-bg)] hover:text-[var(--text)] font-bold text-xs py-5 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <svg className="h-4 w-4 fill-current text-[var(--text)]" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.75.79 0 1.9-.81 3.54-.64 1.7.17 2.97.88 3.69 2.04-3.37 2.02-2.52 6.55.77 7.89-.68 1.76-1.57 3.5-3.08 2.93zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.5-2.06 4.46-3.74 4.25z"/>
              </svg>
              <span>{t('btnApple')}</span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-5">
            {t('noAccount')}{' '}
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 font-bold transition-colors"
            >
              {t('createAccount')}
            </Link>
          </p>
        </CardFooter>

      </form>
    </Card>
  );
}
