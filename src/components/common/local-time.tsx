'use client';

import { useEffect, useState } from 'react';

interface LocalTimeProps {
  utcDate: string;
  className?: string;
}

export function LocalTime({ utcDate, className }: LocalTimeProps) {
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    // Esto se ejecuta solo en el navegador del usuario, obteniendo su zona horaria real
    const date = new Date(utcDate);
    setFormattedTime(
      date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // Cambia a false si prefieres formato de 24 horas
      })
    );
  }, [utcDate]);

  // Renderiza un esqueleto o texto vacío durante el renderizado inicial en servidor para evitar errores de hidratación
  return <span className={className}>{formattedTime || '...'}</span>;
}
