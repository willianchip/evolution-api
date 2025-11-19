import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Automation {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  trigger_type: 'keyword' | 'time' | 'new_contact';
  conditions: {
    keywords?: string[];
    time?: string;
  };
  actions: {
    type: 'reply' | 'ai_reply' | 'forward';
    message?: string;
    ai_tone?: 'formal' | 'casual' | 'friendly';
    forward_to?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAutomations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: automations, isLoading } = useQuery({
    queryKey: ['automations', user?.id],
    queryFn: async (): Promise<Automation[]> => {
      const { data, error } = await supabase
        .from('automations' as any)
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any as Automation[];
    },
    enabled: !!user?.id,
  });

  const createAutomation = useMutation({
    mutationFn: async (automation: Omit<Automation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('automations' as any)
        .insert({ ...automation, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast({
        title: 'Automação criada',
        description: 'A automação foi criada com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar automação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateAutomation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Automation> & { id: string }) => {
      const { data, error } = await supabase
        .from('automations' as any)
        .update(updates as any)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast({
        title: 'Automação atualizada',
        description: 'A automação foi atualizada com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar automação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteAutomation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('automations' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast({
        title: 'Automação excluída',
        description: 'A automação foi excluída com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir automação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleAutomation = useMutation({
    mutationFn: async (id: string) => {
      const automation = automations?.find(a => a.id === id);
      if (!automation) throw new Error('Automation not found');

      const { error } = await supabase
        .from('automations' as any)
        .update({ is_active: !automation.is_active } as any)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao alternar automação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    automations,
    isLoading,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
  };
};
