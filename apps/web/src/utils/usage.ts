export function getProgressColor(percent: number): "success" | "warning" | "error" {
  if (percent >= 90) return "error";
  if (percent >= 70) return "warning";
  return "success";
}
