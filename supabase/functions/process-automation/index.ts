import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

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

    if (!conversationId || !message) {
      throw new Error('conversationId and message are required');
    }

    // Rate limiting por conversa
    if (!checkRateLimit(conversationId, 30, 60000)) {
      console.warn(`Rate limit exceeded for conversation ${conversationId}`);
      return new Response(
        JSON.stringify({ error: 'Too many automation triggers' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar conversa
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*, connection:whatsapp_connections(user_id, instance_name)')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversation not found');
    }

    const userId = conversation.connection.user_id;

    // Buscar automações ativas do usuário
    const { data: automations, error: autoError } = await supabase
      .from('automations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (autoError) throw autoError;

    if (!automations || automations.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active automations found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar cada automação
    for (const automation of automations) {
      let triggered = false;

      // Verificar trigger
      if (automation.trigger_type === 'keyword') {
        const keywords = automation.conditions?.keywords || [];
        const messageLower = message.toLowerCase();
        triggered = keywords.some((keyword: string) => 
          messageLower.includes(keyword.toLowerCase())
        );
      } else if (automation.trigger_type === 'new_contact') {
        // Verificar se é primeira mensagem
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversationId);
        triggered = count === 1;
      }

      if (triggered) {
        console.log(`Automation ${automation.id} triggered for conversation ${conversationId}`);

        // Executar ação
        if (automation.actions.type === 'reply') {
          // Enviar mensagem fixa
          await supabase.functions.invoke('whatsapp-send-message', {
            body: {
              instanceName: conversation.connection.instance_name,
              number: conversation.contact_number,
              message: automation.actions.message,
            }
          });

          // Log
          await supabase.from('activity_logs').insert({
            user_id: userId,
            action_type: 'AUTOMATION_TRIGGERED',
            description: `Automação "${automation.name}" disparada`,
            metadata: { 
              automation_id: automation.id, 
              conversation_id: conversationId,
              action: 'reply'
            }
          });

        } else if (automation.actions.type === 'ai_reply') {
          // Responder com IA
          await supabase.functions.invoke('ai-auto-reply', {
            body: {
              conversationId,
              message,
              tone: automation.actions.ai_tone || 'friendly'
            }
          });

          // Log
          await supabase.from('activity_logs').insert({
            user_id: userId,
            action_type: 'AUTOMATION_TRIGGERED',
            description: `Automação IA "${automation.name}" disparada`,
            metadata: { 
              automation_id: automation.id, 
              conversation_id: conversationId,
              action: 'ai_reply'
            }
          });
        }

        // Parar após primeira automação disparada
        break;
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Automations processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-automation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
