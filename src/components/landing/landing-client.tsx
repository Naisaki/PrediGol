'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Users,
  Target,
  Star,
  ChevronRight,
  Hash,
  ChevronDown,
  Calendar,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/theme-toggle';

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
          <path d="M24 0 L0 24" stroke="#CF142B" strokeWidth="1" />
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

const landingTranslations: Record<string, Record<string, string>> = {
  ES: {
    navTitle1: 'Mundial',
    navTitle2: 'Predictor',
    login: 'Iniciar sesión',
    register: 'Crear cuenta',
    badge: 'Beta privada · Mundial FIFA 2026',
    heroTitle1: 'Pronostica el',
    heroTitleHighlight: 'Mundial',
    heroTitle2: 'con tus amigos',
    heroDesc: 'Crea tu grupo privado, pronostica los marcadores y compite en una tabla de posiciones. Sin apuestas, sin dinero — solo pura emoción deportiva entre amigos.',
    ctaPrimary: 'Crear mi grupo',
    ctaSecondary: 'Unirme con código',
    section1Title: 'Cómo funciona',
    section1Desc: 'En cuatro pasos tienes tu grupo listo para el Mundial',
    step1Title: 'Crea tu grupo',
    step1Desc: 'Elige un nombre, personaliza tu grupo y obtén tu código de invitación único.',
    step2Title: 'Invita a tus amigos',
    step2Desc: 'Comparte el enlace, el código o el QR — tus amigos se unen en segundos.',
    step3Title: 'Pronostica partidos',
    step3Desc: 'Ingresa el marcador exacto que crees que tendrá cada partido del Mundial.',
    step4Title: 'Gana el ranking',
    step4Desc: 'Suma puntos por cada acierto y sube en la tabla de posiciones del grupo.',
    section2Title: 'Sistema de puntuación',
    section2Desc: 'Simple, transparente y fácil de entender',
    pointsExact: '5 pts',
    labelExact: 'Marcador exacto',
    exampleExact: 'Predices 2-1 · Resultado 2-1',
    pointsCorrect: '3 pts',
    labelCorrect: 'Resultado correcto',
    exampleCorrect: 'Predices 1-0 · Resultado 2-1',
    pointsDiff: '+1 pt',
    labelDiff: 'Diferencia exacta',
    exampleDiff: 'Bonus si la diferencia de goles coincide',
    footerLeft: 'Mundial Predictor',
    footerBeta: 'Beta privada FIFA 2026',
    footerRight: 'Plataforma social y recreativa · Sin apuestas ni dinero real',
    socialProofBadge: 'Más de 1.2k jugadores activos',
    simulatedMatch: 'Partido Simulado',
  },
  EN: {
    navTitle1: 'World Cup',
    navTitle2: 'Predictor',
    login: 'Sign In',
    register: 'Create Account',
    badge: 'Private Beta · FIFA World Cup 2026',
    heroTitle1: 'Predict the',
    heroTitleHighlight: 'World Cup',
    heroTitle2: 'with your friends',
    heroDesc: 'Create your private group, predict the scores, and compete on a leaderboard. No betting, no money — just pure sporting excitement among friends.',
    ctaPrimary: 'Create my group',
    ctaSecondary: 'Join with code',
    section1Title: 'How it works',
    section1Desc: 'Get your group ready for the World Cup in four simple steps',
    step1Title: 'Create your group',
    step1Desc: 'Choose a name, customize your group, and get your unique invite code.',
    step2Title: 'Invite friends',
    step2Desc: 'Share the link, code, or QR — your friends join in seconds.',
    step3Title: 'Predict matches',
    step3Desc: 'Enter the exact score you think each World Cup match will have.',
    step4Title: 'Lead the board',
    step4Desc: 'Earn points for correct predictions and rise in your group ranking.',
    section2Title: 'Scoring system',
    section2Desc: 'Simple, transparent, and easy to understand',
    pointsExact: '5 pts',
    labelExact: 'Exact score',
    exampleExact: 'You predict 2-1 · Result 2-1',
    pointsCorrect: '3 pts',
    labelCorrect: 'Correct outcome',
    exampleCorrect: 'You predict 1-0 · Result 2-1',
    pointsDiff: '+1 pt',
    labelDiff: 'Exact difference',
    exampleDiff: 'Bonus if the goal difference matches',
    footerLeft: 'World Cup Predictor',
    footerBeta: 'Private Beta FIFA 2026',
    footerRight: 'Social and recreational platform · No real money or betting',
    socialProofBadge: 'Over 1.2k active players',
    simulatedMatch: 'Simulated Match',
  },
  FR: {
    navTitle1: 'Mondial',
    navTitle2: 'Predictor',
    login: 'Se connecter',
    register: 'Créer un compte',
    badge: 'Bêta privée · Coupe du Monde FIFA 2026',
    heroTitle1: 'Pronostiquez le',
    heroTitleHighlight: 'Mondial',
    heroTitle2: 'avec vos amis',
    heroDesc: 'Créez votre groupe privé, pronostiquez les scores et affrontez vos amis sur un classement. Sans paris, sans argent — juste du pur plaisir sportif entre amis.',
    ctaPrimary: 'Créer mon groupe',
    ctaSecondary: 'Rejoindre avec code',
    section1Title: 'Comment ça marche',
    section1Desc: 'En quatre étapes, votre groupe est prêt pour le Mondial',
    step1Title: 'Créez votre groupe',
    step1Desc: 'Choisissez un nom, personnalisez votre groupe et obtenez votre code d\'invitation unique.',
    step2Title: 'Invitez vos amis',
    step2Desc: 'Partagez le lien, le code ou le QR — vos amis rejoignent en quelques secondes.',
    step3Title: 'Pronostiquez',
    step3Desc: 'Saisissez le score exact que vous imaginez pour chaque match du Mondial.',
    step4Title: 'Remportez le classement',
    step4Desc: 'Cumulez des points à chaque bon pronostic et grimpez dans le classement.',
    section2Title: 'Système de points',
    section2Desc: 'Simple, transparent et facile à comprendre',
    pointsExact: '5 pts',
    labelExact: 'Score exact',
    exampleExact: 'Prono 2-1 · Résultat 2-1',
    pointsCorrect: '3 pts',
    labelCorrect: 'Résultat correct',
    exampleCorrect: 'Prono 1-0 · Résultat 2-1',
    pointsDiff: '+1 pt',
    labelDiff: 'Différence exacte',
    exampleDiff: 'Bonus si la différence de buts est correcte',
    footerLeft: 'Mondial Predictor',
    footerBeta: 'Bêta privée FIFA 2026',
    footerRight: 'Plateforme sociale et récréative · Sans argent ni paris réels',
    socialProofBadge: 'Plus de 1.2k joueurs actifs',
    simulatedMatch: 'Match Simulé',
  },
  IT: {
    navTitle1: 'Mondiale',
    navTitle2: 'Predictor',
    login: 'Accedi',
    register: 'Crea account',
    badge: 'Beta privata · Coppa del Mondo FIFA 2026',
    heroTitle1: 'Pronostica il',
    heroTitleHighlight: 'Mondiale',
    heroTitle2: 'con i tuoi amici',
    heroDesc: 'Crea il tuo gruppo privado, pronostica i risultati e sfida i tuoi amici in classifica. Senza scommesse, senza soldi — solo puro divertimento sportivo tra amici.',
    ctaPrimary: 'Crea il mio gruppo',
    ctaSecondary: 'Entra con codice',
    section1Title: 'Come funziona',
    section1Desc: 'In quattro semplici passaggi il tuo grupo è pronto per il Mondiale',
    step1Title: 'Crea il tuo gruppo',
    step1Desc: 'Scegli un nome, personalizza il gruppo e ottieni il tuo codice di invito unico.',
    step2Title: 'Invita i tuoi amici',
    step2Desc: 'Condividi il link, el codice o el QR — i tuoi amici si uniscono in pochi secondi.',
    step3Title: 'Pronostica i match',
    step3Desc: 'Inserisci el punteggio esatto che pensi avranno i match del Mondiale.',
    step4Title: 'Scala la classifica',
    step4Desc: 'Guadagna punti per ogni pronostico indovinato e sali in classifica.',
    section2Title: 'Sistema di punteggio',
    section2Desc: 'Semplice, trasparente e facile da capire',
    pointsExact: '5 pt',
    labelExact: 'Risultato esatto',
    exampleExact: 'Pronostico 2-1 · Risultato 2-1',
    pointsCorrect: '3 pt',
    labelCorrect: 'Esito corretto',
    exampleCorrect: 'Pronostico 1-0 · Risultato 2-1',
    pointsDiff: '+1 pt',
    labelDiff: 'Differenza esatta',
    exampleDiff: 'Bonus se la differenza reti coincide',
    footerLeft: 'Mondiale Predictor',
    footerBeta: 'Beta privata FIFA 2026',
    footerRight: 'Piattaforma sociale e ricreativa · Senza scommesse o soldi veri',
    socialProofBadge: 'Più di 1.2k giocatori attivi',
    simulatedMatch: 'Partita Simulata',
  },
  JA: {
    navTitle1: 'ワールドカップ',
    navTitle2: '予測ツール',
    login: 'ログイン',
    register: 'アカウント作成',
    badge: 'プライベートベータ · FIFAワールドカップ 2026',
    heroTitle1: '友達と一緒に',
    heroTitleHighlight: 'ワールドカップ',
    heroTitle2: 'を予測しよう',
    heroDesc: 'プライベートグループを作成し、スコアを予測して、リーダーボードで競い合いましょう。賭けもお金も不要 — 友達同士で純粋にスポーツの興奮を楽しみましょう。',
    ctaPrimary: 'グループを作成する',
    ctaSecondary: 'コードで参加する',
    section1Title: '使い方',
    section1Desc: 'たった4つのステップで、ワールドカップのグループ準備が完了します',
    step1Title: 'グループ作成',
    step1Desc: '名前を選び、グループをカスタマイズして、ユニークな招待コードを取得します。',
    step2Title: '友達を招待',
    step2Desc: 'リンク、コード、またはQRコードを共有すれば、友達は数秒で参加できます。',
    step3Title: '試合を予測',
    step3Desc: 'ワールドカップの各試合の正確なスコア予想を入力します。',
    step4Title: 'ランキングで勝利',
    step4Desc: '予測が当たるたびにポイントを獲得し、グループ内の順位を上げましょう。',
    section2Title: 'ポイントシステム',
    section2Desc: 'シンプルで透明性が高く、わかりやすいルール',
    pointsExact: '5点',
    labelExact: 'スコア的中',
    exampleExact: '予想 2-1 · 結果 2-1',
    pointsCorrect: '3点',
    labelCorrect: '勝敗的中',
    exampleCorrect: '予想 1-0 · 結果 2-1',
    pointsDiff: '+1点',
    labelDiff: '得失点差ボーナス',
    exampleDiff: '得失点差が一致した場合の追加ポイント',
    footerLeft: 'ワールドカップ予測ツール',
    footerBeta: 'プライベートベータ FIFA 2026',
    footerRight: 'ソーシャル＆レクリエーションプラットフォーム · 金銭や賭けはありません',
    socialProofBadge: '1,200人以上のプレイヤー',
    simulatedMatch: 'シミュレーション試合',
  },
  KO: {
    navTitle1: '월드컵',
    navTitle2: '예측기',
    login: '로그인',
    register: '계정 만들기',
    badge: '비공개 베타 · FIFA 월드컵 2026',
    heroTitle1: '친구들과 함께',
    heroTitleHighlight: '월드컵',
    heroTitle2: '결과를 예측해 보세요',
    heroDesc: '개인 그룹을 만들고, 스코어를 예측하고, 순위표에서 경쟁하세요. 베팅도 돈도 필요 없습니다. 친구들과 함께 순수한 스포츠의 감동만을 나누세요.',
    ctaPrimary: '내 그룹 만들기',
    ctaSecondary: '코드로 참여하기',
    section1Title: '진행 방법',
    section1Desc: '네 가지 단계만으로 월드컵 예측 그룹 준비 완료',
    step1Title: '그룹 만들기',
    step1Desc: '그룹 이름을 선택하고 꾸민 뒤, 고유 초대 코드를 받으세요.',
    step2Title: '친구 초대하기',
    step2Desc: '링크, 코드 또는 QR을 공유하세요. 친구들이 몇 초 만에 가입합니다.',
    step3Title: '결과 예측하기',
    step3Desc: '각 월드컵 경기에서 예상하는 정확한 스코어를 입력하세요.',
    step4Title: '순위표 우승하기',
    step4Desc: '맞출 때마다 점수를 획득하여 그룹 내 순위를 높이세요.',
    section2Title: '점수 산정 방식',
    section2Desc: '단순하고 투명하며 이해하기 쉽습니다',
    pointsExact: '5점',
    labelExact: '정확한 스코어',
    exampleExact: '예측 2-1 · 결과 2-1',
    pointsCorrect: '3점',
    labelCorrect: '경기 결과 맞춤',
    exampleCorrect: '예측 1-0 · 결과 2-1',
    pointsDiff: '+1점',
    labelDiff: '정확한 골 득실차',
    exampleDiff: '골 득실차가 일치할 경우 추가 보너스',
    footerLeft: '월드컵 예측기',
    footerBeta: '비공개 베타 FIFA 2026',
    footerRight: '소셜 및 오락용 플랫폼 · 실제 금전이나 도박이 없습니다',
    socialProofBadge: '1,200명 이상의 활성 플레이어',
    simulatedMatch: '가상 경기 결과',
  },
};

