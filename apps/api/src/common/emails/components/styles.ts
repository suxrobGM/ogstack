import type { CSSProperties } from "react";

export const brand = {
  primary: "#B45309",
  primaryDark: "#92400E",
  primaryLight: "#FDEBD3",
  background: "#F7F3ED",
  surface: "#FFFDF9",
  surfaceMuted: "#EDE8DF",
  text: "#2C2825",
  textSecondary: "#8C8378",
  border: "#D5CEC3",
  success: "#15803D",
  successLight: "#ECFDF5",
  warning: "#CA8A04",
  warningLight: "#FEF3C7",
  error: "#DC2626",
  errorLight: "#FEF2F2",
} as const;

export const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const styles = {
  body: {
    backgroundColor: brand.background,
    fontFamily,
    margin: "0",
    padding: "0",
  } satisfies CSSProperties,

  container: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: brand.surface,
    borderRadius: "12px",
    overflow: "hidden" as const,
    border: `1px solid ${brand.border}`,
  } satisfies CSSProperties,

  headerBanner: {
    backgroundColor: brand.primary,
    padding: "28px 40px",
  } satisfies CSSProperties,

  brandName: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#FFFFFF",
    margin: "0",
    letterSpacing: "-0.3px",
  } satisfies CSSProperties,

  content: {
    padding: "32px 40px",
  } satisfies CSSProperties,

  heading: {
    fontSize: "22px",
    fontWeight: 700,
    color: brand.text,
    lineHeight: "30px",
    margin: "0 0 8px",
  } satisfies CSSProperties,

  paragraph: {
    fontSize: "15px",
    lineHeight: "26px",
    color: brand.text,
    margin: "0 0 20px",
  } satisfies CSSProperties,

  mutedText: {
    fontSize: "14px",
    color: brand.textSecondary,
    lineHeight: "22px",
    margin: "0 0 16px",
  } satisfies CSSProperties,

  button: {
    backgroundColor: brand.primary,
    color: "#FFFFFF",
    padding: "14px 32px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "15px",
    textDecoration: "none",
    display: "inline-block" as const,
    textAlign: "center" as const,
  } satisfies CSSProperties,

  card: {
    backgroundColor: brand.surfaceMuted,
    border: `1px solid ${brand.border}`,
    borderRadius: "10px",
    padding: "20px 24px",
    margin: "24px 0",
  } satisfies CSSProperties,

  infoBox: {
    backgroundColor: brand.primaryLight,
    borderLeft: `4px solid ${brand.primary}`,
    padding: "16px 20px",
    borderRadius: "0 8px 8px 0",
    margin: "24px 0",
  } satisfies CSSProperties,

  detailTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
  } satisfies CSSProperties,

  detailRow: {
    fontSize: "14px",
    lineHeight: "20px",
    color: brand.text,
    margin: "0",
  } satisfies CSSProperties,

  detailLabel: {
    fontWeight: 600,
    color: brand.textSecondary,
    fontSize: "13px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  } satisfies CSSProperties,

  detailValue: {
    fontWeight: 500,
    color: brand.text,
  } satisfies CSSProperties,

  statusBadge: {
    display: "inline-block" as const,
    fontSize: "13px",
    fontWeight: 600,
    padding: "5px 14px",
    borderRadius: "20px",
    letterSpacing: "0.3px",
  } satisfies CSSProperties,

  hr: {
    borderColor: brand.border,
    borderTop: "none",
    margin: "0",
  } satisfies CSSProperties,

  footerSection: {
    padding: "24px 40px 32px",
    backgroundColor: brand.surfaceMuted,
  } satisfies CSSProperties,

  footer: {
    fontSize: "13px",
    color: brand.textSecondary,
    textAlign: "center" as const,
    lineHeight: "20px",
    margin: "0",
  } satisfies CSSProperties,

  skillBadge: {
    display: "inline-block" as const,
    backgroundColor: brand.primaryLight,
    color: brand.primary,
    fontSize: "13px",
    fontWeight: 600,
    padding: "5px 14px",
    borderRadius: "20px",
    margin: "3px 4px 3px 0",
  } satisfies CSSProperties,
} as const;
