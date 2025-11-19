import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import CyberneticBackground from '@/components/CyberneticBackground';
import { SocialLoginButtons } from '@/components/SocialLoginButtons';
import TwoFactorDialog from '@/components/TwoFactorDialog';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [userId, setUserId] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      
      // Check if user has 2FA enabled
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão não encontrada');

      const { data: user2FA, error: twoFAError } = await supabase
        .from('user_2fa')
        .select('enabled')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (twoFAError) {
        console.error('Error checking 2FA:', twoFAError);
      }

      if (user2FA?.enabled) {
        // User has 2FA enabled, show dialog
        setUserId(session.user.id);
        setShow2FADialog(true);
      } else {
        // No 2FA, proceed to dashboard
        navigate('/dashboard');
      }
    } catch (error: any) {
      const errorCode = error.code;
      let description = error.message;
      let action = null;

      if (errorCode === 'USER_NOT_FOUND') {
        description = (
          <div className="space-y-2">
            <p>Usuário não encontrado.</p>
            <Button
              variant="link"
              className="h-auto p-0 text-primary"
              onClick={() => navigate('/register')}
            >
              Criar uma conta →
            </Button>
          </div>
        );
      } else if (errorCode === 'INVALID_PASSWORD') {
        description = (
          <div className="space-y-2">
            <p>Senha incorreta.</p>
            <Button
              variant="link"
              className="h-auto p-0 text-primary"
              onClick={() => navigate('/forgot-password')}
            >
              Esqueceu sua senha? →
            </Button>
          </div>
        );
      } else if (errorCode === 'EMAIL_NOT_VERIFIED') {
        description = 'Email não verificado. Verifique sua caixa de entrada.';
      }

      toast({
        title: 'Erro ao fazer login',
        description,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handle2FASuccess = () => {
    setShow2FADialog(false);
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <CyberneticBackground />
      
      <Card className="cyber-card w-full max-w-md p-8 animate-fade-in-up">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold cyber-glow">Bem-vindo de Volta</h1>
          <p className="text-muted-foreground mt-2">Entre na Gestão de WhatsApp</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="cyber-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="cyber-border"
            />
            <div className="flex items-center justify-end mt-1">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <SocialLoginButtons />

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
          <p className="text-muted-foreground mt-2">
            Ou{' '}
            <Link to="/create-test-user" className="text-primary hover:underline">
              crie um usuário de teste
            </Link>
          </p>
        </div>
      </Card>

      <TwoFactorDialog
        open={show2FADialog}
        onClose={() => setShow2FADialog(false)}
        onSuccess={handle2FASuccess}
        userId={userId}
      />
    </div>
  );
};

export default Login;
