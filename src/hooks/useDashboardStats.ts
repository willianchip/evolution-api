import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { EDGE_URL } from '@/lib/supabaseEdge';

interface DashboardStats {
  total_connections: number;
  active_connections: number;
  total_conversations: number;
  total_unread_messages: number;
  total_messages: number;
  messages_today: number;
  messages_this_week: number;
  total_ai_chats: number;
  total_ai_messages: number;
}

interface RecentActivity {
  id: string;
  content: string;
  timestamp: string;
  conversation: {
    contact_name: string;
    contact_number: string;
  };
}

interface MessagesByDay {
  date: string;
  count: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  messagesByDay: MessagesByDay[];
  statusDistribution: StatusDistribution[];
}

export const useDashboardStats = () => {
  const { token } = useAuth();

  return useQuery<DashboardData>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch(`${EDGE_URL}/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }

      return response.json();
    },
    enabled: !!token,
    refetchInterval: 30000, // Atualiza a cada 30s
  });
};
