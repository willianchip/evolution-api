import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.bounced' | 'email.complained' | 'email.delivery_delayed' | 'email.opened' | 'email.clicked';
  created_at: string;
  data: {
    created_at: string;
    email_id: string;
    from: string;
    to: string[];
    subject: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[resend-webhook] Received webhook request");

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const event: ResendWebhookEvent = await req.json();
    console.log("[resend-webhook] Event type:", event.type);
    console.log("[resend-webhook] Email ID:", event.data.email_id);

    // Map Resend event types to our status
    let status = 'sent';
    if (event.type === 'email.delivered') {
      status = 'delivered';
    } else if (event.type === 'email.bounced') {
      status = 'bounced';
    } else if (event.type === 'email.complained') {
      status = 'complained';
    } else if (event.type === 'email.delivery_delayed') {
      status = 'delayed';
    }

    // Update email_logs table with the delivery status
    const { data: existingLog, error: fetchError } = await supabase
      .from('email_logs')
      .select('*')
      .eq('resend_message_id', event.data.email_id)
      .single();

    if (fetchError) {
      console.error("[resend-webhook] Error fetching email log:", fetchError);
      
      // If the log doesn't exist yet, it might be a race condition
      // Return success to avoid Resend retrying
      if (fetchError.code === 'PGRST116') {
        console.log("[resend-webhook] Email log not found, might be created soon");
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Email log not found yet, will be updated later" 
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      throw fetchError;
    }

    console.log("[resend-webhook] Found existing log:", existingLog.id);

    // Update the status
    const { error: updateError } = await supabase
      .from('email_logs')
      .update({ 
        status,
        metadata: {
          ...existingLog.metadata,
          webhook_event: event.type,
          webhook_received_at: new Date().toISOString(),
          event_created_at: event.created_at
        }
      })
      .eq('resend_message_id', event.data.email_id);

    if (updateError) {
      console.error("[resend-webhook] Error updating email log:", updateError);
      throw updateError;
    }

    console.log("[resend-webhook] Successfully updated email status to:", status);

    // Log to system_logs for monitoring
    await supabase.from('system_logs').insert({
      log_level: 'info',
      category: 'email',
      message: `Email ${status}: ${event.data.email_id}`,
      metadata: {
        event_type: event.type,
        email_to: event.data.to,
        email_from: event.data.from,
        subject: event.data.subject
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email status updated to ${status}` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[resend-webhook] Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
