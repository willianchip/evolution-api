import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  cpuUsage: number;
  memoryMB: number;
  batteryLevel: number | null;
  isCharging: boolean | null;
  fpsHistory: number[];
}

export const usePerformanceMonitor = (enabled: boolean = true) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    cpuUsage: 0,
    memoryMB: 0,
    batteryLevel: null,
    isCharging: null,
    fpsHistory: [],
  });

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let lastFrameTime = performance.now();
    const fpsHistory: number[] = [];

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;
      
      const currentFPS = 1000 / deltaTime;
      fpsHistory.push(currentFPS);
      if (fpsHistory.length > 60) fpsHistory.shift();

      if (currentTime - lastTime >= 500) {
        const avgFPS = Math.round(
          fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length
        );
        
        const avgFrameTime = 1000 / avgFPS;
        const cpuEstimate = Math.min(100, Math.round((avgFrameTime / 16.67) * 100));

        setMetrics((prev) => ({
          ...prev,
          fps: avgFPS,
          cpuUsage: cpuEstimate,
          fpsHistory: [...fpsHistory],
        }));

        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    const rafId = requestAnimationFrame(measureFPS);

    const memoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        setMetrics((prev) => ({ ...prev, memoryMB: usedMB }));
      }
    }, 2000);

    const updateBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setMetrics((prev) => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isCharging: battery.charging,
          }));

          battery.addEventListener('levelchange', () => {
            setMetrics((prev) => ({
              ...prev,
              batteryLevel: Math.round(battery.level * 100),
            }));
          });

          battery.addEventListener('chargingchange', () => {
            setMetrics((prev) => ({
              ...prev,
              isCharging: battery.charging,
            }));
          });
        } catch (error) {
          console.log('Battery API not available');
        }
      }
    };

    updateBattery();

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(memoryInterval);
    };
  }, [enabled]);

  return metrics;
};
