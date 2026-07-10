'use client';
// =============================================================
// components/layout/sidebar-nav.tsx
// =============================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Radio,
  Tv,
  Globe,
  GitBranch,
  User,
  LogOut,
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { cn } from '@/lib/utils/cn';
import { useState, useEffect } from 'react';

interface SidebarNavProps {
  username: string;
  avatarUrl: string | null;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const translations: Record<string, Record<string, string>> = {
  ES: {
    Main: 'Main',
    Competición: 'Competición',
    'Mundial 2026': 'Mundial 2026',
    Ajustes: 'Ajustes',
    Inicio: 'Inicio',
    'Mis Grupos': 'Mis Grupos',
    Partidos: 'Partidos',
    'En Vivo': 'En Vivo',
    'Canales TV': 'Canales TV',
    'Grupos del Mundial': 'Grupos del Mundial',
    Llaves: 'Llaves',
    'Mi Perfil': 'Mi Perfil',
    Logout: 'Cerrar Sesión',
  },
  EN: {
    Main: 'Main',
    Competición: 'Competition',
    'Mundial 2026': 'World Cup 2026',
    Ajustes: 'Settings',
    Inicio: 'Home',
    'Mis Grupos': 'My Groups',
    Partidos: 'Matches',
    'En Vivo': 'Live',
    'Canales TV': 'TV Channels',
    'Grupos del Mundial': 'World Cup Groups',
    Llaves: 'Bracket',
    'Mi Perfil': 'My Profile',
    Logout: 'Logout',
  },
  FR: {
    Main: 'Principal',
    Competición: 'Compétition',
    'Mundial 2026': 'Coupe du Monde 2026',
    Ajustes: 'Paramètres',
    Inicio: 'Accueil',
    'Mis Grupos': 'Mes Groupes',
    Partidos: 'Matchs',
    'En Vivo': 'En Direct',
    'Canales TV': 'Chaînes TV',
    'Grupos del Mundial': 'Groupes de la Coupe du Monde',
    Llaves: 'Tableau',
    'Mi Perfil': 'Mon Profil',
    Logout: 'Se déconnecter',
  },
  IT: {
    Main: 'Principale',
    Competición: 'Competizione',
    'Mundial 2026': 'Coppa del Mondo 2026',
    Ajustes: 'Impostazioni',
    Inicio: 'Home',
    'Mis Grupos': 'I Miei Gruppi',
    Partidos: 'Partite',
    'En Vivo': 'Dal Vivo',
    'Canales TV': 'Canali TV',
    'Grupos del Mundial': 'Gruppi della Coppa del Mondo',
    Llaves: 'Tabellone',
    'Mi Perfil': 'Il Mio Profilo',
    Logout: 'Disconnettersi',
  },
  JA: {
    Main: 'メイン',
    Competición: 'コンペティション',
    'Mundial 2026': 'ワールドカップ 2026',
    Ajustes: '設定',
    Inicio: 'ホーム',
    'Mis Grupos': 'マイグループ',
    Partidos: '試合',
    'En Vivo': 'ライブ',
    'Canales TV': 'TVチャンネル',
    'Grupos del Mundial': 'ワールドカップグループ',
    Llaves: 'トーナメント表',
    'Mi Perfil': 'マイプロフィール',
    Logout: 'ログアウト',
  },
  KO: {
    Main: '메인',
    Competición: '대회',
    'Mundial 2026': '월드컵 2026',
    Ajustes: '설정',
    Inicio: '홈',
    'Mis Grupos': '내 그룹',
    Partidos: '경기',
    'En Vivo': '라이브',
    'Canales TV': 'TV 채널',
    'Grupos del Mundial': '월드컵 조 편성',
    Llaves: '토너먼트 대진표',
    'Mi Perfil': '내 프로필',
    Logout: '로그아웃',
  },
};

const navSections = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
      { href: '/groups', label: 'Mis Grupos', icon: Users },
    ],
  },
  {
    label: 'Competición',
    items: [
      { href: '/matches', label: 'Partidos', icon: Calendar },
      { href: '/matches/live', label: 'En Vivo', icon: Radio },
      { href: '/matches/streams', label: 'Canales TV', icon: Tv },
    ],
  },
  {
    label: 'Mundial 2026',
    items: [
      { href: '/world-cup/groups', label: 'Grupos del Mundial', icon: Globe },
      { href: '/world-cup/bracket', label: 'Llaves', icon: GitBranch },
    ],
  },
  {
    label: 'Ajustes',
    items: [
      { href: '/profile', label: 'Mi Perfil', icon: User },
    ],
  },
];

export function SidebarNav({ username, avatarUrl, collapsed }: SidebarNavProps) {
  const pathname = usePathname();
  const [lang, setLang] = useState('ES');
  const { signOut } = useClerk();

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
    return translations[lang]?.[key] || key;
  };


  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col shrink-0 h-full rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] transition-[width] duration-300 ease-out select-none overflow-hidden z-20',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
      aria-label="Admin sidebar"
    >
      <div className="flex flex-col h-full justify-between py-6">
        {/* Navigation Area */}
        <nav className={cn('flex flex-col gap-5 px-2 overflow-y-auto shrink-0', collapsed ? 'gap-2' : '')}>
          {navSections.map((section, secIdx) => (
            <div key={secIdx} className="flex flex-col gap-1.5">
              {/* Divider visible only when collapsed */}
              <div
                className={cn(
                  'hidden',
                  collapsed
                    ? 'block relative mx-3 min-h-[27px] flex items-center justify-center before:content-[""] before:w-full before:h-px before:rounded-[3px] before:bg-[var(--surface-hover)]'
                    : ''
                )}
              />

              {/* Section Label */}
              <span
                className={cn(
                  'ps-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--surface)]',
                  collapsed ? 'hidden' : 'block'
                )}
              >
                {t(section.label)}
              </span>

              {/* Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' &&
                      item.href !== '/matches' &&
                      pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? t(item.label) : ''}
                      className={cn(
                        'inline-flex items-center gap-2 px-2.5 py-2.5 cursor-pointer select-none text-sm font-normal rounded-md transition-all duration-150 w-full text-start',
                        isActive
                          ? 'bg-[var(--surface-hover)] text-[var(--text)] font-semibold shadow-xs'
                          : 'bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'
                      )}
                    >
                      <span className="shrink-0 w-4.5 h-4.5 flex items-center justify-center">
                        <item.icon
                          className={cn(
                            'h-4.5 w-4.5 transition-transform duration-200',
                            isActive ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
                          )}
                        />
                      </span>
                      {!collapsed && <span className="flex-1 truncate pl-1">{t(item.label)}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Area */}
        <div className="pt-2 border-t border-[var(--border)] px-2 shrink-0">
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: '/' })}
            className={cn(
              'inline-flex items-center gap-2 px-2.5 py-2.5 cursor-pointer select-none text-sm font-normal rounded-md transition-all duration-150 w-full text-start text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--errorColor)]',
              collapsed ? 'justify-center' : ''
            )}
            title={collapsed ? t('Logout') : ''}
          >
            <span className="shrink-0 w-4.5 h-4.5 flex-shrink-0 flex items-center justify-center">
              <LogOut className="h-4.5 w-4.5" />
            </span>
            {!collapsed && <span className="flex-1 truncate pl-1">{t('Logout')}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