export function LandingClient() {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState('ES');
  const langMenuRef = useRef<HTMLDivElement>(null);
  
  // Interactive match simulation values
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(1);
  const [predHomeScore, setPredHomeScore] = useState(2);
  const [predAwayScore, setPredAwayScore] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem('locale') || 'ES';
    setCurrentLang(saved.toUpperCase());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lang: string) => {
    setCurrentLang(lang);
    localStorage.setItem('locale', lang);
    setShowLangMenu(false);
    window.dispatchEvent(new Event('locale-changed'));
  };

  const t = (key: string) => {
    return landingTranslations[currentLang]?.[key] || landingTranslations['ES'][key] || '';
  };

  // Calculate points dynamically for the interactive prediction widget
  const calculatePoints = () => {
    const exactMatch = predHomeScore === homeScore && predAwayScore === awayScore;
    if (exactMatch) return { pts: 5, type: 'exact' };
    
    const realDiff = homeScore - awayScore;
    const predDiff = predHomeScore - predAwayScore;
    
    const sign = (val: number) => (val > 0 ? 1 : val < 0 ? -1 : 0);
    const correctOutcome = sign(realDiff) === sign(predDiff);
    const correctDiff = realDiff === predDiff;
    
    if (correctOutcome && correctDiff) return { pts: 4, type: 'outcome_diff' };
    if (correctOutcome) return { pts: 3, type: 'outcome' };
    return { pts: 0, type: 'none' };
  };

  const pointsResult = calculatePoints();

  return (
    <div className="min-h-screen w-screen flex flex-col bg-[var(--background)] text-[var(--text)] font-sans relative overflow-x-hidden transition-colors duration-300">
      
      {/* Decorative vertical outer lines */}
      <div className="pointer-events-none absolute top-0 bottom-0 left-0 border-r border-[var(--border-subtle)] w-14 h-full z-10 hidden lg:block bg-[repeating-linear-gradient(315deg,rgba(0,0,0,0.02)_0,rgba(0,0,0,0.02)_1px,transparent_0,transparent_50%)] dark:bg-[repeating-linear-gradient(315deg,rgba(255,255,255,0.03)_0,rgba(255,255,255,0.03)_1px,transparent_0,transparent_50%)] bg-[size:10px_10px]" />
      <div className="pointer-events-none absolute top-0 bottom-0 right-0 border-l border-[var(--border-subtle)] w-14 h-full z-10 hidden lg:block bg-[repeating-linear-gradient(315deg,rgba(0,0,0,0.02)_0,rgba(0,0,0,0.02)_1px,transparent_0,transparent_50%)] dark:bg-[repeating-linear-gradient(315deg,rgba(255,255,255,0.03)_0,rgba(255,255,255,0.03)_1px,transparent_0,transparent_50%)] bg-[size:10px_10px]" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,var(--border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-subtle)_1px,transparent_1px)] bg-[size:90px_90px] opacity-40 dark:opacity-75 z-0" />

      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[15%] w-[50%] aspect-square rounded-full bg-primary/5 filter blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[10%] w-[45%] aspect-square rounded-full bg-emerald-500/5 filter blur-[140px] pointer-events-none z-0" />

      {/* Navbar Header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex justify-center w-full border-b border-[var(--border-subtle)] bg-[var(--background)]/85 backdrop-blur-md transition-colors duration-300">
        <div className="w-full max-w-[1360px] px-3 sm:px-6 lg:px-20 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold tracking-tight text-[var(--text)] text-sm sm:text-base select-none">
              {t('navTitle1')}<span className="text-primary font-black">{t('navTitle2')}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center justify-between gap-1 h-9 sm:h-10 px-2 sm:px-4 bg-[var(--control-bg)] border border-[var(--border-subtle)] rounded-full hover:bg-[var(--surface-hover)] transition-all text-[var(--text)] text-xs font-semibold cursor-pointer select-none"
              >
                {renderFlag(currentLang)}
                <span className="text-xs font-bold hidden sm:inline">{currentLang}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-1.5 w-32 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-lg shadow-2xl py-1 z-50 animate-fade-in flex flex-col gap-0.5">
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
            <div className="inline-flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--control-bg)] rounded-full hover:bg-[var(--surface-hover)] text-[var(--text)] h-9 w-9 sm:h-10 sm:w-10 transition-all cursor-pointer">
              <ThemeToggle />
            </div>

            <Link href="/login" className="hidden sm:inline-block">
              <Button variant="ghost" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors h-10 cursor-pointer">
                {t('login')}
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[var(--text)] text-[var(--background)] hover:opacity-90 transition-opacity font-semibold h-9 sm:h-10 rounded-full px-3 sm:px-5 text-xs sm:text-sm cursor-pointer">
                {t('register')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive Prediction Sandbox Widget (Non-generic Layout) */}
      <section className="pt-32 pb-16 px-6 lg:px-20 relative z-10 max-w-[1360px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Premium Text Pitch */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)]/50 backdrop-blur-sm text-[var(--text-muted)] text-xs font-semibold mb-6 animate-scale-in">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span>{t('badge')}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05] text-[var(--text)] select-none animate-slide-up">
              {t('heroTitle1')}{' '}
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {t('heroTitleHighlight')}
              </span>{' '}
              {t('heroTitle2')}
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl mb-8 leading-relaxed font-normal animate-slide-up delay-100">
              {t('heroDesc')}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto animate-scale-in">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="relative flex items-center justify-center gap-2 overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--text)] hover:opacity-90 px-8 h-12 w-full transition-all duration-300 cursor-pointer">
                  <span className="font-bold text-[var(--background)] text-base whitespace-nowrap">{t('ctaPrimary')}</span>
                  <ChevronRight className="h-4 w-4 text-[var(--background)]" />
                </button>
              </Link>

              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[var(--border-subtle)] hover:border-primary/50 bg-[var(--control-bg)] hover:bg-[var(--surface-hover)] text-[var(--text)] px-8 h-12 text-base font-semibold transition-all rounded-full w-full cursor-pointer flex items-center justify-center gap-2"
                >
                  <Hash className="h-4 w-4 text-primary" />
                  <span>{t('ctaSecondary')}</span>
                </Button>
              </Link>
            </div>

            {/* Social Proof Badge */}
            <div className="mt-8 flex items-center gap-3 animate-fade-in">
              <div className="flex -space-x-3 overflow-hidden">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--background)] bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">⚽</div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--background)] bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">🏆</div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--background)] bg-[var(--control-bg)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">⚡</div>
              </div>
              <span className="text-xs text-[var(--text-muted)] font-semibold tracking-wide uppercase border border-[var(--border-subtle)] bg-[var(--surface)]/30 px-3 py-1 rounded-full">{t('socialProofBadge')}</span>
            </div>
          </div>

          {/* Right Column: Interactive Sandbox Game Simulation */}
          <div className="lg:col-span-5 w-full flex items-center justify-center animate-scale-in">
            <div className="w-full max-w-[380px] bg-[var(--surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
              
              {/* Header of Sandbox */}
              <div className="flex items-center justify-between mb-4 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                  <Zap className="h-3.5 w-3.5 text-primary animate-pulse" />
                  <span>{t('simulatedMatch')}</span>
                </div>
                <div className="flex items-center gap-1 text-[var(--text-muted)]">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-2xs font-mono">14 JUL · 20:00</span>
                </div>
              </div>

              {/* Match Teams & Real Score Setter */}
              <div className="flex items-center justify-between gap-4 py-4 bg-[var(--background)]/40 p-4 rounded-2xl border border-[var(--border-subtle)] mb-4">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="text-3xl">🇪🇸</div>
                  <span className="text-xs font-bold">ESP</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                    className="w-6 h-6 rounded-full bg-[var(--control-bg)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-xs select-none cursor-pointer"
                  >-</button>
                  <span className="text-3xl font-black min-w-[20px] text-center">{homeScore}</span>
                  <button 
                    onClick={() => setHomeScore(homeScore + 1)}
                    className="w-6 h-6 rounded-full bg-[var(--control-bg)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-xs select-none cursor-pointer"
                  >+</button>
                </div>
                
                <span className="text-neutral-400 font-bold text-sm">:</span>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                    className="w-6 h-6 rounded-full bg-[var(--control-bg)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-xs select-none cursor-pointer"
                  >-</button>
                  <span className="text-3xl font-black min-w-[20px] text-center">{awayScore}</span>
                  <button 
                    onClick={() => setAwayScore(awayScore + 1)}
                    className="w-6 h-6 rounded-full bg-[var(--control-bg)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-xs select-none cursor-pointer"
                  >+</button>
                </div>

                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="text-3xl">🇫🇷</div>
                  <span className="text-xs font-bold">FRA</span>
                </div>
              </div>

              {/* User Interactive Prediction */}
              <div className="border border-[var(--border-subtle)] p-4 rounded-2xl bg-[var(--background)] flex flex-col gap-3">
                <span className="text-xs font-bold text-[var(--text-muted)] text-center uppercase tracking-wide">Tu Pronóstico</span>
                
                <div className="flex items-center justify-around">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setPredHomeScore(Math.max(0, predHomeScore - 1))}
                      className="w-7 h-7 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center font-bold cursor-pointer"
                    >-</button>
                    <span className="text-2xl font-black w-8 text-center text-primary">{predHomeScore}</span>
                    <button 
                      onClick={() => setPredHomeScore(predHomeScore + 1)}
                      className="w-7 h-7 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center font-bold cursor-pointer"
                    >+</button>
                  </div>

                  <span className="text-[var(--text-muted)] font-mono">vs</span>

                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setPredAwayScore(Math.max(0, predAwayScore - 1))}
                      className="w-7 h-7 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center font-bold cursor-pointer"
                    >-</button>
                    <span className="text-2xl font-black w-8 text-center text-primary">{predAwayScore}</span>
                    <button 
                      onClick={() => setPredAwayScore(predAwayScore + 1)}
                      className="w-7 h-7 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center font-bold cursor-pointer"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Point Result */}
              <div className="mt-4 flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 p-3 rounded-xl transition-all duration-300">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-[var(--text)]">
                  Puntos obtenidos: <span className="text-primary text-sm font-black">+{pointsResult.pts} pts</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  ({pointsResult.type === 'exact' ? 'Marcador Exacto' : pointsResult.type === 'outcome_diff' ? 'Resultado + Diff' : pointsResult.type === 'outcome' ? 'Resultado' : 'Sin Puntos'})
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Steps (Features section with Aniqui aesthetics, aligned padding and content layout) */}
      <section className="py-24 px-6 lg:px-20 relative z-10 max-w-[1360px] mx-auto w-full">
        <div className="text-left sm:text-center mb-16">
          <span className="inline-block border border-[var(--border-subtle)] bg-[var(--surface)]/50 backdrop-blur-sm text-[var(--text-muted)] text-xs tracking-wider uppercase rounded-full py-1.5 px-3.5 mb-4">
            Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight text-[var(--text)]">{t('section1Title')}</h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg font-medium max-w-xl sm:mx-auto">
            {t('section1Desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              icon: Users,
              title: t('step1Title'),
              description: t('step1Desc'),
            },
            {
              step: '02',
              icon: Hash,
              title: t('step2Title'),
              description: t('step2Desc'),
            },
            {
              step: '03',
              icon: Target,
              title: t('step3Title'),
              description: t('step3Desc'),
            },
            {
              step: '04',
              icon: Trophy,
              title: t('step4Title'),
              description: t('step4Desc'),
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-3xl p-6 group hover:border-primary/40 hover:bg-[var(--surface-hover)] transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden"
            >
              {/* Card top border glow effect on hover */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="text-xs font-mono text-primary/70 mb-4 font-bold tracking-widest">
                {item.step}
              </div>
              <div className="w-12 h-12 rounded-xl bg-[var(--control-bg)] border border-[var(--border-subtle)] flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                <item.icon className="h-5 w-5 text-[var(--text-muted)] group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-bold text-lg text-[var(--text)] mb-2">{item.title}</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed font-normal">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Scoring system */}
      <section className="py-24 px-6 lg:px-20 bg-[var(--surface)]/30 border-y border-[var(--border-subtle)] relative z-10 max-w-[1360px] mx-auto w-full">
        <div className="text-left sm:text-center mb-16">
          <span className="inline-block border border-[var(--border-subtle)] bg-[var(--surface)]/50 backdrop-blur-sm text-[var(--text-muted)] text-xs tracking-wider uppercase rounded-full py-1.5 px-3.5 mb-4">
            Rules
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight text-[var(--text)]">{t('section2Title')}</h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mb-12 max-w-xl sm:mx-auto">
            {t('section2Desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              points: t('pointsExact'),
              label: t('labelExact'),
              color: 'text-primary border-primary/20 bg-primary/5',
              desc: 'Ganas el máximo puntaje si aciertas el resultado y los goles exactos de ambos equipos.',
              visual: (
                <div className="flex flex-col gap-2 mt-4 bg-[var(--background)] p-3 rounded-2xl border border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-1.5">
                    <span>Tu Predicción</span>
                    <span className="font-bold text-primary">2 - 1</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text)]">
                    <span>Resultado Real</span>
                    <span className="font-bold">2 - 1</span>
                  </div>
                </div>
              ),
            },
            {
              points: t('pointsCorrect'),
              label: t('labelCorrect'),
              color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
              desc: 'Ganas puntos por acertar al ganador (o empate) del partido, aunque los goles no coincidan.',
              visual: (
                <div className="flex flex-col gap-2 mt-4 bg-[var(--background)] p-3 rounded-2xl border border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-1.5">
                    <span>Tu Predicción (Gana A)</span>
                    <span className="font-bold text-emerald-500">1 - 0</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text)]">
                    <span>Resultado Real (Gana A)</span>
                    <span className="font-bold">2 - 1</span>
                  </div>
                </div>
              ),
            },
            {
              points: t('pointsDiff'),
              label: t('labelDiff'),
              color: 'text-cyan-500 border-cyan-500/20 bg-cyan-500/5',
              desc: 'Ganas un bonus si aciertas la diferencia exacta de goles del partido (ej. ganar por un gol).',
              visual: (
                <div className="flex flex-col gap-2 mt-4 bg-[var(--background)] p-3 rounded-2xl border border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-1.5">
                    <span>Diferencia predicha (+1)</span>
                    <span className="font-bold text-cyan-500">1 - 0 (Diff: 1)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text)]">
                    <span>Diferencia real (+1)</span>
                    <span className="font-bold">2 - 1 (Diff: 1)</span>
                  </div>
                </div>
              ),
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-3xl p-6 border border-[var(--border-subtle)] bg-[var(--surface)] hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-[var(--text)] text-lg">{item.label}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md border ${item.color}`}>{item.points}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
              {item.visual}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-20 border-t border-[var(--border-subtle)] relative z-10 bg-[var(--background)] max-w-[1360px] mx-auto w-full transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="font-semibold text-[var(--text)]">{t('footerLeft')}</span>
            <span className="text-xs opacity-60">· {t('footerBeta')}</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-normal">
            {t('footerRight')}
          </p>
        </div>
      </footer>
    </div>
  );
}
