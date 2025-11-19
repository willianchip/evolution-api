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
    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    
    // Webhook do Telegram
    if (req.method === 'POST' && url.pathname.includes('/webhook')) {
      const update = await req.json();
      console.log('Telegram webhook received:', update);

      if (update.message) {
        const message = update.message;
        const chatId = message.chat.id.toString();
        const senderId = message.from.id.toString();
        const senderName = message.from.first_name + (message.from.last_name ? ` ${message.from.last_name}` : '');
        const content = message.text || '';
        const messageType = message.photo ? 'image' : message.video ? 'video' : 'text';

        // Buscar conexão do Telegram
        const { data: connections } = await supabase
          .from('platform_connections')
          .select('*')
          .eq('platform_type', 'telegram')
          .eq('is_active', true)
          .limit(1);

        if (connections && connections.length > 0) {
          const connection = connections[0];

          // Salvar mensagem
          await supabase
            .from('platform_messages')
            .insert({
              connection_id: connection.id,
              platform_type: 'telegram',
              platform_message_id: message.message_id.toString(),
              sender_id: senderId,
              sender_name: senderName,
              recipient_id: chatId,
              content,
              message_type: messageType,
              is_from_me: false,
              timestamp: new Date(message.date * 1000).toISOString(),
              status: 'received'
            });

          console.log('Telegram message saved');
        }
      }

      return new Response(JSON.stringify({ ok: true }), {
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

      const { chat_id, message, connection_id } = await req.json();

      // Enviar via Telegram API
      const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const result = await response.json();

      if (result.ok) {
        // Salvar mensagem enviada
        await supabase
          .from('platform_messages')
          .insert({
            connection_id,
            platform_type: 'telegram',
            platform_message_id: result.result.message_id.toString(),
            sender_id: user.id,
            sender_name: 'Bot',
            recipient_id: chat_id,
            content: message,
            message_type: 'text',
            is_from_me: true,
            timestamp: new Date().toISOString(),
            status: 'sent'
          });

        console.log('Telegram message sent:', result.result);

        return new Response(
          JSON.stringify({ success: true, message: result.result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error(result.description || 'Failed to send message');
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Telegram integration error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
