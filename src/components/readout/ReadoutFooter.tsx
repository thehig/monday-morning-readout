import { Link, useLocation } from "react-router-dom";
import { PAGES, pageUrl } from "./pages";

interface ReadoutFooterProps {
  currentWeek: number;
  /** Receives the node the current page renders its own keys into. */
  onActionsSlot: (slot: HTMLDivElement | null) => void;
}

/**
 * The readout's only navigation: every page, with the number that opens it.
 *
 * One operator drives the readout from the keyboard while talking, so the keys
 * are written down rather than remembered, and each one is also a link. The
 * page you are on stays in the row, filled, so the row never shifts and the
 * room can see where the call is. Pinned for the same reason the navy bar is:
 * in a window too short for the whole frame, these are the controls, and
 * controls that scroll away are not controls.
 */
export function ReadoutFooter({ currentWeek, onActionsSlot }: ReadoutFooterProps) {
  const { pathname } = useLocation();

  return (
    <footer className="sticky bottom-0 z-20 flex h-11 shrink-0 items-center gap-[30px] border-t border-sheet-rule bg-sheet-card px-8 text-[18px] text-ink-3">
      <nav aria-label="Pages" className="flex shrink-0 items-center gap-6">
        {PAGES.map((page) => {
          const current = pathname === page.path;

          return (
            <Link
              key={page.path}
              to={pageUrl(page.path, currentWeek)}
              aria-current={current ? "page" : undefined}
              className={`flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                current ? "font-semibold text-ink" : "hover:text-ink-2"
              }`}
            >
              <kbd
                className={`inline-block min-w-[30px] rounded-[7px] px-[9px] text-center font-sans text-[17px] font-bold ${
                  current ? "bg-navy text-white" : "bg-sheet-key text-ink-2 shadow-key"
                }`}
              >
                {page.key}
              </kbd>
              {page.label}
            </Link>
          );
        })}
      </nav>

      <span className="h-5 w-px shrink-0 bg-sheet-rule" aria-hidden="true" />

      {/* The current page adds its own keys and position here. */}
      <div
        ref={onActionsSlot}
        className="flex min-w-0 flex-1 items-center gap-[30px]"
      />
    </footer>
  );
}
