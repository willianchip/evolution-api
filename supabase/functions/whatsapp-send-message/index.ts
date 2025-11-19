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

    const { instanceName, number, message } = await req.json();

    if (!instanceName || !number || !message) {
      throw new Error('Missing required fields: instanceName, number, message');
    }

    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    if (!evolutionApiUrl || !evolutionApiKey) {
      throw new Error('Evolution API credentials not configured');
    }

    console.log(`Sending message to ${number} via ${instanceName}`);

    // Send message via Evolution API
    const response = await fetch(`${evolutionApiUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        number: number,
        text: message,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send message: ${error}`);
    }

    const data = await response.json();
    console.log('Message sent:', data);

    // Get connection ID
    const { data: connection } = await supabase
      .from('whatsapp_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('instance_name', instanceName)
      .single();

    if (!connection) {
      throw new Error('Connection not found');
    }

    // Get or create conversation
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('connection_id', connection.id)
      .eq('contact_number', number)
      .maybeSingle();

    let conversationId: string;

    if (!existingConv) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          connection_id: connection.id,
          contact_number: number,
          contact_name: number,
        })
        .select('id')
        .single();

      if (convError) throw convError;
      conversationId = newConv.id;
    } else {
      conversationId = existingConv.id;
    }

    // Save message to database
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content: message,
        is_from_me: true,
        message_type: 'text',
      });

    if (msgError) throw msgError;

    return new Response(
      JSON.stringify({ success: true, messageId: data.key?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-send-message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
