interface ThermometerProps {
  value: number;
  className?: string;
}

export function Thermometer({ value, className = "" }: ThermometerProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="mt-2 text-sm text-gray-600 font-medium text-right">
        {value}%
      </div>
    </div>
  );
}
