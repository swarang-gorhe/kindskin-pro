/** Read Supabase service role key from Vercel/server env (supports common aliases). */
export function resolveServiceKey(): string | null {
  const raw =
    process.env.SUPABASE_SERVICE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!raw) return null;

  const cleaned = raw.trim().replace(/^["']|["']$/g, "");
  return cleaned.length > 0 ? cleaned : null;
}

export function isServiceKeyConfigured(): boolean {
  return resolveServiceKey() !== null;
}
