import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, ArrowLeft } from 'lucide-react';
import CyberneticBackground from '@/components/CyberneticBackground';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { emailSchema } from '@/lib/authValidation';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar email
      const validation = emailSchema.safeParse(email);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      // Usar Supabase Auth nativo para resetar senha
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      toast({
        title: 'Email enviado com sucesso!',
        description: 'Verifique sua caixa de entrada e spam. O link expira em 1 hora.',
      });
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
          Esqueceu a Senha?
        </h1>
        <p className="text-muted-foreground mb-6 text-center">
          Digite seu email para receber instruções
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </Button>

            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Login
            </Link>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-green-500 font-medium">
              ✓ Email de recuperação enviado!
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Voltar ao Login
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
