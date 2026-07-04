"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ShoppingBag, Search, User, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products", dropdown: true },
  { href: "/learn", label: "Skincare Tips" },
  { href: "/learn", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  return (
    <header className="sticky top-0 z-50 glass border-b border-forest/5">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3.5">
        <Logo priority className="justify-self-start" />

        <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "flex items-center gap-1 text-[13px] font-medium tracking-tight transition-colors hover:text-forest",
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  ? "text-forest"
                  : "text-muted"
              )}
            >
              {link.label}
              {link.dropdown && <ChevronDown className="h-3.5 w-3.5 opacity-50" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <button
            className="hidden sm:flex p-2.5 text-forest/70 hover:text-forest transition-colors rounded-full hover:bg-forest/5"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            className="hidden sm:flex p-2.5 text-forest/70 hover:text-forest transition-colors rounded-full hover:bg-forest/5"
            aria-label="Account"
          >
            <User className="h-4 w-4" />
          </button>
          <Link
            href="/cart"
            className="relative p-2.5 text-forest hover:text-forest transition-colors rounded-full hover:bg-forest/5"
            aria-label={`Cart, ${itemCount} items`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-forest text-[9px] font-bold text-cream">
              {itemCount}
            </span>
          </Link>
          <button
            className="lg:hidden p-2.5 text-forest"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-forest/5 bg-cream px-6 py-4" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "text-base font-medium py-3 px-2 rounded-lg",
                  pathname === link.href ? "text-forest bg-forest/5" : "text-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
