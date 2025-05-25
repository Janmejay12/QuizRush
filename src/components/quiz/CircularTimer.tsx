
import React from 'react';

interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
}

const CircularTimer: React.FC<CircularTimerProps> = ({ timeLeft, totalTime }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = ((totalTime - timeLeft) / totalTime) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={timeLeft <= 5 ? "#ef4444" : "#10b981"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      
      {/* Time display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
          {timeLeft}
        </span>
      </div>
    </div>
  );
};

export default CircularTimer;
