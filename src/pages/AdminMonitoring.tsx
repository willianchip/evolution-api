import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Mail, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Database,
  Zap,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AuditLogsList } from '@/components/admin/AuditLogsList';

interface HealthCheckStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  message: string;
  response_time?: number;
}

interface CronLog {
  id: string;
  execution_started_at: string;
  execution_finished_at: string;
  messages_processed: number;
  messages_sent: number;
  messages_failed: number;
  status: string;
  duration_ms: number;
  errors: any;
}

interface EmailLog {
  id: string;
  email_type: string;
  email_to: string;
  status: string;
  created_at: string;
  error_message?: string;
}

interface SystemLog {
  id: string;
  log_level: string;
  category: string;
  message: string;
  created_at: string;
  metadata: any;
}

const AdminMonitoring = () => {
  const [healthStatus, setHealthStatus] = useState<HealthCheckStatus[]>([]);

  // Health Check Query
  const { refetch: checkHealth } = useQuery({
    queryKey: ['health-check'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('health-check');
      if (error) throw error;
      setHealthStatus(data.checks || []);
      return data;
    },
    refetchInterval: 30000, // Atualiza a cada 30s
  });

  // CRON Logs Query
  const { data: cronLogs } = useQuery<CronLog[]>({
    queryKey: ['cron-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cron_execution_logs')
        .select('*')
        .order('execution_started_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  // Email Logs Query
  const { data: emailLogs } = useQuery<EmailLog[]>({
    queryKey: ['email-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  // System Logs Query
  const { data: systemLogs } = useQuery<SystemLog[]>({
    queryKey: ['system-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
      case 'sent':
      case 'delivered':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'degraded':
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'down':
      case 'failed':
      case 'bounced':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'degraded':
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'down':
      case 'failed':
      case 'bounced':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Calcular métricas
  const cronStats = cronLogs ? {
    total: cronLogs.length,
    successful: cronLogs.filter(l => l.status === 'completed').length,
    failed: cronLogs.filter(l => l.status === 'failed').length,
    avgDuration: cronLogs.length > 0 
      ? Math.round(cronLogs.reduce((acc, l) => acc + (l.duration_ms || 0), 0) / cronLogs.length)
      : 0,
  } : null;

  const emailStats = emailLogs ? {
    total: emailLogs.length,
    sent: emailLogs.filter(l => l.status === 'sent' || l.status === 'delivered').length,
    failed: emailLogs.filter(l => l.status === 'failed' || l.status === 'bounced').length,
    byType: emailLogs.reduce((acc, log) => {
      acc[log.email_type] = (acc[log.email_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  } : null;

  // Preparar dados para gráficos
  const cronChartData = cronLogs?.slice(0, 10).reverse().map(log => ({
    time: new Date(log.execution_started_at).toLocaleTimeString(),
    processed: log.messages_processed,
    sent: log.messages_sent,
    failed: log.messages_failed,
  })) || [];

  const emailChartData = emailStats ? Object.entries(emailStats.byType).map(([type, count]) => ({
    type,
    count,
  })) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold cyber-glow">Dashboard de Monitoramento</h1>
            <p className="text-muted-foreground mt-2">
              Monitoramento em tempo real de CRON, emails e saúde do sistema
            </p>
          </div>
          <Button onClick={() => checkHealth()} variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Atualizar Status
          </Button>
        </div>

        {/* Health Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {healthStatus.map((check) => (
            <Card key={check.service} className="p-4 cyber-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{check.service}</span>
                {getStatusIcon(check.status)}
              </div>
              <Badge className={getStatusColor(check.status)}>
                {check.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">{check.message}</p>
              {check.response_time && (
                <p className="text-xs text-muted-foreground mt-1">
                  {check.response_time}ms
                </p>
              )}
            </Card>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 cyber-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Execuções CRON</p>
                <p className="text-2xl font-bold">{cronStats?.total || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <span className="text-green-500">{cronStats?.successful || 0} sucesso</span>
              {' · '}
              <span className="text-red-500">{cronStats?.failed || 0} falhas</span>
            </div>
          </Card>

          <Card className="p-6 cyber-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails Enviados</p>
                <p className="text-2xl font-bold">{emailStats?.total || 0}</p>
              </div>
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <span className="text-green-500">{emailStats?.sent || 0} entregues</span>
              {' · '}
              <span className="text-red-500">{emailStats?.failed || 0} falhas</span>
            </div>
          </Card>

          <Card className="p-6 cyber-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio CRON</p>
                <p className="text-2xl font-bold">{cronStats?.avgDuration || 0}ms</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 cyber-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sistema</p>
                <p className="text-2xl font-bold">Operacional</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 cyber-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Execuções CRON (Últimas 10)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cronChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Line type="monotone" dataKey="processed" stroke="hsl(var(--primary))" name="Processadas" />
                <Line type="monotone" dataKey="sent" stroke="#10b981" name="Enviadas" />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Falhas" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 cyber-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Emails por Tipo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emailChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Logs Tabs */}
        <Card className="p-6 cyber-card">
          <Tabs defaultValue="cron" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cron">Logs CRON</TabsTrigger>
              <TabsTrigger value="email">Logs Email</TabsTrigger>
              <TabsTrigger value="system">Logs Sistema</TabsTrigger>
              <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="cron">
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-2">
                  {cronLogs?.map((log) => (
                    <div key={log.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.execution_started_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Processadas</p>
                          <p className="font-semibold">{log.messages_processed}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Enviadas</p>
                          <p className="font-semibold text-green-500">{log.messages_sent}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Falhas</p>
                          <p className="font-semibold text-red-500">{log.messages_failed}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duração</p>
                          <p className="font-semibold">{log.duration_ms}ms</p>
                        </div>
                      </div>
                      {log.errors && (
                        <div className="mt-2 p-2 bg-red-500/10 rounded text-xs text-red-500">
                          {JSON.stringify(log.errors)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="email">
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-2">
                  {emailLogs?.map((log) => (
                    <div key={log.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                          <Badge variant="outline">{log.email_type}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">Para: <span className="font-semibold">{log.email_to}</span></p>
                      {log.error_message && (
                        <div className="mt-2 p-2 bg-red-500/10 rounded text-xs text-red-500">
                          {log.error_message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="system">
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-2">
                  {systemLogs?.map((log) => (
                    <div key={log.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(log.log_level)}>
                            {log.log_level}
                          </Badge>
                          <Badge variant="outline">{log.category}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {log.metadata && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="audit">
              <AuditLogsList />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AdminMonitoring;
