import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Rocket, Shield, Clock, Headphones } from 'lucide-react';
import CyberneticBackground from '@/components/CyberneticBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      icon: Zap,
      price: 'R$ 97',
      period: '/mês',
      description: 'Ideal para pequenos negócios e testes',
      // SUBSTITUA PELO SEU LINK REAL DA KIWIFY
      checkoutUrl: 'https://pay.kiwify.com.br/SEU-PRODUTO-ID-STARTER',
      features: [
        '1 conexão WhatsApp',
        '1.000 mensagens/mês',
        'Chatbot IA básico (Gemini)',
        'Automações simples',
        'Suporte por email',
        'Backup semanal',
      ],
      color: 'text-blue-500',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Crown,
      price: 'R$ 297',
      period: '/mês',
      description: 'Para empresas em crescimento',
      // SUBSTITUA PELO SEU LINK REAL DA KIWIFY
      checkoutUrl: 'https://pay.kiwify.com.br/SEU-PRODUTO-ID-PROFESSIONAL',
      features: [
        '5 conexões WhatsApp',
        '10.000 mensagens/mês',
        'IA avançada + treinamento customizado',
        'Automações ilimitadas',
        'Multi-plataforma (Telegram, Instagram, Facebook)',
        'Analytics avançado',
        'Prioridade no suporte',
        'Backup diário',
      ],
      color: 'text-purple-500',
      gradient: 'from-purple-500 to-pink-500',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Rocket,
      price: 'R$ 397',
      period: '/mês',
      description: 'Solução completa para grandes empresas',
      // SUBSTITUA PELO SEU LINK REAL DA KIWIFY
      checkoutUrl: 'https://pay.kiwify.com.br/SEU-PRODUTO-ID-ENTERPRISE',
      features: [
        'Conexões ilimitadas',
        'Mensagens ilimitadas',
        'IA ultra customizada + treinamento dedicado',
        'Todas as integrações',
        'Analytics premium + relatórios personalizados',
        'Suporte 24/7 prioritário',
        'Backup em tempo real',
      ],
      color: 'text-orange-500',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const handleCheckout = (plan: typeof plans[0]) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Adicionar email do usuário como query param
    const checkoutUrl = `${plan.checkoutUrl}?email=${encodeURIComponent(user.email || '')}`;
    window.open(checkoutUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <CyberneticBackground />
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-bold cyber-glow mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Potencialize seu atendimento com IA avançada e automação multi-plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`cyber-card relative transition-all hover:scale-105 ${
                plan.popular ? 'border-primary border-2 shadow-lg shadow-primary/20' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-secondary">
                  MAIS POPULAR
                </Badge>
              )}
              
              <CardHeader>
                <plan.icon className={`h-12 w-12 ${plan.color} mb-4`} />
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <Button
                  className={`w-full mb-6 bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-opacity`}
                  onClick={() => handleCheckout(plan)}
                >
                  Assinar Agora
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefícios Section */}
        <div className="mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Por que escolher nossa plataforma?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cyber-card p-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Segurança Total</h3>
              <p className="text-sm text-muted-foreground">
                Dados criptografados e backups automáticos para total tranquilidade
              </p>
            </Card>
            <Card className="cyber-card p-6 text-center">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Economia de Tempo</h3>
              <p className="text-sm text-muted-foreground">
                Automatize 80% do atendimento e foque no que realmente importa
              </p>
            </Card>
            <Card className="cyber-card p-6 text-center">
              <Headphones className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Suporte Dedicado</h3>
              <p className="text-sm text-muted-foreground">
                Equipe especializada pronta para ajudar você a crescer
              </p>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <Card className="cyber-card p-6">
              <h3 className="font-bold mb-2">💳 Quais formas de pagamento são aceitas?</h3>
              <p className="text-muted-foreground">
                Aceitamos cartão de crédito, PIX e Boleto através da plataforma Kiwify (segura e confiável).
              </p>
            </Card>
            <Card className="cyber-card p-6">
              <h3 className="font-bold mb-2">🔄 Posso cancelar a qualquer momento?</h3>
              <p className="text-muted-foreground">
                Sim! Sem taxas de cancelamento. Você pode gerenciar sua assinatura diretamente na plataforma Kiwify.
              </p>
            </Card>
            <Card className="cyber-card p-6">
              <h3 className="font-bold mb-2">📊 Como funciona o limite de mensagens?</h3>
              <p className="text-muted-foreground">
                Mensagens enviadas e recebidas são contabilizadas. Ao atingir o limite, você pode fazer upgrade facilmente.
              </p>
            </Card>
            <Card className="cyber-card p-6">
              <h3 className="font-bold mb-2">🎯 Posso mudar de plano depois?</h3>
              <p className="text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade a qualquer momento. As mudanças são aplicadas no próximo ciclo.
              </p>
            </Card>
            <Card className="cyber-card p-6">
              <h3 className="font-bold mb-2">⚡ Como funciona a ativação?</h3>
              <p className="text-muted-foreground">
                Após a aprovação do pagamento, sua conta é ativada automaticamente em poucos minutos.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
