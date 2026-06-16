'use client';

import React, { useEffect, useState } from 'react';

const translations: Record<string, { welcome: string; subtitle: string }> = {
  ES: { welcome: '¡Hola, {name}! 👋', subtitle: 'Bienvenido al Mundial Predictor FIFA 2026' },
  EN: { welcome: 'Hello, {name}! 👋', subtitle: 'Welcome to FIFA World Cup Predictor 2026' },
  FR: { welcome: 'Bonjour, {name}! 👋', subtitle: 'Bienvenue au Pronostiqueur de la Coupe du Monde FIFA 2026' },
  IT: { welcome: 'Ciao, {name}! 👋', subtitle: 'Benvenuto nel Pronosticatore della Coppa del Mondo FIFA 2026' },
  JA: { welcome: 'こんにちは、{name}さん! 👋', subtitle: 'FIFAワールドカップ2026予想サイトへようこそ' },
  KO: { welcome: '안녕하세요, {name}님! 👋', subtitle: 'FIFA 월드컵 2026 예측에 오신 것을 환영합니다' },
};

export function WelcomeHeader({ name }: { name: string }) {
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

  const t = translations[lang] || translations['ES'];
  const welcomeText = t.welcome.replace('{name}', name);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text)]">{welcomeText}</h1>
      <p className="text-[var(--text-muted)] mt-1">{t.subtitle}</p>
    </div>
  );
}
