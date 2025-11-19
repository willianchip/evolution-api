import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useRealtime = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Subscrever a mudanças nas mensagens
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('New message received:', payload);
          
          // Invalidar queries relevantes
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

          // Mostrar notificação se a mensagem não for do usuário
          if (!payload.new.is_from_me) {
            toast({
              title: '💬 Nova mensagem',
              description: 'Você recebeu uma nova mensagem no WhatsApp',
            });
          }
        }
      )
      .subscribe();

    // Subscrever a mudanças nas conexões
    const connectionsChannel = supabase
      .channel('connections-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_connections',
        },
        (payload) => {
          console.log('Connection status changed:', payload);
          
          queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
          
          const newStatus = payload.new.status;
          if (newStatus === 'connected') {
            toast({
              title: '✅ WhatsApp conectado',
              description: 'Sua conexão foi estabelecida com sucesso',
            });
          } else if (newStatus === 'disconnected') {
            toast({
              title: '⚠️ WhatsApp desconectado',
              description: 'Sua conexão foi perdida',
              variant: 'destructive',
            });
          }
        }
      )
      .subscribe();

    // Subscrever a mudanças nos chats IA
    const aiChatsChannel = supabase
      .channel('ai-chats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ai-messages'] });
          queryClient.invalidateQueries({ queryKey: ['ai-chats'] });
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(connectionsChannel);
      supabase.removeChannel(aiChatsChannel);
    };
  }, [user?.id, queryClient]);
};
