// =============================================================
// app/(auth)/layout.tsx
// =============================================================

import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
        >
          <Trophy className="h-5 w-5 text-primary" />
          <span className="font-bold tracking-tight">Mundial Predictor</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
