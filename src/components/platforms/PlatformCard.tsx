import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, CheckCircle2, XCircle } from 'lucide-react';

interface PlatformCardProps {
  platform: {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    description: string;
    connected: boolean;
  };
  messageCount: number;
  onConnect: () => void;
}

export const PlatformCard = ({ platform, messageCount, onConnect }: PlatformCardProps) => {
  const Icon = platform.icon;

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Icon className={`h-8 w-8 ${platform.color}`} />
          {platform.connected ? (
            <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-muted/50">
              <XCircle className="h-3 w-3 mr-1" />
              Desconectado
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{platform.name}</CardTitle>
        <p className="text-xs text-muted-foreground">{platform.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mensagens:</span>
            <span className="font-semibold text-foreground">{messageCount}</span>
          </div>
          <Button 
            variant={platform.connected ? "outline" : "default"} 
            className="w-full"
            onClick={onConnect}
          >
            {platform.connected ? 'Configurar' : 'Conectar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
