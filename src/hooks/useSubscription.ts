import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSubscription = () => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ [useSubscription] Error fetching subscription:', error);
        // Return null instead of throwing to prevent blocking the app
        return null;
      }

      console.log('✅ [useSubscription] Subscription:', data || 'none');
      return data;
    },
    enabled: true,
  });

  const hasActiveSubscription = subscription?.status === 'active';
  const planName = subscription?.plan_name || 'free';

  // Verificar limites do plano
  const planLimits = {
    free: { 
      connections: 0, 
      messages: 0,
      platforms: [],
      analytics: false,
    },
    starter: { 
      connections: 1, 
      messages: 1000,
      platforms: ['whatsapp'],
      analytics: false,
    },
    professional: { 
      connections: 5, 
      messages: 10000,
      platforms: ['whatsapp', 'telegram', 'instagram', 'facebook'],
      analytics: true,
    },
    enterprise: { 
      connections: 999, 
      messages: 999999,
      platforms: ['whatsapp', 'telegram', 'instagram', 'facebook'],
      analytics: true,
    },
  };

  const limits = planLimits[planName as keyof typeof planLimits] || planLimits.free;

  // Verificar se o plano permite uma feature específica
  const hasFeature = (feature: 'analytics' | 'multi-platform' | 'advanced-ai') => {
    if (feature === 'analytics') {
      return planName === 'professional' || planName === 'enterprise';
    }
    if (feature === 'multi-platform') {
      return planName === 'professional' || planName === 'enterprise';
    }
    if (feature === 'advanced-ai') {
      return planName === 'professional' || planName === 'enterprise';
    }
    return false;
  };

  return {
    subscription,
    hasActiveSubscription,
    planName,
    limits,
    isLoading,
    hasFeature,
  };
};
