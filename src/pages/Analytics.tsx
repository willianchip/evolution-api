import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportButton } from '@/components/ExportButton';
import { PerformanceChart } from '@/components/analytics/PerformanceChart';
import { SentimentAnalysis } from '@/components/analytics/SentimentAnalysis';
import { TokenUsageChart } from '@/components/analytics/TokenUsageChart';
import { CategoryBreakdown } from '@/components/analytics/CategoryBreakdown';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Activity, TrendingUp, Zap, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['ai-metrics', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('ai_performance_metrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const stats = {
    totalMessages: metrics?.length || 0,
    avgResponseTime: metrics?.reduce((acc, m) => acc + (m.response_time_ms || 0), 0) / (metrics?.length || 1),
    totalTokens: metrics?.reduce((acc, m) => acc + (m.tokens_used || 0), 0) || 0,
    avgSentiment: metrics?.reduce((acc, m) => acc + (m.sentiment_score || 0), 0) / (metrics?.length || 1),
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Analytics de IA</h1>
            <p className="text-muted-foreground">Métricas de performance e uso do Gemini AI</p>
          </div>
          <div className="flex gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd 'de' MMM", { locale: ptBR })} -{' '}
                        {format(dateRange.to, "dd 'de' MMM", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "dd 'de' MMM", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecionar período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            <ExportButton
              data={metrics || []}
              filename="analytics-ia"
              title="Analytics de IA"
              subtitle={dateRange?.from ? `Período: ${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to || new Date(), 'dd/MM/yyyy')}` : undefined}
              columns={[
                { header: 'Data', dataKey: 'created_at' },
                { header: 'Modelo', dataKey: 'model_used' },
                { header: 'Tempo (ms)', dataKey: 'response_time_ms' },
                { header: 'Tokens', dataKey: 'tokens_used' },
                { header: 'Sentimento', dataKey: 'sentiment_label' },
                { header: 'Categoria', dataKey: 'category' },
              ]}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalMessages}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{Math.round(stats.avgResponseTime)}ms</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tokens Usados</CardTitle>
              <Brain className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalTokens.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sentimento Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{(stats.avgSentiment * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="sentiment">Sentimento</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-6">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle>Tempo de Resposta</CardTitle>
                <CardDescription>Performance do modelo Gemini ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceChart data={metrics || []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokens" className="mt-6">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle>Uso de Tokens</CardTitle>
                <CardDescription>Consumo de tokens por interação</CardDescription>
              </CardHeader>
              <CardContent>
                <TokenUsageChart data={metrics || []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sentiment" className="mt-6">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle>Análise de Sentimento</CardTitle>
                <CardDescription>Distribuição de sentimentos nas interações</CardDescription>
              </CardHeader>
              <CardContent>
                <SentimentAnalysis data={metrics || []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle>Categorias de Mensagens</CardTitle>
                <CardDescription>Breakdown por tipo de interação</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryBreakdown data={metrics || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
