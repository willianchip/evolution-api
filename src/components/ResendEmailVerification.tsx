import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ResendEmailVerificationProps {
  email: string;
}

const ResendEmailVerification = ({ email }: ResendEmailVerificationProps) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (cooldown > 0) {
      toast({
        title: 'Aguarde',
        description: `Você pode reenviar o email em ${cooldown} segundos`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Usar método nativo do Supabase para reenviar email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      setSent(true);
      setCooldown(60); // 60 segundos de cooldown

      // Countdown timer
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada e spam',
      });

      // Reset sent status após 5 segundos
      setTimeout(() => setSent(false), 5000);
    } catch (error: any) {
      console.error('Resend email error:', error);
      
      let errorMessage = 'Erro ao reenviar email';
      
      if (error.message?.includes('rate limit')) {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos.';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Email não encontrado. Verifique se está correto.';
      }

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-4 p-4 border border-border rounded-lg bg-muted/30">
      <p className="text-sm text-muted-foreground text-center">
        Não recebeu o email de confirmação?
      </p>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={loading || cooldown > 0}
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : sent ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Email Enviado!
          </>
        ) : cooldown > 0 ? (
          <>
            <Mail className="h-4 w-4" />
            Aguarde {cooldown}s
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Reenviar Email
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Verifique também sua pasta de <strong>spam</strong>
      </p>
    </div>
  );
};

export default ResendEmailVerification;
