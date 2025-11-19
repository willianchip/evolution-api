import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useWhatsApp = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { token } = useAuth();

  // Fetch WhatsApp connections
  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['whatsapp-connections'],
    queryFn: async () => {
      console.log('🔍 [useWhatsApp] === FETCHING CONNECTIONS ===');
      console.log('🔍 [useWhatsApp] Auth token exists:', !!token);
      console.log('🔍 [useWhatsApp] Token preview:', token?.substring(0, 20) + '...');
      
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [useWhatsApp] Error fetching connections:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }
      
      console.log('✅ [useWhatsApp] Connections fetched successfully:', data?.length || 0);
      console.log('✅ [useWhatsApp] Connections data:', data);
      return data;
    },
  });

  // Create new connection
  const createConnection = useMutation({
    mutationFn: async (instanceName: string) => {
      console.log('📡 [useWhatsApp] === CREATE CONNECTION ===');
      console.log('📡 [useWhatsApp] Instance name:', instanceName);
      console.log('📡 [useWhatsApp] Calling whatsapp-connect function...');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-connect', {
        body: { instanceName, action: 'create' },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('📥 [useWhatsApp] Response from whatsapp-connect:', { data, error });

      if (error) {
        console.error('❌ [useWhatsApp] Error creating connection:', error);
        throw error;
      }
      
      console.log('✅ [useWhatsApp] Connection created successfully');
      return data;
    },
    onSuccess: () => {
      console.log('🎉 [useWhatsApp] Connection creation successful, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
      toast({
        title: 'Conexão criada!',
        description: 'Escaneie o QR Code para conectar seu WhatsApp.',
      });
    },
    onError: (error: Error) => {
      console.error('💥 [useWhatsApp] Connection creation failed:', error);
      toast({
        title: 'Erro ao criar conexão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get QR Code
  const getQRCode = useMutation({
    mutationFn: async (instanceName: string) => {
      const { data, error } = await supabase.functions.invoke('whatsapp-connect', {
        body: { instanceName, action: 'qrcode' },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao obter QR Code',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Disconnect
  const disconnect = useMutation({
    mutationFn: async (instanceName: string) => {
      const { data, error } = await supabase.functions.invoke('whatsapp-connect', {
        body: { instanceName, action: 'disconnect' },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
      toast({
        title: 'Desconectado',
        description: 'WhatsApp desconectado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao desconectar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Fetch conversations
  const useConversations = (connectionId: string) => {
    return useQuery({
      queryKey: ['conversations', connectionId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('connection_id', connectionId)
          .order('last_message_at', { ascending: false });

        if (error) throw error;
        return data;
      },
      enabled: !!connectionId,
    });
  };

  // Fetch messages
  const useMessages = (conversationId: string) => {
    return useQuery({
      queryKey: ['messages', conversationId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
      },
      enabled: !!conversationId,
    });
  };

  // Send message
  const sendMessage = useMutation({
    mutationFn: async ({ 
      instanceName, 
      number, 
      message 
    }: { 
      instanceName: string; 
      number: string; 
      message: string; 
    }) => {
      const { data, error } = await supabase.functions.invoke('whatsapp-send-message', {
        body: { instanceName, number, message },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({
        title: 'Mensagem enviada!',
        description: 'Sua mensagem foi enviada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    connections,
    connectionsLoading,
    createConnection,
    getQRCode,
    disconnect,
    useConversations,
    useMessages,
    sendMessage,
  };
};