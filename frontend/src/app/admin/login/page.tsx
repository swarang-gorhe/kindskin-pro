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
    <div className="w-full max-w-md bg-cream rounded-2xl shadow-sm border border-cream-dark p-8">
      <h1 className="font-serif text-3xl text-forest mb-2">Admin Login</h1>
      <p className="text-sm text-muted mb-8">
        KindSkin Co. internal access only.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-forest mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-cream-dark bg-white px-4 py-2.5 text-forest focus:outline-none focus:ring-2 focus:ring-sage/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-forest mb-2">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-cream-dark bg-white px-4 py-2.5 text-forest focus:outline-none focus:ring-2 focus:ring-sage/40"
          />
        </div>

        {error && (
          <p className="text-sm text-terracotta bg-terracotta/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-forest text-cream py-3 font-medium hover:bg-forest-light transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
