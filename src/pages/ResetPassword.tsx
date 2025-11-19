import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain } from 'lucide-react';
import CyberneticBackground from '@/components/CyberneticBackground';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { resetPasswordSchema } from '@/lib/authValidation';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar senhas usando Zod
      const validation = resetPasswordSchema.safeParse({
        password,
        confirmPassword,
      });

      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      // Usar Supabase Auth nativo para atualizar senha
      // O token já está validado pela URL do Supabase
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Senha redefinida com sucesso',
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <CyberneticBackground />
      
      <Card className="cyber-card p-8 w-full max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <Brain className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 cyber-glow text-center">
          Redefinir Senha
        </h1>
        <p className="text-muted-foreground mb-6 text-center">
          Digite sua nova senha
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Nova Senha</Label>
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

          <div>
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
            className="w-full bg-gradient-to-r from-primary to-secondary"
            disabled={loading}
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
