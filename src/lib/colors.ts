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
    return "text-purple-600 dark:text-purple-400 font-bold";
  }
  if (rate >= 16.0) {
    return "text-red-600 dark:text-red-400 font-bold";
  }
  if (rate >= 14.0) {
    return "text-orange-600 dark:text-orange-400 font-bold";
  }
  if (rate >= 12.0) {
    return "text-yellow-600 dark:text-yellow-400 font-bold"; 
  }
  if (rate >= 10.0) {
    return "text-green-600 dark:text-green-400 font-bold";
  }
  if (rate >= 5.0) {
    return "text-cyan-600 dark:text-cyan-400 font-bold"; 
  }
  
  // Default (< 5.0)
  return "text-slate-500 dark:text-slate-400";
}

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
  if (d.includes("HARD")) return "HRD";
  if (d.includes("MASTER")) return "MAS";
  if (d.includes("INSANITY")) return "INS";
  if (d.includes("RAVAGE")) return "RVG";
  return "UNK";
}
