import { CheckCircle2, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface SuccessStepProps {
  instanceName: string;
}

export function SuccessStep({ instanceName }: SuccessStepProps) {
  useEffect(() => {
    // Confetti animation
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B5CF6', '#10B981', '#3B82F6'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B5CF6', '#10B981', '#3B82F6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="space-y-6 text-center">
      <div className="inline-flex p-4 bg-green-500/10 rounded-full animate-pulse">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold">🎉 Tudo Pronto!</h2>
        <p className="text-muted-foreground text-lg">
          Sua instância "{instanceName}" foi conectada com sucesso
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-1" />
          <div className="text-left space-y-2">
            <p className="font-medium">O que fazer agora:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✅ Sua conexão está ativa e pronta para uso</li>
              <li>✅ Você receberá notificações de novas mensagens</li>
              <li>✅ Explore as conversas na aba Conversas</li>
              <li>✅ Configure automações e respostas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
