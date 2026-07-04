"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { isAdminUser } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !data.user) {
        setError(signInError?.message || "Invalid email or password.");
        return;
      }

      // Refresh session so app_metadata (admin role) is current
      await supabase.auth.refreshSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (isAdminUser(user, null)) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const profilesMissing = profileError?.code === "PGRST205";

      if (profileError && !profilesMissing) {
        await supabase.auth.signOut();
        setError(`Profile error: ${profileError.message}`);
        return;
      }

      if (!isAdminUser(data.user, profile)) {
        await supabase.auth.signOut();
        setError("This account does not have admin access.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected login error.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md card-soft p-8">
      <p className="section-label mb-2">KindSkin Co.</p>
      <h1 className="font-serif text-3xl text-forest mb-2">Admin Login</h1>
      <p className="text-sm text-muted mb-8">
        Internal access only.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
          />
        </div>

        {error && (
          <p className="text-sm text-terracotta bg-terracotta/10 rounded-xl px-3 py-2 border border-terracotta/15">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-forest text-cream py-3 font-medium hover:bg-forest-light transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
