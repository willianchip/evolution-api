import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TwoFactorDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const TwoFactorDialog = ({ open, onClose, onSuccess, userId }: TwoFactorDialogProps) => {
  const [code, setCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite o código de verificação',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa-login', {
        body: { 
          userId,
          code: code.trim(),
          isBackupCode,
        },
      });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: '2FA verificado',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Código inválido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verificação de Dois Fatores
          </DialogTitle>
          <DialogDescription>
            Digite o código do seu app autenticador ou use um código de backup
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              Abra seu app autenticador (Google Authenticator, Authy, etc.) e digite o código de 6 dígitos.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="2fa-code">
              {isBackupCode ? 'Código de Backup' : 'Código de Verificação'}
            </Label>
            <Input
              id="2fa-code"
              placeholder={isBackupCode ? 'XXXXXXXX' : '000000'}
              maxLength={isBackupCode ? 8 : 6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && code.length === (isBackupCode ? 8 : 6)) {
                  handleVerify();
                }
              }}
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== (isBackupCode ? 8 : 6)}
            className="w-full"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsBackupCode(!isBackupCode);
              setCode('');
            }}
            className="w-full"
          >
            <Key className="h-4 w-4 mr-2" />
            {isBackupCode ? 'Usar código do app' : 'Usar código de backup'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorDialog;
