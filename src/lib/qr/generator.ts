// =============================================================
// lib/qr/generator.ts
// Generación de códigos QR para invitaciones de grupo
// =============================================================

import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Genera un QR code como Data URL (base64) para mostrar en UI o descargar.
 * Solo se ejecuta en el servidor (Next.js Server Actions/Route Handlers).
 */
export async function generateQRCodeDataURL(
  text: string,
  options: QRCodeOptions = {},
): Promise<string> {
  const qrOptions: QRCode.QRCodeToDataURLOptions = {
    width: options.width ?? 300,
    margin: options.margin ?? 2,
    color: {
      dark: options.color?.dark ?? '#FFFFFF', // Blanco sobre fondo oscuro
      light: options.color?.light ?? '#00000000', // Transparente
    },
    errorCorrectionLevel: 'M',
    type: 'image/png',
  };

  return QRCode.toDataURL(text, qrOptions);
}

/**
 * Genera el enlace de invitación completo para un grupo.
 */
export function buildInviteUrl(inviteCode: string): string {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
  return `${appUrl}/join/${inviteCode}`;
}

/**
 * Genera un código de invitación único alfanumérico de 8 caracteres.
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin caracteres confusos (0,O,1,I)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
