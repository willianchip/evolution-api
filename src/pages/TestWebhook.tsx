import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CyberneticBackground from '@/components/CyberneticBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, TestTube, MessageCircle, QrCode, Wifi } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function TestWebhook() {
  const [selectedInstance, setSelectedInstance] = useState('');
  const [testType, setTestType] = useState<'message' | 'connection' | 'qrcode'>('message');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();
  const { token } = useAuth();

  // Buscar conexões disponíveis
  const { data: connections } = useQuery({
    queryKey: ['whatsapp-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleTest = async () => {
    if (!selectedInstance) {
      toast({
        title: 'Erro',
        description: 'Selecione uma instância primeiro',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-webhook', {
        body: { 
          instanceName: selectedInstance,
          testType 
        },
      });

      if (error) throw error;

      setTestResult(data);
      toast({
        title: '✅ Teste realizado!',
        description: `Webhook testado com sucesso (${testType})`,
      });
    } catch (error) {
      console.error('Test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro no teste',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTestIcon = () => {
    switch (testType) {
      case 'message':
        return <MessageCircle className="w-5 h-5" />;
      case 'connection':
        return <Wifi className="w-5 h-5" />;
      case 'qrcode':
        return <QrCode className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CyberneticBackground />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              🧪 Teste de Webhook
            </h1>
            <p className="text-muted-foreground">
              Simule o recebimento de mensagens e eventos do WhatsApp
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Teste</CardTitle>
                <CardDescription>
                  Selecione a instância e o tipo de teste que deseja executar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instância WhatsApp</label>
                  <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma instância" />
                    </SelectTrigger>
                    <SelectContent>
                      {connections?.map((conn) => (
                        <SelectItem key={conn.id} value={conn.instance_name}>
                          {conn.instance_name} ({conn.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Teste</label>
                  <Select value={testType} onValueChange={(value: any) => setTestType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="message">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Mensagem Recebida
                        </div>
                      </SelectItem>
                      <SelectItem value="connection">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4" />
                          Atualização de Conexão
                        </div>
                      </SelectItem>
                      <SelectItem value="qrcode">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4" />
                          Novo QR Code
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleTest}
                  disabled={loading || !selectedInstance}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <>
                      {getTestIcon()}
                      <span className="ml-2">Executar Teste</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {testResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultado do Teste</CardTitle>
                  <CardDescription>
                    Resposta do webhook
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4 overflow-auto max-h-96">
                    <pre className="text-xs">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Como Testar Manualmente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Teste Real com WhatsApp</h4>
                  <p className="text-sm text-muted-foreground">
                    Envie uma mensagem para o número conectado via WhatsApp e veja se aparece no sistema.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Verifique os Logs</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Acesse os logs da Edge Function para ver detalhes do processamento:
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href="https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn/logs/edge-functions" 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver Logs no Supabase
                    </a>
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Configure o Webhook na Evolution API</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    URL do webhook:
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    https://fegvbiomgoodcswveyqn.supabase.co/functions/v1/whatsapp-webhook
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
