import { Switch } from "@headlessui/react";
import { cn } from "../../lib/utils";

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ enabled, onChange, label, className }: ToggleProps) {
  return (
    <Switch.Group>
      <div className={cn("flex items-center space-x-2", className)}>
        {label && (
          <Switch.Label className="text-sm text-gray-600">{label}</Switch.Label>
        )}
        <Switch
          checked={enabled}
          onChange={onChange}
          className={cn(
            enabled ? "bg-blue-600" : "bg-gray-200",
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          )}
        >
          <span
            className={cn(
              enabled ? "translate-x-6" : "translate-x-1",
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            )}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
}
