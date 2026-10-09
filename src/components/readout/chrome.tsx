import { useContext } from "react";
import { createPortal } from "react-dom";
import { TopBarSlotContext } from "./top-bar-slot";
import { FooterSlotContext } from "./footer-slot";

/** Renders its children into the navy bar instead of in place. */
export function TopBarActions({ children }: { children: React.ReactNode }) {
  const slot = useContext(TopBarSlotContext);
  return slot ? createPortal(children, slot) : null;
}

/** Renders its children into the footer instead of in place. */
export function FooterActions({ children }: { children: React.ReactNode }) {
  const slot = useContext(FooterSlotContext);
  return slot ? createPortal(children, slot) : null;
}

/** A keycap. The letter is the interface, so it is drawn like one. */
export function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mr-2 inline-block min-w-[30px] rounded-[7px] bg-sheet-key px-[9px] text-center font-sans text-[17px] font-bold text-ink-2 shadow-key">
      {children}
    </kbd>
  );
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
 * The view switcher, drawn for the navy bar as a row of pills.
 *
 * Selection is carried by a filled white pill rather than by hue, so it
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
      className="flex gap-1 rounded-full bg-white/[0.09] p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={`rounded-full px-4 py-[7px] text-[17px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              selected
                ? "bg-white font-[650] text-navy"
                : "font-semibold text-white/85 hover:bg-white/10 hover:text-white"
            }`}
          >
            {option.digit && (
              <span
                className={`mr-2 text-[17px] ${
                  selected ? "text-navy/45" : "text-white/45"
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
