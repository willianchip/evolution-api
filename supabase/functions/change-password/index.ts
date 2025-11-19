import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-512'
    },
    keyMaterial,
    512
  );
  
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = decodeJWT(token);
    
    if (!decoded || !decoded.email) {
      throw new Error('Invalid token');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, password_hash, password_salt')
      .eq('email', decoded.email)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const userId = userData.id;

    // Rate limiting
    if (!checkRateLimit(userId, 5, 60000)) {
      console.warn(`Rate limit exceeded for user ${userId}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    // Verificar senha atual
    const currentHash = await hashPassword(currentPassword, userData.password_salt);
    if (currentHash !== userData.password_hash) {
      // Log tentativa falha
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action_type: 'PASSWORD_CHANGE_FAILED',
        description: 'Tentativa de alteração de senha com senha incorreta',
        metadata: { ip: req.headers.get('x-forwarded-for') || 'unknown' }
      });

      throw new Error('Current password is incorrect');
    }

    // Atualizar senha
    const newSalt = crypto.randomUUID();
    const newHash = await hashPassword(newPassword, newSalt);

    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: newHash, 
        password_salt: newSalt,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // Log sucesso
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action_type: 'PASSWORD_CHANGED',
      description: 'Senha alterada com sucesso',
      metadata: { ip: req.headers.get('x-forwarded-for') || 'unknown' }
    });

    console.log(`Password changed successfully for user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Password changed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in change-password:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
