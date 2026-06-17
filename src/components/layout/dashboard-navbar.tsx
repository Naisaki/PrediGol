'use client';
// =============================================================
// components/layout/dashboard-navbar.tsx
// =============================================================

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Bell, ChevronDown, Search, X, Calendar, Globe, Users, Radio, Tv, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/common/theme-toggle';

interface DashboardNavbarProps {
  username: string;
  avatarUrl: string | null;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const searchLinks = [
  { href: '/dashboard', label: 'Inicio / Home', icon: Trophy, category: 'Navegación' },
  { href: '/groups', label: 'Mis Grupos / My Groups', icon: Users, category: 'Navegación' },
  { href: '/matches', label: 'Partidos / Matches', icon: Calendar, category: 'Navegación' },
  { href: '/matches/live', label: 'Partidos En Vivo / Live Matches', icon: Radio, category: 'Navegación' },
  { href: '/matches/streams', label: 'Canales TV / Streams', icon: Tv, category: 'Navegación' },
  { href: '/world-cup/groups', label: 'Grupos del Mundial / World Cup Groups', icon: Globe, category: 'Mundial' },
  { href: '/world-cup/bracket', label: 'Llaves del Mundial / Tournament Bracket', icon: Trophy, category: 'Mundial' },
  { href: '/profile', label: 'Mi Perfil / My Profile', icon: User, category: 'Ajustes' },
];

const renderFlag = (lang: string) => {
  switch (lang) {
    case 'ES':
      return (
        <svg className="h-4 w-4 rounded-xs object-cover flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" fill="#C60B1E" rx="2" />
          <rect y="6" width="24" height="12" fill="#F1BF00" />
        </svg>
      );
    case 'EN':
      return (
        <svg className="h-4 w-4 rounded-xs object-cover flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" fill="#00247D" rx="2" />
          <path d="M0 0 L24 24 M24 0 L0 24" stroke="#FFF" strokeWidth="2" />
          <path d="M0 0 L24 24 M24 0 L0 24" stroke="#CF142B" strokeWidth="1" />
          <path d="M12 0 V24 M0 12 H24" stroke="#FFF" strokeWidth="3" />
          <path d="M12 0 V24 M0 12 H24" stroke="#CF142B" strokeWidth="2" />
        </svg>
      );
    case 'FR':
      return (
        <svg className="h-4 w-4 rounded-xs object-cover flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="8" height="24" fill="#002395" />
          <rect x="8" width="8" height="24" fill="#FFFFFF" />
          <rect x="16" width="8" height="24" fill="#ED2939" />
        </svg>
      );
    case 'IT':
      return (
        <svg className="h-4 w-4 rounded-xs object-cover flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="8" height="24" fill="#009246" />
          <rect x="8" width="8" height="24" fill="#F1F2F1" />
          <rect x="16" width="8" height="24" fill="#CE2B37" />
        </svg>
      );
    case 'JA':
      return (
        <svg className="h-4 w-4 rounded-xs object-cover flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" fill="#FFFFFF" rx="2" />
          <circle cx="12" cy="12" r="5" fill="#BC002D" />
        </svg>
      );
    case 'KO':
      return (
        <svg className="h-4 w-4 rounded-xs object-cover flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" fill="#FFFFFF" rx="2" />
          <circle cx="12" cy="12" r="4" fill="#CD2E3A" />
          <path d="M12 8 A4 4 0 0 0 12 16 A2 2 0 0 0 12 12 A2 2 0 0 1 12 8" fill="#0047A0" />
          <rect x="5" y="6" width="2" height="1" fill="#000" transform="rotate(-45 5 6)" />
          <rect x="17" y="6" width="2" height="1" fill="#000" transform="rotate(45 17 6)" />
          <rect x="5" y="17" width="2" height="1" fill="#000" transform="rotate(45 5 17)" />
          <rect x="17" y="17" width="2" height="1" fill="#000" transform="rotate(-45 17 17)" />
        </svg>
      );
    default:
      return null;
  }
};


const navTranslations: Record<string, Record<string, string>> = {
  ES: {
    searchPlaceholder: 'Buscar sección o página...',
    searchLabel: 'Buscar...',
    noResults: 'No se encontraron resultados',
    searchFooter: '↑↓ para navegar, Enter para seleccionar',
    searchEsc: 'para cerrar',
    notifications: 'Notificaciones',
    startsSoon: '⚽ ¡Empieza pronto!',
    startsSoonDesc: 'El partido Argentina vs Brasil inicia en 30 minutos. Registra tu pronóstico.',
    newGroup: '👥 Grupo Nuevo',
    newGroupDesc: '@juan_perez te invitó al grupo "Familia Predictora".',
    'Inicio': 'Inicio',
    'Mis Grupos': 'Mis Grupos',
    'Partidos': 'Partidos',
    'Partidos En Vivo': 'Partidos En Vivo',
    'Canales TV': 'Canales TV',
    'Grupos del Mundial': 'Grupos del Mundial',
    'Llaves del Mundial': 'Llaves del Mundial',
    'Mi Perfil': 'Mi Perfil',
    'Navegación': 'Navegación',
    'Mundial': 'Mundial',
    'Ajustes': 'Ajustes',
  },
  EN: {
    searchPlaceholder: 'Search section or page...',
    searchLabel: 'Search...',
    noResults: 'No results found',
    searchFooter: '↑↓ to navigate, Enter to select',
    searchEsc: 'to close',
    notifications: 'Notifications',
    startsSoon: '⚽ Starts soon!',
    startsSoonDesc: 'Argentina vs Brazil matches starts in 30 mins. Place your prediction.',
    newGroup: '👥 New Group',
    newGroupDesc: '@juan_perez invited you to "Familia Predictora" group.',
    'Inicio': 'Home',
    'Mis Grupos': 'My Groups',
    'Partidos': 'Matches',
    'Partidos En Vivo': 'Live Matches',
    'Canales TV': 'Streams',
    'Grupos del Mundial': 'World Cup Groups',
    'Llaves del Mundial': 'Tournament Bracket',
    'Mi Perfil': 'My Profile',
    'Navegación': 'Navigation',
    'Mundial': 'World Cup',
    'Ajustes': 'Settings',
  },
  FR: {
    searchPlaceholder: 'Rechercher une section ou une page...',
    searchLabel: 'Rechercher...',
    noResults: 'Aucun résultat trouvé',
    searchFooter: '↑↓ pour naviguer, Entrée pour sélectionner',
    searchEsc: 'pour fermer',
    notifications: 'Notifications',
    startsSoon: '⚽ Commence bientôt!',
    startsSoonDesc: 'Le match Argentine vs Brésil commence dans 30 minutes. Enregistrez votre pronostic.',
    newGroup: '👥 Nouveau Groupe',
    newGroupDesc: '@juan_perez vous a invité au groupe "Familia Predictora".',
    'Inicio': 'Accueil',
    'Mis Grupos': 'Mes Groupes',
    'Partidos': 'Matchs',
    'Partidos En Vivo': 'Matchs en Direct',
    'Canales TV': 'Chaînes TV / Streams',
    'Grupos del Mundial': 'Groupes de la Coupe du Monde',
    'Llaves del Mundial': 'Tableau du Tournoi',
    'Mi Perfil': 'Mon Profil',
    'Navegación': 'Navigation',
    'Mundial': 'Coupe du Monde',
    'Ajustes': 'Paramètres',
  },
  IT: {
    searchPlaceholder: 'Cerca sezione o pagina...',
    searchLabel: 'Cerca...',
    noResults: 'Nessun risultato trovato',
    searchFooter: '↑↓ per navigare, Invio per selezionare',
    searchEsc: 'per chiudere',
    notifications: 'Notifiche',
    startsSoon: '⚽ Inizia presto!',
    startsSoonDesc: 'La partita Argentina vs Brasile inizia tra 30 minuti. Registra il tuo pronostico.',
    newGroup: '👥 Nuovo Gruppo',
    newGroupDesc: '@juan_perez ti ha invitato al gruppo "Familia Predictora".',
    'Inicio': 'Home',
    'Mis Grupos': 'I Miei Gruppi',
    'Partidos': 'Partite',
    'Partidos En Vivo': 'Partite dal Vivo',
    'Canales TV': 'Canali TV / Stream',
    'Grupos del Mundial': 'Gruppi della Coppa del Mondo',
    'Llaves del Mundial': 'Tabellone del Torneo',
    'Mi Perfil': 'Il Mio Profilo',
    'Navegación': 'Navigazione',
    'Mundial': 'Coppa del Mondo',
    'Ajustes': 'Impostazioni',
  },
  JA: {
    searchPlaceholder: 'セクションまたはページを検索...',
    searchLabel: '検索...',
    noResults: '結果が見つかりません',
    searchFooter: '↑↓で移動、Enterで選択',
    searchEsc: 'で閉じる',
    notifications: '通知',
    startsSoon: '⚽ まもなく開始！',
    startsSoonDesc: 'アルゼンチン対ブラジルの試合は30分後に開始します。予想を登録してください。',
    newGroup: '👥 新しいグループ',
    newGroupDesc: '@juan_perezさんが「Familia Predictora」グループに招待しました。',
    'Inicio': 'ホーム',
    'Mis Grupos': 'マイグループ',
    'Partidos': '試合',
    'Partidos En Vivo': 'ライブ試合',
    'Canales TV': 'TVチャンネル / 配信',
    'Grupos del Mundial': 'ワールドカップグループ',
    'Llaves del Mundial': 'トーナメント表',
    'Mi Perfil': 'マイプロフィール',
    'Navegación': 'ナビゲーション',
    'Mundial': 'ワールドカップ',
    'Ajustes': '設定',
  },
  KO: {
    searchPlaceholder: '섹션 또는 페이지 검색...',
    searchLabel: '검색...',
    noResults: '검색 결과가 없습니다',
    searchFooter: '↑↓ 이동, Enter 선택',
    searchEsc: '닫기',
    notifications: '알림',
    startsSoon: '⚽ 곧 시작합니다!',
    startsSoonDesc: '아르헨티나 대 브라질 경기가 30분 후에 시작됩니다. 예측을 등록하세요.',
    newGroup: '👥 새로운 그룹',
    newGroupDesc: '@juan_perez님이 "Familia Predictora" 그룹에 초대했습니다.',
    'Inicio': '홈',
    'Mis Grupos': '내 그룹',
    'Partidos': '경기',
    'Partidos En Vivo': '라이브 경기',
    'Canales TV': 'TV 채널 / 스트림',
    'Grupos del Mundial': '월드컵 조 편성',
    'Llaves del Mundial': '토너먼트 대진표',
    'Mi Perfil': '내 프로필',
    'Navegación': '네비게이션',
    'Mundial': '월드컵',
    'Ajustes': '설정',
  },
};

export function DashboardNavbar({
  username,
  avatarUrl,
  collapsed,
  setCollapsed,
}: DashboardNavbarProps) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState('ES');
  const [showNotifications, setShowNotifications] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Cargar idioma de localStorage
  useEffect(() => {
    const saved = localStorage.getItem('locale') || 'ES';
    setCurrentLang(saved);

    const handleLocaleChange = () => {
      setCurrentLang(localStorage.getItem('locale') || 'ES');
    };
    window.addEventListener('locale-changed', handleLocaleChange);
    return () => window.removeEventListener('locale-changed', handleLocaleChange);
  }, []);

