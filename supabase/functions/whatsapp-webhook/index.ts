import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const webhookData = await req.json();
    console.log('Received webhook:', JSON.stringify(webhookData, null, 2));

    const { event, instance, data } = webhookData;

    // Get connection by instance name
    const { data: connection } = await supabaseClient
      .from('whatsapp_connections')
      .select('id, user_id')
      .eq('instance_name', instance)
      .maybeSingle();

    if (!connection) {
      console.log(`Connection not found for instance: ${instance}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Connection not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle connection status
    if (event === 'connection.update') {
      const status = data.state === 'open' ? 'connected' : 'disconnected';
      
      await supabaseClient
        .from('whatsapp_connections')
        .update({ 
          status,
          phone_number: data.phone_number || null,
          qr_code: status === 'connected' ? null : undefined,
        })
        .eq('id', connection.id);

      console.log(`Connection ${instance} status updated to: ${status}`);
    }

    // Handle QR code update
    if (event === 'qrcode.updated') {
      await supabaseClient
        .from('whatsapp_connections')
        .update({ qr_code: data.qrcode })
        .eq('id', connection.id);

      console.log(`QR code updated for instance: ${instance}`);
    }

    // Handle incoming messages
    if (event === 'messages.upsert' && data.messages) {
      for (const message of data.messages) {
        if (message.key.fromMe) continue; // Skip messages sent by us

        const contactNumber = message.key.remoteJid.replace('@s.whatsapp.net', '');
        
        // Get or create conversation
        const { data: existingConv } = await supabaseClient
          .from('conversations')
          .select('id')
          .eq('connection_id', connection.id)
          .eq('contact_number', contactNumber)
          .maybeSingle();

        let conversationId: string;

        if (!existingConv) {
          const { data: newConv, error: convError } = await supabaseClient
            .from('conversations')
            .insert({
              connection_id: connection.id,
              contact_number: contactNumber,
              contact_name: message.pushName || contactNumber,
              last_message_at: new Date().toISOString(),
              unread_count: 1,
            })
            .select('id')
            .single();

          if (convError) throw convError;
          conversationId = newConv.id;
        } else {
          conversationId = existingConv.id;
          // Update conversation
          await supabaseClient
            .from('conversations')
            .update({
              last_message_at: new Date().toISOString(),
              unread_count: supabaseClient.rpc('increment', { x: 1 }),
            })
            .eq('id', conversationId);
        }

        // Save message
        const messageContent = message.message?.conversation || 
                              message.message?.extendedTextMessage?.text || 
                              '[Media]';

        await supabaseClient
          .from('messages')
          .insert({
            conversation_id: conversationId,
            content: messageContent,
            is_from_me: false,
            message_type: message.message?.conversation ? 'text' : 'media',
            media_url: message.message?.imageMessage?.url || null,
          });

        console.log(`Message saved from ${contactNumber}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});