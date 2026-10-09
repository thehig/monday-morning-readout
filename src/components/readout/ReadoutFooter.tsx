interface ReadoutFooterProps {
  /** Receives the node the current page renders its own keys into. */
  onActionsSlot: (slot: HTMLDivElement | null) => void;
}

/**
 * The current page's own keys - stepping through engagements, opening the
 * first. The pages themselves are in the header. Pinned for the same reason
 * the navy bar is: in a window too short for the whole frame, these are the
 * controls, and controls that scroll away are not controls. A page with no
 * keys of its own gets no footer.
 */
export function ReadoutFooter({ onActionsSlot }: ReadoutFooterProps) {
  return (
    <footer className="sticky bottom-0 z-20 flex h-11 shrink-0 items-center border-t border-sheet-rule bg-sheet-card px-4 text-[18px] text-ink-3 sm:px-8 has-[>div:empty]:hidden">
      <div ref={onActionsSlot} className="flex min-w-0 flex-1 items-center gap-4 whitespace-nowrap sm:gap-[30px]" />
    </footer>
  );
}
