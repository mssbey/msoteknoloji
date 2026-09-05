// Frontend rol yardımcıları — backend "roles" array'ini kullanır

export type AppRole = 'super_admin' | 'admin' | 'moderator' | 'seller' | 'customer'

export function hasRole(roles: string[] | undefined, ...needed: AppRole[]): boolean {
  if (!roles?.length) return false
  return needed.some((r) => roles.includes(r))
}

export function isAdmin(roles?: string[]) {
  return hasRole(roles, 'super_admin', 'admin')
}

export function isSeller(roles?: string[]) {
  return hasRole(roles, 'seller', 'super_admin', 'admin')
}

export function isCustomer(roles?: string[]) {
  return hasRole(roles, 'customer')
}
