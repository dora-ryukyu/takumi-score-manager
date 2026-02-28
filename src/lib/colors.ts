/**
 * Determines the text color class based on the numerical rating.
 * 
 * Logic:
 * ~4.999: White (gray/black in light mode)
 * 5.000~: Cyan
 * 10.000~: Green
 * 12.000~: Yellow
 * 14.000~: Orange
 * 16.000~: Red
 * 18.000~: Purple
 * 19.000~: Rainbow (Gradient)
 */
export function getRateColorClass(rate: number): string {
  if (rate >= 19.0) {
    return "font-extrabold animate-rainbow";
  }
  if (rate >= 18.0) {
    return "text-[var(--rate-purple)] font-bold";
  }
  if (rate >= 16.0) {
    return "text-[var(--rate-red)] font-bold";
  }
  if (rate >= 14.0) {
    return "text-[var(--rate-orange)] font-bold";
  }
  if (rate >= 12.0) {
    return "text-[var(--rate-yellow)] font-bold";
  }
  if (rate >= 10.0) {
    return "text-[var(--rate-green)] font-bold";
  }
  if (rate >= 5.0) {
    return "text-[var(--rate-cyan)] font-bold";
  }
  
  // Default (< 5.0)
  return "text-[var(--rate-default)]";
}

/**
 * Returns the HEX color code for a given rate value.
 * Used for Canvas rendering.
 */
export function getRateColorHex(rate: number): string {
  if (rate >= 19.0) return "#FFD700"; // Gold (rainbow handled separately)
  if (rate >= 18.0) return "#C084FC"; // Purple (pastel)
  if (rate >= 16.0) return "#F87171"; // Red (pastel)
  if (rate >= 14.0) return "#FB923C"; // Orange (pastel)
  if (rate >= 12.0) return "#FACC15"; // Yellow
  if (rate >= 10.0) return "#4ADE80"; // Green (pastel)
  if (rate >= 5.0) return "#22D3EE";  // Cyan
  return "#94A3B8"; // Gray (default)
}

/**
 * Check if rate should have rainbow effect.
 */
export function isRainbowRate(rate: number): boolean {
  return rate >= 19.0;
}

/**
 * Rainbow colors for each digit position in rate display.
 * Format: "XX.XXX" -> positions 0-5 (including dot)
 * Pattern: 赤(tens), 黄(ones), 黄(dot), 緑(1st decimal), 青(2nd decimal), 紫(3rd decimal)
 * Using very high-brightness pastel colors.
 */
export const RAINBOW_DIGIT_COLORS = [
  "#FF8A8A", // 0: Position 0 (tens) - Red (very bright)
  "#FFED4A", // 1: Position 1 (ones) - Yellow (very bright)
  "#FFED4A", // 2: Position 2 (.) - Yellow (same as ones)
  "#7DFFB3", // 3: Position 3 (1st decimal) - Green (very bright)
  "#7DD3FF", // 4: Position 4 (2nd decimal) - Blue (very bright)
  "#D8A8FF", // 5: Position 5 (3rd decimal) - Purple (very bright)
];

export function getDiffColor(diff: string): string {
  if (!diff) return "#94a3b8"; 
  const d = diff.toUpperCase();
  if (d.includes("NORMAL")) return "#3b82f6"; // Blue
  if (d.includes("HARD")) return "#f59e0b";   // Orange
  if (d.includes("MASTER")) return "#d946ef";  // Magenta
  if (d.includes("INSANITY")) return "#64748b"; // Dark/Gray
  if (d.includes("RAVAGE")) return "#ef4444";   // Red
  return "#94a3b8";
}

export function getDiffAbbr(diff: string): string {
  const d = diff ? diff.toUpperCase() : "";
  if (d.includes("NORMAL")) return "NOR";
  if (d.includes("HARD")) return "HAR";
  if (d.includes("MASTER")) return "MAS";
  if (d.includes("INSANITY")) return "INS";
  if (d.includes("RAVAGE")) return "RVG";
  return "UNK";
}
