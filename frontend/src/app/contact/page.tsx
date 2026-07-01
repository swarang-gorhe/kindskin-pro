"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { apiFetch } from "@/lib/api";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn className="text-center mb-16">
          <h1 className="font-serif text-5xl text-forest">Get in Touch</h1>
          <p className="mt-4 text-muted max-w-md mx-auto">
            Questions about our products, ingredients, or orders? We&apos;d love to hear from you.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-16">
          <FadeIn>
            <form onSubmit={handleSubmit} className="space-y-6">
              {(["name", "email"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-forest mb-2 capitalize">
                    {field}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    required
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full rounded-xl border border-forest/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-forest mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border border-forest/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 resize-none"
                />
              </div>
              <Button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Sending..." : "Send Message"}
              </Button>
              {status === "success" && (
                <p className="text-sm text-sage">Message sent! We&apos;ll get back to you soon.</p>
              )}
              {status === "error" && (
                <p className="text-sm text-terracotta">Failed to send. Please try again.</p>
              )}
            </form>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="space-y-8">
              {[
                { icon: Mail, label: "Email", value: "hello@kindskin.co" },
                { icon: Phone, label: "Phone", value: "+91 98765 43210" },
                { icon: MapPin, label: "Address", value: "Jaipur, Rajasthan, India" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-dark">
                    <Icon className="h-5 w-5 text-forest" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-forest">{label}</p>
                    <p className="text-sm text-muted mt-1">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
