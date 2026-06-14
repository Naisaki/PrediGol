// =============================================================
// lib/utils/dates.ts
// Utilidades de fechas para partidos y pronósticos
// =============================================================
import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isPast,
  parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha UTC al horario local del usuario para mostrar en UI.
 */
export function formatMatchDate(utcDate: string): string {
  const date = parseISO(utcDate);
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

export function formatMatchTime(utcDate: string): string {
  const date = parseISO(utcDate);
  return format(date, 'HH:mm');
}

export function formatMatchDateTime(utcDate: string): string {
  const date = parseISO(utcDate);
  if (isToday(date)) return `Hoy ${format(date, 'HH:mm')}`;
  if (isTomorrow(date)) return `Mañana ${format(date, 'HH:mm')}`;
  return format(date, "d 'de' MMM, HH:mm", { locale: es });
}

export function formatRelativeTime(utcDate: string): string {
  return formatDistanceToNow(parseISO(utcDate), {
    addSuffix: true,
    locale: es,
  });
}

/**
 * Determina si un partido ya comenzó basándose en kickoff_time guardado en Supabase.
 * Este es el método preferido para bloquear pronósticos.
 */
export function isMatchStarted(kickoffTime: string): boolean {
  return isPast(parseISO(kickoffTime));
}

/**
 * Formatea la última actualización de la API para mostrar en el aviso de retraso.
 */
export function formatLastUpdated(utcDate: string | null): string {
  if (!utcDate) return 'No disponible';
  return formatDistanceToNow(parseISO(utcDate), {
    addSuffix: true,
    locale: es,
  });
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
