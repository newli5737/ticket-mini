import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface CountdownTimerProps {
  expiresAt: number;
  onExpire: () => void;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calc = () => {
      const remaining = Math.max(0, expiresAt - Date.now());
      setTimeLeft(remaining);
      if (remaining === 0) onExpire();
    };
    calc();
    const interval = setInterval(calc, 100);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isUrgent = timeLeft < 60000;

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: isUrgent ? Infinity : 0, duration: 1 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
        isUrgent ? 'bg-destructive/20 border-2 border-destructive' : 'bg-warning/20 border-2 border-warning'
      }`}
    >
      <Clock className={`w-5 h-5 ${isUrgent ? 'text-destructive' : 'text-warning'}`} />
      <div>
        <p className="text-xs text-muted-foreground">Thời gian còn lại</p>
        <p className={`text-xl font-bold ${isUrgent ? 'text-destructive' : 'text-warning'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>
      </div>
    </motion.div>
  );
}