  const t = (key: string) => {
    return navTranslations[currentLang]?.[key] || navTranslations['ES']?.[key] || key;
  };

  // Escuchar atajo Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cerrar menús al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lang: string) => {
    setCurrentLang(lang);
    localStorage.setItem('locale', lang);
    setShowLangMenu(false);
    // Disparar evento personalizado para que el Sidebar se traduzca de inmediato
    window.dispatchEvent(new Event('locale-changed'));
  };

  const handleSearchNavigate = (href: string) => {
    router.push(href);
    setShowSearch(false);
    setSearchQuery('');
  };

  // Obtener etiqueta del link según idioma
  const getSearchLinkLabel = (link: { label: string }) => {
    const baseKey = link.label.split(' / ')[0];
    return t(baseKey);
  };

  // Filtrar links según query
  const filteredLinks = searchLinks.filter((link) => {
    const label = getSearchLinkLabel(link);
    return label.toLowerCase().includes(searchQuery.toLowerCase()) ||
           link.label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      <header className="flex flex-col gap-3 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl z-30 w-full h-16 shrink-0 shadow-xs transition-all duration-300">
        <div className="flex items-center justify-between p-3 h-full">
          {/* Left Section: Menu Toggle & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center h-8 w-8 rounded-full bg-[var(--surface-hover)] hover:bg-[var(--border-subtle)] cursor-pointer transition-colors text-[var(--text)]"
              title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1m0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1M3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1"
                />
              </svg>
            </button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary flex-shrink-0 animate-pulse" />
              <span className="font-bold text-sm tracking-tight text-[var(--text)] hidden sm:inline-block">
                Predictor
              </span>
            </Link>
          </div>

          {/* Right Section: Actions, Language, Theme, Profile */}
          <div className="flex items-center gap-3 px-1 sm:px-3">
            {/* Search Bar Trigger */}
            <button
              onClick={() => setShowSearch(true)}
              className="whitespace-nowrap font-medium duration-200 select-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)] hidden md:flex items-center justify-between w-52 h-8 px-3 text-xs bg-[var(--control-bg)] border border-[var(--border-subtle)] rounded-full hover:bg-[var(--surface-hover)] transition-all text-left"
            >
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span className="text-xs font-normal">{t('searchLabel')}</span>
              </div>
              <kbd className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono bg-[var(--surface)] text-[var(--text-muted)] rounded border border-[var(--border-subtle)] shadow-xs">
                Ctrl+K
              </kbd>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center justify-between gap-1.5 h-8 px-3 bg-[var(--control-bg)] border border-[var(--border-subtle)] rounded-full hover:bg-[var(--surface-hover)] transition-all text-[var(--text)] text-xs font-normal cursor-pointer select-none"
              >
                {renderFlag(currentLang)}
                <span className="text-xs">{currentLang}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-1.5 w-32 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-lg shadow-lg py-1 z-50 animate-fade-in flex flex-col gap-0.5">
                  {[
                    { code: 'ES', name: 'Español' },
                    { code: 'EN', name: 'English' },
                    { code: 'FR', name: 'Français' },
                    { code: 'IT', name: 'Italiano' },
                    { code: 'JA', name: '日本語' },
                    { code: 'KO', name: '한국어' },
                  ].map((langObj) => (
                    <button
                      key={langObj.code}
                      onClick={() => changeLanguage(langObj.code)}
                      className="w-full text-left px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {renderFlag(langObj.code)}
                      <span>{langObj.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle Wrapper */}
            <div className="inline-flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--control-bg)] rounded-full hover:bg-[var(--surface-hover)] text-[var(--text)] h-8 w-8 transition-all">
              <ThemeToggle />
            </div>

            {/* Notifications Popover */}
            <div className="relative" ref={notifMenuRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative inline-flex items-center justify-center h-8 w-8 border border-[var(--border-subtle)] bg-[var(--control-bg)] rounded-full hover:bg-[var(--surface-hover)] text-[var(--text)] transition-all cursor-pointer"
              >
                <Bell className="h-4 w-4 text-[var(--text)]" />
                <span className="absolute -top-1 -end-1 bg-[var(--destructive)] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  2
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-1.5 w-72 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl p-3 z-50 animate-scale-in text-[var(--text)]">
                  <h4 className="text-xs font-bold text-[var(--text)] border-b border-[var(--border-subtle)] pb-2 mb-2">
                    {t('notifications')}
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    <div className="text-xs border-b border-[var(--border-subtle)] pb-2 last:border-0 last:pb-0">
                      <p className="font-semibold text-primary">
                        {t('startsSoon')}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {t('startsSoonDesc')}
                      </p>
                    </div>
                    <div className="text-xs border-b border-[var(--border-subtle)] pb-2 last:border-0 last:pb-0">
                      <p className="font-semibold text-[var(--text)]">
                        {t('newGroup')}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {t('newGroupDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Direct Link */}
            <Link href="/profile">
              <button className="flex items-center justify-center sm:justify-start gap-2 h-8 w-8 sm:w-auto sm:px-2.5 bg-[var(--control-bg)] border border-[var(--border-subtle)] rounded-full hover:bg-[var(--surface-hover)] text-[var(--text)] text-xs cursor-pointer transition-all">
                <Avatar className="h-5 w-5 border border-[var(--border-subtle)]">
                  <AvatarImage src={avatarUrl ?? ''} alt={username} />
                  <AvatarFallback className="bg-[var(--surface-hover)] text-[var(--text)] text-[9px] font-bold">
                    {username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold text-[var(--text)] hidden sm:block">
                  @{username}
                </span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* --- COMMAND PALETTE SEARCH MODAL --- */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-start justify-center pt-[15vh] p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-4 flex flex-col gap-3 animate-scale-in text-[var(--text)]">
            {/* Input Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 outline-none text-sm w-full focus:ring-0 text-[var(--text)] placeholder:text-[var(--text-muted)]"
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer p-1 rounded-md hover:bg-[var(--surface-hover)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Links/Results */}
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
              {filteredLinks.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-6">
                  {t('noResults')}
                </p>
              ) : (
                filteredLinks.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchNavigate(link.href)}
                    className="flex items-center justify-between w-full p-2.5 rounded-lg text-left text-xs hover:bg-[var(--surface-hover)] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-1.5 rounded-md bg-[var(--control-bg)] text-[var(--text-muted)] group-hover:text-primary transition-colors">
                        <link.icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-[var(--text)]">
                          {getSearchLinkLabel(link)}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          {link.href}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-[var(--control-bg)] px-2 py-0.5 rounded-full text-[var(--text-muted)]">
                      {t(link.category)}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer tips */}
            <div className="text-[10px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-2.5 flex items-center justify-between">
              <span>{t('searchFooter')}</span>
              <span>{t('searchEsc')}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
