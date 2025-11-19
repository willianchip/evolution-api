import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PerformanceChartProps {
  data: any[];
}

export const PerformanceChart = ({ data }: PerformanceChartProps) => {
  const chartData = data
    .map(m => ({
      date: format(new Date(m.created_at), 'dd/MM HH:mm', { locale: ptBR }),
      responseTime: m.response_time_ms || 0,
    }))
    .reverse()
    .slice(-20);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="date" 
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
          label={{ value: 'Tempo (ms)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="responseTime" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          name="Tempo de Resposta"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
