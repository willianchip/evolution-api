import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TokenUsageChartProps {
  data: any[];
}

export const TokenUsageChart = ({ data }: TokenUsageChartProps) => {
  const chartData = data
    .map(m => ({
      date: format(new Date(m.created_at), 'dd/MM HH:mm', { locale: ptBR }),
      tokens: m.tokens_used || 0,
    }))
    .reverse()
    .slice(-15);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="date" 
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
          label={{ value: 'Tokens', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Bar 
          dataKey="tokens" 
          fill="hsl(var(--primary))" 
          name="Tokens Usados"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
