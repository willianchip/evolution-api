import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { generateDeviceFingerprint, getGeolocation } from '@/lib/deviceFingerprint';
import { toast } from '@/hooks/use-toast';
import CyberneticBackground from '@/components/CyberneticBackground';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { isPasswordStrong } from '@/lib/passwordValidation';
import { SocialLoginButtons } from '@/components/SocialLoginButtons';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
      return;
    }

    if (!isPasswordStrong(password)) {
      toast({
        title: 'Senha Fraca',
        description: 'Por favor, crie uma senha mais forte seguindo os requisitos abaixo',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const deviceFingerprint = generateDeviceFingerprint();
      const geolocation = await getGeolocation().catch(() => null);

      console.log('[Register] Attempting registration for:', email);
      await register(email, password, deviceFingerprint, geolocation);
      
      toast({
        title: '✅ Conta Criada com Sucesso!',
        description: 'Enviamos um email de confirmação. Verifique sua caixa de entrada e spam.',
        duration: 6000,
      });
      
      // Redirecionar para página de verificação com email como parâmetro
      navigate(`/verify-email?email=${encodeURIComponent(email)}&pending=true`);
    } catch (error: any) {
      console.error('[Register] Registration error:', error);
      
      toast({
        title: 'Erro ao Criar Conta',
        description: error.message || 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <CyberneticBackground />
      
      <Card className="cyber-card w-full max-w-md p-8 animate-fade-in-up">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold cyber-glow">Criar Conta</h1>
          <p className="text-muted-foreground mt-2">Junte-se à Gestão de WhatsApp</p>
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
              minLength={8}
              className="cyber-border"
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="cyber-border"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        <SocialLoginButtons />

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
