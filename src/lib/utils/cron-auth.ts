// =============================================================
// Utilidad compartida para verificar CRON_SECRET en endpoints
// =============================================================

import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifica que la request tenga el CRON_SECRET correcto.
 * Retorna null si es válida, o un NextResponse de error si no lo es.
 *
 * Uso con cron-job.org:
 * Agregar header: Authorization: Bearer {CRON_SECRET}
 */
export function verifyCronSecret(request: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET no está configurado en variables de entorno');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '').trim();

  if (!token || token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // Válido
}

/**
 * Crea una respuesta JSON estándar para los cron endpoints.
 */
export function cronResponse(
  data: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(
    { ...data, timestamp: new Date().toISOString() },
    { status },
  );
}
