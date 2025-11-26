export const normalizeUser = (backendUser) => {
  if (!backendUser) return null

  return {
    // Prefer camelCase fields from current backend, fall back to legacy snake_case if present
    userId: backendUser.userId ?? backendUser.user_id,
    firstName: backendUser.firstName ?? backendUser.first_name,
    lastName: backendUser.lastName ?? backendUser.last_name,
    email: backendUser.email,
    role: backendUser.role,
  }
}

/**
 * Get user initials from name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} User initials
 */
export function getUserInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last
}
