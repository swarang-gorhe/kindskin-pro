"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ToastProvider } from "@/components/admin/Toast";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
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
        <aside className="w-60 shrink-0 bg-forest text-cream flex flex-col">
          <div className="px-5 py-6 border-b border-white/10">
            <p className="font-serif text-lg">KindSkin Admin</p>
            <p className="text-xs text-cream/70 mt-1 truncate">{email}</p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = exact
                ? pathname === href
                : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-white/15 text-cream"
                      : "text-cream/80 hover:bg-white/10 hover:text-cream"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-4 text-sm text-cream/80 hover:text-cream border-t border-white/10"
          >
            <LogOut size={18} />
            Log out
          </button>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-cream border-b border-cream-dark px-8 py-4">
            <h1 className="text-sm font-medium text-muted uppercase tracking-wide">
              KindSkin Co. — Admin
            </h1>
          </header>
          <main className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
