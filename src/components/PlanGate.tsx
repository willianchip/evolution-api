import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlanGateProps {
  requiredPlan: 'starter' | 'professional' | 'enterprise';
  children: React.ReactNode;
  feature: string;
  description?: string;
}

export const PlanGate = ({ requiredPlan, children, feature, description }: PlanGateProps) => {
  const { planName, hasActiveSubscription } = useSubscription();
  const navigate = useNavigate();

  const planHierarchy = { 
    free: 0, 
    starter: 1, 
    professional: 2, 
    enterprise: 3 
  };

  const currentPlanLevel = planHierarchy[planName as keyof typeof planHierarchy] || 0;
  const requiredPlanLevel = planHierarchy[requiredPlan];

  const hasAccess = hasActiveSubscription && currentPlanLevel >= requiredPlanLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <Card className="cyber-card p-8 text-center bg-background/50 backdrop-blur-sm">
      <div className="flex justify-center mb-4">
        <div className="p-4 rounded-full bg-primary/10">
          <Lock className="h-12 w-12 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Recurso Bloqueado</h2>
      
      <p className="text-muted-foreground mb-2">
        <strong>{feature}</strong> está disponível no plano{' '}
        <span className="text-primary font-bold capitalize">{requiredPlan}</span> ou superior.
      </p>
      
      {description && (
        <p className="text-sm text-muted-foreground/80 mb-6">
          {description}
        </p>
      )}

      {!hasActiveSubscription && (
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Você está no plano <strong>Free</strong>. Faça upgrade para desbloquear recursos avançados!
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Button
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          onClick={() => navigate('/pricing')}
        >
          Ver Planos
        </Button>
        
        {hasActiveSubscription && (
          <Button
            variant="outline"
            onClick={() => navigate('/settings')}
          >
            Gerenciar Assinatura
          </Button>
        )}
      </div>
    </Card>
  );
};
