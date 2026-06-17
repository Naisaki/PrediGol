'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Users, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JoinGroupForm } from './join-group-form';
import { cn } from '@/lib/utils/cn';

interface Group {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  inviteCode: string;
  joinsOpen: boolean;
  joinApproval: boolean;
  maxMembers: number | null;
  memberCount: number;
  currentUserRole: string | null;
}

interface GroupsListClientProps {
  initialGroups: Group[];
}

const groupsTranslations: Record<string, Record<string, string>> = {
  ES: {
    title: 'Mis Grupos',
    subtitle: 'Gestiona tus grupos de pronósticos',
    createGroup: 'Crear grupo',
    noGroupsTitle: 'Aún no tienes grupos',
    noGroupsDesc: 'Crea tu primer grupo o únete a uno con un código de invitación',
    createFirstGroup: 'Crear mi primer grupo',
    owner: 'Creador',
    admin: 'Admin',
    member: 'Miembro',
    noDescription: 'Sin descripción',
    closed: '🔒 Cerrado',
    approval: '⏳ Con Aprobación',
  },
  EN: {
    title: 'My Groups',
    subtitle: 'Manage your prediction groups',
    createGroup: 'Create Group',
    noGroupsTitle: "You don't have any groups yet",
    noGroupsDesc: 'Create your first group or join one with an invitation code',
    createFirstGroup: 'Create my first group',
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
    noDescription: 'No description',
    closed: '🔒 Closed',
    approval: '⏳ With Approval',
  },
  FR: {
    title: 'Mes Groupes',
    subtitle: 'Gérez vos groupes de pronostics',
    createGroup: 'Créer un groupe',
    noGroupsTitle: "Vous n'avez pas encore de groupes",
    noGroupsDesc: 'Créez votre premier groupe ou rejoignez-en un avec un code d’invitation',
    createFirstGroup: 'Créer mon premier groupe',
    owner: 'Créateur',
    admin: 'Admin',
    member: 'Membre',
    noDescription: 'Sans description',
    closed: '🔒 Fermé',
    approval: '⏳ Avec approbation',
  },
  IT: {
    title: 'I Miei Gruppi',
    subtitle: 'Gestisci i tuoi gruppi di pronostici',
    createGroup: 'Crea gruppo',
    noGroupsTitle: 'Non hai ancora nessun gruppo',
    noGroupsDesc: 'Crea il tuo primo gruppo o unisciti a uno con un codice di invito',
    createFirstGroup: 'Crea il mio primo gruppo',
    owner: 'Creatore',
    admin: 'Admin',
    member: 'Membro',
    noDescription: 'Senza descrizione',
    closed: '🔒 Chiuso',
    approval: '⏳ Con approvazione',
  },
  JA: {
    title: 'マイグループ',
    subtitle: '予想グループの管理',
    createGroup: 'グループを作成',
    noGroupsTitle: 'グループはまだありません',
    noGroupsDesc: '最初のグループを作成するか、招待コードで参加してください',
    createFirstGroup: '最初のグループを作成',
    owner: '作成者',
    admin: '管理者',
    member: 'メンバー',
    noDescription: '説明なし',
    closed: '🔒 非公開',
    approval: '⏳ 要承認',
  },
  KO: {
    title: '내 그룹',
    subtitle: '내 예측 그룹 관리',
    createGroup: '그룹 만들기',
    noGroupsTitle: '아직 그룹이 없습니다',
    noGroupsDesc: '첫 번째 그룹을 만들거나 초대 코드로 가입하세요',
    createFirstGroup: '내 첫 그룹 만들기',
    owner: '방장',
    admin: '관리자',
    member: '멤버',
    noDescription: '설명 없음',
    closed: '🔒 닫힘',
    approval: '⏳ 승인 대기',
  },
};

export function GroupsListClient({ initialGroups }: GroupsListClientProps) {
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
    return groupsTranslations[lang]?.[key] || groupsTranslations['ES']?.[key] || key;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">{t('title')}</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/groups/create">
          <Button className="bg-primary hover:bg-primary/90 gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('createGroup')}</span>
          </Button>
        </Link>
      </div>

      {/* Join by code */}
      <Card className="glass-card border-border/40">
        <CardContent className="p-4">
          <JoinGroupForm />
        </CardContent>
      </Card>

      {/* Groups list */}
      {initialGroups.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-semibold mb-2 text-[var(--text)]">
            {t('noGroupsTitle')}
          </h2>
          <p className="text-[var(--text-muted)] text-sm mb-6 max-w-sm mx-auto">
            {t('noGroupsDesc')}
          </p>
          <Link href="/groups/create">
            <Button className="bg-primary hover:bg-primary/90 cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              {t('createFirstGroup')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialGroups.map((g) => {
            // Generar iniciales del nombre del grupo
            const initials = g.name
              .split(' ')
              .map((word) => word[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            // Estilos específicos para la insignia del rol
            const roleBadgeStyles = {
              owner: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
              admin: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
              member: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
            }[g.currentUserRole || 'member'];

            const roleLabel = g.currentUserRole === 'owner' ? t('owner') : g.currentUserRole === 'admin' ? t('admin') : t('member');

            return (
              <Link key={g.id} href={`/groups/${g.id}`}>
                <Card className="glass-card border-transparent dark:border-[var(--border-subtle)] hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full group flex flex-col justify-between relative overflow-hidden">
                  {/* Dots background pattern */}
                  <div 
                    className="absolute -inset-[400px] pointer-events-none dots-pattern" 
                    style={{
                      opacity: 0.8,
                      transform: 'rotate(40deg)',
                      backgroundSize: '5px 5px',
                      '--dot-size': '3px',
                      '--light-dot-color': 'rgba(255, 255, 255, 0.25)',
                      '--dark-dot-color': 'rgba(0, 0, 0, 0.4)'
                    } as React.CSSProperties}
                  />
                  
                  {/* Glow effect */}
                  <div 
                    className="absolute inset-0 pointer-events-none" 
                    style={{ 
                      zIndex: 20, 
                      background: 'radial-gradient(1200px 600px at 0% 0%, rgba(205, 205, 205, 0.09) 0%, rgba(205, 205, 205, 0) 30%, transparent 70%)' 
                    }} 
                  />

                  <CardContent className="p-5 flex flex-col h-full relative z-10">
                    {/* Header: Avatar / Image & Role */}
                    <div className="flex items-start justify-between mb-4">
                      {g.imageUrl ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border/60">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={g.imageUrl}
                            alt={g.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-violet-500/30 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary tracking-wider">
                          {initials}
                        </div>
                      )}
                      <span className={cn('text-xs px-2.5 py-0.5 rounded-full font-medium', roleBadgeStyles)}>
                        {roleLabel}
                      </span>
                    </div>

                    {/* Body: Title and description */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors text-[var(--text)]">
                        {g.name}
                      </h3>

                      {g.description ? (
                        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4">
                          {g.description}
                        </p>
                      ) : (
                        <p className="text-sm text-[var(--text-muted)]/50 italic mb-4">
                          {t('noDescription')}
                        </p>
                      )}
                    </div>

                    {/* Footer: Stats, Code, Admission Lock status */}
                    <div className="pt-3 border-t border-border/20 flex items-center justify-between text-xs text-[var(--text-muted)] mt-auto gap-2">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground/75" />
                        <span>
                          {g.memberCount ?? 1}
                          {g.maxMembers ? ` / ${g.maxMembers}` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {g.joinsOpen === false ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                            {t('closed')}
                          </span>
                        ) : g.joinApproval ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            {t('approval')}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            <span className="font-mono tracking-wider font-semibold">{g.inviteCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
