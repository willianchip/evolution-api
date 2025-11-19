import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[health-check] Starting health check");
    
    const checks: any = {
      timestamp: new Date().toISOString(),
      services: {},
    };

    // Check Database
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      
      const { error } = await supabase.from("users").select("id").limit(1);
      
      checks.services.database = {
        status: error ? "unhealthy" : "healthy",
        error: error?.message,
      };
    } catch (error: any) {
      checks.services.database = {
        status: "unhealthy",
        error: error.message,
      };
    }

    // Check Evolution API
    try {
      const evolutionUrl = Deno.env.get("EVOLUTION_API_URL");
      const evolutionKey = Deno.env.get("EVOLUTION_API_KEY");
      
      if (!evolutionUrl || !evolutionKey) {
        throw new Error("Evolution API credentials not configured");
      }

      // Mask URL for security
      const maskedUrl = evolutionUrl.replace(/\/\/.*@/, '//***@');
      const startTime = Date.now();

      const response = await fetch(`${evolutionUrl}/instance/fetchInstances`, {
        headers: {
          "apikey": evolutionKey,
        },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      const responseTime = Date.now() - startTime;
      let instancesData = null;

      if (response.ok) {
        try {
          instancesData = await response.json();
        } catch (e) {
          console.error("Failed to parse Evolution API response:", e);
        }
      }

      checks.services.evolution_api = {
        status: response.ok ? "healthy" : "unhealthy",
        statusCode: response.status,
        url: maskedUrl,
        response_time_ms: responseTime,
        instances_count: Array.isArray(instancesData) ? instancesData.length : 0,
        last_checked: new Date().toISOString(),
      };
    } catch (error: any) {
      checks.services.evolution_api = {
        status: "unhealthy",
        error: error.message,
      };
    }

    // Check Resend
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      
      if (!resendKey) {
        throw new Error("Resend API key not configured");
      }

      checks.services.resend = {
        status: "configured",
        note: "API key is set",
      };
    } catch (error: any) {
      checks.services.resend = {
        status: "unhealthy",
        error: error.message,
      };
    }

    // Check Gemini API
    try {
      const geminiKey = Deno.env.get("GEMINI_API_KEY");
      
      if (!geminiKey) {
        throw new Error("Gemini API key not configured");
      }

      checks.services.gemini = {
        status: "configured",
        note: "API key is set",
      };
    } catch (error: any) {
      checks.services.gemini = {
        status: "unhealthy",
        error: error.message,
      };
    }

    // Check CRON Jobs (last 10 minutes)
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from("cron_execution_logs")
        .select("*")
        .gte("execution_started_at", tenMinutesAgo)
        .order("execution_started_at", { ascending: false })
        .limit(1);

      checks.services.cron_jobs = {
        status: data && data.length > 0 ? "healthy" : "warning",
        lastExecution: data?.[0]?.execution_started_at,
        note: data && data.length > 0 ? "Running" : "No executions in last 10 minutes",
      };
    } catch (error: any) {
      checks.services.cron_jobs = {
        status: "unhealthy",
        error: error.message,
      };
    }

    // Overall status
    const allHealthy = Object.values(checks.services).every(
      (service: any) => service.status === "healthy" || service.status === "configured"
    );

    checks.overall = allHealthy ? "healthy" : "degraded";

    console.log("[health-check] Health check completed:", checks);

    return new Response(
      JSON.stringify(checks),
      {
        status: allHealthy ? 200 : 503,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[health-check] Error:", error);
    
    return new Response(
      JSON.stringify({
        overall: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
