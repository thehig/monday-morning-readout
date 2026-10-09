import { useContext } from "react";
import { createPortal } from "react-dom";
import { FooterSlotContext } from "./footer-slot";

/** Renders its children into the footer instead of in place. */
export function FooterActions({ children }: { children: React.ReactNode }) {
  const slot = useContext(FooterSlotContext);
  return slot ? createPortal(children, slot) : null;
}

/** A keycap. The key is the interface, so it is drawn like one. */
export function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mr-2 inline-block min-w-[30px] rounded-[7px] bg-sheet-key px-[9px] text-center font-sans text-[17px] font-bold text-ink-2 shadow-key">
      {children}
    </kbd>
  );
}
