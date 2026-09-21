export function starsFromScore(score: number): 1 | 2 | 3 {
  if (score >= 85) return 3;
  if (score >= 60) return 2;
  return 1;
}
