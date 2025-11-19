import { cn } from '@/lib/utils';
import { Brain, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const ChatMessage = ({ role, content, timestamp }: ChatMessageProps) => {
  const isAssistant = role === 'assistant';

  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg",
      isAssistant ? "bg-primary/5" : "bg-secondary/5"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isAssistant ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
      )}>
        {isAssistant ? <Brain className="h-5 w-5" /> : <User className="h-5 w-5" />}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {isAssistant ? 'Gemini AI' : 'Você'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isAssistant ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <p>{content}</p>
          )}
        </div>
      </div>
    </div>
  );
};
