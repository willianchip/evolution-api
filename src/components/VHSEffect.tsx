import { useEffect, useRef } from 'react';

interface VHSEffectProps {
  scanlines?: number;
  noise?: number;
  curvature?: number;
  chromatic?: number;
}

const VHSEffect = ({ 
  scanlines = 50, 
  noise = 30,
  curvature = 3,
  chromatic = 2 
}: VHSEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.02 + (noise / 1000)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (noise > 0) {
        const noiseAmount = noise / 100;
        for (let i = 0; i < canvas.width * canvas.height * noiseAmount * 0.001; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const brightness = Math.random();
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [noise]);

  const scanlinesOpacity = scanlines / 100 * 0.15;
  const curvatureTransform = curvature > 0 
    ? `perspective(${1000 - curvature * 50}px) rotateX(${curvature * 0.3}deg)`
    : 'none';
  const chromaticAmount = chromatic * 0.5;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 100,
          opacity: 0.15,
          mixBlendMode: 'screen'
        }}
      />
      
      {scanlines > 0 && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 101,
            background: `repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, ${scanlinesOpacity}) 0px,
              transparent 1px,
              transparent 2px,
              rgba(0, 0, 0, ${scanlinesOpacity}) 3px
            )`,
          }}
        />
      )}
      
      {curvature > 0 && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 99,
            transform: curvatureTransform,
            transformStyle: 'preserve-3d',
          }}
        />
      )}
      
      {chromatic > 0 && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 102,
            backdropFilter: 'brightness(1.1) contrast(1.05)',
            background: `
              radial-gradient(
                circle at 50% 50%,
                rgba(255, 0, 0, ${chromaticAmount * 0.01}) 0%,
                transparent 30%
              ),
              radial-gradient(
                circle at 48% 50%,
                rgba(0, 255, 0, ${chromaticAmount * 0.01}) 0%,
                transparent 30%
              ),
              radial-gradient(
                circle at 52% 50%,
                rgba(0, 0, 255, ${chromaticAmount * 0.01}) 0%,
                transparent 30%
              )
            `,
          }}
        />
      )}
    </>
  );
};

export default VHSEffect;
