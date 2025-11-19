import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[test-evolution-api] Starting Evolution API test");
    
    const evolutionUrl = Deno.env.get("EVOLUTION_API_URL");
    const evolutionKey = Deno.env.get("EVOLUTION_API_KEY");
    
    // Check if credentials are configured
    if (!evolutionUrl || !evolutionKey) {
      console.error("[test-evolution-api] Missing credentials");
      return new Response(
        JSON.stringify({
          success: false,
          evolution_api: {
            configured: false,
            url: null,
            reachable: false,
          },
          message: "❌ Evolution API não configurada. Configure EVOLUTION_API_URL e EVOLUTION_API_KEY nos secrets do Supabase.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mask URL for security (show only domain)
    const maskedUrl = evolutionUrl.replace(/\/\/.*@/, '//***@');
    
    console.log(`[test-evolution-api] Testing connection to: ${maskedUrl}`);

    // Test connection
    const startTime = Date.now();
    let response;
    
    try {
      response = await fetch(`${evolutionUrl}/instance/fetchInstances`, {
        method: "GET",
        headers: {
          "apikey": evolutionKey,
        },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });
    } catch (error: any) {
      console.error("[test-evolution-api] Connection failed:", error.message);
      
      if (error.name === "TimeoutError") {
        return new Response(
          JSON.stringify({
            success: false,
            evolution_api: {
              configured: true,
              url: maskedUrl,
              reachable: false,
              error: "timeout",
            },
            message: "⏱️ Timeout ao conectar com Evolution API. Verifique se a URL está correta e se o servidor está online.",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          evolution_api: {
            configured: true,
            url: maskedUrl,
            reachable: false,
            error: error.message,
          },
          message: `❌ Erro ao conectar: ${error.message}. Verifique se a URL está correta.`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const responseTime = Date.now() - startTime;
    console.log(`[test-evolution-api] Response: ${response.status} (${responseTime}ms)`);

    // Handle different response codes
    if (response.status === 401) {
      return new Response(
        JSON.stringify({
          success: false,
          evolution_api: {
            configured: true,
            url: maskedUrl,
            reachable: true,
            response_time_ms: responseTime,
            status_code: 401,
          },
          message: "🔐 Erro de autenticação (401). A API Key está incorreta ou expirada.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (response.status === 404) {
      return new Response(
        JSON.stringify({
          success: false,
          evolution_api: {
            configured: true,
            url: maskedUrl,
            reachable: true,
            response_time_ms: responseTime,
            status_code: 404,
          },
          message: "🔍 Endpoint não encontrado (404). Verifique se a URL está completa (ex: https://api.evolution.com.br).",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          success: false,
          evolution_api: {
            configured: true,
            url: maskedUrl,
            reachable: true,
            response_time_ms: responseTime,
            status_code: response.status,
          },
          message: `❌ API retornou erro ${response.status}: ${errorText}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Success - parse response
    const data = await response.json();
    const instancesCount = Array.isArray(data) ? data.length : 0;

    console.log(`[test-evolution-api] Success! ${instancesCount} instances found`);

    return new Response(
      JSON.stringify({
        success: true,
        evolution_api: {
          configured: true,
          url: maskedUrl,
          reachable: true,
          response_time_ms: responseTime,
          status_code: 200,
          instances_count: instancesCount,
        },
        message: `✅ Evolution API está funcionando corretamente! Tempo de resposta: ${responseTime}ms. ${instancesCount} instâncias encontradas.`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("[test-evolution-api] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erro inesperado: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
