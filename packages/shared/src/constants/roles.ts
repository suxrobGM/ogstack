export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ADMIN_ROLES: readonly UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export function isAdminRole(role: string | null | undefined): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}
