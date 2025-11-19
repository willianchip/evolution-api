import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Menu, Zap, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import DigitalClock from '@/components/DigitalClock';
import MatrixToggle from '@/components/MatrixToggle';
import PerformanceMonitor from '@/components/PerformanceMonitor';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { connections, connectionsLoading } = useWhatsApp();
  const { planName, hasActiveSubscription } = useSubscription();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const isConnected = connections?.some(conn => conn.status === 'connected' || conn.status === 'open');

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!data);
    };
    
    checkAdmin();
  }, [user?.id]);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <MessageCircle className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold cyber-glow-green">IA Avançada</span>
        </Link>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && (
            <div className="relative flex items-center gap-2">
              <div className="relative w-2 h-2">
                <div className={`absolute inset-0 rounded-full ${isConnected ? 'bg-[#39ff14] animate-pulse-green' : 'bg-red-500'}`}></div>
                {isConnected && <div className="absolute inset-0 rounded-full bg-[#39ff14] animate-ping"></div>}
              </div>
              <span className={`text-xs font-mono ${isConnected ? 'text-[#39ff14]' : 'text-red-500'}`}>
                {connectionsLoading ? 'Verificando...' : isConnected ? 'WhatsApp Online' : 'WhatsApp Offline'}
              </span>
            </div>
          )}
          
          <PerformanceMonitor />
          <MatrixToggle />
          <DigitalClock />
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              <Link to="/whatsapp" className="text-sm font-medium transition-colors hover:text-primary">
                WhatsApp
              </Link>
              <Link to="/automations" className="text-sm font-medium transition-colors hover:text-primary">
                Automações
              </Link>
              <Link to="/chat-ia" className="text-sm font-medium transition-colors hover:text-primary">
                Chat IA
              </Link>
              <Link to="/settings" className="text-sm font-medium transition-colors hover:text-primary">
                Configurações
              </Link>
              <Link to="/test-webhook" className="text-sm font-medium transition-colors hover:text-primary">
                🧪 Testes
              </Link>
              
              {/* Admin Links */}
              {isAdmin && (
                <Link 
                  to="/admin/integrations" 
                  className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
                >
                  <Settings2 className="h-3 w-3" />
                  Integrações
                </Link>
              )}
              
              {/* Badge do Plano Atual */}
              <Badge 
                variant={hasActiveSubscription ? "default" : "outline"}
                className="capitalize cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate("/pricing")}
              >
                <Zap className="h-3 w-3 mr-1" />
                {planName}
              </Badge>
              
              <Button onClick={logout} variant="destructive">
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate("/pricing")}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 cyber-border"
              >
                <Zap className="h-4 w-4 mr-2" />
                Ver Planos
              </Button>
              <Link to="/login">
                <Button variant="outline" className="cyber-border">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Cadastrar
                </Button>
              </Link>
            </>
          )}
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
