"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Tag,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ToastProvider } from "@/components/admin/Toast";
import { AdminAssistant } from "@/components/admin/AdminAssistant";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/discounts", label: "Discounts", icon: Tag },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-cream-dark">
        <aside className="w-64 shrink-0 bg-forest text-cream flex flex-col relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-sage/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-32 -left-10 h-32 w-32 rounded-full bg-terracotta/10 blur-2xl pointer-events-none" />

          <div className="relative px-5 py-6 border-b border-white/10">
            <Link href="/admin" className="block">
              <Image
                src="/logo-light.png"
                alt="KindSkin Co."
                width={140}
                height={40}
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cream/50 mt-3">
              Admin Console
            </p>
            <p className="text-xs text-cream/70 mt-1 truncate">{email}</p>
          </div>

          <nav className="relative flex-1 px-3 py-5 space-y-1">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = exact
                ? pathname === href
                : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
                    active
                      ? "bg-white/15 text-cream shadow-sm"
                      : "text-cream/75 hover:bg-white/10 hover:text-cream"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="relative border-t border-white/10 p-3 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-cream/70 hover:bg-white/10 hover:text-cream transition-colors"
            >
              <ExternalLink size={18} strokeWidth={1.5} />
              View storefront
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-cream/70 hover:bg-white/10 hover:text-cream transition-colors"
            >
              <LogOut size={18} strokeWidth={1.5} />
              Log out
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="glass border-b border-forest/5 px-8 py-4 flex items-center justify-between">
            <div>
              <p className="section-label">KindSkin Co.</p>
              <h1 className="font-serif text-lg text-forest -mt-0.5">
                Admin Panel
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-sage">
              <span className="h-2 w-2 rounded-full bg-sage animate-pulse" />
              Live
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 overflow-auto admin-page-bg">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>

        <AdminAssistant />
      </div>
    </ToastProvider>
  );
}
