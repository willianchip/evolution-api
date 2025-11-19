import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePlatforms = () => {
  const { data: connections, isLoading: loadingConnections } = useQuery({
    queryKey: ['platform-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['platform-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_messages')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    }
  });

  return {
    connections,
    messages,
    isLoading: loadingConnections || loadingMessages,
  };
};
