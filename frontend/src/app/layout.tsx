import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { SiteChrome } from "@/components/layout/SiteChrome";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kindskin-pro.vercel.app"),
  title: {
    default: "KindSkin Co. — The Kind Way To Glow.",
    template: "%s | KindSkin Co.",
  },
  description:
    "Natural, Ayurvedic skincare crafted with love. Aloe Vera Gel, Lip Balm, and Abhyang Tel — pure ingredients, honest formulations.",
  openGraph: {
    title: "KindSkin Co. — The Kind Way To Glow.",
    description: "Natural, Ayurvedic skincare crafted with love.",
    type: "website",
    locale: "en_IN",
    siteName: "KindSkin Co.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
