import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endDate?: Date; // Optional specific end date
  hours?: number; // Duration in hours for auto-resetting timer (default 24)
  text?: string;
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  endDate, 
  hours = 12, // Default to a 12-hour urgency cycle if no date provided
  text = "Limited Time Offer Ends In:",
  className
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Calculate target time
    let target: number;

    if (endDate) {
      target = endDate.getTime();
    } else {
      // Create a recurring timer that ends at the next 12-hour mark (noon or midnight)
      // or just set it to 4 hours from now for demo purposes to always show urgency
      // Better strategy for landing pages: End of the day urgency
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      target = endOfDay.getTime();
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // Reset or stay at 0
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate, hours]);

  return (
    <div className={cn(
      "bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 shadow-md rounded-lg mx-auto max-w-md my-4 transform hover:scale-105 transition-transform duration-300",
      className
    )}>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2 animate-pulse">
          <Clock className="w-5 h-5" />
          <span className="font-semibold text-sm md:text-base">{text}</span>
        </div>
        
        <div className="flex gap-2 text-center font-bold font-mono text-lg md:text-xl items-center">
          <div className="bg-black/20 rounded px-2 py-1 min-w-[40px]">
            {String(timeLeft.hours).padStart(2, '0')}
            <span className="block text-[10px] font-normal uppercase mt-[-2px]">Hrs</span>
          </div>
          <span className="self-start mt-1">:</span>
          <div className="bg-black/20 rounded px-2 py-1 min-w-[40px]">
            {String(timeLeft.minutes).padStart(2, '0')}
            <span className="block text-[10px] font-normal uppercase mt-[-2px]">Min</span>
          </div>
          <span className="self-start mt-1">:</span>
          <div className="bg-black/20 rounded px-2 py-1 min-w-[40px]">
            {String(timeLeft.seconds).padStart(2, '0')}
            <span className="block text-[10px] font-normal uppercase mt-[-2px]">Sec</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
