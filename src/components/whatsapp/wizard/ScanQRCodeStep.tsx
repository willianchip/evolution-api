import { useEffect, useState } from 'react';
import { Smartphone, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScanQRCodeStepProps {
  instanceName: string;
  qrCode: string | null;
}

export function ScanQRCodeStep({ instanceName, qrCode }: ScanQRCodeStepProps) {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!qrCode) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrCode]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Conectar WhatsApp</h2>
        <p className="text-muted-foreground">
          Escaneie o QR Code para conectar a instância "{instanceName}"
        </p>
      </div>

      <div className="flex justify-center py-8">
        {qrCode ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              QR Code expira em {countdown}s
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Gerando QR Code...</p>
          </div>
        )}
      </div>

      <Alert>
        <Smartphone className="w-4 h-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Como escanear:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Abra o WhatsApp no seu celular</li>
              <li>Toque em Mais opções → Dispositivos conectados</li>
              <li>Toque em Conectar dispositivo</li>
              <li>Aponte seu celular para esta tela para escanear o QR Code</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
