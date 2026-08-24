export function normalizeAnswer(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[.,'"`()\-–—/\\:;!?\s]/g, "")
    .trim();
}

export function isAccepted(input: string, accepted: string[] | undefined): boolean {
  if (!accepted || accepted.length === 0) return true;
  const normalized = normalizeAnswer(input);
  if (normalized === "") return false;
  return accepted.some((a) => normalizeAnswer(a) === normalized);
}
