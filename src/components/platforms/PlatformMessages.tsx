import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface PlatformMessagesProps {
  messages: any[];
}

export const PlatformMessages = ({ messages }: PlatformMessagesProps) => {
  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma mensagem encontrada</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex items-start gap-3 p-4 rounded-lg bg-card/30 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className={`p-2 rounded-full ${message.is_from_me ? 'bg-primary/10' : 'bg-muted'}`}>
              {message.is_from_me ? (
                <ArrowUpRight className="h-4 w-4 text-primary" />
              ) : (
                <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">
                    {message.is_from_me ? 'Você' : message.sender_name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {message.platform_type}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.timestamp), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
