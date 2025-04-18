import React from "react";

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = "",
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div
      className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
};
