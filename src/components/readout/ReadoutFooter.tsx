import { useLocation } from "react-router-dom";
import { Key } from "./chrome";

interface ReadoutFooterProps {
  /** Receives the node the current state renders its own keys into. */
  onActionsSlot: (slot: HTMLDivElement | null) => void;
}

/** Where each key goes, and the path that means you are already there. */
const MOVES = [
  { key: "Esc", label: "the wall", path: "/" },
  { key: "D", label: "the dates", path: "/dates" },
];

/**
 * The bar of keys under every state.
 *
 * One operator drives the readout from the keyboard while talking, so the keys
 * that move between states are written down rather than remembered. Pinned for
 * the same reason the navy bar is: in a window too short for the whole frame,
 * these are the controls, and controls that scroll away are not controls.
 *
 * Only the moves that go somewhere are listed - the Wall does not offer to
 * take you to the wall.
 */
export function ReadoutFooter({ onActionsSlot }: ReadoutFooterProps) {
  const { pathname } = useLocation();

  // On an engagement, Escape goes back out to the Wall, so that one stays.
  const onStop = pathname.startsWith("/feedback");
  const moves = MOVES.filter((move) => onStop || move.path !== pathname);

  return (
    <footer className="sticky bottom-0 z-20 flex h-11 shrink-0 items-center gap-[30px] border-t border-sheet-rule bg-sheet-card px-8 text-[18px] text-ink-3">
      <span className="flex shrink-0 items-center gap-[30px]">
        {moves.map((move) => (
          <span key={move.key}>
            <Key>{move.key}</Key>
            {move.label}
          </span>
        ))}
      </span>

      {/* The current state adds its own keys and position here. */}
      <div
        ref={onActionsSlot}
        className="flex min-w-0 flex-1 items-center gap-[30px]"
      />
    </footer>
  );
}
