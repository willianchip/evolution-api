import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useRealtimeNotifications = (enabled: boolean = true) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id || !enabled) return;

    // Solicitar permissão para notificações do browser
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Subscribe a novas mensagens recebidas
    const channel = supabase
      .channel('whatsapp-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `is_from_me=eq.false`,
        },
        (payload: any) => {
          console.log('Nova mensagem recebida:', payload);

          // Notificação do browser
          if (Notification.permission === 'granted') {
            new Notification('💬 Nova mensagem no WhatsApp', {
              body: payload.new.content?.substring(0, 100) || 'Nova mensagem',
              icon: '/favicon.ico',
              tag: payload.new.id,
            });
          }

          // Toast na interface
          toast({
            title: '💬 Nova Mensagem',
            description: payload.new.content?.substring(0, 50) || 'Você recebeu uma nova mensagem',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, enabled]);
};
