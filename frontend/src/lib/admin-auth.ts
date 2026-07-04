/** Resolve admin role from Supabase user + optional profiles row. */
export function isAdminUser(
  user: { app_metadata?: Record<string, unknown> } | null | undefined,
  profile: { role?: string } | null | undefined
): boolean {
  const metaRole = user?.app_metadata?.role;
  if (metaRole === "admin") return true;
  return profile?.role === "admin";
}
