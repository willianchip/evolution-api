import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus, Copy, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CyberneticBackground from '@/components/CyberneticBackground';
import { Link } from 'react-router-dom';

export default function CreateTestUser() {
  const [email, setEmail] = useState('teste@exemplo.com');
  const [password, setPassword] = useState('teste123');
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);
  const { toast } = useToast();

  const handleCreate = async () => {
    setLoading(true);
    setCreatedUser(null);

    try {
      // Tentar criar usuário via Edge Function
      const { data, error } = await supabase.functions.invoke('create-test-user', {
        body: { email, password }
      });

      if (error) {
        console.error('Erro na Edge Function create-test-user:', error);
        
        // Se falhar, usar método alternativo via registro padrão
        toast({
          title: 'ℹ️ Usando método alternativo',
          description: 'Criando usuário via sistema de registro...',
        });
        
        try {
          const { data: registerData, error: registerError } = await supabase.functions.invoke('auth-register', {
            body: { 
              email, 
              password,
              deviceFingerprint: 'test-device',
              geolocation: { country: 'BR' }
            }
          });

          if (registerError) throw registerError;

          // Sucesso com método alternativo
          setCreatedUser({
            message: 'Usuário criado com sucesso via método alternativo!',
            user: { email, password, note: 'Use estas credenciais para fazer login' }
          });
          
          toast({
            title: '✅ Usuário criado!',
            description: 'Usuário criado com sucesso. Você pode fazer login agora.',
          });
          return;
        } catch (altError) {
          console.error('Erro no método alternativo:', altError);
          throw new Error('Não foi possível criar o usuário. Verifique se o email já existe ou tente outro.');
        }
      }

      setCreatedUser(data);
      toast({
        title: '✅ Usuário criado!',
        description: data.message,
      });
    } catch (error) {
      console.error('Error creating test user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao criar usuário',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '📋 Copiado!',
      description: 'Texto copiado para área de transferência',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CyberneticBackground />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              🧪 Criar Usuário de Teste
            </h1>
            <p className="text-muted-foreground">
              Crie rapidamente um usuário para testar o sistema
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Usuário</CardTitle>
                <CardDescription>
                  O usuário será criado com email já verificado para testes imediatos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teste@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="teste123"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo 8 caracteres
                  </p>
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={loading || !email || !password || password.length < 8}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="w-5 h-5 mr-2" />
                  )}
                  Criar Usuário de Teste
                </Button>
              </CardContent>
            </Card>

            {createdUser && createdUser.user && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Usuário Criado com Sucesso!
                  </CardTitle>
                  <CardDescription>
                    Use estas credenciais para fazer login
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-lg font-mono">{createdUser.user?.email || email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(createdUser.user?.email || email)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Senha</p>
                        <p className="text-lg font-mono">{createdUser.user?.password || password}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(createdUser.user?.password || password)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Button asChild className="w-full" variant="default">
                    <Link to="/login">
                      Ir para Login
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Informações Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✅ O usuário será criado com email <strong>já verificado</strong></p>
                <p>✅ Pode fazer login imediatamente após a criação</p>
                <p>✅ Se o usuário já existir, apenas marcará o email como verificado</p>
                <p>🔄 Usa método alternativo automaticamente se necessário</p>
                <p>⚠️ Use apenas para testes em desenvolvimento</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
