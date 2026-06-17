'use client';
// =============================================================
// components/layout/breadcrumb-nav.tsx
// =============================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  labelKey: string;
  href?: string;
}

const breadcrumbTranslations: Record<string, Record<string, string>> = {
  ES: {
    Dashboard: 'Dashboard',
    'Mis Grupos': 'Mis Grupos',
    Partidos: 'Partidos',
    'En Vivo': 'En Vivo',
    Llaves: 'Llaves',
    'Mi Perfil': 'Mi Perfil',
    'Mis Pronósticos': 'Mis Pronósticos',
    Ranking: 'Ranking',
    Configuración: 'Configuración',
    General: 'General',
    Participantes: 'Participantes',
    Invitaciones: 'Invitaciones',
    'Reglas del juego': 'Reglas del juego',
    Estadísticas: 'Estadísticas',
    Transferencia: 'Transferencia',
    'Zona de peligro': 'Zona de peligro',
    'Nuevo grupo': 'Nuevo grupo',
    'Detalle del grupo': 'Detalle del grupo',
    'Canales TV': 'Canales TV',
  },
  EN: {
    Dashboard: 'Dashboard',
    'Mis Grupos': 'My Groups',
    Partidos: 'Matches',
    'En Vivo': 'Live',
    Llaves: 'Bracket',
    'Mi Perfil': 'My Profile',
    'Mis Pronósticos': 'My Predictions',
    Ranking: 'Ranking',
    Configuración: 'Settings',
    General: 'General',
    Participantes: 'Participants',
    Invitaciones: 'Invitations',
    'Reglas del juego': 'Rules',
    Estadísticas: 'Statistics',
    Transferencia: 'Transfer',
    'Zona de peligro': 'Danger Zone',
    'Nuevo grupo': 'New Group',
    'Detalle del grupo': 'Group Details',
    'Canales TV': 'TV Channels',
  },
  FR: {
    Dashboard: 'Tableau de bord',
    'Mis Grupos': 'Mes Groupes',
    Partidos: 'Matchs',
    'En Vivo': 'En Direct',
    Llaves: 'Tableau du Tournoi',
    'Mi Perfil': 'Mon Profil',
    'Mis Pronósticos': 'Mes Pronostics',
    Ranking: 'Classement',
    Configuración: 'Paramètres',
    General: 'Général',
    Participantes: 'Participants',
    Invitaciones: 'Invitations',
    'Reglas del juego': 'Règles du jeu',
    Estadísticas: 'Statistiques',
    Transferencia: 'Transfert',
    'Zona de peligro': 'Zone de danger',
    'Nuevo grupo': 'Nouveau groupe',
    'Detalle del grupo': 'Détails du groupe',
    'Canales TV': 'Chaînes TV',
  },
  IT: {
    Dashboard: 'Dashboard',
    'Mis Grupos': 'I Miei Gruppi',
    Partidos: 'Partite',
    'En Vivo': 'Dal Vivo',
    Llaves: 'Tabellone del Torneo',
    'Mi Perfil': 'Il Mio Profilo',
    'Mis Pronósticos': 'I Miei Pronostici',
    Ranking: 'Classifica',
    Configuración: 'Impostazioni',
    General: 'Generale',
    Participantes: 'Partecipanti',
    Invitaciones: 'Inviti',
    'Reglas del juego': 'Regole del gioco',
    Estadísticas: 'Statistiche',
    Transferencia: 'Trasferimento',
    'Zona di pericolo': 'Zona di pericolo',
    'Nuevo grupo': 'Nuovo gruppo',
    'Detalle del grupo': 'Dettagli del gruppo',
    'Canales TV': 'Canali TV',
  },
  JA: {
    Dashboard: 'ダッシュボード',
    'Mis Grupos': 'マイグループ',
    Partidos: '試合',
    'En Vivo': 'ライブ',
    Llaves: 'トーナメント表',
    'Mi Perfil': 'マイプロフィール',
    'Mis Pronósticos': '予想一覧',
    Ranking: 'ランキング',
    Configuración: '設定',
    General: '一般',
    Participantes: '参加者',
    Invitaciones: '招待',
    'Reglas del juego': 'ゲームのルール',
    Estadísticas: '統計',
    Transferencia: '移行',
    'Zona de peligro': '危険エリア',
    'Nuevo grupo': '新規グループ',
    'Detalle del grupo': 'グループ詳細',
    'Canales TV': 'TVチャンネル',
  },
  KO: {
    Dashboard: '대시보드',
    'Mis Grupos': '내 그룹',
    Partidos: '경기',
    'En Vivo': '라이브',
    Llaves: '토너먼트 대진표',
    'Mi Perfil': '내 프로필',
    'Mis Pronósticos': '내 예측',
    Ranking: '랭킹',
    Configuración: '설정',
    General: '일반',
    Participantes: '참가자',
    Invitaciones: '초대',
    'Reglas del juego': '게임 규칙',
    Estadísticas: '통계',
    Transferencia: '이전',
    'Zona de peligro': '위험 구역',
    'Nuevo grupo': '새 그룹',
    'Detalle del grupo': '그룹 상세 정보',
    'Canales TV': 'TV 채널',
  },
};

