import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  is_from_me: boolean;
  message_type: string;
  media_url?: string | null;
  created_at: string;
}

interface MessagesListProps {
  messages: Message[];
}

export const MessagesList = ({ messages }: MessagesListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
        <p>Selecione uma conversa para ver as mensagens</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.is_from_me ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[70%] rounded-lg px-4 py-2 shadow-sm",
                message.is_from_me
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.media_url && (
                <img
                  src={message.media_url}
                  alt="Media"
                  className="rounded-md mb-2 max-w-full"
                />
              )}
              <p className="whitespace-pre-wrap break-words">
                {message.content}
              </p>
              <span
                className={cn(
                  "text-xs mt-1 block",
                  message.is_from_me
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                )}
              >
                {format(new Date(message.created_at), 'HH:mm')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};