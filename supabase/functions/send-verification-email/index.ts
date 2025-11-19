import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { verificationEmailTemplate } from "../_shared/email-templates.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[send-verification-email] Starting request");
    
    const { email, token }: VerificationEmailRequest = await req.json();

    if (!email || !token) {
      console.error("[send-verification-email] Email and token are required");
      return new Response(
        JSON.stringify({ error: "Email and token are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const verificationUrl = `${Deno.env.get('APP_URL')}/verify-email?token=${token}`;
    console.log(`[send-verification-email] Sending verification email to: ${email}`);

    const html = verificationEmailTemplate(verificationUrl);

    const emailResponse = await resend.emails.send({
      from: "Gestão WhatsApp <noreply@wsgba-zap.com.br>",
      to: [email],
      subject: "Confirme seu e-mail - Gestão de WhatsApp",
      html,
    });

    console.log("[send-verification-email] Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[send-verification-email] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
