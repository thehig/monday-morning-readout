import { useContext } from "react";
import { createPortal } from "react-dom";
import { TopBarSlotContext } from "./top-bar-slot";

/** Renders its children into the navy bar instead of in place. */
export function TopBarActions({ children }: { children: React.ReactNode }) {
  const slot = useContext(TopBarSlotContext);
  return slot ? createPortal(children, slot) : null;
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** The key that selects it, shown quietly before the label. */
  digit?: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Named for the screen reader, since the group has no visible heading. */
  label: string;
}

/**
 * The view switcher, drawn for the navy bar.
 *
 * Selection is carried by a filled white segment rather than by hue, so it
 * survives the same compression everything else on this screen is drawn for.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex overflow-hidden rounded border-2 border-navy-line"
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={`px-3.5 py-1 text-[17px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${
              selected
                ? "bg-white text-navy"
                : "text-white/85 hover:bg-white/10 hover:text-white"
            }`}
          >
            {option.digit && (
              <span
                className={`mr-1.5 text-[17px] ${
                  selected ? "text-navy/50" : "text-white/50"
                }`}
              >
                {option.digit}
              </span>
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
