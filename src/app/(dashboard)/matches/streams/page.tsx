'use client';

import React, { useState, useEffect } from 'react';
import { Tv, ShieldAlert, Play, ExternalLink, Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface ChannelOption {
  name: string;
  url: string;
  provider: string;
  descKey: string;
  category: string;
}

const CHANNELS: ChannelOption[] = [
  {
    name: 'ESPN',
    url: 'https://tvtvhd.com/tv/canales.php?stream=espn',
    provider: 'tvtvhd.com',
    descKey: 'descESPN',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN 2',
    url: 'https://tvtvhd.com/tv/canales.php?stream=espn2',
    provider: 'tvtvhd.com',
    descKey: 'descESPN2',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN 3',
    url: 'https://tvtvhd.com/tv/canales.php?stream=espn3',
    provider: 'tvtvhd.com',
    descKey: 'descESPN3',
    category: 'Latinoamérica',
  },
  {
    name: 'ESPN Premium',
    url: 'https://tvtvhd.com/tv/canales.php?stream=espnpremium',
    provider: 'tvtvhd.com',
    descKey: 'descESPNPremium',
    category: 'Argentina',
  },
  {
    name: 'DIRECTV Sports (DSPORTS)',
    url: 'https://tvtvhd.com/tv/canales.php?stream=dsports',
    provider: 'tvtvhd.com',
    descKey: 'descDsports',
    category: 'Latinoamérica',
  },
  {
    name: 'Fox Sports',
    url: 'https://tvtvhd.com/tv/canales.php?stream=foxsports',
    provider: 'tvtvhd.com',
    descKey: 'descFoxSports',
    category: 'Argentina',
  },
  {
    name: 'Fox Sports 2',
    url: 'https://tvtvhd.com/tv/canales.php?stream=foxsports2',
    provider: 'tvtvhd.com',
    descKey: 'descFoxSports2',
    category: 'Argentina',
  },
  {
    name: 'Fox Sports 3',
    url: 'https://tvtvhd.com/tv/canales.php?stream=foxsports3',
    provider: 'tvtvhd.com',
    descKey: 'descFoxSports3',
    category: 'Argentina',
  },
  {
    name: 'TyC Sports',
    url: 'https://tvtvhd.com/tv/canales.php?stream=tycsports',
    provider: 'tvtvhd.com',
    descKey: 'descTycSports',
    category: 'Argentina',
  },
  {
    name: 'Liga1 MAX',
    url: 'https://tvtvhd.com/tv/canales.php?stream=liga1max',
    provider: 'tvtvhd.com',
    descKey: 'descLiga1Max',
    category: 'Perú',
  },
];

const streamsTranslations: Record<string, Record<string, string>> = {
  ES: {
    title: 'Canales de Transmisión',
    subtitle: 'Elige una señal deportiva para ver en vivo a cualquier hora, incluso si no hay partidos programados.',
    availableSignals: 'Señales Disponibles',
    playingNow: 'Reproduciendo ahora',
    openExternal: 'Abrir señal externa',
    streamNoticeTitle: 'Aviso sobre la transmisión',
    streamNoticeDesc: 'Esta señal es provista de forma externa por {provider}. Te recomendamos encarecidamente utilizar un bloqueador de anuncios (AdBlocker) en tu navegador para evitar la publicidad emergente del reproductor de origen.',
    descESPN: 'Fútbol internacional, Champions League, ligas europeas.',
    descESPN2: 'Tenis, ligas americanas y transmisiones secundarias.',
    descESPN3: 'Eventos especiales, ciclismo, deportes de motor.',
    descESPNPremium: 'Partidos del fútbol argentino en vivo.',
    descDsports: 'Exclusivas de LaLiga, Copa del Rey y eventos FIFA.',
    descFoxSports: 'Copa Libertadores, Champions League y automovilismo.',
    descFoxSports2: 'Ligas continentales, NFL y deportes extremos.',
    descFoxSports3: 'Fórmula 1 y transmisiones especiales de motor.',
    descTycSports: 'Fútbol argentino, copa nacional y deportes nacionales.',
    descLiga1Max: 'Partidos en vivo del fútbol profesional peruano.',
  },
  EN: {
    title: 'Streaming Channels',
    subtitle: 'Choose a sports signal to watch live at any time, even if no matches are scheduled.',
    availableSignals: 'Available Signals',
    playingNow: 'Playing now',
    openExternal: 'Open external stream',
    streamNoticeTitle: 'Broadcast Notice',
    streamNoticeDesc: 'This signal is externally provided by {provider}. We highly recommend using an AdBlocker in your browser to avoid popup ads from the source player.',
    descESPN: 'International football, Champions League, European leagues.',
    descESPN2: 'Tennis, American leagues, and secondary broadcasts.',
    descESPN3: 'Special events, cycling, motor sports.',
    descESPNPremium: 'Live Argentine football matches.',
    descDsports: 'LaLiga exclusives, Copa del Rey, and FIFA events.',
    descFoxSports: 'Copa Libertadores, Champions League, and motorsports.',
    descFoxSports2: 'Continental leagues, NFL, and extreme sports.',
    descFoxSports3: 'Formula 1 and special motorsport broadcasts.',
    descTycSports: 'Argentine football, national cup, and national sports.',
    descLiga1Max: 'Live matches of Peruvian professional football.',
  },
  FR: {
    title: 'Chaînes de Diffusion',
    subtitle: 'Choisissez un signal sportif à regarder en direct à tout moment, même si aucun match n’est programmé.',
    availableSignals: 'Signaux Disponibles',
    playingNow: 'En cours de diffusion',
    openExternal: 'Ouvrir le flux externe',
    streamNoticeTitle: 'Avis de diffusion',
    streamNoticeDesc: 'Ce signal est fourni en externe par {provider}. Nous vous recommandons vivement d’utiliser un bloqueur de publicité (AdBlocker) dans votre navigateur pour éviter les publicités pop-up du lecteur d’origine.',
    descESPN: 'Football international, Champions League, ligues européennes.',
    descESPN2: 'Tennis, ligues américaines et diffusions secondaires.',
    descESPN3: 'Événements spéciaux, cyclisme, sports mécaniques.',
    descESPNPremium: 'Matchs de football argentin en direct.',
    descDsports: 'Exclusivités LaLiga, Copa del Rey et événements FIFA.',
    descFoxSports: 'Copa Libertadores, Champions League et sports mécaniques.',
    descFoxSports2: 'Ligues continentales, NFL et sports extrêmes.',
    descFoxSports3: 'Formule 1 et émissions spéciales de sports mécaniques.',
    descTycSports: 'Football argentin, coupe nationale et sports nationaux.',
    descLiga1Max: 'Matchs en direct du football professionnel péruvien.',
  },
  IT: {
    title: 'Canali di Trasmissione',
    subtitle: 'Scegli un canale sportivo da guardare in diretta in qualsiasi momento, anche se non sono in programma partite.',
    availableSignals: 'Canali Disponibili',
    playingNow: 'In riproduzione ora',
    openExternal: 'Apri sorgente esterna',
    streamNoticeTitle: 'Avviso sulla trasmissione',
    streamNoticeDesc: 'Questo segnale è fornito esternamente da {provider}. Ti consigliamo vivamente di utilizzare un blocco annunci (AdBlocker) nel tuo browser per evitare annunci pubblicitari pop-up dal player di origine.',
    descESPN: 'Calcio internazionale, Champions League, campionati europei.',
    descESPN2: 'Tennis, leghe americane e trasmissioni secondarie.',
    descESPN3: 'Eventi speciali, ciclismo, sport motoristici.',
    descESPNPremium: 'Partite di calcio argentino in diretta.',
    descDsports: 'Esclusive LaLiga, Copa del Rey ed eventi FIFA.',
    descFoxSports: 'Copa Libertadores, Champions League e sport motoristici.',
    descFoxSports2: 'Campionati continentali, NFL e sport estremi.',
    descFoxSports3: 'Formula 1 e trasmissioni motoristiche speciali.',
    descTycSports: 'Calcio argentino, coppa nazionale e sport nazionali.',
    descLiga1Max: 'Partite in diretta del calcio professionistico peruviano.',
  },
  JA: {
    title: '配信チャンネル一覧',
    subtitle: '予定されている試合がない場合でも、いつでもスポーツ中継をリアルタイムでご視聴いただけます。',
    availableSignals: '利用可能なチャンネル',
    playingNow: '現在再生中',
    openExternal: '外部で開く',
    streamNoticeTitle: '配信に関するお知らせ',
    streamNoticeDesc: 'この信号は{provider}によって外部から提供されています。ソースプレーヤーのポップアップ広告を避けるために、ブラウザで広告ブロッカー（AdBlocker）を使用することを強くお勧めします。',
    descESPN: '国際サッカー、チャンピオンズリーグ、欧州リーグ。',
    descESPN2: 'テニス、アメリカンリーグ、およびサブ配信。',
    descESPN3: 'スペシャルイベント、自転車、モータースポーツ。',
    descESPNPremium: 'アルゼンチンサッカーの生中継。',
    descDsports: 'ラ・リーガ独占、コパ・デル・レイ、FIFAイベント。',
    descFoxSports: 'コパ・リベルタドーレス、チャンピオンズリーグ、モータースポーツ。',
    descFoxSports2: '大陸別リーグ、NFL、エクストリームスポーツ。',
    descFoxSports3: 'F1とモータースポーツ特別中継。',
    descTycSports: 'アルゼンチンサッカー、ナショナルカップ、国内スポーツ。',
    descLiga1Max: 'ペループロサッカーの生中継。',
  },
  KO: {
    title: '실시간 중계 채널',
    subtitle: '예정된 경기가 없는 경우에도 언제든지 스포츠 실시간 중계를 시청할 수 있습니다.',
    availableSignals: '시청 가능한 채널',
    playingNow: '현재 재생 중',
    openExternal: '외부창에서 열기',
    streamNoticeTitle: '중계 관련 안내',
    streamNoticeDesc: '이 신호는 {provider}에서 외부적으로 제공됩니다. 원본 플레이어의 팝업 광고를 방지하려면 브라우저에서 광고 차단기(AdBlocker)를 사용하는 것이 좋습니다.',
    descESPN: '국제 축구, 챔피언스 리그, 유럽 리그.',
    descESPN2: '테니스, 미국 리그 및 보조 중계.',
    descESPN3: '특별 이벤트, 사이클링, 모터 스포츠.',
    descESPNPremium: '아르헨티나 축구 실시간 생중계.',
    descDsports: '라리가 독점, 코파 델 레이 및 FIFA 이벤트.',
    descFoxSports: '코파 리베르타도레스, 챔피언스 리그 및 모터스포츠.',
    descFoxSports2: '대륙별 리그, NFL 및 익스트림 스포츠.',
    descFoxSports3: '포뮬러 1 및 특별 모터스포츠 중계.',
    descTycSports: '아르헨티나 축구, 내셔널 컵 및 국내 스포츠.',
    descLiga1Max: '페루 프로 축구 실시간 생중계.',
  },
};

export default function StreamsPage() {
  const [activeChannel, setActiveChannel] = useState<ChannelOption>(CHANNELS[0]);
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
    return streamsTranslations[lang]?.[key] || streamsTranslations['ES']?.[key] || key;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text)]">
          <Radio className="h-6 w-6 text-primary animate-pulse" />
          {t('title')}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de canales */}
        <div className="lg:col-span-1 space-y-3 lg:max-h-[600px] lg:overflow-y-auto overflow-x-auto flex flex-row lg:flex-col gap-3 lg:gap-0 pb-3 lg:pb-0 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent overscroll-behavior-x-contain -webkit-overflow-scrolling-touch">
          <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-1 mb-2 hidden lg:block">
            {t('availableSignals')}
          </div>
          {CHANNELS.map((ch, idx) => {
            const isSelected = activeChannel.url === ch.url;
            return (
              <Card
                key={idx}
                onClick={() => setActiveChannel(ch)}
                className={cn(
                  'cursor-pointer border transition-all hover:bg-[var(--surface-hover)] flex-shrink-0 w-[260px] lg:w-full lg:mb-3',
                  isSelected 
                    ? 'bg-primary/5 border-primary/45 shadow-md shadow-primary/5' 
                    : 'glass-card border-border/40'
                )}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4 h-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="relative flex h-2 w-2 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      <h3 className={cn('font-bold text-sm truncate', isSelected ? 'text-primary' : 'text-[var(--text)]')}>
                        {ch.name}
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                      {t(ch.descKey)}
                    </p>
                    <span className="inline-block mt-2 text-[9px] px-1.5 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold">
                      {ch.category}
                    </span>
                  </div>
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                    isSelected ? 'bg-primary/20 text-primary' : 'bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
                  )}>
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reproductor principal */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass-card border-border/40 overflow-hidden shadow-2xl">
            <div className="p-4 bg-[var(--surface-hover)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-xs text-[var(--text-muted)]">{t('playingNow')}</span>
                <h2 className="text-base font-bold text-[var(--text)] truncate">{activeChannel.name}</h2>
              </div>
              <a
                href={activeChannel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/35 transition-colors cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{t('openExternal')}</span>
              </a>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={activeChannel.url}
                className="absolute inset-0 w-full h-full border-none"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            </div>

            {/* Footer de información / advertencia */}
            <div className="p-4 bg-[var(--surface-hover)]/50 border-t border-[var(--border-subtle)] flex items-start gap-3 text-xs text-[var(--text-muted)]">
              <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[var(--text)] mb-0.5">{t('streamNoticeTitle')}</p>
                <p>
                  {t('streamNoticeDesc').replace('{provider}', activeChannel.provider)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
