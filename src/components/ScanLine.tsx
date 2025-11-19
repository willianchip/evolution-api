import { useEffect, useState } from 'react';

interface ScanLineProps {
  interval?: number;
  duration?: number;
  opacity?: number;
  height?: number;
}

const ScanLine = ({ 
  interval = 30000, 
  duration = 2500,
  opacity = 0.15,
  height = 2
}: ScanLineProps) => {
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const startScan = () => {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), duration);
    };

    const initialTimeout = setTimeout(startScan, 2000);
    const scanInterval = setInterval(startScan, interval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(scanInterval);
    };
  }, [interval, duration]);

  return (
    <>
      {/* Linha horizontal principal */}
      <div
        className={`fixed left-0 right-0 pointer-events-none z-50 ${
          isScanning ? 'animate-scan-down' : 'opacity-0'
        }`}
        style={{
          height: `${height}px`,
          background: `linear-gradient(to bottom, 
            transparent, 
            rgba(57, 255, 20, ${opacity * 0.5}) 20%,
            rgba(57, 255, 20, ${opacity}) 50%, 
            rgba(57, 255, 20, ${opacity * 0.5}) 80%,
            transparent
          )`,
          boxShadow: `0 0 10px rgba(57, 255, 20, ${opacity}), 
                      0 0 20px rgba(57, 255, 20, ${opacity * 0.6})`,
          top: 0,
          animationDuration: `${duration}ms`,
        }}
      />
      
      {/* Glow effect acima da linha */}
      <div
        className={`fixed left-0 right-0 pointer-events-none z-49 ${
          isScanning ? 'animate-scan-down' : 'opacity-0'
        }`}
        style={{
          height: '40px',
          background: `linear-gradient(to bottom, 
            transparent,
            rgba(57, 255, 20, ${opacity * 0.1}) 50%,
            transparent
          )`,
          top: '-20px',
          filter: 'blur(8px)',
          animationDuration: `${duration}ms`,
        }}
      />
    </>
  );
};

export default ScanLine;
