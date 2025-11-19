import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { conversationId, message } = await req.json();

    console.log('Auto-reply request:', { conversationId, message });

    // Buscar configurações de auto-reply para esta conversa
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*, connection:whatsapp_connections(*)')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversa não encontrada');
    }

    // Verificar se auto-reply está ativado (pode adicionar uma coluna na tabela)
    // Por enquanto, sempre responde

    // Buscar histórico recente da conversa
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: false })
      .limit(10);

    // Construir contexto para o Gemini
    const context = recentMessages
      ?.reverse()
      .map(m => `${m.is_from_me ? 'Você' : conversation.contact_name}: ${m.content}`)
      .join('\n') || '';

    // Chamar Gemini para gerar resposta
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `Você é um assistente de atendimento profissional. Com base no histórico da conversa abaixo, gere uma resposta adequada para a última mensagem do cliente.

Histórico:
${context}

Nova mensagem do cliente: ${message}

Responda de forma profissional, amigável e concisa. Não use emojis excessivamente.`;

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    });

    const geminiData = await geminiResponse.json();
    const aiReply = geminiData.candidates[0]?.content?.parts[0]?.text || 'Desculpe, não consegui processar sua mensagem.';

    console.log('AI reply generated:', aiReply);

    // Enviar mensagem via WhatsApp
    const { data: sendData, error: sendError } = await supabase.functions.invoke('whatsapp-send-message', {
      body: {
        conversationId,
        message: aiReply,
      },
    });

    if (sendError) {
      console.error('Error sending auto-reply:', sendError);
      throw sendError;
    }

    return new Response(
      JSON.stringify({ success: true, reply: aiReply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-auto-reply:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
