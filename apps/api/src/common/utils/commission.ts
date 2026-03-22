/**
 * Calculate net amount after applying commission percentage.
 *
 * @param grossAmount - The total amount before commission.
 * @param commissionRate - The commission rate as a percentage.
 * @returns The net amount after commission is applied.
 */
export function calculateNetAmount(grossAmount: number, commissionRate: number): number {
  const commission = grossAmount * (commissionRate / 100);
  return Math.round((grossAmount - commission) * 100) / 100;
}

/**
 * Calculate commission amount from gross and rate.
 *
 * @param grossAmount - The total amount before commission.
 * @param commissionRate - The commission rate as a percentage.
 * @returns The commission amount.
 */
export function calculateCommission(grossAmount: number, commissionRate: number): number {
  return Math.round(grossAmount * (commissionRate / 100) * 100) / 100;
}

/**
 * Calculate hours worked from time strings (HH:MM format).
 *
 * @param startTime - The start time in HH:MM format.
 * @param endTime - The end time in HH:MM format.
 * @returns The number of hours worked.
 */
export function calculateHoursWorked(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startMinutes = startH! * 60 + startM!;
  const endMinutes = endH! * 60 + endM!;
  const diff = endMinutes - startMinutes;

  return Math.round((diff / 60) * 100) / 100;
}
