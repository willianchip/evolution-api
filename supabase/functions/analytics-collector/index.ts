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
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const {
      chat_id,
      model_used,
      prompt_length,
      response_length,
      response_time_ms,
      tokens_used,
      category,
      sentiment_score,
      sentiment_label,
      confidence_score,
      user_satisfaction,
      metadata
    } = await req.json();

    const { data, error } = await supabase
      .from('ai_performance_metrics')
      .insert({
        user_id: user.id,
        chat_id,
        model_used: model_used || 'google/gemini-2.5-flash',
        prompt_length,
        response_length,
        response_time_ms,
        tokens_used,
        category,
        sentiment_score,
        sentiment_label,
        confidence_score,
        user_satisfaction,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Analytics collected:', data);

    return new Response(
      JSON.stringify({ success: true, metric: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Analytics collector error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
