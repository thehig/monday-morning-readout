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
