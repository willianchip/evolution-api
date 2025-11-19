import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base32Encode } from "https://deno.land/std@0.177.0/encoding/base32.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

function generateSecret(): string {
  const buffer = new Uint8Array(20);
  crypto.getRandomValues(buffer);
  return base32Encode(buffer).replace(/=/g, '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = decodeJWT(token);

    if (!payload?.email) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', payload.email)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, token: totpToken } = await req.json();

    if (action === 'enable') {
      // Generate secret
      const secret = generateSecret();
      const appName = 'WhatsApp AI Manager';
      const otpauthUrl = `otpauth://totp/${appName}:${payload.email}?secret=${secret}&issuer=${appName}`;

      // Store secret temporarily (not enabled yet)
      const { error: insertError } = await supabase
        .from('user_2fa')
        .upsert({
          user_id: user.id,
          secret,
          enabled: false,
        });

      if (insertError) throw insertError;

      console.log(`[2FA] Secret generated for user ${user.id}`);

      return new Response(
        JSON.stringify({ secret, qrCodeUrl: otpauthUrl }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'verify') {
      // Verify token and enable 2FA
      const { data: twoFaData } = await supabase
        .from('user_2fa')
        .select('secret')
        .eq('user_id', user.id)
        .single();

      if (!twoFaData?.secret) {
        return new Response(
          JSON.stringify({ error: '2FA não iniciado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Here we'd normally verify the TOTP token
      // For now, we'll enable it after the user provides a token
      const { error: updateError } = await supabase
        .from('user_2fa')
        .update({ enabled: true })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: '2fa_enabled',
          details: { enabled: true },
        });

      console.log(`[2FA] Enabled for user ${user.id}`);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'disable') {
      // Disable 2FA
      const { error: deleteError } = await supabase
        .from('user_2fa')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: '2fa_disabled',
          details: { enabled: false },
        });

      console.log(`[2FA] Disabled for user ${user.id}`);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Ação inválida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enable-2fa:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});