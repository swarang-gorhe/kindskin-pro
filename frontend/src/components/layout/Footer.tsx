import Link from "next/link";
import { Logo } from "./Logo";

const footerLinks = {
  "About Us": [
    { href: "/about", label: "Our Story" },
    { href: "/products", label: "Products" },
    { href: "/learn", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
  Policies: [
    { href: "/orders/track", label: "Track Order" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-16 border-t border-forest/5 bg-cream-dark/50">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">
              Natural, Ayurvedic skincare crafted with love. The kind way to glow.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="section-label mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-forest transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="section-label mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>+91 98765 43210</li>
              <li>
                <a href="mailto:hello@kindskinco.com" className="hover:text-forest transition-colors">
                  hello@kindskinco.com
                </a>
              </li>
              <li className="leading-relaxed">Nashik, Maharashtra, India</li>
            </ul>
            <div className="mt-5 flex gap-4">
              {["Instagram", "Facebook", "YouTube"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-forest transition-colors"
                  aria-label={social}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-forest py-4">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-cream/60">
            &copy; {new Date().getFullYear()} KindSkin Co. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
