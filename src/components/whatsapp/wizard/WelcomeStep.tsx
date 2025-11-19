import { Smartphone, Zap, Shield, MessageSquare } from 'lucide-react';

export function WelcomeStep() {
  return (
    <div className="space-y-6 text-center">
      <div className="inline-flex p-4 bg-primary/10 rounded-full">
        <Smartphone className="w-12 h-12 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Bem-vindo ao WhatsApp</h2>
        <p className="text-muted-foreground text-lg">
          Configure sua primeira conexão em poucos passos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
        <div className="p-4 bg-card rounded-lg border space-y-2">
          <div className="inline-flex p-2 bg-primary/10 rounded-lg">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">Rápido</h3>
          <p className="text-sm text-muted-foreground">
            Configure em menos de 5 minutos
          </p>
        </div>

        <div className="p-4 bg-card rounded-lg border space-y-2">
          <div className="inline-flex p-2 bg-primary/10 rounded-lg">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">Seguro</h3>
          <p className="text-sm text-muted-foreground">
            Suas conversas protegidas com criptografia
          </p>
        </div>

        <div className="p-4 bg-card rounded-lg border space-y-2">
          <div className="inline-flex p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">Completo</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie múltiplas instâncias
          </p>
        </div>
      </div>
    </div>
  );
}
