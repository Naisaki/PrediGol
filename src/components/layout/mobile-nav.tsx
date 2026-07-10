'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Globe, 
  Menu, 
  X, 
  Tv, 
  Radio, 
  GitBranch, 
  User, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useClerk } from '@clerk/nextjs';

const primaryNavItems = [
  { href: '/dashboard', labelKey: 'Inicio', icon: LayoutDashboard },
  { href: '/groups', labelKey: 'Grupos', icon: Users },
  { href: '/matches', labelKey: 'Partidos', icon: Calendar },
  { href: '/world-cup/groups', labelKey: 'Mundial', icon: Globe },
];

const secondaryNavItems = [
  { href: '/matches/live', labelKey: 'Partidos En Vivo', icon: Radio, descKey: 'descEnVivo' },
  { href: '/matches/streams', labelKey: 'Canales de TV', icon: Tv, descKey: 'descTV' },
  { href: '/world-cup/bracket', labelKey: 'Llaves / Eliminatorias', icon: GitBranch, descKey: 'descLlaves' },
  { href: '/profile', labelKey: 'Mi Perfil', icon: User, descKey: 'descPerfil' },
];

const navTranslations: Record<string, Record<string, string>> = {
  ES: {
    Inicio: 'Inicio',
    Grupos: 'Grupos',
    Partidos: 'Partidos',
    Mundial: 'Mundial',
    Más: 'Más',
    'Partidos En Vivo': 'En Vivo',
    'Canales de TV': 'Canales TV',
    'Llaves / Eliminatorias': 'Llaves',
    'Mi Perfil': 'Mi Perfil',
    'Más Opciones': 'Más Opciones',
    'Explora todas las secciones': 'Explora todas las secciones de la app',
    'Cerrar sesión': 'Cerrar sesión',
    'descEnVivo': 'Marcadores y señales en directo',
    'descTV': 'Explorar señales deportivas',
    'descLlaves': 'Fase final y eliminaciones',
    'descPerfil': 'Configurar cuenta',
  },
  EN: {
    Inicio: 'Home',
    Grupos: 'Groups',
    Partidos: 'Matches',
    Mundial: 'World Cup',
    Más: 'More',
    'Partidos En Vivo': 'Live',
    'Canales de TV': 'TV Channels',
    'Llaves / Eliminatorias': 'Bracket',
    'Mi Perfil': 'My Profile',
    'Más Opciones': 'More Options',
    'Explora todas las secciones': 'Explore all app sections',
    'Cerrar sesión': 'Logout',
    'descEnVivo': 'Live scores and updates',
    'descTV': 'Explore sports channels',
    'descLlaves': 'Final stages and bracket',
    'descPerfil': 'Manage your profile',
  },
  FR: {
    Inicio: 'Accueil',
    Grupos: 'Groupes',
    Partidos: 'Matchs',
    Mundial: 'Coupe du Monde',
    Más: 'Plus',
    'Partidos En Vivo': 'En Direct',
    'Canales de TV': 'Chaînes TV',
    'Llaves / Eliminatorias': 'Tableau',
    'Mi Perfil': 'Mon Profil',
    'Más Opciones': 'Plus d\'options',
    'Explora todas las secciones': 'Explorez toutes les sections de l\'application',
    'Cerrar sesión': 'Se déconnecter',
    'descEnVivo': 'Scores et signaux en direct',
    'descTV': 'Explorer les signaux sportifs',
    'descLlaves': 'Phase finale et éliminations',
    'descPerfil': 'Configurer le compte',
  },
  IT: {
    Inicio: 'Home',
    Grupos: 'Gruppi',
    Partidos: 'Partite',
    Mundial: 'Mondiale',
    Más: 'Più',
    'Partidos En Vivo': 'Dal Vivo',
    'Canales de TV': 'Canali TV',
    'Llaves / Eliminatorias': 'Tabellone',
    'Mi Perfil': 'Il Mio Profilo',
    'Más Opciones': 'Altre Opzioni',
    'Explora todas las secciones': 'Esplora tutte le sezioni dell\'app',
    'Cerrar sesión': 'Disconnettersi',
    'descEnVivo': 'Punteggi e segnali in diretta',
    'descTV': 'Esplora i segnali sportivi',
    'descLlaves': 'Fase finale ed eliminazioni',
    'descPerfil': 'Configura l\'account',
  },
  JA: {
    Inicio: 'ホーム',
    Grupos: 'グループ',
    Partidos: '試合',
    Mundial: 'ワールドカップ',
    Más: 'その他',
    'Partidos En Vivo': 'ライブ',
    'Canales de TV': 'TVチャンネル',
    'Llaves / Eliminatorias': 'トーナメント表',
    'Mi Perfil': 'プロフィール',
    'Más Opciones': 'その他のオプション',
    'Explora todas las secciones': 'アプリのすべてのセクションを見る',
    'Cerrar sesión': 'ログアウト',
    'descEnVivo': 'ライブスコアと中継信号',
    'descTV': 'スポーツ中継チャンネルを見る',
    'descLlaves': '決勝トーナメントと敗退情報',
    'descPerfil': 'アカウント設定',
  },
  KO: {
    Inicio: '홈',
    Grupos: '그룹',
    Partidos: '경기',
    Mundial: '월드컵',
    Más: '더 보기',
    'Partidos En Vivo': '라이브',
    'Canales de TV': 'TV 채널',
    'Llaves / Eliminatorias': '대진표',
    'Mi Perfil': '프로필',
    'Más Opciones': '추가 옵션',
    'Explora todas las secciones': '앱의 모든 섹션 보기',
    'Cerrar sesión': '로그아웃',
    'descEnVivo': '라이브 스코어 및 실시간 중계',
    'descTV': '스포츠 중계 채널 탐색',
    'descLlaves': '결승 토너먼트 및 탈락 정보',
    'descPerfil': '계정 설정',
  },
};

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('ES');
  const { signOut } = useClerk();

  // Cerrar el menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Evitar scroll en el fondo cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cargar idioma y escuchar eventos
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
    return navTranslations[lang]?.[key] || navTranslations['ES']?.[key] || key;
  };

  const isSecondaryActive = secondaryNavItems.some(item => pathname.startsWith(item.href));

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border-subtle)] backdrop-blur-md mobile-nav-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href) && !isSecondaryActive);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-0 relative',
                  isActive
                    ? 'text-primary'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                )}
              >
                <item.icon
                  className={cn('h-5 w-5 transition-all', isActive && 'scale-110')}
                />
                <span className="text-[10px] font-medium truncate">
                  {t(item.labelKey)}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* Botón de Menú "Más" */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-0 relative',
              isOpen || isSecondaryActive
                ? 'text-primary'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]',
            )}
          >
            <Menu
              className={cn('h-5 w-5 transition-all', (isOpen || isSecondaryActive) && 'scale-110')}
            />
            <span className="text-[10px] font-medium truncate">{t('Más')}</span>
            {isSecondaryActive && !isOpen && (
              <div className="absolute bottom-0 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </nav>

      {/* Menú Desplegable (Bottom Sheet) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border-subtle)] rounded-t-2xl p-6 shadow-2xl animate-slide-up pb-10 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="font-bold text-base text-[var(--text)]">{t('Más Opciones')}</h3>
                <p className="text-xs text-[var(--text-muted)]">{t('Explora todas las secciones')}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--control-bg)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Grid de opciones */}
            <div className="grid grid-cols-1 gap-3">
              {secondaryNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all",
                      isActive 
                        ? "bg-primary/10 border-primary/30 text-primary" 
                        : "bg-[var(--control-bg)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      isActive ? "bg-primary/20 text-primary" : "bg-[var(--surface-hover)] text-[var(--text-muted)]"
                    )}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm text-[var(--text)]">{t(item.labelKey)}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{t(item.descKey)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Logout button */}
            <div className="border-t border-[var(--border-subtle)] pt-5 mt-5">
              <button
                type="button"
                onClick={() => signOut({ redirectUrl: '/' })}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors text-sm font-semibold cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('Cerrar sesión')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
