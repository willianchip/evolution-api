import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.log('User ID:', userId);

    const { instanceName, action } = await req.json();

    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    if (!evolutionApiUrl || !evolutionApiKey) {
      throw new Error('Evolution API credentials not configured');
    }

    console.log(`WhatsApp action: ${action} for instance: ${instanceName}`);

    // Create or get instance
    if (action === 'create') {
      const response = await fetch(`${evolutionApiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey,
        },
        body: JSON.stringify({
          instanceName: instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create instance: ${error}`);
      }

      const data = await response.json();
      console.log('Instance created:', data);

      // Save to database
      const { error: dbError } = await supabase
        .from('whatsapp_connections')
        .insert({
          user_id: userId,
          instance_name: instanceName,
          phone_number: null,
          qr_code: data.qrcode?.base64 || null,
          status: 'disconnected',
        });

      if (dbError) throw dbError;

      return new Response(
        JSON.stringify({ success: true, qrCode: data.qrcode?.base64, instance: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get QR Code
    if (action === 'qrcode') {
      const response = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': evolutionApiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get QR code');
      }

      const data = await response.json();
      
      // Update QR code in database
      await supabase
        .from('whatsapp_connections')
        .update({ qr_code: data.base64 })
        .eq('user_id', userId)
        .eq('instance_name', instanceName);

      return new Response(
        JSON.stringify({ success: true, qrCode: data.base64 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Disconnect instance
    if (action === 'disconnect') {
      const response = await fetch(`${evolutionApiUrl}/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': evolutionApiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect instance');
      }

      // Update status in database
      await supabase
        .from('whatsapp_connections')
        .update({ status: 'disconnected', qr_code: null })
        .eq('user_id', userId)
        .eq('instance_name', instanceName);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in whatsapp-connect:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
