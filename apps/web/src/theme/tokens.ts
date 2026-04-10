/**
 * Design tokens — gradients, motion, noise, radii.
 * Attached to the MUI theme via module augmentation in `augment.d.ts`.
 */

export const gradients = {
  sunsetAmber: "linear-gradient(135deg, #FF5B2E, #FFC947)",
  amberSunset: "linear-gradient(135deg, #FFC947, #FF5B2E)",
  violetSunset: "linear-gradient(135deg, #7B3FF2, #FF5B2E)",
  mesh: `
    radial-gradient(circle at 15% 20%, rgba(255,91,46,0.25), transparent 35%),
    radial-gradient(circle at 85% 10%, rgba(123,63,242,0.22), transparent 40%),
    radial-gradient(circle at 50% 80%, rgba(255,201,71,0.16), transparent 45%)
  `,
  heroText: "linear-gradient(135deg, #FFF8F0 0%, #FFF8F0 40%, #FFC947 70%, #FF5B2E 100%)",
} as const;

export const motion = {
  fast: "160ms cubic-bezier(0.3,0.7,0.2,1)",
  standard: "240ms cubic-bezier(0.2,0.8,0.2,1)",
  expressive: "320ms cubic-bezier(0.2,0.8,0.2,1)",
} as const;

export const noise = {
  grain: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 14,
  pill: 999,
} as const;
