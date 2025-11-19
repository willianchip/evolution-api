import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Decodificar JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userEmail = payload.email;

    // Buscar user_id
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { chatId, message } = await req.json();

    // Se chatId não existe, criar novo chat
    let currentChatId = chatId;
    if (!currentChatId) {
      const { data: newChat } = await supabase
        .from('ai_chats')
        .insert({ user_id: user.id, title: message.substring(0, 50) })
        .select()
        .single();
      
      currentChatId = newChat.id;
    }

    // Salvar mensagem do usuário
    await supabase
      .from('ai_messages')
      .insert({
        chat_id: currentChatId,
        role: 'user',
        content: message
      });

    // Buscar histórico de mensagens para contexto
    const { data: history } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('chat_id', currentChatId)
      .order('timestamp', { ascending: true });

    // Preparar contexto para Gemini
    const contents = history!.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Chamar Gemini API
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    const geminiData = await geminiResponse.json();
    
    if (!geminiResponse.ok) {
      console.error('Gemini error:', geminiData);
      throw new Error('Erro ao chamar Gemini API');
    }

    const aiMessage = geminiData.candidates[0].content.parts[0].text;

    // Salvar resposta da IA
    const { data: savedMessage } = await supabase
      .from('ai_messages')
      .insert({
        chat_id: currentChatId,
        role: 'assistant',
        content: aiMessage
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        chatId: currentChatId,
        message: savedMessage
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in gemini-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
