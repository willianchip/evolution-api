import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { verifyTOTP } from '../_shared/totp.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, code, isBackupCode } = await req.json();

    if (!userId || !code) {
      throw new Error('userId e código são obrigatórios');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[2FA Login] Verifying code for user ${userId}`);

    // Get user's 2FA settings
    const { data: twoFaData, error: twoFaError } = await supabase
      .from('user_2fa')
      .select('secret, enabled')
      .eq('user_id', userId)
      .single();

    if (twoFaError || !twoFaData || !twoFaData.enabled) {
      throw new Error('2FA não está ativo para este usuário');
    }

    // Get user email for TOTP
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error('Usuário não encontrado');
    }

    if (isBackupCode) {
      // Validate backup code
      const codeHash = await hashCode(code);

      const { data: backupCode, error: backupError } = await supabase
        .from('user_2fa_backup_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('code_hash', codeHash)
        .eq('used', false)
        .single();

      if (backupError || !backupCode) {
        console.log('[2FA Login] Invalid or used backup code');
        throw new Error('Código de backup inválido ou já utilizado');
      }

      // Mark backup code as used
      const { error: updateError } = await supabase
        .from('user_2fa_backup_codes')
        .update({ 
          used: true, 
          used_at: new Date().toISOString() 
        })
        .eq('id', backupCode.id);

      if (updateError) {
        console.error('[2FA Login] Error marking backup code as used:', updateError);
      }

      console.log(`[2FA Login] Backup code validated for user ${userId}`);

      return new Response(
        JSON.stringify({ success: true, method: 'backup_code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Validate TOTP code
      const isValid = await verifyTOTP(twoFaData.secret, code, 1);

      if (!isValid) {
        console.log('[2FA Login] Invalid TOTP code');
        throw new Error('Código 2FA inválido ou expirado');
      }

      console.log(`[2FA Login] TOTP validated for user ${userId}`);

      return new Response(
        JSON.stringify({ success: true, method: 'totp' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('[2FA Login] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
