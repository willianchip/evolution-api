import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KiwifyWebhookPayload {
  event: string;
  order_id: string;
  order_status: string;
  customer: {
    email: string;
    name: string;
  };
  product: {
    product_id: string;
    product_name: string;
  };
  subscription?: {
    id: string;
    status: string;
    next_charge?: string;
  };
  payment: {
    method: string;
    value: number;
  };
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: KiwifyWebhookPayload = await req.json();
    
    console.log('🔔 Kiwify webhook received:', {
      event: payload.event,
      order_id: payload.order_id,
      customer_email: payload.customer.email,
    });

    // Log do webhook recebido
    const { error: logError } = await supabase.from('kiwify_webhooks_log').insert({
      event_type: payload.event,
      payload: payload,
      processed: false,
    });

    if (logError) {
      console.error('Error logging webhook:', logError);
    }

    // Processar eventos diferentes
    switch (payload.event) {
      case 'compra_aprovada':
        await handlePurchaseApproved(supabase, payload);
        break;
      
      case 'subscription_canceled':
        await handleSubscriptionCanceled(supabase, payload);
        break;
      
      case 'subscription_renewed':
        await handleSubscriptionRenewed(supabase, payload);
        break;
      
      case 'compra_reembolsada':
        await handleRefund(supabase, payload);
        break;
      
      default:
        console.log('Unhandled event:', payload.event);
    }

    // Marcar webhook como processado
    await supabase
      .from('kiwify_webhooks_log')
      .update({ processed: true })
      .eq('payload->order_id', payload.order_id);

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function handlePurchaseApproved(supabase: any, payload: KiwifyWebhookPayload) {
  console.log('✅ Processing purchase approval for:', payload.customer.email);

  // Buscar usuário pelo email
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error fetching users:', userError);
    throw userError;
  }

  const user = userData.users.find((u: any) => u.email === payload.customer.email);
  
  if (!user) {
    console.error('❌ User not found:', payload.customer.email);
    throw new Error(`User not found: ${payload.customer.email}`);
  }

  // Determinar nome do plano baseado no product_id
  const planName = getPlanNameFromProductId(payload.product.product_id);
  
  // Calcular data de expiração (30 dias)
  const expiresAt = payload.subscription?.next_charge 
    ? new Date(payload.subscription.next_charge) 
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Criar/atualizar assinatura
  const { error: subError } = await supabase.from('subscriptions').upsert({
    user_id: user.id,
    kiwify_subscription_id: payload.subscription?.id || payload.order_id,
    kiwify_product_id: payload.product.product_id,
    plan_name: planName,
    status: 'active',
    payment_method: payload.payment.method,
    amount: payload.payment.value,
    started_at: new Date(payload.created_at),
    expires_at: expiresAt,
    metadata: {
      order_id: payload.order_id,
      customer_name: payload.customer.name,
      product_name: payload.product.product_name,
    },
  }, {
    onConflict: 'kiwify_subscription_id',
  });

  if (subError) {
    console.error('Error creating subscription:', subError);
    throw subError;
  }

  console.log('✅ Subscription activated for user:', user.email, 'Plan:', planName);
}

async function handleSubscriptionCanceled(supabase: any, payload: KiwifyWebhookPayload) {
  console.log('⚠️ Processing subscription cancellation:', payload.subscription?.id);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date(),
    })
    .eq('kiwify_subscription_id', payload.subscription?.id);
  
  if (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }

  console.log('✅ Subscription canceled:', payload.subscription?.id);
}

async function handleSubscriptionRenewed(supabase: any, payload: KiwifyWebhookPayload) {
  console.log('🔄 Processing subscription renewal:', payload.subscription?.id);

  const expiresAt = payload.subscription?.next_charge 
    ? new Date(payload.subscription.next_charge) 
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      expires_at: expiresAt,
      updated_at: new Date(),
    })
    .eq('kiwify_subscription_id', payload.subscription?.id);
  
  if (error) {
    console.error('Error renewing subscription:', error);
    throw error;
  }

  console.log('✅ Subscription renewed:', payload.subscription?.id);
}

async function handleRefund(supabase: any, payload: KiwifyWebhookPayload) {
  console.log('💸 Processing refund:', payload.order_id);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'refunded',
      canceled_at: new Date(),
    })
    .eq('kiwify_subscription_id', payload.subscription?.id || payload.order_id);
  
  if (error) {
    console.error('Error processing refund:', error);
    throw error;
  }

  console.log('✅ Refund processed:', payload.order_id);
}

// Mapear product_id da Kiwify para nome do plano
// IMPORTANTE: Substituir pelos IDs reais dos produtos na Kiwify após criar os produtos
function getPlanNameFromProductId(productId: string): string {
  const productMap: Record<string, string> = {
    // SUBSTITUA PELOS IDs REAIS DA KIWIFY
    'KIWIFY_PRODUCT_ID_STARTER': 'starter',
    'KIWIFY_PRODUCT_ID_PROFESSIONAL': 'professional',
    'KIWIFY_PRODUCT_ID_ENTERPRISE': 'enterprise',
  };
  
  return productMap[productId] || 'starter';
}
