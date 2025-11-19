import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduledMessage {
  id: string;
  user_id: string;
  instance_name: string;
  phone_number: string;
  message: string;
  media_url?: string;
  scheduled_for: string;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly';
  retry_count?: number;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[process-scheduled-messages] Starting CRON execution");
    
    const executionStartTime = Date.now();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create execution log
    const { data: logData, error: logError } = await supabase
      .from("cron_execution_logs")
      .insert({
        execution_started_at: new Date().toISOString(),
        status: 'running'
      })
      .select()
      .single();

    const logId = logData?.id;

    // Fetch messages that need to be sent
    const { data: messages, error: fetchError } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(50);

    if (fetchError) {
      console.error("[process-scheduled-messages] Error fetching messages:", fetchError);
      throw fetchError;
    }

    console.log(`[process-scheduled-messages] Found ${messages?.length || 0} messages to process`);

    let processed = 0;
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    if (messages && messages.length > 0) {
      for (const msg of messages as ScheduledMessage[]) {
        processed++;
        
        try {
          console.log(`[process-scheduled-messages] Processing message ${msg.id}`);
          
          // Send via Evolution API
          const evolutionUrl = Deno.env.get("EVOLUTION_API_URL");
          const evolutionKey = Deno.env.get("EVOLUTION_API_KEY");
          
          const payload: any = {
            number: msg.phone_number,
            text: msg.message,
          };

          if (msg.media_url) {
            payload.mediaUrl = msg.media_url;
          }

          const response = await fetch(
            `${evolutionUrl}/message/sendText/${msg.instance_name}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": evolutionKey || "",
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            throw new Error(`Evolution API error: ${response.statusText}`);
          }

          sent++;
          console.log(`[process-scheduled-messages] Message ${msg.id} sent successfully`);

          // Calculate next run if recurrent
          let nextRun: string | null = null;
          if (msg.recurrence_type && msg.recurrence_type !== 'none') {
            const lastSent = new Date();
            switch (msg.recurrence_type) {
              case 'daily':
                nextRun = new Date(lastSent.getTime() + 24 * 60 * 60 * 1000).toISOString();
                break;
              case 'weekly':
                nextRun = new Date(lastSent.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
                break;
              case 'monthly':
                nextRun = new Date(lastSent.setMonth(lastSent.getMonth() + 1)).toISOString();
                break;
            }
          }

          // Update message status
          await supabase
            .from("scheduled_messages")
            .update({
              status: nextRun ? 'pending' : 'sent',
              last_sent_at: new Date().toISOString(),
              scheduled_for: nextRun,
              retry_count: 0,
              error_message: null,
            })
            .eq("id", msg.id);

          // Insert into message history
          await supabase
            .from("message_history")
            .insert({
              scheduled_message_id: msg.id,
              status: 'success',
              sent_at: new Date().toISOString(),
            });

        } catch (error: any) {
          failed++;
          const errorMsg = `Message ${msg.id}: ${error.message}`;
          errors.push(errorMsg);
          console.error(`[process-scheduled-messages] ${errorMsg}`);

          // Handle retry logic
          const retryCount = (msg.retry_count || 0) + 1;
          const maxRetries = 3;

          if (retryCount < maxRetries) {
            // Schedule retry in 5 minutes
            const retryAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            
            await supabase
              .from("scheduled_messages")
              .update({
                retry_count: retryCount,
                scheduled_for: retryAt,
                error_message: error.message,
              })
              .eq("id", msg.id);

            console.log(`[process-scheduled-messages] Scheduled retry ${retryCount}/${maxRetries} for message ${msg.id}`);
          } else {
            // Mark as failed after max retries
            await supabase
              .from("scheduled_messages")
              .update({
                status: 'failed',
                error_message: `Failed after ${maxRetries} retries: ${error.message}`,
              })
              .eq("id", msg.id);

            // Insert into message history
            await supabase
              .from("message_history")
              .insert({
                scheduled_message_id: msg.id,
                status: 'failed',
                sent_at: new Date().toISOString(),
                error_message: error.message,
              });

            console.log(`[process-scheduled-messages] Message ${msg.id} failed after ${maxRetries} retries`);
          }
        }
      }
    }

    const executionTime = Date.now() - executionStartTime;

    // Update execution log
    if (logId) {
      await supabase
        .from("cron_execution_logs")
        .update({
          execution_finished_at: new Date().toISOString(),
          messages_processed: processed,
          messages_sent: sent,
          messages_failed: failed,
          errors: errors.length > 0 ? errors : null,
          duration_ms: executionTime,
          status: 'completed'
        })
        .eq("id", logId);
    }

    console.log(`[process-scheduled-messages] Execution completed in ${executionTime}ms`);
    console.log(`[process-scheduled-messages] Stats: ${processed} processed, ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          processed,
          sent,
          failed,
          duration_ms: executionTime,
        },
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[process-scheduled-messages] Fatal error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
