import type { VelocityType } from "../types/indicators";

/**
 * How the stored velocity reads in the interface.
 *
 * The database holds the German enum the submission form writes - Rot, Gelb,
 * Grün - and it is never changed. This is the display layer, and nothing more:
 * the readout shows English, the row keeps its own value.
 *
 * Colour deliberately lives elsewhere, in the readout's state styles, so the
 * traffic light stays part of one palette rather than a second one here.
 */
export const VELOCITY_LABELS: Record<VelocityType, string> = {
  Rot: "Low velocity expected",
  Gelb: "Medium velocity expected",
  Grün: "High velocity expected",
} as const;
