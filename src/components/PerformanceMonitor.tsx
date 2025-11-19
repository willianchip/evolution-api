import { useEffect } from 'react';
import { Activity, Cpu, HardDrive, Battery, BatteryCharging, AlertTriangle } from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useVisualEffects } from '@/hooks/useVisualEffects';

const PerformanceMonitor = () => {
  const metrics = usePerformanceMonitor(true);
  const { 
    autoPowerSavingEnabled, 
    powerSavingActive,
    activatePowerSaving,
    deactivatePowerSaving 
  } = useVisualEffects();

  const lowFPS = metrics.fps < 30;
  const highCPU = metrics.cpuUsage > 75;
  const lowBattery = metrics.batteryLevel !== null && metrics.batteryLevel < 20 && !metrics.isCharging;
  const hasAlert = lowFPS || highCPU || lowBattery;

  useEffect(() => {
    if (!autoPowerSavingEnabled || powerSavingActive) return;

    const shouldActivate = lowFPS || highCPU || lowBattery;
    if (shouldActivate) {
      activatePowerSaving();
    }
  }, [metrics, autoPowerSavingEnabled, powerSavingActive, lowFPS, highCPU, lowBattery, activatePowerSaving]);

  useEffect(() => {
    if (!powerSavingActive) return;

    const shouldDeactivate = 
      metrics.fps > 50 && 
      metrics.cpuUsage < 60 &&
      (metrics.batteryLevel === null || 
       metrics.batteryLevel > 30 || 
       metrics.isCharging);

    if (shouldDeactivate) {
      const timer = setTimeout(() => {
        deactivatePowerSaving();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [metrics, powerSavingActive, deactivatePowerSaving]);

  const getFPSColor = (fps: number) => {
    if (fps >= 50) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCPUColor = (cpu: number) => {
    if (cpu < 50) return 'text-green-400';
    if (cpu < 70) return 'text-yellow-400';
    return 'text-red-400';
  };


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={`relative h-8 px-2 font-mono text-xs ${
            powerSavingActive ? 'bg-green-500/10' : ''
          }`}
        >
          {hasAlert && !powerSavingActive && (
            <AlertTriangle className="h-3 w-3 text-yellow-400 absolute -top-1 -left-1 animate-pulse" />
          )}
          {powerSavingActive && (
            <Battery className="h-3 w-3 text-green-400 absolute -top-1 -left-1 animate-pulse" />
          )}
          <Activity className="h-3 w-3 mr-1" />
          <span className={getFPSColor(metrics.fps)}>
            {metrics.fps}fps
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-64 cyber-card p-4" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-primary">
              Monitor de Performance
            </h3>
            {hasAlert && (
              <Badge variant="destructive" className="text-xs">
                Alerta
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="text-xs">FPS</span>
              </div>
              <span className={`font-mono text-sm font-bold ${getFPSColor(metrics.fps)}`}>
                {metrics.fps}
              </span>
            </div>
            
            {lowFPS && !powerSavingActive && (
              <p className="text-xs text-yellow-400 animate-pulse">
                ⚠️ FPS baixo detectado
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <span className="text-xs">CPU Est.</span>
              </div>
              <span className={`font-mono text-sm font-bold ${getCPUColor(metrics.cpuUsage)}`}>
                {metrics.cpuUsage}%
              </span>
            </div>
            {highCPU && (
              <p className="text-xs text-yellow-400">
                ⚠️ CPU alto detectado
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span className="text-xs">Memória</span>
            </div>
            <span className="font-mono text-sm">
              {metrics.memoryMB}MB
            </span>
          </div>

          {metrics.batteryLevel !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {metrics.isCharging ? (
                    <BatteryCharging className="h-4 w-4 text-green-400" />
                  ) : (
                    <Battery className="h-4 w-4" />
                  )}
                  <span className="text-xs">Bateria</span>
                </div>
                <span className={`font-mono text-sm ${lowBattery ? 'text-red-400' : ''}`}>
                  {metrics.batteryLevel}%
                </span>
              </div>
              {lowBattery && (
                <p className="text-xs text-red-400">
                  🔋 Bateria baixa
                </p>
              )}
            </div>
          )}

          {hasAlert && !powerSavingActive && (
            <div className="pt-2 border-t border-primary/20">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Performance Mode</strong> disponível nas configurações
              </p>
            </div>
          )}

          {powerSavingActive && (
            <div className="pt-2 border-t border-primary/20">
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Battery className="h-4 w-4" />
                <span className="font-semibold">Modo Economia Ativo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Efeitos otimizados para performance
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PerformanceMonitor;
