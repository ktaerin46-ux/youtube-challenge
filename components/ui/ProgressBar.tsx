interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: "indigo" | "green" | "amber" | "red" | "gradient";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const colorClasses = {
  indigo: "bg-indigo-600",
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  gradient: "bg-gradient-to-r from-indigo-500 to-purple-600",
};

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export default function ProgressBar({
  value,
  max = 100,
  color = "indigo",
  size = "md",
  showLabel = false,
  animated = false,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>진행률</span>
          <span className="font-semibold text-gray-700">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={`w-full rounded-full bg-gray-100 overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className={`
            h-full rounded-full transition-all duration-700 ease-out
            ${colorClasses[color]}
            ${animated ? "animate-pulse-slow" : ""}
          `}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
