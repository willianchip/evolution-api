import { Eye, EyeOff, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useVisualEffects } from '@/hooks/useVisualEffects';
import { toast } from 'sonner';

const MatrixToggle = () => {
  const {
    matrixRainEnabled,
    scanLineEnabled,
    particlesEnabled,
    matrixIntensity,
    toggleMatrixRain,
    toggleScanLine,
    toggleParticles,
    setMatrixIntensity,
    resetToDefaults,
  } = useVisualEffects();

  const handleToggleMatrixRain = () => {
    toggleMatrixRain();
    toast.success(
      matrixRainEnabled ? 'Matrix Rain desativado' : 'Matrix Rain ativado',
      { className: 'cyber-toast' }
    );
  };

  const handleToggleScanLine = () => {
    toggleScanLine();
    toast.success(
      scanLineEnabled ? 'Scan Line desativado' : 'Scan Line ativado',
      { className: 'cyber-toast' }
    );
  };

  const handleToggleParticles = () => {
    toggleParticles();
    toast.success(
      particlesEnabled ? 'Partículas desativadas' : 'Partículas ativadas',
      { className: 'cyber-toast' }
    );
  };

  const handleIntensityChange = (intensity: typeof matrixIntensity) => {
    setMatrixIntensity(intensity);
    toast.success(`Intensidade: ${intensity.toUpperCase()}`, {
      className: 'cyber-toast',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="cyber-border relative"
        >
          <Zap className="h-4 w-4 text-[#39ff14]" />
          {(matrixRainEnabled || scanLineEnabled || particlesEnabled) && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#39ff14] rounded-full animate-pulse-green"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 cyber-card">
        <DropdownMenuLabel className="text-[#39ff14]">
          Efeitos Matrix
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#39ff14]/20" />
        
        <DropdownMenuItem onClick={handleToggleMatrixRain}>
          {matrixRainEnabled ? (
            <Eye className="mr-2 h-4 w-4 text-[#39ff14]" />
          ) : (
            <EyeOff className="mr-2 h-4 w-4 text-red-500" />
          )}
          <span>Matrix Rain</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {matrixRainEnabled ? 'ON' : 'OFF'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleToggleScanLine}>
          {scanLineEnabled ? (
            <Eye className="mr-2 h-4 w-4 text-[#39ff14]" />
          ) : (
            <EyeOff className="mr-2 h-4 w-4 text-red-500" />
          )}
          <span>Scan Line</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {scanLineEnabled ? 'ON' : 'OFF'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleToggleParticles}>
          {particlesEnabled ? (
            <Eye className="mr-2 h-4 w-4 text-[#39ff14]" />
          ) : (
            <EyeOff className="mr-2 h-4 w-4 text-red-500" />
          )}
          <span>Partículas</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {particlesEnabled ? 'ON' : 'OFF'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#39ff14]/20" />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Intensidade Matrix Rain
        </DropdownMenuLabel>
        
        <DropdownMenuItem onClick={() => handleIntensityChange('subtle')}>
          <div className={`mr-2 h-2 w-2 rounded-full ${matrixIntensity === 'subtle' ? 'bg-[#39ff14]' : 'bg-gray-500'}`}></div>
          <span>Sutil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleIntensityChange('normal')}>
          <div className={`mr-2 h-2 w-2 rounded-full ${matrixIntensity === 'normal' ? 'bg-[#39ff14]' : 'bg-gray-500'}`}></div>
          <span>Normal</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleIntensityChange('dramatic')}>
          <div className={`mr-2 h-2 w-2 rounded-full ${matrixIntensity === 'dramatic' ? 'bg-[#39ff14]' : 'bg-gray-500'}`}></div>
          <span>Dramático</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleIntensityChange('extreme')}>
          <div className={`mr-2 h-2 w-2 rounded-full ${matrixIntensity === 'extreme' ? 'bg-[#39ff14]' : 'bg-gray-500'}`}></div>
          <span>Extremo</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#39ff14]/20" />
        
        <DropdownMenuItem 
          onClick={resetToDefaults}
          className="text-[#39ff14] focus:text-[#39ff14]"
        >
          Restaurar Padrões
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MatrixToggle;
