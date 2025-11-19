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
    const { message } = await req.json();

    console.log('Classifying message:', message);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `Classifique a seguinte mensagem em UMA das categorias: SUPORTE, VENDAS, SPAM, FEEDBACK, URGENTE, GERAL.

Mensagem: "${message}"

Responda APENAS com a categoria em maiúsculas, sem explicações.`;

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 10,
        },
      }),
    });

    const geminiData = await geminiResponse.json();
    const classification = geminiData.candidates[0]?.content?.parts[0]?.text?.trim().toUpperCase() || 'GERAL';

    // Extrair sentimento também
    const sentimentPrompt = `Analise o sentimento da mensagem: "${message}"\n\nResponda apenas: POSITIVO, NEGATIVO ou NEUTRO`;

    const sentimentResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: sentimentPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 10,
        },
      }),
    });

    const sentimentData = await sentimentResponse.json();
    const sentiment = sentimentData.candidates[0]?.content?.parts[0]?.text?.trim().toUpperCase() || 'NEUTRO';

    console.log('Classification result:', { classification, sentiment });

    return new Response(
      JSON.stringify({ 
        category: classification,
        sentiment: sentiment,
        confidence: 0.85
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in message-classifier:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
