import type { ScheduleState, SlipSeverity } from "../../lib/engagements";
import type { VelocityType } from "../../types/indicators";

/**
 * Status classes, kept out of the component files so fast refresh keeps working.
 *
 * Colour is spent only where the call has to stop: cards stay white, and each
 * carries its state in one block. The three states differ in lightness as well
 * as hue - a dark red block, a mid amber one, a pale green one - because video
 * codecs keep luminance and halve chroma, and the same pairing makes the states
 * readable to anyone who cannot separate red from green.
 */

/**
 * The state block on a Wall card, deepened by how far behind it is.
 *
 * Only the two states that can be behind have a ramp; on schedule is on
 * schedule. The step is in lightness, the channel a video call keeps.
 */
const BLOCK: Record<"late" | "watch", Record<SlipSeverity, string>> = {
  late: {
    1: "bg-late-block1 text-white",
    2: "bg-late-block2 text-white",
    3: "bg-late-block3 text-white",
  },
  watch: {
    1: "bg-watch-block1 text-watch-on",
    2: "bg-watch-block2 text-watch-on",
    3: "bg-watch-block3 text-watch-on",
  },
};

export function stateBlock(state: ScheduleState, severity: SlipSeverity): string {
  if (state === "late" || state === "watch") return BLOCK[state][severity];
  if (state === "fine") return "bg-fine-block text-fine-on";
  return "bg-sheet-key text-ink-2";
}

/** Text in the state's own ink - a figure or phrase that carries the state. */
export const STATE_TEXT: Record<ScheduleState, string> = {
  late: "text-late-ink",
  watch: "text-watch-ink",
  fine: "text-fine-ink",
  unknown: "text-ink-3",
};

/** Dots and bars: the mid-tone of each state. */
export const STATE_MARK: Record<ScheduleState, string> = {
  late: "bg-late-mark",
  watch: "bg-watch-mark",
  fine: "bg-fine-mark",
  unknown: "bg-ink-3",
};

/**
 * The pale surface a small tile takes. Tiles are too small for a block, so an
 * engagement past or overrunning its deadline tints the whole tile instead.
 */
export const STATE_TINT: Record<ScheduleState, string> = {
  late: "bg-late-tint",
  watch: "bg-watch-tint",
  fine: "bg-sheet-card",
  unknown: "bg-sheet-card",
};

/** Quieter text on a tinted tile: `text-ink-3` goes muddy on a tint. */
export const STATE_LABEL: Record<ScheduleState, string> = {
  late: "text-late-ink/80",
  watch: "text-watch-ink/80",
  fine: "text-ink-3",
  unknown: "text-ink-3",
};

/** The hatching that marks a span as forecast rather than fact. */
export const HATCH: Record<"late" | "watch", string> = {
  late: "repeating-linear-gradient(135deg, #C8442F 0 4px, #F4C7BE 4px 8px)",
  watch: "repeating-linear-gradient(135deg, #E0A027 0 4px, #F8E3B5 4px 8px)",
};

export const VELOCITY_DOT: Record<VelocityType, string> = {
  Rot: "bg-late-mark",
  Gelb: "bg-watch-mark",
  "Grün": "bg-fine-mark",
};