export function BreadcrumbNav() {
  const pathname = usePathname();
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
    return breadcrumbTranslations[lang]?.[key] || breadcrumbTranslations['ES']?.[key] || key;
  };

  // No renderizar en el dashboard/inicio para evitar redundancia
  if (pathname === '/dashboard') {
    return null;
  }

  // Segmentar la ruta
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Agregar siempre el botón de inicio/dashboard al inicio si procede
  items.push({ labelKey: 'Dashboard', href: '/dashboard' });

  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Mapear segmentos dinámicos o estáticos a etiquetas amigables
    if (segment === 'groups') {
      items.push({ labelKey: 'Mis Grupos', href: '/groups' });
    } else if (segment === 'matches') {
      items.push({ labelKey: 'Partidos', href: '/matches' });
    } else if (segment === 'live') {
      items.push({ labelKey: 'En Vivo', href: '/matches/live' });
    } else if (segment === 'streams') {
      items.push({ labelKey: 'Canales TV', href: '/matches/streams' });
    } else if (segment === 'world-cup') {
      // Ignorar el segmento intermedio 'world-cup' para no duplicar niveles
      continue;
    } else if (segment === 'bracket') {
      items.push({ labelKey: 'Llaves', href: '/world-cup/bracket' });
    } else if (segment === 'profile') {
      items.push({ labelKey: 'Mi Perfil', href: '/profile' });
    } else if (segment === 'predictions') {
      items.push({ labelKey: 'Mis Pronósticos' });
    } else if (segment === 'ranking') {
      items.push({ labelKey: 'Ranking' });
    } else if (segment === 'settings') {
      items.push({ labelKey: 'Configuración' });
    } else if (segment === 'general') {
      items.push({ labelKey: 'General' });
    } else if (segment === 'participants') {
      items.push({ labelKey: 'Participantes' });
    } else if (segment === 'invitations') {
      items.push({ labelKey: 'Invitaciones' });
    } else if (segment === 'scoring') {
      items.push({ labelKey: 'Reglas del juego' });
    } else if (segment === 'stats') {
      items.push({ labelKey: 'Estadísticas' });
    } else if (segment === 'transfer') {
      items.push({ labelKey: 'Transferencia' });
    } else if (segment === 'danger') {
      items.push({ labelKey: 'Zona de peligro' });
    } else if (segment === 'create') {
      items.push({ labelKey: 'Nuevo grupo' });
    } else if (segments[i - 1] === 'groups') {
      // Es un ID de grupo, ej: /groups/[id]
      items.push({ labelKey: 'Detalle del grupo', href: `/groups/${segment}` });
    } else {
      // Fallback
      const capitalized = segment.charAt(0).toUpperCase() + segment.slice(1);
      items.push({ labelKey: capitalized });
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-x-2 text-sm mb-5 select-none">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <li className="flex items-center w-4 h-4 text-[var(--text-muted)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="block w-full h-full rtl:rotate-180"
                  >
                    <path d="M9 6l6 6l-6 6"></path>
                  </svg>
                </li>
              )}

              <li className="flex items-center">
                {index === 0 ? (
                  <Link
                    href={item.href || '/dashboard'}
                    className="flex items-center w-4 h-4 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="block w-full h-full"
                    >
                      <path d="M5 12l-2 0l9 -9l9 9l-2 0"></path>
                      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"></path>
                      <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"></path>
                    </svg>
                    <span className="sr-only">Home</span>
                  </Link>
                ) : isLast ? (
                  <div className="flex items-center gap-1.5 text-[var(--text)]">
                    <span aria-current="page" className="text-sm leading-[100%] font-semibold">
                      {t(item.labelKey)}
                    </span>
                  </div>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    {t(item.labelKey)}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
