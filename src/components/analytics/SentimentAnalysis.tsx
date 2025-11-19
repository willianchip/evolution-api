import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SentimentAnalysisProps {
  data: any[];
}

export const SentimentAnalysis = ({ data }: SentimentAnalysisProps) => {
  const sentiments = data.reduce((acc, m) => {
    const label = m.sentiment_label || 'neutral';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(sentiments).map(([name, value]) => ({
    name: name === 'positive' ? 'Positivo' : name === 'negative' ? 'Negativo' : 'Neutro',
    value,
  }));

  const COLORS = {
    'Positivo': 'hsl(var(--chart-1))',
    'Negativo': 'hsl(var(--chart-2))',
    'Neutro': 'hsl(var(--chart-3))',
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="hsl(var(--primary))"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
