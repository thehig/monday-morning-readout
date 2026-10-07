import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * The readout's navigation keys.
 *
 * One operator drives the screen while talking to a room, so moving between
 * states is a keystroke rather than a small target to aim at. Keys are ignored
 * while a field has focus, so typing never navigates.
 */
/**
 * True while a keystroke belongs to a field rather than to navigation.
 *
 * Shared with the per-view keys - the Wall's layout digits and the Stop's
 * arrows - so none of them can fire while someone is typing.
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

export function useReadoutKeys(currentWeek: number) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event)) return;

      switch (event.key) {
        case "Escape":
          navigate(`/?week=${currentWeek}`);
          break;
        case "p":
        case "P":
          navigate(`/plan?week=${currentWeek}`);
          break;
        case "d":
        case "D":
          navigate(`/dates?week=${currentWeek}`);
          break;
        default:
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, currentWeek]);
}
