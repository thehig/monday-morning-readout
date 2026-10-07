import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEmailDisplayName(email: string): string {
  return email
    .split("@")[0] // Get part before @
    .split(/[._-]/) // Split on . _ or -
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()) // Capitalize each part
    .join(" "); // Join with spaces
}

export function formatAmount(amount: string | undefined): string {
  if (!amount) return "N/A";

  try {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? amount : `€${parsed.toFixed(2)}`;
  } catch {
    return amount;
  }
}
