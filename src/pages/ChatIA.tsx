import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, Send, Plus, Trash2, MessageSquare, Loader2, ArrowLeft } from 'lucide-react';
import CyberneticBackground from '@/components/CyberneticBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChatMessage } from '@/components/ChatMessage';
import { useAIChat } from '@/hooks/useAIChat';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ChatIA = () => {
  const navigate = useNavigate();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { useChats, useMessages, sendMessage, deleteChat } = useAIChat();
  const { data: chats, isLoading: chatsLoading } = useChats();
  const { data: messages, isLoading: messagesLoading } = useMessages(currentChatId);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageToSend = inputMessage;
    setInputMessage('');

    try {
      const result = await sendMessage.mutateAsync({
        chatId: currentChatId,
        message: messageToSend,
      });

      // Se é novo chat, atualizar currentChatId
      if (!currentChatId && result.chatId) {
        setCurrentChatId(result.chatId);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      setInputMessage(messageToSend); // Restaurar mensagem em caso de erro
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setInputMessage('');
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat.mutateAsync(chatId);
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }
      toast({
        title: 'Chat deletado',
        description: 'Conversa removida com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o chat',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen">
      <CyberneticBackground />
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold cyber-glow">
            <Brain className="inline-block h-8 w-8 mr-2" />
            Chat IA - Gemini
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Lista de Chats */}
          <Card className="cyber-card p-4 lg:col-span-1">
            <Button
              className="w-full mb-4 bg-gradient-to-r from-primary to-secondary"
              onClick={handleNewChat}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Conversa
            </Button>

            <Separator className="mb-4" />

            <ScrollArea className="h-[600px]">
              {chatsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : chats && chats.length > 0 ? (
                <div className="space-y-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors",
                        currentChatId === chat.id && "bg-primary/20"
                      )}
                      onClick={() => setCurrentChatId(chat.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{chat.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(chat.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma conversa ainda</p>
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Área de Chat */}
          <Card className="cyber-card lg:col-span-3 flex flex-col" style={{ height: '700px' }}>
            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messagesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                      timestamp={message.timestamp}
                    />
                  ))}
                  {sendMessage.isPending && (
                    <div className="flex gap-3 p-4 rounded-lg bg-primary/5">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Gemini está digitando...</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Brain className="h-16 w-16 text-primary mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Chat IA</h2>
                  <p className="text-muted-foreground max-w-md">
                    Converse com o Gemini para automações, suporte e muito mais!
                  </p>
                </div>
              )}
            </ScrollArea>

            <Separator />

            {/* Input de Mensagem */}
            <div className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="cyber-border flex-1"
                  disabled={sendMessage.isPending}
                />
                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || sendMessage.isPending}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatIA;
