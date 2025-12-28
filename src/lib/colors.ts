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
    return "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text font-extrabold";
  }
  if (rate >= 18.0) {
    return "text-purple-600 font-bold";
  }
  if (rate >= 16.0) {
    return "text-red-500 font-bold";
  }
  if (rate >= 14.0) {
    return "text-orange-500 font-bold";
  }
  if (rate >= 12.0) {
    return "text-yellow-600 font-bold"; // yellow-500 is a bit hard to read on white
  }
  if (rate >= 10.0) {
    return "text-green-500 font-bold";
  }
  if (rate >= 5.0) {
    return "text-cyan-600 font-bold"; // cyan-500 is often light
  }
  
  // Default (< 5.0)
  return "text-slate-500 dark:text-slate-400";
}
