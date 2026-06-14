'use server';
// =============================================================
// server/actions/auth.ts
// Server Actions para autenticación
// =============================================================

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  username: z
    .string()
    .min(3, 'El username debe tener al menos 3 caracteres')
    .max(20, 'El username no puede superar 20 caracteres')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Solo letras, números y guión bajo',
    ),
  fullName: z.string().min(2, 'Ingresa tu nombre completo').optional(),
});

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

// ---- Login -------------------------------------------------

export async function loginAction(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { success: false, error: 'Email o contraseña incorrectos.' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

// ---- Registro ----------------------------------------------

export async function registerAction(
  email: string,
  password: string,
  username: string,
  fullName?: string,
): Promise<AuthActionResult> {
  const validation = registerSchema.safeParse({
    email,
    password,
    username,
    fullName,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    };
  }

  const supabase = await createClient();

  // Verificar que el username no esté tomado
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username.toLowerCase())
    .single();

  if (existingProfile) {
    return {
      success: false,
      error: 'Ese username ya está en uso. Elige otro.',
    };
  }

  // Registrar usuario
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { success: false, error: 'Ya existe una cuenta con ese email.' };
    }
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    return { success: false, error: 'Error al crear cuenta. Intenta de nuevo.' };
  }

  // Crear perfil
  const { error: profileError } = await supabase.from('profiles').insert({
    user_id: authData.user.id,
    username: username.toLowerCase(),
    full_name: fullName ?? null,
  });

  if (profileError) {
    return { success: false, error: `Error al crear perfil: ${profileError.message}` };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

// ---- Logout ------------------------------------------------

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

// ---- Recuperar contraseña ----------------------------------

export async function forgotPasswordAction(
  email: string,
): Promise<AuthActionResult> {
  const validation = z.string().email().safeParse(email);
  if (!validation.success) {
    return { success: false, error: 'Email inválido' };
  }

  const supabase = await createClient();
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?type=recovery`,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ---- Actualizar perfil -------------------------------------

export async function updateProfileAction(
  username: string,
  fullName?: string,
  avatarUrl?: string,
): Promise<AuthActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'No autenticado' };

  const { error } = await supabase
    .from('profiles')
    .update({
      username: username.toLowerCase(),
      full_name: fullName ?? null,
      avatar_url: avatarUrl ?? null,
    })
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/profile');
  return { success: true };
}
