import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Loader2,
  MessageSquare,
  Brain,
  Mail,
  Key,
  Database
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface IntegrationStatus {
  name: string;
  icon: any;
  configured: boolean;
  reachable: boolean | null;
  details: string;
  lastChecked: string | null;
  testFunction?: string;
  configLink?: string;
  responseTime?: number;
}

export default function AdminIntegrations() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadIntegrations = async () => {
    setIsLoading(true);
    try {
      // Call health-check to get all statuses
      const { data, error } = await supabase.functions.invoke('health-check');
      
      if (error) throw error;

      const statuses: IntegrationStatus[] = [
        {
          name: 'Evolution API (WhatsApp)',
          icon: MessageSquare,
          configured: data?.services?.evolution_api?.status !== 'unhealthy' || data?.services?.evolution_api?.error?.includes('not configured'),
          reachable: data?.services?.evolution_api?.status === 'healthy',
          details: data?.services?.evolution_api?.error || 
                  `Status: ${data?.services?.evolution_api?.statusCode || 'OK'}`,
          lastChecked: data?.timestamp,
          testFunction: 'test-evolution-api',
          configLink: 'https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn/settings/functions',
          responseTime: data?.services?.evolution_api?.response_time_ms,
        },
        {
          name: 'Gemini AI',
          icon: Brain,
          configured: data?.services?.gemini?.status !== 'unhealthy',
          reachable: data?.services?.gemini?.status === 'configured',
          details: data?.services?.gemini?.note || data?.services?.gemini?.error || 'Verificar configuração',
          lastChecked: data?.timestamp,
          configLink: 'https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn/settings/functions',
        },
        {
          name: 'Resend (Email)',
          icon: Mail,
          configured: data?.services?.resend?.status !== 'unhealthy',
          reachable: data?.services?.resend?.status === 'configured',
          details: data?.services?.resend?.note || data?.services?.resend?.error || 'Verificar configuração',
          lastChecked: data?.timestamp,
          configLink: 'https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn/settings/functions',
        },
        {
          name: 'Google OAuth',
          icon: Key,
          configured: true,
          reachable: null,
          details: 'Client ID e Secret configurados. Ativar manualmente no Supabase Auth Providers.',
          lastChecked: data?.timestamp,
          configLink: 'https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn/auth/providers',
        },
        {
          name: 'Supabase Database',
          icon: Database,
          configured: true,
          reachable: data?.services?.database?.status === 'healthy',
          details: data?.services?.database?.error || 'Conectado e funcionando',
          lastChecked: data?.timestamp,
        },
      ];

      setIntegrations(statuses);
    } catch (error: any) {
      console.error('Error loading integrations:', error);
      toast({
        title: 'Erro ao carregar integrações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadIntegrations, 60000);
    return () => clearInterval(interval);
  }, []);

  const testIntegration = async (integration: IntegrationStatus) => {
    if (!integration.testFunction) return;
    
    setTestingId(integration.name);
    try {
      const { data, error } = await supabase.functions.invoke(integration.testFunction);
      
      if (error) throw error;

      toast({
        title: data.success ? 'Teste bem-sucedido!' : 'Teste falhou',
        description: data.message,
        variant: data.success ? 'default' : 'destructive',
      });

      // Reload to update status
      await loadIntegrations();
    } catch (error: any) {
      toast({
        title: 'Erro no teste',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setTestingId(null);
    }
  };

  const getStatusIcon = (integration: IntegrationStatus) => {
    if (integration.reachable === true) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (integration.reachable === false) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (integration.configured) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (integration: IntegrationStatus) => {
    if (integration.reachable === true) {
      return <Badge variant="default" className="bg-green-500">Online</Badge>;
    }
    if (integration.reachable === false) {
      return <Badge variant="destructive">Offline</Badge>;
    }
    if (integration.configured) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Configurado</Badge>;
    }
    return <Badge variant="destructive">Não configurado</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Status das Integrações
              </h1>
              <p className="text-muted-foreground">
                Monitore e teste todas as integrações do sistema
              </p>
            </div>
            <Button
              onClick={loadIntegrations}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Atualizar Tudo
            </Button>
          </div>

          {/* Last Update */}
          {integrations.length > 0 && integrations[0].lastChecked && (
            <Alert>
              <AlertDescription>
                Última verificação: {new Date(integrations[0].lastChecked).toLocaleString('pt-BR')}
              </AlertDescription>
            </Alert>
          )}

          {/* Integration Cards */}
          <div className="grid gap-4">
            {isLoading && integrations.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : (
              integrations.map((integration) => {
                const Icon = integration.icon;
                const isTesting = testingId === integration.name;

                return (
                  <Card key={integration.name} className="border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(integration)}
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {integration.details}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(integration)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground space-y-1">
                          {integration.responseTime && (
                            <div>Tempo de resposta: <span className="font-mono">{integration.responseTime}ms</span></div>
                          )}
                          {integration.configured && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              Secrets configurados
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {integration.testFunction && (
                            <Button
                              onClick={() => testIntegration(integration)}
                              disabled={isTesting}
                              variant="outline"
                              size="sm"
                            >
                              {isTesting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              Testar Agora
                            </Button>
                          )}
                          
                          {integration.configLink && (
                            <Button
                              onClick={() => window.open(integration.configLink, '_blank')}
                              variant="ghost"
                              size="sm"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Configurar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Dica</AlertTitle>
            <AlertDescription>
              Esta página atualiza automaticamente a cada 60 segundos. Você também pode clicar em "Atualizar Tudo" para verificar manualmente.
            </AlertDescription>
          </Alert>
        </div>
      </main>

      <Footer />
    </div>
  );
}
