interface HappinessIndicatorProps {
  value: number;
  type: "team" | "customer";
  className?: string;
}

export function HappinessIndicator({
  value,
  type,
  className = "",
}: HappinessIndicatorProps) {
  const emoji = value >= 4 ? "😊" : value >= 3 ? "😐" : "😟";
  const label = type === "team" ? "Team" : "Customer";
  const textColor =
    value >= 4
      ? "text-green-500"
      : value >= 3
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-4xl mb-2">{emoji}</div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-lg font-medium ${textColor}`}>{value}/5</div>
    </div>
  );
}
