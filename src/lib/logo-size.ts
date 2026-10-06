const LEGACY_LOGO_SIZE_PX: Record<string, number> = {
  sm: 36,
  md: 56,
  lg: 80,
  xl: 96,
};

export const LOGO_SIZE_MIN = 28;
export const LOGO_SIZE_MAX = 160;
export const LOGO_SIZE_DEFAULT = 56;

export function resolveLogoSizePx(value: string): number {
  const parsed = Number(value);
  if (!Number.isNaN(parsed) && parsed > 0) {
    return Math.min(LOGO_SIZE_MAX, Math.max(LOGO_SIZE_MIN, parsed));
  }
  return LEGACY_LOGO_SIZE_PX[value] ?? LOGO_SIZE_DEFAULT;
}
