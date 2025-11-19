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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Decodificar JWT para pegar o email do usuário
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userEmail = payload.email;

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Buscar user_id pelo email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Buscar estatísticas da view
    const { data: stats, error: statsError } = await supabase
      .from('user_dashboard_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (statsError) {
      console.error('Error fetching stats:', statsError);
      // Se não houver dados, retornar estatísticas zeradas
      const emptyStats = {
        total_connections: 0,
        active_connections: 0,
        total_conversations: 0,
        total_unread_messages: 0,
        total_messages: 0,
        messages_today: 0,
        messages_this_week: 0,
        total_ai_chats: 0,
        total_ai_messages: 0
      };

      return new Response(
        JSON.stringify({
          stats: emptyStats,
          recentActivity: []
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Buscar atividades recentes (últimas 10)
    const { data: recentMessages } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        timestamp,
        conversation:conversations (
          contact_name,
          contact_number
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(10);

    // Buscar tendência de mensagens (últimos 7 dias)
    const { data: messageTrend } = await supabase
      .from('messages')
      .select('timestamp')
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true });

    // Agrupar mensagens por dia
    const trendData: Record<string, number> = {};
    messageTrend?.forEach((msg) => {
      const date = new Date(msg.timestamp).toISOString().split('T')[0];
      trendData[date] = (trendData[date] || 0) + 1;
    });

    const messagesByDay = Object.entries(trendData).map(([date, count]) => ({
      date,
      count
    }));

    // Buscar distribuição de conversas por status (read/unread)
    const { data: conversations } = await supabase
      .from('conversations')
      .select('unread_count');

    const statusDistribution = [
      { 
        status: 'Lidas', 
        count: conversations?.filter(c => c.unread_count === 0).length || 0 
      },
      { 
        status: 'Não Lidas', 
        count: conversations?.filter(c => c.unread_count > 0).length || 0 
      }
    ];

    return new Response(
      JSON.stringify({
        stats: stats || {
          total_connections: 0,
          active_connections: 0,
          total_conversations: 0,
          total_unread_messages: 0,
          total_messages: 0,
          messages_today: 0,
          messages_this_week: 0,
          total_ai_chats: 0,
          total_ai_messages: 0
        },
        recentActivity: recentMessages || [],
        messagesByDay,
        statusDistribution
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in dashboard-stats:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
