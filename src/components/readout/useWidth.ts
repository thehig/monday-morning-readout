import { useEffect, useRef, useState } from "react";

/**
 * An element's rendered width, kept current as it resizes. Zero until the
 * first measurement, which callers treat as "wide enough".
 *
 * The calendars position everything in percentages, so it takes a width in
 * pixels to know when two labels would run into each other.
 */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}
