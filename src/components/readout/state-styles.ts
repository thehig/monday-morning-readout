import type { ScheduleState } from "../../lib/engagements";
import type { VelocityType } from "../../types/indicators";

/**
 * Status classes, kept out of the component files so fast refresh keeps working.
 *
 * Each state pairs a dark ink with a pale wash, so it separates by lightness as
 * well as by hue. Video codecs keep luminance and halve chroma, so a palette
 * that relies on hue alone degrades in a shared call - and the same pairing
 * makes the states readable to anyone who cannot separate red from green.
 */
export const STATE_EDGE: Record<ScheduleState, string> = {
  late: "border-l-late-mark",
  watch: "border-l-watch-mark",
  fine: "border-l-fine-mark",
  unknown: "border-l-sheet-rule",
};

/**
 * The state across a whole surface, not along one edge of it.
 *
 * Spent this way the Wall reads as a board of colour from across a room -
 * which is the point of putting ten engagements on one screen - where an edge
 * has to be looked for first. The wash is the pale half of the same pair the
 * ink comes from, so the lightness separation still does the work and the
 * contrast against the state's own ink stays well clear.
 */
export const STATE_FILL: Record<ScheduleState, string> = {
  late: "border-late-mark bg-late-wash",
  watch: "border-watch-mark bg-watch-wash",
  fine: "border-fine-mark bg-fine-wash",
  unknown: "border-sheet-rule bg-sheet-card",
};

/**
 * Quieter text on a washed surface.
 *
 * `text-ink-3` is tuned for white and goes muddy on a wash, so labels take the
 * state's own ink held back instead - same hue family as the surface, enough
 * separation to read as secondary.
 */
export const STATE_LABEL: Record<ScheduleState, string> = {
  late: "text-late-ink/75",
  watch: "text-watch-ink/75",
  fine: "text-fine-ink/75",
  unknown: "text-ink-3",
};

/** The rule between a tile's facts, which has to sit on the wash too. */
export const STATE_RULE: Record<ScheduleState, string> = {
  late: "border-late-mark/30",
  watch: "border-watch-mark/30",
  fine: "border-fine-mark/30",
  unknown: "border-sheet-rule",
};

export const STATE_TEXT: Record<ScheduleState, string> = {
  late: "text-late-ink",
  watch: "text-watch-ink",
  fine: "text-fine-ink",
  unknown: "text-ink-3",
};

export const VELOCITY_DOT: Record<VelocityType, string> = {
  Rot: "bg-late-mark",
  Gelb: "bg-watch-mark",
  "Grün": "bg-fine-mark",
};
