import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  contact_name: string;
  contact_number: string;
  last_message_at: string;
  unread_count: number;
  is_archived: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) => {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-center">Nenhuma conversa ainda</p>
        <p className="text-sm text-center mt-2">
          As conversas aparecerão aqui quando você receber mensagens
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              "hover:bg-accent",
              selectedId === conversation.id && "bg-accent"
            )}
          >
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {conversation.contact_name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-medium truncate">
                  {conversation.contact_name || conversation.contact_number}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(conversation.last_message_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.contact_number}
                </p>
                {conversation.unread_count > 0 && (
                  <Badge variant="default" className="rounded-full px-2 py-0 text-xs">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};