"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { apiFetch } from "@/lib/api";

export function NewsletterSection({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    try {
      await apiFetch("/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  const form = (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${compact ? "" : "sm:flex-row max-w-md mx-auto"}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 rounded-lg border border-forest/10 bg-white px-4 py-2.5 text-sm text-forest placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-forest/20"
        aria-label="Email address"
      />
      <Button type="submit" disabled={status === "loading"} className="uppercase tracking-wider text-xs">
        {status === "loading" ? "..." : "Subscribe"}
      </Button>
    </form>
  );

  if (compact) {
    return (
      <div className="card-soft p-6">
        <p className="section-label mb-1">Newsletter</p>
        <h3 className="font-serif text-lg text-forest mb-2">Stay Glowing, Naturally</h3>
        <p className="text-xs text-muted mb-4 leading-relaxed">
          Subscribe for skincare tips, product updates, exclusive offers, and wellness inspiration.
        </p>
        {form}
        {status === "success" && <p className="mt-3 text-xs text-sage">Welcome to the family!</p>}
        {status === "error" && <p className="mt-3 text-xs text-terracotta">Please try again.</p>}
      </div>
    );
  }

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <FadeIn>
          <h2 className="font-serif text-4xl text-forest">Join the KindSkin Family</h2>
          <p className="mt-4 text-muted">
            Skincare tips, new launches, and exclusive offers — delivered kindly to your inbox.
          </p>
          <div className="mt-8">{form}</div>
          {status === "success" && (
            <p className="mt-4 text-sm text-sage">Welcome to the family! Check your inbox.</p>
          )}
          {status === "error" && (
            <p className="mt-4 text-sm text-terracotta">Something went wrong. Please try again.</p>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
