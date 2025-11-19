import { Link } from 'react-router-dom';
import { MessageCircle, Shield, Zap, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MatrixRain from '@/components/MatrixRain';
import CyberneticBackground from '@/components/CyberneticBackground';
import ScanLine from '@/components/ScanLine';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useVisualEffects } from '@/hooks/useVisualEffects';
import VHSEffect from '@/components/VHSEffect';

const Landing = () => {
  const { 
    matrixRainEnabled, 
    scanLineEnabled, 
    particlesEnabled,
    matrixIntensity,
    vhsEnabled,
    vhsScanlines,
    vhsNoise,
    vhsCurvature,
    vhsChromatic,
  } = useVisualEffects();

  return (
    <div className="min-h-screen">
      {matrixRainEnabled && <MatrixRain intensity={matrixIntensity} />}
      {particlesEnabled && <CyberneticBackground />}
      {scanLineEnabled && <ScanLine interval={10000} duration={2500} opacity={0.35} height={2} />}
      {vhsEnabled && (
        <VHSEffect
          scanlines={vhsScanlines}
          noise={vhsNoise}
          curvature={vhsCurvature}
          chromatic={vhsChromatic}
        />
      )}
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h1 
            className="text-5xl md:text-7xl font-bold mb-6 cyber-glow-green cyber-glitch-intense"
            data-text="IA Avançada"
          >
            IA Avançada
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            IA GENERATIVA + Gestão Whats = Transformação real
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8">
                Comece Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="cyber-border text-lg px-8">
                Saiba Mais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12 cyber-glow-green">
          Recursos Revolucionários
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: MessageCircle, title: 'IA Avançada', desc: 'Assistente virtual inteligente 24/7' },
            { icon: Shield, title: 'Segurança Total', desc: 'Criptografia e privacidade garantidas' },
            { icon: Zap, title: 'Real-Time', desc: 'Respostas instantâneas e precisas' },
            { icon: Users, title: 'Profissionais', desc: 'Conexão com psicólogos certificados' },
          ].map((feature, idx) => (
            <Card 
              key={idx} 
              className="cyber-card p-6 matrix-card-hover matrix-glow-shadow relative"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
              }}
            >
              <feature.icon className="h-12 w-12 text-primary mb-4 matrix-icon-pulse relative z-10" />
              <h3 className="text-xl font-bold mb-2 relative z-10">{feature.title}</h3>
              <p className="text-muted-foreground relative z-10">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 cyber-glow-green">
            Por Que Escolher IA Avançada?
          </h2>
          <div className="space-y-4">
            {[
              'Acesso 24/7 ao assistente virtual de saúde mental',
              'Triagem inteligente e encaminhamento personalizado',
              'Monitoramento contínuo do seu bem-estar emocional',
              'Conexão direta com profissionais qualificados',
              'Ferramentas de autoconhecimento e mindfulness',
              'Acompanhamento de evolução com IA',
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="cyber-card p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 cyber-glow-green">
            Pronto Para Transformar Sua Saúde Mental?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se a milhares de usuários que já estão vivendo melhor
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-12">
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
