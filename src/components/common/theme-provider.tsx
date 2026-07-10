'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string') {
      if (args[0].includes('Encountered a script tag') || args[0].includes('clerk-captcha')) {
        return;
      }
    }
    orig.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

