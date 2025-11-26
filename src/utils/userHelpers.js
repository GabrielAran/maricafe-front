export const normalizeUser = (backendUser) => {
  if (!backendUser) return null

  return {
    userId: backendUser.user_id,
    firstName: backendUser.first_name,
    lastName: backendUser.last_name,
    email: backendUser.email,
    role: backendUser.role,
  }
}
