import { useState } from 'react';
import { Shield, Loader2, QrCode } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const TwoFactorAuth = () => {
  const [showSetup, setShowSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Query para buscar o status 2FA
  const { data: twoFaStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ['user-2fa-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return { enabled: false };
      const { data, error } = await supabase
        .from('user_2fa')
        .select('enabled')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return { enabled: data?.enabled || false };
    },
    enabled: !!user?.id,
  });

  const is2FAEnabled = twoFaStatus?.enabled || false;

  const handleEnable2FA = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('enable-2fa', {
        body: { action: 'enable' },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;

      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
      setShowSetup(true);

      toast({
        title: '2FA Iniciado',
        description: 'Escaneie o QR Code com seu app autenticador',
      });
    } catch (error) {
      console.error('2FA enable error:', error);
      toast({
        title: 'Erro ao habilitar 2FA',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.functions.invoke('enable-2fa', {
        body: { action: 'verify', token: verificationCode },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;

      setShowSetup(false);
      setVerificationCode('');
      queryClient.invalidateQueries({ queryKey: ['user-2fa-status'] }); // Atualiza o status

      toast({
        title: '2FA Habilitado!',
        description: 'Autenticação de dois fatores está ativa',
      });
    } catch (error) {
      console.error('2FA verify error:', error);
      toast({
        title: 'Erro ao verificar código',
        description: 'Código inválido. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.functions.invoke('enable-2fa', {
        body: { action: 'disable' },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['user-2fa-status'] }); // Atualiza o status

      toast({
        title: '2FA Desabilitado',
        description: 'Autenticação de dois fatores foi desativada',
      });
    } catch (error) {
      console.error('2FA disable error:', error);
      toast({
        title: 'Erro ao desabilitar 2FA',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">Autenticação de Dois Fatores (2FA)</p>
            <p className="text-sm text-muted-foreground">
              {isStatusLoading ? 'Carregando...' : is2FAEnabled ? 'Ativa' : 'Inativa'}
            </p>
          </div>
        </div>

        {isStatusLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : is2FAEnabled ? (
          <Button
            variant="destructive"
            onClick={handleDisable2FA}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Desabilitar'}
          </Button>
        ) : (
          <Button onClick={handleEnable2FA} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Habilitar'}
          </Button>
        )}
      </Card>

      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Autenticação 2FA</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code com um app autenticador (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {qrCodeUrl && (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                    alt="QR Code 2FA"
                    className="w-48 h-48"
                  />
                </div>

                <div className="w-full">
                  <Label>Ou insira manualmente o código:</Label>
                  <Input
                    value={secret}
                    readOnly
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="verification">Código de Verificação</Label>
              <Input
                id="verification"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <Button
              onClick={handleVerify2FA}
              disabled={loading || verificationCode.length !== 6}
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar e Ativar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};