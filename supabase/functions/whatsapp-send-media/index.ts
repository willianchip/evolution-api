import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to decode JWT
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

    // Get user_id from email
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

    const { instanceName, number, mediaUrl, mediaType, caption } = await req.json();

    if (!instanceName || !number || !mediaUrl) {
      return new Response(
        JSON.stringify({ error: 'Dados incompletos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send media via Evolution API
    const evolutionUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionKey = Deno.env.get('EVOLUTION_API_KEY');

    let endpoint = '';
    if (mediaType === 'image') {
      endpoint = '/message/sendMedia';
    } else if (mediaType === 'audio') {
      endpoint = '/message/sendWhatsAppAudio';
    } else if (mediaType === 'document') {
      endpoint = '/message/sendMedia';
    }

    const response = await fetch(`${evolutionUrl}${endpoint}/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionKey!,
      },
      body: JSON.stringify({
        number: number.replace(/\D/g, ''),
        mediatype: mediaType,
        media: mediaUrl,
        caption: caption || '',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Evolution API error:', errorData);
      throw new Error('Erro ao enviar mídia pelo WhatsApp');
    }

    const result = await response.json();

    // Find or create conversation
    const { data: connection } = await supabase
      .from('whatsapp_connections')
      .select('id')
      .eq('instance_name', instanceName)
      .eq('user_id', user.id)
      .single();

    if (connection) {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('connection_id', connection.id)
        .eq('contact_number', number)
        .single();

      let conversationId = conversation?.id;

      if (!conversationId) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            connection_id: connection.id,
            contact_number: number,
            contact_name: number,
          })
          .select()
          .single();
        
        conversationId = newConv?.id;
      }

      // Save message to database
      if (conversationId) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            content: caption || `[${mediaType}]`,
            direction: 'outgoing',
            media_url: mediaUrl,
            media_type: mediaType,
          });
      }
    }

    console.log(`[MEDIA SENT] Instance: ${instanceName}, To: ${number}, Type: ${mediaType}`);

    return new Response(
      JSON.stringify({ success: true, messageId: result.key?.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-send-media:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});