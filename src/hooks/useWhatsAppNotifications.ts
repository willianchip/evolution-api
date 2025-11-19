import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

const playNotificationSound = (soundType: string) => {
  const soundMap: Record<string, string> = {
    connected: '/sounds/connection-success.mp3',
    disconnected: '/sounds/connection-lost.mp3',
    qrcode: '/sounds/qrcode-ready.mp3',
    error: '/sounds/error.mp3',
  };

  const soundPath = soundMap[soundType];
  if (soundPath) {
    const audio = new Audio(soundPath);
    audio.volume = 0.5;
    audio.play().catch((error) => console.error('Error playing sound:', error));
  }
};

const showBrowserNotification = (title: string, body: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
    });
  }
};

export const useWhatsAppNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Load notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('whatsapp_notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
      setUnreadCount(parsed.filter((n: any) => !n.read).length);
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = (newNotifications: Notification[]) => {
    localStorage.setItem('whatsapp_notifications', JSON.stringify(newNotifications));
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter((n) => !n.read).length);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    const updated = [newNotification, ...notifications].slice(0, 50); // Keep last 50
    saveNotifications(updated);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('whatsapp-notifications-enhanced')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_connections',
        },
        (payload: any) => {
          const oldStatus = payload.old.status;
          const newStatus = payload.new.status;
          const instanceName = payload.new.instance_name;

          console.log('Connection status changed:', {
            instanceName,
            oldStatus,
            newStatus,
            timestamp: new Date().toISOString(),
          });

          // Connection established
          if (oldStatus !== 'connected' && newStatus === 'connected') {
            playNotificationSound('connected');
            showBrowserNotification(
              '✅ WhatsApp Conectado',
              `Instância "${instanceName}" conectada com sucesso`
            );
            toast({
              title: '✅ WhatsApp Conectado',
              description: `Instância "${instanceName}" conectada com sucesso`,
              duration: 5000,
            });
            addNotification({
              type: 'success',
              title: 'WhatsApp Conectado',
              description: `Instância "${instanceName}" conectada`,
            });
          }

          // Connection lost
          if (oldStatus === 'connected' && newStatus === 'disconnected') {
            playNotificationSound('disconnected');
            showBrowserNotification(
              '⚠️ WhatsApp Desconectado',
              `Instância "${instanceName}" foi desconectada`
            );
            toast({
              title: '⚠️ WhatsApp Desconectado',
              description: `Instância "${instanceName}" foi desconectada`,
              variant: 'destructive',
              duration: 10000,
            });
            addNotification({
              type: 'warning',
              title: 'WhatsApp Desconectado',
              description: `Instância "${instanceName}" foi desconectada`,
            });
          }

          // QR Code updated
          if (payload.new.qr_code !== payload.old.qr_code && payload.new.qr_code) {
            playNotificationSound('qrcode');
            toast({
              title: '🔵 QR Code Pronto',
              description: 'Escaneie o QR Code para conectar',
              duration: 8000,
            });
            addNotification({
              type: 'info',
              title: 'QR Code Pronto',
              description: `QR Code gerado para "${instanceName}"`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_connections',
        },
        (payload: any) => {
          const instanceName = payload.new.instance_name;
          toast({
            title: '🆕 Nova Instância Criada',
            description: `Instância "${instanceName}" criada. Aguarde o QR Code.`,
            duration: 5000,
          });
          addNotification({
            type: 'info',
            title: 'Nova Instância',
            description: `Instância "${instanceName}" foi criada`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, notifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};
