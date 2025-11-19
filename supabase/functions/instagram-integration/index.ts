import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const instagramSecret = Deno.env.get('INSTAGRAM_APP_SECRET')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    
    // Webhook do Instagram (GET para verificação)
    if (req.method === 'GET' && url.pathname.includes('/webhook')) {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === instagramSecret) {
        console.log('Instagram webhook verified');
        return new Response(challenge, { status: 200 });
      }

      return new Response('Forbidden', { status: 403 });
    }

    // Webhook do Instagram (POST para mensagens)
    if (req.method === 'POST' && url.pathname.includes('/webhook')) {
      const body = await req.json();
      console.log('Instagram webhook received:', body);

      if (body.entry) {
        for (const entry of body.entry) {
          if (entry.messaging) {
            for (const event of entry.messaging) {
              if (event.message) {
                const senderId = event.sender.id;
                const recipientId = event.recipient.id;
                const messageText = event.message.text || '';
                const messageId = event.message.mid;

                // Buscar conexão do Instagram
                const { data: connections } = await supabase
                  .from('platform_connections')
                  .select('*')
                  .eq('platform_type', 'instagram')
                  .eq('is_active', true)
                  .limit(1);

                if (connections && connections.length > 0) {
                  const connection = connections[0];

                  // Salvar mensagem
                  await supabase
                    .from('platform_messages')
                    .insert({
                      connection_id: connection.id,
                      platform_type: 'instagram',
                      platform_message_id: messageId,
                      sender_id: senderId,
                      sender_name: 'Instagram User',
                      recipient_id: recipientId,
                      content: messageText,
                      message_type: 'text',
                      is_from_me: false,
                      timestamp: new Date(event.timestamp).toISOString(),
                      status: 'received'
                    });

                  console.log('Instagram message saved');
                }
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Enviar mensagem
    if (req.method === 'POST' && url.pathname.includes('/send')) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) throw new Error('No authorization header');

      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      if (authError || !user) throw new Error('Unauthorized');

      const { recipient_id, message, access_token, connection_id } = await req.json();

      // Enviar via Instagram Graph API
      const response = await fetch(`https://graph.instagram.com/v21.0/me/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
          recipient: { id: recipient_id },
          message: { text: message }
        })
      });

      const result = await response.json();

      if (result.message_id) {
        // Salvar mensagem enviada
        await supabase
          .from('platform_messages')
          .insert({
            connection_id,
            platform_type: 'instagram',
            platform_message_id: result.message_id,
            sender_id: user.id,
            sender_name: 'Me',
            recipient_id,
            content: message,
            message_type: 'text',
            is_from_me: true,
            timestamp: new Date().toISOString(),
            status: 'sent'
          });

        console.log('Instagram message sent:', result);

        return new Response(
          JSON.stringify({ success: true, message_id: result.message_id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error(result.error?.message || 'Failed to send message');
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Instagram integration error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
