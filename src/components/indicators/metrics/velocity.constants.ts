import { VelocityType } from "../../../types/indicators";

export const VELOCITY_COLORS: Record<VelocityType, string> = {
  Rot: "bg-red-500",
  Gelb: "bg-yellow-400",
  Grün: "bg-green-500",
} as const;

export const VELOCITY_LABELS: Record<VelocityType, string> = {
  Rot: "Low velocity expected",
  Gelb: "Medium velocity expected",
  Grün: "High velocity expected",
} as const;
