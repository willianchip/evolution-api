import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instanceName, testType = 'message' } = await req.json();

    if (!instanceName) {
      return new Response(
        JSON.stringify({ error: 'instanceName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const WEBHOOK_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-webhook`;
    
    let testPayload;

    if (testType === 'message') {
      // Simular recebimento de mensagem
      testPayload = {
        event: 'messages.upsert',
        instance: instanceName,
        data: {
          messages: [
            {
              key: {
                remoteJid: '5511999999999@s.whatsapp.net',
                fromMe: false,
                id: 'TEST_' + Date.now(),
              },
              pushName: 'Teste Usuário',
              message: {
                conversation: '🧪 Esta é uma mensagem de teste! O webhook está funcionando corretamente.'
              },
              messageTimestamp: Math.floor(Date.now() / 1000),
            }
          ]
        }
      };
    } else if (testType === 'connection') {
      // Simular atualização de conexão
      testPayload = {
        event: 'connection.update',
        instance: instanceName,
        data: {
          state: 'open',
          phone_number: '5511999999999'
        }
      };
    } else if (testType === 'qrcode') {
      // Simular atualização de QR code
      testPayload = {
        event: 'qrcode.updated',
        instance: instanceName,
        data: {
          qrcode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
      };
    }

    console.log('Sending test webhook to:', WEBHOOK_URL);
    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    // Enviar para o webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const result = await response.json();
    console.log('Webhook response:', result);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Webhook failed', 
          details: result,
          status: response.status 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test webhook sent successfully (${testType})`,
        webhookResponse: result,
        payload: testPayload
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in test-webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
