import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * The readout's navigation keys.
 *
 * One operator drives the screen while talking to a room, so moving between
 * states is a keystroke rather than a small target to aim at. Keys are ignored
 * while a field has focus, so typing never navigates.
 */
export function useReadoutKeys(currentWeek: number) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

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
