import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

const StatsCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  color = 'text-primary',
  trend,
  onClick 
}: StatsCardProps) => {
  return (
    <Card 
      className={cn(
        "cyber-card p-6 transition-all duration-300",
        onClick && "cursor-pointer hover:scale-105 hover:shadow-lg"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className={cn("text-3xl font-bold", color)}>{value}</p>
            {trend && (
              <span className={cn(
                "text-xs font-medium",
                trend === 'up' && "text-success",
                trend === 'down' && "text-destructive",
                trend === 'neutral' && "text-muted-foreground"
              )}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trend === 'neutral' && '→'}
              </span>
            )}
          </div>
          {subValue && (
            <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
          )}
        </div>
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-lg",
          "bg-gradient-to-br from-primary/10 to-primary/5"
        )}>
          <Icon className={cn("h-6 w-6", color)} />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
