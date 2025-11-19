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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { email, password } = await req.json();

    const userEmail = email || 'teste@exemplo.com';
    const userPassword = password || 'teste123';

    console.log(`Creating test user: ${userEmail}`);

    // Verificar se usuário já existe no Supabase Auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === userEmail);

    if (existingUser) {
      if (!existingUser.email_confirmed_at) {
        await supabase.auth.admin.updateUserById(existingUser.id, {
          email_confirm: true
        });

        return new Response(
          JSON.stringify({
            message: 'Usuário já existia, email marcado como verificado',
            user: { 
              email: userEmail,
              password: userPassword,
              note: 'Use estas credenciais para fazer login'
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          message: 'Usuário já existe e está verificado',
          user: { 
            email: userEmail,
            password: userPassword,
            note: 'Use estas credenciais para fazer login'
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar usuário usando Supabase Auth Admin
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        device_fingerprint: 'test-device',
      }
    });

    if (authError) {
      console.error('Error creating test user:', authError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar usuário de teste', details: authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Test user created successfully: ${userEmail}`);

    return new Response(
      JSON.stringify({
        message: 'Usuário de teste criado com sucesso!',
        user: {
          email: userEmail,
          password: userPassword,
          note: 'Use estas credenciais para fazer login'
        }
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-test-user:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
