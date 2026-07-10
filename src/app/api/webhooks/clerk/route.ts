import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Error: CLERK_WEBHOOK_SECRET no está configurado en las variables de entorno.');
    return new Response('CLERK_WEBHOOK_SECRET no configurado', { status: 500 });
  }

  // Obtener headers de Svix para validación de firma
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Cabeceras de Svix ausentes', { status: 400 });
  }

  // Obtener el body raw
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error al verificar la firma del Webhook:', err);
    return new Response('Error de firma inválida', { status: 400 });
  }

  const eventType = evt.type;
  const serviceClient = createServiceClient();

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id: clerkUserId, email_addresses, primary_email_address_id, username, first_name, last_name, image_url } = evt.data;

    // Buscar email principal y verificar
    const primaryEmailObj = (email_addresses || []).find(
      (email: any) => email.id === primary_email_address_id
    );

    const emailRaw = primaryEmailObj ? primaryEmailObj.email_address : null;
    const isVerified = primaryEmailObj?.verification?.status === 'verified';

    const normalizedEmail = emailRaw ? emailRaw.trim().toLowerCase() : null;
    const sanitizedUsername = username ? username.trim().toLowerCase() : `user_${clerkUserId.slice(-6)}`;
    const fullName = `${first_name ?? ''} ${last_name ?? ''}`.trim() || null;

    console.log(`[Clerk Webhook] Procesando evento ${eventType} para Clerk ID: ${clerkUserId}`);

    // Validar email verificado
    if (normalizedEmail && !isVerified) {
      console.warn(`[Clerk Webhook] [email no verificado] Clerk ID ${clerkUserId} tiene email ${normalizedEmail} sin verificar. Omitiendo vinculación.`);
    }

    // Validar Apple private relay
    const isAppleRelay = normalizedEmail?.endsWith('@privaterelay.appleid.com');
    if (isAppleRelay) {
      console.log(`[Clerk Webhook] [Apple relay detectado] Clerk ID ${clerkUserId} utiliza Apple Private Relay (${normalizedEmail}).`);
    }

    // 1. Intentar buscar por clerk_user_id existente
    const { data: profileByClerkId } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (profileByClerkId) {
      // Actualizar datos del perfil existente
      const { error: updateError } = await serviceClient
        .from('profiles')
        .update({
          username: sanitizedUsername,
          full_name: fullName,
          avatar_url: image_url || null,
          email: normalizedEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileByClerkId.id);

      if (updateError) {
        console.error(`[Clerk Webhook] Error al actualizar perfil existente: ${updateError.message}`);
        return new Response('Error al actualizar perfil', { status: 500 });
      }

      console.log(`[Clerk Webhook] [usuario actualizado] Perfil id ${profileByClerkId.id} actualizado exitosamente.`);
      return new Response('Perfil actualizado', { status: 200 });
    }

    // 2. Intentar buscar por email verificado (si no es Apple Private Relay)
    if (normalizedEmail && isVerified && !isAppleRelay) {
      const { data: profileByEmail } = await serviceClient
        .from('profiles')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (profileByEmail) {
        // Enlazar perfil antiguo
        const { error: linkError } = await serviceClient
          .from('profiles')
          .update({
            clerk_user_id: clerkUserId,
            full_name: fullName || profileByEmail.full_name,
            avatar_url: image_url || profileByEmail.avatar_url,
            username: sanitizedUsername || profileByEmail.username,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileByEmail.id);

        if (linkError) {
          console.error(`[Clerk Webhook] Error al vincular perfil antiguo por email: ${linkError.message}`);
          return new Response('Error al vincular perfil', { status: 500 });
        }

        console.log(`[Clerk Webhook] [usuario antiguo vinculado] Perfil antiguo id ${profileByEmail.id} vinculado a Clerk ID ${clerkUserId} por email.`);
        return new Response('Perfil vinculado por email', { status: 200 });
      }
    }

    // 3. Intentar buscar por username existente
    if (sanitizedUsername) {
      const { data: profileByUsername } = await serviceClient
        .from('profiles')
        .select('*')
        .eq('username', sanitizedUsername)
        .maybeSingle();

      if (profileByUsername) {
        // Enlazar perfil antiguo por username
        const { error: linkError } = await serviceClient
          .from('profiles')
          .update({
            clerk_user_id: clerkUserId,
            full_name: fullName || profileByUsername.full_name,
            avatar_url: image_url || profileByUsername.avatar_url,
            email: normalizedEmail || profileByUsername.email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileByUsername.id);

        if (linkError) {
          console.error(`[Clerk Webhook] Error al vincular perfil antiguo por username: ${linkError.message}`);
          return new Response('Error al vincular perfil', { status: 500 });
        }

        console.log(`[Clerk Webhook] [usuario antiguo vinculado] Perfil antiguo id ${profileByUsername.id} vinculado a Clerk ID ${clerkUserId} por username.`);
        return new Response('Perfil vinculado por username', { status: 200 });
      }
    }

    // 4. Si no se encontró ningún perfil coincidente, crear uno nuevo
    const { error: insertError } = await serviceClient
      .from('profiles')
      .insert({
        clerk_user_id: clerkUserId,
        username: sanitizedUsername,
        full_name: fullName,
        avatar_url: image_url || null,
        email: normalizedEmail,
        user_id: clerkUserId, // Mantener compatibilidad por si alguna consulta antigua aún usa user_id
      });

    if (insertError) {
      console.error(`[Clerk Webhook] Error al insertar nuevo perfil: ${insertError.message}`);
      return new Response('Error al crear perfil', { status: 500 });
    }

    console.log(`[Clerk Webhook] [usuario nuevo creado] Perfil creado para Clerk ID ${clerkUserId}.`);
    return new Response('Perfil nuevo creado', { status: 201 });
  }

  if (eventType === 'user.deleted') {
    const { id: clerkUserId } = evt.data;
    if (!clerkUserId) {
      return new Response('Falta ID de usuario', { status: 400 });
    }
    console.log(`[Clerk Webhook] Procesando baja para Clerk ID: ${clerkUserId}`);

    // No borramos físicamente el usuario para evitar cascada sobre predicciones/grupos históricos.
    // Solo desvinculamos el clerk_user_id para liberar el perfil.
    const { error: deleteError } = await serviceClient
      .from('profiles')
      .update({
        clerk_user_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', clerkUserId);

    if (deleteError) {
      console.error(`[Clerk Webhook] Error al desvincular Clerk ID en baja: ${deleteError.message}`);
      return new Response('Error al procesar baja', { status: 500 });
    }

    console.log(`[Clerk Webhook] [usuario desvinculado] Clerk ID ${clerkUserId} desvinculado con éxito del perfil.`);
    return new Response('Baja procesada', { status: 200 });
  }

  return new Response('Evento no manejado', { status: 200 });
}
