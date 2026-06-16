'use client';
// =============================================================
// components/common/api-delay-notice.tsx
// Aviso discreto sobre posible retraso de la API gratuita
// =============================================================

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ApiDelayNoticeProps {
  className?: string;
}

const noticeTranslations: Record<string, string> = {
  ES: 'Los resultados pueden actualizarse con algunos minutos de retraso según la disponibilidad de football-data.org.',
  EN: 'Results may update with a few minutes delay depending on football-data.org availability.',
  FR: 'Les résultats peuvent être mis à jour avec quelques minutes de retard selon la disponibilité de football-data.org.',
  IT: 'I risultati possono essere aggiornati con alcuni minuti di ritardo a seconda della disponibilità di football-data.org.',
  JA: 'football-data.orgの稼働状況により、結果の更新に数分程度の遅れが生じる場合があります。',
  KO: 'football-data.org의 가용성에 따라 결과 업데이트가 몇 분 정도 지연될 수 있습니다.',
};

export function ApiDelayNotice({ className }: ApiDelayNoticeProps) {
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

  const text = noticeTranslations[lang] || noticeTranslations['ES'];

  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/30 text-xs text-[var(--text-muted)] ${className ?? ''}`}
    >
      <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-[var(--text-muted)]/60" />
      <span>{text}</span>
    </div>
  );
}
