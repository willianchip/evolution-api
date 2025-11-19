import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Plus, Smartphone, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import tutorialStep1 from '@/assets/tutorial/step1-test-connection.png';
import tutorialStep2 from '@/assets/tutorial/step2-create-instance.png';
import tutorialStep3 from '@/assets/tutorial/step3-scan-qrcode.png';
import tutorialStep4 from '@/assets/tutorial/step4-connected.png';

interface TutorialStep {
  title: string;
  description: string;
  image: string;
  icon: typeof CheckCircle;
}

const steps: TutorialStep[] = [
  {
    title: '1. Teste a Conexão',
    description: 'Primeiro, verifique se sua Evolution API está configurada corretamente clicando no botão "Testar Conexão".',
    image: tutorialStep1,
    icon: CheckCircle,
  },
  {
    title: '2. Crie uma Instância',
    description: 'Digite um nome único para sua instância do WhatsApp e clique em "Criar Instância".',
    image: tutorialStep2,
    icon: Plus,
  },
  {
    title: '3. Escaneie o QR Code',
    description: 'Abra o WhatsApp no seu celular, vá em Dispositivos Conectados → Conectar Dispositivo e escaneie o QR Code.',
    image: tutorialStep3,
    icon: Smartphone,
  },
  {
    title: '4. Pronto!',
    description: 'Aguarde a conexão ser estabelecida. Você receberá uma notificação quando estiver conectado.',
    image: tutorialStep4,
    icon: CheckCircle2,
  },
];

interface WhatsAppTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsAppTutorial({ open, onOpenChange }: WhatsAppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('whatsapp_tutorial_hidden', 'true');
    }
    onOpenChange(false);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Smartphone className="w-6 h-6 text-primary" />
            Como Conectar seu WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image */}
          <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={currentStepData.image}
              alt={currentStepData.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Step Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
            </div>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-primary w-8'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Checkbox
                id="dont-show"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              />
              <label
                htmlFor="dont-show"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Não mostrar novamente
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button onClick={handleClose}>Começar</Button>
              ) : (
                <Button onClick={handleNext}>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
