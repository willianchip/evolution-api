import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';
import { WelcomeStep } from './wizard/WelcomeStep';
import { TestAPIStep } from './wizard/TestAPIStep';
import { CreateInstanceStep } from './wizard/CreateInstanceStep';
import { ScanQRCodeStep } from './wizard/ScanQRCodeStep';
import { SuccessStep } from './wizard/SuccessStep';

interface WhatsAppWizardProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS = [
  { id: 'welcome', title: 'Bem-vindo' },
  { id: 'test-api', title: 'Testar API' },
  { id: 'create-instance', title: 'Criar Instância' },
  { id: 'scan-qrcode', title: 'Conectar' },
  { id: 'success', title: 'Concluído' },
];

export function WhatsAppWizard({ open, onComplete, onSkip }: WhatsAppWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiTestPassed, setApiTestPassed] = useState(false);
  const [instanceName, setInstanceName] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('whatsapp_onboarding_completed', 'true');
    onComplete();
  };

  // Simulate QR code generation after instance creation
  useEffect(() => {
    if (currentStep === 3 && instanceName) {
      setTimeout(() => {
        setQrCode('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==');
      }, 2000);
    }
  }, [currentStep, instanceName]);

  // Simulate connection after 5 seconds on QR code step
  useEffect(() => {
    if (currentStep === 3 && qrCode) {
      const timer = setTimeout(() => {
        setIsConnected(true);
        setCurrentStep(4);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, qrCode]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <TestAPIStep onTestComplete={setApiTestPassed} />;
      case 2:
        return <CreateInstanceStep onInstanceCreated={setInstanceName} />;
      case 3:
        return <ScanQRCodeStep instanceName={instanceName} qrCode={qrCode} />;
      case 4:
        return <SuccessStep instanceName={instanceName} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return apiTestPassed;
      case 2:
        return !!instanceName;
      case 3:
        return isConnected;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-4xl h-[90vh] p-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              Configuração do WhatsApp
            </h3>
            <p className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onSkip}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-6">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{renderStep()}</div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Voltar
          </Button>

          <div className="flex gap-2">
            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {currentStep === 3 && !isConnected ? 'Aguardando conexão...' : 'Próximo'}
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Concluir
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
