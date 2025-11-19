import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = format(time, "dd/MM/yyyy", { locale: ptBR });
  const formattedDay = format(time, "EEEE", { locale: ptBR });
  const formattedTime = format(time, "HH:mm:ss");

  return (
    <div className="hidden md:flex items-center gap-2 text-[#39ff14] font-mono text-sm backdrop-blur-sm">
      <span className="font-bold digital-led">{formattedDate}</span>
      <span className="animate-fade-pulse">•</span>
      <span className="capitalize digital-led">{formattedDay}</span>
      <span className="animate-fade-pulse">•</span>
      <span className="font-bold tracking-wider animate-pulse-green">{formattedTime}</span>
    </div>
  );
};

export default DigitalClock;
