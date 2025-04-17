import React from "react";

interface MetricCardProps {
  title: string;
  value: number | string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  className = "",
}) => {
  return (
    <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
};
