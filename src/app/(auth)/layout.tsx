'use client';
// =============================================================
// app/(auth)/layout.tsx
// =============================================================

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Trophy, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';

interface AuthLayoutProps {
  children: React.ReactNode;
}

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

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState('ES');
  const langMenuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen w-full max-w-full flex flex-col bg-[var(--background)] relative overflow-x-hidden">
      {/* Background Grid Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none auth-grid-overlay opacity-80" />
      
      {/* Background Radial Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] aspect-square rounded-full bg-primary/5 filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-primary/5 filter blur-[120px] pointer-events-none" />

      {/* Premium Header/Navbar */}
      <header className="w-full h-16 flex items-center justify-between px-6 sm:px-12 border-b border-[var(--border-subtle)] bg-[var(--background)]/85 backdrop-blur-md z-40 relative">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-all group-hover:scale-105 group-hover:border-primary/45 shadow-sm shadow-primary/5">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold tracking-tight text-[var(--text)] text-base select-none">
              Mundial<span className="text-primary font-black">Predictor</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center justify-between gap-1.5 h-8 px-3 bg-[var(--control-bg)] border border-[var(--border-subtle)] rounded-full hover:bg-[var(--surface-hover)] transition-all text-[var(--text)] text-xs font-normal cursor-pointer select-none"
            >
              {renderFlag(currentLang)}
              <span className="text-xs font-semibold">{currentLang}</span>
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

          {/* Theme Toggle */}
          <div className="inline-flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--control-bg)] rounded-full hover:bg-[var(--surface-hover)] text-[var(--text)] h-8 w-8 transition-all">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 z-30 relative min-h-0">
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </main>
    </div>
  );
}
