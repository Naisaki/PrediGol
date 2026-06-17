'use client';

import React, { useState, useEffect } from 'react';
import { Tv, X, ShieldAlert, ChevronDown, Radio, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { translateTeamName } from '@/lib/utils/teams';

interface StreamPlayerModalProps {
  streamUrl?: string | null;
  homeTeam: string;
  awayTeam: string;
}

interface ChannelOption {
  name: string;
  url: string;
  provider: string;
  isRecommended?: boolean;
}

// Canales preconfigurados extraídos de la18hd.com
const DEFAULT_CHANNELS: ChannelOption[] = [
  { name: 'ESPN', url: 'https://la18hd.com/vivo/canales.php?stream=espn', provider: 'la18hd.com' },
  { name: 'ESPN 2', url: 'https://la18hd.com/vivo/canales.php?stream=espn2', provider: 'la18hd.com' },
  { name: 'ESPN 3', url: 'https://la18hd.com/vivo/canales.php?stream=espn3', provider: 'la18hd.com' },
  { name: 'ESPN Premium', url: 'https://la18hd.com/vivo/canales.php?stream=espnpremium', provider: 'la18hd.com' },
  { name: 'DIRECTV Sports (DSPORTS)', url: 'https://la18hd.com/vivo/canales.php?stream=dsports', provider: 'la18hd.com' },
  { name: 'DSports Plus', url: 'https://la18hd.com/vivo/canales.php?stream=dsportsplus', provider: 'la18hd.com' },
  { name: 'Fox Sports', url: 'https://la18hd.com/vivo/canales.php?stream=foxsports', provider: 'la18hd.com' },
  { name: 'Fox Sports 2', url: 'https://la18hd.com/vivo/canales.php?stream=foxsports2', provider: 'la18hd.com' },
  { name: 'Fox Sports 3', url: 'https://la18hd.com/vivo/canales.php?stream=foxsports3', provider: 'la18hd.com' },
  { name: 'TyC Sports', url: 'https://la18hd.com/vivo/canales.php?stream=tycsports', provider: 'la18hd.com' },
  { name: 'Liga1 MAX', url: 'https://la18hd.com/vivo/canales.php?stream=liga1max', provider: 'la18hd.com' },
  { name: 'Caracol TV', url: 'https://la18hd.com/vivo/canales.php?stream=caracol', provider: 'la18hd.com' },
  { name: 'VTV Plus', url: 'https://la18hd.com/vivo/canales.php?stream=vtvplus', provider: 'la18hd.com' },
  { name: 'Win Sports', url: 'https://la18hd.com/vivo/canales.php?stream=winsports', provider: 'la18hd.com' },
];

const modalTranslations: Record<string, Record<string, string>> = {
  ES: {
    btnWatchLive: 'Ver Transmisión en Vivo',
    activeChannel: 'Canal activo:',
    loading: 'Cargando...',
    changeSignal: 'Cambiar señal',
    liveSignalsForMatch: 'Señales en vivo para este partido',
    allSportsSignals: 'Todas las señales deportivas',
    fullScreen: 'Pantalla Completa',
    searchingSignals: 'Buscando señales oficiales para el partido...',
    channelUnavailable: 'Canal no disponible',
    noSignalsFound: 'No se encontraron señales de transmisión activas en la agenda.',
    notice: 'Aviso: Señales obtenidas de la agenda de {provider}. Recomendamos AdBlocker para evitar anuncios emergentes.',
    customSignal: 'Señal Personalizada (Recomendada)',
    altSignal: 'Señal Alternativa',
    directSignal: 'Señal Directa',
    signal: 'Señal',
  },
  EN: {
    btnWatchLive: 'Watch Live Stream',
    activeChannel: 'Active channel:',
    loading: 'Loading...',
    changeSignal: 'Change signal',
    liveSignalsForMatch: 'Live signals for this match',
    allSportsSignals: 'All sports signals',
    fullScreen: 'Fullscreen',
    searchingSignals: 'Searching official signals for the match...',
    channelUnavailable: 'Channel unavailable',
    noSignalsFound: 'No active streaming signals found in the schedule.',
    notice: 'Notice: Signals obtained from the schedule of {provider}. We recommend an AdBlocker to avoid popup ads.',
    customSignal: 'Custom Signal (Recommended)',
    altSignal: 'Alternative Signal',
    directSignal: 'Direct Signal',
    signal: 'Signal',
  },
  FR: {
    btnWatchLive: 'Voir le direct',
    activeChannel: 'Canal actif:',
    loading: 'Chargement...',
    changeSignal: 'Changer de signal',
    liveSignalsForMatch: 'Signaux en direct pour ce match',
    allSportsSignals: 'Tous les signaux sportifs',
    fullScreen: 'Plein écran',
    searchingSignals: 'Recherche de signaux officiels pour le match...',
    channelUnavailable: 'Canal indisponible',
    noSignalsFound: 'Aucun signal de diffusion actif trouvé dans le programme.',
    notice: 'Avis: Signaux obtenus à partir du calendrier de {provider}. Nous vous recommandons un AdBlocker pour éviter les publicités.',
    customSignal: 'Signal personnalisé (Recommandé)',
    altSignal: 'Signal alternatif',
    directSignal: 'Signal direct',
    signal: 'Signal',
  },
  IT: {
    btnWatchLive: 'Guarda lo streaming live',
    activeChannel: 'Canale attivo:',
    loading: 'Caricamento...',
    changeSignal: 'Cambia segnale',
    liveSignalsForMatch: 'Segnali live per questa partita',
    allSportsSignals: 'Tutti i segnali sportivi',
    fullScreen: 'Schermo Intero',
    searchingSignals: 'Ricerca dei segnali ufficiali per la partita...',
    channelUnavailable: 'Canale non disponibile',
    noSignalsFound: 'Nessun segnale di trasmissione attivo trovato nel programma.',
    notice: 'Avviso: Segnali ottenuti dal palinsesto di {provider}. Consigliamo un AdBlocker per evitare popup pubblicitari.',
    customSignal: 'Segnale personalizzato (Consigliato)',
    altSignal: 'Segnale alternativo',
    directSignal: 'Segnale diretto',
    signal: 'Segnale',
  },
  JA: {
    btnWatchLive: 'ライブ配信を視聴する',
    activeChannel: '有効なチャンネル:',
    loading: '読み込み中...',
    changeSignal: '配信元を変更',
    liveSignalsForMatch: 'この試合のライブ配信',
    allSportsSignals: 'すべてのスポーツ配信',
    fullScreen: '全画面表示',
    searchingSignals: '試合の公式配信を検索中...',
    channelUnavailable: 'チャンネル利用不可',
    noSignalsFound: 'スケジュールにアクティブな配信が見つかりませんでした。',
    notice: 'お知らせ: {provider}のスケジュールから取得した信号です。ポップアップ広告を避けるために広告ブロッカー（AdBlocker）の使用を推奨します。',
    customSignal: 'カスタム配信（推奨）',
    altSignal: '代替配信',
    directSignal: '直接配信',
    signal: '配信',
  },
  KO: {
    btnWatchLive: '실시간 중계 보기',
    activeChannel: '활성 채널:',
    loading: '로딩 중...',
    changeSignal: '채널 전환',
    liveSignalsForMatch: '이 경기의 실시간 채널',
    allSportsSignals: '모든 스포츠 채널',
    fullScreen: '전체 화면',
    searchingSignals: '경기의 공식 채널을 찾는 중...',
    channelUnavailable: '시청 불가 채널',
    noSignalsFound: '일정에 활성화된 중계 채널이 없습니다.',
    notice: '안내: {provider} 일정에서 획득한 신호입니다. 팝업 광고 방지를 위해 광고 차단기(AdBlocker) 사용을 권장합니다.',
    customSignal: '맞춤형 채널 (추천)',
    altSignal: '대체 채널',
    directSignal: '직접 채널',
    signal: '채널',
  },
};

export function StreamPlayerModal({ streamUrl, homeTeam, awayTeam }: StreamPlayerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [channelsList, setChannelsList] = useState<ChannelOption[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChannelOption>({ name: '', url: '', provider: '' });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
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
    const upperLang = lang.toUpperCase();
    return modalTranslations[upperLang]?.[key] || modalTranslations['ES']?.[key] || key;
  };

  // Normalizar nombres de equipos para comparar
  const cleanTeamName = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\b(fc|sd|cd|club|real|deportivo|atletico|rd)\b/g, '')
      .trim();
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchAgenda = async () => {
      setLoadingSchedule(true);
      
      let list: ChannelOption[] = [];
      if (streamUrl) {
        list.push({ 
          name: t('customSignal'), 
          url: streamUrl, 
          provider: 'Admin',
          isRecommended: true
        });
      }

      try {
        const res = await fetch('/api/stream-status?type=agenda');
        if (res.ok) {
          const agenda = await res.json();
          
          // Obtener todas las traducciones posibles de los equipos para buscar coincidencia sin importar el idioma de la agenda
          const homeTranslations = new Set<string>();
          homeTranslations.add(cleanTeamName(homeTeam));
          ['ES', 'EN', 'FR', 'IT', 'JA', 'KO'].forEach(l => {
            const trans = translateTeamName(homeTeam, l);
            if (trans) homeTranslations.add(cleanTeamName(trans));
          });

          const awayTranslations = new Set<string>();
          awayTranslations.add(cleanTeamName(awayTeam));
          ['ES', 'EN', 'FR', 'IT', 'JA', 'KO'].forEach(l => {
            const trans = translateTeamName(awayTeam, l);
            if (trans) awayTranslations.add(cleanTeamName(trans));
          });

          const matchedEvents = agenda.filter((event: any) => {
            const titleClean = cleanTeamName(event.title || '');
            const matchesHome = Array.from(homeTranslations).some(name => titleClean.includes(name));
            const matchesAway = Array.from(awayTranslations).some(name => titleClean.includes(name));
            return matchesHome || matchesAway;
          });

          if (matchedEvents.length > 0) {
            matchedEvents.forEach((event: any, idx: number) => {
              if (event.link) {
                let cName = '';
                if (event.link.includes('stream=')) {
                  const streamParam = new URL(event.link).searchParams.get('stream');
                  const matchedDefault = DEFAULT_CHANNELS.find(c => c.url.includes(`stream=${streamParam}`));
                  cName = matchedDefault ? matchedDefault.name : `${t('signal')} ${streamParam?.toUpperCase()}`;
                } else if (event.link.includes('drm')) {
                  cName = `${t('altSignal')} DRM ${idx + 1}`;
                } else {
                  cName = `${t('directSignal')} ${idx + 1}`;
                }

                if (event.language) {
                  cName += ` (${event.language})`;
                }

                let provider = 'la18hd.com';
                try {
                  const urlObj = new URL(event.link);
                  provider = urlObj.hostname;
                } catch (_) {}

                list.push({
                  name: cName,
                  url: event.link,
                  provider: provider,
                  isRecommended: true
                });
              }
            });
          }
        }
      } catch (err) {
        console.error('Error fetching la18hd agenda:', err);
      }

      const hasRecommended = list.some(c => c.isRecommended);
      list = [...list, ...DEFAULT_CHANNELS];

      const uniqueList = list.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

      setChannelsList(uniqueList);
      setActiveChannel(uniqueList[0]);
      setLoadingSchedule(false);
    };

    fetchAgenda();
  }, [isOpen, streamUrl, homeTeam, awayTeam, lang]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold shadow-md shadow-primary/10 transition-all hover:scale-[1.01]"
      >
        <Tv className="h-4 w-4" />
        {t('btnWatchLive')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-4xl w-full bg-[var(--surface)] border-border/40 p-0 overflow-hidden shadow-2xl rounded-2xl">
          <DialogHeader className="p-4 bg-[var(--surface-hover)] border-b border-[var(--border-subtle)] flex flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="truncate">{translateTeamName(homeTeam, lang)} vs {translateTeamName(awayTeam, lang)}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span>{t('activeChannel')}</span>
                <span className="text-primary font-semibold truncate max-w-[180px] sm:max-w-xs">{activeChannel.name || t('loading')}</span>
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 z-50">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={loadingSchedule}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--control-bg)] border border-[var(--border-subtle)] text-xs font-semibold text-foreground hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
                >
                  <span>{t('changeSignal')}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-[var(--surface)] border border-border/40 shadow-xl overflow-y-auto max-h-[300px] py-1 z-50">
                    {channelsList.some(c => c.isRecommended) && (
                      <>
                        <div className="px-3 py-1 text-[10px] font-bold text-primary uppercase border-b border-border/20 mb-1 flex items-center gap-1">
                          <Radio className="h-3 w-3 animate-pulse text-primary" />
                          {t('liveSignalsForMatch')}
                        </div>
                        {channelsList.filter(c => c.isRecommended).map((ch, idx) => (
                          <button
                            key={`rec-${idx}`}
                            onClick={() => {
                              setActiveChannel(ch);
                              setShowDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col ${
                              activeChannel.url === ch.url 
                                ? 'bg-primary/15 text-primary font-bold' 
                                : 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                            }`}
                          >
                            <span className="truncate">{ch.name}</span>
                            <span className="text-[9px] text-[var(--text-muted)] font-normal">vía {ch.provider}</span>
                          </button>
                        ))}
                        <div className="h-[1px] bg-[var(--border-subtle)] my-2" />
                      </>
                    )}

                    <div className="px-3 py-1 text-[10px] font-bold text-[var(--text-muted)] uppercase border-b border-border/20 mb-1">
                      {t('allSportsSignals')}
                    </div>
                    {channelsList.filter(c => !c.isRecommended).map((ch, idx) => (
                      <button
                        key={`gen-${idx}`}
                        onClick={() => {
                          setActiveChannel(ch);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col ${
                          activeChannel.url === ch.url 
                            ? 'bg-primary/15 text-primary font-bold' 
                            : 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        <span className="truncate">{ch.name}</span>
                        <span className="text-[9px] text-[var(--text-muted)] font-normal">vía {ch.provider}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {activeChannel.url && (
                <a
                  href={activeChannel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/35 transition-colors"
                >
                  <Tv className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('fullScreen')}</span>
                </a>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-full flex-shrink-0"
              onClick={() => {
                setIsOpen(false);
                setShowDropdown(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="relative aspect-video w-full bg-black">
            {loadingSchedule ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-xs text-[var(--text-muted)] font-medium">{t('searchingSignals')}</span>
              </div>
            ) : activeChannel.url ? (
              <iframe
                src={activeChannel.url}
                className="absolute inset-0 w-full h-full border-none"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-2 p-4 text-center">
                <Info className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-semibold text-[var(--text)]">{t('channelUnavailable')}</span>
                <span className="text-xs text-[var(--text-muted)] max-w-xs">{t('noSignalsFound')}</span>
              </div>
            )}
          </div>
          
          <div className="bg-[var(--surface-hover)] border-t border-[var(--border-subtle)] px-4 py-2.5 flex items-center gap-2.5 text-[10px] text-muted-foreground">
            <ShieldAlert className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span className="truncate">
              {t('notice').replace('{provider}', activeChannel.provider || 'la18hd.com')}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
