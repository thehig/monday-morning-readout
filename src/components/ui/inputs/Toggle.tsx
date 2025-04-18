import { Switch } from "@headlessui/react";
import { cn } from "../../../lib/utils";
import { ToggleProps } from "../../../types/components";

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <Switch.Group>
      <div className="flex items-center space-x-2">
        {label && (
          <Switch.Label className="text-sm text-white">{label}</Switch.Label>
        )}
        <Switch
          checked={checked}
          onChange={onChange}
          className={cn(
            checked ? "bg-blue-600" : "bg-gray-200",
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          )}
        >
          <span
            className={cn(
              checked ? "translate-x-6" : "translate-x-1",
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            )}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
}
