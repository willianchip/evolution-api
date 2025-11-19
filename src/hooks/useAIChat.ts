import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { REST_URL, EDGE_URL, getRestHeaders } from '@/lib/supabaseEdge';

interface AIChat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const useAIChat = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Listar todos os chats
  const useChats = () => {
    return useQuery<AIChat[]>({
      queryKey: ['ai-chats'],
      queryFn: async () => {
        const response = await fetch(`${REST_URL}/ai_chats?order=created_at.desc`, {
          headers: getRestHeaders(token),
        });
        return response.json();
      },
      enabled: !!token,
    });
  };

  // Buscar mensagens de um chat específico
  const useMessages = (chatId: string | null) => {
    return useQuery<AIMessage[]>({
      queryKey: ['ai-messages', chatId],
      queryFn: async () => {
        if (!chatId) return [];
        
        const response = await fetch(
          `${REST_URL}/ai_messages?chat_id=eq.${chatId}&order=timestamp.asc`,
          {
            headers: getRestHeaders(token),
          }
        );
        return response.json();
      },
      enabled: !!token && !!chatId,
    });
  };

  // Enviar mensagem
  const sendMessage = useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string | null; message: string }) => {
      const response = await fetch(`${EDGE_URL}/gemini-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar mensagem');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Atualizar cache de mensagens
      queryClient.invalidateQueries({ queryKey: ['ai-messages', data.chatId] });
      queryClient.invalidateQueries({ queryKey: ['ai-chats'] });
    },
  });

  // Deletar chat
  const deleteChat = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch(`${REST_URL}/ai_chats?id=eq.${chatId}`, {
        method: 'DELETE',
        headers: getRestHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar chat');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chats'] });
    },
  });

  return {
    useChats,
    useMessages,
    sendMessage,
    deleteChat,
  };
};
