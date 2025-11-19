import { Brain, MessageSquare, Activity, Loader2, TrendingUp, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CyberneticBackground from '@/components/CyberneticBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatsCard from '@/components/StatsCard';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRealtime } from '@/hooks/useRealtime';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { ExportButton } from '@/components/ExportButton';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error } = useDashboardStats();
  
  // Ativar real-time updates
  useRealtime();
  
  // Ativar notificações em tempo real
  useRealtimeNotifications(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CyberneticBackground />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CyberneticBackground />
        <Card className="cyber-card p-8 text-center relative z-10">
          <h2 className="text-2xl font-bold mb-2 text-red-500">Erro ao carregar</h2>
          <p className="text-muted-foreground">Não foi possível carregar as estatísticas</p>
        </Card>
      </div>
    );
  }

  const stats = data?.stats || {
    total_connections: 0,
    active_connections: 0,
    total_conversations: 0,
    total_unread_messages: 0,
    total_messages: 0,
    messages_today: 0,
    messages_this_week: 0,
    total_ai_chats: 0,
    total_ai_messages: 0
  };

  const statsCards = [
    {
      icon: MessageSquare,
      label: 'Conversas Ativas',
      value: stats.total_conversations.toString(),
      subValue: `${stats.total_unread_messages} não lidas`,
      color: 'text-primary'
    },
    {
      icon: TrendingUp,
      label: 'Mensagens Hoje',
      value: stats.messages_today.toString(),
      subValue: `${stats.messages_this_week} esta semana`,
      color: 'text-secondary'
    },
    {
      icon: Activity,
      label: 'Conexões WhatsApp',
      value: `${stats.active_connections}/${stats.total_connections}`,
      subValue: 'ativas',
      color: 'text-success'
    },
    {
      icon: Brain,
      label: 'Conversas IA',
      value: stats.total_ai_chats.toString(),
      subValue: `${stats.total_ai_messages} mensagens`,
      color: 'text-accent'
    },
  ];

  return (
    <div className="min-h-screen">
      <CyberneticBackground />
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold cyber-glow mb-2">
            Bem-vindo de volta{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Painel de controle - IA Avançada
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, idx) => (
            <StatsCard
              key={idx}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              subValue={stat.subValue}
              color={stat.color}
              onClick={() => {
                if (stat.label.includes('WhatsApp')) navigate('/whatsapp');
                if (stat.label.includes('IA')) navigate('/chat-ia');
              }}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cyber-card p-6">
            <Brain className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Assistente IA</h3>
            <p className="text-muted-foreground mb-4">
              Converse com o Gemini AI 24/7 para automações
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-secondary"
              onClick={() => navigate('/chat-ia')}
            >
              Iniciar Conversa
            </Button>
          </Card>

          <Card className="cyber-card p-6">
            <MessageSquare className="h-8 w-8 text-secondary mb-4" />
            <h3 className="text-xl font-bold mb-2">Conectar WhatsApp</h3>
            <p className="text-muted-foreground mb-4">
              Conecte uma nova conta do WhatsApp
            </p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => navigate('/whatsapp')}
            >
              Adicionar Conexão
            </Button>
          </Card>

          <Card className="cyber-card p-6">
            <Settings className="h-8 w-8 text-success mb-4" />
            <h3 className="text-xl font-bold mb-2">Configurações</h3>
            <p className="text-muted-foreground mb-4">
              Personalize automações e preferências
            </p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => navigate('/settings')}
            >
              Abrir Configurações
            </Button>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Mensagens por Dia */}
          <Card className="cyber-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">📊 Mensagens nos Últimos 7 Dias</h3>
              {data?.messagesByDay && data.messagesByDay.length > 0 && (
                <ExportButton
                  data={data.messagesByDay}
                  filename="mensagens-por-dia"
                  title="Relatório - Mensagens por Dia"
                  subtitle={`Gerado em ${new Date().toLocaleString('pt-BR')}`}
                  columns={[
                    { header: 'Data', dataKey: 'date' },
                    { header: 'Quantidade', dataKey: 'count' },
                  ]}
                />
              )}
            </div>
            {data?.messagesByDay && data.messagesByDay.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.messagesByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      labelFormatter={(date) => format(new Date(date), "dd 'de' MMMM", { locale: ptBR })}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      name="Mensagens"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </Card>

          {/* Gráfico de Pizza - Distribuição por Status */}
          <Card className="cyber-card p-6">
            <h2 className="text-2xl font-bold mb-4">Distribuição de Conversas</h2>
            {data?.statusDistribution && data.statusDistribution.some(d => d.count > 0) ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count, percent }) => 
                        `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="count"
                    >
                      {data.statusDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? 'hsl(var(--success))' : 'hsl(var(--warning))'} 
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>Nenhuma conversa disponível</p>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="cyber-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Atividade Recente</h2>
            {data?.recentActivity && data.recentActivity.length > 0 && (
              <ExportButton
                data={data.recentActivity.map(activity => ({
                  contato: activity.conversation.contact_name,
                  numero: activity.conversation.contact_number,
                  mensagem: activity.content,
                  data_hora: new Date(activity.timestamp).toLocaleString('pt-BR'),
                }))}
                filename="atividade-recente"
                title="Relatório - Atividade Recente"
                subtitle={`Gerado em ${new Date().toLocaleString('pt-BR')}`}
                columns={[
                  { header: 'Contato', dataKey: 'contato' },
                  { header: 'Número', dataKey: 'numero' },
                  { header: 'Mensagem', dataKey: 'mensagem' },
                  { header: 'Data/Hora', dataKey: 'data_hora' },
                ]}
              />
            )}
          </div>
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b border-primary/20 pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{activity.conversation.contact_name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {activity.content}
                    </p>
                  </div>
                  <span className="text-sm text-primary">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma atividade recente</p>
              <p className="text-sm">Conecte seu WhatsApp para começar!</p>
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
