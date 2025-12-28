export function getRank(score: number): string {
  if (score >= 995000) return "S+";
  if (score >= 990000) return "S";
  if (score >= 970000) return "AAA";
  if (score >= 950000) return "AA";
  if (score >= 900000) return "A";
  if (score >= 850000) return "BBB";
  if (score >= 800000) return "BB";
  if (score >= 700000) return "B";
  return "C";
}
