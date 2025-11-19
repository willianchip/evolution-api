import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CyberneticBackground from '@/components/CyberneticBackground';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppQRCode } from '@/components/WhatsAppQRCode';
import { ConversationList } from '@/components/ConversationList';
import { MessagesList } from '@/components/MessagesList';
import { Loader2, Plus, Send, Smartphone, HelpCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { MediaUpload } from '@/components/MediaUpload';
import { WhatsAppTutorial } from '@/components/whatsapp/WhatsAppTutorial';
import { WhatsAppWizard } from '@/components/whatsapp/WhatsAppWizard';
import { NotificationHistory } from '@/components/whatsapp/NotificationHistory';
import { useWhatsAppNotifications } from '@/hooks/useWhatsAppNotifications';

export default function WhatsApp() {
  const [newInstanceName, setNewInstanceName] = useState('');
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'audio' | 'document' | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  
  const { token } = useAuth();
  const { toast } = useToast();
  
  // Initialize notifications hook
  useWhatsAppNotifications();

  const {
    connections,
    connectionsLoading,
    createConnection,
    getQRCode,
    disconnect,
    useConversations,
    useMessages,
    sendMessage,
  } = useWhatsApp();

  // Check if user should see wizard on first visit
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('whatsapp_onboarding_completed');
    const hasNoConnections = !connections || connections.length === 0;

    if (!hasCompletedOnboarding && hasNoConnections && !connectionsLoading) {
      setShowWizard(true);
    }
  }, [connections, connectionsLoading]);

  const { data: conversations } = useConversations(selectedConnection);
  const { data: messages } = useMessages(selectedConversation);

  const handleCreateConnection = async () => {
    if (!newInstanceName.trim()) return;
    await createConnection.mutateAsync(newInstanceName);
    setNewInstanceName('');
  };

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !mediaUrl) || !selectedConnection || !selectedConversation) return;

    const connection = connections?.find(c => c.id === selectedConnection);
    const conversation = conversations?.find(c => c.id === selectedConversation);
    
    if (!connection || !conversation) return;

    try {
      if (mediaUrl && mediaType) {
        // Send media
        const { error } = await supabase.functions.invoke('whatsapp-send-media', {
          body: {
            instanceName: connection.instance_name,
            number: conversation.contact_number,
            mediaUrl,
            mediaType,
            caption: messageText,
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (error) throw error;

        toast({
          title: 'Mídia enviada!',
          description: 'Sua mídia foi enviada com sucesso.',
        });
      } else {
        // Send text message
        await sendMessage.mutateAsync({
          instanceName: connection.instance_name,
          number: conversation.contact_number,
          message: messageText,
        });
      }

      setMessageText('');
      setMediaUrl('');
      setMediaType(null);
    } catch (error) {
      toast({
        title: 'Erro ao enviar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const handleMediaUploaded = (url: string, type: 'image' | 'audio' | 'document') => {
    setMediaUrl(url);
    setMediaType(type);
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('test-evolution-api');
      
      if (error) throw error;
      
      setTestResult(data);
      
      toast({
        title: data.success ? '✅ Conexão bem-sucedida!' : '❌ Falha na conexão',
        description: data.message,
        variant: data.success ? 'default' : 'destructive',
      });
    } catch (error: any) {
      console.error('Test error:', error);
      setTestResult({ 
        success: false, 
        message: error.message || 'Erro ao testar conexão'
      });
      toast({
        title: 'Erro ao testar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CyberneticBackground />
      <Header />
      
      {/* Tutorial Modal */}
      <WhatsAppTutorial open={showTutorial} onOpenChange={setShowTutorial} />
      
      {/* Onboarding Wizard */}
      <WhatsAppWizard
        open={showWizard}
        onComplete={() => setShowWizard(false)}
        onSkip={() => setShowWizard(false)}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              WhatsApp Manager
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas conexões e conversas do WhatsApp
            </p>
          </div>

          <Tabs defaultValue="connections" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="connections">Conexões</TabsTrigger>
              <TabsTrigger value="conversations">Conversas</TabsTrigger>
            </TabsList>

            <TabsContent value="connections" className="space-y-6">
              {/* Testar Evolution API */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Testar Evolution API
                  </CardTitle>
                  <CardDescription>
                    Verifique se a Evolution API está configurada e respondendo corretamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleTestConnection} 
                    disabled={testLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {testLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Testando conexão...
                      </>
                    ) : (
                      <>
                        <Smartphone className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                  
                  {testResult && (
                    <div className={`p-4 rounded-lg border ${
                      testResult.success 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-destructive bg-destructive/10'
                    }`}>
                      <div className="font-semibold mb-2">
                        {testResult.success ? '✅ Sucesso!' : '❌ Erro no Teste'}
                      </div>
                      <div className="text-sm">
                        {testResult.message}
                      </div>
                      {testResult.evolution_api?.response_time_ms && (
                        <div className="mt-2 text-xs font-mono opacity-70">
                          Tempo de resposta: {testResult.evolution_api.response_time_ms}ms
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gerenciar Conexões</CardTitle>
                      <CardDescription>
                        Crie uma nova instância do WhatsApp
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <NotificationHistory />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTutorial(true)}
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Ver Tutorial
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome da instância (ex: meu-whatsapp)"
                      value={newInstanceName}
                      onChange={(e) => setNewInstanceName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateConnection()}
                    />
                    <Button
                      onClick={handleCreateConnection}
                      disabled={createConnection.isPending || !newInstanceName.trim()}
                    >
                      {createConnection.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Criar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {connectionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : connections && connections.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {connections.map((connection) => (
                    <div key={connection.id}>
                      <WhatsAppQRCode
                        qrCode={connection.qr_code}
                        instanceName={connection.instance_name}
                        status={connection.status}
                        onRefresh={() => getQRCode.mutate(connection.instance_name)}
                        isRefreshing={getQRCode.isPending}
                      />
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedConnection(connection.id)}
                        >
                          <Smartphone className="w-4 h-4 mr-2" />
                          Ver Conversas
                        </Button>
                        {connection.status === 'connected' && (
                          <Button
                            variant="destructive"
                            onClick={() => disconnect.mutate(connection.instance_name)}
                          >
                            Desconectar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conexão criada ainda</p>
                    <p className="text-sm mt-2">Crie sua primeira conexão acima</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="conversations">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Conversas</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[500px]">
                    <ConversationList
                      conversations={conversations || []}
                      selectedId={selectedConversation}
                      onSelect={setSelectedConversation}
                    />
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Mensagens</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[500px] flex flex-col">
                    <div className="flex-1 overflow-hidden">
                      <MessagesList messages={messages || []} />
                    </div>
                    
                    {selectedConversation && (
                      <div className="p-4 border-t space-y-2">
                        <MediaUpload onMediaUploaded={handleMediaUploaded} />
                        
                        <div className="flex gap-2">
                          <Textarea
                            placeholder={mediaUrl ? "Legenda (opcional)..." : "Digite sua mensagem..."}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            className="min-h-[60px] resize-none"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={sendMessage.isPending || (!messageText.trim() && !mediaUrl)}
                            size="icon"
                            className="self-end"
                          >
                            {sendMessage.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}