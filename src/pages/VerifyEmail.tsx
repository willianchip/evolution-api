import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import CyberneticBackground from '@/components/CyberneticBackground';
import { supabase } from '@/integrations/supabase/client';
import ResendEmailVerification from '@/components/ResendEmailVerification';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  
  // Capturar email da URL para permitir reenvio
  const email = searchParams.get('email') || '';
  const isPending = searchParams.get('pending') === 'true';

  useEffect(() => {
    // Se é uma página de "aguardando confirmação"
    if (isPending) {
      setStatus('pending');
      setMessage('Aguardando confirmação de email');
      return;
    }

    const verifyToken = async () => {
      // Supabase Auth usa tokens OTP ou hash tokens
      const token = searchParams.get('token');
      const type = searchParams.get('type') as 'email' | null;
      
      if (!token) {
        setStatus('error');
        setMessage('Token de verificação não encontrado na URL');
        return;
      }

      try {
        console.log('[VerifyEmail] Verifying token...');
        
        // Verificar email usando Supabase Auth
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type || 'email',
        });

        if (error) {
          console.error('[VerifyEmail] Verification error:', error);
          throw error;
        }

        console.log('[VerifyEmail] Email verified successfully');
        setStatus('success');
        setMessage('Email verificado com sucesso!');
      } catch (error: any) {
        console.error('[VerifyEmail] Error:', error);
        
        let errorMsg = 'Erro ao verificar email';
        
        if (error.message?.includes('expired')) {
          errorMsg = 'Link expirado. Solicite um novo email de verificação.';
        } else if (error.message?.includes('invalid')) {
          errorMsg = 'Link inválido. Verifique se copiou corretamente ou solicite um novo.';
        }
        
        setStatus('error');
        setMessage(errorMsg);
      }
    };

    verifyToken();
  }, [searchParams, isPending]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <CyberneticBackground />
      
      <Card className="cyber-card p-8 w-full max-w-md text-center relative z-10">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verificando email...</h1>
            <p className="text-muted-foreground">Aguarde um momento</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 cyber-glow">Email Verificado!</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              Fazer Login
            </Button>
          </>
        )}

        {status === 'pending' && (
          <>
            <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 cyber-glow">Email Enviado! 📧</h1>
            <p className="text-muted-foreground mb-4">
              Enviamos um email de confirmação para:
            </p>
            <p className="text-primary font-semibold mb-6">{email}</p>
            <div className="space-y-4 w-full">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground text-left">
                  📋 <strong>Próximos passos:</strong>
                </p>
                <ol className="text-sm text-muted-foreground mt-2 space-y-1 text-left list-decimal list-inside">
                  <li>Abra seu email</li>
                  <li>Procure por email do "Gestão WhatsApp"</li>
                  <li>Clique no link de confirmação</li>
                  <li>Faça login na plataforma</li>
                </ol>
              </div>
              
              {email && <ResendEmailVerification email={email} />}
              
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full"
              >
                Ir para Login
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Erro na Verificação</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            
            {email && <ResendEmailVerification email={email} />}
            
            <div className="flex gap-2 w-full mt-4">
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                className="flex-1"
              >
                Novo Cadastro
              </Button>
              <Button
                onClick={() => navigate('/login')}
                className="flex-1"
              >
                Fazer Login
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmail;
