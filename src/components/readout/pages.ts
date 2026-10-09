/**
 * The readout's pages, each at its own address.
 *
 * One list drives the footer's links and the number keys, so the two can
 * never disagree about what "3" means. The order is the running order of the
 * call: open on the grid, read the ladder, then look ahead at the dates. An
 * engagement's Stop is its own address too (`/feedback/:id`) but is reached
 * from the pages rather than listed among them.
 */
export interface ReadoutPage {
  /** The number key that opens it, drawn as a keycap in the footer. */
  key: string;
  label: string;
  path: string;
}

export const PAGES: ReadoutPage[] = [
  { key: "1", label: "Ranked grid", path: "/grid" },
  { key: "2", label: "Ladder", path: "/ladder" },
  { key: "3", label: "Owner runway", path: "/owner-runway" },
];

/** Where the readout opens, and where a link with no page lands. */
export const HOME = PAGES[0].path;

/** A page's address for a week, keeping the week as the pages change. */
export function pageUrl(path: string, week: number): string {
  return `${path}?week=${week}`;
}
