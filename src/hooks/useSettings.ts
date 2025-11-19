import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserSettings {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  auto_reply_enabled: boolean;
  ai_tone: 'formal' | 'casual' | 'friendly';
  ai_language: string;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

export const useSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar configurações do usuário
  const { data: settings, isLoading } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async (): Promise<UserSettings> => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Se não existir, criar configurações padrão
      if (!data) {
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user?.id,
            notifications_enabled: true,
            auto_reply_enabled: false,
            ai_tone: 'friendly',
            ai_language: 'pt-BR',
            theme: 'dark',
          })
          .select()
          .single();

        if (createError) throw createError;
        return newSettings as UserSettings;
      }

      return data as UserSettings;
    },
    enabled: !!user?.id,
  });

  // Atualizar configurações
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast({
        title: 'Configurações atualizadas',
        description: 'Suas preferências foram salvas com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
  };
};
