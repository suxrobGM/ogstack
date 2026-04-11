/**
 * Design tokens — gradients, motion, shadows, radii, icon sizes.
 * Attached to the MUI theme via module augmentation in `augment.d.ts`.
 */

export const gradients = {
  primary: "linear-gradient(135deg, #B45309, #D97706)",
  reversed: "linear-gradient(135deg, #D97706, #B45309)",
} as const;

export const motion = {
  fast: "160ms cubic-bezier(0.3,0.7,0.2,1)",
  standard: "240ms cubic-bezier(0.2,0.8,0.2,1)",
  expressive: "320ms cubic-bezier(0.2,0.8,0.2,1)",
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(44,40,37,0.05)",
  md: "0 1px 3px rgba(44,40,37,0.06), 0 6px 16px rgba(44,40,37,0.04)",
  lg: "0 2px 8px rgba(44,40,37,0.08), 0 16px 40px rgba(44,40,37,0.06)",
  focus: "0 0 0 3px rgba(180,83,9,0.15)",
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
} as const;
