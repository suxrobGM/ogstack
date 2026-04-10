/**
 * Design tokens — gradients, motion, noise, radii.
 * Attached to the MUI theme via module augmentation in `augment.d.ts`.
 */

export const gradients = {
  sunsetAmber: "linear-gradient(135deg, #10b981, #22d3ee)",
  amberSunset: "linear-gradient(135deg, #22d3ee, #10b981)",
  violetSunset: "linear-gradient(135deg, #34d399, #10b981)",
  mesh: `
    radial-gradient(ellipse at 30% 0%, rgba(16,185,129,0.18), transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(34,211,238,0.12), transparent 45%),
    radial-gradient(ellipse at 50% 100%, rgba(52,211,153,0.06), transparent 50%)
  `,
  heroText: "linear-gradient(135deg, #fafafa 0%, #fafafa 30%, #34d399 60%, #22d3ee 100%)",
} as const;

export const motion = {
  fast: "160ms cubic-bezier(0.3,0.7,0.2,1)",
  standard: "240ms cubic-bezier(0.2,0.8,0.2,1)",
  expressive: "320ms cubic-bezier(0.2,0.8,0.2,1)",
} as const;

export const noise = {
  grain: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  dots: `url("data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M32 0H0v32' fill='none' stroke='rgba(250,250,250,0.04)' stroke-width='0.5'/%3E%3C/svg%3E")`,
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 14,
  pill: 999,
} as const;
