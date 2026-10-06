export function parseMoneyToNumber(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function formatMoneyCOP(n: number): string {
  if (!n) return "";
  return n.toLocaleString("es-CO");
}

/** Advance (70%) and balance (30%) of a freight value, formatted like "980.000 (70%)". */
export function splitAdvanceBalance(freightValue: string): { advance: string; balance: string } {
  const n = parseMoneyToNumber(freightValue);
  if (!n) return { advance: "", balance: "" };
  const advance = Math.round(n * 0.7);
  const balance = n - advance;
  return {
    advance: `${formatMoneyCOP(advance)} (70%)`,
    balance: `${formatMoneyCOP(balance)} (30%)`,
  };
}
