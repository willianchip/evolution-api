import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

interface WhatsAppQRCodeProps {
  qrCode: string | null;
  instanceName: string;
  status: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const WhatsAppQRCode = ({ 
  qrCode, 
  instanceName, 
  status,
  onRefresh,
  isRefreshing = false,
}: WhatsAppQRCodeProps) => {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (status !== 'connected' && qrCode) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            onRefresh();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, qrCode, onRefresh]);

  if (status === 'connected') {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardHeader>
          <CardTitle className="text-success">Conectado!</CardTitle>
          <CardDescription>
            Instância <span className="font-mono">{instanceName}</span> está conectada ao WhatsApp.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conectar WhatsApp</CardTitle>
        <CardDescription>
          Escaneie o QR Code com o WhatsApp do seu celular
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {isRefreshing ? (
          <div className="flex items-center justify-center w-64 h-64 bg-muted rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : qrCode ? (
          <>
            <img
              src={qrCode.startsWith('data:image') ? qrCode : `data:image/png;base64,${qrCode}`}
              alt="WhatsApp QR Code"
              className="w-64 h-64 border-2 border-border rounded-lg"
            />
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                QR Code expira em <span className="font-semibold text-foreground">{countdown}s</span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar QR Code
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-64 h-64 bg-muted rounded-lg">
            <p className="text-muted-foreground">Gerando QR Code...</p>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center max-w-md">
          <p>1. Abra o WhatsApp no seu celular</p>
          <p>2. Toque em <span className="font-semibold">Configurações → Aparelhos conectados</span></p>
          <p>3. Toque em <span className="font-semibold">Conectar um aparelho</span></p>
          <p>4. Aponte seu celular para esta tela para capturar o código</p>
        </div>
      </CardContent>
    </Card>
  );
};