import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryBreakdownProps {
  data: any[];
}

export const CategoryBreakdown = ({ data }: CategoryBreakdownProps) => {
  const categories = data.reduce((acc, m) => {
    const cat = m.category || 'outros';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categories)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          type="number"
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          dataKey="name"
          type="category"
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
          width={120}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Bar 
          dataKey="value" 
          fill="hsl(var(--primary))" 
          name="Quantidade"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
