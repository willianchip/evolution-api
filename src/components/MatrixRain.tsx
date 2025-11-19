import { useEffect, useRef } from 'react';

type MatrixIntensity = 'subtle' | 'normal' | 'dramatic' | 'extreme';

interface MatrixRainProps {
  opacity?: number;
  fontSize?: number;
  speed?: number;
  intensity?: MatrixIntensity;
}

const INTENSITY_PRESETS = {
  subtle: {
    opacity: 0.08,
    fontSize: 14,
    speed: 0.5,
    trailLength: 6,
    density: 0.7,
  },
  normal: {
    opacity: 0.15,
    fontSize: 16,
    speed: 1,
    trailLength: 10,
    density: 1,
  },
  dramatic: {
    opacity: 0.25,
    fontSize: 18,
    speed: 1.8,
    trailLength: 15,
    density: 1.2,
  },
  extreme: {
    opacity: 0.35,
    fontSize: 20,
    speed: 2.5,
    trailLength: 20,
    density: 1.5,
  },
};

const MatrixRain = ({ 
  intensity = 'normal',
  opacity: customOpacity,
  fontSize: customFontSize,
  speed: customSpeed 
}: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const preset = INTENSITY_PRESETS[intensity];
  const finalOpacity = customOpacity ?? preset.opacity;
  const finalFontSize = customFontSize ?? preset.fontSize;
  const finalSpeed = customSpeed ?? preset.speed;
  const trailLength = preset.trailLength;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Matrix characters (Katakana + numbers + symbols)
    const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789Z:."=*+-<>';
    const matrix = chars.split('');

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const columns = Math.floor((width / finalFontSize) * preset.density);
    const drops: number[] = Array(columns).fill(1);
    const speeds: number[] = Array(columns).fill(0).map(() => 0.3 + Math.random() * 0.7 * finalSpeed);

    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${finalFontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = matrix[Math.floor(Math.random() * matrix.length)];
        
        // Leader character (brightest)
        ctx.fillStyle = '#39ff14';
        ctx.fillText(char, i * finalFontSize, drops[i] * finalFontSize);

        // Trail effect - draw fading characters above
        for (let j = 1; j < trailLength; j++) {
          const trailOpacity = Math.max(0, 1 - (j / trailLength));
          if (trailOpacity > 0) {
            ctx.fillStyle = `rgba(57, 255, 20, ${trailOpacity * 0.6})`;
            const trailY = (drops[i] - j) * finalFontSize;
            if (trailY > 0) {
              const trailChar = matrix[Math.floor(Math.random() * matrix.length)];
              ctx.fillText(trailChar, i * finalFontSize, trailY);
            }
          }
        }

        // Reset drop to top randomly after it falls off screen
        if (drops[i] * finalFontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i] += speeds[i];
      }
    };

    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity, finalOpacity, finalFontSize, finalSpeed, trailLength, preset.density]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: finalOpacity }}
    />
  );
};

export default MatrixRain;
