import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PAGES, pageUrl } from "./pages";

/**
 * True while a keystroke belongs to a field rather than to navigation.
 *
 * Shared with the per-page keys - the Stop's arrows and the Wall's step-in -
 * so none of them can fire while someone is typing.
 */
export function isTypingTarget(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return true;

  const target = event.target as HTMLElement | null;
  return Boolean(
    target &&
      (target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * The readout's navigation keys: one number per page, the same numbers the
 * header draws.
 *
 * One operator drives the screen while talking to a room, so moving between
 * pages is a keystroke rather than a small target to aim at. Every page has its
 * own address, so a number key is simply a link, and works from anywhere -
 * including an engagement's Stop. Keys are ignored while a field has focus, so
 * typing never navigates.
 */
export function useReadoutKeys(currentWeek: number) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event)) return;

      const page = PAGES.find((p) => p.key === event.key);
      if (page) navigate(pageUrl(page.path, currentWeek));
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, currentWeek]);
}
