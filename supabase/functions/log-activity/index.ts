import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper para decodificar JWT customizado
function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Autenticar usando JWT customizado
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = decodeJWT(token);
    
    if (!decoded || !decoded.email) {
      throw new Error('Invalid token');
    }

    console.log('Authenticated user email:', decoded.email);

    // Usar service role para buscar usuário
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar user_id pela tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', decoded.email)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const userId = userData.id;

    const { action_type, description, metadata } = await req.json();

    console.log('Logging activity:', { action_type, description, user_id: userId });

    // Inserir log na tabela activity_logs
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action_type,
        description,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting log:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, log: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in log-activity:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
