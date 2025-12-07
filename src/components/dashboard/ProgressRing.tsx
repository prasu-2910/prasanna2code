import { MINUTES_IN_DAY, formatMinutesToTime } from '@/lib/categories';

interface ProgressRingProps {
  totalMinutes: number;
  size?: number;
}

export const ProgressRing = ({ totalMinutes, size = 180 }: ProgressRingProps) => {
  const percentage = Math.min((totalMinutes / MINUTES_IN_DAY) * 100, 100);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const isComplete = totalMinutes >= MINUTES_IN_DAY;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(185, 75%, 50%)" />
            <stop offset="100%" stopColor="hsl(280, 70%, 55%)" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? 'hsl(160, 70%, 45%)' : 'url(#progressGradient)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{
            filter: isComplete ? 'none' : 'drop-shadow(0 0 8px hsl(185, 75%, 50%))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold gradient-text">
          {formatMinutesToTime(totalMinutes)}
        </span>
        <span className="text-sm text-muted-foreground">
          of 24 hours
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {percentage.toFixed(0)}% logged
        </span>
      </div>
    </div>
  );
};
